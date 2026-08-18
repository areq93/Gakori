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
- `style.css` — wspólny styl. Od 2026-08-18 styl **"Rzeźba"** (patrz
  osobna sekcja niżej) — poprzednio "Retro plakat", wcześniej jeszcze
  ciepła, "papierowa" estetyka. Jedna czcionka na całej stronie —
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
- **Analiza tekstu, linków i obrazów**: link analizowany przez wbudowane
  w Gemini API narzędzie **URL Context** (`tools: [{ urlContext: {} }]`)
  — model sam pobiera i czyta stronę, bez własnego scrapera. Obraz:
  frontend wysyła prawdziwą zawartość pliku (base64, nie tylko nazwę i
  rozmiar jak w pierwszej, tymczasowej wersji interfejsu), backend sam
  rozpoznaje prawdziwy typ pliku po zawartości i woła Gemini
  multimodalnie (`inlineData` z base64 + wykrytym `mimeType`), patrz
  sekcja "Cennik" wyżej.
  - **Źródło pokazywane na `scan.html`, dla każdego trybu inaczej**: link →
    klikalny adres (`source_url`, patrz "Bezpieczne linki" niżej); obraz →
    jednorazowy, ulotny podgląd tylko u przesyłającego (patrz sekcja o
    obrazie niżej — świadomie NIE zapisywany); **tekst → pełna wklejona
    treść, zapisana na stałe i publiczna, tak jak `source_url` dla linku**
    (kolumna `text_content` w `scans`, patrz struktura tabeli wyżej).
    Pokazywana na `scan.html` jako zwijany blok (`<details>`,
    `#scanTextSource`) na górze analizy, z fragmentami odpowiadającymi
    `pattern.quote` delikatnie podświetlonymi DOKŁADNIE w miejscu ich
    wystąpienia w oryginale (`buildHighlightedText()` w `scan.html` —
    zbudowane wyłącznie przez `createTextNode`/`createElement`, nigdy
    `innerHTML`, bo to treść od użytkownika). Świadoma decyzja (patrz
    rozmowa z użytkownikiem): w odróżnieniu od obrazu, tekst JUŻ dziś jest
    publicznie cache'owany/wyszukiwalny (nie ma filtra `.neq('input_type',
    'text')` jak dla obrazu), więc trwały zapis pełnej treści to
    kontynuacja istniejącego zachowania (cytaty i tak już są publiczne), a
    nie nowa kategoria ekspozycji — w przeciwieństwie do obrazu koszt
    przechowywania samego tekstu jest znikomy.
  - **Moderacja treści na obrazach** (użytkownik poprosił wprost, żeby
    zablokować próby wrzucania niedozwolonej treści): DWIE niezależne
    warstwy sprawdzania w tym samym, jedynym wywołaniu Gemini (bez
    dodatkowego kosztu):
    1. Wbudowany mechanizm bezpieczeństwa samego dostawcy —
       `geminiData.promptFeedback.blockReason` albo
       `candidates[0].finishReason === 'SAFETY'` łapie najbardziej
       drastyczne przypadki, zanim w ogóle jest jakikolwiek tekst do
       sparsowania.
    2. Własny klasyfikator wstrzyknięty na początek promptu
       (`moderationInstruction` w kodzie) — każe Gemini NAJPIERW ocenić,
       czy obraz przedstawia nagość/treści seksualne, drastyczną przemoc/
       krew/wnętrzności/zwłoki, znęcanie się nad ludźmi lub zwierzętami,
       albo drastyczne skutki katastrof — i ustawić `unsafe_content`
       (bool) + `unsafe_content_category` (jedna z ustalonej listy
       `UNSAFE_CONTENT_CATEGORIES`) w schemacie odpowiedzi
       (`IMAGE_RESPONSE_SCHEMA`, osobny od `RESPONSE_SCHEMA` używanego
       przez tekst/link — nie miesza się z ich sprawdzonym kształtem).
       To łapie kategorie z listy użytkownika, które niekoniecznie
       trafiają w domyślne kategorie blokowane automatycznie przez
       samego dostawcę (np. "katastrofy", "zranienia").
    - **Kara za samą próbę**: w OBU przypadkach wykrycia konto zostaje
      obciążone **pełną, zsumowaną stawką za CAŁY przesłany zestaw obrazów
      (`IMAGE_SCAN_COST × liczba obrazów`), tak jak za normalną, udaną
      analizę** (funkcja `respondUnsafeContent()`) — świadomy odstraszacz
      na wyraźną prośbę użytkownika, nie pomyłka; dotyczy całego zestawu,
      nawet jeśli tylko JEDEN z kilku obrazów był niedozwolony. Transakcja
      w `wallet_transactions` ma `type: 'unsafe_content_penalty'`
      (odróżnialna od zwykłego `'spend'` w razie potrzeby analizy
      później) i `related_scan_id: null`.
    - **NIC nie trafia do współdzielonego cache'u `scans`** przy
      wykryciu — żaden wiersz się nie zapisuje, więc treść nigdy nie
      pojawia się w publicznej przeglądarce analiz ani pod żadnym `id`.
      Ponowna próba z tym samym plikiem zawsze przechodzi przez pełne
      (płatne) sprawdzenie od nowa — nie ma tu żadnego "darmowego"
      powtórzenia, bo nie ma czego cache'ować.
    - Frontend pokazuje użytkownikowi czytelny komunikat (`err_unsafe_content`
      w `i18n.js`, wszystkie 10 języków) i od razu odświeża widoczny stan
      kredytów (patrz "Stan kredytów" wyżej), żeby liczba na ekranie
      zgadzała się z tym, co faktycznie pobrano.
  - **Obraz(y) pokazywane na górze wyniku na `scan.html`, ale TYLKO temu, kto
    je właśnie przesłał**: tak jak link/tekst, po udanej analizie obrazu
    frontend też przekierowuje na `scan.html?id=...` (użytkownik prosił, żeby
    to zachować). Same pliki obrazów nigdy nie trafiają na serwer (patrz
    decyzja o kosztach Storage niżej) — więc żeby mimo to pokazać je na
    `scan.html`, `index.html` tuż przed przekierowaniem robi z KAŻDEGO z nich
    pomniejszoną miniaturę (`makeImagePreview()` — canvas, maks. 1000px, JPEG
    ~0,72 jakości, żeby zmieściły się w limicie `sessionStorage`) i zapisuje
    całą listę miniatur (jako JSON, `imagePreviewDataUrls`) na chwilę pod
    kluczem `pragma_scan_image_<id>` w `sessionStorage` (dane w pamięci JS nie
    przetrwałyby pełnej nawigacji na inną stronę). `scan.html` odczytuje ją
    pod tym samym kluczem, renderuje jedną miniaturę na obraz w
    `#scanImageList` (siatka, `.scan-image-list` w `style.css`) +
    `image_not_saved_notice` w `i18n.js`, i OD RAZU usuwa z `sessionStorage` —
    jednorazowy podgląd, zniknie np. po odświeżeniu strony albo dla kogoś
    innego, kto dostanie ten sam link (kod ma też wsteczną zgodność: jeśli
    trafi na stary, pojedynczy string zamiast tablicy JSON, potraktuje go jak
    listę z jednym elementem). Wpis w cache'u (`scans.id`) i sam tekstowy
    wynik istnieją normalnie jak zawsze — tylko obrazy nigdy nie są trwale
    nigdzie zapisane.
    - **Świadomie NIE trzymamy plików obrazów na serwerze** — rozważaliśmy
      to (żeby analiza była "odkrywalna" publicznie tak jak tekst/link), ale
      koszt przechowywania (Supabase Storage) rósłby bez górnego limitu wraz
      z liczbą analiz, a nasza własna moderacja i tak nie łapie wszystkiego,
      co mogłoby być problematyczne do publicznego pokazania (np. czyjeś
      prywatne zdjęcie bez zgody) — zbyt duże ryzyko kosztowe i prawne
      względem korzyści, więc świadomie zrezygnowaliśmy.
  - **Wybór obrazu: przycisk (plik) ALBO wklejenie ze schowka** — obok
    przycisku "Wybierz zdjęcie" jest druga strefa (`#imagePasteZone`,
    `contenteditable`, celowo widoczny/klikalny element, nie niewidoczny
    nasłuch na całej stronie — telefony bez skupionego, edytowalnego pola w
    ogóle nie pokazują opcji "Wklej"), do której można wkleić obraz ze
    schowka (Ctrl+V na komputerze, "Wklej" z menu dotykowego na telefonie) —
    np. świeży zrzut ekranu skopiowany w innej aplikacji, bez zapisywania go
    najpierw jako plik. Oba źródła trafiają do tej samej zmiennej
    (`selectedImageFile` w `index.html`), więc reszta kodu (przycisk
    "Analizuj") nie musi wiedzieć, skąd plik pochodzi.
    - **Znane ograniczenie na części telefonów: nie ma tu nic do naprawienia
      po naszej stronie.** Zdiagnozowane na żywo z użytkownikiem (Android,
      Brave): to, co telefon nazywa "skopiowaniem zrzutu ekranu", w zależności
      od aplikacji źródłowej czasem w ogóle NIE umieszcza w systemowym
      schowku żadnych danych obrazu — tylko sam tekst (`clipboardData.types`
      pokazywało wyłącznie `text/plain`). Strona internetowa nie ma jak
      pokazać obrazu, którego naprawdę nie ma w schowku — to ograniczenie
      aplikacji/systemu kopiującego, nie błąd w kodzie Pragmy. Kod sprawdza
      zarówno `clipboardData.files`, jak i `.items` (różne przeglądarki
      wypełniają różne z tych pól), więc jeśli w schowku FAKTYCZNIE jest
      obraz, zostanie złapany. Komunikat błędu (`alert_paste_not_image` w
      `i18n.js`) podpowiada wtedy pewniejszą alternatywę: zwykły przycisk
      "Wybierz zdjęcie", który na telefonach działa bez zarzutu.
  - **Trzeci, najpewniejszy sposób na telefonie: systemowe "Udostępnij"**
    (Android — na iOS/Safari ta funkcja w ogóle nie istnieje dla zainstalowanych
    PWA, ograniczenie samego Apple, nie nasze). W przeciwieństwie do
    kopiowania do schowka (patrz ograniczenie wyżej), "Udostępnij" dla
    zdjęcia/zrzutu ekranu ZAWSZE przekazuje prawdziwe dane obrazu — to
    gwarantuje sam system Android (`Intent.ACTION_SEND`), nie żadna
    pośrednicząca aplikacja. Zbudowane w trzech miejscach:
    1. `manifest.json`: `share_target` przełączony z `GET` (tylko tekst/link)
       na `POST` + `multipart/form-data`, z dodanym polem `files` (klucz
       `shared_image`, `accept: ["image/*"]`) — dalej obsługuje też
       tytuł/tekst/link jak dawniej, jednym mechanizmem.
    2. `sw.js`: GitHub Pages jest stroną statyczną i nie ma jak przyjąć
       prawdziwego żądania `POST` (nie ma tam żadnego serwera) — Service
       Worker musi je przechwycić SAM, zanim pójdzie do sieci
       (`handleShareTarget()`, nowa gałąź w `fetch`, rozpoznawana po
       `method === 'POST'` i ścieżce kończącej się na `/index.html`).
       Wyjmuje plik z `request.formData()`, trzyma go PRZEZ CHWILĘ w
       osobnym `SHARE_TARGET_CACHE` (celowo NIE w głównym `CACHE_NAME` —
       inaczej rutynowe czyszczenie starych wersji przy każdej aktualizacji
       apki, patrz "activate", mogłoby skasować obraz, zanim strona zdąży
       go odebrać), po czym przekierowuje zwykłym `GET` na `index.html` z
       parametrem `shared_image=1` (plus `title`/`text`/`url`, jeśli to było
       udostępnienie tekstu — dokładnie w tym samym formacie adresu, jakiego
       `index.html` już oczekiwał dla tekstu/linku, więc TA część kodu w
       ogóle nie wymagała zmian).
    3. `index.html`: `receiveSharedImage()` (wywoływana z tego samego
       `DOMContentLoaded`, co dotychczasowa obsługa udostępnionego
       tekstu/linku) sprawdza `shared_image=1`, odbiera plik z
       `SHARE_TARGET_CACHE`, OD RAZU go stamtąd kasuje (jednorazowy odbiór —
       odświeżenie strony nie próbuje wczytać go drugi raz), przełącza na
       zakładkę "Obraz" i wstawia jako `selectedImageFile` — DOKŁADNIE tą
       samą ścieżką, co ręczny wybór pliku i wklejanie ze schowka (patrz
       wyżej), więc reszta analizy (limit 8 MB, sprawdzenie prawdziwego typu
       pliku po zawartości na backendzie, moderacja) działa identycznie,
       bez żadnych wyjątków dla tego trzeciego źródła.
  - PDF: jeszcze nie zaimplementowany (`input_type: "pdf"` zwróciłby
    `501 not_implemented`, gdyby frontend w ogóle wysyłał taki typ — na
    razie nie ma dla PDF żadnego pola w interfejsie). Moderacja opisana
    wyżej ma docelowo obejmować też obrazy WEWNĄTRZ analizowanych PDF-ów
    (pominięte, nie analizowane) — patrz "Świadomie odłożone na później".
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
- **Styl wizualny "Rzeźba" (od 2026-08-18, zastąpił "Retro plakat")**:
  miękka, matowa, organiczna estetyka inspirowana wprost logo Pragmy
  (abstrakcyjna, biomorficzna rzeźba — użytkownik przesłał opis/inspirację
  z Google, "gra światła i cienia po zaokrąglonej powierzchni", "wrażenie
  lekkości mimo twardego materiału"). Świadomie **zastąpiła**, nie
  uzupełniła, poprzedni styl "Retro plakat" (grube czarne obramowania,
  płaskie przesunięte cienie naklejki) — te dwie estetyki się wykluczają;
  potwierdzone wprost z użytkownikiem przed wdrożeniem (patrz "Pułapki"
  niżej — nie zakładaj automatycznie kierunku zmiany przy podobnych
  prośbach w przyszłości, zawsze potwierdź zakres).
  - Brak grubych obramowań — `--border-w` zmniejszone z 2px do 1px, kolor
    `--card-border` to teraz prawie niewidoczna, półprzezroczysta linia
    (`rgba(...,0.10)` w jasnym, `rgba(255,255,255,0.09)` w ciemnym), nie
    pełny, kontrastowy kolor jak wcześniej.
  - Płaski, przesunięty `--sticker-shadow`/`--sticker-shadow-sm` (naklejka)
    zastąpiony miękkim, rozproszonym, DWUWARSTWOWYM cieniem
    `--sculpt-shadow`/`--sculpt-shadow-sm` (bliższa, ostrzejsza warstwa +
    dalsza, mocno rozmyta) — efekt "unoszącej się" nad tłem formy, nie
    cienia płaskiej naklejki. `button:active` NIE przesuwa się już o
    twarde `translate(3px,3px)` z zerowanym cieniem (tak wyglądała
    "wciśnięta naklejka") — teraz lekkie `translateY(1px) scale(0.99)`
    z przyciemnionym, ale wciąż miękkim cieniem.
  - Promienie zaokrąglenia zwiększone (`--radius` 14px→22px, `--radius-sm`
    9px→14px) dla bardziej opływowego, mniej "kanciastego" wrażenia.
  - Paleta przesunięta z ciepłego kremu/brązu + żywego czerwono-różowego
    akcentu na stonowaną, niemal monochromatyczną: `--ink`/`--paper`/
    `--card` to teraz neutralne, matowe szarości z ciepłym podtonem (nie
    żółty kremowy jak wcześniej), `--accent` to przygaszony terakotowy róż
    (`#b3766f`), `--primary` to matowy szaro-taupe (`#57534a`) — zamiast
    dawnego jaskrawego `#d1495b`/`#1f6f6b`.
  - Usunięta tekstura "papieru" z tła `<body>` (siatka kropek +
    szum/ziarno SVG) — czysta, jednolita powierzchnia, zgodnie z
    minimalistycznym duchem opisu rzeźby.
  - **Świadomie NIE spłaszczone do monochromu**: kolory FUNKCYJNE wyniku
    (`.badge-green/yellow/red`, lewa krawędź `.pattern-item` dla
    manipulacja/reasoning) zostały prawie bez zmian — niosą krytyczne
    znaczenie bezpieczeństwa (jednoznaczna, natychmiastowa czytelność
    wyniku), więc nie mogły zniknąć w imię estetyki. To był mój (Claude)
    świadomy wybór przy realizacji, zaproponowany użytkownikowi jako
    "opcja 1" przed wdrożeniem — nie zostało to explicite potwierdzone dla
    "opcji 2" (głębsza zmiana), więc jeśli użytkownik kiedyś zapyta, czemu
    odznaki wyniku nadal są kolorowe, to jest odpowiedź.
  - Mały, powtarzalny znak marki: `.pragma-mark` — inline SVG "kropla"
    (`M50,8 C74,32 88,48 88,63 A38,38 0 1,1 12,63 C12,48 26,32 50,8 Z`,
    obrócona o -18°, gradient szaro-taupe) obok nagłówka `<h1>Pragma</h1>`
    w `index.html` — jedyne miejsce z widocznym tekstowym nagłówkiem
    "Pragma" w treści strony (na `account.html`/`scan.html` "Pragma"
    występuje tylko w `<title>`, nie w treści, więc tam znaku nie dodano).
  - `sw.js`: `CACHE_NAME` podbite do `pragma-v10` (zmiana `style.css` —
    zasób cache'owany, patrz pułapka "Service Worker cache" niżej).
    `theme-color` w `<meta>` na wszystkich 3 stronach HTML zaktualizowany
    do nowego `--ink` (`#2b2a27`, wcześniej `#241f18`).
  - **POPRAWKA 2026-08-18(b) — Runda 2**: pierwsza wersja została wprost
    odrzucona przez użytkownika ("wyszło marnie, za mało kontekstu, wygląda
    jakbyśmy się cofnęli do UI sprzed rzeźby, logo pokazuje inny świat niż
    aplikacja w środku"). Poprawione cztery rzeczy:
    1. Kolory sygnałowe wyniku (`.badge-green/yellow/red`, obramowanie
       `.pattern-item.pattern-reasoning`, `mark.source-highlight-reasoning`,
       `.status-ok/.status-err`) — jednak PRZYGASZONE do tej samej,
       ziemistej "rodziny materiału" co reszta UI (nowe zmienne
       `--ok-bg/--ok-text/--ok-border`, `--warn-*`, `--danger-*`, osobne dla
       jasnego/ciemnego motywu), zamiast zostawiania ich jaskrawymi — to
       odwraca decyzję z pierwszej rundy opisaną wyżej. Kontrast
       sprawdzony (tekst na tle ok. 5,6:1), więc czytelność wyniku
       (kluczowa dla bezpieczeństwa użytkownika) nie ucierpiała.
    2. `.card`, `.result-card`, `button`, `.tab-btn.active`, `#userMenuBtn`
       dostały subtelny `linear-gradient(160deg, ...)` zamiast płaskiego,
       jednolitego koloru — to one budują wrażenie światła padającego na
       zaokrągloną powierzchnię, którego brakowało w pierwszej rundzie.
    3. `--sculpt-shadow`/`--sculpt-shadow-sm` dostały dodatkową warstwę
       `inset 0 1px 0 var(--highlight-edge)` — jasna obwódka u góry karty,
       razem z gradientem daje wrażenie uniesionej, oświetlonej bryły.
    4. Nowy, duży, mocno rozmyty kształt `.pragma-backdrop` (ten sam SVG
       "kropli" co `.pragma-mark`, tylko w dużej skali, `position: fixed`,
       `opacity: 0.16`/`0.22` w ciemnym, `filter: blur(38px)`, `z-index: 0`
       — karty mają `z-index: 1`, żeby były nad nim) w tle strony startowej
       — bezpośrednia odpowiedź na "logo pokazuje inny świat niż aplikacja
       w środku": teraz kształt loga jest widoczny w tle całej aplikacji,
       nie tylko jako mały znaczek przy nagłówku.
    `sw.js` `CACHE_NAME` podbite dalej do `pragma-v11` (kolejna zmiana
    `style.css`).
  - **POPRAWKA 2026-08-18(d)**: strona konta (`account.html`) sprawiała
    wrażenie "niedokończonej" względem reszty aplikacji — przyczyna:
    kilka przycisków (`#logoutBtn` na koncie, `#googleLoginBtn` i
    `#imageInputTrigger` na stronie głównej) miało twardo wpisane inline
    `style="background:#fff/#eee; color:#333; ..."`, całkowicie z pominięciem
    zmiennych motywu — w trybie ciemnym wyglądały jak jasne "dziury"
    wklejone z innej aplikacji, w jasnym po prostu nie pasowały do nowych
    gradientów. Dodana klasa `button.btn-secondary` (w `style.css`,
    korzysta wyłącznie ze zmiennych `--card-2`/`--ink`/`--card-border`) do
    wszystkich przycisków drugoplanowych. Przy okazji też: teksty-dzielniki
    "— lub —" i komunikat błędu logowania miały twardo wpisany kolor
    (`#999`, `#991b1b`) — zamienione na `var(--ink-soft)`/
    `var(--danger-text)`. **Ogólna zasada, żeby się nie powtarzało**: żaden
    inline `style="color:...`/`background:...` w HTML nie może używać
    gołego kodu hex — zawsze `var(--coś)` z palety w `style.css`, inaczej
    element po cichu wypada z motywu przy następnej zmianie kolorów.
  - Ten sam duży, rozmyty kształt tła (`.pragma-backdrop`) dodany też na
    `account.html` i `scan.html` (wcześniej był tylko na stronie
    startowej) — żeby "świat" aplikacji był spójny na każdej podstronie,
    nie tylko na pierwszym ekranie.
    `sw.js` `CACHE_NAME` podbite do `pragma-v13`.
  - **POPRAWKA 2026-08-18(e) — runda 3**: użytkownik po zobaczeniu rundy 2
    na żywo ocenił, że apka "wygląda jakby nie miała energii", a gry
    świateł dalej za mało. Przyczyna: same reguły (gradient, `inset`
    highlight) już były, ale różnica jasności między `--card` i `--card-2`
    (dwa końce gradientu karty) była zbyt mała, żeby oko faktycznie
    zarejestrowało światło — a cień był za płytki, żeby karta wyglądała na
    uniesioną. Podbite (bez powrotu do jaskrawych kolorów, tylko mocniej
    rozstawiona jasność/nasycenie tej samej, stonowanej palety): większy
    rozstaw jasności `--card`/`--card-2` w obu motywach, głębszy i bardziej
    rozmyty `--sculpt-shadow`/`--sculpt-shadow-sm`, mocniejszy
    `--highlight-edge`, bardziej nasycone `--accent`/`--primary`, wyraźniej
    widoczne (ale wciąż cienkie) `--card-border`, szerszy rozstaw gradientu
    na przyciskach/odznakach (`color-mix` z 82% do 90% bieli na jasnym
    końcu), mocniejsza opacity `.pragma-backdrop` (0.16→0.22 jasny,
    0.22→0.3 ciemny). Kontrast sprawdzony ponownie po zmianie — wyszedł
    RÓWNIEŻ lepszy niż w rundzie 2 (np. `--ink-soft` na `--paper`: było ok.
    5:1, jest ok. 4,9-8,4:1 zależnie od motywu), więc silniejszy wygląd nie
    kosztował czytelności, wręcz ją poprawił.
  - **POPRAWKA 2026-08-18(f) — runda 4**: użytkownikowi spodobał się
    ciemny, prawie czarny odcień `--primary` z rundy 3 na głównym
    przycisku ("jak perły, ale matowe") — poprosił, żeby TĘ SAMĄ czerń
    (i jej odwrotność w trybie ciemnym) konsekwentnie zastosować na
    WSZYSTKICH przyciskach, nie tylko głównym, oraz żeby panel konta
    (`account.html`) wizualnie dorównał stronie głównej. Przy okazji: tekst
    na przyciskach był na sztywno `#fdfcfa` (jasny), co w trybie ciemnym —
    gdzie `--primary` był już jaśniejszy (tan/khaki z rundy 3) — dawało
    słaby kontrast/niemal ginący napis. Zmiany:
    1. `--primary`/`--primary-dark` w jasnym motywie dobite do niemal
       czystej, ciepłej czerni (`#211f1c`/`#100f0d`); w ciemnym motywie do
       wyraźnej "brudnej bieli" (`#e7dfce`/`#cabe9c`) zamiast wcześniejszego
       tanowego odcienia — to jest właśnie żądane "odwrócenie trybu".
    2. Nowa zmienna `--btn-text` — jasna w jasnym motywie, ciemna w
       ciemnym — użyta zamiast każdego dawniej twardo wpisanego
       `color: #fdfcfa` (`button`, `.tab-btn.active`, `#userMenuBtn`).
       Bez tego czarny/biały przycisk w złym motywie miałby niewidoczny
       napis.
    3. `button.btn-secondary` (Wyloguj / Zaloguj przez Google / Wybierz
       zdjęcie — czyli DOKŁADNIE te przyciski, które użytkownik uznał za
       niespójne z resztą, w tym te na stronie konta) przebudowany z
       płaskiego jasnego tła na obrys tej samej "czarnej/białej perły" —
       `border`+`color: var(--ink)` (ten sam odcień, który motyw już
       odwraca), wypełniający się na hover tym samym kolorem co przycisk
       główny. To jednym ruchem naprawiło zarówno "przyciski nie są
       spójne", jak i "panel konta nie dorównuje głównej" — obie strony
       współdzielą tę samą klasę.
    `sw.js` `CACHE_NAME` podbite do `pragma-v15`.
  - **POPRAWKA 2026-08-18(g) — runda 5**: użytkownik dalej zgłosił, że
    panel konta "nigdy nie dociąga spójności z głównym menu". Prawdziwa
    przyczyna, przeoczona w rundzie 4: `account.html` i `scan.html` w
    ogóle NIE MIAŁY górnego paska (ikonka profilu `#userMenuBtn` + pigułka
    kredytów `#creditBalance`) — ten element istniał wyłącznie w
    `index.html`. Żadna zmiana koloru/tekstury nie mogła tego naprawić,
    bo problem był strukturalny, nie wizualny: wchodząc na konto, cały
    "główny pasek" po prostu znikał. Dodany dokładnie ten sam pasek (ta
    sama struktura HTML + `refreshCreditBalance()` z `i18n.js`) na obu
    podstronach: na `account.html` zawsze widoczny (strona już wymaga
    zalogowania, patrz `getSession()` w skrypcie), na `scan.html` — TYLKO
    dla zalogowanych, bo ta strona jest publiczna (każdy z linkiem może
    obejrzeć analizę bez logowania), więc pasek sprawdza sesję osobno i
    nie blokuje pokazania wyniku, jeśli sesji nie ma.
    Przy okazji, w tym samym zgłoszeniu: (a) aktywna zakładka trybu
    analizy (Link/Tekst/Obraz) używała terakotowego `--accent` jako tła
    ("pomarańczowa obramówka/tło przycisku, które nie pasuje do reszty")
    zamiast czarnej/białej rodziny reszty przycisków — poprawione na
    `var(--primary)`, tak jak każdy inny przycisk; `--accent` zostaje
    tylko tam, gdzie już był (linki, lewy pasek wzorca manipulacji), NIE
    jako pełne tło przycisku. (b) `button.btn-secondary` z rundy 4 był
    płaskim obrysem bez cienia/gradientu — "za mało gry światła" — dostał
    tę samą subtelną, dwuwarstwową grę światła (gradient `--card-2`→`--card`
    + `--sculpt-shadow-sm` w spoczynku) co karty i główny przycisk. (c)
    kolorowe emoji na zakładkach (🔗📝🖼️) zastąpione minimalistycznymi
    ikonami liniowymi (inline SVG, `stroke="currentColor"` — automatycznie
    dziedziczą kolor tekstu przycisku, więc też się odwracają z motywem)
    — platformowe emoji (różne na różnych telefonach, kolorowe wbrew
    reszcie stonowanej palety) nie pasowały do konceptu prestiżu z logo.
    `sw.js` `CACHE_NAME` podbite do `pragma-v16`.
  - **POPRAWKA 2026-08-18(h) — runda 6**: użytkownik ocenił, że tryb ciemny
    ma już właściwą "grę świateł"/prestiż, ale jasnemu jej brakuje.
    Znaleziona PRAWDZIWA przyczyna (nie kwestia mocy efektu, tylko
    KIERUNKU): `--card-2` MUSI być JAŚNIEJSZE niż `--card` (card-2 siedzi
    na początku gradientu, u góry karty — to on symuluje błysk światła
    padającego z góry). W trybie ciemnym tak faktycznie było
    (`--card-2: #423a2b` jaśniejsze niż `--card: #2a251d`) — efekt działał,
    bo przypadkiem trafiono właściwy kierunek. W trybie jasnym było
    ODWROTNIE (`--card-2: #e6ddc9` było CIEMNIEJSZE niż `--card: #fcfaf7`)
    — dokładnie ten sam wzór gradientu w CSS (`.card`, `.result-card`,
    `button.btn-secondary`, tło strony) w jasnym motywie robił więc coś
    przeciwnego do zamierzonego: górna krawędź karty była PRZYCIEMNIANA,
    nie rozświetlana, więc złudzenie "światła padającego z góry" nigdy nie
    powstawało, niezależnie jak mocne były cień i `--highlight-edge`.
    Naprawione: `--card` obniżone do cieplejszego kremu (`#f5f0e5`),
    `--card-2` podniesione do niemal czystej bieli (`#fffdf9`) — teraz
    zachowana poprawna kolejność jasności w obu motywach: `--card-2` >
    `--card` > `--paper`. Przy okazji lekko pogłębiony `--shadow-color`/
    `--shadow-color-soft`/`--highlight-edge` w jasnym motywie dla
    dodatkowego "uniesienia". **Ogólna zasada na przyszłość**: przy każdej
    zmianie tych dwóch zmiennych w którymkolwiek motywie, zawsze sprawdzić
    kolejność jasności `--card-2` > `--card` > `--paper` — sam ten sam
    wzór CSS w obu motywach nie gwarantuje tego samego efektu wizualnego,
    jeśli kolejność wartości zmiennych się nie zgadza.
    `sw.js` `CACHE_NAME` podbite do `pragma-v17`.
  - **POPRAWKA 2026-08-18(i)**: blok "Co teraz zrobić" pod każdym wzorcem
    (`.pattern-tip` w `scan.html`) wyglądał na telefonie na ściśnięty —
    etykieta i tekst były obok siebie w jednym wierszu (`display:flex`),
    ale sam tekst rady (bare `<span>`, bez `flex:1`/`min-width:0`) nie
    rozciągał się na dostępną szerokość, więc łamał się w wąską kolumnę z
    pustym miejscem obok, mimo że karta miała więcej miejsca do
    wykorzystania. Naprawione przez zmianę układu na kolumnowy: etykieta
    jako mały, stonowany nagłówek (uppercase, mały rozmiar) NAD tekstem,
    a sam tekst rady na pełną szerokość karty — czytelniej niż samo
    dodanie `flex:1` przy tak wąskiej etykiecie na mobile. `pattern-tip-text`
    to nowa, dedykowana klasa na `<span>` z tekstem rady (wcześniej był bez
    klasy, więc nie dało się go ostylować osobno).
    `sw.js` `CACHE_NAME` podbite do `pragma-v18`.
  - Jedna czcionka na całej stronie — 'Inter' (wcześniej nagłówki miały
    ozdobny szeryf 'Lora', usunięty na wcześniejszą prośbę użytkownika).
    Wszystkie kolory/rozmiary jako zmienne CSS w `:root` na górze
    `style.css` — zmieniaj tam, nie w poszczególnych regułach.
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
- **Nazwa użytkownika**: ustawiana automatycznie przy pierwszym logowaniu
  jako pierwszy człon adresu e-mail przed `@` (`ensureDefaultUsername()` w
  `i18n.js`, wywoływane w `index.html` przy każdym logowaniu I w
  `account.html` — więc backfill dla kont sprzed wprowadzenia tej funkcji
  dzieje się sam, przy najbliższym logowaniu, bez osobnej migracji per
  konto — jest też jednorazowe zapytanie SQL wypełniające to natychmiast
  dla WSZYSTKICH już istniejących kont, patrz niżej, żeby nie trzeba było
  czekać, aż się zalogują ponownie). Cel: docelowo kierowanie komunikacji
  do użytkownika po imieniu/nazwie, którą sobie wybrał, zamiast po surowym
  e-mailu.
  - **Limit "zmiana raz na 14 dni" wymuszony w BAZIE, nie tylko w
    przeglądarce** — wyzwalacz (`trigger`) na tabeli `profiles`
    (`enforce_username_cooldown()`) odrzuca `UPDATE`, jeśli
    `username_changed_at` jest młodsze niż 14 dni, niezależnie od tego, co
    robi frontend. To jest ten sam "zero zaufania do przeglądarki", co przy
    `user_id` z JWT — reguła biznesowa, którą naprawdę zależy nam
    wyegzekwować, nie powinna polegać wyłącznie na sprawdzeniu w JS
    (`account.html` i tak sprawdza to też po swojej stronie, dla lepszego
    UX — pokazuje datę kolejnej możliwej zmiany zamiast czekać na błąd z
    bazy — ale to tylko wygoda, nie zabezpieczenie).
  - **Nazwy SĄ unikalne między użytkownikami** — wymuszone ograniczeniem
    `UNIQUE` na `profiles.username` w bazie (nie tylko sprawdzeniem w
    przeglądarce). Pierwsza wersja tej funkcji celowo NIE miała unikalności
    (uznaliśmy, że cel to zwracanie się do KONKRETNEGO użytkownika po jego
    własnej nazwie, więc kolizje nie są problemem) — użytkownik zdecydował
    się to jednak zmienić.
    - `ensureDefaultUsername()` w `i18n.js` sam radzi sobie z kolizją przy
      automatycznym nadawaniu nazwy: jeśli pierwszy człon e-maila jest już
      zajęty (np. ten sam człon w innej domenie), dopisuje losowe 4 cyfry i
      próbuje ponownie (do 5 prób), rozpoznając kolizję po kodzie błędu
      Postgresa `23505` (unique_violation).
    - Ręczna zmiana w `account.html` przy tym samym kodzie błędu (`23505`)
      pokazuje użytkownikowi komunikat "ta nazwa jest już zajęta" zamiast
      automatycznie modyfikować to, co wpisał — w przeciwieństwie do
      automatycznego nadawania, tu chcemy, żeby użytkownik świadomie wybrał
      inną nazwę, nie dostał czegoś z dopisanymi cyframi bez pytania.
    - Ponieważ pierwsza wersja (bez unikalności) była już wdrożona i
      backfillowana z e-maili, mogły powstać duplikaty (np. dwa konta z tym
      samym pierwszym członem maila w różnych domenach) — trzeba je
      rozwiązać PRZED dodaniem ograniczenia `UNIQUE`, inaczej `ALTER TABLE`
      się nie powiedzie. SQL do tego jest w historii PR-a dodającego tę
      zmianę.
  - **Filtr niedozwolonych słów** (wulgaryzmy, obraźliwe określenia):
    `USERNAME_BLOCKLIST_BY_LANG` w `i18n.js` — osobna lista dla KAŻDEGO z 10
    obsługiwanych języków (klucze jak w `SUPPORTED_LANGUAGES`), złączona w
    jedną płaską `USERNAME_BLOCKLIST` do faktycznego sprawdzania (dopasowanie
    jako podciąg w małych literach, funkcja `containsForbiddenWord()`).
    Sprawdzenie działa niezależnie od tego, jaki język ma akurat wybrany
    interfejs — nazwa jest blokowana, jeśli zawiera zakazane słowo z
    KTÓREGOKOLWIEK języka, nie tylko aktualnie wybranego. Dla języków spoza
    alfabetu łacińskiego (ru/zh/ja/hi/ar) lista NIE była zweryfikowana przez
    osobę mówiącą danym językiem natywnie — to solidna podstawa, nie
    gwarancja bezbłędności; przy dopisywaniu chińskich/podobnych fraz uważaj
    na krótkie, pojedyncze znaki jako wpisy (np. samo "操" łapałoby też
    niewinne słowa jak "操作" - operacja/system — dlatego w liście są
    dłuższe, konkretne frazy, nie pojedyncze znaki). **To NIE jest i nigdy
    nie będzie wyczerpująca lista** — pokrywa najsilniejsze, najbardziej
    rozpoznawalne przypadki w każdym języku, trzeba ją z czasem rozszerzać,
    gdy coś się prześlizgnie (nie ma w tym nic złego — to normalne dla tego
    typu filtra, nie oznacza, że jest "zepsuty"). Sprawdzenie w przeglądarce
    to tylko wygoda (szybki komunikat bez czekania na bazę) — prawdziwe,
    nie-do-ominięcia zabezpieczenie to TA SAMA lista powielona w wyzwalaczu
    bazy `enforce_username_cooldown()` (mimo nazwy, funkcja teraz sprawdza
    trzy rzeczy na raz: limit 14 dni, listę zakazanych słów, i pośrednio —
    przez osobne ograniczenie `UNIQUE` — unikalność). **Jeśli zmieniasz
    listę w jednym miejscu, zmień ją też w drugim** (`i18n.js` i wyzwalacz w
    bazie) — inaczej `ensureDefaultUsername()` (automatyczne nadawanie
    nazwy) i ręczna zmiana w `account.html` będą się różnie zachowywać.
    `ensureDefaultUsername()` dodatkowo: jeśli sam pierwszy człon e-maila
    jest zakazanym słowem, w ogóle go nie próbuje — zaczyna od razu od
    neutralnej nazwy zastępczej (`uzytkownik` + losowe cyfry) zamiast
    dopisywać cyfry do obraźliwej podstawy.
  - **Lustro w metadanych logowania (`auth.users.user_metadata.username`)**:
    Supabase samo wysyła swoje własne maile (rejestracja, odzyskiwanie
    hasła) i te maile NIE widzą tabeli `profiles` — mają dostęp tylko do
    pól konta logowania (`{{ .Email }}`, `{{ .Data }}` = `user_metadata`
    itd.). Żeby te maile mogły zwracać się po nazwie użytkownika, KAŻDE
    miejsce, które ustawia/zmienia `profiles.username`, ustawia też
    `user_metadata.username` przez `sb.auth.updateUser({ data: { username } })`:
    `ensureDefaultUsername()` (i18n.js — także jako "naprawa" przy każdym
    logowaniu, na wypadek gdyby konto miało nazwę w `profiles`, ale nie w
    metadanych), ręczna zmiana w `account.html`, oraz `signUp()` w
    `index.html` (tam wprost, bo pierwszy mail — potwierdzenie rejestracji
    — wysyła się natychmiast, ZANIM `ensureDefaultUsername()` w ogóle
    miałoby szansę zadziałać przy pierwszym logowaniu). **Jeśli dodajesz
    nowe miejsce zmieniające `profiles.username`, pamiętaj o tym lustrze**
    — inaczej maile Supabase będą się zwracać po starej/pustej nazwie.
- **Maile transakcyjne — od teraz WŁASNA funkcja `send-auth-email`, nie
  wbudowane szablony Supabase**:
  - Supabase ma mechanizm "Send Email" Hook (Dashboard → Authentication →
    Hooks → "Send Email hook"). Gdy jest włączony, Supabase PRZESTAJE
    używać swoich wbudowanych, jednojęzycznych szablonów (Email Templates:
    "Confirm signup", "Reset Password"; oraz przełącznik "Password
    changed" w sekcji Security) i zamiast tego woła NASZĄ funkcję
    `supabase/functions/send-auth-email/index.ts` przy KAŻDYM mailu
    związanym z logowaniem/rejestracją. Dzięki temu mail wychodzi w
    języku, jaki użytkownik faktycznie ma ustawiony w aplikacji — a nie w
    jednym, na sztywno wybranym języku dla wszystkich.
  - Ta jedna funkcja obsługuje wszystkie trzy potrzebne maile (rozróżnia
    je po polu `email_data.email_action_type` z zapytania od Supabase):
    1. **Potwierdzenie rejestracji** (`signup`).
    2. **Odzyskiwanie hasła** (`recovery` — w kodzie/UI/mailu świadomie
       "odzyskiwanie", nie "reset", żeby nie mylić z punktem 3 poniżej).
    3. **Potwierdzenie zmiany hasła z panelu zalogowanego użytkownika**
       (`password_changed_notification` — Supabase wysyła ten typ maila
       automatycznie, gdy w Dashboardzie Authentication → Emails →
       sekcja "Security" włączony jest przełącznik "Password changed";
       po włączeniu hooka ten przełącznik nie wysyła już swojej starej,
       wbudowanej treści, tylko każe wywołać naszą funkcję).
    Każdy inny, nieoczekiwany typ (np. `email_change`, `magiclink`) dostaje
    ogólny szablon zapasowy (`generic` w kodzie), żeby żaden mail nigdy nie
    "zniknął" po cichu.
  - **Język i nazwa użytkownika w mailu** — kolejność sprawdzania:
    - język: `user.user_metadata.language` (wybrany PRZED rejestracją,
      zanim istnieje jeszcze profil) → `profiles.language` (ustawiony w
      panelu po zalogowaniu) → `'en'` jako ostatnia deska ratunku.
    - nazwa: `profiles.username` → `user.user_metadata.username` → część
      e-maila przed `@`.
    To ta sama logika/te same pola, co lustrowanie opisane wyżej — hook
    korzysta z `SUPABASE_SERVICE_ROLE_KEY`, żeby odczytać `profiles`
    bezpośrednio (nie ma tu sesji użytkownika, to wywołanie serwer-serwer
    od Supabase, nie z przeglądarki).
  - **`notify-password-changed`** (starsza, osobno wywoływana funkcja z
    `account.html`) została w repo jako NIEUŻYWANA — to była pierwsza,
    porzucona próba rozwiązania punktu 3, zanim odkryto najpierw wbudowany
    przełącznik "Password changed", a potem hook. Nieszkodliwa, jeśli
    zostanie.
  - Wszystkie maile są nadal wysyłane przez Brevo, ale teraz NASZ kod sam
    woła Brevo API (`BREVO_API_KEY`/`BREVO_SENDER_EMAIL`/
    `BREVO_SENDER_NAME` — te same sekrety, które wcześniej były
    skonfigurowane "na zapas" pod `notify-password-changed`, teraz w
    aktywnym użyciu) — Supabase już nie wysyła nic samo przez swój SMTP
    dla tych trzech typów maili.
  - **Weryfikacja podpisu**: Supabase podpisuje każde wywołanie hooka
    (biblioteka `standardwebhooks`, sekret `SEND_EMAIL_HOOK_SECRET` w
    formacie `v1,whsec_...`, generowany automatycznie przez Supabase przy
    włączaniu hooka w Dashboardzie — trzeba go wkleić jako sekret funkcji).
    Bez poprawnego sekretu funkcja odrzuca zapytanie (401) — to chroni
    przed tym, żeby ktoś obcy mógł kazać naszej funkcji wysłać dowolny
    mail w naszym imieniu.
  - Ton/format wszystkich maili: krótkie, ciepłe, bez żargonu, zawsze z
    bezpośrednim zwróceniem się po nazwie użytkownika, kończą się
    odpowiednikiem "Dziękujemy, że jesteś z nami od samego początku.
    Zespół Pragma" w danym języku. Treść każdego z 3 typów × 10 języków
    jest zapisana wprost w kodzie funkcji (`EMAIL_CONTENT`) — jeśli trzeba
    poprawić tekst maila, edytuje się ten plik, nie panel Supabase (panel
    już nie ma wpływu na treść tych maili, dopóki hook jest włączony).
  - **Ważne — po włączeniu hooka w Supabase Dashboardzie, treść wpisana w
    Authentication → Email Templates i przełącznik "Password changed"
    przestają mieć jakikolwiek efekt** dla tych trzech typów maili (są
    całkowicie zastąpione przez naszą funkcję) — można je zostawić bez
    zmian, nie trzeba ich usuwać, po prostu nie są już używane.
  - **Pułapka — `/auth/v1/verify` wymaga parametru `apikey`, mimo że to
    link klikany z maila, nie wywołanie z zalogowanej sesji.** Pierwsza
    wersja `actionUrl` (bez `apikey`) w realnym teście kończyła się
    błędem `"No API key found in request"` na stronie linku, a konto
    ZOSTAWAŁO niepotwierdzone (użytkownik nie mógł się potem zalogować).
    Naprawione dopisaniem `&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`
    do końca `actionUrl` — `SUPABASE_ANON_KEY` jest dostarczany
    automatycznie przez Supabase do każdej Edge Function, nie trzeba go
    ręcznie dodawać jako sekret.
  - **Pułapka — `email_data.site_url` z payloadu hooka NIE jest samym
    adresem bazowym w tym projekcie, tylko już zawiera na końcu
    `/auth/v1`.** Doklejenie do niego `/auth/v1/verify` (zgodnie z
    formułą z oficjalnej dokumentacji Supabase) dawało zdublowaną
    ścieżkę `.../auth/v1/auth/v1/verify` → 404, konto znów zostawało
    niepotwierdzone — złapane dopiero w realnym teście linku z maila, bo
    sam mail wyglądał poprawnie. Naprawione przez zbudowanie `actionUrl`
    wprost z `Deno.env.get('SUPABASE_URL')` (który na pewno nie ma
    niczego doklejonego) zamiast z `email_data.site_url`; `redirect_to`
    nadal bierzemy z payloadu. **Zawsze testuj link z prawdziwego maila
    end-to-end (klik → potwierdzenie → udane logowanie), nie tylko
    wysyłkę samego maila** — treść może wyglądać poprawnie, a link mimo
    to nie działać.
  - **Pułapka — nazwa nadawcy (`sender.name` w Brevo) musi być
    tłumaczona razem z resztą maila.** Pierwsza wersja miała jedną,
    globalną nazwę (`BREVO_SENDER_NAME`, po polsku "Zespół Pragma") dla
    WSZYSTKICH języków — w efekcie np. niemiecki mail miał poprawnie
    przetłumaczoną treść, ale w polu "Od" nadawca i tak podpisywał się
    po polsku, co wygląda na pomyłkę/niespójność. Naprawione przez
    dodanie `teamName` (nazwa zespołu w danym języku) do każdego wpisu w
    `EMAIL_CONTENT` i użycie go jako `sender.name` zamiast stałej
    zmiennej środowiskowej.
- **Limity wysyłki maili — DWA niezależne "kraniki", oba mogą zablokować
  rejestrację**:
  1. Supabase (Authentication → Rate Limits → "Rate limit for sending
     emails") — domyślnie bardzo nisko (`2` maile/h), co realnie blokowało
     rejestracje już przy drugiej próbie w ciągu godziny. Podniesione do
     `300`/h.
  2. Brevo (darmowy plan) — **300 maili na DOBĘ, łącznie wszystkie typy**
     (rejestracja + odzyskiwanie + zmiana hasła + cokolwiek przyszłego),
     nie per-użytkownik. To twardszy limit niż powyższy (godzinowy) —
     przy stałym ruchu przez wiele godzin dziennie wyczerpie się szybciej
     niż limit Supabase. Do podniesienia: przejście na płatny plan Brevo
     (Starter itd.), gdy realny ruch będzie się do tego zbliżał —
     świadomie NIE zrobione teraz (Lean Startup — nie budować/płacić za
     obronę przed ruchem, którego jeszcze nie ma).
- **Funkcja `daily-report`** (`supabase/functions/daily-report/index.ts`)
  — wysyła raz dziennie, koleżeńskim tonem (to właściciel wysyła raport
  sam do siebie, nie oficjalna komunikacja z użytkownikiem), mail z
  kluczowymi metrykami MVP: nowe rejestracje dziś + średnia z 7 dni +
  ostrzeżenie przy nietypowym skoku; analizy tekstu dziś z rozbiciem
  zalogowani/anonimowi i nowe/tłumaczenia; top 5 najczęściej oglądanych
  analiz w KAŻDYM języku, w którym coś już jest (wg `view_count`); wydane
  kredyty; maile wysłane dziś i suma od początku miesiąca (wg statystyk
  Brevo). Świadomie USUNIĘTE z raportu (właściciel ocenił jako
  niepotrzebne): łączna liczba kont, łączna liczba analiz od początku,
  liczba wykrytych wzorców manipulacji/rozumowania, średni `q_score`.
  Wyłącznie na adres właściciela (`REPORT_RECIPIENT_EMAIL`), nie do
  użytkowników. Każda metryka liczona i wysyłana niezależnie (osobny
  `try/catch`) — błąd jednej (np. drobna zmiana w API Brevo) nie
  przerywa reszty raportu, tylko pokazuje przy niej "brak danych".
  Uruchamiana z zewnątrz przez **pg_cron + pg_net bezpośrednio z bazy**
  (nie przez dashboardowy UI "Cron Jobs" — w tym projekcie taka strona nie
  istnieje w menu Database, mimo że rozszerzenie `pg_cron` jest włączone;
  harmonogram ustawiony poleceniem SQL w SQL Editor: `select
  cron.schedule('pragma-daily-report', '0 14 * * *', $$ select
  net.http_post(url:='.../functions/v1/daily-report', headers:=jsonb_build_object('x-cron-secret','...'),
  body:='{}'::jsonb) $$)`; podgląd/zmiana: `select * from cron.job;`,
  `select cron.unschedule('pragma-daily-report');`), z nagłówkiem
  `x-cron-secret` z wartością sekretu `CRON_REPORT_SECRET` — żeby nikt
  obcy nie mógł wywoływać funkcji na żądanie i generować niepotrzebnego
  ruchu/kosztów. Podobnie jak `send-auth-email`, ma wyłączoną domyślną
  weryfikację JWT (Settings → "Verify JWT with legacy secret" → OFF), bo
  wywołuje ją baza danych, nie zalogowany użytkownik — własny sekret w
  nagłówku pełni tę samą rolę.
  **Uwaga na strefę czasową**: harmonogram w `pg_cron` jest w UTC, nie w
  czasie polskim — np. żeby dostać mail o 16:00 czasu polskiego latem
  (CEST, UTC+2), trzeba ustawić cron na 14:00 UTC; zimą (CET, UTC+1) ten
  sam cron dostarczy mail o 15:00 czasu polskiego, chyba że ktoś ręcznie
  przestawi harmonogram przy zmianie czasu — świadomie zaakceptowane jako
  drobna niedogodność, nie warto tego automatyzować na etapie MVP.
  **Do dopisania w przyszłości, gdy te systemy powstaną** (świadomie
  pominięte teraz, bo jeszcze nie istnieją):
  - **Cashflow** — liczba i rodzaj kupionych pakietów (tabele
    `packages`/`package_purchases` już istnieją w bazie, ale nie ma
    jeszcze działającego przepływu zakupu w aplikacji) — gdy powstanie,
    dopisać sekcję z sumą przychodu/liczbą transakcji dziennie.
  - **Zgłaszanie błędów przez użytkowników** — taki system w ogóle
    jeszcze nie istnieje w Pragmie (ani frontend, ani tabela w bazie) —
    gdy powstanie, dopisać do raportu liczbę zgłoszeń dziennie.
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
  - **Obrazy (i docelowo PDF) świadomie WYŁĄCZONE z tej listy** (filtr
    `.neq('input_type', 'image')` w zapytaniu) — bez podglądu samego
    pliku sama tekstowa analiza obrazu nie daje przeglądającym żadnego
    kontekstu, co właściwie było analizowane, więc nie ma sensu ich
    "odkrywać" tak jak tekst/link. Bezpośredni link `scan.html?id=...`
    do takiej analizy nadal działa dla osoby, która go ma (RLS na
    `scans` pozwala na publiczny odczyt) — po prostu nie jest
    "wyszukiwalny"/nie pojawia się w przeglądaniu.
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
       przefiltrowaną bibliotekę (`buildMentalModelsLibrary()`) z kategorii
       wybranych w etapie 1 (patrz niżej — bez sztywnego limitu ich liczby),
       nie wszystkich 15.
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
    - **Poprawka jakości 2026-08-18 (zgłoszona na żywo: za mało wykrytych
      wzorców — zwykle tylko 2-3 — i wciąż te same, popularne modele)**:
      etap 1 początkowo miał sztywny limit "wybierz 1-4 kategorie", co
      systematycznie zawężało pulę modeli dostępną w etapie 2 do tych
      samych, oczywistych dziedzin (głównie psychologia/perswazja),
      pomijając np. EKONOMIA/MATEMATYKA I STATYSTYKA nawet w tekstach
      finansowych, gdzie wyraźnie pasowały. Naprawione: (1) usunięto sztywny
      limit liczby kategorii — prompt każe teraz ocenić dopasowanie KAŻDEJ z
      15 kategorii Z OSOBNA i wybrać wszystkie, które faktycznie pasują (bez
      górnej ani dolnej granicy); (2) w `buildSystemPrompt()` dodano sekcję
      "DOKŁADNOŚĆ I RÓŻNORODNOŚĆ" każącą przeglądać tekst akapit po akapicie
      zamiast poprzestawać na 2-3 najbardziej oczywistych wzorcach, z
      wyraźnym wskazaniem, żeby w tekstach finansowych/ekonomicznych aktywnie
      szukać też wzorców z kategorii EKONOMIA/MATEMATYKA I STATYSTYKA, nie
      tylko psychologicznych. **Świadomie NIE wprowadzono sztywnego minimum
      liczby wzorców w wyniku** — wymuszanie minimum groziłoby tym, że model
      zacząłby "na siłę" wymyślać słabe/naciągane wzorce tam, gdzie ich
      naprawdę nie ma, co złamałoby zasadę wierności źródłu (patrz "WIERNOŚĆ
      CYTATU" wyżej) — jakość i uczciwość analizy są tu nadrzędne nad samą
      liczbą wykrytych wzorców.
    - **Ścieżka awaryjnego pobrania strony** (`fetchUrlAsText`, patrz niżej)
      ma własny, POŁĄCZONY etap 1: `siftFallbackText()` jednym zapytaniem
      naraz (a) czyści surowy, zaszumiony tekst z menu/stopki/reklam
      (odwołanie do modelu GIGO w bibliotece) i (b) wskazuje kategorie —
      połączone w jedno zapytanie celowo, żeby ta ścieżka też miała tylko 2
      zapytania do Gemini, nie 3.
    - **Limity czasu (`fetchWithTimeout`), zdiagnozowane na żywo z
      użytkownikiem** — analiza linku do wolnej/nieodpowiadającej strony
      potrafiła czekać ponad 2 minuty, zanim w ogóle pojawił się jakikolwiek
      komunikat, bo ŻADNE z wywołań sieciowych (ani do Gemini, ani awaryjny
      `fetch` strony) nie miało limitu czasu — pojedyncze zawieszone żądanie
      trzymało całą analizę bez ograniczeń. `callGemini()` ma teraz twardy
      limit `GEMINI_TIMEOUT_MS = 20000` (przy przekroczeniu zwraca pusty
      obiekt, więc dalszy kod traktuje to jak zwykły błąd Gemini — nie
      wywala się nieobsłużonym wyjątkiem), `fetchUrlAsText()` ma
      `FALLBACK_FETCH_TIMEOUT_MS = 10000`. Analiza linku w najgorszym razie
      robi 5 kolejnych zapytań sieciowych (kategoryzacja → właściwa analiza
      → awaryjne pobranie strony → sito → druga właściwa analiza) — z tymi
      limitami górna granica całości to ok. 90s, nie "bez ograniczeń".
- **Zabezpieczenia jakości w `buildSystemPrompt()`, zdiagnozowane na żywo z
  użytkownikiem** — traktowane jako zasady NADRZĘDNE (osobne sekcje w
  prompcie, na równi z NEUTRALNOŚĆ/BEZPIECZEŃSTWO):
  - **"WIERNOŚĆ CYTATU"**: model nie ma prawa w żaden sposób zmieniać treści
    źródła, gdy się do niej odwołuje w polu `quote` — żadnej zmiany
    wielkości liter, ucinania/dodawania słów, "wygładzania". Powód
    techniczny: `scan.html` podświetla w pełnym tekście źródłowym dokładnie
    te fragmenty, które `quote` cytuje (patrz `buildHighlightedText()`) —
    jeśli model zmieni choć jedną literę (typowo: ucina wiodące "i"/"a" i
    zamienia kolejne słowo na wielką literę, żeby "ładniej" zaczynało
    zdanie), dopasowanie 1:1 zawodzi i fragment w ogóle się nie podświetla.
    Frontend ma na to dodatkowy, niezależny fallback (`findQuoteRange()` w
    `scan.html`: dopasowanie bez wielkości liter, a potem bez pierwszych
    1-3 słów cytatu) — ale to tylko siatka bezpieczeństwa, NIE zwalnia
    promptu z wymogu dosłowności; to jedno z pól, gdzie nawet drobne,
    pozornie kosmetyczne odstępstwo modela ma realny, widoczny skutek dla
    użytkownika.
  - **"KTO NAPRAWDĘ TWIERDZI, ŻE COŚ SIĘ WYDARZYŁO"**: zapobiega myleniu
    autora RELACJONUJĄCEGO cudze (fałszywe) twierdzenie na swój temat
    (np. "z reklamy dowiedziałem się, że rzekomo...") z autorem opisującym
    własne, prawdziwe przeżycie — zdiagnozowane na żywym przykładzie, gdzie
    Gemini błędnie rozpoznał Efekt Halo w relacji ofiary fałszywej reklamy,
    zamiast rozpoznać samo oszustwo jako wzorzec manipulacji.
- **Zmieniające się komunikaty podczas oczekiwania na analizę**: skoro
  pełna analiza to teraz kilka kolejnych zapytań do AI (kategoryzacja →
  właściwa analiza → czasem jeszcze awaryjne pobranie strony), potrafi to
  trwać kilka-kilkanaście sekund (albo, przy wolnych stronach, nawet
  blisko minuty — patrz limity czasu w sekcji o analizie linku wyżej).
  Zamiast martwego "Analizuję...", `index.html` co ok. 2,8s podmienia tekst
  statusu na kolejny z listy 12 komunikatów (`status_step_1`...`status_step_12`
  w `i18n.js`, np. "Sprawdzam, czy ktoś już to analizował...", "Czytam
  treść uważnie...") — ten sam trik, którego używają czaty AI pokazując "co
  właśnie robię", żeby czekanie nie wyglądało na zawieszenie strony.
  Rozszerzone z 6 do 12 komunikatów i spowolnione z 2,2s do 2,8s (zgłoszone
  na żywo: przy dłuższych analizach 6 komunikatów co 2,2s zdążało się
  powtórzyć kilka razy i wyglądało na zapętlone/zepsute). Interwał
  (`setInterval`) jest czyszczony w każdej gałęzi (sukces/błąd/`finally`) —
  pilnuj tego, jeśli będziesz przerabiać tę
  część kodu, inaczej komunikaty będą dalej migać po zakończeniu żądania.
- **Pułapka — dynamicznie budowane napisy NIE odświeżają się same przy
  zmianie języka**: `setLanguage()` (w `i18n.js`) wywołuje `applyTranslations()`,
  który aktualizuje WYŁĄCZNIE elementy oznaczone `data-i18n`/
  `data-i18n-placeholder`/`data-i18n-aria-label` w HTML-u. Każdy napis
  budowany ręcznie w JS przez `t(...)` (np. komunikat z wstawioną datą, jak
  `username_cooldown_note` w `account.html`) NIE jest tym mechanizmem objęty —
  zostaje w starym języku, dopóki coś świadomie go nie przebuduje. Realny
  błąd z tej sesji: zmiana języka w ustawieniach konta nie odświeżała
  komunikatu o dacie kolejnej możliwej zmiany nazwy użytkownika, dopóki
  strona nie została ręcznie przeładowana. Naprawione przez jawne
  wywołanie funkcji renderującej ten komunikat (`renderUsernameCooldown()`)
  zaraz po `setLanguage(...)` w handlerze zmiany języka. **Zasada na
  przyszłość**: przy dodawaniu nowego napisu budowanego w JS przez `t(...)`
  (nie przez `data-i18n`), sprawdź, czy powinien się przebudować przy
  zmianie języka bez przeładowania strony — jeśli tak, jawnie wywołaj
  funkcję renderującą go w handlerze zmiany języka, tak jak tutaj.
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
- `wallet_balance` (integer, `NOT NULL DEFAULT 20`) — saldo kredytów
  (darmowy bonus powitalny)
- `reputation_score` (double precision, `NOT NULL DEFAULT 1.0`) —
  zarezerwowane pod przyszłą funkcję, nieużywane jeszcze w kodzie aplikacji
- `trust_tier` (text, `NOT NULL DEFAULT 'nowy'`) — jw., zarezerwowane,
  nieużywane jeszcze w kodzie
- `created_at` (timestamptz, `DEFAULT now()`)
- `language` (text, `NOT NULL DEFAULT 'en'`) — ustawienie języka konta
- `theme` (text, `NOT NULL DEFAULT 'light'`) — ustawienie motywu (`light`/
  `dark`), ten sam wzorzec co `language` (patrz niżej "Motyw jasny/ciemny")
- `username` (text, nullable) — nazwa użytkownika, patrz niżej "Nazwa
  użytkownika"
- `username_changed_at` (timestamptz, nullable) — kiedy ostatnio zmieniono
  `username`; używane przez wyzwalacz bazy wymuszający limit "raz na 14 dni"

**Jak powstaje wiersz `profiles`** (WAŻNE, poważny błąd naprawiony
2026-08-17): wyzwalacz `on_auth_user_created` na `auth.users` (funkcja
`public.handle_new_user()`, `SECURITY DEFINER`) wstawia wiersz do
`profiles` (samo `id` + `language` odczytany z
`raw_user_meta_data->>'language'`, reszta kolumn wypełnia się z
wartości domyślnych) zaraz po każdej nowej rejestracji. **Ten
mechanizm żyje WYŁĄCZNIE w bazie Supabase — nie ma go nigdzie w tym
repozytorium** (żaden plik `.ts`/`.html` nie tworzy wiersza `profiles`).
Odkryte, że przez jakiś czas (co najmniej od 14 sierpnia, prawdopodobnie
dłużej — dokładna data nieznana) ten automat w ogóle nie istniał w
bazie, więc ŻADNE nowe konto nie dostawało wiersza `profiles`, czyli
też nie dostawało darmowego bonusu 20 kredytów, a synchronizacja
języka/motywu/nazwy użytkownika cicho się nie udawała (objawiało się to
błędami `406` z PostgREST przy `.single()` na `profiles` — 406 tam
znaczy "zapytanie się wykonało, ale nie znalazło dokładnie jednego
wiersza"). Naprawione: 1) jednorazowy backfill (`INSERT ... SELECT ...
WHERE p.id IS NULL`) uzupełnił profile wszystkim istniejącym kontom,
które go nie miały; 2) stworzony od nowa wyzwalacz `on_auth_user_created`
zabezpiecza wszystkie przyszłe rejestracje. **Jeśli w przyszłości znowu
pojawi się problem "nowe konto nie ma ustawień/kredytów/nazwy" — najpierw
sprawdź, czy ten wyzwalacz nadal istnieje**
(`select tgname from pg_trigger where tgrelid = 'auth.users'::regclass`
— szukaj `on_auth_user_created` wśród standardowych
`RI_ConstraintTrigger_...`), zanim zaczniesz szukać gdzie indziej.

**`scans`** (współdzielony cache analiz, publiczny odczyt w RLS):
- `id`, `content_hash` (klucz cache'u treści), `input_type` (`text`/`url`/
  `image`), `language` (text, `NOT NULL DEFAULT 'en'` — **razem z
  `content_hash` tworzy właściwy klucz cache'u**), `is_translation`
  (boolean, `NOT NULL DEFAULT false` — `true`, gdy wynik powstał przez
  przetłumaczenie istniejącej analizy z innego języka, a nie przez pełną
  analizę AI; używane, żeby zawsze tłumaczyć z prawdziwego oryginału,
  nigdy z tłumaczenia), `source_url`, `text_content` (text, nullable —
  pełna treść wklejonego tekstu, TYLKO dla `input_type = 'text'`; świadoma
  decyzja, że to jest trwałe i publiczne jak `source_url` dla linku, NIE
  ulotne jak obraz — patrz "Analiza tekstu, linków i obrazów" niżej),
  `char_count`, `credits_charged`,
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

**`failed_scan_attempts`** (log surowych nieudanych analiz, patrz "Ochrona
cashflow" niżej):
- `id`, `user_id`, `created_at`

**`rate_limit_blocks`** (log nałożonych blokad, patrz "Ochrona cashflow"
niżej):
- `id`, `user_id`, `blocked_until`, `created_at`

RLS: `scans` ma publiczny odczyt (używane przez niezalogowanych w
przeglądarce publicznych analiz i na `scan.html`). Zapis do `scans`/
`profiles`/`wallet_transactions`/`failed_scan_attempts`/`rate_limit_blocks`
idzie przez `service_role` w Edge Function (backend), nie bezpośrednio z
przeglądarki — **z jednym wyjątkiem**: `profiles.language` jest
aktualizowane bezpośrednio z przeglądarki (`setLanguage()` w `i18n.js`,
wywoływane z sesją zalogowanego użytkownika), więc `profiles` ma regułę RLS
pozwalającą zalogowanemu użytkownikowi na `UPDATE` własnego wiersza
(`auth.uid() = id`), obok istniejącej reguły `SELECT`.

## Ochrona cashflow przed nadużyciem (rate limiting) — dodane 2026-08-18

**Problem**: nieudana analiza (np. link, którego nie da się pobrać, albo
błąd Gemini) kosztuje nas realne zapytania do Gemini API, ale NIE zarabiamy
nic — kredyty ściągamy dopiero po sukcesie (patrz `analyze/index.ts`,
sekcja 7). Bez ograniczenia jedno konto mogłoby (przez pomyłkę albo celowo)
zasypywać backend nieudanymi próbami bez końca, generując nam koszty API
bez żadnego przychodu.

**Rozwiązanie** (`analyze/index.ts`, stałe `RATE_LIMIT_*`, funkcja
`logFailedAttempt()` wywoływana przy każdym `url_fetch_failed`/
`gemini_error`/`save_failed` dla zalogowanego użytkownika):
- Próg wyzwalający blokadę jest zawsze ten sam: **15 nieudanych prób w
  ciągu 10 minut** na jedno konto (log w `failed_scan_attempts`) — próg
  celowo wysoki, bo przy tak tanim modelu (patrz niżej) nawet 15 prób to
  wciąż znikomy koszt, a wysoki próg mocno zmniejsza ryzyko złapania
  prawdziwego użytkownika przez zwykłego pecha.
- Po przekroczeniu progu konto dostaje CHWILOWĄ blokadę — nowe analizy są
  odrzucane komunikatem `too_many_failed_attempts` (z dokładnym znacznikiem
  czasu `blocked_until`, po którym frontend pokazuje żywo odliczający
  licznik do końca blokady — patrz `formatCountdown()`/`renderResult()` w
  `index.html`), zanim cokolwiek policzymy czy wywołamy Gemini.
- **Kara rośnie TRZYKROTNIE z każdą kolejną blokadą tego samego konta**:
  10 min → 30 min → 1,5h → 4,5h → ... aż do sufitu 30 dni
  (`RATE_LIMIT_MAX_MINUTES`). Licznik blokad (w `rate_limit_blocks`) liczy
  się z ruchomego, 30-dniowego okna wstecz (`RATE_LIMIT_STRIKE_RESET_DAYS`)
  — jeśli konto 30 dni nie zbiera nowych blokad, kara **sama wraca** do
  najniższego poziomu (10 minut), bez żadnej ręcznej interwencji. Okno
  resetu musi być >= sufitowi kary — inaczej "pamięć" o karze wygasałaby,
  zanim najdłuższa możliwa blokada w ogóle by się skończyła, i konto, które
  właśnie odsiedziało maksymalną karę, zaraz dostałoby najniższą (pierwotnie
  było to 7 dni, poprawione po tym, jak Arek zauważył tę niespójność
  2026-08-18).
- **Świadomie NIE ma automatycznego, trwałego banowania konta** — przy
  tanim modelu (Gemini Flash-Lite, ułamek grosza za zapytanie) nawet
  ciągłe, całodobowe uderzanie w limit jednego konta to koszt rzędu
  pojedynczych groszy dziennie, więc realne ryzyko finansowe z JEDNEGO
  konta jest znikome. Trwałe banowanie byłoby nieproporcjonalną karą
  (trudną do odwrócenia — może przez pomyłkę trwale zablokować prawdziwego
  użytkownika, który po prostu trafił na kilka zepsutych linków pod rząd).
  Rosnąca (×3), ale zawsze cofalna kara ma być "stabilnie i zniechęcająco"
  uciążliwa dla kogoś, kto naprawdę próbuje nadużywać systemu, bez
  ryzyka trwałej, nieodwracalnej blokady prawdziwego konta.
- **Świadomie POZA zakresem tej zmiany**: ochrona przed atakiem przez wiele
  fałszywych kont naraz (rejestracja jest dziś darmowa i bez weryfikacji) —
  to inny problem (ochrona samej rejestracji: e-mail, captcha, limit kont z
  jednego IP), nierozwiązany tym mechanizmem. Rate limiting opisany wyżej
  chroni tylko przed nadużyciem PRZEZ JEDNO konto.
- Mechanizm dotyczy WYŁĄCZNIE zalogowanych — dla anonimowych pierwszy skan
  tekstu jest darmowy niezależnie od wyniku, więc nie ma tam dodatkowego
  ryzyka finansowego do ograniczenia tym mechanizmem.

## Cennik (do skalibrowania na realnych danych — na razie przybliżenia)

- Tekst: `FIXED_FEE (2) + ceil(char_count / 1000) * MULTIPLIER (1)`.
- Link: płaska stawka `URL_SCAN_COST = 6` — długości strony nie znamy
  przed wywołaniem Gemini, więc nie da się wycenić dokładnie; analiza
  linku wymaga zawsze konta (nie ma trybu anonimowego dla linków, żeby
  ktoś nie wygenerował dużego kosztu API za darmo, podając link do
  ogromnej strony).
- Pierwszy skan anonimowy (tylko tryb tekstowy): darmowy do
  `ANONYMOUS_MAX_CHARS = 3000` znaków.
- **Obraz**: stawka `IMAGE_SCAN_COST = 8` **za każdy obraz z osobna**, tak
  jak link wymaga zawsze konta (brak trybu anonimowego). Od 2026-08-18
  można wybrać **więcej niż jeden obraz naraz** (do `MAX_IMAGES_PER_SCAN =
  6`, ta sama liczba musi się zgadzać w `index.html` jako
  `MAX_SELECTED_IMAGES` — jeśli zmieniasz limit, zmień w obu miejscach) —
  koszt to `IMAGE_SCAN_COST × liczba obrazów`, ale **analiza jest jedna,
  wspólna dla wszystkich obrazów razem** (jedna lista wzorców, bez
  przypisania który wzorzec pochodzi z którego obrazu — świadoma decyzja
  na rzecz prostoty, patrz decyzja użytkownika z 2026-08-18: "bez
  przypisania" zamiast dodatkowego pola i UI na numer obrazu). Limit
  rozmiaru pliku: **8 MB na obraz** + dodatkowy, ostrożny limit **20 MB
  łącznie** (`MAX_TOTAL_IMAGE_BYTES`) dla całego zestawu — oba egzekwowane
  PO OBU stronach (przeglądarka daje szybki komunikat, ale prawdziwe
  zabezpieczenie jest w backendzie — nigdy nie ufamy samej przeglądarce).
  Backend rozpoznaje prawdziwy typ pliku po jego zawartości (magiczne
  bajty na początku pliku — JPEG/PNG/GIF/WEBP), nie po tym, co deklaruje
  przeglądarka — ten sam wzorzec "zero zaufania" co przy `user_id` z body
  — sprawdzane dla KAŻDEGO obrazu z osobna. Jedno wywołanie Gemini (ze
  wszystkimi obrazami jako kolejne części `inlineData` w tej samej
  wiadomości) z pełną biblioteką 100 modeli (bez taniego etapu
  kategoryzacji jak przy tekście/linku — nie ma z góry żadnego tekstu, po
  którym dałoby się zgrubnie wybrać kategorie). Moderacja niedozwolonej
  treści (patrz niżej) sprawdza WSZYSTKIE obrazy naraz — jeśli
  którykolwiek jest niedozwolony, cała próba (wszystkie obrazy w tym
  zestawie) jest karana pełną, zsumowaną stawką, tak jak dziś dla
  pojedynczego obrazu. `content_hash` dla cache'u to hash CAŁEGO zestawu
  (konkatenacja hashów poszczególnych obrazów w kolejności wyboru, potem
  zahashowana ponownie) — inny zestaw albo inna kolejność to inna,
  osobno wyceniona analiza. Podglądy w `scan.html` (jednorazowe, z
  sessionStorage, nigdy nie trafiają na serwer) też są teraz tablicą,
  jedną na obraz.
- **Wciąż nieustalone**: ile 1 kredyt ma być wart w złotówkach/dolarach.
  Bez tego nie da się policzyć realnej marży w walucie, tylko w
  procentach. Jak wypadnie ta rozmowa — dopisz tu ustaloną wartość.
- **Koszt API jest ułamkiem grosza względem jakiejkolwiek sensownej ceny
  za kredyt** — dla `gemini-3.5-flash-lite` ($0,30 / $2,50 za milion
  tokenów wejścia/wyjścia, zweryfikowane na żywo 17.08.2026 — potwierdzone
  bezpośrednio na `ai.google.dev/gemini-api/docs/pricing`, wciąż aktualne)
  pojedyncza analiza tekstu kosztuje rzędu $0,0007-0,0035 zależnie od
  długości treści, a obrazu podobnie mało: **obraz ≤384px w każdym
  wymiarze to 258 tokenów; większe obrazy dzielone są na kafelki
  768×768px, każdy też po 258 tokenów** (zweryfikowane na
  `ai.google.dev/gemini-api/docs/tokens`) — nawet dla dużego zdjęcia to
  rzędu $0,0015-0,002 za analizę. **PDF-y są liczone Google WEDŁUG TEJ
  SAMEJ stawki co obrazy** (oficjalna adnotacja: "Tokens for the DOCUMENT
  modality... are billed at the image token rate") — stąd założenie w
  planie na fazę 2, że jedna strona PDF-a ≈ jeden obraz kosztowo. Oznacza
  to, że marża na pojedynczej transakcji jest z natury tego biznesu
  blisko 100% niezależnie od typu treści — różnica liczy się dopiero w
  **zsumowanym** koszcie operacyjnym przy dużej skali, nie w procencie
  marży na jednej analizie (patrz też sekcja "Ponowne użycie przez
  tłumaczenie" wyżej).

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

- **Gemini "widzi" tylko najbardziej wyrazisty obraz z kilku naraz** (złapane
  na żywo 2026-08-18, zaraz po wdrożeniu analizy wielu obrazów): mimo że
  wszystkie obrazy trafiały w jednym zapytaniu do Gemini jako kolejne
  `inlineData`, a instrukcja mówiła "przeanalizuj wszystkie razem", model w
  praktyce analizował TYLKO pierwszy/najbardziej rzucający się w oczy obraz
  (np. reklamę z tekstem) i całkowicie pomijał resztę (np. zrzuty ekranu
  telefonu bez wyraźnej treści) — bez żadnego komunikatu o pominięciu. Model
  bez jawnego rozgraniczenia nie "widzi" osobnych, policzalnych elementów,
  tylko jeden rozmyty zbiór danych. Naprawione dwuczęściowo w
  `analyze/index.ts` (gałąź `input_type === 'image'`, >1 obraz): (1) każdy
  obraz dostaje jawną etykietę tekstową `"OBRAZ N:"` jako osobną część
  (`part`) TUŻ PRZED nim w zapytaniu — nie samo `inlineData` bez opisu; (2)
  instrukcja wprost zabrania pomijania któregokolwiek obrazu i wymusza, żeby
  pole `summary` jawnie wymieniało, w których obrazach (po numerze) wykryto
  wzorce, a w których nie wykryto żadnych — więc nawet gdyby model coś
  pominął, będzie to widoczne w treści wyniku, a nie ukryte. **Ogólna
  lekcja, nie tylko dla obrazów**: przy każdym zadaniu, gdzie model ma
  jednakowo potraktować kilka odrębnych elementów naraz (kilka obrazów,
  kilka fragmentów tekstu, kilka linków), nie wystarczy o to poprosić w
  jednym zdaniu — elementy muszą być jawnie ponumerowane/oznaczone w samym
  zapytaniu, a wynik musi dawać sposób na sprawdzenie, że żaden nie został
  po cichu pominięty.
- **Service Worker cache**: przy każdej zmianie pliku, który jest w
  `ASSETS` (precache) w `sw.js`, trzeba pamiętać o podbiciu `CACHE_NAME`.
  Kilka PR-ów z rzędu o tym zapomniało, co skutkowało tym, że użytkownicy
  utknęli ze starą wersją `style.css` mimo kilku wdrożeń. Rozwiązanie
  systemowe (nie tylko dyscyplina pamiętania): pliki `.html`, `.css`,
  `.js` i `manifest.json` są na strategii **network-first** (zawsze
  próbują pobrać świeżą wersję z sieci, cache tylko jako fallback offline)
  — tylko ikony zostały na cache-first.
  **POPRAWKA 2026-08-18(c)**: samo "network-first" nie wystarczyło — po
  wdrożeniu rundy 2 stylu "Rzeźba" część telefonów dalej pokazywała stary
  `style.css` (brakującą regułę `.pragma-backdrop` widać było jako
  ogromny, nierozmyty, nieprzezroczysty kształt zamiast delikatnej poświaty
  w tle). Przyczyna: zwykłe `fetch(event.request)` w Service Workerze
  respektuje **wewnętrzną pamięć podręczną przeglądarki (HTTP cache)** —
  to zupełnie inny mechanizm niż `Cache Storage`/`CACHE_NAME`, na który SW
  ma kontrolę. Jeśli serwer (GitHub Pages) wysłał nagłówek pozwalający na
  krótkie cache'owanie pliku, przeglądarka mogła oddać starą, podręcznie
  zapisaną wersję `style.css`, mimo że kod SW "próbował" pobrać z sieci —
  fetch nigdy faktycznie nie dotarł do serwera. Naprawione przez dodanie
  `{ cache: 'reload' }` do wywołania `fetch()` dla plików `.html`/`.css`/
  `.js`/`manifest.json` — to jawnie każe przeglądarce pominąć HTTP cache i
  zapytać serwer o świeżą wersję. Ogólna zasada na przyszłość: "network-
  first" w Service Workerze musi jawnie wymuszać pominięcie HTTP cache
  (`cache: 'reload'` lub `'no-store'`), inaczej "sieć" może po cichu
  oznaczać "stara wersja z podręcznej pamięci przeglądarki".
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
- Analiza PDF (obraz już DZIAŁA — patrz sekcja "Cennik" i
  `supabase/functions/analyze/index.ts` — PDF to jedyna część tego punktu
  wciąż odłożona na później, zaplanowana jako osobny, dwuetapowy flow z
  ekranem potwierdzenia kosztu przed właściwą analizą; szczegóły planu
  trzymane w liście zadań sesji, nie tutaj, żeby nie duplikować). Dwa
  dodatkowe wymagania ustalone dla tej fazy: 1) obrazy WEWNĄTRZ
  analizowanego PDF-a mają być pomijane, nie analizowane (tylko sam
  tekst); 2) analizy PDF-ów NIE mają być udostępniane publicznie w
  przeglądarce analiz — tak jak obrazy (patrz "Przeglądarka publicznych
  analiz" wyżej), tylko mocniej: użytkownik poprosił, żeby PDF-y w ogóle
  nie trafiały do tego mechanizmu odkrywalności.
- Ekran intencji zakupowej (Fake Door test).
- Obniżanie darmowego bonusu powitalnego / limity rejestracji po IP w
  Supabase — świadomie odłożone (zasada Lean Startup: nie buduj obrony
  przed zagrożeniem, które się jeszcze nie zmaterializowało).
- System zgłaszania błędów przez użytkowników (frontend + tabela w
  bazie) — jeszcze nie istnieje. Gdy powstanie, dopisać jego statystyki
  (liczba zgłoszeń dziennie) do `daily-report`, patrz opis tej funkcji
  wyżej.
- Statystyki cashflow (liczba/rodzaj kupionych pakietów) w
  `daily-report` — tabele `packages`/`package_purchases` już są w
  bazie, ale brak jeszcze działającego przepływu zakupu w aplikacji;
  gdy powstanie, dopisać tę sekcję do raportu.

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
- **Pragma to przede wszystkim aplikacja mobilna (PWA)** — przy KAŻDEJ
  zmianie wizualnej/UI pilnuj responsywności na telefonach, nie tylko na
  desktopie/tablecie (użytkownik świadomie o to poprosił). W praktyce:
  `style.css` na razie nie ma żadnych `@media` (celowo — układ jest
  płynny, jedna kolumna kart o ograniczonej `max-width`, co dotąd
  wystarczało), ale przy dodawaniu nowych elementów, zwłaszcza
  `position: fixed` (jak `#userMenuBtn`/`.credit-balance` w prawym
  górnym rogu), sprawdź w myślach (albo realnie, w narzędziach
  deweloperskich przeglądarki, w trybie widoku mobilnego) wąski ekran
  (~320-360px szerokości) — czy elementy się nie nachodzą, nie wychodzą
  poza ekran, tekst się nie przycina w nieczytelny sposób.
