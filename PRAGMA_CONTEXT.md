# Pragma — kontekst projektu

Ten plik jest **jedynym trwałym źródłem prawdy** o projekcie, niezależnym od
jakiejkolwiek pojedynczej rozmowy z Claude. Rozmowy się kończą albo się
streszczają, gdy się wydłużą — ten plik zostaje w repozytorium. Każda
większa zmiana w projekcie powinna kończyć się aktualizacją tego pliku, w
tym samym PR-ze co reszta zmian.

Jeśli zaczynasz nową rozmowę z Claude o tym projekcie — zacznij od
przeczytania tego pliku w całości, zanim zaczniesz cokolwiek zmieniać.

## Co to jest Pragma

PWA (aplikacja webowa instalowalna jak apka), która analizuje tekst, link
albo (docelowo) obraz i mówi użytkownikowi, prostym językiem, czy ktoś
próbuje nim manipulować — wykrywa konkretne techniki (fałszywa pilność,
dowód społeczny, sztuczny niedobór, argument z autorytetu, strach przed
utratą itd.) i ocenia treść w skali 0-100.

Właściciel projektu (Arkadiusz Śmietański) **nie jest programistą** —
wszystkie wyjaśnienia w rozmowie muszą być proste, nietechniczne, po
polsku, bez żargonu.

## Jak wdrażać zmiany — NAJWAŻNIEJSZA SEKCJA

To jest źródło większości dotychczasowych problemów w projekcie (rzeczy
"nie działały", bo nie zostały faktycznie wdrożone) — czytaj uważnie.

### Frontend (pliki `.html`, `.css`, `.js`, `manifest.json`)

