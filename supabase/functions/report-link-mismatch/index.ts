// GAKORI — Edge Function "report-link-mismatch"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// Obsługuje przycisk "Zgłoś niezgodność z treścią źródła" (patrz
// index.html/scan.html) — punkt 5 audytu bezpieczeństwa, "Zaufanie do
// ręcznie wklejonych linków". Pełne uzasadnienie architektury (co
// odrzuciliśmy po drodze i dlaczego — kary, próg "2 niezależnych
// zgłoszeń" z porównaniem przez Gemini, płaski próg=3 zgłoszeń) — patrz
// GAKORI_CONTEXT.md.
//
// POPRAWKA 2026-08-23(a) — punkt B dużego pakietu poprawek. Zgłoszenie
// NIE kasuje już nic (dawne "ciche potwierdzenia" zostają — historia się
// nie zeruje). Zamiast tego liczymy PROCENT: ile z osób, które faktycznie
// obejrzały tę treść (`link_view_confirmations`, liczone bez podwójnego
// liczenia tej samej osoby — patrz `analyze/index.ts`), zgłosiło
// niezgodność (`link_mismatch_reports`, jedno zgłoszenie na konto). Przy
// MINIMUM 50 wyświetleń i CO NAJMNIEJ 20% zgłoszeń treść jest automatycznie
// oznaczana jako wycofana (`scans.retracted = true`) i znika z cache'u oraz
// mechanizmu ratunkowego (patrz `analyze/index.ts`) — CAŁKOWICIE
// automatycznie, bez żadnego ręcznego przeglądu (świadoma decyzja
// właściciela — nie ma czasu na ręczne moderowanie).
//
// ŚWIADOMIE bez żadnych kar dla zgłaszającego ani dla wklejającego —
// zgłoszenie to tylko sygnał, nie oskarżenie. Nie musimy wiedzieć, kto ma
// rację, żeby to zadziałało — potrzeba realnej liczby różnych osób.
//
// Wymaga zalogowania (JWT z nagłówka Authorization) — inaczej zgłoszenie
// nie miałoby do czego przypisać ograniczenia "raz na osobę na wynik"
// (UNIQUE (scan_id, reporter_user_id) w bazie).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Te same liczby co po stronie `analyze/index.ts` (dokumentacja w
// GAKORI_CONTEXT.md) — świadomie "na sztywno" tu drugi raz, bo to osobna
// funkcja wdrażana osobno; gdyby kiedyś trzeba było ją zmienić, zmienić w
// obu miejscach.
const RETRACTION_MIN_VIEWS = 50
const RETRACTION_MIN_RATIO = 0.2

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

    // POPRAWKA 2026-08-26(k) — dawniej zgłoszenie miało sens WYŁĄCZNIE dla
    // treści oznaczonej jako pochodząca z ręcznego wklejenia
    // (`is_manual_source`) — ale przycisk "Zgłoś niezgodność" na scan.html
    // jest teraz widoczny dla KAŻDEJ analizy linku (patrz tamtejsza
    // POPRAWKA), więc backend musi akceptować to samo, szersze grono —
    // inaczej przycisk widoczny, ale nieużywalny (żywy błąd zgłoszony przez
    // właściciela: kliknięcie dawało błąd dla zwykłej analizy linku, bo ta
    // funkcja wciąż odrzucała wszystko poza `is_manual_source`).
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('id, is_manual_source, input_type, retracted')
      .eq('id', scanId)
      .maybeSingle()
    if (scanError || !scan || !(scan.is_manual_source || scan.input_type === 'url')) {
      return new Response(JSON.stringify({ error: 'not_reportable' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // UNIQUE (scan_id, reporter_user_id) w bazie — jedno konto może
    // zgłosić dany wynik tylko raz. Drugie zgłoszenie tej samej osoby po
    // prostu nic nowego nie zmienia (traktujemy je jako sukces, nie błąd) —
    // stąd sprawdzamy `insertError?.code`, żeby odróżnić "już zgłoszone"
    // (kod 23505, naruszenie unikalności) od prawdziwego błędu zapisu.
    const { error: insertError } = await supabase
      .from('link_mismatch_reports')
      .insert({ scan_id: scanId, reporter_user_id: user.id })

    if (insertError && insertError.code !== '23505') {
      return new Response(JSON.stringify({ error: 'save_failed', details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Procentowe automatyczne wycofanie (punkt B audytu bezpieczeństwa) —
    // przeliczamy PRZY KAŻDYM zgłoszeniu (także powtórnym z tego samego
    // konta, na wypadek gdyby wcześniejsze przeliczenie z jakiegoś powodu
    // nie doszło do skutku — liczenie od zera jest tanie i bezpieczne).
    if (!scan.retracted) {
      const { count: viewCount } = await supabase
        .from('link_view_confirmations')
        .select('*', { count: 'exact', head: true })
        .eq('scan_id', scanId)
      const { count: reportCount } = await supabase
        .from('link_mismatch_reports')
        .select('*', { count: 'exact', head: true })
        .eq('scan_id', scanId)

      const views = viewCount ?? 0
      const reports = reportCount ?? 0
      if (views >= RETRACTION_MIN_VIEWS && reports / views >= RETRACTION_MIN_RATIO) {
        await supabase.from('scans').update({ retracted: true }).eq('id', scanId)
      }
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
