// PRAGMA — Edge Function "translate-scan"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
// Po wdrożeniu dostępna pod: https://<PROJECT_ID>.supabase.co/functions/v1/translate-scan
//
// Tania alternatywa dla pełnej analizy: gdy dana treść była już przeanalizowana
// w INNYM języku, tłumaczymy gotowy wynik zamiast płacić za analizę od zera.
// Używane przez przeglądarkę publicznych analiz (index.html), żeby "dopełnić"
// listę w językach, w których dana treść nie została jeszcze wprost zgłoszona
// do analizy. ZAWSZE darmowe dla wywołującego — koszt operacyjny ponosi
// właściciel aplikacji (Gemini API), to nie jest tryb rozliczany w kredytach.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Musi się zgadzać z LANGUAGE_NAMES w supabase/functions/analyze/index.ts.
const LANGUAGE_NAMES: Record<string, string> = {
  pl: 'polskim',
  en: 'angielskim',
  es: 'hiszpańskim',
  de: 'niemieckim',
  fr: 'francuskim',
  ru: 'rosyjskim',
  zh: 'chińskim (uproszczonym)',
  ja: 'japońskim',
  hi: 'hindi',
  ar: 'arabskim',
}
const DEFAULT_LANGUAGE = 'en'

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    q_score: { type: 'integer' },
    patterns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quote: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['name', 'quote', 'explanation'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['q_score', 'patterns', 'summary'],
}

// Tłumaczy GOTOWY wynik analizy na inny język — nie analizuje treści od nowa.
// "quote" i "q_score" mają zostać dokładnie takie same jak w oryginale.
async function translateResult(
  result: Record<string, unknown>,
  targetLangCode: string,
  geminiKey: string
): Promise<Record<string, unknown> | null> {
  const langName = LANGUAGE_NAMES[targetLangCode] || LANGUAGE_NAMES[DEFAULT_LANGUAGE]
  const prompt = `Przetłumacz poniższy JSON na język ${langName}. Zasady:
- Przetłumacz WYŁĄCZNIE pola "name", "explanation" i "summary" — prostym, codziennym językiem, bez żargonu, bez akademickiego stylu.
- Pole "quote" NIE tłumacz — zostaje dokładnie w oryginalnym brzmieniu, bez żadnych zmian.
- Pole "q_score" zostaje dokładnie taką samą liczbą jak w oryginale.
- Zachowaj dokładnie tę samą strukturę JSON i tę samą liczbę elementów w "patterns".
- Zwróć WYŁĄCZNIE poprawny JSON, bez żadnego dodatkowego tekstu i bez komentarzy.

JSON do przetłumaczenia:
${JSON.stringify(result)}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { content_hash, language } = body
    const targetLanguage = typeof language === 'string' && LANGUAGE_NAMES[language] ? language : DEFAULT_LANGUAGE

    if (!content_hash) {
      return new Response(
        JSON.stringify({ error: 'missing_content_hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Może już istnieje dokładnie ta wersja językowa (ktoś inny właśnie ją
    // dotłumaczył chwilę wcześniej) — wtedy po prostu ją zwracamy.
    const { data: existing } = await supabase
      .from('scans')
      .select('id, input_type, source_url, result, created_at')
      .eq('content_hash', content_hash)
      .eq('language', targetLanguage)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ cached: true, cost: 0, scan: existing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Znajdź prawdziwy oryginał (is_translation = false) do przetłumaczenia —
    // nigdy nie tłumaczymy z innego tłumaczenia, żeby jakość nie spadała z
    // każdym kolejnym językiem.
    const { data: candidates } = await supabase
      .from('scans')
      .select('*')
      .eq('content_hash', content_hash)
      .eq('is_translation', false)
      .limit(5)
    const original = (candidates || []).find(
      (row: Record<string, unknown>) => Array.isArray((row.result as { patterns?: unknown })?.patterns)
    )

    if (!original) {
      return new Response(
        JSON.stringify({ error: 'no_source' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const translated = await translateResult(original.result as Record<string, unknown>, targetLanguage, geminiKey!)
    if (!translated) {
      return new Response(
        JSON.stringify({ error: 'translation_failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Zapisz przetłumaczony wynik jako nowy, darmowy wpis w cache'u — kolejne
    // osoby przeglądające w tym samym języku dostaną go od razu, bez czekania.
    const { data: newScan, error: insertError } = await supabase
      .from('scans')
      .insert({
        content_hash,
        input_type: original.input_type,
        language: targetLanguage,
        is_translation: true,
        source_url: original.source_url,
        char_count: original.char_count,
        credits_charged: 0,
        result: translated,
        discovered_by: null,
        view_count: 1,
      })
      .select('id, input_type, source_url, result, created_at')
      .single()

    if (insertError || !newScan) {
      return new Response(
        JSON.stringify({ error: 'save_failed', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ cached: false, cost: 0, scan: newScan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