Strona wygląda na serwowaną bezpośrednio z brancha **`main`** tego
repozytorium (brak w repo jakiegokolwiek pliku CI/CD, workflow, `vercel.json`
czy `netlify.toml` — więc najpewniej GitHub Pages w trybie "Deploy from a
branch"). W praktyce: **zmiana jest widoczna na żywo dopiero po scaleniu
(merge) Pull Requesta do `main`.** Sam `git push` na branch roboczy nic nie
zmienia na żywej stronie.

Standardowy cykl pracy:
1. Zmiany robione na branchu `claude/jwt-verification-analyze-0yfmpi`
   (branch roboczy Claude Code dla tego repo).
2. `git push`, potem Pull Request do `main`.
3. **Merge PR-a do `main`** — dopiero to publikuje zmianę.
4. Użytkownik robi twarde odświeżenie strony (Ctrl+Shift+R), żeby ominąć
   ewentualny stary Service Worker/cache przeglądarki.

Jeśli branch roboczy ma już scalony (zamknięty, `merged: true`) PR, kolejna
praca powinna zacząć się od zresetowania brancha do najnowszego `main`
(`git fetch origin main && git checkout -B claude/jwt-verification-analyze-0yfmpi origin/main`),
a nie od kontynuowania na starej bazie.

### Backend (`supabase/functions/analyze/index.ts`)

**Merge do `main` NIE wdraża backendu.** To osobna, ręczna czynność:
Supabase Dashboard → Edge Functions → `analyze` → wklejenie całej
zawartości pliku → przycisk **Deploy**. Nie ma tu CLI ani Dockera — świadomie,
z wyboru użytkownika.

Zasada robocza ustalona z użytkownikiem: **zawsze podawaj całą, aktualną
zawartość pliku** do wklejenia (nie diff/fragment) — użytkownik podmienia
całość w edytorze Supabase. Był już incydent, w którym w Dashboardzie
wisiał stary kod mimo kilku rund zmian w repo — dlatego zawsze warto
jawnie przypomnieć o tym kroku i, w razie wątpliwości, po prostu wkleić
plik na nowo, nawet jeśli "powinien" już być aktualny.

### Baza danych (Supabase Postgres)

Migracje SQL (`ALTER TABLE`, itp.) też są ręczne — użytkownik uruchamia je
sam w Supabase SQL Editor. Gdy kod wymaga nowej kolumny/tabeli, podaj
gotowe zapytanie SQL do wklejenia i poproś o potwierdzenie wykonania,
zanim założysz, że działa.

## Struktura plików (frontend, bez build stepu — czysty HTML/CSS/JS)

- `index.html` — strona główna: logowanie/rejestracja, karta analizy
  (Link/Tekst/Obraz), przeglądarka publicznych analiz z wyszukiwarką,
  karta wyniku.
- `account.html` — osobna podstrona zarządzania kontem (wylogowanie, zmiana
  hasła, wybór języka aplikacji). Wymaga sesji — przekierowuje do
  `index.html`, jeśli użytkownik nie jest zalogowany.
- `scan.html` — publiczna podstrona pojedynczej analizy (`?id=...`),
  dostępna bez logowania, link docelowy z listy publicznych analiz.
- `i18n.js` — słownik tłumaczeń interfejsu (10 języków) + mechanizm
  przełączania języka. Ładowany na wszystkich trzech stronach HTML.
- `style.css` — wspólny styl (ciepła, "papierowa" estetyka, czytelna dla
  każdego wieku — świadomie, po kilku iteracjach, odejście od
  "surowego"/generycznego wyglądu).
- `sw.js` — Service Worker (PWA offline + cache).
- `manifest.json`, `icon-192.png`, `icon-512.png` — standardowe pliki PWA.
- `supabase/functions/analyze/index.ts` — jedyny backend: Deno Edge
  Function wywoływana przez frontend, rozmawia z Gemini API i z bazą.

## Zaimplementowane funkcje (stan na dziś)

- **Logowanie**: e-mail/hasło (z potwierdzeniem mailowym), Google OAuth,
  reset/zmiana hasła, CAPTCHA (Cloudflare Turnstile) chroniąca przed
  masowym zakładaniem kont. E-mail transakcyjny: Brevo (SMTP, darmowy
  plan na stałe — świadomie wybrany zamiast SendGrid, który pokazywał
  banner "Trial").
- **Weryfikacja tożsamości w backendzie**: prawdziwy JWT z nagłówka
  `Authorization`, weryfikowany przez `supabase.auth.getUser()` — nie ma
  już zaufania do `user_id` przesyłanego wprost w body zapytania.
- **Analiza tekstu i linków**: link analizowany przez wbudowane w Gemini
  API narzędzie **URL Context** (`tools: [{ urlContext: {} }]`) — model
  sam pobiera i czyta stronę, bez własnego scrapera. Obraz: jeszcze nie
  zaimplementowany (`input_type: "image"` zwraca `501 not_implemented`).
- **Wiele wzorców manipulacji na analizę**: `result.patterns` to lista
  `{name, quote, explanation}`, nie pojedynczy wynik. Stare, już
  zcache'owane analizy mają starą strukturę (`source_quote`) — frontend
  obsługuje oba warianty (nigdy nie zostaną przeliczone).
- **Przeglądarka publicznych analiz**: lista klikalnych wierszy (ikona
  typu źródła + odznaka wyniku + skrócony cytat), wyszukiwanie po słowach
  kluczowych w czasie rzeczywistym (debounce, sanityzacja wejścia przed
  wstawieniem do filtra PostgREST), okno ograniczone do ~6 wierszy z
  suwakiem, klik prowadzi do `scan.html?id=...`. Widoczna zawsze (i dla
  zalogowanych, i dla niezalogowanych) — celowa decyzja: to mechanizm
  wzrostu/odkrywalności o zerowym koszcie krańcowym (czyta się z już
  policzonego, współdzielonego cache'u, bez wywoływania Gemini).
- **Wielojęzyczność (10 języków)**: PL, EN, ES, DE, FR, RU, ZH, JA, HI, AR.
  Domyślny język: **angielski**. Obejmuje cały interfejs ORAZ wynik
  analizy AI (`name`/`explanation`/`summary` w wybranym języku; pole
  `quote` zawsze zostaje w oryginalnym języku analizowanego tekstu — to
  jedyny świadomy wyjątek, nigdy nie jest tłumaczone).
  - Wybór języka możliwy: na ekranie logowania (przed założeniem konta),
    przy rejestracji (wybrany wcześniej język ma pierwszeństwo nad
    domyślną wartością z bazy przy pierwszym logowaniu — dla e-maila przez
    metadane konta ustawione w `signUp()`, dla Google przez
    `sessionStorage` ustawiony tuż przed przekierowaniem), oraz w panelu
    konta (trwałe, zapisane w `profiles.language`, synchronizowane między
    urządzeniami).
  - Cache analiz (`scans`) jest kluczowany po `content_hash` **oraz**
    `language` — bez tego dwie osoby analizujące tę samą treść w różnych
    językach dostawałyby nawzajem swój (błędny językowo) wynik z cache'u.
    Przeglądarka publicznych analiz filtruje wyniki po aktualnym języku
    interfejsu z tego samego powodu.
- **Model AI**: `gemini-3.5-flash-lite` (świadomy wybór — prosta
  klasyfikacja tekstu nie potrzebuje droższego "pełnego" Flash
  zoptymalizowanego pod kodowanie/zadania agentowe).

## Baza danych — znane tabele (zrekonstruowane z kodu, nie z osobnego
## pliku schematu w repo — jeśli coś tu nie zgadza się z rzeczywistością
## w Supabase, wierz Supabase, nie temu opisowi)

**`profiles`** (1:1 z `auth.users`, klucz `id`):
- `id` (uuid)
- `wallet_balance` (numeric) — saldo kredytów
- `language` (text, `NOT NULL DEFAULT 'en'`) — ustawienie języka konta

**`scans`** (współdzielony cache analiz, publiczny odczyt w RLS):
- `id`, `content_hash` (klucz cache'u treści), `input_type` (`text`/`url`/
  `image`), `language` (text, `NOT NULL DEFAULT 'en'` — **razem z
  `content_hash` tworzy właściwy klucz cache'u**), `source_url`,
  `char_count`, `credits_charged`, `result` (jsonb — patrz struktura
  wyniku wyżej), `discovered_by` (uuid, nullable — kto pierwszy
  wygenerował ten wynik), `view_count`, `created_at`

**`wallet_transactions`**:
- `user_id`, `amount`, `type` (np. `spend`), `related_scan_id`

RLS: `scans` ma publiczny odczyt (używane przez niezalogowanych w
przeglądarce publicznych analiz i na `scan.html`). Zapis do `scans`/
`profiles`/`wallet_transactions` idzie przez `service_role` w Edge
Function (backend), nie bezpośrednio z przeglądarki.

## Cennik (do skalibrowania na realnych danych — na razie przybliżenia)

- Tekst: `FIXED_FEE (2) + ceil(char_count / 1000) * MULTIPLIER (1)`.
- Link: płaska stawka `URL_SCAN_COST = 6` — długości strony nie znamy
  przed wywołaniem Gemini, więc nie da się wycenić dokładnie; analiza
  linku wymaga zawsze konta (nie ma trybu anonimowego dla linków, żeby
  ktoś nie wygenerował dużego kosztu API za darmo, podając link do
  ogromnej strony).
- Pierwszy skan anonimowy (tylko tryb tekstowy): darmowy do
  `ANONYMOUS_MAX_CHARS = 3000` znaków.

## Ważne wzorce bezpieczeństwa (nie usuwać/omijać przy zmianach)

- **Zero zaufania do `user_id` z body zapytania** — tożsamość zawsze z
  weryfikacji JWT (`supabase.auth.getUser(token)`).
- **`.innerText`/`textContent`, nigdy `.innerHTML`** dla jakiejkolwiek
  treści z bazy/AI wyświetlanej publicznie (ochrona przed XSS — treść
  mogła pochodzić od dowolnego użytkownika).
- **Sanityzacja wejścia wyszukiwarki** przed wstawieniem do filtra
  PostgREST (`sanitizeSearchQuery()`) — ochrona przed wstrzyknięciem
  dodatkowych warunków zapytania.
- **Prompt injection**: system prompt do Gemini jawnie instruuje, żeby
  traktować analizowaną treść wyłącznie jako dane do oceny, nigdy jako
  polecenia — próby typu "zignoruj poprzednie instrukcje" mają być
  ocenione jako kolejny wykryty wzorzec manipulacji.
- **Bezpieczne linki na `scan.html`**: `source_url` renderuje się jako
  klikalny link tylko, gdy pasuje do `^https?:\/\//i` (ochrona przed
  `javascript:` jako "źródłem").

## Pułapki, w które już raz wpadliśmy (żeby się nie powtórzyły)

- **Service Worker cache**: przy każdej zmianie pliku, który jest w
  `ASSETS` (precache) w `sw.js`, trzeba pamiętać o podbiciu `CACHE_NAME`.
  Kilka PR-ów z rzędu o tym zapomniało, co skutkowało tym, że użytkownicy
  utknęli ze starą wersją `style.css` mimo kilku wdrożeń. Rozwiązanie
  systemowe (nie tylko dyscyplina pamiętania): pliki `.html`, `.css`,
  `.js` i `manifest.json` są na strategii **network-first** (zawsze
  próbują pobrać świeżą wersję z sieci, cache tylko jako fallback offline)
  — tylko ikony zostały na cache-first.
- **bfcache** (przeglądarkowy "zamrożony" powrót przyciskiem Wstecz) może
  przywrócić nieaktualny stan DOM (np. pustą listę bez suwaka) —
  nasłuchujemy `pageshow` z `event.persisted === true` i wymuszamy
  ponowne wyrenderowanie.
- **Cache treści bez uwzględnienia języka** (opisane wyżej) — złapane i
  naprawione zanim trafiło na produkcję, ale to dobry przykład tego, jak
  łatwo przeoczyć wpływ nowej funkcji (języki) na starszą funkcję (cache).
- **"Wdrożone" ≠ "scalone do main" ≠ "backend wdrożony w Supabase"** — to
  trzy osobne, ręczne kroki. Nieporozumienie co do tego było źródłem co
  najmniej dwóch sesji dezorientacji ("zrobiłem, a nic się nie zmieniło").

## Świadomie odłożone na później (nie budować bez wyraźnej prośby)

- Własna domena (naprawiłoby to markowanie Google OAuth pokazujące surową
  domenę Supabase, i brzydki adres nadawcy Brevo przy odbiciach) —
  użytkownik: "jeszcze nie".
- Analiza obrazu/PDF.
- Ekran intencji zakupowej (Fake Door test).
- Obniżanie darmowego bonusu powitalnego / limity rejestracji po IP w
  Supabase — świadomie odłożone (zasada Lean Startup: nie buduj obrony
  przed zagrożeniem, które się jeszcze nie zmaterializowało).

## Zasady współpracy w tym projekcie

- Właściciel nie jest programistą — tłumaczenia zawsze proste, po
  polsku, bez żargonu, z analogiami.
- Rozmowa prowadzona jest po polsku — nawet gdy treść w kodzie/UI jest
  po angielsku (np. domyślny język aplikacji), **rozmowa z użytkownikiem
  zawsze zostaje po polsku**, chyba że wyraźnie poprosi inaczej.
- Decyzje produktowe warto rozważać przez pryzmat myślenia systemowego
  (zasoby/przepływy, sprzężenia zwrotne wzmacniające i równoważące,
  "zawory bezpieczeństwa") — użytkownik świadomie przyjął tę ramę do
  podejmowania decyzji.
- Zawsze podawaj **całą** zaktualizowaną zawartość plików wymagających
  ręcznego wdrożenia (backend, migracje SQL) — nie fragmenty/diffy.
- Po każdej większej zmianie: zaktualizuj ten plik (`PRAGMA_CONTEXT.md`)
  w tym samym PR-ze, żeby nie stał się nieaktualny.
