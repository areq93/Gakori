// GAKORI — Edge Function "weekly-model-report"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// POPRAWKA 2026-08-26(s) — właściciel zapytał o "automatykę" budującą
// bibliotekę modeli mentalnych z realnych przykładów. Pełna automatyzacja
// (system sam decydujący, co jest dobrym przykładem) była świadomie
// odrzucona — samo to, że model często przypisuje coś do "modelu X" nie
// znaczy, że robi to POPRAWNIE; bez człowieka "pośrodku" moglibyśmy tylko
// utrwalić systematyczny błąd, nie go naprawić. Ta funkcja to bezpieczniejszy,
// PÓŁ-automatyczny wariant: raz w tygodniu wysyła mailem (po polsku, na
// REPORT_RECIPIENT_EMAIL — TA SAMA zmienna co daily-report) listę
// najczęstszych, realnych cytatów przypisanych w ostatnim tygodniu do
// każdego modelu mentalnego — właściciel (razem z Claude) ręcznie ocenia,
// które są dobrymi przykładami, i DOPIERO wtedy dopisuje je do
// MENTAL_MODELS_BY_CATEGORY w analyze/index.ts. Żadnego automatycznego
// zapisu do kodu — to świadomie pozostaje ręczny, ostatni krok.
//
// Świadomie TYLKO analizy w języku polskim (`language = 'pl'`) i TYLKO
// oryginalne (`is_translation = false`) — bo:
// 1) biblioteka modeli w kodzie ma nazwy PO POLSKU, więc tylko polskie
//    "name" da się bezpośrednio dopasować do klucza w bibliotece bez
//    zgadywania tłumaczenia z powrotem;
// 2) pole "quote" NIGDY nie jest tłumaczone (patrz i18n.js, komentarz na
//    górze pliku) — w wynikach będących tłumaczeniem na polski "name" jest
//    już po polsku, ale "quote" wciąż w oryginalnym języku źródła, co
//    byłoby mylące w polskojęzycznym raporcie.
// Realne ograniczenie: analizy zrobione w innych językach w ogóle nie są
// tu uwzględnione — świadomie zaakceptowane jako uproszczenie na start
// (większość testowania i tak dzieje się po polsku).
//
// Uruchamiana z zewnątrz przez Supabase pg_cron (ten sam mechanizm co
// daily-report — patrz GAKORI_CONTEXT.md, sekcja "Funkcja daily-report",
// po dokładną instrukcję SQL). Ma WYŁĄCZONĄ weryfikację JWT (Edge
// Functions → weekly-model-report → Settings → "Verify JWT with legacy
// secret" → OFF) i sama sprawdza sekret w nagłówku `x-cron-secret` —
// REUŻYWA istniejącego sekretu CRON_REPORT_SECRET (ten sam, co daily-report
// już ma skonfigurowany), żeby nie mnożyć sekretów bez potrzeby.
//
// Wymagane sekrety (te same, co daily-report już ma):
// - CRON_REPORT_SECRET, REPORT_RECIPIENT_EMAIL,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SITE_URL = 'https://gakori.app'
// Ile przykładowych, różnych cytatów pokazujemy na model — więcej byłoby
// nieczytelne w mailu, a celem nie jest "wszystko", tylko wystarczająco,
// żeby ocenić, czy model działa spójnie.
const MAX_QUOTES_PER_MODEL = 3
// Twardy sufit liczby modeli w jednym raporcie — czysto defensywne, żeby
// pojedynczy nietypowy tydzień (np. bardzo długi PDF z dziesiątkami
// wzorców) nie wygenerował absurdalnie długiego maila.
const MAX_MODELS_IN_REPORT = 60

