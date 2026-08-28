// GAKORI — Edge Function "record-view"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// POPRAWKA 2026-08-28(za) — "Wyświetlono X razy" na scan.html dawniej
// liczyło się WYŁĄCZNIE przy trafieniu w cache w `analyze/index.ts` (czyli
// przy PONOWNEJ ANALIZIE identycznej treści), NIGDY przy zwykłym otwarciu
// strony z wynikiem — zgłoszone przez właściciela jako niezgodne z
// oczekiwaniem: licznik ma rosnąć, gdy RÓŻNE osoby (adresy IP) po prostu
// OGLĄDAJĄ wynik, niezależnie od tego, czy ktokolwiek go w międzyczasie
// analizuje ponownie. `scan.html` woła tę funkcję raz przy każdym
// otwarciu strony z wynikiem (patrz tamtejszy kod).
//
// Odcisk adresu IP (NIGDY surowy adres — ten sam mechanizm i uzasadnienie
// co `hashIp()`/`link_view_confirmations` w `analyze/index.ts`) trafia do
// `scan_view_ips`, z ograniczeniem UNIQUE (scan_id, ip_hash) — ten sam
// adres IP wracający wielokrotnie liczy się jako JEDNO wyświetlenie.
// Faktyczne zwiększenie `scans.view_count` dzieje się w bazie, automatycznie,
// przez trigger na tej tabeli (patrz SQL migracji w GAKORI_CONTEXT.md) —
// dzięki temu jest atomowe (bez ryzyka wyścigu przy równoczesnych
// wyświetleniach) i ta funkcja nie musi nic osobno doliczać.
//
// Świadomie fail-open na każdym możliwym błędzie — licznik wyświetleń to
// czysto kosmetyczna funkcja, jej awaria NIGDY nie może przeszkodzić w
// wyświetleniu samego wyniku analizy.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function hashIp(req: Request): Promise<string | null> {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : null
  if (!ip) return null
  const bytes = new TextEncoder().encode(ip)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const scanId = typeof body?.scan_id === 'string' ? body.scan_id : null
    if (!scanId) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ipHash = await hashIp(req)
    if (ipHash) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      // `ignoreDuplicates` — drugie i kolejne wyświetlenie z tego samego IP
      // po cichu nic nie robi (UNIQUE (scan_id, ip_hash) w bazie), trigger
      // się wtedy w ogóle nie odpala, więc `view_count` nie rośnie.
      await supabase
        .from('scan_view_ips')
        .upsert({ scan_id: scanId, ip_hash: ipHash }, { onConflict: 'scan_id,ip_hash', ignoreDuplicates: true })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    // Fail-open — patrz komentarz na górze pliku. Zwracamy 200 z ok:false,
    // NIE 500 — frontend i tak ignoruje odpowiedź tej funkcji.
    console.error('record-view: nieoczekiwany błąd', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
