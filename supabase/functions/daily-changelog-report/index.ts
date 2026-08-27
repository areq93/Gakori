// GAKORI — Edge Function "daily-changelog-report"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// POPRAWKA 2026-08-27 — właściciel poprosił o codzienny mail (rano, ten sam
// mechanizm co daily-report/weekly-model-report — pg_cron) z krótkim
// podsumowaniem zmian wprowadzonych POPRZEDNIEGO DNIA, po polsku, prostym
// językiem, w trzech kategoriach: "Naprawy", "Nowe funkcje", "Ustalenia".
// Wyraźnie potwierdzone: jeśli nic nie zmieniło się w ostatniej dobie —
// mail w ogóle się NIE wysyła (cisza) — "nie ma po co spalać pieniędzy"
// (koszt AI, choć znikomy, i tak jest kosztem realnym, patrz "Ochrona
// cashflow" w GAKORI_CONTEXT.md).
//
// SKĄD BIERZE TREŚĆ: nie z surowego kodu (git diff całego repo — trudne do
// streszczenia, dużo szumu technicznego), tylko z `GAKORI_CONTEXT.md` —
// pliku, do którego po KAŻDEJ wdrożonej zmianie dopisywany jest ludzki,
// opisowy wpis "POPRAWKA [data]([litera]) — ...". To już jest gotowy,
// PO POLSKU napisany dziennik zmian — ta funkcja tylko wyciąga fragmenty
// FAKTYCZNIE DOPISANE do tego pliku w ostatnich 24 godzinach (przez
// prawdziwe znaczniki czasu commitów w GitHubie, NIE przez parsowanie
// dat wpisanych ręcznie w tekście — te mogą się pomylić/nie zaktualizować,
// prawdziwy czas commita nigdy nie kłamie) i prosi Gemini o posortowanie
// ich na 3 kategorie + streszczenie w prostym języku.
//
// Wymaga NOWEGO sekretu (oprócz tych już istniejących dla daily-report):
// - GITHUB_TOKEN — Personal Access Token z uprawnieniem TYLKO do odczytu
//   zawartości repozytorium areq93/Gakori (Fine-grained token, "Contents:
//   Read-only", zakres ograniczony do TEGO JEDNEGO repozytorium). Właściciel
//   generuje go sam na github.com — nigdy nie jest wpisywany na stałe w
//   kod, tylko jako sekret w Supabase (Dashboard → Edge Functions →
//   Manage secrets), dokładnie tak jak GEMINI_API_KEY/BREVO_API_KEY.
//
// Reużywa istniejących sekretów: CRON_REPORT_SECRET, REPORT_RECIPIENT_EMAIL,
// GEMINI_API_KEY, BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME.
// Ma WYŁĄCZONĄ weryfikację JWT (Edge Functions → daily-changelog-report →
// Settings → "Verify JWT with legacy secret" → OFF) — sama sprawdza
// `x-cron-secret`, dokładnie jak siostrzane funkcje raportowe.

const GITHUB_OWNER = 'areq93'
const GITHUB_REPO = 'Gakori'
const CHANGELOG_FILE_PATH = 'GAKORI_CONTEXT.md'
const GITHUB_API_BASE = 'https://api.github.com'

// Nigdy nie ufamy treści jako "bezpiecznej do wstawienia w HTML" — to
// samo uzasadnienie co w weekly-model-report (fragmenty tekstu, tu
// dodatkowo przepuszczone przez Gemini, ale zasada ostrożności ta sama).
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const CATEGORY_SCHEMA = {
  type: 'object',
  properties: {
    naprawy: { type: 'array', items: { type: 'string' } },
    nowe_funkcje: { type: 'array', items: { type: 'string' } },
    ustalenia: { type: 'array', items: { type: 'string' } },
  },
  required: ['naprawy', 'nowe_funkcje', 'ustalenia'],
}

type Categorized = { naprawy: string[]; nowe_funkcje: string[]; ustalenia: string[] }