// Nigdy nie ufamy treści cytatów jako "bezpiecznej do wstawienia w HTML" —
// to fragmenty stron internetowych wybrane przez AI, czyli świadomie
// traktujemy je jak dowolną, niezaufaną treść z zewnątrz (ten sam powód,
// dla którego index.html/scan.html wstawiają wyniki przez innerText, nie
// innerHTML).
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function since(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

Deno.serve(async (req: Request) => {
  const expectedSecret = Deno.env.get('CRON_REPORT_SECRET')
  const gotSecret = req.headers.get('x-cron-secret')
  if (!expectedSecret || gotSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  type PatternRow = { name?: unknown; quote?: unknown }
  type ModelGroup = { count: number; quotes: Map<string, string> } // quote text -> scan id (pierwsze znalezione)

  const byModel = new Map<string, ModelGroup>()
  let scansScanned = 0

  try {
    const { data, error } = await supabase
      .from('scans')
      .select('id, result')
      .eq('language', 'pl')
      .eq('is_translation', false)
      .gte('created_at', since(7))
    if (error) throw error

    for (const row of (data || []) as { id: string; result: Record<string, unknown> | null }[]) {
      const patterns = row.result?.patterns
      if (!Array.isArray(patterns)) continue
      scansScanned++
      for (const p of patterns as PatternRow[]) {
        const name = typeof p.name === 'string' ? p.name.trim() : ''
        const quote = typeof p.quote === 'string' ? p.quote.trim() : ''
        if (!name || !quote) continue
        let group = byModel.get(name)
        if (!group) {
          group = { count: 0, quotes: new Map() }
          byModel.set(name, group)
        }
        group.count++
        // Map dedupe'uje dokładne powtórzenia tego samego cytatu — trzymamy
        // TYLKO pierwszy napotkany scan_id dla danego cytatu (do linku).
        if (!group.quotes.has(quote)) {
          group.quotes.set(quote, row.id)
        }
      }
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'query_failed', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const dateStr = new Date().toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })

  if (byModel.size === 0) {
    const htmlContent = `<p style="font-size:16px;color:#111827;">Hej! Cotygodniowy przegląd modeli mentalnych — ${dateStr}.</p>
<p style="color:#374151;">W ostatnich 7 dniach nie było żadnych nowych, oryginalnych analiz po polsku — nie ma czego przeglądać w tym tygodniu.</p>
<p style="color:#9ca3af;font-size:12px;margin-top:20px;">Ten raport wysyła się automatycznie raz w tygodniu. Wygenerowała go funkcja weekly-model-report.</p>`
    const sent = await sendReportEmail(htmlContent, dateStr)
    return sent
  }

  // Sortujemy malejąco wg liczby wystąpień — najpierw modele, które
  // pojawiały się najczęściej (najwięcej realnych danych do oceny).
  const sortedModels = [...byModel.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, MAX_MODELS_IN_REPORT)

  const modelSections = sortedModels
    .map(([name, group]) => {
      const quoteItems = [...group.quotes.entries()].slice(0, MAX_QUOTES_PER_MODEL)
      const quotesHtml = quoteItems
        .map(([quote, scanId]) => {
          const short = quote.length > 220 ? quote.slice(0, 220) + '…' : quote
          const url = `${SITE_URL}/scan.html?id=${encodeURIComponent(scanId)}`
          return `<li style="margin-bottom:6px;"><span style="color:#374151;">„${escapeHtml(short)}"</span> — <a href="${escapeHtml(url)}" style="color:#2563eb;">zobacz analizę</a></li>`
        })
        .join('')
      return `<div style="margin-bottom:16px;">
  <div style="font-weight:700;color:#111827;">${escapeHtml(name)} <span style="font-weight:400;color:#6b7280;font-size:13px;">(${group.count}× w tym tygodniu)</span></div>
  <ul style="margin:6px 0 0;padding-left:20px;">${quotesHtml}</ul>
</div>`
    })
    .join('')

  const htmlContent = `<p style="font-size:16px;color:#111827;">Hej! Cotygodniowy przegląd modeli mentalnych — ${dateStr}.</p>
<p style="color:#374151;">Poniżej realne cytaty, które w ostatnich 7 dniach zostały przypisane do poszczególnych modeli mentalnych (tylko oryginalne, polskie analizy — ${scansScanned} przeanalizowanych wyników). Przejrzyjcie razem z Claude, które przykłady dobrze pokazują dany model w praktyce — dopiero po Waszej wspólnej ocenie warto je dopisać do biblioteki w kodzie (<code>MENTAL_MODELS_BY_CATEGORY</code>). To NIE dzieje się automatycznie — ten mail to tylko materiał do wspólnego przeglądu.</p>
${modelSections}
<p style="color:#9ca3af;font-size:12px;margin-top:20px;">Ten raport wysyła się automatycznie raz w tygodniu. Wygenerowała go funkcja weekly-model-report.</p>`

  return await sendReportEmail(htmlContent, dateStr)
})

async function sendReportEmail(htmlContent: string, dateStr: string): Promise<Response> {
  const brevoKey = Deno.env.get('BREVO_API_KEY')
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
  const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'Gakori — raport'
  const recipient = Deno.env.get('REPORT_RECIPIENT_EMAIL')

  if (!brevoKey || !senderEmail || !recipient) {
    return new Response(JSON.stringify({ error: 'not_configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': brevoKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: recipient }],
      subject: `Gakori — cotygodniowy przegląd modeli mentalnych (${dateStr})`,
      htmlContent,
    }),
  })

  if (!brevoRes.ok) {
    const details = await brevoRes.text()
    return new Response(JSON.stringify({ error: 'brevo_error', details }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
