# Pragma — kontekst projektu

Ten plik jest **jedynym trwałym źródłem prawdy** o projekcie, niezależnym od
jakiejkolwiek pojedynczej rozmowy z Claude. Rozmowy się kończą albo się
streszczają, gdy się wydłużą — ten plik zostaje w repozytorium. Każda
większa zmiana w projekcie powinna kończyć się aktualizacją tego pliku, w
tym samym PR-ze co reszta zmian.

Jeśli zaczynasz nową rozmowę z Claude o tym projekcie — zacznij od
przeczytania tego pliku w całości, zanim zaczniesz cokolwiek zmieniać.

## Komenda: „zaktualizuj PRAGMA_CONTEXT.md”

Gdy użytkownik napisze tę frazę (np. widząc, że pasek kontekstu rozmowy
się zapełnia, albo po prostu chcąc zrobić checkpoint) — to sygnał do
wykonania, bez dodatkowych pytań, następujących kroków:

1. Przejrzyj historię commitów od czasu ostatniej aktualizacji tego pliku
   (`git log` na branchu roboczym i na `main`) oraz przebieg bieżącej
   rozmowy — wypisz, co zmieniło się w projekcie: nowe funkcje, nowe
   decyzje, nowy dług techniczny, nowe pułapki, zmiany w schemacie bazy.
2. Zaktualizuj odpowiednie sekcje tego pliku (punktowo, nie przepisuj
   całości od zera) tak, żeby dokładnie odzwierciedlał obecny stan
   projektu.
3. Commit, push na branch roboczy, PR do `main`, merge — dokładnie tak
   samo jak przy każdej innej zmianie w repo (to plik jak każdy inny,
   zmiana czysto dokumentacyjna, niskie ryzyko).
4. Krótko potwierdź użytkownikowi, co zaktualizowałeś (kilka zdań, nie
   cała treść pliku).

Nie czekaj na tę komendę, żeby aktualizować plik przy okazji naturalnych
punktów kontrolnych (koniec większej funkcji) — patrz "Zasady
współpracy" niżej. Komenda jest na wypadek, gdy użytkownik chce
świadomego checkpointu w dowolnym momencie, niezależnie od tego, czy coś
większego właśnie się skończyło.

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
  "surowego"/generycznego wyglądu). Jedna czcionka na całej stronie —
  'Inter' (sans-serif). Wcześniej nagłówki (`h1`/`h2`) używały ozdobnego
  szeryfu 'Lora' — usunięte na wyraźną prośbę użytkownika, który go nie
  lubił; import czcionki Lora usunięty też z linków Google Fonts w
  `index.html`/`account.html`/`scan.html`, żeby nie ładować niepotrzebnie
  czcionki, której nic już nie używa.
- `sw.js` — Service Worker (PWA offline + cache).
- `manifest.json`, `icon-192.png`, `icon-512.png` — standardowe pliki PWA.
- `supabase/functions/analyze/index.ts` — jedyny backend: Deno Edge
  Function wywoływana przez frontend, rozmawia z Gemini API i z bazą.
  (Była też druga funkcja, `translate-scan`, do dotłumaczania listy
  publicznych analiz przy samym przeglądaniu — świadomie usunięta,
  patrz niżej "Ponowne użycie przez tłumaczenie".)

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
  - **Awaryjne pobranie strony (`fetchUrlAsText()`)**: niektóre strony
    (np. duże portale newsowe typu onet.pl) odrzucają robota Google z
    ogólnym kodem `URL_RETRIEVAL_STATUS_ERROR` — bez podania konkretnego
    powodu. Gdy tak się stanie, backend sam pobiera stronę bezpośrednio
    (nagłówki jak z przeglądarki), zdejmuje znaczniki HTML "na surowo" —
    to samo w sobie NIE jest inteligentny ekstraktor treści (może złapać
    menu/stopkę razem z artykułem) — ale zanim ten surowy tekst trafi do
    właściwej analizy, przechodzi jeszcze przez `siftFallbackText()`
    (patrz "Kaskada dwuetapowa" wyżej), które go czyści z szumu. Jeśli i to
    się nie uda (np. strona ma prawdziwą ochronę typu
    Cloudflare/JS-challenge, nie tylko blokadę po nazwie robota) — dopiero
    wtedy użytkownik widzi błąd `url_fetch_failed`. Prawdziwy powód
    (`retrievalStatus` z Gemini) trafia do pola `details` w odpowiedzi,
    widocznego tylko w panelu debugowania frontendu (`?debug=1`).
