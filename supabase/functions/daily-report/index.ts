// PRAGMA — Edge Function "daily-report"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// Wysyła RAZ DZIENNIE (wywoływana z zewnątrz przez Supabase Cron Jobs,
// patrz niżej) krótki mail z najważniejszymi statystykami rozwoju MVP —
// TYLKO na adres właściciela projektu (REPORT_RECIPIENT_EMAIL), nie do
// zwykłych użytkowników.
//
// Ta funkcja NIE jest wywoływana przez przeglądarkę ani przez Supabase
// Auth — dlatego, tak jak send-auth-email, ma WYŁĄCZONĄ weryfikację JWT
// (Edge Functions → daily-report → Settings → "Verify JWT with legacy
// secret" → OFF), a zamiast tego sama sprawdza własny sekret w nagłówku
// `x-cron-secret`, żeby nikt obcy nie mógł jej wywoływać (co kosztowałoby
// zapytania do bazy i wysyłkę maila za każdym razem).
//
// KAŻDA metryka jest liczona OSOBNO i opakowana w try/catch — jeśli jedna
// się nie uda (np. drobna zmiana w odpowiedzi API Brevo), reszta raportu
// i tak dojdzie, a ta jedna pozycja pokaże "brak danych" zamiast wywalić
// całą funkcję.
//
// Wymagane sekrety (Dashboard → Edge Functions → Manage secrets):
// - CRON_REPORT_SECRET — dowolny, wymyślony przez Ciebie długi, losowy
//   ciąg znaków (np. wygenerowany hasłem menedżerem). Ten sam ciąg trzeba
//   wpisać jako nagłówek `x-cron-secret` w konfiguracji Supabase Cron Job.
// - REPORT_RECIPIENT_EMAIL — adres, na który ma przychodzić raport.
// - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — jak w innych funkcjach.
// - BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME — te same, co
//   w send-auth-email.
//
// Jak uruchomić raz dziennie: Supabase Dashboard → Database → Cron Jobs
// → "Create a new cron job" → typ "HTTP Request" → URL tej funkcji →
// nagłówek `x-cron-secret: <wartość CRON_REPORT_SECRET>` → harmonogram
// (uwaga: godziny w Supabase Cron są w UTC, nie w czasie polskim — patrz
// wyjaśnienie przeliczenia w PRAGMA_CONTEXT.md).

import { createClient } from 'jsr:@supabase/supabase-js@2'

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

  // --- Rejestracje: dziś, łącznie, średnia z ostatnich 7 dni (do wykrywania nietypowych skoków) ---
  let newToday: number | null = null
  let totalUsers: number | null = null
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
    totalUsers = allUsers.length

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

  // --- Analizy (scans): dziś (rozbicie zalogowani/anonimowi, nowe/tłumaczenia, q_score, wzorce), łącznie ---
  let scansToday: number | null = null
  let loggedScans: number | null = null
  let anonScans: number | null = null
  let newAnalyses: number | null = null
  let translations: number | null = null
  let avgQScore: number | null = null
  let patternsManipulation: number | null = null
  let patternsReasoning: number | null = null
  let totalScans: number | null = null
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('discovered_by, is_translation, result')
      .gte('created_at', since(24))
    if (error) throw error
    const rows = data as { discovered_by: string | null; is_translation: boolean; result: any }[]
    scansToday = rows.length
    loggedScans = rows.filter((r) => r.discovered_by).length
    anonScans = scansToday - loggedScans
    translations = rows.filter((r) => r.is_translation).length
    newAnalyses = scansToday - translations

    const qScores = data
      .map((r: any) => (typeof r.result?.q_score === 'number' ? r.result.q_score : null))
      .filter((v: number | null): v is number => v !== null)
    avgQScore = avg(qScores)

    let manip = 0
    let reason = 0
    for (const r of data as any[]) {
      for (const p of r.result?.patterns ?? []) {
        if (p?.pattern_type === 'manipulation') manip++
        else if (p?.pattern_type === 'reasoning') reason++
      }
    }
    patternsManipulation = manip
    patternsReasoning = reason
  } catch (_err) {
    // metryki dzisiejszych analiz niedostępne — reszta raportu leci dalej
  }
  try {
    const { count, error } = await supabase.from('scans').select('*', { count: 'exact', head: true })
    if (error) throw error
    totalScans = count ?? null
  } catch (_err) {
    // łączna liczba analiz niedostępna
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
    // metryka kredytów niedostępna (np. brak kolumny created_at w tej tabeli)
  }

  // --- Maile wysłane dziś wg Brevo ---
  let emailsSentToday: number | null = null
  try {
    const brevoKey = Deno.env.get('BREVO_API_KEY')
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
    // statystyki Brevo niedostępne
  }

  // --- Budowanie treści maila ---
  const fmt = (v: number | null, unit = '') => (v === null ? 'brak danych' : `${Math.round(v * 10) / 10}${unit}`)
  const dateStr = new Date().toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })

  const burstHtml = burstWarning
    ? `<p style="color:#b91c1c;font-weight:600;">Uwaga: dzisiejsza liczba rejestracji jest wyraźnie wyższa niż zwykle (średnia z ostatnich 7 dni: ${fmt(avg7d)}) — warto sprawdzić listę kont w Supabase (Authentication → Users), czy to nie jest nietypowy, zautomatyzowany ruch.</p>`
    : ''

  const htmlContent = `<h2>Pragma — raport dzienny, ${dateStr}</h2>

<h3>Rejestracje</h3>
<p>Dziś: <strong>${fmt(newToday)}</strong> (średnia z ostatnich 7 dni: ${fmt(avg7d)})</p>
<p>Łącznie kont: <strong>${fmt(totalUsers)}</strong></p>
${burstHtml}

<h3>Analizy tekstu</h3>
<p>Dziś: <strong>${fmt(scansToday)}</strong> (zalogowani: ${fmt(loggedScans)}, anonimowi: ${fmt(anonScans)}; nowe analizy: ${fmt(newAnalyses)}, tłumaczenia: ${fmt(translations)})</p>
<p>Łącznie analiz od początku: <strong>${fmt(totalScans)}</strong></p>
<p>Średni wynik uczciwości tekstu dziś (q_score): ${fmt(avgQScore, '/100')}</p>
<p>Wykryte wzorce dziś: manipulacja — ${fmt(patternsManipulation)}, zdrowe rozumowanie — ${fmt(patternsReasoning)}</p>

<h3>Kredyty</h3>
<p>Wydane dziś: ${fmt(creditsSpentToday)}</p>

<h3>Maile</h3>
<p>Wysłane dziś (wg Brevo): ${fmt(emailsSentToday)} / 300 dziennego limitu na koncie Brevo</p>

<p style="color:#6b7280;font-size:13px;">Ten raport wysyła się automatycznie raz dziennie. Wygenerowała go funkcja daily-report.</p>`

  const brevoKey = Deno.env.get('BREVO_API_KEY')
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
  const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'Pragma — raport'
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
      subject: `Pragma — raport dzienny (${dateStr})`,
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
