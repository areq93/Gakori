// GAKORI — Edge Function "daily-report"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// Wysyła RAZ DZIENNIE (wywoływana z zewnątrz przez Supabase pg_cron, patrz
// GAKORI_CONTEXT.md — sekcja "Funkcja daily-report") krótki, koleżeński
// mail z najważniejszymi statystykami rozwoju MVP — TYLKO na adres
// właściciela projektu (REPORT_RECIPIENT_EMAIL), nie do zwykłych
// użytkowników.
//
// Ta funkcja NIE jest wywoływana przez przeglądarkę ani przez Supabase
// Auth — dlatego, tak jak send-auth-email, ma WYŁĄCZONĄ weryfikację JWT
// (Edge Functions → daily-report → Settings → "Verify JWT with legacy
// secret" → OFF), a zamiast tego sama sprawdza własny sekret w nagłówku
// `x-cron-secret`, żeby nikt obcy nie mógł jej wywoływać.
//
// KAŻDA metryka jest liczona OSOBNO i opakowana w try/catch — jeśli jedna
// się nie uda, reszta raportu i tak dojdzie, a ta jedna pozycja pokaże
// "brak danych" zamiast wywalić całą funkcję.
//
// Wymagane sekrety (Dashboard → Edge Functions → Manage secrets):
// - CRON_REPORT_SECRET, REPORT_RECIPIENT_EMAIL,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
//
// Świadomie NIE ma tu (na razie): statystyk cashflow/kupionych pakietów
// (system płatności jeszcze nie istnieje) ani liczby zgłoszonych błędów
// (system zgłaszania błędów przez użytkowników jeszcze nie istnieje) —
// gdy oba powstaną, dopisać je tutaj. Patrz GAKORI_CONTEXT.md.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const LANGUAGES: { code: string; name: string }[] = [
  { code: 'pl', name: 'polski' },
  { code: 'en', name: 'angielski' },
  { code: 'es', name: 'hiszpański' },
  { code: 'de', name: 'niemiecki' },
  { code: 'fr', name: 'francuski' },
  { code: 'ru', name: 'rosyjski' },
  { code: 'zh', name: 'chiński' },
  { code: 'ja', name: 'japoński' },
  { code: 'hi', name: 'hindi' },
  { code: 'ar', name: 'arabski' },
]

