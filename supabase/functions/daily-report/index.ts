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
//   GEMINI_API_KEY (POPRAWKA 2026-08-28 — tłumaczenie tytułów najpopularniejszych
//   analiz na polski, patrz translateTitlesToPolish() niżej; PIERWSZY realny
//   koszt AI w tej funkcji, dotąd $0 — fail-open: brak klucza po prostu
//   zostawia tytuły nieprzetłumaczone, nie wywala raportu)
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

// POPRAWKA 2026-08-27 — właściciel poprosił o 100% dokładność: raport ma
// opisywać DOKŁADNIE pełną WCZORAJSZĄ dobę czasu polskiego (00:00-24:00
// Europe/Warsaw), nie "ostatnie 24 godziny licząc od momentu uruchomienia"
// (dawne `since(24)`/`dayKey()` na surowym UTC — dawało co innego zależnie
// od godziny uruchomienia funkcji). Sprawdzamy przesunięcie strefy czasowej
// W POŁUDNIE danego dnia (bezpieczny "sondujący" punkt, z dala od
// ewentualnej zmiany czasu letni/zimowy, która zawsze zdarza się nad ranem)
// — dzięki temu poprawnie obsługuje oba przesunięcia (UTC+1 zimą, UTC+2
// latem), bez twardo wpisanej stałej.
function warsawMidnightUtcIso(dateStr: string): string {
  const noonUtc = new Date(`${dateStr}T12:00:00Z`)
  const tzPart =
    new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', timeZoneName: 'shortOffset' })
      .formatToParts(noonUtc)
      .find((p) => p.type === 'timeZoneName')?.value || 'GMT+1'
  const offsetHours = parseInt(tzPart.match(/GMT([+-]\d+)/)?.[1] ?? '1', 10)
  const utcMidnight = new Date(`${dateStr}T00:00:00Z`)
  return new Date(utcMidnight.getTime() - offsetHours * 60 * 60 * 1000).toISOString()
}

function warsawDateStr(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(date)
}