- **Wiele wzorców na analizę + typ + praktyczna podpowiedź**: `result.patterns`
  to lista `{pattern_type, name, quote, explanation, tip}`, nie pojedynczy
  wynik. Stare, już zcache'owane analizy mają starszą strukturę (część ma
  `source_quote` zamiast `patterns`, część ma `patterns` bez `pattern_type`/
  `tip`) — frontend (`scan.html`) obsługuje wszystkie warianty (nigdy nie
  zostaną przeliczone, brak `pattern_type` traktowany jako `manipulation`,
  brak `tip` po prostu nie pokazuje tej sekcji).
  - `pattern_type`: `"manipulation"` (wzorzec manipulacji/błąd poznawczy) albo
    `"reasoning"` (trafny, wartościowy sposób rozumowania — Pragma ma
    aktywnie szukać OBU typów, nie tylko manipulacji, patrz sekcja o 100
    modelach mentalnych wyżej). Wartość NIE jest tłumaczona (zawsze
    angielskie słowo), frontend mapuje ją na etykietę przez i18n
    (`pattern_tag_manipulation`/`pattern_tag_reasoning`) i inny kolor
    obramowania (czerwony/pomarańczowy vs niebieski).
  - `tip`: krótka, PRAKTYCZNA podpowiedź "co teraz zrobić" (sprawdź,
    poszukaj, odczekaj) — **świadomie NIGDY oceniająca** ("ufaj"/"nie
    ufaj"/"dobre"/"złe"/"wiarygodne"). To ważna, przemyślana granica: gdyby
    Pragma zaczęła wydawać takie werdykty (nawet przy `pattern_type:
    "reasoning"`), sama stałaby się tym, przed czym ostrzega (Argument z
    Autorytetu — "wierz, bo brzmi rzetelnie"). Zasada ustalona z
    użytkownikiem wprost: **nie zaspokajamy ludzkiej potrzeby "łatwego
    wyroku" wyrokiem, tylko konkretną czynnością do wykonania** — to buduje
    nawyk samodzielnego myślenia, nie zastępuje go.
  - **Wygląd wyniku na `scan.html`**: każdy wzorzec to osobna, wyraźnie
    odgraniczona ramka (`pattern-item`) z kolorowym paskiem po lewej
    (czerwony/pomarańczowy dla `manipulation`, niebieski dla `reasoning`),
    małą etykietą typu, nazwą, cytatem, wyjaśnieniem i (jeśli jest) ramką
    z podpowiedzią "Co teraz zrobić". Źródło (link) ma własne, odznaczone
    tłem pole (`scan-source-box`). Podsumowanie jest oddzielone linią i
    małym nagłówkiem "Podsumowanie" (`summary-block`) na dole. Style w
    `style.css` — jeśli dodajesz nowe pole do wyniku, trzymaj się tego
    samego wzorca (osobna, podpisana sekcja, nie gołe zdanie wtopione w
    resztę tekstu).
- **Styl wizualny "Retro plakat"**: grube (2px), zawsze ciemne/jasne w
  zależności od motywu obramowania kart i przycisków, płaskie przesunięte
  cienie "jak u naklejki" (`--sticker-shadow`, `--sticker-shadow-sm`),
  zaokrąglone rogi (`--radius`, `--radius-sm`). Wybrany przez użytkownika
  spośród 3 zaproponowanych wariantów retro (pokazanych jako zrzuty ekranu
  do porównania — dobra metoda przy tego typu decyzjach: łatwiej wskazać
  wariant niż opisać słowami). Jedna czcionka na całej stronie — 'Inter'
  (wcześniej nagłówki miały ozdobny szeryf 'Lora', usunięty na wcześniejszą
  prośbę użytkownika). Wszystkie kolory/rozmiary jako zmienne CSS w
  `:root` na górze `style.css` — zmieniaj tam, nie w poszczególnych regułach.
- **Motyw jasny/ciemny**: przełącznik w ustawieniach konta
  (`account.html`, selektor obok języka), ten sam wzorzec zapisu co język —
  `localStorage` (`pragma_theme`, działa też dla niezalogowanych) + kolumna
  `profiles.theme` dla zalogowanych (synchronizacja między urządzeniami).
  Funkcje w `i18n.js`: `getCurrentTheme()`, `applyTheme()`, `setTheme()`,
  `syncThemeFromProfile()` — analogiczne do `getCurrentLanguage()` itd.
  Motyw przełącza się atrybutem `data-theme="dark"` na `<html>`, a
  `style.css` ma pod `:root[data-theme="dark"]` nadpisane te same zmienne
  CSS, których używa reszta pliku (więc każda reguła korzystająca ze
  zmiennych automatycznie działa w obu motywach — nowe style pisz ZAWSZE
  przez zmienne, nigdy na sztywno wpisanym kolorem, inaczej zepsujesz
  dark mode).
  - **Ważne — zapobieganie "błyskowi" złego motywu**: w `<head>` każdej z
    3 stron HTML jest mały, samodzielny inline `<script>` (przed linkiem do
    `style.css`), który synchronicznie odczytuje `localStorage` i ustawia
    `data-theme` na `<html>` ZANIM przeglądarka narysuje stronę. Bez tego
    strona zawsze najpierw mignęłaby jasnym motywem, nawet dla kogoś z
    ustawionym ciemnym. Funkcje w `i18n.js` (`applyTheme()` itd.) tylko
    PODTRZYMUJĄ/ZMIENIAJĄ motyw po starcie strony — nie odpowiadają za to
    pierwsze, natychmiastowe ustawienie.
  - **Ważna lekcja projektowa — NIE odwracaj po prostu kolorów**: pierwsza
    wersja trybu ciemnego robiła dokładnie to (ciemne tło ↔ jasne, prawie
    białe obramowanie kart) — użytkownik trafnie ocenił, że wygląda to jak
    "negatyw zdjęcia", nie jak przemyślany ciemny motyw. Poprawiona wersja
    ("Nocny plakat") ma PRZYGASZONE, matowe, brązowawe obramowanie
    (`--card-border: #6b5c42`), nie jaskrawą biel — nadal widoczne na
    ciemnym tle, ale bez efektu negatywu. Cień (`--shadow-color`) jest
    dobierany OSOBNO od koloru obramowania (prawie czarny w obu motywach),
    żeby nadal czytał się jako cień, a nie poświata. Metoda, która się
    sprawdziła przy podejmowaniu takich decyzji: zamiast zgadywać, zrobić
    2-3 warianty jako statyczny podgląd HTML, zrzut ekranu, i dać
    użytkownikowi wybrać wizualnie — dużo szybsze niż kilka rund
    poprawek "na czuja".
- **Przeglądarka publicznych analiz**: lista klikalnych wierszy (ikona
  typu źródła + odznaka wyniku + skrócony cytat), wyszukiwanie po słowach
  kluczowych w czasie rzeczywistym (debounce, sanityzacja wejścia przed
  wstawieniem do filtra PostgREST), okno ograniczone do ~6 wierszy z
  suwakiem, klik prowadzi do `scan.html?id=...` **w nowej karcie**
  (`target="_blank"`) — celowo, żeby klik w wynik nie gubił przewijanej
  listy pod spodem. Widoczna zawsze (i dla zalogowanych, i dla
  niezalogowanych) — celowa decyzja: to mechanizm wzrostu/odkrywalności o
  zerowym koszcie krańcowym (czyta się z już policzonego, współdzielonego
  cache'u, bez wywoływania Gemini).
- **Własna, świeża analiza przenosi na stronę wyniku w TEJ SAMEJ karcie**:
  kliknięcie "Analizuj" na `index.html` po otrzymaniu wyniku przekierowuje
  (`window.location.href = 'scan.html?id=...'`) — bez otwierania nowej
  karty przeglądarki. Historia tej decyzji: najpierw wynik pokazywał się w
  `resultCard` pod listą publicznych analiz na tej samej stronie →
  użytkownik poprosił o otwieranie w nowej karcie (żeby nie trzeba było
  przewijać) → po przetestowaniu na żywo użytkownik zdecydował, że jednak
  woli przejście w tej samej karcie, nie nowe okno przeglądarki. Backend
  (`analyze/index.ts`) mimo to nadal zwraca `id` zeskanowanego wyniku w
  odpowiedzi (dla trafienia z cache'u — `existing.id`, dla świeżej analizy
  — `newScan.id`) — to zostaje, frontend go potrzebuje do zbudowania
  adresu `scan.html?id=...`. Błędy nadal pokazują się na tej samej
  stronie przez `renderResult(data)` (nie przekierowujemy przy błędzie).
  Uwaga: lista publicznych analiz ("Zobacz, co już wykryliśmy") NADAL
  otwiera wyniki w nowej karcie (`target="_blank"`, patrz wyżej) — ta
  zmiana dotyczyła wyłącznie przycisku "Analizuj", nie listy.
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
- **Brak "błysku" złego stanu przy ładowaniu strony**: `index.html` nie
  pokazuje domyślnie karty logowania (`authCard` ma `display:none` w
  samym HTML) — zamiast tego widać neutralny stan `#appLoading`
  ("Ładowanie..."), dopóki `renderAuthUI()`/`showRecoveryForm()` (albo
  ścieżka błędu przy niewczytanym Supabase) świadomie nie zdecydują,
  który widok pokazać. Ten sam wzorzec już wcześniej istniał na
  `account.html` (`#accountLoading`) — jeśli powstanie kolejna strona z
  asynchronicznym sprawdzaniem stanu logowania, stosuj go od razu.
- **Ponowne użycie przez tłumaczenie (efekt skali między językami)**: gdy
  ktoś prosi o analizę treści, która **już istnieje w innym języku**,
  backend (`analyze`) zamiast płacić za pełną analizę AI od zera, tanio
  **tłumaczy gotowy wynik** (`translateResult()` — tylko `name`/
  `explanation`/`summary`, `quote` i `q_score` zostają bez zmian).
  Użytkownik płaci **dokładnie tyle samo**, co za zwykłą analizę — to
  obniża wyłącznie nasz koszt operacyjny, nie cenę dla użytkownika.
  Tłumaczymy zawsze z prawdziwego oryginału (`is_translation = false`),
  nigdy z innego tłumaczenia (żeby jakość nie spadała z każdym kolejnym
  językiem). Każde tłumaczenie zostaje w cache'u na zawsze (płaci się raz
  na parę treść+język).
  - **WAŻNE — świadomie USUNIĘTE i nie odtwarzać bez wyraźnej prośby**:
    była też wersja tego mechanizmu wywoływana automatycznie przez samo
    **przeglądanie** listy publicznych analiz (osobna funkcja
    `translate-scan`, "dopełniająca" listę w rzadko używanym języku, gdy
    wyników było mniej niż 6). Usunięta na wyraźne życzenie użytkownika:
    **dostęp do wyniku w danym języku ma powstawać wyłącznie wtedy, gdy
    ktoś świadomie kliknie "Analizuj" dla tej treści w tym języku —
    nigdy jako efekt uboczny samego oglądania strony.** Pusta lista w
    rzadko używanym języku to poprawny, oczekiwany stan, nie błąd do
    naprawienia dopełnianiem w tle.
  - **Ekonomia tej funkcji (ważne, żeby nie zawyżać oczekiwań)**: przy
    krótkich treściach (setki znaków) oszczędność kosztu API jest
    kosmetyczna (~10%), bo koszt wyjścia (droższy token) jest podobnej
    wielkości w obu ścieżkach — realna różnica rośnie z długością
    źródła (przy długim artykule/linku spadek kosztu sięga ~80%+, bo
    tłumaczenie nie zależy wcale od długości oryginału, tylko pełna
    analiza). Marża procentowa na pojedynczej transakcji i tak zawsze
    wychodzi blisko 100%, bo koszt API (`gemini-3.5-flash-lite`: $0,30 /
    $2,50 za milion tokenów wejścia/wyjścia, zweryfikowane na żywo
    16.08.2026 — patrz sekcja "Cennik" niżej) jest ułamkiem grosza
    względem jakiejkolwiek sensownej ceny za kredyt. Realna wartość tej
    funkcji to nie wzrost marży % na transakcję (nie ma tu gdzie rosnąć),
    tylko **obniżenie zsumowanego kosztu operacyjnego w miarę wzrostu
    skali i liczby obsługiwanych języków**.
- **Biblioteka 100 modeli mentalnych (jakość analiz)**: `analyze/index.ts`
  ma wbudowaną skróconą (nazwa + jedno zdanie opisu, bez przykładów)
  bibliotekę 100 nazwanych modeli mentalnych z wielu dziedzin (logika,
  fizyka, biologia, ekonomia, psychologia, socjologia, filozofia,
  strategia, język, informatyka, design i inne) — stała `MENTAL_MODELS` w
  kodzie. Prompt instruuje Gemini, żeby dla każdego wykrytego wzorca
  wybierał nazwę z tej biblioteki (przetłumaczoną na język wyniku) zamiast
  wymyślać własne, przypadkowe określenia albo trzymać się tylko kilku
  najbardziej oczywistych (Dowód Społeczny, Fałszywa Pilność...). Celowo
  **cała biblioteka 100 modeli**, nie tylko podzbiór "manipulacyjny" —
  świadoma decyzja użytkownika: Pragma ma nazywać też trafne, wartościowe
  wzorce rozumowania w tekście, nie tylko manipulacje.
  - Pełna wersja "dla ludzi" (z przykładami, pogrupowana w 15 kategorii)
    żyje w `MODELE_MENTALNE.md` w katalogu głównym repo. **Te dwa miejsca
    muszą być trzymane w zgodzie** — jeśli dodajesz/zmieniasz model w
    jednym, zaktualizuj też drugie.
  - Wpływ na koszt: biblioteka dokłada do promptu ~2-2,5 tys. tokenów
    wejścia przy KAŻDEJ pełnej analizie (nie przy tłumaczeniu wyniku —
    `translateResult()` jej nie używa). Przy stawce $0,30/milion tokenów
    wejścia to ułamek grosza na analizę — świadomie zaakceptowany koszt w
    zamian za wyraźnie wyższą trafność i różnorodność nazw wzorców.
  - **Kaskada dwuetapowa (kategoria → szczegół)**: modele językowe mają
    naturalną skłonność wybierać częściej te modele mentalne, które są
    "popularniejsze"/lepiej znane (Dowód Społeczny, Efekt Halo...), nawet
    gdy rzadszy model pasowałby trafniej — to nie błąd naszego kodu, tylko
    cecha AI. Żeby temu przeciwdziałać, `analyze/index.ts` NIE wysyła już
    całej biblioteki 100 modeli za jednym razem. Zamiast tego:
    1. **Etap 1 (tani, "sitowy")** — `pickRelevantCategories()`: krótkie
       zapytanie z listą tylko 15 NAZW kategorii (bez opisów modeli),
       pytające zgrubnie "do których kategorii pasuje ta treść?".
    2. **Etap 2 (właściwy)** — `buildSystemPrompt()` dostaje już tylko
       przefiltrowaną bibliotekę (`buildMentalModelsLibrary()`) z 1-4
       wybranych kategorii, nie wszystkich 15.
    - **Dlaczego to NIE podwaja kosztu** (użytkownik świadomie o to pytał):
      etap 1 jest tani (tylko nazwy kategorii, nie 100 opisów modeli), a
      etap 2 jest TAŃSZY niż dawne pojedyncze zapytanie (mniejsza,
      przefiltrowana biblioteka zamiast wszystkich 100 modeli za każdym
      razem) — łączny koszt obu zapytań wychodzi z grubsza taki sam jak
      dawne jedno zapytanie z pełną biblioteką, czasem niższy. Prawdziwym
      kosztem tej zmiany jest **dodatkowy czas oczekiwania** (jedno
      zapytanie do Gemini więcej w sekwencji), nie pieniądze.
    - **Bezpieczny fallback**: jeśli etap 1 zwróci pustą/nieprawidłową
      listę kategorii (błąd, awaria, coś nieparsowalnego),
      `buildMentalModelsLibrary()` automatycznie wraca do PEŁNEJ biblioteki
      wszystkich 15 kategorii — nigdy nie blokuje analizy.
    - **Ścieżka awaryjnego pobrania strony** (`fetchUrlAsText`, patrz niżej)
      ma własny, POŁĄCZONY etap 1: `siftFallbackText()` jednym zapytaniem
      naraz (a) czyści surowy, zaszumiony tekst z menu/stopki/reklam
      (odwołanie do modelu GIGO w bibliotece) i (b) wskazuje kategorie —
      połączone w jedno zapytanie celowo, żeby ta ścieżka też miała tylko 2
      zapytania do Gemini, nie 3.
- **Zmieniające się komunikaty podczas oczekiwania na analizę**: skoro
  pełna analiza to teraz kilka kolejnych zapytań do AI (kategoryzacja →
  właściwa analiza → czasem jeszcze awaryjne pobranie strony), potrafi to
  trwać kilka-kilkanaście sekund. Zamiast martwego "Analizuję...", `index.html`
  co ok. 2,2s podmienia tekst statusu na kolejny z listy 6 komunikatów
  (`status_step_1`...`status_step_6` w `i18n.js`, np. "Sprawdzam, czy ktoś
  już to analizował...", "Czytam treść uważnie...") — ten sam trik, którego
  używają czaty AI pokazując "co właśnie robię", żeby czekanie nie wyglądało
  na zawieszenie strony. Interwał (`setInterval`) jest czyszczony w każdej
  gałęzi (sukces/błąd/`finally`) — pilnuj tego, jeśli będziesz przerabiać tę
  część kodu, inaczej komunikaty będą dalej migać po zakończeniu żądania.
- **Lokalizacja komunikatów błędów**: backend zwraca kod błędu (`error`:
  `signup_required`/`insufficient_credits`/`url_fetch_failed`/
  `save_failed`/...) — pole `message` z backendu jest zaszyte na sztywno
  po polsku i NIE powinno być pokazywane wprost użytkownikowi. Frontend
  (`renderResult()` w `index.html`) mapuje kod błędu na klucz i18n
  (`err_*`) i tłumaczy przez ten sam mechanizm co resztę interfejsu. Przy
  dodawaniu nowego typu błędu w backendzie — dodaj też odpowiadający klucz
  `err_*` we wszystkich 10 językach w `i18n.js` i dopisz go do mapy
  `errorMessageKeys` w `index.html`, inaczej użytkownik zobaczy albo
  polski tekst, albo ogólny fallback.

## Baza danych — znane tabele (zrekonstruowane z kodu, nie z osobnego
## pliku schematu w repo — jeśli coś tu nie zgadza się z rzeczywistością
## w Supabase, wierz Supabase, nie temu opisowi)

**`profiles`** (1:1 z `auth.users`, klucz `id`):
- `id` (uuid)
- `wallet_balance` (numeric) — saldo kredytów
- `language` (text, `NOT NULL DEFAULT 'en'`) — ustawienie języka konta
- `theme` (text, `NOT NULL DEFAULT 'light'`) — ustawienie motywu (`light`/
  `dark`), ten sam wzorzec co `language` (patrz niżej "Motyw jasny/ciemny")

**`scans`** (współdzielony cache analiz, publiczny odczyt w RLS):
- `id`, `content_hash` (klucz cache'u treści), `input_type` (`text`/`url`/
  `image`), `language` (text, `NOT NULL DEFAULT 'en'` — **razem z
  `content_hash` tworzy właściwy klucz cache'u**), `is_translation`
  (boolean, `NOT NULL DEFAULT false` — `true`, gdy wynik powstał przez
  przetłumaczenie istniejącej analizy z innego języka, a nie przez pełną
  analizę AI; używane, żeby zawsze tłumaczyć z prawdziwego oryginału,
  nigdy z tłumaczenia), `source_url`, `char_count`, `credits_charged`,
  `result` (jsonb — patrz struktura wyniku wyżej), `discovered_by` (uuid,
  nullable — kto pierwszy wygenerował ten wynik; część starych wierszy ma
  tu `null` z okresu, gdy istniało jeszcze darmowe dotłumaczanie z samej
  przeglądarki — ten mechanizm już nie istnieje, patrz "Ponowne użycie
  przez tłumaczenie" wyżej), `view_count`, `created_at`
  - Ograniczenie unikalności: `UNIQUE (content_hash, language)` —
    **nie** samo `content_hash` (stara reguła `scans_content_hash_key`
    została usunięta i zastąpiona tą złożoną, patrz pułapki niżej).

**`wallet_transactions`**:
- `user_id`, `amount`, `type` (np. `spend`), `related_scan_id`

RLS: `scans` ma publiczny odczyt (używane przez niezalogowanych w
przeglądarce publicznych analiz i na `scan.html`). Zapis do `scans`/
`profiles`/`wallet_transactions` idzie przez `service_role` w Edge
Function (backend), nie bezpośrednio z przeglądarki — **z jednym
wyjątkiem**: `profiles.language` jest aktualizowane bezpośrednio z
przeglądarki (`setLanguage()` w `i18n.js`, wywoływane z sesją
zalogowanego użytkownika), więc `profiles` ma regułę RLS pozwalającą
zalogowanemu użytkownikowi na `UPDATE` własnego wiersza (`auth.uid() =
id`), obok istniejącej reguły `SELECT`.

## Cennik (do skalibrowania na realnych danych — na razie przybliżenia)

- Tekst: `FIXED_FEE (2) + ceil(char_count / 1000) * MULTIPLIER (1)`.
- Link: płaska stawka `URL_SCAN_COST = 6` — długości strony nie znamy
  przed wywołaniem Gemini, więc nie da się wycenić dokładnie; analiza
  linku wymaga zawsze konta (nie ma trybu anonimowego dla linków, żeby
  ktoś nie wygenerował dużego kosztu API za darmo, podając link do
  ogromnej strony).
- Pierwszy skan anonimowy (tylko tryb tekstowy): darmowy do
  `ANONYMOUS_MAX_CHARS = 3000` znaków.
- **Wciąż nieustalone**: ile 1 kredyt ma być wart w złotówkach/dolarach.
  Bez tego nie da się policzyć realnej marży w walucie, tylko w
  procentach. Jak wypadnie ta rozmowa — dopisz tu ustaloną wartość.
- **Koszt API jest ułamkiem grosza względem jakiejkolwiek sensownej ceny
  za kredyt** — dla `gemini-3.5-flash-lite` ($0,30 / $2,50 za milion
  tokenów wejścia/wyjścia, zweryfikowane na żywo 16.08.2026, zgodne z
  ceną już wcześniej zapisaną w kodzie) pojedyncza analiza kosztuje
  rzędu $0,0007-0,0035 zależnie od długości treści. Oznacza to, że marża
  na pojedynczej transakcji jest z natury tego biznesu blisko 100%
  niezależnie od tego, czy to pełna analiza, czy tanie tłumaczenie z
  cache'u — różnica między nimi liczy się dopiero w **zsumowanym**
  koszcie operacyjnym przy dużej skali i długich treściach, nie w
  procencie marży na jednej analizie (patrz też sekcja "Ponowne użycie
  przez tłumaczenie" wyżej).

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
- **`ALTER TABLE ... ADD COLUMN ... DEFAULT X`** nadaje tę wartość domyślną
  RÓWNIEŻ istniejącym, starym wierszom — nawet jeśli w rzeczywistości mają
  inną wartość (np. `scans.language DEFAULT 'en'` oznaczyło stare, w
  rzeczywistości polskie analizy jako angielskie). Po każdej takiej
  migracji sprawdź, czy trzeba dodatkowo ręcznie poprawić (backfill) stare
  wiersze `UPDATE`-em, zanim nowa kolumna zacznie być używana w logice
  aplikacji.
- **Deklaracje `function nazwa() {}` wewnątrz bloku `if`/`else`** nie są w
  praktyce (w Chrome) niezawodnie widoczne z kodu leżącego PRZED/POZA tym
  blokiem w tym samym pliku, mimo teoretycznego hoistingu (Annex B) —
  wywołanie takiej funkcji z zewnątrz rzuca `ReferenceError`. W
  `index.html` `fetchAndRenderScans` jest zdefiniowana wewnątrz `else {}`
  (blok "tylko gdy Supabase się wczytał"), a wywoływana też z zewnątrz
  (selektor języka na ekranie logowania) — naprawione przez jawną
  deklarację `let fetchAndRenderScans;` na zewnątrz i przypisanie
  `fetchAndRenderScans = async function (...) {...};` w środku, zamiast
  `function fetchAndRenderScans(...) {...}`. Jeśli kolejna funkcja
  zdefiniowana wewnątrz `else {}` będzie potrzebna spoza tego bloku —
  zastosuj ten sam wzorzec, nie zakładaj, że hoisting to załatwi.
- **RLS domyślnie daje tylko to, na co jest jawna reguła** — tabela
  `profiles` miała regułę tylko na `SELECT`, żadnej na `UPDATE`. Zapis
  języka do profilu (`setLanguage()`) więc zawsze cicho się nie udawał
  (żaden błąd nie był widoczny, bo kod nie sprawdzał `error` ze
  Supabase), a przy kolejnej synchronizacji stara wartość z bazy
  nadpisywała lokalny wybór użytkownika — wyglądało to jak "język sam się
  resetuje". Ogólna zasada: przy każdej nowej tabeli/kolumnie
  aktualizowanej bezpośrednio z przeglądarki, sprawdź w Supabase
  (Database → Policies), czy reguła RLS na dany typ operacji
  (`SELECT`/`INSERT`/`UPDATE`/`DELETE`) w ogóle istnieje — sama tabela
  "działająca" do odczytu nie gwarantuje, że zapis też zadziała.
- **Nigdy nie ignoruj `error` ze Supabase (`.then(() => {})` albo
  `const { data } = await ...` bez `error`)** — to dokładnie ten sam
  mechanizm co powyżej: cichy błąd wygląda jak "nic się nie stało", a
  naprawia się go dopiero wtedy, gdy ktoś przypadkiem doda logowanie i
  zobaczy prawdziwy powód. Dotyczy to też backendu — `insert(...).select()`
  bez sprawdzenia `error`/`!data` prowadziło do `Cannot read properties
  of null (reading 'id')` zamiast czytelnego komunikatu, gdy zapis do
  `scans` się nie udawał (patrz niżej: stary klucz unikalności).
- **Stary klucz unikalności `scans_content_hash_key`** (samo
  `content_hash`, sprzed wprowadzenia wielojęzyczności) blokował drugi
  wiersz dla tej samej treści w innym języku — insert w `analyze` i
  `translate-scan` wywalał się z `duplicate key value violates unique
  constraint`. Naprawione zmianą na złożony klucz `UNIQUE (content_hash,
  language)` (`DROP CONSTRAINT scans_content_hash_key` +
  `ADD CONSTRAINT ... UNIQUE (content_hash, language)`). Ogólna lekcja:
  gdy zmienia się "co jest unikalne" w danych (tu: z "treść" na "treść +
  język"), sprawdź, czy ograniczenia na poziomie bazy (constraints, nie
  tylko logika w kodzie) zostały zaktualizowane tak samo — sama zmiana
  zapytań `.eq()` w kodzie nie wystarczy, jeśli baza ma z tyłu starszą,
  węższą regułę.
- **Natywny `<input type="file">`** pokazuje swój przycisk/placeholder
  ("Wybierz plik" / "Nie wybrano pliku") w języku przeglądarki/systemu
  użytkownika — atrybut `lang` na stronie na to nie wpływa, więc zwykły
  mechanizm i18n go nie obejmuje. Naprawione przez ukrycie natywnego pola
  (`display:none`) i zastąpienie go własnym, w pełni tłumaczonym
  przyciskiem, który tylko programowo klika ukryty input
  (`imageInputTrigger` w `index.html`). Jeśli w przyszłości dojdzie kolejne
  pole plikowe — zastosuj ten sam wzorzec od razu, nie po zgłoszeniu.

## Świadomie odłożone na później (nie budować bez wyraźnej prośby)

- Własna domena (naprawiłoby to markowanie Google OAuth pokazujące surową
  domenę Supabase, i brzydki adres nadawcy Brevo przy odbiciach) —
  użytkownik: "jeszcze nie".
- Analiza obrazu/PDF.
- Ekran intencji zakupowej (Fake Door test).
- Obniżanie darmowego bonusu powitalnego / limity rejestracji po IP w
  Supabase — świadomie odłożone (zasada Lean Startup: nie buduj obrony
  przed zagrożeniem, które się jeszcze nie zmaterializowało).

## Dokumenty z pomysłami biznesowymi (traktuj krytycznie)

Użytkownik czasem wkleja obszerne pliki PDF z burzy mózgów wygenerowanej w
osobnej rozmowie z AI (np. `PRagma.pdf` — dziesiątki stron o teorii gier,
memetyce, ESS, modelach Mungera, mechanizmach reputacji itd.). Takie pliki:
- Same jawnie ostrzegają, że są wewnętrznie niespójne (treść bliżej końca
  pliku ma pierwszeństwo nad treścią bliżej początku dla tego samego
  tematu).
- Zawierają konkretne liczby (np. ceny API, wzory kosztowe), które bywają
  nieaktualne, dotyczą innych/starszych modeli albo są tylko ilustracyjnym
  szacunkiem, nie zweryfikowanym faktem.
- Mają dużo spekulatywnej, filozoficznej otoczki (teoria ewolucji,
  Dawkins, Munger) obudowującej całkiem konkretne, techniczne pomysły
  (np. system reputacji, mechanizm "pierwszeństwa odkrycia", prywatne vs
  publiczne skany) — warto oddzielić jedno od drugiego.

Zasada: każdą konkretną, weryfikowalną liczbę lub fakt z takiego pliku
(zwłaszcza ceny/koszty) sprawdź w prawdziwym, aktualnym źródle (np.
`WebSearch`) przed użyciem jej w kodzie czy w rozmowie — nie kopiuj
wprost. Przykład z tej sesji: plik podawał cenę Gemini "0,07 PLN / 0,28
PLN za milion tokenów" dla starego modelu — sprawdzenie na żywo pokazało,
że aktualna, prawidłowa cena dla modelu faktycznie używanego w kodzie
(`gemini-3.5-flash-lite`) to $0,30 / $2,50 za milion tokenów, czyli
zupełnie inna liczba, i to ta druga jest poprawna.

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
