// GAKORI — Edge Function "report-link-mismatch"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// Obsługuje przycisk "Zgłoś niezgodność z treścią źródła" (patrz
// index.html/scan.html) — punkt 5 audytu bezpieczeństwa, "Zaufanie do
// ręcznie wklejonych linków". Pełne uzasadnienie architektury (co
// odrzuciliśmy po drodze i dlaczego — kary, próg "2 niezależnych
// zgłoszeń" z porównaniem przez Gemini) — patrz GAKORI_CONTEXT.md.
//
// ŚWIADOMIE bez żadnych kar: zgłoszenie po prostu cofa dotychczasowe
// "ciche potwierdzenia" zebrane dla tej treści (patrz `analyze/index.ts`,
// `logQuietConfirmation()`) — treść musi na nowo zbudować zaufanie w
// czasie. Nie musimy wiedzieć, kto ma rację, żeby to zadziałało.
//
// Wymaga zalogowania (JWT z nagłówka Authorization) — inaczej zgłoszenie
// nie miałoby do czego przypisać ograniczenia "raz na osobę na wynik"
// (UNIQUE (scan_id, reporter_user_id) w bazie).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : ''
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const scanId = typeof body?.scan_id === 'string' ? body.scan_id : null
    if (!scanId) {
      return new Response(JSON.stringify({ error: 'invalid_request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Zgłoszenie ma sens WYŁĄCZNIE dla treści oznaczonej jako pochodząca z
    // ręcznego wklejenia — patrz `scans.is_manual_source`.
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('id, is_manual_source')
      .eq('id', scanId)
      .maybeSingle()
    if (scanError || !scan || !scan.is_manual_source) {
      return new Response(JSON.stringify({ error: 'not_reportable' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // UNIQUE (scan_id, reporter_user_id) w bazie — jedno konto może
    // zgłosić dany wynik tylko raz. Drugie zgłoszenie tej samej osoby po
    // prostu nic nowego nie zmienia (traktujemy je jako sukces, nie błąd).
    const { error: insertError } = await supabase
      .from('link_mismatch_reports')
      .insert({ scan_id: scanId, reporter_user_id: user.id })

    if (!insertError) {
      // Nowe zgłoszenie — cofamy dotychczasowe ciche potwierdzenia, treść
      // musi na nowo zbudować zaufanie.
      await supabase.from('link_view_confirmations').delete().eq('scan_id', scanId)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