Deno.serve(async (req: Request) => {
  const expectedSecret = Deno.env.get('CRON_REPORT_SECRET')
  const gotSecret = req.headers.get('x-cron-secret')
  if (!expectedSecret || gotSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const githubToken = Deno.env.get('GITHUB_TOKEN')
  if (!githubToken) {
    return new Response(JSON.stringify({ error: 'not_configured', details: 'brak GITHUB_TOKEN' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const githubHeaders = {
    Authorization: `Bearer ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'gakori-changelog-bot',
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // 1. Które commity w ostatnich 24h dotknęły GAKORI_CONTEXT.md na branchu
  // main? (main jest zawsze fast-forwardowany do tego samego stanu co
  // branch roboczy — patrz GAKORI_CONTEXT.md, "KOMPLETNOŚĆ WDROŻENIA" —
  // więc main ma zawsze pełną, aktualną historię, bez duplikatów.)
  let commits: Array<{ sha: string }> = []
  try {
    const commitsRes = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?path=${encodeURIComponent(CHANGELOG_FILE_PATH)}&since=${since}&sha=main`,
      { headers: githubHeaders }
    )
    if (!commitsRes.ok) {
      return new Response(
        JSON.stringify({ error: 'github_error', status: commitsRes.status, details: await commitsRes.text() }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    commits = await commitsRes.json()
  } catch (err) {
    return new Response(JSON.stringify({ error: 'github_fetch_failed', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!Array.isArray(commits) || commits.length === 0) {
    // Cisza — brak zmian w ostatniej dobie, zgodnie z wyraźną prośbą
    // właściciela ("nie ma po co spalać pieniędzy").
    return new Response(JSON.stringify({ ok: true, skipped: 'no_commits' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 2. Dla każdego commita wyciągamy WYŁĄCZNIE DOPISANE linie (prefiks "+"
  // w diffie, bez nagłówka "+++") w obrębie GAKORI_CONTEXT.md — to są
  // dokładnie nowe zdania/akapity, które sam dopisałem tego dnia, nie
  // cała reszta pliku.
  let addedText = ''
  for (const c of commits) {
    try {
      const detailRes = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${c.sha}`, {
        headers: githubHeaders,
      })
      if (!detailRes.ok) continue
      const detail = await detailRes.json()
      const file = (detail.files || []).find(
        (f: { filename?: string; patch?: string }) => f.filename === CHANGELOG_FILE_PATH
      )
      if (!file || typeof file.patch !== 'string') continue
      const added = file.patch
        .split('\n')
        .filter((line: string) => line.startsWith('+') && !line.startsWith('+++'))
        .map((line: string) => line.slice(1))
        .join('\n')
      addedText += added + '\n\n'
    } catch {
      // Fail-open na POJEDYNCZYM commicie — jeden nieudany odczyt nie może
      // zepsuć całego raportu, jeśli inne commity dały wystarczająco treści.
    }
  }

  if (!addedText.trim()) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no_added_text' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 3. Gemini sortuje i streszcza — ten sam model co reszta systemu
  // (gemini-3.5-flash-lite), z wymuszoną strukturą JSON (responseSchema),
  // żeby nigdy nie dostać wolnego tekstu zamiast trzech list.
  const geminiKey = Deno.env.get('GEMINI_API_KEY')
  if (!geminiKey) {
    return new Response(JSON.stringify({ error: 'not_configured', details: 'brak GEMINI_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const prompt = `Poniżej surowe fragmenty dopisane WCZORAJ do wewnętrznego dziennika zmian technicznych projektu Gakori (po polsku, bywają techniczne/żargonowe). Właściciel projektu NIE jest programistą. Przygotuj dla niego krótkie podsumowanie — po polsku, prostym, codziennym językiem, bez żargonu.

Podziel WSZYSTKIE opisane zmiany na trzy kategorie:
- "naprawy" — poprawki błędów, coś co wcześniej nie działało dobrze
- "nowe_funkcje" — nowe możliwości, których wcześniej nie było
- "ustalenia" — decyzje/zasady na przyszłość, niekoniecznie zmiana w kodzie (np. "od teraz zawsze robimy X")

Każdy punkt to JEDNO krótkie, jasne zdanie (maks. ok. 20 słów) — bez nazw zmiennych, bez nazw funkcji, bez technicznych szczegółów. Pomiń rzeczy nieistotne dla właściciela (np. czysto techniczne poprawki nazw, refaktoryzacje bez widocznego efektu, weryfikacje składni). Jeśli któraś kategoria jest pusta, zwróć dla niej pustą listę — to normalny, poprawny wynik.

Surowy tekst:
${addedText}`

  let categorized: Categorized
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
            responseSchema: CATEGORY_SCHEMA,
          },
        }),
      }
    )
    const geminiData = await geminiRes.json()
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return new Response(JSON.stringify({ error: 'gemini_error', details: geminiData }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    categorized = JSON.parse(text)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'gemini_failed', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const naprawy = Array.isArray(categorized.naprawy) ? categorized.naprawy : []
  const noweFunkcje = Array.isArray(categorized.nowe_funkcje) ? categorized.nowe_funkcje : []
  const ustalenia = Array.isArray(categorized.ustalenia) ? categorized.ustalenia : []

  if (naprawy.length === 0 && noweFunkcje.length === 0 && ustalenia.length === 0) {
    // Gemini uznało, że nic z wczorajszych wpisów nie jest warte pokazania
    // właścicielowi (np. same techniczne poprawki nazw) — cisza, tak jak
    // przy braku commitów.
    return new Response(JSON.stringify({ ok: true, skipped: 'nothing_relevant' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  function renderSection(title: string, items: string[], color: string): string {
    if (items.length === 0) return ''
    const lis = items.map((item) => `<li style="margin-bottom:6px;color:#374151;">${escapeHtml(item)}</li>`).join('')
    return `<div style="margin-bottom:18px;">
  <div style="font-weight:700;color:${color};font-size:15px;margin-bottom:6px;">${escapeHtml(title)}</div>
  <ul style="margin:0;padding-left:20px;">${lis}</ul>
</div>`
  }

  const dateStr = new Date().toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })
  const htmlContent = `<p style="font-size:16px;color:#111827;">Hej! Oto, co zmieniło się w Gakori wczoraj — ${dateStr}.</p>
${renderSection('🔧 Naprawy', naprawy, '#b45309')}
${renderSection('✨ Nowe funkcje', noweFunkcje, '#15803d')}
${renderSection('📌 Ustalenia', ustalenia, '#1d4ed8')}
<p style="color:#9ca3af;font-size:12px;margin-top:20px;">Ten raport wysyła się automatycznie, TYLKO w dni, gdy coś się zmieniło. Wygenerowała go funkcja daily-changelog-report.</p>`

  const brevoKey = Deno.env.get('BREVO_API_KEY')
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
  const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'Gakori — raport'
  const recipient = Deno.env.get('REPORT_RECIPIENT_EMAIL')

  if (!brevoKey || !senderEmail || !recipient) {
    return new Response(JSON.stringify({ error: 'not_configured', details: 'brak sekretów Brevo/adresata' }), {
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
      subject: `Gakori — co się zmieniło (${dateStr})`,
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
