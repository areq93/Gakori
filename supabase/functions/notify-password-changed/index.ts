// PRAGMA — Edge Function "notify-password-changed"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
// Wywoływana z account.html od razu po udanej zmianie hasła w panelu
// zalogowanego użytkownika (sb.auth.updateUser({ password })). Wysyła
// e-mail z potwierdzeniem, żeby użytkownik wiedział, że hasło się
// zmieniło, nawet jeśli to nie on to zrobił.
//
// Wymaga trzech sekretów w Supabase (Dashboard → Edge Functions → Manage
// secrets), OSOBNYCH od tych, które Supabase już ma do swoich WŁASNYCH
// maili (potwierdzenie rejestracji, odzyskiwanie hasła) — tam Supabase
// samo wysyła maile przez Brevo w tle po SMTP. Tu nasz kod sam prosi
// Brevo o wysłanie maila, więc potrzebuje własnego klucza:
// - BREVO_API_KEY — z Brevo: ikona koła zębatego → SMTP & API → API Keys
// - BREVO_SENDER_EMAIL — zweryfikowany w Brevo adres nadawcy
// - BREVO_SENDER_NAME — nazwa nadawcy widoczna w skrzynce odbiorcy (opcjonalnie,
//   domyślnie "Zespół Pragma")

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

    // Tożsamość WYŁĄCZNIE z tokenu JWT — ta sama zasada zera zaufania do
    // przeglądarki, co w analyze/index.ts. Nikt nie może poprosić o wysłanie
    // tego maila w cudzym imieniu, bo i tak wyślemy go na adres właściciela
    // tokenu, nigdy na adres podany w treści zapytania.
    const authHeader = req.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : ''
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)
    if (authError || !user || !user.email) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    const username = profile?.username || user.email.split('@')[0]

    const brevoKey = Deno.env.get('BREVO_API_KEY')
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
    const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'Zespół Pragma'

    if (!brevoKey || !senderEmail) {
      return new Response(
        JSON.stringify({ error: 'not_configured', message: 'Brak BREVO_API_KEY lub BREVO_SENDER_EMAIL w sekretach.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ten sam ton i format co pozostałe maile Pragmy (potwierdzenie
    // rejestracji, odzyskiwanie hasła) — bezpośrednie zwrócenie się po
    // nazwie użytkownika, krótko, ciepło, bez żargonu.
    const htmlContent = `<p>Cześć, ${username}!</p>
<p>Dajemy Ci znać, że hasło do Twojego konta w Pragmie zostało właśnie zmienione.</p>
<p>Jeśli to Twoja zmiana — świetnie, nie musisz nic robić.</p>
<p>Jeśli to NIE Twoja zmiana, jak najszybciej zaloguj się do Pragmy i skorzystaj z opcji "Zapomniałeś hasła?", żeby odzyskać dostęp do konta.</p>
<p>Dziękujemy, że jesteś z nami od samego początku.<br>Zespół Pragma</p>`

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: user.email, name: username }],
        subject: 'Twoje hasło w Pragmie zostało zmienione',
        htmlContent,
      }),
    })

    if (!brevoRes.ok) {
      const details = await brevoRes.text()
      return new Response(JSON.stringify({ error: 'brevo_error', details }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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