// Zwraca dokładne granice WCZORAJSZEJ doby polskiej jako instanty UTC
// (`start` włącznie, `end` wyłącznie) — do użycia z `.gte(start).lt(end)`
// w każdym zapytaniu, które ma liczyć "wczoraj", oraz samą datę (do
// pokazania w treści/temacie maila — raport teraz zawsze opisuje
// WCZORAJSZY dzień, bo przychodzi rano).
function warsawYesterdayRange(): { start: string; end: string; dateStr: string } {
  const todayStr = warsawDateStr(new Date())
  const todayStart = warsawMidnightUtcIso(todayStr)
  const yesterdayStr = warsawDateStr(new Date(new Date(todayStart).getTime() - 12 * 60 * 60 * 1000))
  const yesterdayStart = warsawMidnightUtcIso(yesterdayStr)
  return { start: yesterdayStart, end: todayStart, dateStr: yesterdayStr }
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

// POPRAWKA 2026-08-28 — tłumaczy CAŁĄ listę krótkich tytułów/podsumowań na
// polski w JEDNYM zapytaniu do Gemini (ten sam model co `analyze/index.ts`
// — `gemini-3.5-flash-lite` — dla spójności, ale ta funkcja jest celowo
// samodzielna/minimalna, bez współdzielonej infrastruktury kill-switcha z
// tamtego pliku: to stały, ograniczony z góry koszt raz dziennie
// (maks. kilkadziesiąt krótkich tytułów), nie coś, co mogłoby "spiralować"
// tak jak analizy wywoływane bezpośrednio przez użytkowników — dlatego nie
// wymaga tego samego mechanizmu ochronnego). Fail-open na każdym etapie:
// błąd sieci/parsowania/niezgodna długość odpowiedzi zwraca ORYGINALNE
// (nieprzetłumaczone) teksty, nigdy nie wywala reszty raportu.
async function translateTitlesToPolish(items: string[], geminiKey: string): Promise<string[]> {
  if (items.length === 0) return []
  try {
    const prompt = `Przetłumacz KAŻDY z poniższych tytułów/podsumowań na język polski — prosto i zwięźle, zachowując sens. Jeśli tekst już jest po polsku, zwróć go bez zmian. Zwróć WYŁĄCZNIE tablicę tłumaczeń w DOKŁADNIE tej samej kolejności i tej samej długości co wejście (jedno tłumaczenie na jeden wpis wejściowy).

Wejście (JSON):
${JSON.stringify(items)}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    let res: Response
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
              responseMimeType: 'application/json',
              responseSchema: { type: 'array', items: { type: 'string' } },
            },
          }),
          signal: controller.signal,
        }
      )
    } finally {
      clearTimeout(timer)
    }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (typeof text !== 'string' || !text) return items
    const translated = JSON.parse(text)
    if (!Array.isArray(translated) || translated.length !== items.length) return items
    return translated.map((t: unknown, i: number) => (typeof t === 'string' && t.trim() ? t.trim() : items[i]))
  } catch (_err) {
    return items
  }
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

  // Cały raport opisuje teraz DOKŁADNIE jedną, pełną dobę: WCZORAJSZY dzień
  // czasu polskiego (patrz `warsawYesterdayRange()` wyżej) — nie "ostatnie
  // 24h od momentu uruchomienia".
  const yr = warsawYesterdayRange()

  // --- Rejestracje: wczoraj, średnia z 7 dni SPRZED wczoraj (do wykrywania nietypowych skoków) ---
  let newYesterday: number | null = null
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

    newYesterday = allUsers.filter((u) => u.created_at >= yr.start && u.created_at < yr.end).length

    // Grupowanie po DACIE WARSZAWSKIEJ (nie surowym UTC) każdego konta —
    // żeby 7-dniowa średnia porównywała się z tym samym rodzajem doby, co
    // liczba "wczoraj" wyżej.
    const perDay: Record<string, number> = {}
    for (const u of allUsers) {
      const k = warsawDateStr(new Date(u.created_at))
      perDay[k] = (perDay[k] || 0) + 1
    }
    const last7Keys: string[] = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(new Date(yr.start).getTime() - i * 24 * 60 * 60 * 1000)
      last7Keys.push(warsawDateStr(d))
    }
    avg7d = avg(last7Keys.map((k) => perDay[k] || 0))
    if (avg7d !== null && newYesterday !== null && newYesterday > Math.max(5, avg7d * 3)) {
      burstWarning = true
    }
  } catch (_err) {
    // metryka rejestracji niedostępna — reszta raportu leci dalej
  }

  // --- Analizy (scans) wczoraj: rozbicie zalogowani/anonimowi, nowe/tłumaczenia ---
  let scansYesterday: number | null = null
  let loggedScans: number | null = null
  let anonScans: number | null = null
  let newAnalyses: number | null = null
  let translations: number | null = null
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('discovered_by, is_translation')
      .gte('created_at', yr.start)
      .lt('created_at', yr.end)
    if (error) throw error
    const rows = data as { discovered_by: string | null; is_translation: boolean }[]
    scansYesterday = rows.length
    loggedScans = rows.filter((r) => r.discovered_by).length
    anonScans = scansYesterday - loggedScans
    translations = rows.filter((r) => r.is_translation).length
    newAnalyses = scansYesterday - translations
  } catch (_err) {
    // metryki wczorajszych analiz niedostępne — reszta raportu leci dalej
  }

  // --- POPRAWKA 2026-08-28 — "Najpopularniejsze analizy": przebudowane na
  // wyraźną prośbę właściciela. Dawniej: top 5 WSZECH CZASÓW, jeden wspólny
  // ranking (link+tekst razem), tytuły w oryginalnym języku analizy — stare
  // popularne analizy wisiałyby w raporcie bez końca, a nie-polskie tytuły
  // były nieczytelne dla właściciela. Teraz: TYLKO wczorajsza doba (te same
  // `yr.start`/`yr.end` co reszta raportu — "nie chcę żeby wisiały mi stare
  // analizy"), OSOBNE rankingi na język: top 5 linków + top 3 analiz tekstu
  // (rozdzielone, bo to inny rodzaj treści), język bez ŻADNEJ analizy
  // wczoraj w ogóle znika z raportu (nie pokazujemy pustej sekcji).
  const SITE_URL = 'https://gakori.app'
  type PopularItem = { label: string; views: number; url: string }
  type LanguagePopular = { langName: string; linkItems: PopularItem[]; textItems: PopularItem[] }
  const topByLanguage: LanguagePopular[] = []
  try {
    const toItem = (r: { id: string; view_count: number | null; result: { summary?: string } | null; source_url: string | null }): PopularItem => ({
      label: String(r.result?.summary || r.source_url || 'analiza bez podsumowania').slice(0, 110),
      views: r.view_count ?? 0,
      url: `${SITE_URL}/scan.html?id=${encodeURIComponent(r.id)}`,
    })
    for (const lang of LANGUAGES) {
      const { data: linkData, error: linkErr } = await supabase
        .from('scans')
        .select('id, view_count, result, source_url')
        .eq('language', lang.code)
        .eq('input_type', 'url')
        .gte('created_at', yr.start)
        .lt('created_at', yr.end)
        .order('view_count', { ascending: false })
        .limit(5)
      if (linkErr) throw linkErr
      const { data: textData, error: textErr } = await supabase
        .from('scans')
        .select('id, view_count, result, source_url')
        .eq('language', lang.code)
        .eq('input_type', 'text')
        .gte('created_at', yr.start)
        .lt('created_at', yr.end)
        .order('view_count', { ascending: false })
        .limit(3)
      if (textErr) throw textErr
      const linkItems = ((linkData || []) as any[]).map(toItem)
      const textItems = ((textData || []) as any[]).map(toItem)
      if (linkItems.length === 0 && textItems.length === 0) continue
      topByLanguage.push({ langName: lang.name, linkItems, textItems })
    }

    // POPRAWKA 2026-08-28 — tłumaczenie WSZYSTKICH tytułów na polski,
    // właściciel wprost poprosił ("proszę przetłumaczaj mi tytuły na język
    // polski") — czyta raport wyłącznie po polsku, a tytuły nie-polskich
    // analiz były dotąd w oryginalnym języku analizy. JEDNO, zbiorcze
    // zapytanie do Gemini na CAŁĄ listę naraz (nie osobne zapytanie na
    // każdy tytuł) — pierwszy realny koszt AI w tej funkcji (dotąd $0,
    // tylko wysyłka maila przez Brevo), ale bardzo mały: krótkie teksty,
    // maks. kilkadziesiąt tytułów dziennie. Fail-open: błąd/brak klucza
    // zostawia oryginalne (nieprzetłumaczone) tytuły, nie wywala raportu.
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (geminiKey) {
      const allItems = topByLanguage.flatMap((g) => [...g.linkItems, ...g.textItems])
      if (allItems.length > 0) {
        const translated = await translateTitlesToPolish(allItems.map((it) => it.label), geminiKey)
        allItems.forEach((it, i) => {
          if (translated[i]) it.label = translated[i]
        })
      }
    }
  } catch (_err) {
    // ranking popularności niedostępny — reszta raportu leci dalej
  }

  // --- Kredyty wydane wczoraj ---
  let creditsSpentYesterday: number | null = null
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('type', 'spend')
      .gte('created_at', yr.start)
      .lt('created_at', yr.end)
    if (error) throw error
    creditsSpentYesterday = data.reduce((sum: number, r: any) => sum + Math.abs(r.amount || 0), 0)
  } catch (_err) {
    // metryka kredytów niedostępna
  }

  // --- POPRAWKA 2026-08-26(u) — realny koszt AI dziś (USD), do tej pory
  // ZUPEŁNIE nieobecny w raporcie. Właściciel wprost poprosił, żeby zawsze
  // móc "znać przepływ cashflow bez niespodzianek" — dotąd raport pokazywał
  // wyłącznie kredyty (przybliżenie przychodu), NIGDY prawdziwego kosztu
  // Gemini w dolarach, mimo że ten koszt jest już liczony i zapisywany
  // (patrz `system_daily_spend`, reguła 10 głównego wyłącznika w
  // `analyze/index.ts`) — po prostu nikt wcześniej nie dociągnął go tutaj.
  // Świadome ograniczenie: system prawdziwych płatności jeszcze nie
  // istnieje, więc na razie to nie jest "koszt vs przychód" 1:1 — to sam
  // koszt, do obserwowania trendu dzień po dniu, zanim będzie z czym
  // dokładnie porównać.
  let aiCostYesterdayUsd: number | null = null
  try {
    const { data, error } = await supabase
      .from('system_daily_spend')
      .select('total_usd')
      .eq('spend_date', yr.dateStr)
      .maybeSingle()
    if (error) throw error
    aiCostYesterdayUsd = data?.total_usd ?? 0
  } catch (_err) {
    // metryka kosztu AI niedostępna — reszta raportu leci dalej
  }

  // --- Maile: wczoraj i suma od początku miesiąca (wg statystyk Brevo) ---
  // POPRAWKA 2026-08-27 — daty przekazywane Brevo to teraz zawsze WCZORAJSZA
  // data polska (`yr.dateStr`), zamiast "ostatni dzień licząc od teraz"
  // (`?days=1`) — spójne z resztą raportu. Brevo liczy swoje statystyki
  // dobowe wg WŁASNEJ strefy czasowej konta, nie naszej — to jedyne miejsce
  // w tym pliku, gdzie 100% precyzji nie zależy tylko od nas.
  let emailsSentYesterday: number | null = null
  let emailsSentThisMonth: number | null = null
  const brevoKey = Deno.env.get('BREVO_API_KEY')
  try {
    if (brevoKey) {
      const res = await fetch(
        `https://api.brevo.com/v3/smtp/statistics/aggregatedReport?startDate=${yr.dateStr}&endDate=${yr.dateStr}`,
        { headers: { accept: 'application/json', 'api-key': brevoKey } }
      )
      if (res.ok) {
        const json = await res.json()
        if (typeof json.requests === 'number') emailsSentYesterday = json.requests
      }
    }
  } catch (_err) {
    // statystyki dzienne Brevo niedostępne
  }
  try {
    if (brevoKey) {
      const monthStart = `${yr.dateStr.slice(0, 7)}-01`
      const res = await fetch(
        `https://api.brevo.com/v3/smtp/statistics/aggregatedReport?startDate=${monthStart}&endDate=${yr.dateStr}`,
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

  // --- Punkt B audytu bezpieczeństwa (POPRAWKA 2026-08-23(a)) — wycofane
  // automatycznie treści (`scans.retracted`) i zgłoszenia niezgodności w
  // ostatnich 24h. WYŁĄCZNIE widoczność, nie wymaga żadnej reakcji — cały
  // mechanizm jest w pełni automatyczny (patrz `report-link-mismatch`,
  // GAKORI_CONTEXT.md), to tylko żeby właściciel miał to na oku.
  let retractedTotal: number | null = null
  let reports24h: number | null = null
  try {
    const { count, error } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('retracted', true)
    if (error) throw error
    retractedTotal = count ?? 0
  } catch (_err) {
    // metryka wycofanych treści niedostępna
  }
  try {
    const { count, error } = await supabase
      .from('link_mismatch_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yr.start)
      .lt('created_at', yr.end)
    if (error) throw error
    reports24h = count ?? 0
  } catch (_err) {
    // metryka zgłoszeń niedostępna
  }

  // --- Niedostarczone maile (send-auth-email nie zdołał wysłać przez
  // Brevo — np. limit dzienny) w ostatnich 24h, patrz GAKORI_CONTEXT.md,
  // "Ochrona przed limitem maili" (POPRAWKA 2026-08-21(u)) ---
  let emailFailures24h: number | null = null
  try {
    const { count, error } = await supabase
      .from('email_failures')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yr.start)
      .lt('created_at', yr.end)
    if (error) throw error
    emailFailures24h = count ?? 0
  } catch (_err) {
    // metryka niedostarczonych maili niedostępna
  }

  // --- POPRAWKA 2026-08-25(c) — ile razy w ostatnich 24h przeglądarka
  // sama musiała ponowić zapytanie do `analyze` po błędzie PLATFORMY
  // (502/503/504 — Supabase/Cloudflare przerwały zapytanie w trakcie
  // działania, nie nasz kod). WYŁĄCZNIE widoczność — pomaga ocenić, czy
  // ponowienia (i podniesiony do 30s limit czasu Gemini) faktycznie coś
  // dają, i orientacyjnie ile to może nas kosztować (każde ponowienie to
  // ryzyko podwójnie/potrójnie opłaconego zapytania do Gemini, patrz
  // GAKORI_CONTEXT.md) — nie wymaga żadnej akcji samo w sobie.
  let edgeRetries24h: number | null = null
  try {
    const { count, error } = await supabase
      .from('edge_function_retries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yr.start)
      .lt('created_at', yr.end)
    if (error) throw error
    edgeRetries24h = count ?? 0
  } catch (_err) {
    // metryka ponowień niedostępna
  }

  // --- POPRAWKA 2026-08-28 — "wykrywanie botów" (punkt 3 z listy
  // właściciela, "opanujmy 1,2,3"): dodatkowa WIDOCZNOŚĆ, NIEZALEŻNA od
  // istniejącego już mechanizmu blokad (patrz RATE_LIMIT_* w
  // analyze/index.ts — ten reaguje dopiero po przekroczeniu progu liczby
  // nieudanych prób). Zasada: człowiek klika nieregularnie, skrypt/bot
  // bijący w regularnych odstępach (np. co dokładnie 30s) zostawia bardzo
  // NISKĄ zmienność odstępów między kolejnymi nieudanymi próbami tego
  // samego konta. Mierzymy to współczynnikiem zmienności (odchylenie
  // standardowe podzielone przez średnią z odstępów, w sekundach) —
  // niska wartość = bardzo regularne odstępy = podejrzane. Właściciel
  // potwierdził umieszczenie w tym samym, dziennym raporcie (nie osobny
  // mail) — "skoro są blokady to raz dziennie wystarczy". Progi
  // (BOT_MIN_ATTEMPTS/BOT_MAX_COEFFICIENT_OF_VARIATION) to na razie
  // najlepsze wspólne oszacowanie, świadomie otwarte na dostrojenie po
  // zobaczeniu żywych przypadków — dokładnie jak np. progi filtra
  // gęstości linków w analyze/index.ts.
  // POPRAWKA 2026-08-28 — próg 15% (pierwsza wersja) dawał fałszywy alarm
  // w teście na przypadkowo dość regularnym "człowieku" (5 próbek, cv
  // ~10,5%) — przy tak małej liczbie próbek zwykła losowość łatwo wygląda
  // "regularnie". Zaostrzone do 10% po realnym teście (Node, scratchpad):
  // prawdziwe boty w testach dawały cv ~2-4%, przypadkowo regularny
  // człowiek ~10-11% — 10% zostawia bezpieczny margines między nimi.
  const BOT_MIN_ATTEMPTS = 4 // potrzeba min. 3 odstępów, żeby zmienność miała sens
  const BOT_MAX_COEFFICIENT_OF_VARIATION = 0.10 // 10% — bardzo ciasna regularność, typowa dla zegara skryptu
  // POPRAWKA 2026-08-28(b) — właściciel zapytał, czy dodać jeszcze jakieś
  // sygnały botowe. Dwa dodane, oba WYŁĄCZNIE odczyt z bazy + liczenie w
  // pamięci tej funkcji (zero zapytań do Gemini, zero kosztu dolarowego —
  // właściciel wprost o to zapytał, potwierdzone): (1) TA SAMA logika
  // regularności zastosowana też do `content_reanalysis_attempts`
  // (powtarzane "Sprawdź, czy coś się zmieniło" na TYM SAMYM linku —
  // grupowane po (user_id, content_hash) razem, tak jak już robi to
  // istniejący limit SAME_FILE_ATTEMPT_LIMIT w analyze/index.ts, żeby
  // odstępy liczyły się dla jednej, konkretnej treści, nie zlepka
  // wszystkich linków danego użytkownika); (2) sygnał NIEZALEŻNY od
  // regularności — nietypowo DUŻA liczba prób w ciągu dnia (nawet gdy bot
  // świadomie losuje odstępy, żeby ominąć wykrywanie regularności).
  const BOT_VOLUME_THRESHOLD = 20 // znacznie więcej niż realistyczny człowiek w jeden dzień

  function stdDev(nums: number[], meanVal: number): number {
    if (nums.length === 0) return 0
    const variance = nums.reduce((sum, n) => sum + (n - meanVal) ** 2, 0) / nums.length
    return Math.sqrt(variance)
  }

  function groupBy(rows: { key: string; created_at: string }[]): Record<string, string[]> {
    const byKey: Record<string, string[]> = {}
    for (const r of rows) {
      if (!byKey[r.key]) byKey[r.key] = []
      byKey[r.key].push(r.created_at)
    }
    return byKey
  }

  function gapStats(timestampsSorted: string[]): { meanGap: number; coefficientOfVariation: number } | null {
    if (timestampsSorted.length < 2) return null
    const gaps: number[] = []
    for (let i = 1; i < timestampsSorted.length; i++) {
      gaps.push((new Date(timestampsSorted[i]).getTime() - new Date(timestampsSorted[i - 1]).getTime()) / 1000)
    }
    const meanGap = avg(gaps)
    if (meanGap === null || meanGap <= 0) return null
    return { meanGap, coefficientOfVariation: stdDev(gaps, meanGap) / meanGap }
  }

  // Adres e-mail zamiast gołego UUID — dociągany TYLKO dla flagowanych
  // kont (zawsze mała liczba), żeby nie robić dodatkowego zapytania per
  // użytkownik na co dzień. Fail-open per konto: zostaje user_id, jeśli
  // nie uda się dociągnąć adresu.
  async function attachEmails(accounts: { user_id: string; email: string }[]): Promise<void> {
    for (const acc of accounts) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(acc.user_id)
        if (userData?.user?.email) acc.email = userData.user.email
      } catch (_e) {
        // zostaje user_id jako etykieta
      }
    }
  }

  type RegularityFlag = { user_id: string; email: string; attempts: number; avgGapSeconds: number; coefficientOfVariation: number }

  let suspiciousBotAccounts: RegularityFlag[] = []
  let volumeOutlierAccounts: { user_id: string; email: string; attempts: number }[] = []
  try {
    const { data, error } = await supabase
      .from('failed_scan_attempts')
      .select('user_id, created_at')
      .gte('created_at', yr.start)
      .lt('created_at', yr.end)
      .order('created_at', { ascending: true })
    if (error) throw error
    const byUser = groupBy((data as { user_id: string; created_at: string }[]).map((r) => ({ key: r.user_id, created_at: r.created_at })))
    for (const [uid, timestamps] of Object.entries(byUser)) {
      if (timestamps.length >= BOT_VOLUME_THRESHOLD) {
        volumeOutlierAccounts.push({ user_id: uid, email: uid, attempts: timestamps.length })
      }
      if (timestamps.length < BOT_MIN_ATTEMPTS) continue
      const stats = gapStats(timestamps)
      if (!stats) continue
      if (stats.coefficientOfVariation <= BOT_MAX_COEFFICIENT_OF_VARIATION) {
        suspiciousBotAccounts.push({ user_id: uid, email: uid, attempts: timestamps.length, avgGapSeconds: stats.meanGap, coefficientOfVariation: stats.coefficientOfVariation })
      }
    }
    suspiciousBotAccounts.sort((a, b) => b.attempts - a.attempts)
    volumeOutlierAccounts.sort((a, b) => b.attempts - a.attempts)
    await attachEmails(suspiciousBotAccounts)
    await attachEmails(volumeOutlierAccounts)
  } catch (_err) {
    // metryka wykrywania botów niedostępna — reszta raportu leci dalej
  }

  let suspiciousReanalysisAccounts: (RegularityFlag & { contentHashPrefix: string })[] = []
  try {
    const { data, error } = await supabase
      .from('content_reanalysis_attempts')
      .select('user_id, content_hash, created_at')
      .gte('created_at', yr.start)
      .lt('created_at', yr.end)
      .order('created_at', { ascending: true })
    if (error) throw error
    const rows = data as { user_id: string; content_hash: string; created_at: string }[]
    const byUserContent = groupBy(rows.map((r) => ({ key: `${r.user_id}::${r.content_hash}`, created_at: r.created_at })))
    for (const [key, timestamps] of Object.entries(byUserContent)) {
      if (timestamps.length < BOT_MIN_ATTEMPTS) continue
      const stats = gapStats(timestamps)
      if (!stats) continue
      if (stats.coefficientOfVariation <= BOT_MAX_COEFFICIENT_OF_VARIATION) {
        const [uid, contentHash] = key.split('::')
        suspiciousReanalysisAccounts.push({
          user_id: uid,
          email: uid,
          attempts: timestamps.length,
          avgGapSeconds: stats.meanGap,
          coefficientOfVariation: stats.coefficientOfVariation,
          contentHashPrefix: contentHash.slice(0, 12),
        })
      }
    }
    suspiciousReanalysisAccounts.sort((a, b) => b.attempts - a.attempts)
    await attachEmails(suspiciousReanalysisAccounts)
  } catch (_err) {
    // metryka powtórnego sprawdzania niedostępna — reszta raportu leci dalej
  }

  // --- Budowanie treści maila ---
  const fmt = (v: number | null, unit = '') => (v === null ? 'brak danych' : `${Math.round(v * 10) / 10}${unit}`)
  // POPRAWKA 2026-08-26(u) — `fmt()` zaokrągla do 1 miejsca po przecinku,
  // co dla kwot w dolarach rzędu $0,01-$0,50 (typowy dzienny koszt AI na
  // wczesnym etapie) pokazywałoby "$0.0" — bezużyteczne. Osobny formatter
  // z 4 miejscami po przecinku, żeby drobne kwoty wciąż było widać.
  const fmtUsd = (v: number | null) => (v === null ? 'brak danych' : `$${v.toFixed(4)}`)
  // POPRAWKA 2026-08-27 — cały raport opisuje teraz WCZORAJSZY dzień
  // (patrz `warsawYesterdayRange()`/`yr` wyżej) — data w treści/temacie to
  // data WCZORAJSZA, nie dzisiejsza, żeby mail nie wprowadzał w błąd (mail
  // przychodzi rano, ale liczby dotyczą poprzedniej doby).
  const dateStr = new Date(`${yr.dateStr}T12:00:00Z`).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })

  const card = (label: string, bodyHtml: string) => `
<div style="background:#f4f4f5;border-radius:12px;padding:16px 20px;margin-bottom:14px;">
  <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;font-weight:600;margin-bottom:8px;">${label}</div>
  ${bodyHtml}
</div>`

  const burstHtml = burstWarning
    ? `<p style="color:#b91c1c;font-weight:600;margin:8px 0 0;">Hej, uwaga — wczoraj zarejestrowało się wyraźnie więcej osób niż zwykle (średnio ostatnio: ${fmt(avg7d)}/dzień). Warto rzucić okiem na listę kont w Supabase (Authentication → Users), czy to na pewno prawdziwi ludzie.</p>`
    : ''

  const registrationsCard = card(
    'Rejestracje',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(newYesterday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">nowych kont wczoraj (średnio ostatnio: ${fmt(avg7d)}/dzień)</span></div>${burstHtml}`
  )

  const scansCard = card(
    'Analizy tekstu',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(scansYesterday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">wczoraj</span></div>
<div style="font-size:14px;color:#374151;margin-top:6px;">zalogowani: ${fmt(loggedScans)} · anonimowi: ${fmt(anonScans)} · nowe: ${fmt(newAnalyses)} · tłumaczenia: ${fmt(translations)}</div>`
  )

  const creditsCard = card(
    'Kredyty i koszt AI',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(creditsSpentYesterday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">kredytów wydanych wczoraj</span></div>
<div style="font-size:14px;color:#374151;margin-top:6px;">realny koszt AI wczoraj: <strong>${fmtUsd(aiCostYesterdayUsd)}</strong> (dzienny limit bezpieczeństwa: $125 — patrz system_thresholds.daily_budget_usd)</div>`
  )

  const retriesHtml =
    edgeRetries24h && edgeRetries24h > 0
      ? `<p style="color:#b91c1c;font-weight:600;margin:8px 0 0;">Uwaga: ${edgeRetries24h}× wczoraj przeglądarka musiała sama ponowić zapytanie po błędzie platformy — każde takie ponowienie to ryzyko podwójnie opłaconego zapytania do Gemini. Jeśli ta liczba rośnie, warto to zbadać.</p>`
      : ''
  const retriesCard = card(
    'Ponowienia po błędzie platformy',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(edgeRetries24h)} <span style="font-size:14px;font-weight:400;color:#6b7280;">wczoraj</span></div>${retriesHtml}`
  )

  const emailFailuresHtml =
    emailFailures24h && emailFailures24h > 0
      ? `<p style="color:#b91c1c;font-weight:600;margin:8px 0 0;">${emailFailures24h} mail(i) nie udało się wysłać wczoraj (prawdopodobnie limit Brevo) — użytkownicy mieli w aplikacji przycisk "wyślij ponownie", ale warto zerknąć, czy to się nie nasila.</p>`
      : ''

  const emailsCard = card(
    'Maile',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(emailsSentYesterday)} <span style="font-size:14px;font-weight:400;color:#6b7280;">wczoraj (limit dzienny Brevo: 300)</span></div>
<div style="font-size:14px;color:#374151;margin-top:6px;">łącznie w tym miesiącu: ${fmt(emailsSentThisMonth)}</div>${emailFailuresHtml}`
  )

  const renderPopularItems = (items: PopularItem[]) =>
    items.length === 0
      ? '<p style="color:#9ca3af;font-size:13px;margin:0 0 6px;">Brak.</p>'
      : `<ol style="margin:0 0 6px;padding-left:20px;color:#374151;font-size:14px;">
${items.map((it) => `<li style="margin-bottom:2px;"><a href="${it.url}" style="color:#2563eb;text-decoration:none;">${it.label}</a> — <strong>${it.views}</strong> wyświetleń</li>`).join('')}
</ol>`

  const topHtml =
    topByLanguage.length === 0
      ? '<p style="color:#6b7280;">Brak danych o popularności analiz z ostatnich 24h.</p>'
      : topByLanguage
          .map(
            (group) => `
<div style="margin-bottom:12px;">
  <div style="font-weight:600;color:#111827;margin-bottom:4px;">${group.langName}</div>
  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Linki</div>
  ${renderPopularItems(group.linkItems)}
  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Tekst</div>
  ${renderPopularItems(group.textItems)}
</div>`
          )
          .join('')

  const topCard = card('Najpopularniejsze analizy z ostatnich 24h (top 5 linki / top 3 tekst, na język)', topHtml)

  const trustCard = card(
    'Zaufanie do linków (punkt B)',
    `<div style="font-size:24px;font-weight:700;color:#111827;">${fmt(retractedTotal)} <span style="font-size:14px;font-weight:400;color:#6b7280;">wycofanych automatycznie łącznie</span></div>
<div style="font-size:14px;color:#374151;margin-top:6px;">zgłoszeń niezgodności wczoraj: ${fmt(reports24h)} — to działa w pełni automatycznie, nic nie musisz robić.</div>`
  )

  const regularityListHtml = (accounts: RegularityFlag[], noun: string) =>
    accounts.length === 0
      ? '<p style="color:#6b7280;margin:0;">Brak.</p>'
      : `<ul style="margin:0;padding-left:20px;">
${accounts
  .map(
    (a) =>
      `<li style="margin-bottom:2px;">${a.email} — ${a.attempts} ${noun}, średni odstęp ${Math.round(a.avgGapSeconds)}s (zmienność ${(a.coefficientOfVariation * 100).toFixed(0)}%)</li>`
  )
  .join('')}
</ul>`

  const botHtml = `<div style="margin-bottom:14px;">
  <div style="font-weight:600;color:#111827;margin-bottom:4px;">Regularne odstępy — nieudane próby analizy</div>
  <div style="font-size:14px;color:#374151;">${regularityListHtml(suspiciousBotAccounts, 'nieudanych prób')}</div>
</div>
<div style="margin-bottom:14px;">
  <div style="font-weight:600;color:#111827;margin-bottom:4px;">Regularne odstępy — powtórne sprawdzanie tego samego linku</div>
  <div style="font-size:14px;color:#374151;">${
    suspiciousReanalysisAccounts.length === 0
      ? '<p style="color:#6b7280;margin:0;">Brak.</p>'
      : `<ul style="margin:0;padding-left:20px;">
${suspiciousReanalysisAccounts
  .map(
    (a) =>
      `<li style="margin-bottom:2px;">${a.email} — ${a.attempts}× ta sama treść (${a.contentHashPrefix}…), średni odstęp ${Math.round(a.avgGapSeconds)}s (zmienność ${(a.coefficientOfVariation * 100).toFixed(0)}%)</li>`
  )
  .join('')}
</ul>`
  }</div>
</div>
<div>
  <div style="font-weight:600;color:#111827;margin-bottom:4px;">Nietypowo duża liczba prób w ciągu dnia (niezależnie od regularności)</div>
  <div style="font-size:14px;color:#374151;">${
    volumeOutlierAccounts.length === 0
      ? '<p style="color:#6b7280;margin:0;">Brak.</p>'
      : `<ul style="margin:0;padding-left:20px;">
${volumeOutlierAccounts.map((a) => `<li style="margin-bottom:2px;">${a.email} — ${a.attempts} nieudanych prób wczoraj (próg: ${BOT_VOLUME_THRESHOLD})</li>`).join('')}
</ul>`
  }</div>
</div>
<p style="color:#9ca3af;font-size:12px;margin-top:10px;">To WYŁĄCZNIE widoczność — mechanizm blokad już działa niezależnie od tego (patrz progi w analyze/index.ts), te konta mogły już zostać zablokowane same.</p>`

  const botCard = card('Wykrywanie botów', botHtml)

  const htmlContent = `<p style="font-size:16px;color:#111827;">Hej! Oto Twój przegląd Gakori za wczoraj — ${dateStr}.</p>
${registrationsCard}
${scansCard}
${creditsCard}
${retriesCard}
${emailsCard}
${trustCard}
${botCard}
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