function since(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function dayKey(iso: string): string {
  return iso.slice(0, 10) // YYYY-MM-DD (UTC)
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
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

  // --- Rejestracje: dziś, średnia z ostatnich 7 dni (do wykrywania nietypowych skoków) ---
  let newToday: number | null = null
  let avg7d: number | null = null
  let burstWarning = false
  try {
    const allUsers: { created_at: string }[] = []
    let page = 1
    const perPage = 1000
    while (page <= 20) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) throw error
      allUsers.push(...data.users.map((u: { created_at: string }) => ({ created_at: u.created_at })))
      if (data.users.length < perPage) break
      page++
    }

    const todayKey = dayKey(new Date().toISOString())
    newToday = allUsers.filter((u) => dayKey(u.created_at) === todayKey).length

    const perDay: Record<string, number> = {}
    for (const u of allUsers) {
      const k = dayKey(u.created_at)
      if (k === todayKey) continue
      perDay[k] = (perDay[k] || 0) + 1
    }
    const last7Keys: string[] = []
    for (let i = 1; i <= 7; i++) {
      last7Keys.push(dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()))
    }
    avg7d = avg(last7Keys.map((k) => perDay[k] || 0))
    if (avg7d !== null && newToday !== null && newToday > Math.max(5, avg7d * 3)) {
      burstWarning = true
    }
  } catch (_err) {
    // metryka rejestracji niedostępna — reszta raportu leci dalej
  }

  // --- Analizy (scans) dziś: rozbicie zalogowani/anonimowi, nowe/tłumaczenia ---
  let scansToday: number | null = null
  let loggedScans: number | null = null
  let anonScans: number | null = null
  let newAnalyses: number | null = null
  let translations: number | null = null
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('discovered_by, is_translation')
      .gte('created_at', since(24))
    if (error) throw error
    const rows = data as { discovered_by: string | null; is_translation: boolean }[]
    scansToday = rows.length
    loggedScans = rows.filter((r) => r.discovered_by).length
    anonScans = scansToday - loggedScans
    translations = rows.filter((r) => r.is_translation).length
    newAnalyses = scansToday - translations
  } catch (_err) {
    // metryki dzisiejszych analiz niedostępne — reszta raportu leci dalej
  }

  // --- Najpopularniejsze analizy (top 5 wg wyświetleń) w każdym języku, w którym coś jest ---
  const SITE_URL = 'https://areq93.github.io/Gakori'
  const topByLanguage: { langName: string; items: { label: string; views: number; url: string }[] }[] = []
  try {
    for (const lang of LANGUAGES) {
      const { data, error } = await supabase
        .from('scans')
        .select('id, view_count, result, source_url')
        .eq('language', lang.code)
        .order('view_count', { ascending: false })
        .limit(5)
      if (error) throw error
      if (!data || data.length === 0) continue
      const items = (data as any[]).map((r) => ({
        label: String(r.result?.summary || r.source_url || 'analiza bez podsumowania').slice(0, 110),
        views: r.view_count ?? 0,
        url: `${SITE_URL}/scan.html?id=${encodeURIComponent(r.id)}`,
      }))
      topByLanguage.push({ langName: lang.name, items })
    }
  } catch (_err) {
    // ranking popularności niedostępny — reszta raportu leci dalej
  }

  // --- Kredyty wydane dziś ---
  let creditsSpentToday: number | null = null
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('type', 'spend')
      .gte('created_at', since(24))
    if (error) throw error
    creditsSpentToday = data.reduce((sum: number, r: any) => sum + Math.abs(r.amount || 0), 0)
  } catch (_err) {
    // metryka kredytów niedostępna
  }

  // --- Maile: dziś i suma od początku miesiąca (wg statystyk Brevo) ---
  let emailsSentToday: number | null = null
  let emailsSentThisMonth: number | null = null
  const brevoKey = Deno.env.get('BREVO_API_KEY')
  try {
    if (brevoKey) {
      const res = await fetch('https://api.brevo.com/v3/smtp/statistics/aggregatedReport?days=1', {
        headers: { accept: 'application/json', 'api-key': brevoKey },
      })
      if (res.ok) {
        const json = await res.json()
        if (typeof json.requests === 'number') emailsSentToday = json.requests
      }
    }
  } catch (_err) {
    // statystyki dzienne Brevo niedostępne
  }
  try {
    if (brevoKey) {
      const now = new Date()
      const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
      const todayStr = now.toISOString().slice(0, 10)
      const res = await fetch(
        `https://api.brevo.com/v3/smtp/statistics/aggregatedReport?startDate=${monthStart}&endDate=${todayStr}`,
        { headers: { accept: 'application/json', 'api-key': brevoKey } }
      )
      if (res.ok) {
        const json = await res.json()
        if (typeof json.requests === 'number') emailsSentThisMonth = json.requests
      }
    }
  } catch (_err) {
    // statystyki miesięczne Brevo niedostępne
  }

  // --- Budowanie treści maila ---
  const fmt = (v: number | null, unit = '') => (v === null ? 'brak danych' : `${Math.round(v * 10) / 10}${unit}`)
  const dateStr = new Date().toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })

  const card = (label: string, bodyHtml: string) => `
<div style="background:#f4f4f5;border-radius:12px;padding:16px 20px;margin-bottom:14px;">
  <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;font-weight:600;margin-bottom:8px;">${label}</div>
  ${bodyHtml}
</div>`

  const burstHtml = burstWarning
    ? `<p style="color:#b91c1c;font-weight:600;margin:8px 0 0;">Hej, uwaga — dzisiaj zarejestrowało się wyraźnie więcej osób niż zwykle (średnio ostatnio: ${fmt(avg7d)}/dzień). Warto rzucić okiem na listę kont w Supabase (Authentication → Users), czy to na pewno prawdziwi ludzie.</p>`
    : ''

  const registrationsCard = card(
    'Rejestracje',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(newToday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">nowych kont dziś (średnio ostatnio: ${fmt(avg7d)}/dzień)</span></div>${burstHtml}`
  )

  const scansCard = card(
    'Analizy tekstu',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(scansToday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">dziś</span></div>
<div style="font-size:14px;color:#374151;margin-top:6px;">zalogowani: ${fmt(loggedScans)} · anonimowi: ${fmt(anonScans)} · nowe: ${fmt(newAnalyses)} · tłumaczenia: ${fmt(translations)}</div>`
  )

  const creditsCard = card(
    'Kredyty',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(creditsSpentToday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">wydanych dziś</span></div>`
  )

  const emailsCard = card(
    'Maile',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(emailsSentToday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">dziś (limit dzienny Brevo: 300)</span></div>
<div style="font-size:14px;color:#374151;margin-top:6px;">łącznie w tym miesiącu: ${fmt(emailsSentThisMonth)}</div>`
  )

  const topHtml =
    topByLanguage.length === 0
      ? '<p style="color:#6b7280;">Brak danych o popularności analiz.</p>'
      : topByLanguage
          .map(
            (group) => `
<div style="margin-bottom:10px;">
  <div style="font-weight:600;color:#111827;margin-bottom:4px;">${group.langName}</div>
  <ol style="margin:0;padding-left:20px;color:#374151;font-size:14px;">
    ${group.items.map((it) => `<li style="margin-bottom:2px;"><a href="${it.url}" style="color:#2563eb;text-decoration:none;">${it.label}</a> — <strong>${it.views}</strong> wyświetleń</li>`).join('')}
  </ol>
</div>`
          )
          .join('')

  const topCard = card('Najpopularniejsze analizy (top 5 na język)', topHtml)

  const htmlContent = `<p style="font-size:16px;color:#111827;">Hej! Oto Twój dzienny przegląd Gakori — ${dateStr}.</p>
${registrationsCard}
${scansCard}
${creditsCard}
${emailsCard}
${topCard}
<p style="color:#9ca3af;font-size:12px;margin-top:20px;">Ten raport wysyła się automatycznie raz dziennie. Wygenerowała go funkcja daily-report.</p>`

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
      subject: `Gakori — raport dzienny (${dateStr})`,
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
})
