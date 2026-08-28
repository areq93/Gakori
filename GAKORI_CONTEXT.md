# Gakori — kontekst projektu

Ten plik jest **jedynym trwałym źródłem prawdy** o projekcie, niezależnym od
jakiejkolwiek pojedynczej rozmowy z Claude. Rozmowy się kończą albo się
streszczają, gdy się wydłużą — ten plik zostaje w repozytorium. Każda
większa zmiana w projekcie powinna kończyć się aktualizacją tego pliku, w
tym samym PR-ze co reszta zmian.

Jeśli zaczynasz nową rozmowę z Claude o tym projekcie — zacznij od
przeczytania tego pliku w całości, zanim zaczniesz cokolwiek zmieniać.

## Komenda: „zaktualizuj GAKORI_CONTEXT.md”

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

## Co to jest Gakori

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
    kluczem `gakori_scan_image_<id>` w `sessionStorage` (dane w pamięci JS nie
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
      aplikacji/systemu kopiującego, nie błąd w kodzie Gakori. Kod sprawdza
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
  - **PDF (`input_type: "pdf"`, wdrożone 2026-08-19)** — jeden plik na raz
    (w przeciwieństwie do obrazów, gdzie można kilka naraz — PDF-y bywają
    duże/wielostronicowe, wiele naraz to zbyt duże ryzyko kosztowe na
    start). Backend liczy strony LOKALNIE (`npm:pdf-lib`,
    `loadPdfDocument()`), BEZ angażowania Gemini — to musi być darmowe, bo
    dzieje się PRZED ewentualną zgodą użytkownika na koszt:
    - **Od POPRAWKA 2026-08-23(a), punkt C10, KAŻDY PDF wymaga wprost
      potwierdzenia kosztu, niezależnie od liczby stron** (dawniej: tylko
      powyżej `PDF_AUTO_ANALYZE_MAX_PAGES = 20`, stała usunięta —
      wybranie pliku samo w sobie nie jest jeszcze świadomą zgodą na
      konkretny koszt, nawet dla małego pliku). Backend NIE wywołuje
      Gemini i NIC nie obciąża — zwraca `{ needs_confirmation: true,
      page_count, estimated_cost }`. Frontend pokazuje ekran zgody
      (`#pdfConfirmOverlay` w `index.html`, ten sam wspólny ekran obsługuje
      od 2026-08-23 też link — patrz "Cennik" niżej) z liczbą stron,
      kosztem w kredytach i porównaniem "ile to jest w kawach/herbatach"
      (patrz niżej), użytkownik klika "Tak, analizuj" → frontend wysyła TO
      SAMO zapytanie ponownie z `confirmed: true`, dopiero wtedy leci dalej
      do Gemini i faktycznego obciążenia.
    - **> `PDF_HARD_MAX_PAGES` (80) stron**: zawsze odrzucone
      (`pdf_too_long`), NIE do ominięcia nawet przez `confirmed: true` —
      bezwzględny sufit (patrz POPRAWKA 2026-08-19 niżej, dlaczego akurat
      80, a nie pierwotnie planowane 150).
    - **Rozmiar pliku**: twardy limit `MAX_PDF_BYTES` = **10 MB** (patrz
      też POPRAWKA 2026-08-19 niżej) — świadomie mniej niż 20 MB limitu
      łącznego dla obrazów.
    - **Koszt**: `PDF_PAGE_COST = IMAGE_SCAN_COST` (8 kredytów/stronę) —
      "jedna strona PDF-a ≈ jeden obraz kosztowo", patrz uzasadnienie w
      sekcji "Cennik" niżej (Google faktycznie liczy PDF wg tej samej
      stawki tokenów co obraz).
    - **Obrazy WEWNĄTRZ PDF-a są pomijane, nie analizowane** — Gemini
      fizycznie "widzi" całą stronę PDF-a naraz (tekst + ewentualne
      obrazy razem, jako `inlineData` z `mimeType: 'application/pdf'`),
      więc jedyny sposób to wprost mu zakazać w instrukcji promptu
      (`pdfInstruction` w `analyze/index.ts`) — nie ma osobnego
      mechanizmu technicznego, który by to wymuszał.
    - **Analizy PDF-ów NIGDY nie są publiczne** — wykluczone z
      przeglądarki publicznych analiz (`index.html`, zapytanie
      `.not('input_type', 'in', '(image,pdf)')`) SILNIEJ niż obrazy, i (od
      POPRAWKI 2026-08-19(b), patrz "Prywatność PDF-ów" niżej) NAPRAWDĘ
      prywatne na poziomie bazy (RLS), nie tylko ukryte z listy —
      `scan.html?id=...` do cudzego PDF-a od tej zmiany już NIE działa,
      inaczej niż przy tekście/linku/obrazie.
    - **Limit czasu zapytania do Gemini**: PDF-y (zwłaszcza bliżej
      górnego limitu stron) potrafią potrzebować więcej niż standardowe
      20s reszty zapytań w tej funkcji — `callGemini()` przyjmuje teraz
      opcjonalny parametr `timeoutMs` (domyślnie `GEMINI_TIMEOUT_MS`),
      dla PDF-a wywoływany z osobnym, dłuższym `PDF_GEMINI_TIMEOUT_MS`
      (60s). Musi być SKOŃCZONY (system nigdy nie może czekać w
      nieskończoność — wyraźna prośba użytkownika), ale wystarczająco
      długi, żeby duży, wciąż dozwolony plik miał realną szansę się
      doliczyć zamiast ucinać się w połowie.
    - **Porównanie kosztu "w kawach"** (`costComparisonText()` w
      `i18n.js`) — użytkownik wprost poprosił, żeby zamiast suchej liczby
      kredytów (albo prawdziwej kwoty w walucie) pokazywać porównanie do
      codziennej, taniej przyjemności ("mała kawa" itp.). Dwie ważne
      decyzje projektowe, żeby się nie pomylić przy poprawkach:
      1. To NIE jest przelicznik po realnym kursie waluty — realna cena
         kawy w Indiach/Egipcie przeliczona 1:1 dałaby absurdalne "21
         herbat" zamiast wrażenia "tyle co drobna przyjemność". Zamiast
         tego: JEDNA, STAŁA liczba kredytów = "1 sztuka" wszędzie na
         świecie (450 kr. w najniższym progu, oparta o realny punkt
         odniesienia użytkownika: mała kawa w Polsce, 16-20 zł) —
         zmienia się TYLKO nazwa/rozmiar przedmiotu wraz z progiem
         kredytów (< 1000 → mała, 450 kr./szt.; 1000-3000 → średnia, 900
         kr./szt.; > 3000 → duża, 1800 kr./szt. — patrz stałe
         `COST_COMPARISON_UNIT_PRICE_*` w `i18n.js`), nigdy kurs waluty.
      2. Wynik formatowany jako "N × przedmiot" (jak paragon), NIE przez
         odmianę rzeczownika przez liczbę — w kilku obsługiwanych
         językach (polski, rosyjski, arabski) poprawna odmiana
         wymagałaby osobnej gramatyki dla 1/2-4/5+, a zapis "N ×" brzmi
         naturalnie wszędzie bez żadnej odmiany.
      Powyżej `COST_COMPARISON_CAP_UNITS` (4) "sztuk" porównanie
      przestaje być pomocne — funkcja zwraca `null`, frontend wtedy
      pokazuje samą liczbę kredytów bez tej linijki. Rodzaj napoju (2
      opcje na język, np. kawa/herbata) losowany przy każdym wywołaniu.
    - **POPRAWKA 2026-08-19 — przegląd ryzyka inżynierskiego przed
      wdrożeniem, na wyraźną prośbę użytkownika ("jakie zagrożenia dla
      cashflow, systemu i użytkownika? jakie pętle dodatnie/ujemne?").
      Znaleziono i naprawiono PRZED pierwszym wdrożeniem:**
      1. **Limit czasu procesora Supabase (sprawdzone na żywo w
         dokumentacji, 19.08.2026) to tylko 2 SEKUNDY realnej pracy
         procesora na całe zapytanie** — czekanie na Gemini w to NIE
         wlicza się (to I/O, nie liczenie), ale `loadPdfDocument()`
         (pdf-lib) to prawdziwa, synchroniczna praca procesora, na
         słabszym/współdzielonym sprzęcie serwera niż komputer
         deweloperski. Limit czasu ODPOWIEDZI (400s) i limit PAMIĘCI (150
         MB) są na tyle hojne, że nie są tu wąskim gardłem — dlatego
         wcześniej wybrany limit czasu na zapytanie do Gemini (60s, patrz
         `PDF_GEMINI_TIMEOUT_MS` wyżej) zostaje bez zmian, ale limity
         PLIKU zostały obniżone: `PDF_HARD_MAX_PAGES` ze 150 na **80**,
         `MAX_PDF_BYTES` z 20 MB na **10 MB** — świadomie OSTROŻNIEJ niż
         pierwotny plan, żeby mieć margines bezpieczeństwa, zanim zbierzemy
         realne dane produkcyjne o zużyciu CPU przez pdf-lib. Podnieść te
         limity można później, gdy będzie pewność, że się mieszczą —
         znacznie bezpieczniej niż odkryć na żywo, że się nie mieszczą.
      2. **Znaleziona luka w ochronie przed nadużyciem ("pętla ujemna"):**
         samo sprawdzenie kosztu długiego PDF-a (`needs_confirmation`)
         nie kosztuje nas pieniędzy (liczenie stron jest lokalne), ale
         zużywa realny czas procesora — a NIE była to dotąd liczona jako
         "nieudana próba" w systemie blokad (`logFailedAttempt()`), więc
         ktoś mógłby bez końca "sondować" koszt dużych PDF-ów, nigdy nie
         potwierdzając analizy, całkowicie poza systemem ochrony. Naprawione:
         `needs_confirmation` teraz też woła `logFailedAttempt()` — 15
         takich "sondowań" w 10 minut i konto trafia w tę samą, rosnącą
         blokadę co przy nadużyciu innych trybów ("nieprzekraczalny mur",
         cytując wprost prośbę użytkownika).
      3. **Zidentyfikowana, ale ŚWIADOMIE NIE naprawiona teraz, druga
         pętla ujemna** — jeśli limity z punktu 1 mimo wszystko okażą się
         za wysokie (limit CPU i tak przekroczony), UCZCIWY użytkownik z
         dużym, ale dozwolonym plikiem trafi na `gemini_error`, co TEŻ
         liczy się jako "nieudana próba" w tym samym systemie blokad —
         czyli nasza pomyłka kalibracji ukarałaby niewinnego użytkownika
         coraz dłuższą blokadą. Nie ma tu dobrego technicznego obejścia
         bez realnych danych produkcyjnych — jedyna obrona to zachowanie
         ostrożnych limitów z punktu 1 i obserwacja pierwszych realnych
         użyć. Jeśli po wdrożeniu ktoś zgłosi błąd na sporym (blisko 80
         stron / 10 MB) PDF-ie, to sygnał, żeby PONOWNIE zweryfikować
         limity, zanim ktoś inny oberwie za to blokadą.
      4. **Podwójne wysyłanie dużego pliku** (raz żeby poznać koszt, raz
         żeby analizować — patrz `needs_confirmation` wyżej) na wolnym
         łączu to zauważalnie dłuższy czas/transfer niż przy pozostałych
         trybach. Świadomie NIE naprawione architekturalnie teraz
         (wymagałoby tymczasowego przechowywania pliku po stronie serwera
         między sprawdzeniem kosztu a potwierdzeniem — magazyn, czyszczenie
         porzuconych plików, bezpieczeństwo dostępu — osobny, większy
         projekt na później, jeśli okaże się potrzebny). Zamiast tego:
         prosta, wyraźna informacja w interfejsie ("duży plik — wysyłanie
         może chwilę potrwać") od razu po wybraniu pliku większego niż 3 MB
         (`PDF_LARGE_FILE_NOTICE_BYTES` w `index.html`).
    - **POPRAWKA 2026-08-19(b) — realna skarga użytkownika: 40-stronicowy
      PDF zwrócił tylko 2 wzorce, mimo zapłaty ~300 kredytów ("dostałem
      tyle co nic"). Dodatkowo brakowało numeru strony przy cytatach.**
      Naprawione trzema niezależnymi zmianami:
      1. **Numer strony przy KAŻDYM wzorcu** — osobny `PDF_RESPONSE_SCHEMA`
         (obok `RESPONSE_SCHEMA`/`IMAGE_RESPONSE_SCHEMA`) z obowiązkowym
         polem `page` (liczba, licząc od 1) w każdym elemencie `patterns`.
         `pdfInstruction` wprost wymaga podania strony dla każdego cytatu.
         WAŻNE: `translateResult()` (dotłumaczanie gotowego wyniku na inny
         język, patrz "Ponowne użycie przez tłumaczenie") musi dostać TEN
         SAM schemat, gdy tłumaczy wynik, którego oryginał był PDF-em —
         inaczej pole `page` zgubiłoby się przy tłumaczeniu (schemat
         odpowiedzi ogranicza, co Gemini może zwrócić). Backend sprawdza to
         po `original.input_type === 'pdf'` przed wywołaniem tłumaczenia.
      2. **Wzmocniona dokładność, BEZ fabrykowania wyników — okazała się
         NIEWYSTARCZAJĄCA, patrz POPRAWKA 2026-08-19(c) niżej.**
         `pdfInstruction` wprost nakazywała przeczytać CAŁY dokument,
         stronę po stronie, każdą stronę tak samo uważnie jak pierwszą —
         TEN nakaz obowiązywał ZAWSZE, niezależnie od liczby stron
         (krótszy plik nie zasługuje na mniej uważne czytanie niż długi —
         poprawione po uwadze użytkownika, że pierwsza wersja brzmiała,
         jakby dotyczyło to tylko długich PDF-ów). Osobno, TYLKO dla
         PDF-ów dłuższych niż 10 stron, doklejony był dodatkowy fragment:
         dokument tej długości niemal zawsze zawiera wiele wartych nazwania
         miejsc, a bardzo krótka lista wyników przy długim pliku to sygnał
         pominiętego tekstu. Świadomie NIE wymuszaliśmy (i nadal nie
         wymuszamy) sztywnego minimum liczby wzorców (np. "podaj co
         najmniej 10") — to byłoby fabrykowaniem nieistniejącej manipulacji
         i łamałoby zasadę NEUTRALNOŚĆ z `buildSystemPrompt()`. Problem:
         samo "proszenie ładniejszymi słowami" ma twardy sufit skuteczności
         przy naprawdę długich dokumentach — patrz dowód w POPRAWCE
         2026-08-19(c).
      3. **PDF-y są teraz NAPRAWDĘ prywatne, nie tylko "ukryte z listy"** —
         patrz "Prywatność PDF-ów" niżej.
    - **POPRAWKA 2026-08-19(c) — dowód, że samo proszenie o dokładność NIE
      WYSTARCZA, i architektoniczna naprawa (dzielenie na części).**
      Użytkownik przetestował realne dokumenty (~40-stronicowy raport
      kwartalny NVIDIA, potem raport Komputronika) — oba dostały tylko 2-3
      wykryte wzorce mimo POPRAWKI 2026-08-19(b) opisanej wyżej. Kluczowa
      obserwacja użytkownika, która to udowodniła: **numery stron
      znalezionych wzorców leżały PODEJRZANIE BLISKO SIEBIE** (np.
      23/27/31 na 40 stron; 13/16 na kilkanaście stron) — gdyby model
      naprawdę czytał cały dokument równie uważnie, wyniki rozkładałyby się
      po całej jego długości, nie w jednym skupisku. To mocny, empiryczny
      dowód, że jedno duże zapytanie z całym PDF-em NIE gwarantuje
      realnego przeczytania całości, niezależnie jak stanowczo się o to
      poprosi w promptcie — klasyczne ograniczenie modeli językowych przy
      bardzo długim kontekście i zadaniu "wypisz WSZYSTKO, co znajdziesz"
      (model ma skłonność skupiać się na jednym, najbardziej "wyrazistym"
      fragmencie zamiast równomiernie przeszukać całość).

      **Naprawa: dzielenie PDF-a na części (`PDF_CHUNK_PAGES` = 8 stron) i
      NIEZALEŻNE zapytanie do Gemini dla KAŻDEJ części, równolegle:**
      - `loadPdfDocument()` (dawniej `countPdfPages()`) zwraca teraz cały
        wczytany dokument (pdf-lib), nie tylko liczbę stron — trzymany w
        `pdfDoc` (zmienna na poziomie funkcji, obok `pdfPageCount`), żeby
        nie parsować tych samych bajtów dwa razy.
      - `analyzePdfChunk(start, end)` w sekcji 5 (`Deno.serve`): dla
        dokumentu mieszczącego się w JEDNEJ części (typowy, krótszy PDF)
        używa oryginalnych bajtów `pdf_base64` wprost (bez odtwarzania
        przez pdf-lib — unika ryzyka utraty czcionek/formatowania przy
        przepisywaniu pliku). Dla dłuższych — wycina fragment przez
        `subDoc.copyPages()` i koduje go do base64 (`uint8ArrayToBase64()`,
        bezpieczna wersja dla dużych plików — zwykłe rozłożenie tablicy
        bajtów jako argumentów `String.fromCharCode(...bytes)` potrafi
        przekroczyć limit stosu silnika JS).
      - Model widzi TYLKO swoją część, więc liczy numer strony od 1 W JEJ
        OBRĘBIE — backend DETERMINISTYCZNIE dodaje przesunięcie (`+ start`)
        przy scalaniu wyników, żeby finalny numer strony był poprawny
        względem CAŁEGO oryginalnego dokumentu. Świadomie NIE proszymy
        modelu, żeby sam policzył to przesunięcie (mniej pewne niż prosta
        arytmetyka po naszej stronie).
      - Części lecą RÓWNOLEGLE (`Promise.all`) — łączny czas odpowiedzi
        ograniczony najwolniejszą częścią, nie sumą wszystkich, więc nadal
        bezpiecznie mieści się w limicie 400s Supabase nawet dla
        maksymalnego, 80-stronicowego (10 części) dokumentu.
      - Jeśli KTÓRAKOLWIEK część się nie uda (timeout/błąd/niesparsowalny
        JSON) — cała analiza kończy się błędem `gemini_error` (jak
        dotychczas), zamiast po cichu zgubić fragment wyników i pokazać
        niekompletną analizę jako pełną.
      - `q_score` całości = średnia ważona liczbą stron każdej części (nie
        zwykła średnia arytmetyczna — ostatnia część bywa krótsza niż
        `PDF_CHUNK_PAGES`).
      - `summary` całości: żadna pojedyncza część "nie widziała" całego
        dokumentu, więc żadna nie mogła sama napisać sensownego
        podsumowania całości. Nowa funkcja `composePdfSummary()` robi to
        OSOBNYM, TANIM zapytaniem — dostaje tylko krótką listę już
        wykrytych wzorców (typ + nazwa, BEZ ponownego wysyłania treści
        PDF-a) i ogólny `q_score`, i pisze jedno, spójne dwuzdaniowe
        podsumowanie w stylu identycznym jak reszta aplikacji.
      - **Realny wzrost kosztu Gemini** — to jest architektura z WIELOMA
        zapytaniami zamiast jednego: długi (80-stronicowy) PDF to teraz aż
        10 wywołań zamiast 1, każde z osobno wysyłanym `systemPrompt`
        (biblioteka 100 modeli mentalnych, kilka tysięcy tokenów) —
        znacząco podnosi to realny koszt operacyjny per PDF, silniej niż
        liniowo względem liczby stron. To WZMACNIA (nie zastępuje) zadanie
        "Po PDF: przeliczyć cashflow z nowymi scenariuszami" — cennik
        `PDF_PAGE_COST` (8 kredytów/stronę) był ustalony PRZED tą zmianą i
        może już nie pokrywać realnego kosztu dla dłuższych dokumentów;
        zweryfikować priorytetowo przy najbliższej okazji.
      - **Do obserwowania**: wycinanie fragmentów przez pdf-lib
        (`copyPages`/`save()`) to, tak jak liczenie stron, prawdziwa
        synchroniczna praca procesora (patrz limit 2s CPU Supabase,
        opisany przy `PDF_HARD_MAX_PAGES` wyżej) — dla maksymalnego,
        10-częściowego dokumentu robimy to teraz do 10 razy zamiast raz.
        Brak jeszcze realnych danych produkcyjnych, czy to bezpiecznie
        mieści się w budżecie CPU dla największych dozwolonych plików —
        jeśli po wdrożeniu pojawią się błędy na dużych PDF-ach, to
        pierwsze miejsce do sprawdzenia (obok już wcześniej znanego ryzyka
        przy `PDF_HARD_MAX_PAGES`/`MAX_PDF_BYTES`).
    - **POPRAWKA 2026-08-19(d) — realne liczby kosztu policzone na życzenie
      użytkownika PRZED decyzją, żeby nie zgadywać: `PDF_CHUNK_PAGES`
      obniżone z 8 na 4, plus nowy ETAP 2 (weryfikacja/scalanie).**
      Trzy etapy analizy PDF-a, każdy z innym zadaniem (nazewnictwo wprost
      z rozmowy z użytkownikiem — pomaga trzymać się tego, co która funkcja
      naprawdę robi):
      1. **ETAP 1 (podstawowe)** — `analyzePdfChunk()`: każda 4-stronicowa
         część osobno szuka wzorców. Bez zmian względem POPRAWKI (c), poza
         mniejszym `PDF_CHUNK_PAGES`.
      2. **ETAP 2 (złożone, NOWE)** — `verifyAndRefinePdfPatterns()`:
         dostaje całą sklejoną listę wzorców ze WSZYSTKICH części Etapu 1 i
         (a) usuwa duplikaty/prawie-duplikaty, zwłaszcza na granicach
         sąsiednich części (realny, nowy problem, który samo dzielenie na
         części wprowadza — ten sam fragment może zostać wykryty dwa razy
         przez dwie sąsiednie, niezależne części), (b) poprawia wyraźnie
         zbyt ogólnikowe `explanation`/`tip`. KRYTYCZNIE WAŻNE: nie dostaje
         treści PDF-a wcale, więc fizycznie nie może dodać wzorca, którego
         nie było na wejściowej liście — to czyszczenie istniejących
         wyników, nie nowa analiza (żeby nie złamać zasady NEUTRALNOŚĆ /
         nie fabrykować manipulacji). Fail-open: błąd/timeout zwraca
         ORYGINALNĄ, niezweryfikowaną listę zamiast wywalać całą analizę —
         to wzbogacenie jakości, nie gwarancja pokrycia (tę już daje samo
         dzielenie z Etapu 1).
      3. **ETAP 3 (analiza)** — `composePdfSummary()` (bez zmian nazwy
         funkcji, tylko teraz świadomie dostaje OCZYSZCZONĄ listę z Etapu 2,
         nie surową listę z Etapu 1 — inaczej podsumowanie mogłoby
         wspominać usunięte duplikaty).
      `q_score` całości liczony jest ŚWIADOMIE z wyników ETAPU 1
      (`chunkResults`), nie z listy po Etapie 2 — ocena rzetelności tekstu
      nie zależy od tego, ile duplikatów akurat usunięto z listy wzorców.

      **Konkretne liczby kosztu (dodatkowy koszt Gemini WZGLĘDEM stanu
      sprzed POPRAWKI (c), czyli sprzed jakiegokolwiek dzielenia na
      części)** — policzone na żywo na prośbę użytkownika przed podjęciem
      decyzji, model gemini-3.5-flash-lite, 0,30 USD/mln tokenów wejścia,
      2,50 USD/mln tokenów wyjścia:
      | Wariant | 40 stron | 80 stron (limit) |
      |---|---|---|
      | 8 stron/część, bez Etapu 2 (POPRAWKA (c)) | +0,003 USD | +0,008 USD |
      | 4 strony/część, bez Etapu 2 | +0,006 USD | +0,016 USD |
      | **4 strony/część + Etap 2 (wdrożone teraz)** | **+0,010 USD** | **+0,021 USD** |

      Nawet w najgorszym wypadku (80 stron) to ok. 2 centy więcej niż
      pierwotna wersja sprzed dzisiejszych poprawek — przy 640 kredytach
      pobieranych za taką analizę (80 stron × 8 kredytów) to pomijalne.
      **Realnym ryzykiem dla cennika nie jest sam mechanizm wieloetapowy
      (tani), tylko to, że dokładniejsza analiza znajduje realnie WIĘCEJ
      wzorców niż poprzednio — a to podnosi koszt WYJŚCIA (2,50 USD/mln, 8x
      droższe niż wejście), proporcjonalnie do liczby faktycznie
      znalezionych wzorców, nie do liczby stron.** To jeszcze mocniej
      uzasadnia priorytet zadania "Po PDF: przeliczyć cashflow z nowymi
      scenariuszami" — ale na realnych danych z produkcji, nie
      przybliżeniach z tej analizy.
  - **Prywatność PDF-ów (dodane POPRAWKĄ 2026-08-19(b))** — do tej zmiany
    PDF-y były wyłączone tylko z PRZEGLĄDARKI publicznych analiz
    (`index.html`), ale sam wiersz w `scans` był nadal czytelny dla
    KAŻDEGO, kto poznał/zgadł `scan.html?id=...` (RLS `scans` miała
    publiczny odczyt dla wszystkich typów) — realna różnica między "nie
    polecane do odkrycia" a "prywatne" była żadna. Użytkownik wprost
    poprosił o prawdziwą prywatność ("wyniki (...) zostały w pamięci
    prywatnej użytkownika ale nie publicznej") oraz o możliwość WRACANIA do
    własnych analiz. Naprawione trzema elementami działającymi razem:
    1. **Nowa tabela `scan_access`** (patrz struktura bazy wyżej) — osobny
       wiersz na PARĘ (analiza, użytkownik z dostępem), nie kolumna w
       `scans`. To rozróżnienie jest konieczne z powodu współdzielonego
       cache'u: jeśli dwie różne osoby prześlą DOKŁADNIE ten sam plik (ten
       sam `content_hash`) w tym samym języku, druga dostaje wynik za darmo
       z cache'u (patrz sekcja CACHE w `analyze/index.ts`) — ale bez
       własnego wpisu w `scan_access` nigdy nie mogłaby do niego wrócić,
       mimo że to ona o analizę poprosiła. Backend robi `upsert` do
       `scan_access` w OBU miejscach, gdzie PDF-owy wynik trafia do kogoś:
       przy trafieniu w cache i przy świeżo policzonej analizie. Trzyma też
       `source_filename` PER UŻYTKOWNIK (nie w `scans`) — bo dwie osoby z
       identycznym plikiem mogły nadać mu różne nazwy.
    2. **Zmieniona RLS na `scans`**: publiczny odczyt zostaje dla
       `text`/`url`/`image` (to się nie zmienia — te typy mają być
       odkrywalne/współdzielone), ale `input_type = 'pdf'` wymaga wpisu w
       `scan_access` — patrz dokładna reguła w sekcji struktury bazy wyżej.
       Backend (Edge Function) i tak zawsze czyta przez `service_role`,
       który omija RLS, więc mechanizm dedukcji kosztu z cache'u działa
       identycznie jak wcześniej — zmienia się TYLKO to, co widzi
       przeglądarka z kluczem `anon`.
    3. **Kolejność w `analyze/index.ts` zamieniona**: sekcja UWIERZYTELNIENIE
       (rozpoznanie `user_id` z JWT) przeniesiona PRZED sekcję CACHE —
       trzeba już przy trafieniu w cache wiedzieć, kto pyta, żeby przyznać
       mu dostęp w `scan_access`. Nie zmienia to zachowania dla żadnego
       innego trybu (kolejność auth vs cache nigdy nie miała znaczenia poza
       tym nowym przypadkiem).
    4. **`scan.html` czeka teraz na sesję PRZED zapytaniem do `scans`**
       (dawniej leciało od razu) — inaczej zapytanie o PDF mogłoby polecieć
       bez tokenu zalogowanego użytkownika (sesja jeszcze się nie
       załadowała z `localStorage`) i dostać fałszywe "nie znaleziono" mimo
       że to WŁAŚCICIEL patrzy na własny wynik. Dla pozostałych typów (nadal
       publicznie czytelnych) to tylko nieszkodliwe, minimalne opóźnienie.
    5. **Nowa podstrona `historia.html`** — wymaga zalogowania (tak jak
       `account.html`), listuje własne analizy PDF przez `scan_access`
       (złączenie PostgREST do `scans` po nazwę/wynik), z linkiem do
       `scan.html?id=...` dla każdej. Link do niej dodany w `account.html`
       ("Twoje analizy PDF →"). Dodana do `sw.js` (`ASSETS`, `CACHE_NAME`
       podbite do `gakori-v23`).
    - **SQL migracji** (wklejony i uruchomiony ręcznie w Supabase SQL
      Editor — repo nie ma lokalnego Supabase CLI, patrz "Proces
      wdrażania"):
      ```sql
      CREATE TABLE IF NOT EXISTS public.scan_access (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        source_filename text,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (scan_id, user_id)
      );
      ALTER TABLE public.scan_access ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "scan_access_select_own" ON public.scan_access
        FOR SELECT USING (auth.uid() = user_id);

      DO $$
      DECLARE pol record;
      BEGIN
        FOR pol IN
          SELECT policyname FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'scans' AND cmd = 'SELECT'
        LOOP
          EXECUTE format('DROP POLICY %I ON public.scans', pol.policyname);
        END LOOP;
      END $$;
      CREATE POLICY "scans_select_public_non_pdf" ON public.scans
        FOR SELECT USING (input_type <> 'pdf');
      CREATE POLICY "scans_select_own_pdf" ON public.scans
        FOR SELECT USING (
          input_type = 'pdf' AND EXISTS (
            SELECT 1 FROM public.scan_access sa
            WHERE sa.scan_id = scans.id AND sa.user_id = auth.uid()
          )
        );
      ```
      Ten skrypt sam znajduje i usuwa WSZYSTKIE dotychczasowe reguły
      `SELECT` na `scans` (niezależnie od ich nazwy) i zastępuje je dwiema
      nowymi — bezpieczne do jednorazowego uruchomienia; uruchomienie go
      drugi raz też nie zaszkodzi (`DROP POLICY` na nieistniejącej regule
      po prostu nic nie usunie, `CREATE POLICY` bez `IF NOT EXISTS` zgłosi
      błąd przy drugim uruchomieniu — w takim wypadku wystarczy najpierw
      ręcznie usunąć te dwie nowe reguły i uruchomić skrypt ponownie).
  - **Awaryjne pobranie strony (`fetchUrlAsText()`)**: niektóre strony
    (np. duże portale newsowe typu onet.pl) odrzucają robota Google z
    ogólnym kodem `URL_RETRIEVAL_STATUS_ERROR` — bez podania konkretnego
    powodu. Gdy tak się stanie, backend sam pobiera stronę bezpośrednio
    (nagłówki jak z przeglądarki), zdejmuje znaczniki HTML "na surowo" —
    to samo w sobie NIE jest inteligentny ekstraktor treści (może złapać
    menu/stopkę razem z artykułem) — ten surowy tekst leci od razu do
    właściwej analizy, z dopiskiem każącym Gemini samodzielnie zignorować
    ten szum (patrz POPRAWKA 2026-08-19(f) w "Kaskada dwuetapowa" niżej —
    dawniej osobny etap czyszczący `siftFallbackText()`, usunięty). Jeśli i
    to się nie uda (np. strona ma prawdziwą ochronę typu
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
    `"reasoning"` (trafny, wartościowy sposób rozumowania — Gakori ma
    aktywnie szukać OBU typów, nie tylko manipulacji, patrz sekcja o 100
    modelach mentalnych wyżej). Wartość NIE jest tłumaczona (zawsze
    angielskie słowo), frontend mapuje ją na etykietę przez i18n
    (`pattern_tag_manipulation`/`pattern_tag_reasoning`) i inny kolor
    obramowania (czerwony/pomarańczowy vs niebieski).
  - `tip`: krótka, PRAKTYCZNA podpowiedź "co teraz zrobić" (sprawdź,
    poszukaj, odczekaj) — **świadomie NIGDY oceniająca** ("ufaj"/"nie
    ufaj"/"dobre"/"złe"/"wiarygodne"). To ważna, przemyślana granica: gdyby
    Gakori zaczęła wydawać takie werdykty (nawet przy `pattern_type:
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
  miękka, matowa, organiczna estetyka inspirowana wprost logo Gakori
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
  - Mały, powtarzalny znak marki: `.gakori-mark` — inline SVG "kropla"
    (`M50,8 C74,32 88,48 88,63 A38,38 0 1,1 12,63 C12,48 26,32 50,8 Z`,
    obrócona o -18°, gradient szaro-taupe) obok nagłówka `<h1>Gakori</h1>`
    w `index.html` — jedyne miejsce z widocznym tekstowym nagłówkiem
    "Gakori" w treści strony (na `account.html`/`scan.html` "Gakori"
    występuje tylko w `<title>`, nie w treści, więc tam znaku nie dodano).
  - `sw.js`: `CACHE_NAME` podbite do `gakori-v10` (zmiana `style.css` —
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
    4. Nowy, duży, mocno rozmyty kształt `.gakori-backdrop` (ten sam SVG
       "kropli" co `.gakori-mark`, tylko w dużej skali, `position: fixed`,
       `opacity: 0.16`/`0.22` w ciemnym, `filter: blur(38px)`, `z-index: 0`
       — karty mają `z-index: 1`, żeby były nad nim) w tle strony startowej
       — bezpośrednia odpowiedź na "logo pokazuje inny świat niż aplikacja
       w środku": teraz kształt loga jest widoczny w tle całej aplikacji,
       nie tylko jako mały znaczek przy nagłówku.
    `sw.js` `CACHE_NAME` podbite dalej do `gakori-v11` (kolejna zmiana
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
  - Ten sam duży, rozmyty kształt tła (`.gakori-backdrop`) dodany też na
    `account.html` i `scan.html` (wcześniej był tylko na stronie
    startowej) — żeby "świat" aplikacji był spójny na każdej podstronie,
    nie tylko na pierwszym ekranie.
    `sw.js` `CACHE_NAME` podbite do `gakori-v13`.
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
    końcu), mocniejsza opacity `.gakori-backdrop` (0.16→0.22 jasny,
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
    `sw.js` `CACHE_NAME` podbite do `gakori-v15`.
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
    `sw.js` `CACHE_NAME` podbite do `gakori-v16`.
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
    `sw.js` `CACHE_NAME` podbite do `gakori-v17`.
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
    `sw.js` `CACHE_NAME` podbite do `gakori-v18`.
  - **POPRAWKA 2026-08-18(j) — runda 7**: użytkownik wskazał DWIE konkretne
    referencje ze zrzutów ekranu: (1) jasny motyw, aktywna zakładka/przycisk
    "Analizuj" — lite, czarne wypełnienie z wyraźną grą światła — to
    podobało się, ale przycisk "Wyloguj" (i inne drugoplanowe z rundy 4:
    tylko obrys) NIE miały tej samej mocy efektu; (2) ciemny motyw, przycisk
    "Wyloguj" na koncie — jasny PIERŚCIEŃ (obrys) na ciemnym wypełnieniu —
    to też się podobało, ale NIE zostało zastosowane na głównej stronie w
    ciemnym motywie (tam zakładki/Analizuj miały wcześniej lite jasne
    wypełnienie, nie pierścień). Wniosek: obie formy ("lite wypełnienie" w
    jasnym, "pierścień" w ciemnym) są już akceptowane przez użytkownika —
    tylko nie były stosowane WSZĘDZIE konsekwentnie. Naprawione radykalnie:
    usunięta osobna klasa `.btn-secondary` (i wszystkie jej odwołania w
    HTML) — od teraz KAŻDY zwykły `<button>` w całej appce (główny,
    drugoplanowy, wszystko) używa DOKŁADNIE tego samego stylu co reszta:
    w jasnym motywie lite czarne wypełnienie (bazowa reguła `button`), w
    ciemnym motywie jasny pierścień (`:root[data-theme="dark"] button`).
    Ten sam ciemny override objął też `.tab-btn.active` i `#userMenuBtn`
    (ikona konta, `<a>` nie `<button>`, stąd osobny selektor) — one już
    dawniej dzieliły wzór z głównym przyciskiem, teraz dzielą też jego
    "odwrócenie" w ciemnym motywie. WAŻNA PUŁAPKA znaleziona przy
    wdrażaniu: selektor `:root[data-theme="dark"] button` ma WYŻSZĄ
    specyficzność niż samo `.tab-btn` (dwa poziomy klas kontra jeden), więc
    bez jawnego `:not(.tab-btn)` po cichu nadpisałby też wygląd
    NIEaktywnych zakładek (które też są `<button>`) — i analogicznie
    `:not(.image-preview-remove)` dla małego okrągłego "×" na miniaturce
    zdjęcia. Ogólna zasada na przyszłość: przy dodawaniu reguły
    `[data-theme] jakiś-selektor-ogólny`, zawsze sprawdzić, czy nie ma w
    kodzie bardziej wyspecjalizowanych elementów tego samego typu, które
    trzeba jawnie wykluczyć przez `:not()`.
    `sw.js` `CACHE_NAME` podbite do `gakori-v19`.
  - **POPRAWKA 2026-08-18(k) — runda 8**: użytkownik zgłosił, że wynik
    analizy dalej nie pasuje do reszty aplikacji. Doprecyzowane (pytanie
    wielokrotnego wyboru) na trzy konkretne rzeczy: (1) odznaka wyniku
    (`.result-badge`/`.badge-*`) i tagi wzorców (`.pattern-tag`) były
    płaskim, jednolitym kolorem — jedyne elementy w appce bez ŻADNEJ gry
    światła; (2) pola cytatu/"Co teraz zrobić"/źródła (`.result-quote`,
    `.pattern-tip`, `.scan-source-box`, `.scan-text-source-content`) też
    wyglądały płasko; (3) kolorowe, platformowe emoji 💰/👤 w górnym pasku.
    Naprawione: (1) odznaki/tagi dostały ten sam dwuwarstwowy gradient +
    cień co przyciski/karty, ale W OBRĘBIE własnego odcienia (zielony/
    żółty/czerwony/terakotowy zostaje — inaczej zniknęłoby znaczenie
    koloru), `color-mix` rozjaśnia górny koniec w stronę bieli, ten sam
    kierunek światła co reszta. (2) NOWA zmienna `--sculpt-inset` — celowo
    ODWROTNA geometria względem `--sculpt-shadow` (cień od góry-wewnątrz +
    jasna kreska od dołu-wewnątrz, `inset`), bo te panele są ŚWIADOMIE
    wgłębione/recesywne (ustalone wcześniej: cytat ma wyglądać "lżej" niż
    karta) — to wciąż jest "gra światła", tylko fizycznie odwrócona
    (zagłębienie zamiast wypukłości), nie identyczna z kartami. (3) 💰/👤
    zamienione na minimalistyczne ikony liniowe (inline SVG,
    `stroke="currentColor"`) — ta sama konwencja co ikony zakładek z rundy
    5, automatycznie dziedziczą kolor tekstu i odwracają się z motywem.
    `sw.js` `CACHE_NAME` podbite do `gakori-v20`.
  - Jedna czcionka na całej stronie — 'Inter' (wcześniej nagłówki miały
    ozdobny szeryf 'Lora', usunięty na wcześniejszą prośbę użytkownika).
    Wszystkie kolory/rozmiary jako zmienne CSS w `:root` na górze
    `style.css` — zmieniaj tam, nie w poszczególnych regułach.
- **Motyw jasny/ciemny**: przełącznik w ustawieniach konta
  (`account.html`, selektor obok języka), ten sam wzorzec zapisu co język —
  `localStorage` (`gakori_theme`, działa też dla niezalogowanych) + kolumna
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
    Zespół Gakori" w danym języku. Treść każdego z 3 typów × 10 języków
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
    globalną nazwę (`BREVO_SENDER_NAME`, po polsku "Zespół Gakori") dla
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
- **Ochrona przed limitem Brevo — punkt 4 audytu bezpieczeństwa (dodane
  2026-08-21, POPRAWKA (u))**:
  - **Ostrzeżenie w aplikacji**: `send-auth-email` liczy WŁASNY licznik
    udanych wysyłek (`email_daily_count`, jeden wiersz na dzień **czasu
    polskiego**, ta sama logika co `system_daily_spend` w `analyze`) —
    niezależny od statystyk Brevo używanych w `daily-report`. Tabela ma
    RLS z jawnym wyjątkiem: **publiczny SELECT** (jedyna tabela `system_*`/
    `email_*`, którą wolno czytać z przeglądarki bez logowania — udostępnia
    WYŁĄCZNIE liczbę maili wysłanych dziś, nic wrażliwego). `index.html`
    sprawdza ją tuż przed pokazaniem "sprawdź skrzynkę" po rejestracji i
    po wysłaniu maila odzyskiwania hasła — jeśli licznik dobił do 240 (80%
    limitu 300), dokłada dodatkowe, spokojne zdanie o możliwym opóźnieniu.
  - **Żaden mail nie może "zniknąć" bez śladu, ale ŚWIADOMIE bez
    automatycznej kolejki do ponawiania**: jeśli wysyłka przez Brevo się
    nie uda (np. wyczerpany limit), `send-auth-email` NIE zwraca błędu do
    Supabase (inaczej sama czynność użytkownika — rejestracja/odzyskiwanie
    hasła — też widocznie by się nie udała) — zamiast tego loguje
    niepowodzenie do `email_failures` (WYŁĄCZNIE do Twojej widoczności w
    `daily-report`, dopisana linijka "N maili nie udało się wysłać w
    ostatnich 24h") i mówi Supabase "OK".
  - **Świadomie odrzucony pomysł**: pierwotnie planowana automatyczna
    kolejka, która sama próbowałaby ponownie wysłać zapisany mail w tle.
    Odrzucone, bo link w mailu (signup/recovery) ma termin ważności, a
    mechanizm Supabase do wygenerowania "świeżego" linku na żądanie
    (`admin.generateLink`) ma udokumentowany, realny problem — potrafi
    oddać dokładnie ten sam, już nieważny token zamiast nowego
    (github.com/supabase/auth#1357). Zamiast ryzykować wysłanie martwego
    linku i wprowadzenie użytkownika w błąd, w aplikacji jest zamiast tego
    prawdziwy przycisk **"Wyślij mail ponownie"** (`resendEmailBtn` w
    `index.html`) — pokazuje się po każdej udanej próbie rejestracji,
    używa `sb.auth.resend({type:'signup', email, ...})`, czyli standardowej
    funkcji Supabase, która zawsze generuje NOWY, gwarantowanie świeży
    link dokładnie w chwili kliknięcia. Dla odzyskiwania hasła nie trzeba
    osobnego przycisku — kliknięcie istniejącego linku "Zapomniałeś
    hasła?" po raz kolejny już działa jako "wyślij ponownie".
  - Baza: `email_daily_count` (`spend_date` date PK, `sent_count` integer)
    z publicznym SELECT; `email_failures` (`id`, `created_at`, `kind`) bez
    publicznych polityk (tylko `service_role`, jak reszta tabel `system_*`).
- **Funkcja `daily-report`** (`supabase/functions/daily-report/index.ts`)
  — wysyła raz dziennie, koleżeńskim tonem (to właściciel wysyła raport
  sam do siebie, nie oficjalna komunikacja z użytkownikiem), mail z
  kluczowymi metrykami MVP: nowe rejestracje dziś + średnia z 7 dni +
  ostrzeżenie przy nietypowym skoku; analizy tekstu dziś z rozbiciem
  zalogowani/anonimowi i nowe/tłumaczenia; top 5 najczęściej oglądanych
  analiz w KAŻDYM języku, w którym coś już jest (wg `view_count`); wydane
  kredyty; maile wysłane dziś i suma od początku miesiąca (wg statystyk
  Brevo), plus ostrzeżenie, jeśli w ostatnich 24h coś się nie wysłało
  (`email_failures`, patrz "Ochrona przed limitem Brevo" wyżej). Świadomie
  USUNIĘTE z raportu (właściciel ocenił jako
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
  cron.schedule('gakori-daily-report', '0 14 * * *', $$ select
  net.http_post(url:='.../functions/v1/daily-report', headers:=jsonb_build_object('x-cron-secret','...'),
  body:='{}'::jsonb) $$)`; podgląd/zmiana: `select * from cron.job;`,
  `select cron.unschedule('gakori-daily-report');`), z nagłówkiem
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
    jeszcze nie istnieje w Gakori (ani frontend, ani tabela w bazie) —
    gdy powstanie, dopisać do raportu liczbę zgłoszeń dziennie.
- **Przeglądarka publicznych analiz**: lista klikalnych wierszy (ikona
  typu źródła + odznaka wyniku + skrócony cytat), wyszukiwanie po słowach
  kluczowych w czasie rzeczywistym (debounce, sanityzacja wejścia przed
  wstawieniem do filtra PostgREST), okno ograniczone do ~6 wierszy z
  suwakiem, klik prowadzi do `scan.html?id=...` **w TEJ SAMEJ karcie**
  (POPRAWKA 2026-08-19: wcześniej otwierało nową kartę, `target="_blank"`,
  żeby klik w wynik nie gubił przewijanej listy pod spodem — użytkownik
  uznał to za niepotrzebne, wolał zwykłe przekierowanie bez mnożenia kart).
  Widoczna zawsze (i dla zalogowanych, i dla
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
  świadoma decyzja użytkownika: Gakori ma nazywać też trafne, wartościowe
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
  - **Kaskada dwuetapowa (kategoria → szczegół)** — tryb tekstowy zawsze, tryb
    linku w WIĘKSZOŚCI przypadków (patrz POPRAWKA 2026-08-19(f) i POPRAWKA
    2026-08-20 niżej — historia tego, jak i dlaczego to się zmieniało dla
    linku):
    modele językowe mają
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
    - **POPRAWKA 2026-08-19(f) — ograniczenie ścieżki awaryjnej Linku**
      (zadanie #10 z listy TODO): dawniej analiza linku w najgorszym
      przypadku robiła AŻ 4 zapytania do Gemini (kategoryzacja → właściwa
      analiza → sito → druga właściwa analiza). Problem: etap kategoryzacji
      dla LINKU (w przeciwieństwie do tekstu) kazał Gemini SAMEMU pobierać
      stronę przez narzędzie "URL context" — czyli nawet w NAJLEPSZYM
      przypadku (strona dostępna od razu, bez awarii) Gemini i tak pobierał
      tę samą stronę DWA razy (raz do kategoryzacji, raz do właściwej
      analizy), zanim jeszcze cokolwiek zawiodło. Naprawa: usunięty etap
      kategoryzacji WYŁĄCZNIE dla linku (tekst go zachowuje, patrz wyżej —
      tam faktycznie nic nie dubluje pobierania strony, bo treść i tak
      przychodzi wprost w zapytaniu użytkownika) — pełna biblioteka 100
      modeli od razu, ten sam kompromis co przy obrazie/PDF-ie (koszt
      biblioteki w promptcie to grosze, korzyść to mniej zapytań i mniej
      miejsc do awarii). Przy okazji uproszczona też ścieżka awaryjnego
      pobrania strony (`fetchUrlAsText`, patrz niżej) — dawniejszy osobny
      etap `siftFallbackText()` (czyszczenie surowego tekstu z szumu
      menu/stopki/reklam + kategoryzacja w jednym zapytaniu) został
      usunięty; surowy tekst leci teraz od razu do właściwej analizy z
      dopiskiem każącym Gemini samodzielnie zignorować ten szum (patrz
      model GIGO w bibliotece) — model i tak musi "przeczytać całość, żeby
      cokolwiek ocenić", więc pomijanie szumu przy tej samej okazji nie jest
      wartą osobnego zapytania dodatkową pracą. **Nowy najgorszy przypadek:
      2 zapytania do Gemini zamiast 4** (właściwa analiza → awaryjne
      pobranie strony → druga właściwa analiza, czyli 3 zapytania sieciowe
      łącznie licząc samo pobranie strony, nie tylko Gemini).
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
      robi teraz 3 kolejne zapytania sieciowe (właściwa analiza → awaryjne
      pobranie strony → druga właściwa analiza, patrz POPRAWKA
      2026-08-19(f) wyżej — dawniej 5) — z tymi limitami górna granica
      całości to ok. 50s (dawniej ok. 90s), nie "bez ograniczeń".
    - **POPRAWKA 2026-08-20(a) — odzyskanie kaskady dwuetapowej dla linku, bez
      powrotu do podwójnego pobierania strony.** Użytkownik trafnie
      zauważył: usunięcie kategoryzacji w POPRAWKA 2026-08-19(f) oznaczało,
      że link (w przeciwieństwie do tekstu) dostawał ZAWSZE pełną,
      niezawężoną bibliotekę 15 kategorii — realny koszt jakości, nie tylko
      teoretyczny (modele językowe gorzej radzą sobie, gdy mają wybierać z
      dużej, w większości nietrafionej puli). Rozwiązanie: odwrócona
      kolejność prób. Zamiast Gemini jako PIERWSZY wybór do pobrania strony
      (co wymuszało kategoryzację = podwójne pobieranie, stąd usunięcie w
      08-19(f)) — teraz NAJPIERW własne, proste pobranie (`fetchUrlAsText`,
      zero kosztu Gemini, ta sama funkcja co dawna ścieżka awaryjna). Jeśli
      się uda (zdecydowana większość zwykłych stron, fetchUrlAsText sama
      wykrywa niepowodzenie po progu 200 znaków — strony wymagające
      JavaScriptu do pokazania treści dają wtedy pustą "skorupkę"):
      `pickRelevantCategories()` na już pobranym tekście (zero dodatkowego
      pobierania) → właściwa analiza z zawężoną biblioteką — dokładnie ten
      sam wzorzec co tekst. Dopiero jeśli własne pobranie zawiedzie
      (podejrzenie JavaScriptu) — wbudowane narzędzie Gemini "URL context"
      jako "cięższa artyleria", pełna biblioteka, tak jak działało to od
      08-19(f). Efekt: najgorszy przypadek dalej to maks. 2 zapytania do
      Gemini (bez pogorszenia), ale w najczęstszym przypadku (zwykła
      strona) te 2 zapytania dają wyższą jakość (zawężone kategorie)
      zamiast pełnej biblioteki — nic nie stracono, jakość odzyskana.
    - **POPRAWKA 2026-08-20(b) — Etap 3, "druga runda szukania"
      (`findAdditionalPatterns()`), TYLKO tekst i link (ścieżka główna).**
      Realny, żywy przykład (artykuł Wirtualnemedia.pl o sporze
      Wieczorkiewicz/Stanowski) dostał tylko 2 wzorce mimo że wyraźnie
      zasługiwał na więcej — model w jednym, pojedynczym zapytaniu Etapu 2
      ma tendencję "zadowolić się" pierwszymi kilkoma oczywistymi
      wzorcami, mimo istniejącej już instrukcji "DOKŁADNOŚĆ I
      RÓŻNORODNOŚĆ" w `buildSystemPrompt()`. Naprawa: NOWY, dodatkowy Etap
      3 — osobne zapytanie, które dostaje ten sam tekst PONOWNIE razem z
      już znalezioną listą wzorców i każe szukać WYŁĄCZNIE tego, czego
      zabrakło (bez powtarzania). Fail-open (błąd zwraca oryginalną listę
      bez zmian). Zastosowane TYLKO tam, gdzie mamy własny tekst pod ręką
      (tekst wklejony przez użytkownika, i link — ale WYŁĄCZNIE ścieżka
      główna z `fetchUrlAsText`, nie ścieżka awaryjna przez `urlContext` —
      tam nie mamy własnego tekstu bez ponownego, kosztownego pobierania
      strony). Koszt: +1 zapytanie do Gemini w tych dwóch przypadkach.
      Świadomie NIE ma tu wymuszonego minimum liczby wzorców (ta sama
      zasada co przy PDF-owym `verifyAndRefinePdfPatterns()`) — pusta
      lista w drugiej rundzie jest OK, chodzi o unikanie naciąganych
      wzorców "na siłę".
    - **POPRAWKA 2026-08-20(c) — "Chain of Thought" (`reasoning_steps`),
      WSZYSTKIE tryby (tekst, link, obraz, PDF).** Pomysł właściciela: ta
      sama zasada "najpierw rozpisz tok myślenia i ryzyka, dopiero potem
      finalna propozycja", stosowana ogólnie w promptach do modeli
      językowych, żeby wymusić systematyczne przejście przez treść zamiast
      "strzelenia" gotową, krótką odpowiedzią. Technicznie: ustrukturyzowane
      odpowiedzi Gemini (`responseSchema`) generują pola PO KOLEI, w
      kolejności z definicji schematu — dopisane pole `"reasoning_steps"`
      (typu string, "brudnopis" modelu) jest celowo PIERWSZE w kolejności
      pól odpowiadających za samą analizę (po ewentualnych polach moderacji
      obrazu, które muszą się rozstrzygnąć jeszcze wcześniej), więc model
      MUSI je wypełnić, zanim w ogóle dotrze do wypełniania `"patterns"`.
      Odrzucane zaraz po sparsowaniu odpowiedzi (`delete result.reasoning_steps`
      w Deno.serve) — nigdy nie trafia do zapisanego wyniku ani do
      użytkownika. Wymaga OSOBNYCH schematów od tych używanych też przez
      `translateResult()` (tłumaczenie gotowego wyniku na inny język) —
      `RESPONSE_SCHEMA`/`PDF_RESPONSE_SCHEMA` zostają nietknięte,
      dodatkowe pole żyje tylko w nowych `DETECTION_RESPONSE_SCHEMA` (tekst
      i link) i `PDF_DETECTION_RESPONSE_SCHEMA` (PDF) — bo tłumaczenie nie
      powinno dostawać wymogu wypełnienia pola, którego w ogóle nie
      dotyczy. Dla obrazu (`IMAGE_CHUNK_SCHEMA`) dopisane bezpiecznie
      wprost — ten schemat nigdzie indziej się nie powtarza. Koszt: ZERO
      dodatkowych zapytań do Gemini (dzieje się w tym samym, już
      istniejącym zapytaniu) — tylko odrobinę więcej tokenów
      wyjściowych/dłuższy czas jednego zapytania.
    - **POPRAWKA 2026-08-20(d) — pole `"tip"` musi być mikro-krokiem, nie
      zadaniem.** Zgłoszenie właściciela: podpowiedzi "co teraz zrobić"
      bywały sformułowane jak wieloetapowa praca ("zweryfikuj wiarygodność
      źródła i porównaj z innymi doniesieniami") zamiast jednej, malutkiej
      czynności — czytelnik nie może poczuć, że wynik analizy zostawia go z
      trudnym zadaniem. Dodana nowa, nadrzędna sekcja promptu "MIKRO-KROK"
      (z konkretnymi dobrymi/złymi przykładami, i testem: podpowiedź
      zawierająca więcej niż jedno polecenie połączone "i"/"oraz"/przecinkiem
      jest za duża) — pole `"tip"` w liście zasad odwołuje się teraz do niej
      wprost. Przy okazji doprecyzowana też sekcja "PROSTOTA": jawny limit
      jednej myśli/jednego spójnika na zdanie w `"explanation"`/`"summary"`,
      z konkretną instrukcją rozbijania zdań złożonych na dwa krótsze. Zero
      zmian w schemacie/strukturze wyniku — to wyłącznie tekst promptu.
    - **POPRAWKA 2026-08-20(e) — karty wzorców rozwijane/zwijane
      niezależnie (`scan.html` + `style.css`), frontend.** Ten sam
      zgłoszony problem co (d) z innej strony: wynik z wieloma wzorcami
      wyglądał jak "ściana tekstu", zniechęcająca do czytania. Każda karta
      (`.pattern-item`) ma teraz klikalny nagłówek (`.pattern-header`,
      `role="button"`, obsługa też klawiatury: Enter/Spacja), który
      chowa/pokazuje resztę karty (`.pattern-body` — cytat, wyjaśnienie,
      podpowiedź) przez klasę `.collapsed` na karcie. Świadomie NIE jest to
      akordeon (otwarcie jednej karty nie zamyka pozostałych) — każda karta
      trzyma swój stan niezależnie, JS ustawia to przy renderowaniu przez
      domknięcie `setExpanded()` per-karta. Domyślny stan przy wejściu na
      stronę: pierwsza karta rozwinięta (`index === 0`), reszta zwinięta —
      to pierwsze wrażenie ma pokazać treść od razu, a resztę listy jako coś
      krótkiego do przewinięcia wzrokiem, nie ścianę. Zmiana jest WYŁĄCZNIE
      w plikach frontendu (`scan.html`, `style.css`) — wdraża się sama przez
      GitHub Pages po pushu do `main`, bez ręcznego kroku w Supabase.
      **Incydent przy wdrożeniu tej zmiany, patrz "KOMPLETNOŚĆ WDROŻENIA"
      w sekcji "Zasady współpracy" niżej: kod trafił tylko na roboczą
      gałąź, nie na `main`, więc mimo komunikatu "wdroży się samo" u
      właściciela nic się nie pojawiło.**
    - **POPRAWKA 2026-08-20(f) — "tip" nie może mówić czytelnikowi, co ma
      robić ze swoim czasem.** Żywy przykład od właściciela: analiza
      artykułu z pudelek.pl wygenerowała podpowiedź "zamknij tę stronę i
      zajmij się czymś innym" — to model decydujący za czytelnika,
      dokładnie ten sam mechanizm (Argument z Autorytetu w przebraniu
      dobrej rady — "ja wiem lepiej niż ty") co wzorce, które sami mamy
      wykrywać. Dodana nowa, nadrzędna sekcja promptu "TWOJA PODPOWIEDŹ TO
      NIE WYROK CO ROBIĆ Z ŻYCIEM CZYTELNIKA" — `"tip"` ma być WYŁĄCZNIE
      krokiem weryfikacji TREŚCI (sprawdzić fakt, porównać źródło,
      poszukać czegoś konkretnego), nigdy poleceniem dotyczącym dalszego
      zachowania czytelnika (zamknij/przestań czytać/zignoruj/zajmij się
      czymś innym) — ostateczna decyzja zawsze należy do niego. Pole
      `"tip"` w liście zasad odwołuje się teraz też do tej sekcji wprost, z
      jawną listą zabronionych sformułowań. Zero zmian w
      schemacie/strukturze wyniku — to wyłącznie tekst promptu.
    - **POPRAWKA 2026-08-20(g) — "tip" nie może odsyłać czytelnika z
      powrotem do TEGO SAMEGO tekstu.** Głębszy problem znaleziony przez
      właściciela zaraz po (f): podpowiedzi typu "sprawdź w artykule,
      jakie inne problemy mogą wpłynąć na tę inwestycję" albo "sprawdź w
      tekście, kto dokładnie ponosi ryzyko finansowe" odsyłają czytelnika
      z powrotem do analizowanego tekstu, który MY już przeczytaliśmy w
      całości przez bibliotekę modeli mentalnych — to podważa sam sens
      usługi: aplikacja ma przefiltrować tekst ZA czytelnika, a nie
      zlecać mu doczytania czegoś, czego "nie zdążyła" znaleźć. Dodana
      nowa, nadrzędna sekcja promptu "MY JUŻ PRZECZYTALIŚMY CAŁY TEKST ZA
      CZYTELNIKA" — jeśli w tekście jest jeszcze coś istotnego, ma trafić
      jako OSOBNY wzorzec na liście `"patterns"`, NIGDY jako podpowiedź;
      podpowiedź kieruje odtąd WYŁĄCZNIE na zewnątrz analizowanego tekstu
      (wyszukiwarka, inne, niezależne źródło, publicznie sprawdzalny
      fakt) — czyli do czegoś, czego model fizycznie nie może sprawdzić
      za czytelnika, bo wymaga to wyjścia poza już przeanalizowaną treść.
      Pole `"tip"` w liście zasad odwołuje się teraz też do tej sekcji
      wprost, z jawnym zakazem sformułowań "sprawdź w tekście/artykule...".
      Zero zmian w schemacie/strukturze wyniku — to wyłącznie tekst
      promptu, WYŁĄCZNIE backend (`analyze/index.ts`), zero zmian
      frontendowych.
    - **POPRAWKA 2026-08-21(a) — grupowanie powtarzających się modeli w
      "foldery" (`scan.html` + `style.css`), frontend.** Zgłoszenie
      właściciela na żywym przykładzie (40-stronicowy PDF): ten sam model
      (np. "Zasady Pierwsze") bywa wykryty wiele razy na różnych stronach
      długiego dokumentu — płaska lista z powtarzającą się nazwą wyglądała
      jak "śmietnik". Wzorce o TEJ SAMEJ nazwie (`p.name`) są teraz
      grupowane w JEDNĄ, zwijaną kartę-"folder" z odznaką liczby wystąpień
      (`×N`, celowo bez tłumaczenia — czytelne w każdym z 10 języków bez
      dodawania kluczy i18n) — w środku, po rozwinięciu, wszystkie
      wystąpienia jedno pod drugim (własny cytat/wyjaśnienie/podpowiedź/
      numer strony każde), oddzielone cienką kreską, ale BEZ własnego,
      zagnieżdżonego zwijania (folder już porządkuje listę — podwójny
      akordeon byłby przesadą). Nazwa występująca tylko raz zostaje zwykłą,
      pojedynczą kartą jak dotąd. Zero zmian backendowych — wyłącznie
      sposób wyświetlania już istniejących danych.
    - **POPRAWKA 2026-08-21(b) — obsługa linków, których nie da się pobrać.**
      Żywy przykład od właściciela: link do artykułu na globenergia.pl
      kończył się błędem `url_fetch_failed` (nie udała się ani nasza próba,
      ani próba Gemini). Właściciel wprost oczekiwał, żeby aplikacja
      "potrafiła przeanalizować WSZYSTKO w internecie" — ustalone wspólnie,
      po rozłożeniu na czynniki pierwsze, że to nie jest osiągalne w 100%
      przy obecnej architekturze, i **świadomie NIE dodajemy tu zewnętrznej
      usługi/zależności biznesowej (np. gotowego "czytnika stron") bez
      osobnej, przemyślanej decyzji** — właściciel wyraźnie nie chce
      ograniczać kontroli biznesu przez dokładanie cudzych usług do
      krytycznej ścieżki produktu. Twardy powód techniczny: strony
      wymagające JavaScriptu do pokazania treści wymagają PRAWDZIWEJ
      przeglądarki, a Supabase Edge Functions fizycznie nie potrafią jej
      uruchomić — to ograniczenie platformy, nie promptu/kodu. Jedyna
      realna droga do pełnej kontroli nad tym byłby OSOBNY, samodzielnie
      hostowany serwer z przeglądarką (np. Playwright na Fly.io/Railway) —
      to osobny projekt infrastrukturalny (koszt hostingu, utrzymanie,
      zabezpieczenie przed nadużyciem), świadomie odłożony, dopóki nie
      okaże się to warte inwestycji. Na teraz zrobione dwie rzeczy, obie
      zero-kosztowe i zero-zależnościowe:
      1. `fetchUrlAsText()` dostał pełny komplet nagłówków, jakie realnie
         wysyła przeglądarka Chrome (Accept, Sec-Fetch-*, sec-ch-ua) —
         pomaga to tylko wąskiej kategorii zabezpieczeń sprawdzających
         same nagłówki, NIE pomoże stronom wymagającym JS.
      2. Komunikat błędu `err_url_fetch_failed` (wszystkie 10 języków,
         `i18n.js`) wprost podpowiada wklejenie tekstu artykułu w trybie
         "Tekst" jako obejście — użytkownik nigdy nie zostaje bez wyjścia,
         nawet gdy pobranie linku się nie uda.
    - **POPRAWKA 2026-08-21(c) — "ratunkowy" cache po `source_url`: obejście
      dla stron, których automatyka nigdy nie pobierze, rozszerzone o
      efekt sieciowy.** Właściciel wpadł na to sam, w reakcji na (b):
      skoro użytkownik i tak może wkleić treść ręcznie w trybie "Tekst",
      niech przy okazji będzie mógł podać też link źródłowy (żeby wynik
      wyglądał identycznie jak zwykła analiza linku, z odnośnikiem u
      góry) — a wtedy TEN SAM link "ratuje" automatycznie WSZYSTKIE
      przyszłe próby analizy tego adresu w trybie "Link", nawet jeśli
      automatyczne pobranie nigdy by się nie udało. Zmiany:
      - **Frontend** (`index.html`, panel "Tekst"): nowe, opcjonalne pole
        `#textSourceUrlInput` — walidowane (musi zaczynać się od
        http/https), NIE wchodzi do `content_hash` (hash liczony tylko z
        treści, żeby dwie osoby wklejające ten sam tekst nadal trafiały w
        ten sam wpis w cache'u niezależnie od podania linku), dopisywane
        do payloadu jako `source_url` tylko gdy wypełnione.
      - **Backend** (`analyze/index.ts`): nowa stała `textSourceUrl` —
        walidacja identyczna jak w trybie "Link" (http/https), zapisywana
        do kolumny `scans.source_url` dla `input_type === 'text'` (wcześniej
        ta kolumna była zerowana dla wszystkiego poza `'url'`). W gałęzi
        "url", DOKŁADNIE w momencie, gdy własne pobranie strony zawiodło
        (`preFetchedText` puste) — PRZED sięgnięciem po (płatną) ścieżkę
        awaryjną przez Gemini — nowe zapytanie: `SELECT * FROM scans WHERE
        source_url = <ten adres>`. Trafienie w dokładnie ten sam język →
        zwracamy ten wynik od razu, za darmo (`cached: true, cost: 0`),
        zupełnie pomijając Gemini. Trafienie w inny język (ale prawdziwy
        oryginał, `is_translation = false`) → tanie tłumaczenie przez
        istniejący `translateResult()`, ten sam wzorzec co "5a" wyżej.
        Dopiero brak trafienia wraca do dotychczasowej ścieżki awaryjnej
        (Gemini "URL context").
      - **Frontend** (`scan.html`): ikona źródła (`🔗`/`📄`/`🖼️`/`📝`) teraz
        zależy od TEGO, czy jest bezpieczny link źródła (`isSafeUrl`), a
        nie od `input_type` — analiza z ręcznie wklejonym tekstem +
        linkiem wygląda dokładnie tak samo jak zwykła analiza linku,
        zgodnie z prośbą właściciela.
      - **Uczciwe ograniczenie** (to samo co przy (b)): wymaga DOKŁADNIE
        tego samego adresu URL (litera w literę) i nie wykrywa, czy treść
        strony zdążyła się zmienić od czasu ręcznego wklejenia — ten sam
        kompromis, jaki już akceptujemy w całym współdzielonym cache'u.
    - **POPRAWKA 2026-08-21(v) — punkt 5 audytu bezpieczeństwa: "Zaufanie
      do ręcznie wklejonych linków".** Domyka "uczciwe ograniczenie" z (c)
      wyżej — długa rozmowa z właścicielem (patrz historia sesji), warto
      spisać, PRZEZ CO przeszliśmy i DLACZEGO odrzuciliśmy kilka wcześniej
      przyjętych wariantów, żeby nikt tego nie odkrywał od nowa.

      **Problem**: ratunkowy cache po `source_url` (patrz (c) wyżej) ufa
      JEDNEJ osobie na słowo — nic nie stało na przeszkodzie, żeby ktoś
      podał prawdziwy, znany link, ale podkleił pod niego zmyśloną,
      zmanipulowaną treść (na własną korzyść ALBO na cudzą szkodę —
      przypisując realnej stronie coś, czego nigdy nie napisała).

      **Odrzucone po drodze warianty (świadomie, z konkretnego powodu)**:
      1. *System kar* (blokada 30 dni za wklejenie błędnej treści, pół
         roku za fałszywe zgłoszenie) — odrzucony, bo wymagałby, żeby
         KTOŚ (właściciel) ręcznie oceniał, kto ma rację — właściciel
         wprost powiedział "na pewno nie chcę niczego sprawdzać ręcznie".
         Poza tym pomyłka w takim systemie kosztowałaby bardzo dużo
         (niesłusznie zablokowane, prawdziwe konto).
      2. *Próg "2 niezależnych, zgodnych zgłoszeń" zanim treść w ogóle
         trafi do wspólnego cache'u* (z porównaniem przez Gemini, bo
         proste liczenie wspólnych słów NIE złapałoby np. usunięcia
         jednego słowa "nie", które odwraca sens zdania — trafna uwaga
         właściciela) — odrzucony z DWÓCH powodów: (a) dawał złudne
         bezpieczeństwo — jeden atakujący z dwoma kontami i dwoma adresami
         IP (oba tanie i łatwe do zdobycia) mógł sam spełnić ten warunek,
         bo sam pisał OBA teksty tak, żeby się zgadzały; (b) mocno
         ograniczał użyteczność — dla rzadziej udostępnianych linków
         (czyli WŁAŚNIE tych, po które sięga się po mechanizm ratunkowy)
         drugie, niezależne wklejenie może nigdy się nie zdarzyć.
      3. **Uczciwy wniosek, który ostatecznie przyjęliśmy**: przy w pełni
         otwartej, darmowej rejestracji (bez weryfikacji tożsamości) NIE
         da się zbudować systemu w 100% odpornego na zdeterminowanego,
         cierpliwego atakującego z wieloma kontami — dokładnie ten sam
         kompromis, jaki już świadomie zaakceptowaliśmy przy samej
         rejestracji (patrz "Ochrona cashflow przed nadużyciem" wyżej,
         "świadomie POZA zakresem: ochrona przed atakiem przez wiele
         fałszywych kont naraz"). Każda kolejna warstwa ochrony podnosi
         PRÓG wysiłku potrzebnego do ataku, żadna go nie eliminuje w 100%
         — udawanie inaczej byłoby niespójne z resztą projektu.

      **Finalnie wdrożone (proporcjonalne do realnego ryzyka na tym etapie,
      chroni przed przypadkowymi pomyłkami i casualowym nadużyciem, nie
      udaje ochrony przed czymś nieproporcjonalnie kosztownym do
      zatrzymania)**:
      - Treść trafia do wspólnego cache'u OD RAZU po pierwszym wklejeniu
        (appka dalej radzi sobie ze WSZYSTKIM w internecie, zgodnie z
        pierwotnym celem tej funkcji) — oznaczona `scans.is_manual_source
        = true`.
      - **Stała, widoczna etykieta, KTÓRA NIGDY NIE ZNIKA** (nawet po
        latach cichych potwierdzeń) — kluczowe ZARÓWNO dla czytelników,
        jak i dla ochrony samego Gakori (jasne, że to treść od
        społeczności, nie nasza redakcyjna weryfikacja). Klucz i18n
        `manual_source_notice`.
      - **Ciche, WEWNĘTRZNE budowanie zaufania w czasie** — każda inna,
        zalogowana osoba, która trafi w tę treść (przez zwykłe wejście w
        link) i NIE zgłosi problemu, liczy się jako milczące potwierdzenie
        (tabela `link_view_confirmations`, klucz to ODCISK adresu IP —
        `hashIp()`, SHA-256, NIGDY surowy adres — a nie konto, z tego
        samego powodu anty-Sybil co reguły audytu bezpieczeństwa gdzie
        indziej). **Świadomie WYŁĄCZNIE wewnętrzne — użytkownik nigdy nie
        widzi liczby ani progu** — właściciel wprost: "nie chcę żeby
        użytkownicy widzieli zasady potwierdzenia... skoro nie wiedzą co
        wpływa na potwierdzenie, nie wiedzą jakie warunki spełnić" (utrudnia
        świadome obejście).
      - **Przycisk "Zgłoś niezgodność z treścią źródła"** (nowa funkcja
        `report-link-mismatch/index.ts`, wymaga zalogowania, `UNIQUE
        (scan_id, reporter_user_id)` — raz na osobę na wynik) — cofa
        WSZYSTKIE dotychczasowe ciche potwierdzenia dla tego wyniku
        (`DELETE FROM link_view_confirmations WHERE scan_id = ...`), bez
        oceniania, kto ma rację. **Bez żadnych kar** — złośliwe zgłoszenie
        jest możliwe, ale bez wielkich konsekwencji: proces potwierdzania
        po prostu trwa dłużej, treść pozostaje darmowo widoczna cały czas,
        traci tylko (niewidoczny i tak) wewnętrzny postęp.
      - **Warstwa 1, darmowy bonus, gdy to możliwe** (`maybeRecheckLinkFreshness()`
        w `analyze/index.ts`) — throttlowane (najwyżej raz na 24h na
        wpis, żeby nie bombardować cudzych stron), URUCHAMIANE PO
        wysłaniu odpowiedzi użytkownikowi przez `EdgeRuntime.waitUntil()`
        (nigdy go nie spowalnia). Próbuje DARMOWEGO (bez Gemini)
        `fetchUrlAsText()` — jeśli się uda i treść wygląda na wyraźnie
        inną (`looksSubstantiallyDifferent()`: prosty, darmowy test
        długości + nakładania się słów — TO NIE jest ochrona przed
        subtelną manipulacją, tylko szansa złapania OCZYWISTYCH rozbieżności
        za darmo) — cofa ciche potwierdzenia, tak samo jak zgłoszenie przez
        człowieka. **Świadomie NIE łapie linków, które NIGDY nie dają się
        pobrać automatycznie** (a to właśnie one trafiły do mechanizmu
        ratunkowego w pierwszej kolejności!) — dlatego to WYŁĄCZNIE bonus,
        nie jedyna ochrona (od tego jest warstwa cichych
        potwierdzeń+zgłoszeń wyżej, która działa zawsze, także tam).
        Ważne: NIE flaguje samego WZROSTU długości treści (artykuł
        "rosnący" w czasie, np. relacja live) jako rozbieżności — tylko
        wyraźny spadek/zmianę.
      - **"Sprawdź, czy coś się zmieniło"** — przycisk w `index.html`/
        `scan.html`, zawsze ŚWIADOMY wybór użytkownika, NIGDY automatyczny,
        i zawsze kosztuje DOKŁADNIE tyle, ile normalna analiza linku (nie
        drożej — właściciel wprost: "cena kredytów drugiej osobie nie
        może wzrosnąć, tylko dlatego że system musi wykonać dodatkową
        pracę"). Backend: nowy parametr `force_refresh` w body — pomija
        zarówno zwykły cache, jak i skróty ratunkowe (`rescueExact`/
        `rescueOriginal`), więc realnie próbuje pobrać stronę na nowo. Jeśli
        automat dalej zawiedzie, użytkownik dostaje uczciwy błąd (nie
        cichy powrót do starej treści). Zapis do `scans` zmieniony z
        `insert` na `upsert` (`onConflict: 'content_hash,language'`) —
        żeby świeży wynik mógł NADPISAĆ istniejący wiersz zamiast wywalić
        się na ograniczeniu unikalności.

      **Baza danych** (nowe elementy): `scans.is_manual_source` (boolean),
      `scans.link_last_checked_at` (timestamptz); `link_view_confirmations`
      (`scan_id`, `ip_hash`, `UNIQUE(scan_id, ip_hash)`);
      `link_mismatch_reports` (`scan_id`, `reporter_user_id`,
      `UNIQUE(scan_id, reporter_user_id)`). Obie nowe tabele: RLS
      włączone, zero publicznych polityk (jak reszta tabel `system_*`) —
      dostęp wyłącznie przez `service_role`.
    - **POPRAWKA 2026-08-23(a) — duży pakiet po pierwszym żywym teście
      punktu 5: naprawa duplikatu w cache'u ratunkowym, procentowe
      automatyczne wycofywanie treści, przejrzystość kosztów w całej
      aplikacji, integralność numeracji stron PDF.** Właściciel przetestował
      punkt (v) na żywo i zgłosił konkretne błędy/luki — poniżej cały
      pakiet odpowiedzi, w czterech punktach (A/B/C/D), tak jak był
      przedstawiony i zatwierdzony.

      **A — naprawa mechanizmu "Sprawdź, czy coś się zmieniło"**
      1. *Błąd zgłoszony na żywo (ze zrzutami ekranu)*: kliknięcie
         "Sprawdź, czy coś się zmieniło" dla treści wklejonej ręcznie w
         trybie "Tekst" (z podpiętym linkiem źródła) tworzyło DRUGI,
         zduplikowany wiersz w `scans` zamiast nadpisać oryginał — bo stary
         `upsert(..., {onConflict:'content_hash,language'})` konfliktuje
         po `content_hash`, a przy przejściu z trybu "Tekst" (hash z
         WKLEJONEJ TREŚCI) na świeże pobranie linku (hash z SAMEGO ADRESU)
         te dwa hashe nigdy się nie zgadzają. **Naprawa**: nowy parametr
         body `refresh_scan_id` — gdy podany (zawsze razem z
         `force_refresh:true`), backend robi `UPDATE ... WHERE id =
         refresh_scan_id` (nadpisując też sam `content_hash` na nowy,
         URL-owy — od tej pory wiersz jest poprawnie kluczowany po
         adresie) zamiast `upsert` po `content_hash`. `view_count` NIE
         wchodzi do tego nadpisania (zostaje dotychczasowy licznik — patrz
         punkt B niżej, wzór procentowy potrzebuje ciągłości tej liczby).
         `retracted` (patrz B) jest jawnie resetowane na `false` — dotarcie
         do tego miejsca oznacza, że właśnie zapłacono za PRAWDZIWĄ,
         świeżą analizę, więc zaufanie buduje się od nowa.
      2. *Pytanie właściciela*: "a co jeśli ktoś naciśnie 'sprawdź czy się
         zmieniło', ale link nie będzie działał? nie może wtedy przecież
         płacić". **Odpowiedź**: dwuetapowa zgoda na koszt, dokładnie ten
         sam wzorzec co PDF (`needs_confirmation`/`confirmed`) — patrz
         punkt C niżej, ten sam mechanizm obsługuje teraz i zwykłą analizę
         linku, i jego odświeżenie. Nic nie jest obciążane, dopóki
         użytkownik nie zobaczy realnej ceny i nie potwierdzi wprost.
      3. *Nowy, trzeci przycisk* w `resultManualSourceBox`/
         `scanManualSourceBox`: **"Nie zgadzasz się? Wklej własną
         treść"** — od razu przenosi na `index.html` w trybie "Tekst" z
         już wpisanym linkiem źródła (`index.html?prefill_text_source=...`,
         obsłużone w `DOMContentLoaded`), użytkownik musi tylko sam wkleić
         treść. Świadomie ZAWSZE widoczny obok pozostałych dwóch
         przycisków (nie tylko po błędzie) — to po prostu zawsze dostępna
         alternatywa dla kogoś, kto z góry nie ufa automatycznemu pobraniu.
      4. *Konkretniejsze komunikaty błędów* zamiast jednego uniwersalnego —
         `scan.html` dostał własną mapę `refreshErrorMessageKeys` (ten sam
         wzorzec co `errorMessageKeys` w `index.html`/`renderResult()`).

      **B — procentowe automatyczne wycofywanie treści (przeprojektowanie
      przycisku "Zgłoś niezgodność")**
      - **Problem ze starym mechanizmem** ((v) wyżej): zgłoszenie
        KASOWAŁO wszystkie ciche potwierdzenia (`link_view_confirmations`)
        — cofało zaufanie do zera, ale nie miało żadnego trwałego skutku
        poza tym (treść wracała, "kara" była tylko czasowa i niewidoczna).
      - **Odrzucony wariant**: płaski próg (np. "3 zgłoszenia i już") —
        właściciel: "za mały", **za łatwy do wywołania jednym złośliwym
        atakiem** na popularną, całkiem uczciwą treść. Zamiast tego, na
        sugestię właściciela ("powinien być jakiś procent w skali czasu"),
        przyjęto **próg procentowy z minimalną próbką**: **≥50
        wyświetleń I ≥20% z nich zgłoszonych jako niezgodne** →
        `scans.retracted = true`, **w pełni automatycznie, bez
        jakiegokolwiek ręcznego przeglądu** (świadoma decyzja właściciela
        — "napewno nie chcę niczego sprawdzać ręcznie").
      - **"Wyświetlenia" = `link_view_confirmations`, NIE `scans.view_count`**
        — świadomy wybór: `link_view_confirmations` liczy WYŁĄCZNIE
        różne adresy IP (`UNIQUE(scan_id, ip_hash)`), więc jest znacznie
        trudniejsze do sztucznego napompowania niż `view_count` (rośnie
        przy KAŻDYM trafieniu w cache, nawet z tego samego adresu). Tę samą
        logikę odporności zastosowano do licznika zgłoszeń: `UNIQUE
        (scan_id, reporter_user_id)` — jeden atakujący potrzebowałby
        naprawdę wielu różnych KONT, nie tylko odświeżeń.
      - **`link_view_confirmations` NIE JEST już kasowane przy zgłoszeniu**
        (`report-link-mismatch/index.ts` przepisane) — oba liczniki
        (wyświetlenia, zgłoszenia) rosną trwale i niezależnie, procent
        liczony na bieżąco przy KAŻDYM nowym zgłoszeniu.
      - **Skutek `retracted = true`**: treść NIE jest usuwana (dalej
        widoczna pod swoim linkiem — `scan.html` pokazuje wyraźne
        ostrzeżenie, klucz i18n `scan_retracted_notice`), ale przestaje
        być serwowana jako zaufana odpowiedź nowym pytającym — WYKLUCZONA
        zarówno ze zwykłego trafienia w cache (sekcja 2 w
        `analyze/index.ts`), jak i z mechanizmu ratunkowego
        (`rescueExact`/`rescueOriginal`, sekcja 5). Kolejna osoba pytająca
        o tę samą treść dostaje pełną, nową, płatną analizę.
      - **Darmowa, heurystyczna warstwa 1** (`maybeRecheckLinkFreshness()`,
        (v) wyżej) — dawniej też kasowała ciche potwierdzenia po wykryciu
        rozbieżności. **Świadomie PRZESTAŁA to robić** (kasowanie
        psułoby teraz mianownik wzoru procentowego na podstawie samej
        heurystyki, która może się mylić — np. legalnie skrócony
        artykuł) — zostaje wyłącznie "szansa złapania oczywistej
        rozbieżności za darmo", bez żadnej dalszej akcji; prawdziwa
        ochrona to WYŁĄCZNIE zgłoszenia prawdziwych ludzi.
      - **Widoczność w raporcie dziennym** (`daily-report/index.ts`) — nowa
        karta "Zaufanie do linków (punkt B)": liczba wycofanych treści
        łącznie + liczba zgłoszeń w ostatnich 24h. WYŁĄCZNIE informacyjne,
        nie wymaga żadnej reakcji właściciela.
      - **SQL**: `ALTER TABLE scans ADD COLUMN retracted boolean NOT NULL
        DEFAULT false;` (patrz "Baza danych" niżej po pełną listę).

      **C — przejrzystość kosztów w całej aplikacji** ("chciałbym, aby w
      całej aplikacji zostały przeliczane koszty użytkownika za wywołanie
      analiz, i żeby użytkownik zawsze wiedział ile płaci dokładnie za
      analizę")
      - **Tekst i obraz**: żywy, orientacyjny licznik kosztu w trakcie
        wypełniania formularza (`index.html`) — aktualizuje się na
        `input`/przy zmianie listy wybranych obrazów. Świadomie TYLKO
        orientacyjny (stałe `FIXED_FEE`/`MULTIPLIER_PER_1000_CHARS`/
        `IMAGE_SCAN_COST` powtórzone po stronie frontendu "na sztywno") —
        ostateczną cenę zawsze liczy i pilnuje wyłącznie backend (reguła 4
        audytu bezpieczeństwa).
      - **Link — zmiana z płaskiej stawki (`URL_SCAN_COST=6`) na cenę wg
        realnej liczby znaków**, tym samym wzorem co tekst. Wymaga to
        NAJPIERW darmowego pobrania strony (`fetchUrlAsText()`, ta sama
        funkcja co mechanizm ratunkowy) — jeśli się uda, cena = wzór
        tekstowy z policzonej liczby znaków; jeśli się NIE uda (np. strona
        wymaga JavaScriptu), zostaje stara, płaska stawka jako uczciwy
        kompromis dla tej rzadkiej, awaryjnej ścieżki. Ten sam
        pobrany tekst jest potem PONOWNIE UŻYTY (nie pobierany drugi raz)
        w Etapie 5 (właściwa analiza) — hoisted zmienne `preFetchedText`/
        `urlFetchedCharCount` na początku `Deno.serve()`.
      - **Link — dwuetapowa zgoda na koszt** (`needs_confirmation`/
        `confirmed`, ten sam wzorzec co PDF) — TERAZ ZAWSZE, nie tylko dla
        odświeżenia (patrz punkt A). Samo sprawdzenie ceny liczy się jako
        "nieudana próba" w mechanizmie ograniczania nadużyć
        (`logFailedAttempt()`), żeby nikt nie mógł bez końca sondować
        cudzych linków za darmo jako anonimowy proxy.
      - **PDF — ekran zgody na koszt TERAZ ZAWSZE**, niezależnie od liczby
        stron (dawniej: tylko powyżej `PDF_AUTO_ANALYZE_MAX_PAGES=20`,
        stała usunięta) — wybranie pliku samo w sobie nie jest jeszcze
        świadomą zgodą na konkretny koszt, nawet dla małego pliku.
      - **Odrzucony pomysł właściciela**: pole "wpisz z góry, ile stron ma
        plik", weryfikowane przez system przed analizą. Odrzucony po
        uczciwej ocenie: nasze WŁASNE, niezależne liczenie stron
        (pdf-lib) jest już w pełni autorytatywne i nigdy nie ufamy
        klientowi w kwestii ceny — pole nie dodałoby żadnej realnej
        ochrony, tylko dodatkowe tarcie ("no to nie" — właściciel).
      - **Paragon po fakcie**: po każdej analizie (nie tylko PDF)
        `index.html`/`scan.html` pokazują "Ta analiza kosztowała: X
        kredytów" albo "Za darmo — z pamięci" (trafienie w cache). Ważny
        niuans architektoniczny: rzeczywiste wyniki na `index.html`
        ZAWSZE przekierowują na `scan.html?id=...` (nigdy nie renderują
        się w miejscu) — więc ten "paragon" jest przekazywany przez
        `sessionStorage` (`gakori_scan_cost_<id>`, jednorazowy odczyt, ten
        sam wzorzec co miniatury obrazów) i pokazywany WYŁĄCZNIE osobie,
        która przed chwilą sama uruchomiła analizę — nie jest to stały,
        publiczny fakt widoczny dla każdego, kto później otworzy ten sam
        link (ktoś inny mógł zobaczyć tę samą treść za darmo z cache'u).

      **D — integralność numeracji stron PDF** (odkryte przy projektowaniu
      C — ostry przykład właściciela: fragment książki, gdzie WIDOCZNE w
      treści numery stron to np. 43-55, a sam plik ma fizycznie tylko 13
      stron)
      12. **Doprecyzowanie promptu do Gemini**: pole `"page"` musi ZAWSZE
          być fizyczną pozycją strony W PRZESŁANYM PLIKU licząc od 1 —
          Gemini ma CAŁKOWICIE IGNOROWAĆ jakikolwiek numer strony
          wydrukowany/widoczny w samej treści dokumentu, nawet gdy
          dokument ma własną numerację. Bez tego doprecyzowania model
          mógłby (zgodnie z ludzką intuicją, ale błędnie dla naszych
          potrzeb) zwrócić numer WIDOCZNY na stronie zamiast jej pozycji w
          pliku.
      13. **Twardy test integralności** — jeśli MIMO doprecyzowanego
          promptu i naszego WŁASNEGO, deterministycznego przeliczenia
          numeracji (offset fragmentu przy dzieleniu na części, patrz
          `analyzePdfChunk()`) numer strony jakiegokolwiek wzorca
          PRZEKRACZA rzeczywistą, niezależnie policzoną (pdf-lib) liczbę
          stron pliku — traktowane z TĄ SAMĄ powagą co reguły 1-4
          głównego wyłącznika: natychmiastowe zatrzymanie systemu dla
          wszystkich, BEZ obciążenia zapytania, które to wykryło (kontrola
          dzieje się PRZED sekcją zapisu do cache'u i odjęcia kredytów).
      - **Odłożony, niższy priorytet pomysł** (NIE zbudowany): "miękka"
        heurystyka rozmiar-pliku-vs-liczba-stron (tylko logowanie,
        nieblokująca) — oceniona jako dająca ograniczoną wartość bez
        własnej, dedykowanej infrastruktury logowania; odłożona, można
        wrócić przy realnej potrzebie.

      **Baza danych** (nowe elementy tego pakietu): `scans.retracted`
      (boolean, `NOT NULL DEFAULT false`).
    - **POPRAWKA 2026-08-25 — oczyszczanie pobranej strony z szumu,
      "Pokaż pełny tekst źródłowy" też dla linku, usunięcie sloganu pod
      logo.** Żywy przykład od właściciela, który to wymusił: ten sam
      artykuł polityczny dał **90/100 i ZERO wykrytych wzorców** przez
      "Link", ale **75/100 i 4 prawdziwe wzorce** przez ręczne wklejenie
      tego samego tekstu w trybie "Tekst" — bo automatyczne pobranie
      zaciągnęło do treści niepowiązany fragment z panelu bocznego strony
      ("WIDEO: Fatalne skutki pożaru..."). Ten sam szum zawyżał też cenę
      (płacimy za każdy znak). Właściciel trafnie zauważył: "to nie mogą
      być dwa osobne problemy — to jeden i ten sam problem: automatyczne
      pobranie strony jest brudne".

      **Oczyszczanie strony** (`fetchUrlAsText()` w `analyze/index.ts`,
      używane WSZĘDZIE tam, gdzie pobieramy stronę — wycena, analiza,
      sprawdzanie świeżości, ratunek — jedna zmiana, korzyść wszędzie):
      1. Jeśli strona oznacza swoją główną treść znacznikiem `<article>`
         (bardzo częste na dużych portalach ze względów SEO) — bierzemy
         TYLKO to, co jest w środku. Jednym ruchem wyrzuca menu strony,
         stopkę, panel boczny (żyją POZA `<article>`).
      2. Usuwamy każde wystąpienie `<nav>` (paski "udostępnij" itp.) —
         zawsze szum, nigdy treść artykułu.
      3. Usuwamy elementy (`div`/`section`/`aside`/`ul`/`figure`), których
         **CAŁY token** klasy/id (nie podciąg!) pasuje do typowej listy
         szumu: reklama, cookie/zgoda/RODO, newsletter, komentarze,
         "czytaj też"/polecane, sponsor, promo, udostępnianie. Dopasowanie
         CAŁEGO tokenu (rozdzielonego spacją/myślnikiem/podkreślnikiem),
         żeby np. polskie "adres" nie zostało błędnie potraktowane jak
         reklama ("ad").
      4. **Świadomie NIE usuwamy `<header>`/`<footer>`/`<aside>` "w
         ciemno" po samym typie tagu** — żywy przykład właściciela
         (zrzuty ekranu z narzędzi deweloperskich, polsatnews.pl):
         `<header class="news_header">` W OBRĘBIE `<article>` bywa
         właściwym nagłówkiem/leadem artykułu, nie szumem całej strony
         (ten "śmieciowy" wariant nagłówka strony i tak już odpada przy
         wycięciu `<article>` w kroku 1).
      5. Zachowujemy podział na akapity — koniec bloku (`</p>`, `</div>`,
         `</li>`, `</h1>`-`</h6>`, `<br>`, `</tr>`, `</blockquote>`)
         zamieniamy na pustą linię PRZED usunięciem reszty znaczników.
         Wcześniej cała treść zlewała się w jedną nieczytelną "ścianę
         tekstu" — WYŁĄCZNIE kwestia białych znaków, nigdy nie zmienia ani
         jednego słowa treści (dopasowanie cytatów w `scan.html`
         `buildHighlightedText()`/`normalizeWithMap()` już wcześniej
         traktowało dowolny ciąg białych znaków jak jedną spację).
      Realizowane przez dwie nowe funkcje pomocnicze bez żadnej
      zewnętrznej biblioteki/DOM-a (czysty regex + ręczne liczenie
      zagnieżdżenia tagów, żeby bezpiecznie usuwać np. `<div>` w `<div>`,
      czego samym regexem "od otwarcia do pierwszego zamknięcia" nie da
      się zrobić poprawnie): `stripElementsByTag()` i `hasNoiseClass()`.
      Sprawdzone na przykładzie zbliżonym do realnej struktury
      polsatnews.pl przed wdrożeniem — działa zgodnie z oczekiwaniami.

      **"Pokaż pełny tekst źródłowy" też dla linku** — dawniej WYŁĄCZNIE
      dla ręcznie wklejonego tekstu (`scans.text_content` było zawsze
      `null` dla `input_type: 'url'`). Teraz backend zapisuje tam
      oczyszczoną treść pobraną ze strony (`preFetchedText`) — DOKŁADNIE
      to, co naprawdę zobaczył Gemini. `scan.html` pokazuje ją identycznie
      jak dla tekstu (ten sam komponent podświetlania cytatów), warunek
      rozszerzony z `input_type === 'text'` na sam fakt posiadania
      `text_content`. `null`, gdy własne pobranie zawiodło i poszliśmy
      ścieżką awaryjną (Gemini "URL context") — wtedy po prostu nie mamy
      własnej kopii tekstu do pokazania. Cel (właściciel): transparentność
      (widać, co faktycznie trafiło do analizy) i większe zaangażowanie
      użytkowników w aplikacji.

      **Liczba znaków na ekranie zgody na koszt** — backend zwraca teraz
      `char_count` w odpowiedzi `needs_confirmation` dla trybu "url"
      (`urlFetchedCharCount`, `null` przy awaryjnej płaskiej stawce).
      `index.html` (`showPdfConfirm()`) i `scan.html` (dialog
      potwierdzenia "Sprawdź, czy coś się zmieniło") pokazują to razem z
      notatką, że cena już uwzględnia oczyszczenie strony z szumu — na
      wyraźną prośbę właściciela: "użytkownik musi wiedzieć, ze względu na
      ile znaków [jest cena], jako punkt wyjścia".

      **Usunięty slogan pod logo** ("Najważniejszą zasadą przetrwania jest
      wiedza") — na prośbę właściciela, z 4 stron (`index.html`,
      `scan.html`, `historia.html`, `account.html`) razem z nieużywaną już
      regułą CSS `.gakori-tagline` i kluczem i18n `tagline` (wszystkie 10
      języków).

      **Odłożone na później (świadomie NIE zbudowane w tej paczce)** —
      **cache na podstawie podobieństwa treści** (pomysł właściciela: gdy
      ktoś prześle treść bardzo podobną, ale nie identyczną, do już
      przeanalizowanej, serwować/wykorzystać istniejący wynik zamiast
      płacić za analizę od zera). Świadomie odłożone jako osobny, duży
      temat do spokojnego zaprojektowania — realne trudności do
      rozwiązania: (a) nie ma taniego sposobu sprawdzenia "podobieństwa"
      bez płacenia za AI za każdym razem ALBO bez ryzyka prostej,
      zawodnej heurystyki serwującej komuś nieaktualny/niepasujący wynik
      pod przykrywką "to ten sam artykuł" (podobne ryzyko, jakie już raz
      odrzuciliśmy przy "2 niezależnych zgłoszeniach", patrz POPRAWKA
      2026-08-21(v) wyżej); (b) właściciel zwrócił uwagę, że trzeba to
      zaprojektować tak, żeby nie "zapychać pojemności naszych magazynów"
      (rozrost bazy danych) i rozważyć jakąś automatyzację — do
      przemyślenia przy projektowaniu, np. czy przechowywać pełne
      odciski/fingerprinty treści, czy coś tańszego. Uwaga na przyszłość:
      zapis pełnej oczyszczonej treści strony dla KAŻDEJO linku (patrz
      wyżej, "Pokaż pełny tekst źródłowy") już sam w sobie zwiększa zużycie
      miejsca w bazie w porównaniu do stanu sprzed tej poprawki (do tej
      pory tylko PDF/obraz/tekst coś tam trzymały, link — nic) — ograniczone
      z góry limitem 20000 znaków na wpis (`fetchUrlAsText()`), więc
      wzrost jest policzalny i na razie nie powinien być problemem przy
      obecnej skali, ale warto to mieć na uwadze przy projektowaniu punktu
      o podobieństwie treści.
    - **POPRAWKA 2026-08-25(b) — spójność wyników: `temperature: 0` na
      WSZYSTKICH wywołaniach Gemini + naprawa dopasowania uciętych
      cytatów.** Żywy przykład od właściciela, bardzo poważny: ta sama
      (albo niemal ta sama — patrz niżej) treść dała w trybie "Link" wzorzec
      "Argument z Autorytetu", a w trybie "Tekst" zupełnie inny —
      "Krąg Kompetencji"; ten sam mechanizm "Efekt Pewności Wstecznej"
      wykryty w obu przypadkach, ale raz jako `pattern_type: "manipulation"`
      (wzorzec), raz jako `"reasoning"` (obserwacja) — sprzeczna ocena tego
      samego zjawiska. Właściciel: "ta sama treść musi dawać ten sam
      rezultat, nieważne jakim trybem jest analizowana — to konieczność
      naszej jakości".

      **Przyczyna**: żadne z ~12 wywołań `callGemini()` w kodzie nie miało
      ustawionej `temperature` — model działał na domyślnej wartości
      (dość wysokiej, "kreatywnej"), więc identyczny prompt na identycznym
      tekście mógł dać różne wyniki za każdym razem. To fundamentalna
      cecha działania LLM-ów (nie "błąd" jako taki), ale dla narzędzia,
      którego sensem jest POWTARZALNA, zaufana ocena tej samej treści —
      to realny problem zaufania, nie kosmetyka.

      **Naprawa**: `temperature: 0` dodane do WSZYSTKICH wywołań Gemini
      (kategoryzacja, główna analiza, druga runda szukania wzorców,
      weryfikacja/scalanie PDF i obrazu, każdy fragment PDF-a i każdy
      obraz osobno, tłumaczenie, składanie podsumowań PDF/obrazu,
      ratunkowa ścieżka "URL context") — maksymalny determinizm, jaki
      Gemini oferuje. **Uczciwe zastrzeżenie**: `temperature: 0` znacząco
      ZMNIEJSZA (nie eliminuje w 100%) losowość — infrastruktura
      wykonawcza dużych modeli (równoległość na wielu maszynach,
      zaokrąglenia zmiennoprzecinkowe) może w rzadkich przypadkach nadal
      dać drobne różnice. To najlepsze dostępne narzędzie, nie gwarancja
      matematyczna.

      **Druga, powiązana przyczyna różnic — nieidentyczny tekst wejściowy**:
      właściciel sam zauważył, że treść w obu trybach była "minimalnie
      różna ze względu na dłuższe klamry w jednym przypadku" — ręcznie
      wklejony tekst i automatycznie pobrany+oczyszczony tekst linku (patrz
      POPRAWKA 2026-08-25 wyżej) nie są sobie gwarantowane być bajt w bajt
      identyczne (różny zakres wycinka, różne miejsce ucięcia). To osobna
      przyczyna od samej losowości modelu — `temperature: 0` jej nie
      rozwiązuje, bo różny tekst wejściowy to świadomie różne dane
      wejściowe, nie błąd. Jeśli po tej poprawce rozjazdy między trybami
      nadal będą się zdarzać dla tekstów różniących się nawet w niewielkim
      zakresie — to sygnał do dalszej pracy nad odpornością modelu na małe
      zmiany tekstu (temat na przyszłość, patrz backlog "Wzmocnić
      wykrywanie wzorców").

      **Naprawa dopasowania uciętych cytatów** (`scan.html`,
      `findQuoteRange()`) — osobny, mniejszy błąd zgłoszony przy okazji:
      "Pokaż pełny tekst źródłowy" nie podświetlał wcale cytatu dla
      wzorca "Efekt Pewności Wstecznej", mimo że tekst realnie w nim był.
      Przyczyna: pole "quote" zwrócone przez Gemini bywało UCIĘTE
      wielokropkiem na końcu ("...") zamiast być pełnym, dosłownym
      fragmentem — sam wielokropek nigdy nie występuje w oryginalnym
      tekście, więc dopasowanie (dokładne i przybliżone) zawodziło
      całkowicie. Naprawione dwutorowo: (a) `findQuoteRange()` próbuje
      teraz dopasować cytat jako PREFIKS po odcięciu końcowego
      wielokropka; (b) `buildSystemPrompt()` (sekcja WIERNOŚĆ CYTATU)
      wprost zabrania kończenia cytatu wielokropkiem — model ma wybrać
      krótszy, w pełni kompletny fragment zamiast ucinać dłuższy.

      **Ograniczenie rozmiaru surowego HTML-a przed czyszczeniem**
      (`fetchUrlAsText()`, `MAX_RAW_HTML_CHARS = 800000`) — dodane
      ostrożnościowo przy okazji zgłoszenia "analiza czasem trwa bardzo
      długo (nawet ponad minutę) i pierwsza próba czasem się nie udaje,
      też przy PDF-ie". Kilka nowych przebiegów regex w `fetchUrlAsText()`
      (wycinanie `<article>`, usuwanie szumu, zachowanie akapitów, patrz
      POPRAWKA 2026-08-25 wyżej) kosztuje procesor proporcjonalnie do
      długości strony — dla bardzo dużych, nietypowych stron ucinamy
      surowy HTML z góry, PRZED czyszczeniem, żeby chronić ostry limit
      czasu PROCESORA Supabase Edge Functions (patrz "Wąskie gardło to
      limit CZASU PROCESORA" przy `PDF_HARD_MAX_PAGES` wyżej — to samo
      ograniczenie platformy dotyczy KAŻDEGO zapytania, nie tylko PDF-a).
      **Uczciwe zastrzeżenie — TO NIE JEST pełna diagnoza zgłoszonej
      powolności**: architektura analizy to zawsze była sekwencja WIELU
      wywołań Gemini (kategoryzacja → główna analiza → czasem druga runda
      → dla PDF/obrazu jeszcze więcej), z limitem `GEMINI_TIMEOUT_MS =
      20000` (20s) NA KAŻDE POJEDYNCZE wywołanie — kilka wolnych wywołań z
      rzędu może się realnie złożyć na ponad minutę łącznego czasu, co nie
      jest nowym zjawiskiem tej poprawki. Dodatkowo od POPRAWKA
      2026-08-23(a) każda ŚWIEŻA analiza linku wymaga TERAZ DWÓCH
      osobnych zapytań (darmowe sprawdzenie ceny + właściwa, potwierdzona
      analiza) — to architektura zamierzona (przejrzystość kosztów), ale
      podwaja liczbę potrzebnych pobrań strony. Błąd "analiza się nie
      udała" przy PIERWSZEJ próbie (bez zmian w kodzie PDF-a w tej
      poprawce) wymaga zajrzenia do prawdziwych logów (Supabase Dashboard
      → Edge Functions → analyze → Logs), żeby zobaczyć realny powód —
      nie da się tego wiarygodnie zdiagnozować z samego kodu bez
      dostępu do logów z produkcji.
    - **POPRAWKA 2026-08-25(c) — diagnoza błędów 502 (EDGE_FUNCTION_ERROR)
      z prawdziwych logów + ciche automatyczne ponowienie.** Kontynuacja
      POPRAWKI 2026-08-25(b) wyżej — właściciel przesłał prawdziwe logi z
      Supabase Dashboard (zakładka "Invocations", nie "Logs" — ważne
      rozróżnienie, patrz niżej).

      **Ważna nauka o czytaniu logów Supabase**: zakładka "Logs" pokazuje
      też zwykłe, techniczne zdarzenia SAMEJ PLATFORMY (uruchomienie/
      wyłączenie instancji funkcji, `"reason": "EarlyDrop"`,
      `cpu_time_used` rzędu pojedynczych mikrosekund) — to NIE są błędy
      analizy, tylko rutynowe cykle "silnika" (częste zaraz po nowym
      wdrożeniu). Prawdziwe, konkretne zapytania HTTP (z kodem
      odpowiedzi, czasem trwania, treścią zapytania) trzeba szukać w
      zakładce **"Invocations"**.

      **Znaleziony konkretny przypadek**: `"response.status_code": "502"`,
      `"response.headers.sb_error_code": "EDGE_FUNCTION_ERROR"`,
      `"execution_time_ms": "23325"` (23,3s), rozmiar zapytania 269 bajtów
      (typowy dla analizy linku — za mały na PDF/obraz). **To NIE jest
      błąd z naszego kodu** (nasz kod zawsze grzecznie zwraca JSON, nawet
      przy błędzie) — to sama platforma (Supabase/Cloudflare) przerwała
      działanie funkcji w trakcie.

      **Test wydajności PRZED wyciągnięciem wniosków** — zanim
      obwiniliśmy nowe czyszczenie strony (POPRAWKA 2026-08-25), sprawdzono
      to empirycznie: syntetyczna, bardzo "ciężka" strona (8000 elementów,
      1,4 MB) przechodzi przez `fetchUrlAsText()` w ~75 milisekund —
      **to WYKLUCZA czyszczenie strony jako przyczynę** tego konkretnego
      problemu.

      **Najbardziej prawdopodobne wytłumaczenie**: analiza linku to w
      środku kilka KOLEJNYCH (sekwencyjnych) zapytań do Gemini (dobór
      kategorii → główna analiza → czasem druga runda) — każde miało
      limit 20s. Dwa wolniejsze zapytania z rzędu (np. 10s + 13s) łatwo
      dają ponad 23s łącznie — a to prawdopodobnie trafia w jakiś twardy
      sufit samej platformy (Cloudflare stoi przed Supabase,
      `response.headers.server: cloudflare` w logu), niezależny od
      naszych własnych limitów w kodzie. **Uczciwe zastrzeżenie: nie mamy
      100% pewności co do dokładnego mechanizmu** — nie mamy dostępu do
      wewnętrznej dokumentacji dokładnych limitów tego konkretnego planu
      Supabase.

      **Decyzja z właścicielem (ważna rozmowa o kosztach)**:
      1. Właściciel odrzucił pierwszy pomysł ("skróćmy limit, żeby nasz
         kod poddawał się szybciej i grzeczniej") — słusznie zauważył, że
         to nie naprawia problemu, tylko szybciej się poddaje: "chcę żeby
         to działało, a nie żeby użytkownik co chwilę klikał ponów, bo
         się wkurzy i ucieknie".
      2. Zamiast tego: **automatyczne, ciche ponowienie w tle** (frontend,
         `fetchAnalyzeWithRetry()` w `index.html` i `scan.html`) — TYLKO
         przy błędzie PLATFORMY (rzucony wyjątek sieciowy albo status
         502/503/504), NIGDY przy naszym własnym, czystym błędzie JSON
         (np. "brak kredytów" — to dałoby dokładnie ten sam wynik drugi
         raz, więc ponawianie nie ma sensu). Użytkownik nic nie widzi —
         te same, już istniejące, rotujące komunikaty statusu lecą dalej,
         nie wie, że pierwsza próba w ogóle padła.
      3. **Właściciel trafnie zapytał: "a koszty nam się nie zwiększają?"**
         — i miał rację, żeby zapytać. Jeśli platforma zabija nas W
         TRAKCIE wywołania Gemini, Google mogło już wygenerować (i
         policzyć) odpowiedź, mimo że MY nigdy jej nie dostaliśmy —
         ponowienie w takim wypadku oznacza REALNĄ, PODWÓJNĄ zapłatę za
         Gemini (a przy nieudanym ponowieniu — nawet potrójną, gdyby były
         dwie dodatkowe próby). Długi czas (23s) przed błędem silnie
         sugeruje, że Gemini już pracowało. **Świadomie ograniczone do
         TYLKO JEDNEJ dodatkowej próby** (nie więcej) — połowuje ryzyko
         (×2 zamiast ×3) względem pierwotnego pomysłu.
      4. **Co nas i tak chroni**: reguła 8 (limit kosztu pojedynczego
         zapytania) i reguła 10 (dzienny budżet + wyłącznik) — nawet w
         najgorszym scenariuszu strata ma twardy sufit, nie jest
         "bez dna".
      5. **Nowa tabela `edge_function_retries`** (`id`, `created_at`,
         `input_type`) — frontend wstawia wiersz (fire-and-forget, nigdy
         nie blokuje) przy KAŻDYM ponowieniu. `daily-report` liczy wiersze
         z ostatnich 24h i pokazuje w mailu ("Ponowienia po błędzie
         platformy") — WYŁĄCZNIE widoczność, żeby właściciel realnie
         widział częstotliwość zjawiska (i orientacyjnie mógł ocenić
         skalę dodatkowego kosztu), zamiast zgadywać. RLS: `INSERT`
         dozwolony dla każdego (anon + zalogowani), zero publicznej
         polityki `SELECT` (jak reszta tabel `system_*`) — odczyt
         wyłącznie przez `service_role` w `daily-report`.
      6. **`GEMINI_TIMEOUT_MS` podniesiony z 20s na 30s** (na wyraźną
         prośbę właściciela — "może do 30 sekund") jako ostrożny,
         eksperymentalny krok. Właściciel trafnie zapytał, czy samo
         czekanie kosztuje nas więcej — **nie**: Gemini rozlicza się za
         liczbę przetworzonych/wygenerowanych tokenów, nie za czas
         oczekiwania na odpowiedź, więc wydłużenie limitu samo w sobie
         NIE zwiększa kosztu. **Uczciwe zastrzeżenie**: to NIE jest pewna
         naprawa — jeśli prawdziwym sufitem jest limit samej platformy
         (nie nasz `GEMINI_TIMEOUT_MS`), podniesienie limitu nic nie da,
         zobaczymy to po częstotliwości ponowień w kolejnych dniach
         (patrz punkt 5 wyżej). Jeśli 502 nadal będzie się zdarzać z
         podobną częstotliwością mimo dłuższego limitu — to potwierdzenie,
         że to sufit platformy, i trzeba szukać innej drogi (np.
         ograniczenia liczby sekwencyjnych wywołań Gemini w jednej
         analizie linku).

      **Baza danych** (nowe elementy): `edge_function_retries` (`id`,
      `created_at`, `input_type`), RLS włączone, `INSERT` dla wszystkich,
      brak publicznego `SELECT`.
    - **POPRAWKA 2026-08-25(d) — naprawa niespójności wyników: ratunek po
      `source_url` sprawdzany TERAZ ZAWSZE, nie tylko gdy własne pobranie
      zawiedzie.** Najpoważniejsze znalezisko z całej serii testów
      "spójność analiz" — realny błąd, nie kosmetyka.

      **Żywy przykład błędu**: właściciel wkleił tekst artykułu + link do
      niego w trybie "Tekst" (dostał wynik A: wzorce "Framing" +
      "Efekt Halo", 35/100). Potem wkleił TEN SAM link w trybie "Link" —
      zamiast dostać z powrotem wynik A za darmo (to dokładnie po to
      istnieje mechanizm ratunkowy, patrz POPRAWKA 2026-08-21(v)), dostał
      **zupełnie inny wynik B** (wzorce "Framing" — inny cytat! — +
      "Argument z Autorytetu", 45/100) i **zapłacił za to kredytami**.

      **Prawdziwa przyczyna**: kod ratunkowy (`rescueExact`/
      `rescueOriginal` po `source_url`) żył WYŁĄCZNIE w gałęzi "własne
      pobranie strony zawiodło" (sekcja 5, `else` przy `if
      (preFetchedText)`) — czyli sprawdzał się TYLKO wtedy, gdy
      `fetchUrlAsText()` nie dawało rady pobrać strony. Zanim POPRAWKA
      2026-08-25 (oczyszczanie stron) znacząco podniosła skuteczność
      własnego pobierania, ta ścieżka i tak była rzadko używana — ale im
      lepiej fetchUrlAsText() sobie radzi, tym RZADZIEJ ratunek w ogóle
      się uruchamiał, mimo że mechanizm miał być właśnie dla tego rodzaju
      przypadków (ta sama treść, inny tryb wejścia). Efekt uboczny
      poprawy jednej rzeczy (jakość pobierania) ujawnił defekt w innej
      (spójność cache'u) — klasyczny przykład, dlaczego trzeba patrzeć na
      system jako całość, nie punktowo.

      **Naprawa**: sprawdzenie ratunku przeniesione z sekcji 5 do
      NAJWCZEŚNIEJSZEGO możliwego miejsca w gałęzi "url" — zaraz po
      sprawdzeniu `!user_id`, PRZED jakimkolwiek własnym pobraniem strony
      czy wyceną kosztu. Jeśli ratunek istnieje — użytkownik dostaje go
      OD RAZU, za darmo, **bez ekranu zgody na koszt w ogóle** (bo nie ma
      czego wyceniać — to trafienie w cache, nie nowa analiza). Dopiero
      brak ratunku (albo świadome `forceRefresh` z "Sprawdź, czy coś się
      zmieniło") prowadzi dalej do darmowego sprawdzenia ceny i
      ewentualnej płatnej analizy. `geminiKey` (potrzebny do
      `translateResult()` przy `rescueOriginal`) przeniesiony wyżej w
      funkcji z tego samego powodu. Zdublowana logika ratunku w sekcji 5
      usunięta — gdyby kod tam dotarł, ratunek na pewno już nie istnieje
      (albo `forceRefresh`), więc jedyne, co zostaje, to awaryjna próba
      pobrania przez samo narzędzie Gemini "URL context".

      **Właściciel wprost o stawce**: "nie możemy przyjąć, że ten sam
      tekst daje dwa modele, bo tak stracimy wiarygodność u odbiorców co
      do naszej jakości. to musi zostać dobrze poprawione" — ta reguła
      (jedna treść → jeden, spójny wynik, niezależnie od trybu wejścia)
      jest teraz architektonicznie wymuszona dla linku, nie tylko
      deklarowana.

      **Odłożone na dalszy namysł** (świadomie NIE zbudowane teraz,
      właściciel: "jeżeli będzie trzeba, może zmodyfikujemy jaśniej naszą
      bazę modeli, żeby lepiej wyjaśniała, jak działają — ale to tylko
      jedna koncepcja"): dalsze doprecyzowanie biblioteki modeli
      mentalnych/promptu, gdyby MIMO tej naprawy (i `temperature: 0` z
      POPRAWKI 2026-08-25(b)) nadal zdarzały się rozjazdy dla tekstów
      różniących się w niewielkim zakresie — do oceny po tym, jak te dwie
      poprawki się "ułożą" w praktyce.
    - **POPRAWKA 2026-08-26 — odcisk palca treści liczony przez serwer (nie
      klienta) + usunięcie etapu kategoryzacji (zawsze cała biblioteka) +
      wymuszony przegląd 15 kategorii w brudnopisie AI.** Duża, wielogodzinna
      rozmowa z właścicielem o jakości analiz, wywołana żywym przykładem:
      link przeanalizowany w trybie "Link" dał wzorzec Framing (95/100), a
      DOKŁADNIE TA SAMA treść, wklejona z "Pokaż pełny tekst źródłowy" do
      trybu "Tekst", dała Efekt Halo (90/100) — mimo `temperature: 0` z
      POPRAWKI 2026-08-25(b). Właściciel: "mamy problem z jakością jaką
      oferujemy użytkownikowi... analizy muszą być absolutnie najwyższej
      jakości, a takie sytuacje absolutnie nie mogą występować."

      **Diagnoza (znaleziona w kodzie, nie zgadywana):**
      1. Odcisk palca treści (`content_hash`) do dziś liczyła PRZEGLĄDARKA i
         przysyłała gotowy w body zapytania — dla trybu "url" liczony z
         SAMEGO ADRESU URL, dla trybu "tekst" z WKLEJONEGO TEKSTU. Dwie
         całkowicie różne wartości dla identycznej treści → system w ogóle
         nie rozpoznawał, że to ten sam artykuł, i uruchamiał DWIE
         niezależne, osobne analizy zamiast oddać ten sam, zapisany wynik.
      2. Każda z tych dwóch niezależnych analiz przechodziła NAJPIERW przez
         osobny, "tani" etap kategoryzacji (`pickRelevantCategories()`) —
         Gemini oceniało, do których z 15 kategorii pasuje treść, i
         WYŁĄCZNIE ten podzbiór szedł do właściwej analizy. Dwa niezależne
         wywołania tego etapu (dla dwóch "różnych" — bo różny hash —
         zapytań) mogły (i w tym przypadku najwyraźniej dały) wybrać nieco
         inny zestaw kategorii, więc druga, właściwa analiza w ogóle nie
         miała szansy znaleźć tego samego wzorca za drugim razem.

      **Naprawa, część A — `effectiveContentHash` liczony przez serwer.**
      Nowa funkcja `sha256Hex()` (Web Crypto, ten sam algorytm co dawniej w
      przeglądarce) liczy prawdziwy odcisk PO STRONIE SERWERA, z treści,
      która NAPRAWDĘ poszła do analizy — zero zaufania do `content_hash` z
      body (ten sam wzorzec zero-zaufania co przy `user_id`/JWT). Dla trybu
      "tekst": liczony od razu z `text_content` (już znanego w całości).
      Dla trybu "url": na starcie zostaje hash z URL-a (przydatny do
      wczesnego sprawdzenia cache'u, zanim jeszcze pobierzemy stronę), a
      zaraz PO `fetchUrlAsText()` zostaje NADPISANY prawdziwym hashem
      oczyszczonej treści strony — to ten hash trafia do zapisanego wiersza
      `scans` i do sprawdzenia tłumaczeń między językami. Efekt: artykuł
      przeanalizowany jako link, a POTEM wklejony ręcznie (dokładnie ten sam
      tekst) w trybie "Tekst", trafi teraz w TEN SAM wiersz cache'u — jeden
      wynik, nie dwa. Dla obrazu/PDF-a zostaje hash od klienta bez zmian
      (poza zakresem dzisiejszego problemu). Powtórna analiza TEGO SAMEGO
      URL-a nadal działa bez zmian — obsługuje to już niezależny mechanizm
      ratunku po `source_url` z POPRAWKI 2026-08-25(d), nie ten hash.

      **Naprawa, część B1 — koniec zawężania kategorii.** Usunięte:
      `pickRelevantCategories()`, `CATEGORY_RESPONSE_SCHEMA`, cały etap
      "tania kategoryzacja". `buildMentalModelsLibrary()` (bez argumentów)
      zwraca teraz ZAWSZE pełną bibliotekę wszystkich 15 kategorii, dla
      KAŻDEJ analizy (tekst, link, obraz, PDF — obraz/PDF już i tak
      dostawały pełną bibliotekę, więc dla nich nic się nie zmienia).
      **Uczciwe wyliczenie kosztu** (patrz też rozmowa z właścicielem, pełna
      matematyka omówiona ustnie): dawniej treść szła do Gemini DWA razy na
      analizę (kategoryzacja + główna analiza), teraz RAZ — a sama
      biblioteka (nawet cała, ~7,4 tys. znaków) jest krótsza niż większość
      analizowanych artykułów. W praktyce zmiana jest NEUTRALNA kosztowo
      albo TAŃSZA, nie droższa, zgodnie z wyliczeniem: 2 wysłania treści
      zamiast 3 (kategoryzacja + główna + "druga runda szukania" →
      główna + "druga runda szukania").

      **Naprawa, część "checklist" — wymuszony przegląd 15 kategorii.**
      Ponieważ jedno duże zapytanie z całą biblioteką TEORETYCZNIE zwiększa
      ryzyko, że model "zjedzie" po kilku najbardziej oczywistych
      kategoriach i przez nieuwagę pominie resztę, `CHAIN_OF_THOUGHT_INSTRUCTION`
      dostała nową, obowiązkową sekcję "PRZEGLĄD KATEGORII" na samym
      początku brudnopisu (`reasoning_steps`) — model musi jedną linijką na
      kategorię (wszystkie 15, po kolei) zaznaczyć pasuje/nie pasuje, ZANIM
      w ogóle zacznie iść akapit po akapicie. To NIE jest matematyczna
      gwarancja (żadna instrukcja tekstowa nią nie jest) — ale to prawie
      darmowa poprawka w TYM SAMYM zapytaniu (kilka dodatkowych zdań w
      brudnopisie, który i tak nigdy nie trafia do użytkownika), więc
      wymuszamy ją zawsze, jako dodatkowe zabezpieczenie obok samego
      usunięcia zawężania.

      **Świadomie odłożone na później (opisane właścicielowi, z pełną
      matematyką kosztu i realnym sprawdzeniem limitów Google — patrz
      niżej): "15+1"** — prawdziwe, mechaniczne rozbicie na 15 osobnych
      zapytań (po jednym na kategorię, równolegle) + 1 zapytanie scalające,
      analogicznie do już działającego dzielenia PDF-ów na części
      (`PDF_CHUNK_PAGES`). To JEDYNY sposób na 100% gwarancję (nie tylko
      instrukcję) pokrycia wszystkich kategorii — ale kosztuje realnie
      więcej (treść wysyłana ~16 razy zamiast ~2), więc właściciel
      rozważa dla niego OSOBNY, droższy cennik (np. 10 kredytów zamiast 5),
      żeby marża została chroniona nawet przy najtańszym (hurtowym)
      pakiecie kredytów klienta. **Blokująca sprawa sprawdzona na żywo**:
      konto Google AI działało na darmowym poziomie (15 zapytań/minutę, 500
      zapytań/DZIEŃ dla Gemini 3.5 Flash Lite — łącznie dla całej
      aplikacji!) — jedna analiza 40-stronicowego PDF-a przy podziale
      "15+1 na kawałek" (10 kawałków × 16 = 160 zapytań) sama zjadłaby
      prawie 1/3 dziennego limitu CAŁEJ aplikacji. Właściciel sprawdził
      płatne poziomy w konsoli Google: Tier 1 ≈ 4 005 RPM / 150 000 RPD,
      Tier 2 ≈ 10 005 RPM / 350 000 RPD, Tier 3 ≈ 30 005 RPM / bez limitu
      dziennego — każdy z nich z ogromnym zapasem na "15+1", więc **włączenie
      płatności w Google AI Studio jest warunkiem wstępnym** przed
      wdrożeniem "15+1" (a i tak, niezależnie od tej funkcji, dobrym
      pomysłem już teraz — darmowy limit 500 zapytań/dzień jest bardzo
      ciasny nawet dla dzisiejszego ruchu). Ustalone też: NIE łączyć osi
      "podział po stronach" (PDF) z osią "podział po kategoriach" w jednym
      mnożeniu bez realnej potrzeby (40 stron × 16 kategorii = 160 zapytań
      to inny scenariusz niż zwykły tekst/link × 16 = tylko 16) — najpierw
      wdrożyć "15+1" dla tekstu/linku (jedna "porcja" treści, bez podziału
      na strony), zebrać dowody jakości i kosztu, dopiero potem rozważać
      PDF z ustalonym górnym limitem stron dla tego droższego trybu.
    - **POPRAWKA 2026-08-26(ac) — zamknięcie realnej luki: koszt Gemini z
      NIEUDANYCH analiz teraz też liczy się do dziennego budżetu.**
      Bezpośrednia reakcja na (ab) niżej — właściciel trafnie zauważył:
      "jakby ktoś to robił całą noc, to byśmy poczuli" — i miał rację.
      Reguły 8 (limit $6,25/zapytanie) i 10 (limit $125/dzień, cała firma)
      były dotąd sprawdzane i zapisywane do `system_daily_spend` TYLKO na
      samym końcu, PO w pełni udanej analizie. Jeśli analiza przerywała się
      błędem w trakcie — koszt zapytań do Gemini, które już zdążyły się
      wykonać, znikał bez śladu: nie trafiał do licznika, nie mógł zatrzymać
      systemu. Jedyna dotychczasowa ochrona (`logFailedAttempt`/
      `rate_limit_blocks`) blokuje tylko POJEDYNCZE, zalogowane konto po
      kilku nieudanych próbach — nie chroni budżetu całej firmy przed wieloma
      kontami albo wolniejszym tempem.

      **Naprawa**: logika liczenia kosztu i sprawdzania obu progów (dawniej
      wbudowana tylko w ścieżkę sukcesu) wydzielona do jednej funkcji
      `recordSpendAndCheckThresholds()`, wywoływanej teraz z DWÓCH miejsc:
      (1) tak jak dotychczas, na końcu udanej analizy, (2) NOWO — w bloku
      `finally` obejmującym całą resztę funkcji `Deno.serve`, który
      wykonuje się ZAWSZE, niezależnie od tego, czy analiza zakończyła się
      sukcesem, znanym błędem (`return` w środku), czy nieoczekiwanym
      wyjątkiem (`catch`). Blok `finally` uruchamia tę funkcję TYLKO jeśli
      koszt nie został już policzony na ścieżce sukcesu (`spendRecorded`)
      ORAZ faktycznie powstał jakiś koszt (`costTracker.totalUsd > 0` —
      czyli chociaż jedno zapytanie do Gemini zdążyło się wykonać) — dzięki
      temu zwykłe, "tanie" wczesne wyjścia (np. `system_paused`, sam
      ekran potwierdzenia ceny bez wywołania Gemini) nie robią zbędnego
      zapytania do bazy. Jeśli po doliczeniu tego kosztu okaże się, że
      przekroczono próg — `finally` NADPISUJE odpowiedź komunikatem
      "system wstrzymany" (`outageResponse`), tak samo jak już działo się to
      na ścieżce sukcesu.

      **Efekt**: KAŻDY realnie wydany dolar na Gemini — udany czy nie —
      trafia teraz do dziennego licznika i jest sprawdzany względem obu
      progów. Ktoś odpalający w kółko nieudane, kosztowne analizy (np.
      duże PDF-y kończące się błędem procesora) zostanie zatrzymany przez
      Regułę 10, tak jak każdy inny sposób przekroczenia dziennego budżetu.

      **Świadome ograniczenie**: jeśli platforma (Supabase/Deno) przerwie
      działanie funkcji na tyle brutalnie (twardy limit procesora — patrz
      POPRAWKA (ab)), że nasz własny kod JS w ogóle nie zdąży się wykonać —
      ani `catch`, ani `finally` nie uruchomią się, i tego pojedynczego
      kosztu nadal nie zobaczymy. To fundamentalna granica tego, co kod
      może kontrolować, nie da się jej zamknąć od środka funkcji.

      Weryfikacja: `node --experimental-strip-types --check` (poprawna
      składnia) oraz `tsc --noEmit --skipLibCheck` (brak nowych błędów
      typów — te same dwa przedawnione, niezwiązane z tą zmianą, co
      wcześniej).

      **Do zrobienia (na osobne potwierdzenie właściciela)**: rozważyć
      dodatkowe zabezpieczenie na dokładnie tę sytuację — np. niższy,
      dodatkowy próg specyficzny dla "spadku sukcesu" (wysoki odsetek
      nieudanych analiz w krótkim czasie), niezależny od progu $/dzień.
    - **POPRAWKA 2026-08-26(ab) — WYCOFANIE (aa): limit stron PDF wrócił z
      160 na 80, po realnym teście na żywo.** Właściciel przetestował
      90-stronicowy PDF (już w granicach nowego limitu 160) i analiza
      zakończyła się błędem — pierwsze REALNE potwierdzenie ryzyka, o
      którym ostrzegałem przy POPRAWCE (aa) (limit czasu procesora Supabase,
      sztywne 2 sekundy, identyczne na każdym planie — sprawdzone w
      dokumentacji Supabase). Właściciel słusznie zażądał powrotu do 80 —
      jedynej wartości faktycznie sprawdzonej w produkcji.
      `PDF_HARD_MAX_PAGES` → z powrotem 160 → 80, oraz cofnięty napis w
      panelu PDF (`index.html` + wszystkie 10 języków w `i18n.js`) —
      "(maksymalnie 80 stron)". `PDF_LEVEL1_MAX_GROUP_PAGES` i cała
      architektura hierarchii (POPRAWKA (z)) — BEZ ZMIAN, nadal wdrożona i
      aktywna, tylko górny sufit stron wrócił do poprzedniej wartości.

      **Ważniejsze odkrycie przy tej samej okazji — realna luka w głównym
      wyłączniku bezpieczeństwa, potwierdzona w kodzie, NIE hipoteza:**
      Reguła 8 (limit $6,25/zapytanie) i Reguła 10 (limit $125/dzień,
      `system_daily_spend`) liczą i zapisują koszt TYLKO na samym końcu
      funkcji, PO udanym zakończeniu całej analizy (`costTracker.totalUsd`
      sprawdzane i dopisywane do `system_daily_spend` dopiero tuż przed
      `chargeCredits()`). Jeśli analiza przerywa się błędem w trakcie (np.
      przez limit procesora, awarię Gemini, cokolwiek) — te już naprawdę
      wydane dolary (za zapytania do Gemini, które zdążyły się wykonać
      przed przerwaniem) **nigdy nie trafiają do `system_daily_spend` i
      nigdy nie są konfrontowane z żadnym progiem**. Jedyna dziś istniejąca
      ochrona przed powtarzającymi się nieudanymi próbami to
      `logFailedAttempt()`/`rate_limit_blocks` — ale to blokuje TYLKO
      pojedyncze, zalogowane konto po kilku nieudanych próbach, nie chroni
      globalnego budżetu firmy przed wieloma kontami/wolniejszym tempem.
      Właściciel trafnie zauważył: "jakby ktoś to robił całą noc, to
      byśmy poczuli" — DZIŚ jest to prawdą, bo nic globalnego by tego nie
      zatrzymało. **Zidentyfikowane, jeszcze NIE naprawione** — czeka na
      osobną decyzję/potwierdzenie właściciela co do sposobu naprawy
      (patrz "Do zrobienia" niżej), zgodnie z zasadą "nic nie wdrażam bez
      wyraźnego tak".
    - **POPRAWKA 2026-08-26(aa) — limit stron PDF podniesiony z 80 do 160,
      na wyraźną prośbę właściciela, PO wspólnym sprawdzeniu wpływu na
      cashflow.** Właściciel chciał przetestować hierarchię PDF (POPRAWKA
      (z) niżej) na dłuższym pliku i zauważył, że limit w kodzie (80) nie
      zgadza się z liczbą 160, którą wcześniej używaliśmy w rozmowie —
      słusznie, bo 160 było wtedy TYLKO przykładem do liczenia
      kosztów/marży, nigdy nie było potwierdzone jako zmiana realnego
      limitu (patrz POPRAWKA (y) niżej — tam świadomie zostawione bez
      zmian). Zgodnie z zasadą "sprawdzaj lub pytaj przy cashflow"
      sprawdziłem PRZED wdrożeniem: cena rośnie liniowo
      (`PDF_PAGE_COST_PER_PAGE=2.5`), więc 160 stron = dokładnie 400
      kredytów — to DOKŁADNIE ten wariant, który wcześniej mieścił się w
      ustalonym paśmie marży 88-95%; próg awaryjny "Reguła 8" ($6,25 na
      jedno zapytanie) jest daleko od realnego kosztu nawet przy 160
      stronach (koszt to grosze) — istniejące reguły głównego wyłącznika
      już to pokrywają, więc NIE dodano żadnego nowego progu.
      `PDF_HARD_MAX_PAGES = 80` → `160` (jedna stała w `analyze/index.ts`).

      **Jedyne ryzyko, jawnie zakomunikowane właścicielowi, to NIE
      cashflow, tylko niezawodność**: oryginalny limit 80 miał zostać
      podniesiony dopiero PO zebraniu realnych danych produkcyjnych
      (komentarz w kodzie sprzed tej poprawki) — czego jeszcze nie
      zrobiliśmy. Właściciel świadomie wybrał podniesienie od razu do 160,
      rozumiejąc że w najgorszym razie bardzo długi/złożony PDF może
      zakończyć się błędem (przekroczenie limitu czasu procesora Supabase)
      zamiast wynikiem — a NIE stratą pieniędzy, bo `chargeCredits()`
      obciąża konto DOPIERO po pełnym sukcesie całej analizy (sprawdzone w
      kodzie przed odpowiedzią właścicielowi). Test na żywym, długim PDF-ie
      (blisko 160 stron) pozostaje zalecanym pierwszym krokiem po wdrożeniu.

      **Frontend**: nowy komunikat w panelu wgrywania PDF-a (`index.html`,
      tuż pod "Wybierz plik PDF do analizy:") — nowy klucz i18n
      `label_pdf_page_limit` ("(maksymalnie 160 stron)"), dodany do
      WSZYSTKICH 10 języków w `i18n.js`. Istniejący komunikat błędu
      `err_pdf_too_long` już wcześniej pobierał liczbę `{max}` dynamicznie
      z odpowiedzi backendu, więc automatycznie pokazuje teraz 160 bez
      żadnej zmiany w tym miejscu.
    - **POPRAWKA 2026-08-26(x)/(y)/(z) — duży pakiet: protokół 15 kategorii
      (schemat), niższa cena PDF-a, i nowy POZIOM 1 hierarchii PDF-a z
      wykrywaniem rozdziałów.** Wdrożone razem, na wyraźną prośbę
      właściciela ("wszystkie trzy naraz, o ile dasz radę, niczego nie
      pogubisz i nie uszkodzisz") — po tym, jak wcześniej w tej samej
      sesji zacząłem wdrażać bez czekania na zgodę i zostałem słusznie
      poprawiony ("znów wprowadzasz, a ja tylko zadaję pytania" /
      "jeszcze niczego nie zatwierdziłem") — tamte niezatwierdzone zmiany
      zostały cofnięte (`git checkout`) przed ponownym startem.

      **(x) Protokół 15 kategorii — prawdziwa gwarancja, nie prośba.**
      Patrz `CATEGORY_CHECKLIST_SCHEMA` (nowa stała, tuż po
      `MENTAL_MODEL_CATEGORIES`) — 15 osobnych, WYMAGANYCH kluczy (jeden
      na kategorię, wartość "pasuje"/"nie pasuje"), wygenerowanych
      programowo, żeby nigdy nie rozjechały się z prawdziwą listą
      kategorii. Zastępuje dawny wolny tekst na początku "reasoning_steps"
      (który w ogóle nie był sprawdzany pod kątem kompletności — tylko
      czy niepusty). Dodane do WSZYSTKICH trzech schematów detekcji:
      `DETECTION_RESPONSE_SCHEMA` (tekst/link), `IMAGE_CHUNK_SCHEMA`,
      `PDF_DETECTION_RESPONSE_SCHEMA`. Pole usuwane z wyniku przed zapisem
      (`delete result.category_checklist`, obok istniejącego
      `delete result.reasoning_steps`) — to samo miejsce, sam mechanizm.
      Gałąź moderacji obrazu (`unsafe_content`) też zaktualizowana —
      przy niebezpiecznej treści wszystkie 15 kategorii dostają "nie
      pasuje" zamiast pustego tekstu. **Koszt: zero, zero nowych
      zapytań** — to ta sama struktura odpowiedzi, tylko jedno pole
      podzielone na 15 mniejszych, obowiązkowych.

      **(y) Niższa cena PDF-a.** `PDF_PAGE_COST` (8 kr./stronę, dawniej
      = `IMAGE_SCAN_COST`) zastąpione przez `PDF_PAGE_COST_PER_PAGE = 2.5`
      (oba miejsca użycia: `computeExpectedCost()` i główna wycena PDF-a w
      `Deno.serve`, oba przez `Math.ceil()`, żeby cena zawsze była pełną
      liczbą kredytów, ZAOKRĄGLONĄ W GÓRĘ — nigdy w dół). 160 stron × 2,5
      = dokładnie 400 kredytów, zgodnie z wcześniejszym ustaleniem.
      `IMAGE_SCAN_COST` **świadomie NIE zmienione** — obrazy nie dostają
      nowej hierarchii niżej, a ich cena nie była osobno przeanalizowana z
      tą samą dokładnością co PDF (patrz "DOKŁADNOŚĆ PRZY CASHFLOW").
      `PDF_HARD_MAX_PAGES` (limit 80 stron) **świadomie NIE zmienione** —
      właściciel nigdy wprost nie potwierdził podniesienia go (rozmowa o
      160/360 stronach była czysto hipotetyczna, do policzenia liczb),
      więc zostało bez zmian, żeby nie zgadywać zakresu decyzji.

      **(z) POZIOM 1 hierarchii PDF-a + wykrywanie rozdziałów.** Nowa
      architektura: Etap 1 (`analyzePdfChunk`, kawałki po 4 strony, BEZ
      ZMIAN w liczbie/koszcie) → **nowy POZIOM 1** (`analyzePdfLevel1Group`,
      grupy do `PDF_LEVEL1_MAX_GROUP_PAGES=16` stron, wyrównane do granic
      rozdziałów gdy wykryte) → Etap końcowy (dawny "Etap 2",
      `verifyAndRefinePdfPatterns`, BEZ ZMIAN mechanizmu, tylko dostaje
      teraz listę już wzbogaconą o Poziom 1) → Etap 3 (`composePdfSummary`,
      bez zmian). Dla dokumentu do 80 stron (dzisiejszy limit) to
      maksymalnie 20 (Etap 1) + 5 (Poziom 1) = 25 zapytań + 2 (końcowe) =
      27 łącznie — WIĘCEJ niż dziś (było max 22), ale dużo mniej niż
      hipotetyczne 56-125 z wcześniejszych, większych wariantów (160/360
      stron), bo `PDF_HARD_MAX_PAGES` zostało bez zmian.

      **Wykrywanie rozdziałów, "przy okazji", bez nowego zapytania**: Etap
      1 dostał dodatkowe pole `chapter_starts` (nowy `CHAPTER_STARTS_SCHEMA`)
      w TYM SAMYM zapytaniu — zgłasza numer strony + tytuł, jeśli na niej
      zaczyna się wyraźny nowy rozdział/sekcja. Po zebraniu wszystkich
      kawałków: jeśli wykryto ≥2 realne granice (nie licząc niejawnego
      startu na stronie 1) — `buildLevel1Groups()` stawia granice grup
      Poziomu 1 NA granicach rozdziałów (dłuższy rozdział wciąż dostaje
      kilka grup po ≤16 stron, ale żadna grupa nie łączy końca jednego
      rozdziału z początkiem drugiego); inaczej zwykły, sztywny podział co
      16 stron. **Czysta funkcja `buildLevel1Groups()` przetestowana
      OSOBNO w Node.js (4 scenariusze: bez rozdziałów, z rozdziałami,
      fałszywie pojedyncze zgłoszenie = fallback, krótki dokument) PRZED
      wpisaniem do pliku — a POTEM wyekstrahowana z gotowego pliku i
      przetestowana PONOWNIE tymi samymi testami, żeby potwierdzić, że
      finalna wersja w kodzie zachowuje się identycznie** (zgodnie z
      zasadą "sprawdzaj lub pytaj przy cashflow" — to nie wpływa na cenę
      wprost, ale wpływa na strukturę/koszt zapytań, więc ta sama
      ostrożność).

      Poziom 1 działa na TYM SAMYM mechanizmie "corrections po dosłownym
      cytacie" co POPRAWKA (v) dla tekstu/linku — poprawia nazwy już
      znalezionych wzorców (w tym nazwy dwumodelowe przy remisie) I szuka
      dodatkowych wzorców widocznych tylko w szerszym kontekście.
      **Fail-open, świadomie INACZEJ niż Etap 1**: błąd/timeout JEDNEJ
      grupy Poziomu 1 NIE przerywa całej analizy (Etap 1 już zagwarantował
      pełne pokrycie stron) — tracimy tylko bonus dla tego zakresu, nie
      całą analizę. Reguła integralności D13 (numer strony ≤ liczba stron
      dokumentu) sprawdzana też dla nowych wzorców z Poziomu 1, osobno.

      **Uczciwe, NIEZWERYFIKOWANE ryzyko (świadomie zaakceptowane, bo
      brak możliwości testu na żywej infrastrukturze)**: więcej wywołań
      `pdf-lib` (`copyPages`/`save()`, jedno na każdą grupę Poziomu 1,
      obok istniejących wywołań na kawałek Etapu 1) oznacza więcej pracy
      procesora w limicie czasowym Supabase Edge Function (patrz
      komentarz przy `PDF_HARD_MAX_PAGES` — "tylko 2 sekundy rzeczywistej
      pracy procesora"). Dla 80-stronicowego dokumentu to wzrost z ~20 do
      ~25 operacji kopiowania stron, przy czym te z Poziomu 1 kopiują
      WIĘCEJ stron na operację (do 16 zamiast 4) — łączna liczba
      skopiowanych "stron × operacji" mniej więcej się podwaja. TO NIE
      BYŁO TESTOWANE na żywej infrastrukturze (sandbox nie ma do niej
      dostępu) — właściciel powinien przetestować na realnym, długim
      (blisko 80 stron) PDF-ie jako pierwszy krok po wdrożeniu, zanim
      uzna to za w pełni sprawdzone.
    - **POPRAWKA 2026-08-26(w) — dokończenie POPRAWKI (v) dla PDF/obrazu,
      świadomy, jednorazowy koszt.** Właściciel potwierdził, że chce tej
      samej weryfikacji nazw modeli także dla PDF-ów i zdjęć, mimo
      dodatkowego kosztu — zapytał wprost, dlaczego dla tekstu/linku było
      za darmo, a tu nie, i dlaczego "tylko raz" — wyjaśnienie: Etap 3
      tekstu/linku i tak już wysyłał pełną bibliotekę drugi raz (recykling
      istniejącego zapytania), a Etap 2 PDF-a/obrazu (czyszczenie
      duplikatów, `verifyAndRefinePdfPatterns`/`verifyAndRefineImagePatterns`)
      nigdy wcześniej biblioteki nie dostawał — to NOWA treść w prompcie,
      stąd realny koszt. "Tylko raz" — bo ten krok uruchamia się RAZ na
      całą analizę, po scaleniu wszystkich części z Etapu 1 (który już
      wcześniej wysyłał bibliotekę per strona/zdjęcie — to ISTNIEJĄCY,
      nie nowy koszt).

      Zrobione: obie funkcje dostały nowy parametr `mentalModelsLibrary`
      (przekazywany z `buildMentalModelsLibrary()` w obu miejscach
      wywołania) i dopisane zadanie 4/5 w prompcie: sprawdź nazwę każdego
      wzorca względem opisu/przykładu w bibliotece, popraw słabe
      dopasowanie, ustaw nazwę dwumodelową przy prawdziwym remisie
      (ta sama zasada "Model A / Model B" co w POPRAWKA (v), wyjaśniona tu
      SAMODZIELNIE w prompcie — te dwie funkcje nie dostają całego
      `buildSystemPrompt()`, więc nie mogły po prostu odwołać się do
      sekcji "PRZYPADEK WIELOMODELOWY" z tamtego promptu, jak pierwotnie
      napisano, i to poprawiono). Koszt (`costTracker`) automatycznie
      podlega tym samym regułom 8/10 głównego wyłącznika co reszta
      wywołań Gemini — bez dodatkowej pracy, zgodnie z zasadą "kill switch
      przy każdej zmianie kosztowej".
    - **POPRAWKA 2026-08-26(v) — nazwa dwumodelowa przy prawdziwym remisie +
      weryfikacja już wybranych nazw, PRAWIE za darmo dla tekstu/linku.**
      Dwie połączone zmiany, obie w `buildSystemPrompt()`/
      `findAdditionalPatterns()`:

      **1) "PRZYPADEK WIELOMODELOWY" zamiast arbitralnego rozjemcy.**
      Sekcja "SPÓJNOŚĆ WYBORU MODELU PRZY REMISIE" (POPRAWKA (n)/(n2))
      miała krok 2: przy PRAWDZIWYM, pełnym remisie (ten sam poziom
      dowodów) wybierz model wymieniony w bibliotece jako pierwszy. To
      wciąż był arbitralny wybór — tylko deterministyczny, nie losowy.
      Właściciel zaproponował lepsze rozwiązanie: zamiast zmuszać model do
      wybrania jednego zwycięzcy przy prawdziwym remisie, niech NAZWA
      wprost pokaże obie pasujące etykiety, format "Model A / Model B"
      (kolejność z biblioteki, więc wciąż deterministyczna). Uczciwsze niż
      udawanie pewności co do jednego wyboru, i wciąż w pełni spójne
      między powtórzonymi analizami tej samej treści.

      **2) Weryfikacja wyboru modelu — piggyback na Etapie 3, ZERO nowych
      zapytań dla tekstu/linku.** Właściciel zapytał, czy warto dodać krok
      sprawdzający już wybrane nazwy modeli na podstawie wzbogaconej (od
      POPRAWKI (r)) biblioteki z przykładami. Etap 3 (`findAdditionalPatterns`,
      "druga runda szukania") i tak JUŻ dostaje pełną bibliotekę (w
      `systemPrompt`) i listę już znalezionych wzorców w JEDNYM zapytaniu —
      dopisano więc drugie zadanie do TEGO SAMEGO promptu: "sprawdź każdą
      już wybraną nazwę względem opisu/przykładu w bibliotece; jeśli słabo
      pasuje, popraw; jeśli dwa modele pasują naprawdę tak samo dobrze,
      ustaw nazwę dwumodelową." Nowe pole odpowiedzi `corrections` (osobne
      od `patterns`, dopasowywane po dosłownej treści cytatu — fail-open:
      cytat, którego nie ma na oryginalnej liście, jest po prostu
      ignorowany, nic się nie psuje). **Koszt: praktycznie zero** — to
      dokładnie to samo zapytanie co już istniało, tylko dłuższa instrukcja
      i nieco większy schemat odpowiedzi.

      **PDF/obraz — NIE zrobione w tej turze.** Świadomie odłożone: te
      tryby mają OSOBNY mechanizm czyszczenia (`verifyAndRefinePdfPatterns`/
      `verifyAndRefineImagePatterns`), który dziś w ogóle NIE dostaje
      biblioteki modeli w swoim prompcie — dodanie tam tej samej
      weryfikacji wymagałoby doklejenia biblioteki do promptu, który
      wcześniej jej nie miał, czyli realnego dodatkowego kosztu (~$0,0006
      raz na całą analizę PDF/zdjęć, nie mnożone przez liczbę stron/obrazów
      — bo te funkcje uruchamiają się raz, po scaleniu wszystkich części).
      Mały koszt, ale NIE zerowy jak w tekście/linku — do zrobienia w
      kolejnej turze, jeśli właściciel potwierdzi, że wciąż tego chce.

      **Zgodnie z nową zasadą "kill switch przy każdej zmianie kosztowej"
      (patrz "Zasady współpracy" niżej)**: nowy koszt (i tak $0 dla
      tekstu/linku) przechodzi przez ten sam `costTracker`, którym
      `findAdditionalPatterns()` posługiwało się już wcześniej — więc
      automatycznie podlega regule 8 ($6,25/zapytanie) i regule 10
      ($125/dzień) bez żadnej dodatkowej pracy.
    - **POPRAWKA 2026-08-26(u) — realny koszt AI (USD) w raporcie dziennym,
      wcześniej całkowicie nieobecny.** Właściciel wprost: chce znać
      przepływ cashflow bez niespodzianek. Dotąd `daily-report` pokazywał
      WYŁĄCZNIE kredyty wydane (przybliżenie strony przychodu) — mimo że
      prawdziwy koszt Gemini w dolarach jest już liczony i zapisywany co
      dzień (`system_daily_spend`, reguła 10 głównego wyłącznika), nikt
      wcześniej nie dociągnął go do samego raportu. Naprawa: karta
      "Kredyty" w mailu pokazuje teraz też realny koszt AI dziś (USD),
      obok limitu bezpieczeństwa $125/dzień dla porównania. Nowy formatter
      `fmtUsd()` (4 miejsca po przecinku) — istniejący `fmt()` zaokrąglał
      do 1 miejsca, co dla kwot rzędu $0,01-$0,50 (typowy dzienny koszt na
      wczesnym etapie) pokazywałoby bezużyteczne "$0.0".

      **Uczciwe zastrzeżenie**: system prawdziwych płatności jeszcze nie
      istnieje (patrz "Do dopisania w przyszłości" przy opisie
      `daily-report`), więc to na razie sam koszt do obserwowania trendu
      dzień po dniu, nie pełne zestawienie "koszt vs przychód" — to drugie
      dopiero gdy powstanie prawdziwy system płatności.
    - **POPRAWKA 2026-08-26(t) — scalanie wyników przy "Sprawdź, czy coś się
      zmieniło" zamiast bezwarunkowego zastąpienia.** Żywe zgłoszenie:
      właściciel wykonał tę akcję dwa razy pod rząd na tej samej stronie i
      dostał RÓŻNĄ liczbę wzorców (raz mniej, raz więcej) — mimo że strona
      w praktyce się nie zmieniła. Propozycja wprost od właściciela: "nie
      możemy wykorzystywać drugi raz tych samych treści, jeżeli się
      powtarzają, chyba że zniknęły... nie usuwamy wyników z modelu, jeżeli
      ten cytat dalej znajduje się w treści po ponownym sprawdzeniu."

      Rozróżnienie dwóch przypadków w kodzie: (1) strona w praktyce
      niezmieniona (podobieństwo ≥ progu, patrz POPRAWKA (j),
      `SHINGLE_SIMILARITY_THRESHOLD`) — to już od dawna zwraca STARY wynik
      za darmo, bez pytania Gemini drugi raz, więc TU niespójność w ogóle
      nie mogła powstać; (2) strona zmieniła się realnie (poniżej progu) —
      TU właśnie był problem: szliśmy do pełnej, nowej analizy Gemini, która
      CAŁKOWICIE zastępowała stary wynik, mimo że część starych cytatów
      wciąż fizycznie była w nowo pobranej treści — a samo rozumowanie
      Gemini nie jest w 100% deterministyczne między niezależnymi
      wywołaniami, nawet dla niemal identycznego tekstu (ten sam, głębszy
      mechanizm co przy POPRAWCE (n)/(n2), tam dla nazwy modelu przy
      remisie, tu dla samego faktu ponownego znalezienia wzorca).

      **Naprawa (`analyze/index.ts`)**: nowa zmienna `refreshOldResult`
      (hoisted na początku funkcji) zapamiętuje stary wynik WTEDY, gdy
      przechodzimy dalej do prawdziwej, płatnej analizy (czyli poniżej
      progu podobieństwa). Po policzeniu nowego wyniku — scalenie: każdy
      STARY wzorzec, którego dosłowny `quote` nadal jest podciągiem
      świeżo pobranej treści (i którego nowa analiza SAMA nie znalazła —
      sprawdzane po treści cytatu, żeby nie zduplikować), zostaje
      DOŁOŻONY do nowo znalezionych wzorców, nie zastąpiony. Wzorzec,
      którego cytat faktycznie zniknął ze strony, słusznie znika też z
      wyniku — to jedyny przypadek realnej utraty. Logika sprawdzona
      dwoma syntetycznymi testami (Node) odzwierciedlającymi dokładnie
      zgłoszony scenariusz — oba przeszły.

      **Uczciwe zastrzeżenie (świadomie zaakceptowane, nie zablokowało
      wdrożenia)**: `q_score` w scalonym wyniku to wciąż liczba z samego
      NOWEGO przebiegu Gemini — jeśli dołożono stare wzorce, ocena może
      nie w pełni odzwierciedlać finalną, scaloną listę wzorców. Mniejszy
      problem niż to, co naprawia (całkowita utrata realnych, wciąż
      obecnych wzorców) — do ewentualnej poprawki (np. osobne, tanie
      przeliczenie oceny na podstawie finalnej listy), jeśli po
      obserwacji na żywo okaże się to realnie mylące.
    - **POPRAWKA 2026-08-26(s) — nowa funkcja `weekly-model-report`, mail co
      piątek 11:00 z materiałem do wspólnego przeglądu modeli mentalnych.**
      Odpowiedź na pytanie właściciela o "automatykę" budującą bibliotekę
      z realnych przykładów. Świadomie ODRZUCONA pełna automatyzacja (system
      sam decydujący, co jest dobrym przykładem) — samo to, że model
      CZĘSTO przypisuje coś do "modelu X" nie znaczy, że robi to
      POPRAWNIE; bez człowieka pośrodku moglibyśmy tylko utrwalać
      systematyczny błąd zamiast go naprawiać. Zamiast tego: nowa Edge
      Function (ten sam wzorzec co `daily-report` — pg_cron, Brevo,
      REPORT_RECIPIENT_EMAIL, WYŁĄCZONA weryfikacja JWT, własny sekret w
      nagłówku, REUŻYWA istniejącego `CRON_REPORT_SECRET`) wysyła RAZ W
      TYGODNIU mailem (po polsku) listę realnych cytatów przypisanych w
      ostatnich 7 dniach do każdego modelu (do 3 różnych cytatów na
      model, z linkiem do pełnej analizy), posortowaną wg częstości. Cel:
      raz w tygodniu właściciel razem z Claude ręcznie ocenia, które
      przykłady są trafne, i DOPIERO WTEDY dopisuje je do
      `MENTAL_MODELS_BY_CATEGORY` — żaden zapis do kodu nie dzieje się
      automatycznie.

      **Świadome ograniczenie zakresu (uczciwie zaznaczone w kodzie)**:
      raport liczy WYŁĄCZNIE oryginalne (`is_translation = false`)
      analizy w języku polskim — bo (1) biblioteka modeli ma nazwy po
      polsku, więc tylko polskie `name` da się bezpośrednio dopasować do
      klucza w bibliotece, (2) pole `quote` nigdy nie jest tłumaczone, więc
      w wynikach-tłumaczeniach cytat byłby w innym języku niż reszta
      polskiego maila. Analizy w innych językach w ogóle nie są ujęte —
      akceptowalne uproszczenie na start, bo większość testowania i tak
      dzieje się po polsku.

      **Bezpieczeństwo**: cytaty to fragmenty dowolnych stron internetowych
      wybrane przez AI — traktowane jako niezaufana treść, wstawiane do
      HTML maila przez nową funkcję `escapeHtml()` (nie istniała wcześniej
      w `daily-report`, który wstawia `result.summary` bez takiego
      escapowania — świadomie NIE naprawiane teraz, bo poza zakresem tej
      zmiany, ale warto o tym pamiętać przy następnej okazji).

      **Wdrożenie (wymaga Twojej ręcznej akcji w Supabase)**: (1) wklej i
      wdróż nowy plik `supabase/functions/weekly-model-report/index.ts`
      (jak zawsze), (2) w Settings tej funkcji wyłącz "Verify JWT with
      legacy secret" (tak jak przy `daily-report`), (3) w SQL Editor
      uruchom harmonogram — sekrety (`CRON_REPORT_SECRET` itd.) są już
      skonfigurowane dla `daily-report`, więc nic dodatkowego tu nie
      trzeba ustawiać:
      ```sql
      select cron.schedule('gakori-weekly-model-report', '0 9 * * 5', $$
        select net.http_post(
          url:='https://<TWÓJ-PROJEKT>.supabase.co/functions/v1/weekly-model-report',
          headers:=jsonb_build_object('x-cron-secret', '<TWÓJ CRON_REPORT_SECRET>'),
          body:='{}'::jsonb
        )
      $$);
      ```
      **Uwaga na strefę czasową (ta sama pułapka co przy `daily-report`)**:
      `0 9 * * 5` to piątek 09:00 UTC = piątek 11:00 czasu polskiego LATEM
      (CEST, UTC+2, tak jak teraz w sierpniu) — zimą (CET, UTC+1) ten sam
      harmonogram dostarczy mail o 10:00 czasu polskiego, chyba że ktoś
      ręcznie przestawi cron przy zmianie czasu. Świadomie zaakceptowane
      jako drobna niedogodność, tak jak przy `daily-report`.
    - **POPRAWKA 2026-08-26(r) — przykłady dla WSZYSTKICH modeli mentalnych
      w bibliotece (nie tylko mylących się par).** Kontynuacja POPRAWKI
      (n)/(n2) — właściciel zapytał, czy uboga biblioteka (nazwa + jedno
      zdanie, bez przykładów) utrudnia modelowi rozróżnianie podobnych
      modeli, powołując się na żywy przypadek "Bodziec" vs "Wąskie Gardło"
      dla tego samego cytatu. Pierwsza rekomendacja (dodać przykłady TYLKO
      do potwierdzonych, mylących się par, żeby nie podnosić kosztu każdej
      analizy) — świadomie ODRZUCONA przez właściciela: "uważam że każdy
      model powinien mieć dobrze dopasowane przykłady kluczowe dla
      rozpoznania tego modelu w różnych sytuacjach." Zrobione: WSZYSTKIE
      103 modele (patrz niżej, dlaczego 103 nie 100) w
      `MENTAL_MODELS_BY_CATEGORY` mają teraz krótki przykład "np. ..." —
      dla 53 modeli opartych na przykładach z `MODELE_MENTALNE.md`
      (skrócone do jednej linijki), dla pozostałych 50 (w tym Wąskie
      Gardło/Bodźce z wcześniejszej poprawki) — nowo napisane, zwięzłe
      przykłady dobrane tak, żeby jak najlepiej oddawały MECHANIZM danego
      modelu i odróżniały go od modeli podobnych.

      **Uczciwy koszt (świadomie zaakceptowany)**: biblioteka urosła z ok.
      7,4 tys. do ok. 15,2 tys. znaków kodu — mniej więcej DWUKROTNIE,
      wysyłana w całości przy KAŻDEJ analizie (od POPRAWKI B1). Przy tak
      taniej klasie modelu jak Flash-Lite to nadal niewielki koszt w
      liczbach bezwzględnych, ale to realny, trwały wzrost kosztu każdego
      zapytania — świadoma decyzja właściciela, jakość ważniejsza niż ta
      różnica.

      **Żywe, uboczne odkrycie przy tej okazji**: biblioteka w kodzie ma w
      rzeczywistości **103 modele, nie 100** — kategoria PSYCHOLOGIA ma 4
      dodatkowe modele (Fałszywa Pilność, Sztuczny Niedobór, Argument z
      Autorytetu, Strach przed Utratą/FOMO), których w ogóle nie ma w
      `MODELE_MENTALNE.md`. To NIE jest coś zepsute przez tę poprawkę —
      to najwyraźniej rozjazd sprzed tej sesji, mimo komentarza w kodzie
      "jeśli zmieniasz jedno, zaktualizuj drugie". `MODELE_MENTALNE.md`
      (plik "dla ludzi") NIE został zaktualizowany o te 4 modele ani o
      nowe przykłady dla pozostałych — świadomie odłożone na później,
      niski priorytet (nie wpływa na jakość analiz, tylko na dokumentację
      dla człowieka).
    - **POPRAWKA 2026-08-26(q) — konto właściciela samo się zablokowało po
      intensywnym testowaniu "Sprawdź, czy coś się zmieniło".** Żywe
      zgłoszenie: po serii testów tej funkcji na wielu linkach WSZYSTKIE
      kolejne analizy zaczęły od razu kończyć się błędem "Coś poszło nie
      tak" — bez wyjątku, na wielu różnych linkach naraz.

      **Przyczyna, znaleziona przez przegląd kodu (bez dostępu do logów
      na żywo):** darmowy, pierwszy krok dwuetapowej zgody na koszt (samo
      sprawdzenie ceny, ZANIM cokolwiek zostanie policzone/wysłane do
      Gemini) był liczony przez `logFailedAttempt()` jako "nieudana
      próba" — dokładnie ten sam licznik nadużyć co przy PRAWDZIWYCH
      błędach (np. nieudane pobranie strony). Próg to 15 "nieudanych"
      prób w ciągu 10 minut (`RATE_LIMIT_FAILURE_THRESHOLD`/
      `RATE_LIMIT_WINDOW_MINUTES`) — przy intensywnym testowaniu (wiele
      linków, wiele rund w tej sesji) to naturalnie się przekroczyło,
      mimo że nic naprawdę się nie nie udało — to był tylko normalny,
      pierwszy krok płatnego, dwuetapowego przepływu. Po przekroczeniu
      progu konto dostaje blokadę (od 10 minut wzwyż, rosnącą 3× z każdą
      kolejną w ciągu 30 dni) na WSZYSTKIE analizy, nie tylko na
      "Sprawdź, czy coś się zmieniło" — stąd wrażenie, że "wysypało się"
      wszystko naraz. Pogłębiał to fakt, że `scan.html` w ogóle nie znał
      kodu błędu `too_many_failed_attempts` — pokazywał więc mylący,
      uniwersalny komunikat zamiast uczciwej informacji "jesteś
      zablokowany, spróbuj za X minut" (to drugie index.html już
      pokazywało od dawna, z żywym licznikiem).

      **Naprawa (`supabase/functions/analyze/index.ts`, wymaga ręcznego
      wdrożenia w Supabase):** usunięto `logFailedAttempt()` z obu
      miejsc, gdzie liczyło samo, udane sprawdzenie ceny — dla linku i
      dla PDF-a. Uzasadnienie usunięcia (nie tylko podniesienia progu):
      pierwotny cel tego wpisu ("żeby ktoś nie mógł bez końca sondować
      cudzych linków/PDF-ów za darmo jako anonimowy proxy") jest już w
      pełni zamknięty wymogiem zalogowanego konta na starcie obu tych
      gałęzi (`!user_id` odrzuca anonimowych) — więc licznik nie chronił
      przed niczym realnym, tylko karał prawdziwe konta za normalne
      korzystanie z funkcji. (`scan.html`, frontend, auto-wdrożenie):
      `showRefreshError()` rozpoznaje teraz `too_many_failed_attempts` i
      pokazuje ten sam żywy, odliczający licznik co index.html, zamiast
      uniwersalnego komunikatu — na wypadek, gdyby prawdziwa blokada
      (z realnych błędów) kiedyś się zdarzyła.

      **Co dalej dla właściciela**: naprawa w kodzie nie kasuje istniejącej
      blokady w bazie (jeśli już powstała) — trzeba albo poczekać, aż
      `blocked_until` minie (frontend po wdrożeniu poprawki pokaże
      dokładnie ile zostało), albo ręcznie usunąć wiersz w tabeli
      `rate_limit_blocks` (Supabase → Table Editor) dla swojego `user_id`,
      jeśli zależy na natychmiastowym odblokowaniu.
    - **POPRAWKA 2026-08-26(p) — dwa żywe zgłoszenia właściciela: pozorne
      duplikaty w wyszukiwarce + "nic się nie wydarzyło" przy odświeżaniu.**

      **1) Wyszukiwarka pokazywała tę samą treść po kilka razy.** Zrzut
      ekranu właściciela: trzy pozycje na liście "Wyszukaj analizę" z
      niemal identycznym początkiem tekstu ("To reakcja na obiektywne
      trudności rynkowe...") — bo widoczny w wierszu "tytuł" to w
      rzeczywistości pierwszy cytat/podsumowanie wyniku (`index.html` nie
      ma osobnego pola tytułu dla skanów), więc kilka analiz TEJ SAMEJ
      treści (raz z linku, raz z ręcznie wklejonego tekstu — dokładnie
      historia testów z tej sesji) wyglądały jak zaśmiecający duplikat.
      Właściciel wprost: "wystarczy że zmieni się tytuł w wyszukiwarce i
      ta sama praktycznie analiza może być zdublowana w nieskończoność —
      musimy jakoś opanować nazewnictwo i system wyszukiwania."

      Naprawa (tylko `index.html`, `fetchAndRenderScans`): pobieramy teraz
      60 najnowszych wierszy zamiast 20, po stronie przeglądarki
      odsiewamy duplikaty po `content_hash` (ten sam serwerowo liczony
      hash z POPRAWKI 2026-08-26, który zamyka "url≠tekst" niespójność —
      patrz wyżej) — zostawiamy tylko NAJNOWSZY wiersz na unikalny hash, a
      z tego przycinamy do 20 do wyświetlenia. Świadomie NIC nie kasujemy
      w bazie — cała historia zostaje (ta sama zasada co przy "Zgłoś
      niezgodność"), tylko lista widoczna na stronie głównej pokazuje
      jedną pozycję na unikalną treść.

      **Uczciwe zastrzeżenie**: to działa w pełni dopiero dla analiz
      wykonanych PO dzisiejszej poprawce `effectiveContentHash` — starsze
      wiersze w bazie (jak te trzy ze zrzutu ekranu) mogą mieć różne
      hashe mimo tej samej treści (bo zostały zapisane, zanim hash liczył
      się poprawnie po stronie serwera) i wciąż będą widoczne osobno,
      dopóki nie zostaną odświeżone. Nowe duplikaty od teraz nie powinny
      się już pojawiać.

      **2) "Sprawdź, czy coś się zmieniło" — kliknięcie bez reakcji, potem
      inny wynik po drugim kliknięciu.** Zapytanie do Gemini bywa wolne
      (do 30s) — przycisk `scanForceRefreshBtn` nie był blokowany na czas
      oczekiwania, więc drugie kliknięcie w trakcie ładowania odpalało
      DRUGIE, równoległe zapytanie na ten sam wiersz (`refresh_scan_id`).
      Backend nadpisuje ten sam wiersz (POPRAWKA A1, nie tworzy
      duplikatu), ale przy dwóch równoległych zapytaniach to, co
      faktycznie widać na końcu, zależy od tego, które z nich skończyło
      się jako drugie — stąd wrażenie przypadkowości ("jakaś analiza w
      cache się zaktualizowała"). Naprawa: przycisk (i "Tak, analizuj" na
      ekranie zgody z POPRAWKI (o) wyżej) blokuje się na czas trwania
      zapytania, więc drugie kliknięcie po prostu nic nie robi zamiast
      wywoływać drugie, równoległe zapytanie.
    - **POPRAWKA 2026-08-26(o) — własny ekran zgody zamiast okienka
      przeglądarki dla "Sprawdź, czy coś się zmieniło".** Właściciel: okienko
      wyglądało "jakby z przeglądarki, a nie z naszego systemu aplikacji" —
      słuszna uwaga prestiżowa, bo `confirm()` to gołe okno systemu
      operacyjnego, bez naszych kolorów/logo, tej samej jakości co reszta
      aplikacji. Naprawa (tylko `scan.html`, frontend): nowy
      `#refreshConfirmOverlay` — dokładnie ten sam wzorzec wizualny co
      istniejący `#pdfConfirmOverlay` w `index.html` (`.modal-overlay` +
      `.card`, wspólne z `style.css`), tylko osobna instancja (scan.html nie
      ładuje tamtego div-a z index.html). Pokazuje liczbę znaków do analizy
      i uwagę o oczyszczeniu strony (te same klucze i18n co przy PDF/linku:
      `url_confirm_char_count`, `url_confirm_clean_notice`), koszt
      (`pdf_confirm_cost` — celowo reużyty, treść ogólna: "Koszt: {cost}
      kredytów") i dwa przyciski (`btn_pdf_confirm_yes`/`btn_pdf_confirm_no`
      — też reużyte). Klucz `force_refresh_confirm_cost` stał się przez to
      martwy (nieużywany nigdzie) — usunięty z `i18n.js` (wszystkie 10
      języków), liczba kluczy na język: 164 (sprawdzone skryptem).

      Przy okazji wyjaśnienie właścicielowi (bez żargonu) faktu, który
      zaobserwował tego samego dnia: "Sprawdź, czy coś się zmieniło" na
      analizie linku sprzed dzisiejszych poprawek filtra "Najpopularniejsze"
      poprawnie pokazało pytanie o dopłatę — bo świeże pobranie strony (już
      z NOWYM, lepszym czyszczeniem) dało znacznie mniej znaków niż stary,
      zaszumiony zapis sprzed poprawki. To NIE błąd, tylko jednorazowy
      efekt przejścia na lepsze czyszczenie — dotyczy wyłącznie starych,
      jeszcze nieodświeżonych wyników; nowe analizy linków od razu dostają
      czysty tekst i nie będą tak "skakać" przy weryfikacji.
    - **POPRAWKA 2026-08-26(n) — reguła pierwszeństwa przy remisie modeli
      mentalnych ("SPÓJNOŚĆ WYBORU MODELU").** Żywy, konkretny dowód
      głębszego problemu (poza wszystkim naprawionym wcześniej w tej
      sesji): właściciel porównał trzy analizy tego samego zdania —
      dokładnie ten sam cytat ("To reakcja na obiektywne trudności
      rynkowe...") dostał RAZ nazwę "Bodziec", RAZ "Wąskie Gardło" — dwa
      różne, ale podobnie trafne modele ekonomiczne dla tego samego
      fragmentu. To dowodzi, że nawet po usunięciu wszystkich znalezionych
      dotąd źródeł RÓŻNIC W TEKŚCIE (CRLF, WIDEO, lista popularnych
      artykułów, zawężanie kategorii) — SAMO rozumowanie modelu AI wciąż
      ma swobodę wyboru między kilkoma równie trafnymi etykietami, i ta
      swoboda jest źródłem niespójności nawet dla IDENTYCZNEGO tekstu.
      Właściciel wprost: skoro nie da się osiągnąc pełnej spójności samą
      "prośbą", to "idźmy w stronę ograniczeń, żeby osiągnąć cel."

      **Naprawa — REGUŁA PIERWSZEŃSTWA, nie kolejna prośba o dokładność**:
      nowa sekcja promptu każe modelowi, przy PRAWDZIWYM remisie (kilka
      modeli pasuje podobnie dobrze), zawsze wybrać ten wymieniony W
      BIBLIOTECE JAKO PIERWSZY — stała, przewidywalna kolejność
      (`MENTAL_MODELS_BY_CATEGORY`) zamiast dowolnego wyboru za każdym
      razem. To mechaniczne ograniczenie pola decyzji modelu, nie kolejny
      apel o "bycie dokładnym" — stąd "ograniczenie", o które prosił
      właściciel. Przy okazji poprawiony też nieaktualny już fragment
      komentarza w BIBLIOTECE MODELI MENTALNYCH (mówił o "wstępnym
      zawężeniu do kategorii", którego już nie ma od POPRAWKI 2026-08-26).

      **POPRAWKA 2026-08-26(n2) — korekta jeszcze tego samego dnia,
      właściciel złapał realną wadę pierwszej wersji.** Pytanie wprost:
      "co w przypadku gdy... w tekście znajdą się treści, które będą
      pasowały do jednego i drugiego, będzie ich więcej — to zawsze
      zostanie wybrany ten pierwszy w kolejności. to bzdura." Słuszne —
      pierwsza wersja reguły pozwalała, żeby czysto ARBITRALNA pozycja w
      bibliotece (nie mająca nic wspólnego z treścią) przebiła model
      faktycznie lepiej wspierany dowodami w tekście. Naprawiono:
      kolejność w bibliotece jest teraz WYŁĄCZNIE "rozjemcą ostatniej
      szansy" (krok 2), NIGDY pierwszym kryterium — krok 1 każe najpierw
      policzyć, który z remisujących modeli ma WIĘCEJ osobnych,
      wyraźnych wystąpień/przykładów w CAŁYM analizowanym tekście (nie
      tylko w jednym spornym cytacie) — to on wygrywa remis, bo
      odzwierciedla to, co faktycznie dominuje w treści, nie przypadkową
      pozycję na liście. Kolejność w bibliotece włącza się tylko przy
      PEŁNYM remisie pod każdym względem (rzadki, skrajny przypadek).

      **Uczciwe zastrzeżenie (nadal aktualne)**: to nadal instrukcja
      tekstowa, nie twarda gwarancja — model może jej nie zastosować
      idealnie za każdym razem, zwłaszcza gdy "remis" jest subiektywną
      oceną samego modelu, a "liczenie dowodów w całym tekście" to wciąż
      osąd modelu, nie mechaniczne liczenie przez nasz kod — może się
      różnić między przebiegami tak samo jak reszta rozumowania. To
      pierwszy, tani krok (zero nowych zapytań do Gemini, zero kosztu) —
      jeśli po obserwacji na żywo nadal będą się zdarzać podobne
      przypadki, kolejnym, droższym krokiem pozostaje "15+1" (patrz wyżej,
      zadania #64/#65), wymagające włączenia płatnego poziomu Google.
    - **POPRAWKA 2026-08-26(m) — naprawa: "Zgłoś niezgodność" dawało błąd
      dla zwykłej analizy linku.** Bezpośredni skutek uboczny POPRAWKI
      2026-08-26(k) (rozszerzenie widoczności przycisku na frontendzie) —
      backend (`report-link-mismatch`) NIE został wtedy zaktualizowany i
      wciąż odrzucał każde zgłoszenie dla wiersza, który nie był
      `is_manual_source`, zwracając `not_reportable` (wyświetlane jako
      ogólny błąd). Naprawa: warunek rozszerzony do `is_manual_source OR
      input_type === 'url'`, dokładnie tak samo jak widoczność przycisku
      na scan.html — backend i frontend znów się zgadzają.
    - **POPRAWKA 2026-08-26(l) — filtr "Najpopularniejsze [portal]" (lista
      niepowiązanych artykułów na końcu strony), rozpoznawany po wzorcu
      dat, nie po klasie HTML.** Największe dotąd znalezione źródło szumu
      w tej sesji: właściciel porównał analizę linku z Business Insider
      (10818 znaków) z ręcznym tekstem TEGO SAMEGO artykułu (5502 znaków)
      — **prawie dwukrotna różnica**. Przyczyna: sekcja "Najpopularniejsze
      w BUSINESS INSIDER" na samym końcu strony — dziesiątki
      niepowiązanych nagłówków, każdy z osobną datą i podpisem autora, bez
      rozpoznawalnej klasy HTML pasującej do `NOISE_CLASS_TOKENS` (portal
      używa własnych, nieprzewidzianych nazw klas). Cała ta lista trafiała
      do analizy jako "treść artykułu", rozwadniając uwagę modelu —
      bezpośrednio tłumaczy, dlaczego link (droższy, bo cena zależy od
      liczby znaków) dawał WYRAŹNIE gorszy wynik (mniej wykrytych wzorców)
      niż ta sama treść bez szumu ("cena za link jest większa a wynik jest
      gorszy" — właściciel).

      **Naprawa — rozpoznanie po WZORCU, nie po klasie** (bo klasa jest z
      definicji różna na każdej stronie): taka lista to zawsze wiele (3+)
      samodzielnych akapitów będących WYŁĄCZNIE datą/znacznikiem czasu
      ("dzisiaj 06:05", "wczoraj 16:06", "poniedziałek 19:11",
      "19.08.2026") — coś, co w prawdziwej prozie artykułu praktycznie się
      nie zdarza (prawdziwa data publikacji na górze artykułu ma inny,
      pełniejszy format, np. "26 sierpnia 2026, 6:14" — nie koliduje z tym
      wzorcem). Znajdujemy NAJWCZEŚNIEJSZY taki akapit i ucinamy WSZYSTKO
      od dwóch akapitów przed nim (żeby złapać też nagłówek tej pierwszej
      pozycji listy) do końca tekstu — ta sekcja zawsze jest na samym
      końcu strony.

      **Zweryfikowane na prawdziwym, pełnym tekście artykułu wklejonym
      przez właściciela** (odtworzonym w Node, z zachowaniem realnej
      tabeli zwolnień podatkowych w środku artykułu): filtr poprawnie
      usuwa całą listę "Najpopularniejsze", NIE rusza tabeli (żadna
      komórka tabeli — "Za 2027 r. i 2028 r." itp. — nie pasuje do wzorca
      daty listy), zostawia tylko nieszkodliwy nagłówek sekcji i krótki
      podpis autora na końcu (kilkadziesiąt znaków, bez wpływu na jakość
      oceny). **Świadome ograniczenie**: wymaga co najmniej 3 takich
      "samotnych" akapitów-dat w tekście, żeby się uruchomić (celowo, dla
      uniknięcia fałszywego trafienia na pojedynczą, prawdziwą datę w
      treści) — strony z inaczej sformatowaną lub krótszą listą
      "polecanych" mogą nadal przeciekać częściowo; do dalszej obserwacji.
    - **POPRAWKA 2026-08-26(k) — trzy przyciski ("Zgłoś niezgodność"/
      "Sprawdź, czy coś się zmieniło"/"Wklej własną treść") rozszerzone
      na KAŻDĄ analizę linku, nie tylko ręcznie wklejoną treść.**
      Dotychczas widoczne WYŁĄCZNIE dla `is_manual_source` (żywy przykład
      — właściciel zrobił zwykłą analizę linku i nie zobaczył żadnego z
      tych przycisków). Sprawdzone: mechanizm liczenia wyświetleń pod
      automatyczne wycofanie (`link_view_confirmations`) już wcześniej
      liczył się jednakowo dla wszystkich trybów, a "Sprawdź, czy coś się
      zmieniło" jest teraz bezpieczne dzięki POPRAWCE 2026-08-26(j)
      (porównanie podobieństwa treści, darmowe gdy strona się nie
      zmieniła) — więc nic architektonicznie nie stało na przeszkodzie,
      żeby to rozszerzyć. Sam komunikat "Ta treść pochodzi z ręcznego
      wklejenia..." (`manual_source_notice`) zostaje TYLKO dla prawdziwie
      ręcznie wklejonej treści (byłby mylący dla zwykłej analizy linku) —
      same przyciski są teraz widoczne dla każdego `input_type === 'url'`
      z prawdziwym `source_url`.
    - **POPRAWKA 2026-08-26(j) — zamknięcie luki "przeklikiwania w nadziei
      na inny wynik" przy "Sprawdź, czy coś się zmieniło" (podobieństwo
      treści, nie dokładny odcisk palca).** Właściciel wprost postawił
      pytanie strategiczne: skoro pojedyncze analizy mogą się (w
      niewielkim stopniu) różnić nawet dla tej samej treści, ktoś mógłby
      próbować budować sobie wizerunek, wielokrotnie klikając "Sprawdź,
      czy coś się zmieniło" (płatne) w nadziei na przypadkowo
      korzystniejszy wynik AI, i publikować tylko ten najlepszy. Rozwiązanie
      strukturalne, nie punktowe: **jeśli świeżo pobrana treść linku jest w
      praktyce IDENTYCZNA z tym, co już mamy zapisane, w ogóle NIE pytamy
      Gemini drugi raz** — oddajemy istniejący wynik od razu, za darmo, bez
      ekranu zgody na koszt. Bez nowego zapytania do AI nie ma nowego "rzutu
      kostką" — każde sprawdzenie niezmienionej strony daje identyczny wynik.

      **Ważna korekta w trakcie projektowania** (właściciel złapał to od
      razu): DOKŁADNE porównanie odcisku palca (sha256Hex) starej i nowej
      treści by nie zadziałało — strony niemal zawsze mają jakiś drobny,
      nieistotny szum zmieniający się przy każdym pobraniu (rotujący
      widżet "podobne artykuły", zegar publikacji "przed chwilą"/"X minut
      temu", inny baner w treści), niezwiązany z rzeczywistą treścią. Przy
      dokładnym dopasowaniu KAŻDE sprawdzenie wyglądałoby jak "zmiana" —
      "Sprawdź, czy coś się zmieniło" nigdy nie byłoby darmowe, a luka
      zostałaby otwarta, tylko przez szum strony zamiast przez świadomą
      edycję. Naprawa: zamiast dokładnego dopasowania — **podobieństwo
      treści** (dzielimy tekst na nakładające się 5-wyrazowe "shingle",
      liczymy współczynnik Jaccarda między starą a nową wersją;
      `SHINGLE_SIMILARITY_THRESHOLD`). Zweryfikowane na prawdziwych,
      dłuższych artykułach z tej sesji: przy progu 0,9 nawet spory,
      prawdziwy dopisany akapit (40 nowych słów) dawał podobieństwo 0,929
      — mylnie przeszedłby próg jako "bez zmian". Podniesiony do **0,96**.
      **Uczciwe zastrzeżenie**: to świadomy próg bez twardych danych z
      produkcji, wybrany tak, żeby błądzić w bezpieczniejszą stronę
      (czasem świeże sprawdzenie będzie płatne mimo bardzo drobnej zmiany
      merytorycznej — lepsze niż odwrotnie, czyli oddanie NIEAKTUALNEGO
      wyniku za prawdziwy) — do dalszej korekty po zaobserwowaniu, jak to
      się sprawdza na żywych stronach.

      **Uboczny efekt biznesowy, świadomie zaakceptowany przez
      właściciela**: dziś "Sprawdź, czy coś się zmieniło" ZAWSZE kosztuje
      kredyty, niezależnie od tego, czy strona faktycznie się zmieniła. Po
      tej poprawce — kosztuje TYLKO gdy realnie coś się zmieniło. To
      mniejszy przychód z tej jednej, wąskiej sytuacji, ale też jedyny
      sposób, żeby naprawa faktycznie zamknęła lukę (a nie tylko
      przestała kosztować NAS, dalej kusząc użytkownika płatnymi próbami).
    - **POPRAWKA 2026-08-26(i) — filtr "WIDEO:" (śródartykułowe zapowiedzi
      niepowiązanego materiału wideo), z zabezpieczeniem dla pierwszego
      akapitu.** Kontynuacja (g)/(f) — właściciel porównał ręczną kopię
      strony (bez linijki "WIDEO: ...") z naszą analizą linku (Z tą
      linijką) na dwóch RÓŻNYCH artykułach z dwóch różnych stron — za
      każdym razem linijka "WIDEO: ..." okazała się kompletnie
      niepowiązaną zapowiedzią innego materiału ("Ślub z krokodylem.
      Marek Suski ostrzega", "Wpisał się w piątą kolumnę ukraińską"),
      zawsze na SAMYM KOŃCU artykułu, tuż przed podpisem autora — nigdy
      prawdziwym tytułem. To bezpośrednio psuło jakość: model oceniał
      fragment tekstu, którego czytelnik kopiujący stronę ręcznie NIGDY
      by nie zobaczył jako część artykułu. Naprawa: "wideo:" dołączone do
      filtrowania akapitów-zapowiedzi (jak "zobacz:"/"czytaj też:"), ale
      TYLKO gdy nie jest PIERWSZYM akapitem całego tekstu — zachowuje to
      ostrożność z (g) (obawa przed usunięciem prawdziwego tytułu
      artykułu O wideo, który zawsze ląduje na początku, nie na końcu).
      Zweryfikowane syntetycznym testem: usuwa "WIDEO:" na końcu tekstu,
      zostawia nietknięte, gdy jest pierwszym akapitem.

      **Szerszy kontekst tej całej rundy poprawek (f)-(i), właściciel
      wprost**: te niespójności bezpośrednio zagrażają planowanej w
      przyszłości funkcji "Global Trust Index" — zbiorczej ocenie jakości
      CAŁYCH domen internetowych, budowanej z wielu pojedynczych analiz
      artykułów. Jeśli pojedyncze analizy tej samej treści potrafią dać
      różne wyniki z powodu drobnego, niezwiązanego z treścią szumu —
      każda zbiorcza metryka zbudowana na ich podstawie dziedziczy ten sam
      brak wiarygodności, tylko w większej skali. Dlatego to dochodzenie
      (server-side content_hash, usunięcie zawężania kategorii, checklist
      kategorii, ujednolicenie CRLF/LF, ujednolicenie promptu link/tekst,
      teraz filtr "WIDEO:") było warte pełnego, dokładnego przeprowadzenia
      teraz, zanim jakakolwiek funkcja zbiorcza zacznie na tym polegać —
      poprawianie fundamentu jest tanie teraz, drogie (i widoczne
      publicznie) po zbudowaniu na nim czegoś większego.
    - **POPRAWKA 2026-08-26(f) — prawdziwa przyczyna niespójności link/tekst:
      różne znaki końca linii (CRLF vs LF).** Kontynuacja długiego śledztwa
      z (a)-(e): mimo naprawy odcisku palca po stronie serwera i usunięcia
      wstępnej kategoryzacji, testy na żywo (kilka różnych artykułów)
      dalej pokazywały RÓŻNĄ liczbę znaków między treścią z linku a tą samą
      treścią wklejoną w trybie "Tekst" — za każdym razem inną liczbę (42,
      51, 61) — co wykluczało zarówno błąd ręcznego kopiowania (dodany i
      później usunięty na żądanie właściciela przycisk "Kopiuj"
      gwarantował dokładną kopię), jak i błąd stałej wielkości. Diagnoza:
      niektóre strony zapisują tekst ze znakami końca linii w stylu
      Windows (CRLF, "\r\n" — dwa znaki zamiast jednego), których nigdy
      nie ujednolicaliśmy przy pobieraniu. Przeglądarka, zgodnie ze
      standardem HTML, SAMA ujednolica "\r\n" do "\n" w polu `<textarea>`
      — więc liczba znaków w trybie "Tekst" wychodziła mniejsza niż to, co
      faktycznie zapisaliśmy dla linku, niezależnie od metody
      przenoszenia tekstu. **Naprawa**: `fetchUrlAsText()` ujednolica
      teraz WSZYSTKIE znaki końca linii do pojedynczego "\n" od razu po
      pobraniu strony, zanim cokolwiek inne zacznie przetwarzać tekst.
      **Potwierdzone na żywo przez właściciela DWUKROTNIE**, na różnych
      artykułach — link → kopiowanie treści źródłowej → wklejenie w
      trybie "Tekst" poprawnie trafia w cache za każdym razem.
    - **POPRAWKA 2026-08-26(g) — link z dowolną wklejoną treścią (nie
      linkiem) w polu adresu dawał "analizę".** Żywy przypadek: właściciel
      przez pomyłkę wkleił zwykły tekst (nie link) w pole adresu w trybie
      "Link" — pole sprawdzało tylko, czy nie jest puste, nigdy czy to
      naprawdę wygląda na link. Po stronie serwera: własne pobranie strony
      (`fetchUrlAsText`) poprawnie zawodzi dla nie-adresu, ale ścieżka
      awaryjna (wbudowane narzędzie Gemini "URL context") dostawała
      polecenie "przeanalizuj treść strony pod adresem: &lt;wklejony
      tekst&gt;" — a Gemini, nie mogąc nic pobrać, czasem po prostu
      analizowało SAM TEN TEKST jak treść strony. Nasze sprawdzenie
      powodzenia pobrania (`retrievalStatus && retrievalStatus !==
      'URL_RETRIEVAL_STATUS_SUCCESS'`) nigdy się nie uruchamiało, bo gdy
      narzędzie w ogóle nie próbowało niczego pobrać, `retrievalStatus`
      było `undefined` — fałszywe w JS, więc "brak informacji o pobraniu"
      mylnie przechodziło jako "sukces". **Naprawa**: dodana walidacja
      formatu linku (musi zaczynać się od `http://` albo `https://`) — i
      w przeglądarce (natychmiastowy komunikat, zanim cokolwiek wyślemy),
      i po stronie serwera (zero zaufania do klienta, ten sam wzorzec co
      wszędzie indziej — odrzucamy PRZED jakąkolwiek próbą pobrania czy
      wydaniem choćby grosza na Gemini). Świadomie NIE zmieniono samego
      sprawdzenia `retrievalStatus` (mogło być celowo "wybaczające" dla
      innych, prawdziwych przypadków brzegowych, bez żywego dowodu na
      to nie ma pewności) — nowa walidacja formatu wystarcza, żeby
      zablokować dokładnie ten zgłoszony scenariusz.
    - **POPRAWKA 2026-08-26(b) — przycisk "Kopiuj" przy pełnym tekście
      źródłowym (scan.html) + potwierdzenie na żywo naprawy A z (a).**
      Pierwszy test naprawy A (odcisk palca liczony przez serwer) na żywo
      NIE zadziałał — właściciel skopiował ręcznie tekst z małego,
      przewijanego panelu "Pokaż pełny tekst źródłowy" i wkleił do trybu
      "Tekst", ale dostał drugą, niezależną (płatną) analizę zamiast trafić
      w cache. Diagnoza: ręczne zaznaczanie myszką w małym, przewijanym
      okienku łatwo (niezauważalnie dla oka) pomija fragment poza widocznym
      obszarem — nawet drobna różnica w białych znakach zmienia odcisk
      palca treści, mimo że na oko tekst wygląda identycznie. Naprawa:
      nowy przycisk "Kopiuj" (`navigator.clipboard.writeText`) kopiuje
      programowo CAŁY `data.text_content` — bez ryzyka ręcznego błędu.
      **Potwierdzone na żywo przez właściciela**: po użyciu przycisku
      "Kopiuj" (zamiast ręcznego zaznaczania) ten sam tekst wklejony w
      trybie "Tekst" poprawnie trafił w cache ("Za darmo — z pamięci",
      licznik wyświetleń wzrósł do 2 na tym samym wierszu) — naprawa A z
      POPRAWKI 2026-08-26 działa poprawnie, problem leżał wyłącznie w
      ręcznym kopiowaniu, nie w logice serwera.
    - **POPRAWKA 2026-08-25(g) — filtrowanie akapitów-zapowiedzi
      "ZOBACZ:"/"Czytaj więcej" w treści linku.** Kontynuacja (f) — te same
      dwa żywe przykłady artykułów pokazały jeszcze jeden rodzaj szumu:
      śródartykułowe akapity-zapowiedzi INNEGO, niepowiązanego materiału
      ("ZOBACZ: 25-letni Białorusin napadnięty w centrum Warszawy" w
      środku zupełnie innego artykułu) oraz samotne etykiety przycisków
      ("Czytaj więcej"/"Czytaj dalej"/"Zobacz więcej") wplecione w tekst.
      Żaden z nich nie ma rozpoznawalnej klasy/id HTML (to zwykłe akapity
      tekstu w środku artykułu, nie osobne elementy z klasą "related"czy
      "teaser"), więc nie dało się ich złapać przez `NOISE_CLASS_TOKENS`
      jak resztę szumu — trzeba je rozpoznać PO TREŚCI, całymi akapitami,
      już po wyciągnięciu czystego tekstu.

      **Naprawa**: nowy krok filtrowania w `fetchUrlAsText()`, PO
      dekodowaniu encji — dzieli tekst na akapity (po `\n\n`, ten sam
      podział, który już zachowujemy dla czytelności) i usuwa akapit
      całkowicie, jeśli: (a) po obcięciu białych znaków i zamianie na
      małe litery dokładnie pasuje do znanej etykiety przycisku
      (`EXACT_NOISE_LINES`: "czytaj więcej", "czytaj dalej", "zobacz
      więcej"), albo (b) zaczyna się od jednego ze znanych prefiksów
      zapowiedzi (`TEASER_LINE_PREFIXES`: "zobacz:", "zobacz też:",
      "czytaj także:", "czytaj też:", "przeczytaj także:", "przeczytaj
      też:", "polecamy:"). Świadomie NIE ma na tej liście "wideo:" — to
      też bywa zapowiedzią niepowiązanego materiału, ale w polskiej
      prasie bywa też prawdziwym, legalnym tytułem artykułu O samym
      wideo (np. "WIDEO: Migracja w politycznej wojence?" jako właściwy
      nagłówek/lead) — ryzyko przypadkowego usunięcia prawdziwej treści
      było zbyt duże, więc ten przypadek świadomie zostawiamy.

      **Uczciwe zastrzeżenie**: to lista rozpoznawanych fraz SPECYFICZNA
      dla języka polskiego — nie pomoże na stronach w innych językach
      (ten sam, już wcześniej nazwany kompromis co reszta heurystyk
      czyszczenia strony). Zweryfikowane syntetycznym testem w Node na
      obu żywych przykładach wklejonych przez właściciela — usuwa
      dokładnie zapowiedź i "Czytaj więcej", zostawia resztę treści (w
      tym akapit zaczynający się od "WIDEO:") bez zmian.
    - **POPRAWKA 2026-08-25(f) — dalsze oczyszczanie linku: dekodowanie
      encji HTML + usuwanie odtwarzaczy wideo/list tagów.** Bezpośrednia
      kontynuacja POPRAWKI 2026-08-25 — właściciel przetestował ten sam
      link na żywo, wkleił pełny "Pokaż pełny tekst źródłowy" z linku i
      dla porównania pełny tekst, jaki dałoby ręczne kopiowanie ze strony.
      Różnica pokazała dwa konkretne, nowe źródła szumu.

      1. **Zniekształcone polskie znaki**: strona miesza NAZWANE encje
         HTML (`&oacute;` = "ó" — standardowy zestaw HTML4/Latin-1, w
         którym NIE MA polskich liter) z NUMERYCZNYMI (`&#322;` = "ł",
         `&#380;` = "ż" — bo tych liter nie ma w Latin-1, więc strona
         musiała użyć zapisu numerycznego). Dekodowaliśmy dotąd tylko
         numeryczne — "niekt&oacute;rym" wychodziło jako dosłowne
         "niektoacuterym". Naprawa: nowa tabela `HTML_NAMED_ENTITIES`
         (najczęstsze akcentowane litery europejskie + typograficzne
         znaki jak myślnik/wielokropek/cudzysłowy) — NIE jest to
         kompletny zestaw wszystkich kilkuset encji HTML, tylko te, na
         które realnie trafiliśmy na żywo; fail-open (nieznana nazwa
         zostaje nietknięta).
      2. **Osadzony odtwarzacz wideo NIEPOWIĄZANEGO tematu** w środku
         artykułu ("WIDEO: ...Miller o decyzji Tuska" — zupełnie inna
         sprawa niż analizowany artykuł) — jego "treść" to zawsze tylko
         techniczny komunikat zastępczy ("Twoja przeglądarka nie wspiera
         odtwarzacza wideo..."), nigdy prawdziwy tekst. `<video>`/
         `<iframe>` (osadzone tweety, mapy, odtwarzacze)/`<noscript>`
         (fallback dla wyłączonego JS) usuwane teraz w całości, bez
         sprawdzania klasy — tak jak `<nav>` — bo te typy tagów z
         DEFINICJI nigdy nie zawierają wartościowej treści artykułu, to
         bezpieczna, ogólna reguła (zero ryzyka fałszywego trafienia).
      3. **Lista tagów/tematów pod artykułem** ("JURATA KAROL NAWROCKI
         MARTA NAWROCKA MŁODZIEŻ POLSKA POMORSKIE PREZYDENT..." — luźne
         słowa kluczowe, nie zdania) — dodane `tag`/`tags`/`keyword`/
         `keywords`/`teaser` do `NOISE_CLASS_TOKENS`.

      **Uczciwe zastrzeżenie, ważne dla oczekiwań na przyszłość**: test
      pokazał też, że nawet po tych poprawkach zostaje DROBNY, szczątkowy
      szum (np. osierocona linijka komunikatu odtwarzacza, gdy sam
      `<video>` już zniknął, ale otaczający go kontener z podpisem nie
      pasował do żadnego rozpoznawanego wzorca klasy) — świadomie NIE
      dodaliśmy tokenu "video"/"embed" do listy szumu, bo ryzykowałoby to
      przypadkowe usunięcie PRAWDZIWEJ treści przy artykułach, które
      SĄ o jakimś wideo (klasa zawierająca słowo "video" nie zawsze
      oznacza czysty szum). **To jest fundamentalne ograniczenie podejścia
      heurystycznego (dopasowanie po nazwach klas), nie błąd do
      "ostatecznego" naprawienia** — każda strona nazywa swoje elementy
      inaczej, więc zawsze będzie jakiś nieprzewidziany przypadek. Cel
      realistyczny: coraz bliżej jakości ręcznego kopiowania, nie 100%
      matematyczna identyczność — stąd też istnieją "Zgłoś niezgodność" i
      "Wklej własną treść" jako świadome, trwałe zabezpieczenia na
      wypadek przypadków, których żadna heurystyka nie złapie.

      Weryfikacja: bez dostępu do żywej strony z tego środowiska (limit
      sieciowy sandboksa – brak dostępu do domen spoza dozwolonej listy),
      więc zweryfikowane na syntetycznym HTML-u wiernie odwzorowującym
      realną strukturę strony (na podstawie tekstów wklejonych przez
      właściciela) — potwierdzone poprawne dekodowanie polskich znaków i
      usunięcie odtwarzacza wideo.
    - **POPRAWKA 2026-08-21(d) — bfcache czyścił formularz ZA PÓŹNO
      (zostawał stary wklejony tekst).** Żywy przykład: po analizie i
      powrocie do menu wklejona wcześniej treść dalej "wisiała" w trybie
      "Tekst" — dokładnie ten sam mechanizm bfcache (przeglądarka
      przywraca "zamrożoną" starą wersję strony przy nawigacji zamiast
      wczytać ją od nowa), który już wcześniej naprawialiśmy dla listy
      publicznych analiz (`window.addEventListener('pageshow', ...)` w
      `index.html`, patrz komentarz w kodzie). Rozszerzony TEN SAM listener
      (nie dodany drugi, osobny) o czyszczenie `#textInput`/`#urlInput`
      oraz reset wybranych obrazów/PDF-a (`selectedImageFiles`,
      `selectedPdfFile` + ponowne wywołanie ich funkcji renderujących) —
      za każdym razem, gdy `event.persisted === true`. Wyłącznie frontend
      (`index.html`).
    - **POPRAWKA 2026-08-21(e) — stały nagłówek marki wszędzie + "gra
      świateł" wpisana w tekst.** Napis "Gakori" i hasło pod nim żyły
      dotąd WYŁĄCZNIE wewnątrz ekranu logowania (`#authCard` w
      `index.html`) — znikały więc od razu po zalogowaniu i nigdy nie
      pojawiały się na koncie/historii/wyniku analizy. Właściciel
      zgłosił to wprost: nagłówek marki ma być zawsze widoczny, na każdej
      stronie, w tym samym miejscu (góra, na środku). Zmiany:
      - Nowy, wspólny blok `<header class="gakori-brand">` (znaczek +
        `<h1 class="gakori-wordmark">` + `<p class="gakori-tagline">`)
        wklejony jako PIERWSZY element `<body>` we WSZYSTKICH 4 plikach
        (`index.html`, `account.html`, `historia.html`, `scan.html`) —
        `body` już ma `display:flex; flex-direction:column;
        align-items:center`, więc nagłówek naturalnie ląduje nad każdą
        kartą, bez żadnego pozycjonowania na sztywno.
      - Usunięty duży, rozmyty kształt w tle (`.gakori-backdrop`, obecny
        dotąd na WSZYSTKICH 4 stronach) — właściciel nie wiedział, po co
        tam jest, i faktycznie stał się zbędny obok stałego nagłówka;
        `body` ma już własną, subtelną poświatę (`background-image:
        radial-gradient(...)`), więc strona się nie spłaszczyła.
      - Nowa klasa `.gakori-shine-text` (CSS `background-clip: text` +
        przezroczysty `color` + lekki `text-shadow`) — "gra świateł" (ten
        sam termin i mechanizm co gradienty na kartach/przyciskach,
        patrz komentarz przy `:root` na górze pliku) wpisana TERAZ też w
        same litery, nie tylko w powierzchnie. Dwa nowe zmienne CSS,
        osobne dla jasnego/ciemnego motywu (`--brand-grad-start/-end`) —
        w ciemnym motywie muszą być JAŚNIEJSZE, inaczej ciemny koniec
        gradientu zlewałby się z prawie czarnym tłem; obie wersje dzielą
        wspólny kolor `#9a9184` jako "kotwicę", żeby marka nadal wyglądała
        rozpoznawalnie tym samym logo w obu motywach.
      - `<h1>` teraz drukowanymi literami (`text-transform: uppercase`),
        większy (2.5rem), z tym samym efektem świateł.
      - Hasło pod logo (`tagline`, wszystkie 10 języków w `i18n.js`)
        zmienione z opisowego "Wklej tekst, a my pokażemy Ci..." na
        krótkie motto "Najważniejszą zasadą przetrwania jest wiedza" —
        też drukowanymi literami, mniejsze, ten sam efekt świateł.
      - Żeby całość była SPÓJNA (nie tylko jeden nagłówek inny niż
        reszta) — WSZYSTKIE nagłówki sekcji (`<h2>`, dotąd zwykły ciemny
        tekst bez wyrównania) dostały ten sam styl: drukowane litery,
        wyśrodkowane, gra świateł. Dotyczy to też "Twoje konto", "Twoje
        analizy PDF" i "Potwierdź analizę", nie tylko nagłówka nad
        wyszukiwarką — świadoma decyzja o rozszerzeniu zakresu poza to, o
        co właściciel pytał wprost, żeby nie było niespójnie.
      - Nagłówek nad przeglądarką publicznych analiz (`public_scans_heading`,
        wszystkie 10 języków) skrócony z "Zobacz, co już wykryliśmy" na
        "Wyszukaj analizę" — lepiej pasuje do paska wyszukiwania pod
        spodem.
      - Wyłącznie frontend (`index.html`, `account.html`, `historia.html`,
        `scan.html`, `style.css`, `i18n.js`) — wdraża się samo przez
        GitHub Pages po pushu do `main`, zero ręcznego kroku w Supabase.
    - **POPRAWKA 2026-08-21(f) — dwie poprawki po pierwszym wdrożeniu (e),
      obie zgłoszone na żywo ze zrzutami ekranu:**
      1. **W jasnym motywie napis "GAKORI"/nagłówki sekcji były praktycznie
         niewidoczne** ("białe na białym") — w ciemnym motywie działało
         dobrze, więc to nie był oczywisty błąd na pierwszy rzut oka.
         Winny: `text-shadow` w `.gakori-shine-text`/`h2` korzystał z
         `--highlight-edge` — zmiennej pomyślanej do jasnej obwódki na
         CIEMNYCH, uniesionych powierzchniach (karty/przyciski), nie do
         tekstu. W jasnym motywie ta zmienna to prawie nieprzezroczysta
         biel (`rgba(255,255,255,0.9)`) — na cienkich literach z gradientem
         to zalewało cały napis bielą (w ciemnym motywie ta sama zmienna ma
         tylko 0.14 przezroczystości, stąd błąd był tam niewidoczny —
         dokładnie dlatego różne wrażenie w obu motywach). Naprawa: usunięty
         `text-shadow` (gradient sam daje wystarczający efekt świateł), a
         `--brand-grad-start`/`--brand-grad-end` przeprojektowane tak, żeby
         OBA krańce z osobna dawały pewny kontrast wobec `--paper` — nie
         polegamy już na tym, że krótki, jednowierszowy napis akurat
         "trafi" w ciemniejszą/jaśniejszą część długiego, ukośnego
         gradientu (poprzednie wartości zakładały płynne przejście od
         jasnego do ciemnego krańca, które przy małej wysokości tekstu
         praktycznie nigdy nie docierało do drugiego krańca).
      2. **Mały znaczek-"kropla" obok napisu "Gakori" to była właśnie ta
         "plamka", o którą właściciel pytał od początku** — pierwsza runda
         (e) usunęła inny element (duże, rozmyte tło `.gakori-backdrop`),
         bo tak zinterpretowałem niejasne "jakaś plamka, nie wiem co to" —
         błędnie, właścicielowi chodziło o ten mały, kroplowaty znaczek.
         Usunięty CAŁKOWICIE ze wszystkich 4 stron — zostaje sam napis
         "Gakori" (gradient tekstowy), bez żadnej ikony obok.
      Wyłącznie frontend (`style.css` + `index.html`/`account.html`/
      `historia.html`/`scan.html`) — wdraża się samo.
    - **POPRAWKA 2026-08-21(g) — mocniejsza "gra świateł" na wyraźną prośbę
      ("światło = prestiż", nawiązanie do wystawiennictwa/rzeźby).**
      Płaski, dwukolorowy gradient tekstu z (f) zamieniony na TRZYPUNKTOWY
      (`--brand-grad-dark` → `--brand-grad-light` w 50% → `--brand-grad-dark`)
      — imituje światło ślizgające się po zaokrąglonej powierzchni litery,
      nie płaskie przejście. Kierunek zmieniony z 160deg na 100deg (bliżej
      poziomu) — przy krótkim, jednowierszowym napisie ukośny/pionowy
      gradient prawie nie sweepuje w poziomie, więc błysk pośrodku by nie
      było widać. Dodany `filter: drop-shadow(0 2px 3px
      var(--shadow-color-soft))` — delikatny, ciemny cień pod literami dla
      wrażenia uniesienia (ta sama zmienna co reszta "Rzeźby", więc
      automatycznie poprawna w obu motywach; `filter`, nie `text-shadow` —
      działa na już wyrenderowanym, przezroczystym kształcie liter, więc
      nie grozi tym samym błędem "zalania bielą" co (f)). Zmienne
      przemianowane z `--brand-grad-start/-end` na bardziej opisowe
      `--brand-grad-dark/-light`. Wyłącznie `style.css`.
    - **POPRAWKA 2026-08-21(h) — "latarnie wzdłuż alejki" w tle całej
      aplikacji.** Właściciel poprosił o rozszerzenie tej samej idei "gra
      świateł = prestiż" na całe UI, konkretnie: symetryczne, ciepłe
      poświaty po OBU bokach strony, powtarzające się w regularnych
      odstępach w pionie — jak lampy uliczne wzdłuż alejki spacerowej, co
      kilka metrów, dające "romantyczny, prestiżowy klimat". Zrobione
      czysto w CSS (`body` w `style.css`), bez żadnych obrazków/plików —
      dwie DODATKOWE warstwy `background-image` (obok istniejącej,
      niezmienionej poświaty u góry strony): `radial-gradient(circle 170px
      at 0% 50%, var(--lamp-glow) 0%, transparent 70%)` przyklejony do
      lewej krawędzi kafelka i lustrzany `at 100% 50%` do prawej, każdy w
      kafelku `100% × 520px` powtarzanym w pionie (`background-repeat:
      repeat-y`) — 520px to odstęp między kolejnymi "latarniami" (jedna
      liczba do przestrojenia w przyszłości, jeśli okaże się za gęsto/za
      rzadko — musi być identyczna w `background-size` dla obu warstw).
      Nowa zmienna `--lamp-glow` (ciepły, złocisty odcień, osobna wartość
      per motyw — w ciemnym motywie mocniejsza, bo ciepłe światło na
      prawie czarnym tle "świeci" dużo dramatyczniej, tak jak prawdziwe
      latarnie najlepiej widać po zmroku). Poświaty przewijają się razem z
      treścią strony (nie `position: fixed`) — na dłuższych stronach
      (np. lista wyników w `scan.html`/`historia.html`) użytkownik
      "mija" kolejne latarnie przy przewijaniu, jak spacer wzdłuż alei.
      Wyłącznie `style.css`.
    - **POPRAWKI 2026-08-21(i)/(j)/(k) — kolejne doszlifowania "latarni" po
      podglądzie na żywo, oraz jedno zabezpieczenie.** Trzy rundy tuningu na
      żywą prośbę właściciela: (i) odstęp 520px→260px, promień 170px→115px,
      intensywność +60%; (j) odstęp 260px→130px + dodany "plateau" pełnej
      intensywności do 20% promienia przed zanikiem (mocniejszy kontrast
      jasnego źródła wobec tego, jak się rozchodzi, BEZ zwiększania
      zasięgu/promienia); (k) odstęp 130px→87px (jeszcze więcej latarni).
      Przy (k) właściciel poprosił wprost o zapewnienie, że boczna poświata
      nigdy nie "rzuca światła" na główny panel (`.card`) — policzone
      geometrycznie: `.card` ma `max-width: 400px`, na węższych ekranach
      (mobile — a to przede wszystkim aplikacja mobilna) karta zajmuje
      prawie całą szerokość, więc margines obok niej jest bliski zera —
      przy promieniu 115px poświata geometrycznie MUSIAŁABY dotykać cienia
      karty, nie da się tego pogodzić z widocznym efektem. Zamiast
      pogarszać efekt na szerokich ekranach, żeby "zmieścić się" też na
      wąskich — dodany JEDYNY `@media (max-width: 700px)` w tym pliku
      (świadomy, punktowy wyjątek od zasady "brak media queries", patrz
      "Zasady współpracy" niżej — próg policzony z geometrii: 400px karta +
      2×20px padding body + 2×115px promień, zaokrąglone w górę), wyłączający
      boczne poświaty (`--lamp-glow: transparent`) poniżej tej szerokości —
      górna poświata i cała reszta UI bez zmian. Wyłącznie `style.css`.
    - **POPRAWKA 2026-08-21(l) — próba "gałązki oliwnej"/nastroju z
      referencyjnego zdjęcia nocnej alejki, i dlaczego z niej zrezygnowano.**
      Właściciel poprosił o rozszerzenie latarni o motyw gałązki oliwnej
      (skojarzenie ze starożytnym Rzymem — zielona w jasnym motywie,
      pozłacana w ciemnym) — na przykładzie zdjęcia oświetlonej nocą
      alejki ogrodowej z krzewami w poświacie latarń. Wypróbowane DWA
      podejścia poza samą aplikacją (osobne pliki HTML do podglądu, żeby
      nie ryzykować wdrożenia czegoś nietrafionego na żywo):
      1. Cztery warianty rysowanej gałązki (SVG, ścieżki bezier imitujące
         liście/łodygę) — odrzucone: na komputerze wyglądało "sztucznie,
         jak naklejka", zbyt sztywne wobec fotograficznego, rozmytego
         charakteru zdjęcia.
      2. Trzy warianty rozmytej, wtopionej w światło plamy koloru
         (`filter: blur` na kilku nakładających się radial-gradientów,
         zielonkawy odcień zamiast osobnego kształtu liścia) — też
         odrzucone: bez konkretnego rysunku/faktury liścia sam rozmyty
         gradient koloru nie oddaje NICZEGO ze zdjęcia, wygląda jak
         bezkształtna plama, nie jak oświetlona roślinność.
      **Wniosek, ustalony wspólnie**: wierne oddanie zdjęcia (faktura
      liści, żyłkowanie, realny cień) wymagałoby prawdziwej ilustracji, nie
      samego CSS — to osobna, poważniejsza robota graficzna, nie kolejny
      dostrojony parametr. Świadomie zarzucone (nie odkładamy na później w
      obecnej formie — jeśli kiedyś wróci, to jako pytanie o prawdziwe
      assety graficzne, nie kolejny gradient). Zamiast tego, z testowanych
      wariantów, spodobał się (bez pretensji do udawania liści) Wariant "1.
      Umiarkowany" — jego jakość światła wykorzystana do wzbogacenia
      ISTNIEJĄCEGO efektu latarni: nowa, DODATKOWA zmienna `--lamp-halo`
      (szeroka, promień 190px, niska intensywność) dodana WOKÓŁ
      dotychczasowego, ostrzejszego rdzenia `--lamp-glow` (promień 115px,
      bez zmian) — rdzeń zostaje na wierzchu (listowany pierwszy w
      `background-image`), otoczka pod spodem. Efekt: pełniejsze, bogatsze
      światło niż wcześniej, ale uczciwie NIE nazywane "liśćmi"/"zielenią".
      Przy okazji podniesiony próg zabezpieczenia z (k) z 700px na 850px —
      szersza otoczka (190px) wymaga więcej marginesu niż sam rdzeń (115px),
      żeby nie dotykać karty na średnich szerokościach ekranu. Wyłącznie
      `style.css`.
    - **POPRAWKA 2026-08-21(m) — nawrót z zagęszczenia: 87px odstępu
      wyglądało jak mechaniczna tapeta, nie jak latarnie.** Żywy zrzut
      ekranu od właściciela: przy odstępie 87px (efekt kolejnych rund
      dogęszczania (i)/(j)/(k)) lewa i prawa poświata tworzyły gęsty,
      idealnie powtarzalny, lustrzanie symetryczny wzór — zgłoszone wprost
      jako "syntetyczno-symetryczne", "sztuczność aż gryzie". Dwie zmiany,
      obie w `body` w `style.css`:
      1. Odstęp (`background-size`, wszystkie 4 warstwy: rdzeń+otoczka ×
         lewo+prawo) podniesiony z 87px na 900px — DUŻO rzadziej niż nawet
         pierwotne 520px z (h), zdecydowanie mniej świateł na stronie.
      2. Prawa strona przesunięta o pół kafelka względem lewej
         (`background-position` prawych warstw: `right 450px` zamiast
         `right top`) — żeby lewa i prawa latarnia NIE stały zawsze
         dokładnie na tej samej wysokości. Sztywne lustro (obie strony w
         idealnym rytmie) samo w sobie już czytało się jako "wyliczony
         wzór", nawet przy rzadszym odstępie — to rozbija ten efekt.
      Próg zabezpieczenia dla wąskich ekranów (850px, patrz (l)) bez
      zmian — dotyczy promienia, nie odstępu, więc pozostaje aktualny.
    - **POPRAWKA 2026-08-21(n) — CAŁKOWITE gaszenie świateł poniżej 850px
      (patrz (k)/(l)) okazało się złym kompromisem: na telefonie (a to
      przede wszystkim aplikacja mobilna) nie było ich widać W OGÓLE,
      zgłoszone wprost.** Twarda geometryczna prawda: na najwęższych
      ekranach margines obok `.card` jest bliski zera niezależnie od
      promienia (karta wypełnia prawie całą dostępną szerokość) — nie da
      się jednocześnie mieć widocznego światła I zerowego kontaktu z jej
      cieniem na takich szerokościach. Zamiast dalej wybierać między
      "widoczne, ale dotyka" a "wcale niewidoczne" — kompromis: `--lamp-radius`/
      `--lamp-halo-radius` wydzielone jako osobne zmienne CSS (domyślnie
      115px/190px, współdzielone przez oba motywy — rozmiar, nie kolor),
      a poniżej 850px szerokości ZMNIEJSZANE (nie gaszone) — z tylko
      niewielkim, zaakceptowanym zachodzeniem na sam CIEŃ karty (nigdy na
      jej właściwą, w pełni nieprzezroczystą powierzchnię). Wyłącznie
      `style.css`.
    - **POPRAWKA 2026-08-21(o) — pierwsza próba z (n) (32px/52px) dalej
      NIEZAUWAŻALNA na żywym telefonie ("nic nie widzę lepiej").** Promienie
      na wąskich ekranach podniesione wprost ponad dwukrotnie, z 32px/52px
      na 70px/120px — świadomie kosztem odrobinę większego zachodzenia na
      cień karty (patrz uzasadnienie w (n): przy realnym braku marginesu na
      najwęższych telefonach nie da się mieć jednocześnie efektu
      widocznego I zerowego kontaktu z cieniem — to jest właśnie ten
      zaakceptowany kompromis, tym razem przesunięty mocniej w stronę
      "widoczne"). Wyłącznie `style.css`.
    - **POPRAWKA 2026-08-21(p) — CAŁKOWITE wycofanie efektu "latarni wzdłuż
      alejki" ((h)-(o)), na żywą, jednoznaczną prośbę po zobaczeniu wersji
      (o) na telefonie: "jak tak ma to wyglądać to już wolę żeby tego nie
      było".** Zapytany wprost, czy usunąć tylko z telefonu czy całkowicie
      — właściciel wybrał CAŁKOWICIE, wszędzie (też na komputerze). `body`
      w `style.css` wrócił do stanu sprzed (h): jedna, niepowtarzająca się
      poświata u góry strony, bez bocznych latarni. Usunięte też wszystkie
      powiązane zmienne (`--lamp-glow`, `--lamp-halo`, `--lamp-radius`,
      `--lamp-halo-radius`) i jedyny `@media` w pliku (był tylko dla tego
      efektu). **Wniosek na przyszłość**: cały ten wątek (h)-(p) to
      pouczający przykład, że dekoracyjny efekt CSS bardzo dobrze wyglądający
      na jednym urządzeniu/rozmiarze ekranu może zupełnie nie działać na
      innym (desktop vs mobile) — przy kolejnych podobnych pomysłach warto
      od razu testować na realnym, docelowym urządzeniu (telefon, skoro to
      "przede wszystkim aplikacja mobilna"), nie tylko na podglądzie na
      komputerze, zanim zainwestuje się wiele rund dostrajania. Wyłącznie
      `style.css`.
    - **POPRAWKA 2026-08-21(q) — brak spójności gry świateł między motywami:
      w jasnym wyraźny "przebieg" światła, w ciemnym napis wyglądał płasko.**
      Żywy zrzut obu motywów obok siebie. Przyczyna: `--brand-grad-dark`/
      `--brand-grad-light` dla trybu ciemnego (`#cabe9c`/`#f2efe7`) były zbyt
      blisko siebie kolorystycznie — obie jasne, mało kontrastu MIĘDZY sobą
      (w przeciwieństwie do jasnego motywu, gdzie `#201e1a` → `#9a9184` to
      duży skok). Podbite analogicznie do jasnego motywu: krańce
      ciemniejsze/bardziej nasycone złoto (`#9a7f4a` — wciąż WYRAŹNIE
      jaśniejsze niż prawie czarny `--paper`, więc nie znikają jak w (f)),
      błysk pośrodku zostaje jasną kremową bielą (`#f7ecc9`) dla mocnego
      kontrastu MIĘDZY krańcami, nie tylko wobec tła. Dotyczy nagłówka
      marki, hasła pod nim i wszystkich nagłówków sekcji (`h2`) naraz —
      współdzielone zmienne. Wyłącznie `style.css`.
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

**`scans`** (współdzielony cache analiz; publiczny odczyt w RLS dla `url`
zawsze i `text` gdy `is_private = false` — **`pdf`/`image` zawsze, i `text`
gdy `is_private = true`, są wyjątkiem, patrz RLS niżej i `scan_access`**):
- `id`, `content_hash` (klucz cache'u treści), `input_type` (`text`/`url`/
  `image`/`pdf`), `language` (text, `NOT NULL DEFAULT 'en'` — **razem z
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
  - `is_manual_source` (boolean, dodane 2026-08-21, punkt 5 audytu
    bezpieczeństwa), `link_last_checked_at` (timestamptz, nullable) —
    patrz "Zaufanie do ręcznie wklejonych linków" wyżej po pełne
    uzasadnienie.
  - `retracted` (boolean, `NOT NULL DEFAULT false`, dodane 2026-08-23,
    punkt B pakietu poprawek) — treść automatycznie wycofana z serwowania
    jako zaufana (procent zgłoszeń niezgodności ≥20% przy ≥50
    wyświetleniach, patrz POPRAWKA 2026-08-23(a) wyżej). Wyklucza wiersz z
    normalnego trafienia w cache i z mechanizmu ratunkowego — sam wiersz
    NIE jest kasowany, dalej widoczny pod swoim linkiem z ostrzeżeniem.
  - `is_private` (boolean, `NOT NULL DEFAULT false`, dodane POPRAWKA
    2026-08-28(g)) — świadomy wybór użytkownika (checkbox w `index.html`,
    tylko przy trybie "text") żeby TĘ KONKRETNĄ analizę tekstu zachować
    prywatną, jak PDF/obraz, zamiast domyślnie publiczną. Dotyczy
    WYŁĄCZNIE `input_type = 'text'` — dla `pdf`/`image`/`url` ta kolumna
    nic nie znaczy (ich prywatność zależy wyłącznie od `input_type`, patrz
    RLS niżej).

**`link_view_confirmations`** (dodane 2026-08-21, punkt 5 audytu
bezpieczeństwa) — ciche potwierdzenia dla treści oznaczonej
`is_manual_source`: `id`, `scan_id` (FK → `scans.id`, `ON DELETE CASCADE`),
`ip_hash` (SHA-256 adresu IP, NIGDY surowy adres), `created_at`.
`UNIQUE (scan_id, ip_hash)` — ta sama osoba wracająca wielokrotnie liczy
się raz. Od 2026-08-23 (punkt B) używane też jako mianownik ("wyświetlenia")
wzoru procentowego automatycznego wycofania — NIE jest już kasowane przy
zgłoszeniu niezgodności (patrz `link_mismatch_reports` niżej i POPRAWKA
2026-08-23(a) wyżej).

**`link_mismatch_reports`** (dodane 2026-08-21, punkt 5 audytu
bezpieczeństwa) — zgłoszenia niezgodności treści ze źródłem: `id`,
`scan_id` (FK → `scans.id`, `ON DELETE CASCADE`), `reporter_user_id` (FK →
`auth.users.id`, `ON DELETE CASCADE`), `created_at`. `UNIQUE (scan_id,
reporter_user_id)` — jedno konto, jedno zgłoszenie na dany wynik.

**`wallet_transactions`**:
- `user_id`, `amount`, `type` (np. `spend`), `related_scan_id`

**`failed_scan_attempts`** (log surowych nieudanych analiz, patrz "Ochrona
cashflow" niżej):
- `id`, `user_id`, `created_at`

**`rate_limit_blocks`** (log nałożonych blokad, patrz "Ochrona cashflow"
niżej):
- `id`, `user_id`, `blocked_until`, `created_at`, `reason` (text, nullable —
  dodane POPRAWKA 2026-08-26(ad), żeby mail alarmowy i historia w tabeli
  pokazywały PRZYCZYNĘ blokady, nie tylko fakt jej nałożenia), `strike_number`
  (integer, nullable — dodane POPRAWKA 2026-08-26(ae), żeby użytkownik ZAWSZE
  widział, na którym jest poziomie eskalacji, w komunikacie o blokadzie)

**`content_reanalysis_attempts`** (dodane POPRAWKA 2026-08-26(ad) — log
"wymuszonych" ponownych analiz TEGO SAMEGO pliku, patrz "Ochrona cashflow"
niżej):
- `id`, `user_id`, `content_hash`, `created_at`

**`scan_access`** (dodane 2026-08-19 — kto ma prawo zobaczyć dany PDF,
patrz "Prywatność PDF-ów" niżej; POPRAWKA 2026-08-28(g) rozszerzyła tę samą
tabelę/mechanizm też na obrazy — zawsze prywatne — i na teksty oznaczone
jako prywatne, `scans.is_private = true`):
- `id`, `scan_id` (FK do `scans.id`, `ON DELETE CASCADE`), `user_id` (FK do
  `auth.users.id`, `ON DELETE CASCADE`), `source_filename` (text, nullable —
  oryginalna nazwa pliku (PDF) albo nazwy plików obrazów połączone
  przecinkiem (obraz), TYLKO etykieta, nie wpływa na cenę/analizę; zawsze
  `null` dla prywatnego tekstu — nie ma tam pojęcia "nazwa pliku",
  `historia.html` pokazuje w zamian krótki fragment treści),
  `created_at`.
- `UNIQUE (scan_id, user_id)` — backend robi `upsert` z `onConflict:
  'scan_id,user_id'`, więc ponowne przesłanie tego samego pliku przez tę
  samą osobę odświeża `source_filename`/`created_at`, nie duplikuje wiersza.

**`edge_function_retries`** (dodane 2026-08-25, POPRAWKA 2026-08-25(c)) —
widoczność częstotliwości cichych automatycznych ponowień po błędzie
platformy (502/503/504), patrz tamtejszy opis: `id`, `created_at`,
`input_type` (text, nullable). RLS: `INSERT` dla wszystkich (anon +
zalogowani), brak publicznej polityki `SELECT` — odczyt wyłącznie przez
`service_role` w `daily-report`.

RLS (rozszerzone POPRAWKĄ 2026-08-28(g), patrz niżej po pełne SQL): `scans`
ma publiczny odczyt dla `input_type = 'url'` (zawsze) oraz `input_type =
'text' AND is_private = false` (domyślne zachowanie tekstu, gdy checkbox
nie jest zaznaczony). Dla `input_type IN ('pdf', 'image')` (zawsze) oraz
`input_type = 'text' AND is_private = true` odczyt ma WYŁĄCZNIE ten, kto ma
odpowiadający wiersz w `scan_access` (`EXISTS (... WHERE scan_id =
scans.id AND user_id = auth.uid())`) — patrz "Prywatność PDF-ów" niżej po
pierwotne uzasadnienie tego mechanizmu (rozszerzone niżej o obraz/tekst).
`scan_access` ma RLS `SELECT` tylko dla `auth.uid() = user_id` (każdy widzi
wyłącznie własne wiersze). Zapis do `scans`/`scan_access`/`profiles`/
`wallet_transactions`/`failed_scan_attempts`/`rate_limit_blocks` idzie przez
`service_role` w Edge Function (backend), nie bezpośrednio z przeglądarki —
**z jednym wyjątkiem**: `profiles.language` jest aktualizowane bezpośrednio
z przeglądarki (`setLanguage()` w `i18n.js`, wywoływane z sesją
zalogowanego użytkownika), więc `profiles` ma regułę RLS pozwalającą
zalogowanemu użytkownikowi na `UPDATE` własnego wiersza (`auth.uid() =
id`), obok istniejącej reguły `SELECT`.

**`system_status`** (dodane 2026-08-21 — patrz "Audyt systemowy — główny
wyłącznik" niżej), JEDEN wiersz (`id = true`):
- `id` (boolean, PK, zawsze `true`), `analyze_enabled` (boolean, domyślnie
  `true`), `disabled_reason` (text, nullable — kto/co wyłączyło: ręcznie
  właściciel, albo która reguła automatyczna), `consecutive_failures`
  (integer — dziś NIEUŻYWANE jako licznik, reguła 6 liczy to zapytaniem do
  `system_incident_log`, kolumna zostawiona na wypadek przyszłej zmiany
  architektury), `updated_at`.

**`system_thresholds`** (dodane 2026-08-21), JEDEN wiersz (`id = true`) —
edytowalne "pokrętła czułości" reguł automatycznych, patrz niżej:
`consecutive_failure_limit`, `error_rate_percent`,
`error_rate_window_minutes`, `error_rate_min_sample`,
`malformed_response_limit`, `malformed_response_window_minutes`,
`single_request_cost_limit_usd` (reguła 8), `daily_budget_usd` (reguła 10,
oba dodane w Etapie 2, **w dolarach, świadomie NIE w złotówkach** — patrz
"Audyt systemowy" niżej).

**`system_daily_spend`** (dodane 2026-08-21, Etap 2) — jeden wiersz na
dzień: `spend_date` (date, PK, **czas polski, Europe/Warsaw** — POPRAWKA
2026-08-21(t), pierwotnie było UTC, poprawione na wyraźną prośbę
właściciela, żeby dzień zaczynał się o północy czasu polskiego, nie
1:00/2:00 w nocy), `total_usd` (numeric) — suma rzeczywistego kosztu Gemini
(wszyscy użytkownicy razem) tego dnia, patrz reguła 10 niżej. Data jako
klucz = licznik resetuje się sam co nowy dzień.

**`system_incident_log`** (dodane 2026-08-21) — log zdarzeń świadczących o
awarii SYSTEMU (nie pojedynczego konta — od tego jest `failed_scan_attempts`,
osobna, niezmieniona tabela): `id`, `created_at`, `reason` (text — jeden z:
`gemini_error`, `url_fetch_failed`, `malformed_response`, `save_failed`),
`user_id` (nullable, tylko do debugowania — kto akurat trafił na awarię, nie
wpływa na logikę reguł).

RLS na wszystkich czterech (`system_status`/`system_thresholds`/
`system_incident_log`/`system_daily_spend`): włączone, ZERO publicznych
polityk (dokładnie jak `rate_limit_blocks`/`failed_scan_attempts`) —
dostęp wyłącznie przez `service_role` w Edge Function.

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

**POPRAWKA 2026-08-26(ad) — rozszerzenie tej ochrony, bezpośrednia reakcja
na nieudany test 90-stronicowego PDF-a i pytanie właściciela "a jakby ktoś
to robił całą noc?".** Trzy zmiany naraz, na wyraźne potwierdzenie:

1. **Próg 15 → 5** nieudanych prób w 10 minut (`RATE_LIMIT_FAILURE_THRESHOLD`)
   — reaguje teraz znacznie szybciej. Reszta mechanizmu (drabinka 10 min →
   30 min → 1,5h → ..., reset po 30 dniach) bez zmian.
2. **Nowy, NIEZALEŻNY powód tej samej blokady**: "ten sam plik analizowany
   zbyt wiele razy" — `SAME_FILE_ATTEMPT_LIMIT = 5` prób w
   `SAME_FILE_ATTEMPT_WINDOW_MINUTES = 60`, liczone per (konto, content_hash)
   w nowej tabeli `content_reanalysis_attempts`, wywoływane wyłącznie w
   momencie realnej, płatnej "wymuszonej ponownej analizy" (`forceRefresh`)
   na już znanym pliku PDF/ręcznie wklejonym — NIE przy zwykłym, darmowym
   odczycie z cache'u. Ważne rozróżnienie ustalone z właścicielem: to NIE
   jest "wyciek pieniędzy" (użytkownik płaci za każdą taką próbę normalnie),
   tylko sygnał zachowania i granica — "raz się pomyli, to się nauczy",
   ale ma być gdzieś widoczne. Dla linków taki scenariusz już wcześniej
   (POPRAWKA (j)) został rozwiązany INACZEJ — powtórka na niezmienionej
   treści jest darmowa i nie woła Gemini — ale ta sztuczka nie działa dla
   PDF-a (tam "wymuszona ponowna analiza" z definicji zawsze dotyczy tego
   samego, niezmiennego pliku).
3. **Obie ścieżki dzielą teraz JEDNĄ, wspólną funkcję**
   `applyEscalatingBlock(reason)` (wydzieloną z dawnego `logFailedAttempt()`)
   — ta sama matematyka czasu trwania kary, ale też **nowe powiadomienie
   mailowe do właściciela przy KAŻDEJ nałożonej blokadzie** (dotąd blokady
   działy się całkowicie po cichu, widoczne tylko ręcznie w Supabase Table
   Editor). Mail zawiera: powód, e-mail i ID konta (przez
   `supabase.auth.admin.getUserById`, fail-open jeśli się nie uda), do kiedy
   trwa blokada (czas polski), oraz którą to blokadę z rzędu w ostatnich 30
   dniach dostało to konto — plus wskazówkę, gdzie ręcznie znaleźć pełny
   rejestr prób (`failed_scan_attempts`/`content_reanalysis_attempts`).

   **Wymagana zmiana w bazie (SQL do samodzielnego uruchomienia w Supabase
   SQL Editor)**:
   ```sql
   alter table rate_limit_blocks add column if not exists reason text;

   create table if not exists content_reanalysis_attempts (
     id bigint generated by default as identity primary key,
     user_id uuid not null references auth.users(id) on delete cascade,
     content_hash text not null,
     created_at timestamptz not null default now()
   );
   create index if not exists content_reanalysis_attempts_user_hash_idx
     on content_reanalysis_attempts (user_id, content_hash, created_at);

   alter table content_reanalysis_attempts enable row level security;
   -- Brak publicznych polityk (dokładnie jak failed_scan_attempts/
   -- rate_limit_blocks) — zapis/odczyt wyłącznie przez service_role
   -- w Edge Function.
   ```

   Weryfikacja: `node --experimental-strip-types --check` (poprawna
   składnia) oraz `tsc --noEmit --skipLibCheck` (brak nowych błędów typów —
   te same dwa przedawnione, niezwiązane z tą zmianą, co wcześniej).

**POPRAWKA 2026-08-26(ae) — kara finansowa dla "powracających" kont +
widoczność poziomu blokady dla użytkownika.** Rozmowa zaczęła się od
pomysłu właściciela: naliczać koszt za same nieudane próby (nawet od 3.
z rzędu). Zwróciłem uwagę na realne ryzyko: NIE potrafimy dziś odróżnić
"celowego nadużycia" od "trafił na nasz błąd" (żywy przykład z tego
samego dnia: 69-stronicowy PDF zawodzi 3 razy z rzędu z NASZEJ winy —
limit procesora, nie zachowanie użytkownika). Uzgodniony kompromis:
**pierwsza blokada konta zawsze zostaje CAŁKOWICIE darmowa** (tylko
czasowa, jak w POPRAWKA (ad)) — dopiero jeśli konto JUŻ MA za sobą
choć jedną blokadę w ostatnich `RATE_LIMIT_STRIKE_RESET_DAYS` (30) dniach,
KAŻDA kolejna nieudana próba (nie tylko ta, która wywoła następną
blokadę) kosztuje **połowę stawki**, jaką ta próba by kosztowała, gdyby
się udała (ta sama funkcja wyceny co reszta systemu, zaokrąglone w górę).
Świadomie zaakceptowane ryzyko szczątkowe: dopóki błąd 69-stronicowego
PDF-a nie zostanie naprawiony, ktoś kto wróci i trafi na TEN SAM błąd
systemu drugi raz, wejdzie już w płatny poziom mimo braku winy — dlatego
naprawa tego błędu (patrz "Do zrobienia") jest tym pilniejsza.

Implementacja (`analyze/index.ts`, funkcja `logFailedAttempt()`): przed
sprawdzeniem progu nowej blokady, sprawdzamy czy konto ma jakąkolwiek
wcześniejszą blokadę w oknie resetu — jeśli tak, liczymy
`Math.ceil(cost / 2)` i **obcinamy do faktycznego salda konta**
(`Math.min(halfCost, profile.wallet_balance)`) — NIGDY nie tworzymy
salda ujemnego, bo to niesłusznie uruchomiłoby główny wyłącznik awaryjny
(Reguła 3) dla WSZYSTKICH użytkowników z powodu jednego konta. Naliczenie
idzie przez ISTNIEJĄCĄ, już zweryfikowaną `chargeCredits()` (typ
transakcji `failed_attempt_penalty`) — żadnej nowej, niezależnej ścieżki
zmiany salda, żeby nie tworzyć nowej klasy błędu księgowego.

**Widoczność poziomu blokady**: `rate_limit_blocks` ma teraz kolumnę
`strike_number`, zapisywaną wprost przy tworzeniu blokady (w
`applyEscalatingBlock()`) — komunikat `too_many_failed_attempts` (i mail
do właściciela) zawsze pokazuje, którym to jest poziomem z rzędu.
Frontend (`index.html`, `scan.html`) i wszystkie 10 języków w `i18n.js`
(`err_too_many_failed_attempts`) zaktualizowane o `{tier}`.

**Wymagana zmiana w bazie** (dodatkowa do tej z POPRAWKI (ad) — jeśli
jeszcze nie uruchomiona, wykonaj obie naraz, SQL PRZED wklejeniem kodu):
```sql
alter table rate_limit_blocks add column if not exists strike_number integer;
```

Weryfikacja: `node --experimental-strip-types --check` oraz
`tsc --noEmit --skipLibCheck` (bez nowych błędów typów).

**POPRAWKA 2026-08-26(af) — trzy rzeczy naraz: próg ogólnych błędów
podniesiony do 10 ("to przecież MVP"), zwolnienie konta właściciela z
całej ochrony przed nadużyciem, i panel konta pokazujący status
blokady.**

1. `RATE_LIMIT_FAILURE_THRESHOLD`: 5 → 10 (okno 10 minut bez zmian).
   `SAME_FILE_ATTEMPT_LIMIT` (5 prób/godzinę) — bez zmian, właściciel
   wprost potwierdził zostawienie tej wartości.
2. **Zwolnienie właściciela** (`profiles.is_admin`, nowa kolumna) — konto
   z `is_admin = true` całkowicie pomija sprawdzenie aktywnej blokady (2b),
   `logFailedAttempt()` i `logReanalysisAttempt()` (obie funkcje kończą się
   natychmiast, `isExemptFromRateLimits`). Rozliczenie kredytów za UDANE
   analizy działa bez zmian — zwolnienie dotyczy WYŁĄCZNIE mechanizmów
   ochrony przed nadużyciem, bo te istnieją, żeby chronić budżet przed
   OBCYMI kontami, nie żeby utrudniać właścicielowi testowanie własnego
   systemu (bezpośredni powód: test 69-stronicowego PDF-a wpadał we
   własne zabezpieczenia).
3. **Panel konta** (`account.html`) — nowa sekcja `#blockStatusBox`,
   widoczna WYŁĄCZNIE gdy konto ma aktywną blokadę: poziom (`strike_number`)
   i żywo odliczający czas do końca (ta sama logika co komunikat błędu
   przy próbie analizy). Czyta bezpośrednio z `rate_limit_blocks` przez
   Supabase JS (RLS, nie przez Edge Function) — stąd nowa polityka RLS
   niżej. Nowe funkcje `renderBlockStatus()`/`formatCountdownShared()` w
   `i18n.js` (współdzielone, żeby nie duplikować trzeciej kopii tej samej
   logiki odliczania po `index.html`/`scan.html`). Nowe klucze i18n
   `account_block_status_title`/`account_block_status_text`, wszystkie 10
   języków.

   **Wymagana zmiana w bazie**:
   ```sql
   alter table profiles add column if not exists is_admin boolean not null default false;

   create policy "users can view own rate limit blocks"
     on rate_limit_blocks for select
     using (auth.uid() = user_id);

   update profiles set is_admin = true
     where id = '427043e8-5f56-4bcf-ac97-863a13006abd';
   ```
   (ID konta właściciela podane wprost przez niego w rozmowie — konto z
   1640 kredytami w zrzucie ekranu `profiles`, jedyne wyraźnie różniące
   się od reszty kont testowych z 20 kredytami.) Jeśli polityka RLS już
   istnieje z poprzedniego uruchomienia, drugie uruchomienie da błąd
   "already exists" — to nieszkodliwe, oznacza że już działa.

**POPRAWKA 2026-08-26(ag) — PRAWDZIWA przyczyna nieudanych analiz długich
PDF-ów znaleziona: limit Gemini 15 zapytań/minutę (RPM), nie limit czasu
procesora.** Właściciel zgłosił, że 69- i 90-stronicowe PDF-y (poniżej
limitu 80 stron) regularnie zawodzą. Wcześniejsza hipoteza (limit 2s
czasu procesora Supabase, patrz POPRAWKA (z)/(ab)) została odłożona po
tym, jak właściciel sam znalazł w panelu Google AI Studio: model
`gemini-3.5-flash-lite` ma limit **15 zapytań NA MINUTĘ** dla całego
projektu/klucza API, a szczyt wykorzystania w tym miesiącu JUŻ go
przekroczył (17/15).

Potwierdzone w kodzie: hierarchia PDF-a wysyłała dotąd WSZYSTKIE swoje
zapytania dla danego etapu naraz przez `Promise.all()` — Etap 1
(`chunkResults`) dla 69 stron to 18 równoległych zapytań w ciągu kilku
sekund (dla maksymalnego dopuszczalnego 80-stronicowego pliku — 20).
Etap 1 jest CELOWO "wszystko albo nic" — jeden kawałek odrzucony przez
Gemini (błąd rate limitu) wywala CAŁĄ analizę. To dobrze tłumaczy
deterministyczne, powtarzalne awarie na dłuższych plikach. Osobny agent
Explore potwierdził, że to jedyne dwa miejsca w pliku z takim ryzykiem —
analiza obrazów (`MAX_IMAGES_PER_SCAN = 6`) zostaje bezpiecznie poniżej
limitu nawet wysyłana naraz.

**Naprawa**: nowa funkcja `runWithRateLimit()` (zaraz po `callGemini()`)
— zamiast `Promise.all()`, każdy element listy startuje z góry
wyliczonym opóźnieniem `i * minStartIntervalMs` względem początku
wywołania. Świadomie NIE przez zwykłe ograniczenie współbieżności
(`maxConcurrent`) połączone ze współdzieloną zmienną "czas ostatniego
startu" — pierwsza taka wersja miała realny wyścig (sprawdzone w
Node.js PRZED wpisaniem do pliku: kilku równoległych "workerów"
odczytywało tę samą, jeszcze nieaktualną wartość i mimo to ruszało w tej
samej chwili — 3 requesty co 6s zamiast jednego). Finalna wersja (każdy
start ma z góry, niezależnie wyliczone opóźnienie, bez współdzielonego
stanu) przetestowana w Node.js na symulacji 18 elementów: potwierdzone,
że nigdy nie ma więcej niż `60000/minStartIntervalMs` startów w żadnym
60-sekundowym oknie, i że kolejność wyników odpowiada kolejności wejścia.

Nowa stała `PDF_GEMINI_MIN_START_INTERVAL_MS = 6000` (6s → maks. 10
startów/minutę Z TEJ JEDNEJ analizy, świadomie poniżej limitu 15, z
zapasem dla innych, równoległych użytkowników systemu w tym samym
czasie — RPM jest wspólny dla całego projektu, nie osobny na request).
Podmienione oba wywołania: `chunkResults` (Etap 1) i `level1Results`
(Poziom 1) — reszta logiki (integralność D13, scalanie, fail-closed dla
Etapu 1/fail-open dla Poziomu 1) bez zmian, `runWithRateLimit()` jest
bezpośrednim zamiennikiem `Promise.all()`.

**Konsekwencja dla użytkownika**: długie PDF-y analizują się teraz
zauważalnie dłużej (dla 69 stron orientacyjnie +1,5-2 minuty łącznego
czasu oczekiwania) — cena, jakość wyniku i reszta mechanizmu bez zmian.

**Zastrzeżenie właściciela, zapisane na przyszłość**: gdy przejdzie na
wyższy, płatny tier Google AI (wyższy limit RPM), wróci do tematu —
wystarczy wtedy podnieść (albo obniżyć bliżej zera) samą stałą
`PDF_GEMINI_MIN_START_INTERVAL_MS`, żadna inna zmiana w kodzie nie jest
potrzebna.

Weryfikacja: `node --experimental-strip-types --check` (poprawna
składnia) oraz `tsc --noEmit --skipLibCheck` (te same dwa przedawnione
błędy typów co wcześniej, niezwiązane z tą zmianą). Pełny test na żywo —
na TYM SAMYM 69-stronicowym pliku, który dotąd zawodził — pozostaje po
stronie właściciela (repo nie ma lokalnego środowiska Supabase CLI).

**POPRAWKA 2026-08-26(ah) — WYCOFANIE (ag): zamiast rozkładać zapytania w
czasie, obniżony limit stron PDF-a tak, żeby zmieściły się pod limitem
RPM WSZYSTKIE NARAZ.** Po teście POPRAWKI (ag) (69-stronicowy PDF trafił
na inny, osobny problem — "nie znaleziono analizy" mimo braku odjętych
kredytów, patrz niżej — źródło tego drugiego problemu NIE zostało
znalezione w tej sesji, wymaga dalszego śledztwa) właściciel zaproponował
prostszą alternatywę: zamiast czekać między zapytaniami (wolniej, ale
duży limit stron), po prostu obniżyć limit stron na tyle, żeby SUMA
zapytań Etapu 1 + Poziomu 1 wysłana NARAZ (jak przed POPRAWKĄ (ag))
zawsze mieściła się wyraźnie pod limitem 15 RPM — szybciej, kosztem
maksymalnego rozmiaru obsługiwanego PDF-a. Właściciel wybrał zapas 3
zapytań (12 zamiast maks. 15) — co odpowiada **36 stronom**
(`ceil(36/4)=9` zapytań Etapu 1 + `ceil(36/16)=3` zapytania Poziomu 1 =
12).

Zmiany: `PDF_HARD_MAX_PAGES` 80 → 36. Funkcja `runWithRateLimit()` i
stała `PDF_GEMINI_MIN_START_INTERVAL_MS` z POPRAWKI (ag) — CAŁKOWICIE
usunięte (nieużywany kod) — oba wywołania (`chunkResults`,
`level1Results`) wróciły do zwykłego `Promise.all()`, dokładnie jak
przed POPRAWKĄ (ag). Zaktualizowany też napis w panelu PDF (`index.html`
+ wszystkie 10 języków w `i18n.js`) — "(maksymalnie 36 stron)".

**Świadomie zaakceptowany kompromis**: maksymalny rozmiar obsługiwanego
PDF-a spadł z 80 do 36 stron — to celowa decyzja właściciela na etapie
testowania MVP, priorytetem jest szybkość i pewność działania nad
rozmiarem pliku. Właściciel zastrzegł, że gdy w przyszłości przejdzie na
wyższy, płatny tier Google AI (wyższy limit RPM) — wróci do tematu i
prawdopodobnie podniesie ten limit z powrotem.

**Nierozwiązany, osobny problem, zgłoszony przy tej samej okazji**:
podczas testowania POPRAWKI (ag) na 69-stronicowym pliku, po ~4 minutach
oczekiwania, właściciel trafił na komunikat "Nie znaleziono takiej
analizy" (scan.html) — ale kredyty NIE zostały odjęte, i nie znaleziono
odpowiadającego wiersza w tabeli `scans` o pasującym czasie. To wyklucza
zarówno "udana płatna analiza z niedziałającym przyznaniem dostępu", jak
i "trafienie w cache z tym samym problemem" — obie teorie sprawdzone i
odrzucone w tej sesji. Nie ustalono, czy to był stary link z wcześniejszej,
faktycznie nieudanej próby (co byłoby oczekiwanym zachowaniem, nie
błędem), czy coś innego — **wymaga potwierdzenia przy następnym teście**
(czy komunikat "nie znaleziono" pojawia się BEZPOŚREDNIO po świeżym
kliknięciu "Analizuj", czy dotyczy starej karty/linku).

## Funkcja daily-changelog-report — dodane 2026-08-27

Nowa Edge Function, trzecia w rodzinie "raportów mailowych" (obok
`daily-report` i `weekly-model-report`). Wysyła RAZ DZIENNIE, rano, mail
z podsumowaniem zmian wprowadzonych w Gakori POPRZEDNIEGO DNIA — w
trzech kategoriach: "Naprawy", "Nowe funkcje", "Ustalenia" (format
wyraźnie potwierdzony i wybrany przez właściciela). **Wysyła się TYLKO
w dni, gdy faktycznie coś się zmieniło** — cisza w spokojne dni, na
wyraźną prośbę właściciela ("nie ma po co spalać pieniędzy").

**Skąd bierze treść**: NIE z surowego `git diff` całego repozytorium
(za dużo szumu technicznego, trudne do streszczenia) — tylko z fragmentów
DOPISANYCH w ostatnich 24h do `GAKORI_CONTEXT.md` (ten sam plik, w którym
piszę te słowa — po każdej wdrożonej zmianie dopisuję tu ludzki, opisowy
wpis "POPRAWKA [data]([litera])"). Funkcja pyta GitHub API o commity
dotykające tego pliku na branchu `main` w ostatnich 24h, dla każdego bierze
"patch" (diff) i wyciąga WYŁĄCZNIE dopisane linie (prefiks `+` w diffie).
Świadomie przez PRAWDZIWE znaczniki czasu commitów, NIE przez parsowanie
dat wpisanych ręcznie w tekście (POPRAWKA "2026-08-26" itd.) — te mogłyby
się pomylić albo nie zostać zaktualizowane, prawdziwy czas commita nigdy
nie kłamie.

Zebrany tekst leci do Gemini (ten sam model co reszta systemu,
`gemini-3.5-flash-lite`, wymuszona struktura JSON przez `responseSchema`)
z prośbą o posortowanie na 3 kategorie i streszczenie KAŻDEGO punktu w
jednym, prostym zdaniu bez żargonu — dokładnie tak, jak ja tłumaczę
zmiany właścicielowi w rozmowie. Jeśli commitów nie ma, albo Gemini uzna,
że nic z wczorajszych wpisów nie jest warte pokazania (np. same
techniczne poprawki nazw zmiennych) — mail się NIE wysyła.

**Wymagany NOWY sekret** (oprócz tych już istniejących dla
daily-report/weekly-model-report): `GITHUB_TOKEN` — Personal Access Token
z uprawnieniem TYLKO do odczytu zawartości repozytorium `areq93/Gakori`
(Fine-grained token, "Contents: Read-only", zakres ograniczony do TEGO
JEDNEGO repozytorium — właściciel generuje go sam na github.com, nigdy
nie jest wpisywany na stałe w kod). Reużywa: `CRON_REPORT_SECRET`,
`REPORT_RECIPIENT_EMAIL`, `GEMINI_API_KEY`, `BREVO_API_KEY`,
`BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`. Ma WYŁĄCZONĄ weryfikację JWT
(Edge Functions → daily-changelog-report → Settings → "Verify JWT with
legacy secret" → OFF), sama sprawdza `x-cron-secret` — dokładnie jak
siostrzane funkcje raportowe.

Harmonogram (Supabase SQL Editor, ten sam mechanizm co pozostałe raporty
— `pg_cron` + `pg_net`):
```sql
select cron.schedule(
  'gakori-daily-changelog-report',
  '0 9 * * *', -- 9:00 UTC = 11:00 w Polsce latem / 10:00 zimą
  $$
  select net.http_post(
    url := 'https://daulljwdoerclborpctb.supabase.co/functions/v1/daily-changelog-report',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<TU_WKLEJ_CRON_REPORT_SECRET>'),
    body := '{}'::jsonb
  );
  $$
);
```
(Ten sam sekret `CRON_REPORT_SECRET`, którego już używają
`daily-report`/`weekly-model-report` — nie trzeba nowego.)

**POPRAWKA 2026-08-27(druga) — `daily-report` przesunięty na rano +
100% dokładne liczenie "wczoraj" (pełna doba polska).** Właściciel
zauważył, że `daily-report` (statystyki: rejestracje, analizy, kredyty,
koszt AI...) leciał o 14:00 UTC = 16:00 w Polsce, nie rano jak nowy
`daily-changelog-report` — i słusznie zauważył, że skoro oba maile mają
teraz przychodzić rano, ten drugi powinien też opisywać PEŁNĄ,
WCZORAJSZĄ dobę polską (00:00-24:00 Europe/Warsaw), a nie "ostatnie 24h
liczone od momentu uruchomienia" (dawne `since(24)`/`dayKey()` na
surowym UTC — dawało inne okno w zależności od godziny uruchomienia).

Zmiany w `daily-report/index.ts`:
- Nowe funkcje `warsawMidnightUtcIso()`/`warsawDateStr()`/
  `warsawYesterdayRange()` — liczą DOKŁADNE granice wczorajszej doby
  polskiej jako instanty UTC, sprawdzając rzeczywiste przesunięcie strefy
  czasowej (`Intl.DateTimeFormat` z `timeZoneName: 'shortOffset'`) W
  POŁUDNIE danego dnia (bezpieczny punkt sondujący, z dala od zmiany
  czasu, która zawsze zdarza się nad ranem) — poprawnie obsługuje zarówno
  UTC+1 (zima), jak i UTC+2 (lato), bez twardo wpisanej stałej.
- WSZYSTKIE zapytania liczące "ostatnie 24h" (analizy, kredyty, zgłoszenia
  niezgodności, niedostarczone maile, ponowienia po błędzie platformy)
  zamienione z `since(24)` na dokładny zakres `.gte(yr.start).lt(yr.end)`.
- Rejestracje: grupowanie po DACIE WARSZAWSKIEJ każdego konta (nie
  surowym UTC) — dotyczy też 7-dniowej średniej porównawczej, żeby
  liczyła się z tym samym rodzajem doby.
- Realny koszt AI (`system_daily_spend`) i statystyki Brevo: kluczowane
  teraz datą WCZORAJSZĄ (`yr.dateStr`), nie dzisiejszą. Świadome
  zastrzeżenie: Brevo liczy swoje własne statystyki dobowe wg WŁASNEJ
  strefy czasowej konta, nie naszej — to jedyne miejsce w tym pliku, gdzie
  100% precyzji nie zależy tylko od nas.
- Cała treść maila zmieniona z "dziś"/"dzisiaj" na "wczoraj" (etykiety,
  nagłówek, temat) — data w mailu to teraz zawsze data WCZORAJSZA, nie
  dzisiejsza (mail przychodzi rano, ale opisuje poprzednią dobę).
- Zmienne przemianowane dla jasności: `newToday`→`newYesterday`,
  `scansToday`→`scansYesterday`, `creditsSpentToday`→`creditsSpentYesterday`,
  `aiCostTodayUsd`→`aiCostYesterdayUsd`, `emailsSentToday`→`emailsSentYesterday`.
  Stare funkcje `since()`/`dayKey()` (na surowym UTC) usunięte —
  zastąpione w 100% przez `warsawYesterdayRange()`.

**Harmonogram** — zadanie `gakori-daily-report` (jobid 9) przestawione z
`0 14 * * *` na `0 9 * * *` (to samo co `daily-changelog-report`):
```sql
select cron.alter_job(job_id := 9, schedule := '0 9 * * *');
```

Weryfikacja: `tsc --noEmit --skipLibCheck` — brak błędów. `node
--experimental-strip-types --check` — brak błędów (ten plik ma import na
górze, więc nie dotyczy go usterka node opisana przy POPRAWCE (ah) dla
pliku bez importów).

**POPRAWKA 2026-08-27(trzecia) — ta sama precyzja dla
`daily-changelog-report`, dla spójności.** Właściciel poprosił o dokładnie
tę samą poprawkę co przy `daily-report` wyżej — funkcja liczyła dotąd
"ostatnie 24h licząc od momentu uruchomienia" (`since = Date.now() - 24h`)
zamiast pełnej wczorajszej doby polskiej. Dopisane te same funkcje
`warsawMidnightUtcIso()`/`warsawDateStr()`/`warsawYesterdayRange()`
(świadomy duplikat z `daily-report/index.ts` — każda Edge Function w tym
projekcie jest wdrażana niezależnie, nie dzielą wspólnych plików).
Zapytanie do GitHub API o commity dostało teraz oba parametry —
`since=${yr.start}&until=${yr.end}` (wcześniej tylko `since`, bez górnej
granicy) — dokładnie wyznaczając wczorajszą dobę. Data w treści/temacie
maila (`dateStr`) też poprawiona — wcześniej pokazywała DZISIEJSZĄ datę
mimo tekstu "wczoraj" (drobna niespójność, teraz naprawiona razem z resztą).

Weryfikacja: `tsc --noEmit --skipLibCheck` — brak błędów.

**POPRAWKA 2026-08-27(czwarta) — naprawa pustego podsumowania PDF-a
(punkt 1 z listy "opanujmy 1,2,3").** Właściciel zgłosił żywy przypadek:
PDF z poprawnie wykrytymi wzorcami (test 26-stronicowego dokumentu z
prawdziwymi rozdziałami — pierwszy udany test po naprawie limitu RPM,
POPRAWKA (ag)/(ah)) dostał całkowicie PUSTE pole "Podsumowanie".
Zlokalizowane: `composePdfSummary()` nie miała ŻADNEGO mechanizmu
awaryjnego — jedno nieudane/puste zapytanie do Gemini kończyło się
cichym `return ''`, bez ponowienia, bez zapisu do dziennika zdarzeń,
mimo że reszta analizy (wzorce, cytaty) i tak dochodziła do skutku
normalnie — stąd kompletny wynik z pustym tylko tym jednym polem.
Uczciwie przyznane właścicielowi: NIE MA pewności, co dokładnie zawiodło
przy tej jednej próbie (brak było jakiegokolwiek śladu w logach) — dwie
prawdopodobne przyczyny to (1) to zapytanie leci jako OSTATNIE w całej
analizie PDF-a, więc mogło akurat przebić współdzielony limit 15
RPM Gemini, jeśli w tym samym momencie działo się coś jeszcze w
systemie, albo (2) zwykła, jednorazowa "czkawka" zewnętrznego API.

**Naprawa**: `composePdfSummary()` próbuje teraz DWA razy (pętla,
ponowienie tylko gdy pierwsza odpowiedź jest pusta/nieudana) — koszt
pomijalny (to bardzo tanie zapytanie: krótka lista nazw wzorców + prośba
o dwa zdania, rzędu $0,0004 za próbę, czyli maks. ok. $0,0008 nawet z
ponowieniem — właściciel świadomie zaakceptował ten koszt po
przedstawieniu dokładnej liczby). Jeśli MIMO ponowienia wynik dalej jest
pusty — miejsce wywołania (`Deno.serve`) zapisuje to jako nowy typ
zdarzenia systemowego, `logSystemIncident('pdf_summary_empty')` —
świadomie NIE wywala całej analizy z tego powodu (wzorce są ważniejsze
niż dwuzdaniowy opis, użytkownik i tak dostaje kompletny, użyteczny
wynik) — tylko daje wreszcie WIDOCZNOŚĆ, jeśli to się powtórzy, zamiast
znikać bez śladu jak dotąd.

Weryfikacja: `tsc --noEmit --skipLibCheck` (te same dwa przedawnione
błędy typów co wcześniej, niezwiązane z tą zmianą) oraz `node
--experimental-strip-types --check` — brak błędów.

**POPRAWKA 2026-08-27(piąta) — punkt 2 z listy "opanujmy 1,2,3": grupowanie
kart wzorców PDF po rozdziałach (z prawdziwymi tytułami) + wzbogacone
podsumowanie o 2-3 świeże, całościowe sugerowane działania.** Właściciel,
patrząc na żywy test 26-stronicowego PDF-a z rozdziałami, poprosił o dwie
rzeczy: (1) żeby karty wykrytych wzorców były wizualnie pogrupowane pod
prawdziwymi tytułami rozdziałów z pliku, przy czym TEN SAM wzorzec w
RÓŻNYCH rozdziałach ma zostać pokazany OSOBNO (nie łączyć się w jedną
kartę — grupowanie "×N" w obrębie jednego rozdziału zostaje bez zmian);
(2) żeby jedyne, dotychczasowe podsumowanie całości dostało dodatkowo 2-3
NOWE, całościowo zsyntetyzowane sugerowane działania — WYRAŹNIE NIE kopię
pojedynczych porad "tip" z kart wzorców (te są już widoczne osobno przy
każdej karcie), tylko wniosek widoczny dopiero patrząc na całą analizę
razem. Właściciel świadomie ODŁOŻYŁ osobne PISANE podsumowania dla
każdego rozdziału (nowe zapytanie do Gemini na rozdział) do momentu
przejścia na wyższy płatny tier Google AI — to by ponownie zbliżyło
system do limitu 15 RPM, który właśnie naprawiliśmy (POPRAWKA (ag)/(ah))
— **do przypomnienia właścicielowi, gdy zgłosi zmianę tieru**.

**Zero nowych zapytań do Gemini w tej poprawce** — obie części
wykorzystują dane, które system i tak już zbierał:

1. **Rozdziały** (`analyze/index.ts`): `analyzePdfChunk()` już zwracał
   `chapterStarts: Array<{page, title}>` per kawałek Etapu 1 (POPRAWKA
   2026-08-26(z)), ale dotychczasowy `aggregatedChapterStarts` (wejście
   dla `buildLevel1Groups()`) DYSKARDOWAŁ tytuły, zostawiając same numery
   stron. Dopisana mapa `chapterTitleByPage` (strona → pierwszy niepusty
   tytuł zgłoszony dla tej strony) oraz — PO `buildLevel1Groups()` —
   grupowanie istniejących `level1Groups` po polu `chapter` (min. `start`
   / maks. `end` dla każdego numeru rozdziału), z dołączonym tytułem z
   `chapterTitleByPage`. Wynik trafia do NOWEGO pola `result.chapters:
   Array<{chapter, title, page_start, page_end}>` — puste, gdy
   `buildLevel1Groups()` nie wykrył wystarczająco wyraźnego podziału
   (mniej niż 3 granice łącznie z niejawnym startem strony 1) — wtedy
   frontend po prostu pokazuje płaską listę jak dotychczas. Pierwszy
   rozdział (numer 1) może mieć pusty tytuł, jeśli jego granica to
   niejawny start strony 1, a nie prawdziwie zgłoszony nagłówek — frontend
   ma na ten wypadek tekst zastępczy "Rozdział {numer}" (klucz i18n
   `chapter_fallback_title`, 10 języków).
2. **Wzbogacone podsumowanie + sugerowane działania** (`analyze/index.ts`,
   `composePdfSummary()`): to NADAL to samo jedno, pojedyncze zapytanie co
   dotychczas, tylko: (a) wejściowa lista wzorców dostaje teraz dopisane
   pole "tip" (poradę) przy każdej pozycji — wcześniej Gemini "widziało"
   tylko typ i nazwę wzorca, bez porad; (b) `responseMimeType`/
   `responseSchema` zmienione ze zwykłego tekstu na JSON
   (`PDF_SUMMARY_SCHEMA`: `{summary: string, suggested_actions:
   string[]}`), z promptem wprost proszącym o 2-3 KRÓTKIE, całościowe
   sugestie, WYRAŹNIE zakazującym kopiowania pojedynczych porad z listy —
   ma to być wniosek widoczny dopiero z perspektywy całej analizy (np.
   powtarzający się mechanizm w kilku miejscach dokumentu). Istniejący
   mechanizm ponowienia (POPRAWKA 2026-08-27) zachowany bez zmian —
   ponawia teraz przy pustym/nieudanym/niesparsowalnym JSON-ie, nie tylko
   pustym tekście. `result.suggested_actions: string[]` — nowe pole obok
   `result.summary`.

**Frontend** (`scan.html`): dotychczasowe grupowanie kart "po nazwie"
(`groups`/`groupIndexByName`) wydzielone do osobnej funkcji
`buildGroups()`, wywoływanej TERAZ OSOBNO w obrębie każdego rozdziału
(gdy `result.chapters` niepuste i `input_type === 'pdf'`) zamiast raz dla
całej płaskiej listy — stąd ten sam wzorzec w dwóch różnych rozdziałach
dostaje dwie osobne karty. Budowanie pojedynczej karty wydzielone do
`renderGroup()` (zwraca element zamiast od razu go dołączać) — pozwala
wywołać ją zarówno z pętli po rozdziałach, jak i (dla PDF-ów bez
wykrytych rozdziałów, oraz dla trybu tekst/link/obraz) w dotychczasowej,
płaskiej ścieżce, bez duplikacji kodu samej karty. Wzorce, których strona
z jakiegoś powodu nie mieści się w żadnym zgłoszonym zakresie rozdziału
(nie powinno się zdarzać, ale — zgodnie ze stałą zasadą tego projektu:
nigdy nie gubić wyniku po cichu) trafiają na koniec listy bez nagłówka
rozdziału, zamiast zniknąć. Tylko PIERWSZA karta na całej stronie
(niezależnie od rozdziału) zostaje domyślnie rozwinięta — bez zmian
względem dotychczasowego zachowania. Nowy blok `#scanSuggestedActionsBlock`
pod istniejącym podsumowaniem — ukryty, gdy `result.suggested_actions`
puste/brak (starsze, zcache'owane analizy sprzed tej zmiany).

**Nowe klucze i18n** (10 języków): `suggested_actions_label` ("Sugerowane
działania"), `chapter_fallback_title` ("Rozdział {number}"). Nowe klasy
CSS w `style.css`: `.chapter-heading`, `.suggested-actions-list`.

Weryfikacja: `tsc --noEmit --skipLibCheck` na `analyze/index.ts` (te same
dwa przedawnione błędy typów co wcześniej, przesunięte tylko o numer
linii, niezwiązane z tą zmianą) oraz `node --experimental-strip-types
--check` — brak błędów. Składnia JS w `scan.html` sprawdzona osobno
(wyciągnięta z bloków `<script>` i przepuszczona przez `node --check`) —
brak błędów. Pełny test na żywo wymaga ręcznego wdrożenia w Supabase
Dashboard (backend) + wypchnięcia frontendu (`scan.html`/`style.css`/
`i18n.js`) na `main` — właściciel przetestuje na PDF-ie z realnymi
rozdziałami.

**POPRAWKA 2026-08-28 — "Metoda Sokratejska i 5x Dlaczego" (rozmowa
strategiczna z właścicielem): nowe pole "stakes" (konkretna, policzalna
stawka) + wzmocnione szukanie sprzeczności między twierdzeniami w CAŁYM
tekście, zero nowych zapytań do Gemini.** Punkt wyjścia — właściciel
przeprowadził ćwiczenie z pierwszych zasad (falsyfikowalność, twardy
fakt ekonomiczno-behawioralny) i doszedł do wniosku: ludzie płacą za
Gakori nie za samo NAZWANIE wzorca manipulacji (to potrafi każde
darmowe AI jednym promptem), tylko za złapanie czegoś KONKRETNEGO i
SPRAWDZALNEGO, czego ogólne narzędzie by nie wychwyciło — np. sprzeczną
liczbę między dwoma miejscami dokumentu. Padło pytanie: "jak konkretnie
wzmocnilibyśmy to w promptach?"

**Ustalenia po analizie kodu** (żeby nie zgadywać, sprawdzone wprost w
`analyze/index.ts`): tekst/link już dziś robią DWA zapytania po kolei
(Etap 2 = główna analiza, Etap 3 = `findAdditionalPatterns()`, "druga
runda szukania" — czyta cały tekst jeszcze raz). Ryzyko limitu RPM,
które naprawiliśmy dla PDF-a (POPRAWKA (ag)/(ah)), brało się z
RÓWNOLEGŁEGO wystrzelenia wielu kawałków na raz (`Promise.all()`) w
JEDNEJ analizie — to zupełnie inna sytuacja niż dwa zapytania
SEKWENCYJNIE jedno po drugim. Wniosek: dało się zrobić oba poniższe
punkty, WYKORZYSTUJĄC istniejące zapytania zamiast dokładać nowe.

**Zmiana 1 — nowe pole "stakes" w schemacie wzorca** (obok "tip"),
dodane w JEDNYM miejscu (`RESPONSE_SCHEMA`/`IMAGE_RESPONSE_SCHEMA`/
`PDF_RESPONSE_SCHEMA` — wszystkie inne schematy, np. `DETECTION_RESPONSE_SCHEMA`,
`PDF_LEVEL1_SCHEMA`, `ADDITIONAL_PATTERNS_SCHEMA`, dziedziczą kształt
wzorca przez `.properties.patterns`, więc zmiana automatycznie rozeszła
się wszędzie). Jedno zdanie z KONKRETNĄ, POLICZALNĄ stawką (np. "Reklamowany
zwrot to 40% miesięcznie — nawet najlepsze legalne fundusze dają ułamek
tego w skali ROKU") oparte WYŁĄCZNIE na liczbach/faktach z tekstu —
nowa sekcja "KONKRETNA STAWKA" w `buildSystemPrompt()` wprost zabrania
wymyślania liczb, których w tekście nie ma (wtedy pole zostaje puste).
To NIE jest ocena/wyrok (zasada NEUTRALNOŚĆ zostaje nienaruszona) — to
twardy fakt, nie opinia. `translateResult()` zaktualizowany, żeby
tłumaczyć też to pole (liczby w nim zostają nietknięte, tłumaczy się
tylko otaczający tekst). Etap 2 obu weryfikacji (`verifyAndRefinePdfPatterns()`,
`verifyAndRefineImagePatterns()`) dostał dopisane zadanie: uzupełnić
puste "stakes", jeśli da się je skonstruować z już istniejącego
cytatu/wyjaśnienia, albo wyczyścić je, jeśli jest zbyt ogólnikowe.

**Zmiana 2 — wzmocnione szukanie sprzeczności między twierdzeniami**,
zero nowych zapytań: nowa sekcja "SZUKANIE SPRZECZNOŚCI MIĘDZY
TWIERDZENIAMI" w `buildSystemPrompt()` (więc automatycznie trafia do
KAŻDEGO miejsca, które używa `systemPrompt` jako prefiksu — tekst, link,
obraz, PDF Etap 1 i Poziom 1) instruuje: aktywnie porównuj konkretne
liczby/daty/obietnice z RÓŻNYCH miejsc całego tekstu pod kątem
sprzeczności, nie tylko w obrębie jednego fragmentu na raz. Dodatkowo
wzmocnione dwa konkretne miejsca, które i tak już czytają SZERSZY
kontekst: Etap 3 tekstu/linku (`findAdditionalPatterns()`, "DRUGA RUNDA
SZUKANIA" — dopisane, że to najlepszy moment na zestawienie odległych od
siebie liczb, bo model ma już w pamięci CAŁY tekst) i PDF Poziom 1
(`analyzePdfLevel1Group()` — instrukcja "sprzeczność między wcześniejszą
a późniejszą częścią" doprecyzowana o konkretne liczby/daty zamiast
ogólnikowego sformułowania).

**Frontend** (`scan.html`): nowy blok `.pattern-stakes` na karcie wzorca,
tuż nad "Co teraz zrobić" (`.pattern-tip`) — celowo BEZ przerywanej ramki
jak tip, żeby wizualnie odróżnić "co to znaczy" (twardy fakt) od "co
teraz zrobić" (podpowiedź do działania). Ukryty, gdy pole puste (starsze
analizy sprzed tej zmiany, albo wzorzec bez żadnych liczb w tekście).
Nowy klucz i18n `stakes_label` ("Konkretnie:"), 10 języków.

Osobno, przy tej samej rozmowie strategicznej, właściciel zaproponował
DRUGI, niezależny kierunek: test popytu na koncepcję Gakori przez prostą
stronę typu "fake door" na domenie `gakori.com` (przycisk zakupu bez
realnego pobierania pieniędzy, zbieranie e-maili jako sygnał
zainteresowania) — **odłożone na osobną rozmowę o zakresie strony,
NIC jeszcze nie zbudowane**, połączone z odłożoną decyzją o samej
domenie (zadanie #20 na liście roboczej).

Weryfikacja: `tsc --noEmit --skipLibCheck` na `analyze/index.ts` (te
same dwa przedawnione błędy typów, niezwiązane z tą zmianą) oraz `node
--experimental-strip-types --check` — brak błędów. Składnia JS
`scan.html`/`i18n.js` sprawdzona osobno (wyciągnięta z bloków `<script>`,
`node --check`) — brak błędów. Pełny test jakości (czy nowe pole
"stakes" i wzmocnione szukanie sprzeczności realnie poprawiają analizę)
wymaga żywych testów na prawdziwych dokumentach po ręcznym wdrożeniu w
Supabase Dashboard.

**POPRAWKA 2026-08-28(b) — `fetchUrlAsText()`: filtr szumu po GĘSTOŚCI
LINKÓW zamiast rozpoznawania po wzorze daty. Żywy przypadek: artykuł
interia.pl (wywiad z szefem NRA o Giertychu/Kralu), zapisany jako
zaledwie 2088 znaków, mimo że pełna treść to kilka razy więcej.**
Właściciel dostarczył dokładny, byte-dokładny dowód: „Pokaż pełny tekst
źródłowy" pokazywał tekst URYWAJĄCY SIĘ dosłownie w połowie zdania „nie
przysługuje mu uposażenie poselskie", tuż PO pierwszym z trzech
śródartykułowych boksów „Zobacz również" — cała reszta wywiadu (kilkanaście
kolejnych odpowiedzi eksperta) w ogóle nie trafiła do analizy.

**Diagnoza** (uczciwie: nie dało się w 100% potwierdzić przez bezpośrednie
pobranie strony z tego środowiska — `wydarzenia.interia.pl` jest
zablokowane przez politykę sieciową sesji, sprawdzone przez
`curl`/`WebFetch`, oba zwróciły `EGRESS_BLOCKED`/403; diagnoza oparta o
analizę kodu + porównanie dokładnego miejsca urwania tekstu, które
przysłał właściciel): mechanizm `TRAILING_LIST_DATE_RE`
(POPRAWKA 2026-08-26(l)) szukał 3+ samodzielnych akapitów będących
WYŁĄCZNIE datą GDZIEKOLWIEK w dokumencie i ucinał WSZYSTKO od
NAJWCZEŚNIEJSZEGO takiego akapitu do końca strony — zaprojektowany pod
stronę z JEDNĄ taką listą na samym końcu. interia.pl wstawia TRZY osobne
boksy „Zobacz również" ROZSIANE w środku artykułu — licznik „3 daty
gdziekolwiek" spełniał się już przy pierwszym z nich, blisko początku
tekstu, więc mechanizm kasował całą resztę prawdziwej treści razem z nim.

**Właściciel zapytał wprost: "a nie da się po prostu podążać za logiką
głównej treści i w ten sposób ustalić klamry treści?"** — zamiast łatać
kolejnym punktowym regexem, zrobiliśmy to, co przeglądarki robią w
"trybie czytania" (algorytm typu Mozilla Readability): **gęstość tekstu
względem linków**. Prawdziwy akapit artykułu to głównie zwykły tekst z
rzadkimi linkami. Boks "zobacz również"/lista powiązanych to niemal
WYŁĄCZNIE linki (nagłówek = link, autor = link). Nowa logika w
`fetchUrlAsText()`:
1. `cleanFragmentText()` — wydzielona z dawnego jednorazowego czyszczenia
   całego dokumentu na raz, teraz uruchamiana PER AKAPIT.
2. `linkTextDensity()` — liczy, jaki procent tekstu SUROWEGO fragmentu
   HTML (przed usunięciem tagów) leży wewnątrz `<a>...</a>`.
3. Akapit KRÓTKI (≤220 znaków) ORAZ z gęstością linku ≥60% —
   wyrzucany. Oba progi (`LINK_DENSITY_NOISE_THRESHOLD`,
   `LINK_DENSITY_MAX_NOISE_TEXT_LENGTH`) to na razie najlepsze,
   wspólnie ustalone oszacowanie — **świadomie otwarte na dostrojenie w
   miarę pojawiania się kolejnych żywych przypadków** (właściciel: "będziemy
   korygować w trakcie jak będą dalej problemy z odnalezieniem kluczowego
   tekstu").
4. **Usunięty** dawny mechanizm `TRAILING_LIST_DATE_RE`/`dateParagraphIndices`
   (rozpoznawanie po konkretnym wzorze daty + "ucinanie od pierwszego
   znaleziska do końca") — w pełni zastąpiony powyższym, bardziej ogólnym
   podejściem. Kluczowa różnica: filtrowanie PER AKAPIT, nie "jeden punkt
   cięcia do końca dokumentu" — pojedynczy śródartykułowy boks znika, a
   prawdziwa treść PO NIM zostaje nietknięta.
5. Dorzucona też etykieta "zobacz również:" do `TEASER_LINE_PREFIXES`
   (sama etykieta boksu nie jest linkiem, więc gęstość linków jej nie
   złapie — to osobny, tani filtr po treści, tak jak reszta tej listy).

**Zaakceptowane ryzyko**: rzadki przypadek, gdzie krótkie, PRAWDZIWE
zdanie artykułu składa się w większości z linkowanego terminu, mógłby
zostać przypadkiem usunięty — świadomie zaakceptowane jako dużo mniejsza
szkoda niż dotychczasowy błąd (utrata nawet 80% artykułu).

**Testy przed wdrożeniem** (Node, poza repo, w scratchpadzie — logika
skopiowana 1:1 z ostatecznego kodu): (1) syntetyczny HTML odwzorowujący
dokładnie żywy przypadek interia.pl (akapit realnej treści → boks "Zobacz
również" → WIĘCEJ realnej treści) — boks zniknął, treść PRZED i PO nim
przetrwała nietknięta; (2) regresja wobec oryginalnego przypadku z
POPRAWKI (l) — prawdziwa lista "Najpopularniejsze" (4 kolejne, wyłącznie
linkowe pozycje) na końcu strony — cała lista poprawnie usunięta, ostatni
prawdziwy akapit przetrwał; (3) normalny akapit z JEDNYM krótkim linkiem
w środku dłuższego zdania (gęstość 0,12, długość 138 znaków) — poprawnie
NIE usunięty (fałszywy alarm by tu zaszkodził, test potwierdza że się nie
zdarza).

Weryfikacja: `tsc --noEmit --skipLibCheck` (te same dwa przedawnione
błędy typów, niezwiązane z tą zmianą) oraz `node --experimental-strip-types
--check` — brak błędów. Pełne potwierdzenie na żywym artykule (ten sam
URL interia.pl, który spowodował zgłoszenie) wymaga ręcznego wdrożenia w
Supabase Dashboard i ponownej analizy przez właściciela.

**POPRAWKA 2026-08-28(c)/(d) — prawdziwa przyczyna dalej nieudanej próby
naprawy z POPRAWKI (b): błąd był WCZEŚNIEJ, w wycinaniu `<article>`, nie
w filtrze szumu.** Po wdrożeniu POPRAWKI (b) właściciel dalej dostawał
"bez zmian" (i to dosłownie ten sam wynik — brak ekranu z ceną).
Dodane logi diagnostyczne (`console.log`, tymczasowe, `[refresh-debug]`)
pokazały: nowo pobrany tekst (2071 znaków) był PRAWIE identyczny jak stary
(2088 znaków) — poprawka (b) w ogóle nie zdążyła zadziałać, bo problem
leżał wcześniej w pipeline.

**Prawdziwa przyczyna**: `fetchUrlAsText()` wycinał zawartość `<article>`
prostym dopasowaniem regex "od PIERWSZEGO `<article>` do PIERWSZEGO
napotkanego `</article>`" (`html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)`)
— BEZ liczenia zagnieżdżenia. interia.pl (i zapewne wiele innych
nowoczesnych portali) oznacza KAŻDY boks "Zobacz również" jako osobny,
zagnieżdżony znacznik `<article>` (semantycznie poprawny HTML). Dopasowanie
kończyło się więc na zamknięciu PIERWSZEGO takiego wewnętrznego boksu, nie
prawdziwego, głównego artykułu — cała reszta wywiadu w ogóle nie trafiała
do dalszego przetwarzania, ZANIM jakikolwiek filtr szumu (stary czy nowy
z POPRAWKI (b)) dostał szansę zadziałać.

**Naprawa**: nowa funkcja `extractFirstElementContent()` — ten sam
mechanizm poprawnego liczenia zagnieżdżenia, którego już używa
`stripElementsByTag()` w tym samym pliku (dla `<nav>`/`<div>` itd.), tylko
zwraca zawartość PIERWSZEGO elementu (poprawnie dopasowaną do JEGO
WŁASNEGO zamknięcia) zamiast usuwać dopasowane elementy. Fail-open: brak
poprawnie zamkniętego `<article>` (niepoprawny HTML) zostawia oryginalny
`html` nietknięty, tak jak dotychczas.

**Testy przed wdrożeniem** (Node, scratchpad): syntetyczny HTML z
zagnieżdżonymi `<article>` (dwa boksy powiązane W ŚRODKU głównego
artykułu) — potwierdzone, że treść PO boksach jest teraz poprawnie
zachowana, a `<nav>`/`<footer>` POZA głównym `<article>` dalej poprawnie
odcięte.

Dodany też DRUGI log diagnostyczny (`console.log`, tymczasowy) tuż po
wycięciu `<article>` — długość tekstu na tym etapie, żeby przy
ewentualnym KOLEJNYM nieudanym teście dało się od razu zobaczyć, czy
problem jest tu, czy jeszcze dalej w pipeline, bez zgadywania. **Oba logi
diagnostyczne (`[refresh-debug]`) są tymczasowe — do usunięcia, gdy
temat zostanie ostatecznie potwierdzony jako zamknięty.**

Weryfikacja: `tsc --noEmit --skipLibCheck` (te same dwa przedawnione
błędy typów, niezwiązane z tą zmianą) oraz `node --experimental-strip-types
--check` — brak błędów. Ostateczne potwierdzenie wymaga ponownego testu
na żywo (ten sam link interia.pl) po ręcznym wdrożeniu w Supabase
Dashboard.

**POPRAWKA 2026-08-28(e) — zmiana fundamentalna: `fetchUrlAsText()` przepisane
na prawdziwy parser HTML→DOM (`linkedom`) + algorytm wyciągania głównej
treści (`@mozilla/readability`), zamiast własnych regexów.** Po dwóch
kolejnych, punktowych łatkach w tej samej sesji (POPRAWKA (b) — gęstość
linków, POPRAWKA (d) — zagnieżdżony `<article>`) właściciel zadał pytanie
wprost: **"czy nie damy rady zrobić tak, żeby jakość zawsze była na
każdej stronie?"** — uczciwa odpowiedź brzmiała: nie w 100%, żaden własny
regexowy parser HTML nigdy nie obsłuży wszystkich wariantów budowy stron
w internecie, bo zawsze może się pojawić nowy wzorzec. Ale da się
DRAMATYCZNIE zmniejszyć ryzyko, przechodząc na prawdziwy, sprawdzony
parser DOM zamiast własnych regexów — to samo podejście, którego
przeglądarki używają w "trybie czytania" (Mozilla Readability to
dosłownie ten kod, którego używa tryb czytania Firefoksa). Właściciel
zgodził się na większą, ale trwalszą zmianę: "myślę że pójdziemy w ten
parser, jeżeli ma to zwiększyć jakość" / "najwyżej wrócimy do obecnego
stanu" (świadomość odwracalności przez git).

**Sprawdzone licencje PRZED wdrożeniem** (właściciel wprost poprosił o
ocenę warunków, zanim zaakceptujemy) — sprawdzone WPROST w rejestrze npm
(`registry.npmjs.org`, dostępny z tego środowiska bez blokady sieciowej),
nie z pamięci:
- `linkedom` — licencja **ISC** (bardzo liberalna, jak MIT), aktywnie
  rozwijana (218 wydanych wersji od 2020, ostatnia lipiec 2026).
- `@mozilla/readability` — licencja **Apache-2.0** (liberalna, z grantem
  patentowym), oficjalny projekt Mozilli, rozwijany od 2020, ostatnia
  wersja marzec 2025.

Obie pozwalają na użycie komercyjne, BEZ obowiązku udostępniania kodu
Gakori, bez opłat — jedyny warunek to techniczna formalność (zachowanie
notki licencyjnej w plikach samej biblioteki, dzieje się automatycznie
przy imporcie `npm:`).

**Nowa architektura `fetchUrlAsText()`**:
1. Pobranie strony — bez zmian (te same nagłówki/timeout).
2. `parseHTML(html)` (linkedom) buduje prawdziwe drzewo DOM.
3. `new Readability(document).parse()` wyciąga główną treść — zastępuje
   CAŁY dawny mechanizm: `NOISE_CLASS_TOKENS`/`hasNoiseClass`/
   `stripElementsByTag`/`extractFirstElementContent`/`HTML_NAMED_ENTITIES`
   (usunięte jako martwy kod — sprawdzone przez `grep`, że nic innego w
   pliku ich nie używało). Fail-open: `null`/pusty wynik → `fetchUrlAsText()`
   zwraca `null`, jak dotychczas, uruchamiając istniejącą ścieżkę
   awaryjną (Gemini "URL context").
4. **UCZCIWE ZASTRZEŻENIE, sprawdzone w testach przed wdrożeniem**:
   Readability samo w sobie NIE usuwa 100% szumu w każdym przypadku —
   krótkie, gęsto polinkowane boksy "zobacz również" czasem przetrwają
   jego algorytm (zwłaszcza na krótszych artykułach, gdzie ma mniej
   materiału porównawczego — jego ocena jest z natury statystyczna/
   porównawcza). Dlatego ZATRZYMANY (nie usunięty) już sprawdzony filtr
   gęstości linków z POPRAWKI (b) jako DRUGA warstwa, uruchamiana na
   wyniku Readability — teraz działa niezawodnie, bo pracuje na już
   oczyszczonym materiale. Dodatkowo POPRAWIONY względem wersji z (b):
   `<a>`/`</a>` zamieniane na niewidoczne znaki-sentinel (U+0001/U+0002)
   PRZED podziałem na akapity, a stan "czy jestem w środku linku"
   NIESIONY MIĘDZY kolejnymi akapitami (nie liczony od nowa dla każdego z
   osobna) — to naprawia problem, który POPRAWKA (b) miała: link
   rozciągnięty na kilka akapitów (jedna karta z kategorią/tytułem/
   autorem w osobnych `<div>`, całość w JEDNYM `<a>`) teraz poprawnie
   liczy się jako "w 100% link" w KAŻDYM z tych akapitów.
5. Tania, dodatkowa warstwa PO TREŚCI (`TEASER_LINE_PREFIXES`/
   `EXACT_NOISE_LINES`, bez zmian z poprzednich poprawek) — łapie polskie
   frazy-zapowiedzi, które same nie są linkiem (więc filtr gęstości ich
   nie złapie).

**Testy przed wdrożeniem** (Node, scratchpad, `npm install linkedom
@mozilla/readability` — te same wersje co w `npm:` importach): (1)
sprawdzone realne API `linkedom.parseHTML()` (zwraca `Window`, `.document`
działa jak oczekiwano) przez rozpakowanie prawdziwej paczki z rejestru,
nie z dokumentacji/pamięci; (2) syntetyczny test na krótkim HTML-u z
zagnieżdżonym `<article>` — Readability poprawnie usuwa `<nav>`/`<footer>`,
ale SAMO zostawia część boksu "zobacz również" (potwierdzone zastrzeżenie
z punktu 4 wyżej); (3) dłuższy, bardziej realistyczny test (struktura
zbliżona do interia.pl — dwa boksy "zobacz również" w środku wywiadu) —
Readability + filtr gęstości linków RAZEM usuwają OBA boksy w całości,
cała prawdziwa treść (włącznie z ostatnim zdaniem "Rozmawiał Łukasz
Szpyrka") zachowana; (4) **test na DOKŁADNEJ kopii funkcji wyciągniętej z
prawdziwego pliku** (nie przepisanej ręcznie w teście — realne ryzyko
błędu przy kopiowaniu wykluczone) z podmienionym tylko `fetchWithTimeout`
— potwierdzone identycznie jak w punkcie 3.

Usunięty tymczasowy log diagnostyczny "po_wycięciu_article" (kod, którego
dotyczył, już nie istnieje) — pozostałe dwa tymczasowe logi
`[refresh-debug]` (wczesny cache po `content_hash`, porównanie
podobieństwa shingle) ZOSTAJĄ na razie, do usunięcia po ostatecznym
potwierdzeniu na żywo, że temat linku interia.pl jest zamknięty.

Weryfikacja: `tsc --noEmit --skipLibCheck` (te same dwa przedawnione
błędy typów + dwa NOWE, oczekiwane błędy "Cannot find module" dla
`npm:linkedom@0.18.13`/`npm:@mozilla/readability@0.6.0` — ten sam,
znany, nieszkodliwy efekt uboczny środowiska bez Deno, jak przy
`jsr:@supabase/supabase-js@2`/`npm:pdf-lib@1.17.1` od zawsze) oraz `node
--experimental-strip-types --check` — brak błędów.

**Potwierdzenie na żywo (ten sam link interia.pl)**: 12696 znaków
wyciągniętych (poprzednio 2088), WSZYSTKIE cztery śródartykułowe boksy
"Zobacz również" usunięte, cała prawdziwa treść wywiadu zachowana od
początku do końca — 6 trafnych wzorców wykrytych (poprzednio 1). **Jeden
drobny, znany wyjątek**: pojedyncza, ostatnia linijka na samym końcu
strony ("Polityczny WF": Nawrocki nadpremierem?... INTERIA.PL") przeżyła
oba filtry — to prawdopodobnie fragment bez znacznika `<a>` (np.
JS-owa nawigacja) albo struktura, której Readability nie oceniło jako
szum. Świadomie NIE łatane na ślepo (brak dostępu do prawdziwego HTML-a
tej strony z tego środowiska, sprawdzone przez `curl`/`WebFetch` — oba
zablokowane politką sieciową) — ryzyko: zgadnięty warunek (np. "usuń
krótki akapit na końcu") mógłby przypadkiem skasować prawdziwe, krótkie
zdanie kończące artykuł (np. bezpośrednio sąsiadujące "Rozmawiał Łukasz
Szpyrka", które MUSI zostać). Właściciel zaakceptował zamknięcie tematu w
tym stanie — będzie dalej testował na innych stronach, a przy kolejnym
podobnym żywym przypadku (z konkretnym "Pokaż pełny tekst źródłowy" do
analizy) wrócimy do tego z realnymi danymi zamiast zgadywania.

**Drugi żywy przypadek tego samego dnia — polsatnews.pl, ZAMKNIĘTY jako
znane ograniczenie, ŚWIADOMIE nie łatany.** Artykuł "Trump zmienia nazwę
jeziora Ontario..." — wyciągnięty tekst (2142 znaków) zaczynał się od
akapitu tła ("Jezioro Ontario znajduje się na pograniczu...") z
pominięciem prawdziwego leadu widocznego na żywej stronie ("Donald Trump
podpisał rozporządzenie..."). Zbadana hipoteza: Readability czasem
wydziela wyróżniony pierwszy akapit do osobnego pola `excerpt` zamiast
zostawiać go w `content` — syntetyczny test z typowym podziałem
lead/treść NIE potwierdził tego dla TEJ struktury (oba fragmenty zostały
poprawnie w `content`), więc prawdziwa przyczyna dla polsatnews.pl
pozostaje nieznana (strona zablokowana dla `curl`/`WebFetch` z tego
środowiska, tak jak interia.pl wcześniej).

**Właściciel słusznie zakwestionował** proponowaną "bezpieczną" łatkę
(dopisywanie `article.excerpt` na początek, gdy brakuje go w `content`):
"a ja zacznę wklejać nie to co trzeba?" — sprawdzenie ŹRÓDŁA
`Readability.js` (nie dokumentacji, prawdziwego kodu z paczki npm)
potwierdziło, że `excerpt` w WIĘKSZOŚCI przypadków pochodzi z
meta-opisu SEO (`<meta name="description">`) albo JSON-LD — tekstu
redakcyjnego, NIE dosłownego fragmentu artykułu — i tylko gdy strona nie
ma żadnych takich metadanych, Readability sięga po prawdziwy pierwszy
akapit jako zapasowe źródło `excerpt`. Wstawienie tego do "pełnego tekstu
źródłowego" złamałoby zasadę WIERNOŚĆ CYTATU (tekst pokazywany
użytkownikowi i wysyłany do Gemini musi być dosłowny, możliwy do
zweryfikowania na żywej stronie) — **pomysł WYCOFANY, nie wdrożony**.

**Decyzja strategiczna właściciela, która zamyka ten wątek na razie**:
"liczę na globalność, więc w każdym języku ludzie będą posługiwali się
innymi stronami — musimy być skuteczni, a na chwilę obecną nie jesteśmy w
stanie korygować i robić mapy każdej strony." To POTWIERDZA (nie
podważa) decyzję o przejściu na Readability z POPRAWKI (e) — inwestycja w
mechanizm ogólny, działający z założenia na każdej stronie/w każdym
języku, była właściwym kierunkiem właśnie DLATEGO, że mapowanie
pojedynczych witryn nie skaluje się przy globalnym zasięgu produktu.
Pojedyncze, resztkowe niedoskonałości (jak ten przypadek) są świadomie
akceptowane jako koszt tego podejścia, do punktowego doprecyzowania
TYLKO gdy pojawią się z realnymi danymi (żywy przykład + "Pokaż pełny
tekst źródłowy"), nigdy przez zgadywanie na ślepo.

**POPRAWKA 2026-08-28(f) — `buildSystemPrompt()`: zakaz używania nazwy
DZIEDZINY jako nazwy wzorca + ostrożność przy modelach łatwych do
naciągnięcia.** Właściciel poprosił o wzmocnienie wykrywania wzorców
("model bywa zbyt zachowawczy"), ale nie miał konkretnego przykładu —
zamiast zgadywać, poprosił o analizę realnych danych z cotygodniowego
maila `weekly-model-report` (50 analiz, rozkład częstości modeli z
ostatnich 7 dni, z prawdziwymi cytatami). Analiza tych danych NIE
potwierdziła "za mało wzorców" (dobra różnorodność, ponad 40 różnych
modeli użytych w tygodniu) — za to ujawniła dwa konkretne, realne błędy:

1. Jeden wzorzec miał w polu "name" dosłownie **"Matematyka i
   statystyka"** — to nazwa całej DZIEDZINY z `MENTAL_MODELS_BY_CATEGORY`
   (nagłówek WIELKIMI LITERAMI przed dwukropkiem w każdym wpisie
   biblioteki), nie nazwa konkretnego, nazwanego modelu z jej wnętrza
   (jak "Istotność Statystyczna" czy "Błąd Przeżywalności"). Prompt
   dotąd o tym nie ostrzegał wprost — sekcja "BIBLIOTEKA MODELI
   MENTALNYCH" mówiła tylko "wybierz najtrafniej pasujący model", nie
   precyzując, że sam nagłówek dziedziny nigdy nie jest poprawną
   odpowiedzią.
2. Kilka słabych/naciąganych dopasowań, głównie pod nazwą "Modułowość"
   (np. spis treści książki albo lista nowych przepisów nazwane
   "Modułowością", choć to zwykłe wyliczenia, nie elementy systemu
   wymienialne niezależnie od siebie) — model najwyraźniej używał tej
   nazwy jako wygodnej, luźno pasującej "łatki" zamiast sprawdzać pełną
   definicję.

**Naprawa** (`supabase/functions/analyze/index.ts`, `buildSystemPrompt()`,
zaraz po sekcji "BIBLIOTEKA MODELI MENTALNYCH"): dwie nowe sekcje w
prompcie.
- "NIGDY NAZWA DZIEDZINY ZAMIAST KONKRETNEGO MODELU" — wprost tłumaczy,
  że nagłówki WIELKIMI LITERAMI przed dwukropkiem (np. "MATEMATYKA I
  STATYSTYKA:") to tylko porządkujące etykiety, nigdy wartość pola
  "name" — z dokładnie tym złym przykładem, który się zdarzył
  ("Matematyka i statystyka"), i dobrym kontrprzykładem dla tego samego
  fragmentu ("Istotność Statystyczna" / "Błąd Przeżywalności").
- "OSTROŻNIE Z MODELAMI ŁATWYMI DO NACIĄGNIĘCIA" — każe modelowi przed
  użyciem modeli o szerokiej, technicznej nazwie (podany przykład:
  "Modułowość") w myślach sprawdzić PEŁNĄ definicję z biblioteki, nie
  tylko samą nazwę, z konkretnym wyjaśnieniem czym "Modułowość" NIE jest
  (zwykłe wyliczenie/lista to nie to samo, co elementy wymienialne
  niezależnie od reszty systemu) — jeśli fragment nie spełnia pełnej
  definicji, model ma szukać trafniejszego modelu albo nie zgłaszać
  wzorca wcale.

Zero zmian w schemacie odpowiedzi, zero nowych zapytań do Gemini — to
wyłącznie doprecyzowanie istniejącej instrukcji.

Weryfikacja: `node --experimental-strip-types --check` (poprawna
składnia) oraz `tsc --noEmit --skipLibCheck` (te same znane błędy
środowiskowe co zawsze, niezwiązane z tą zmianą).

**POPRAWKA 2026-08-28 — `daily-report`: wykrywanie botów (punkt 3 z
listy "opanujmy 1,2,3", odłożony wcześniej w tej sesji).** Właściciel
potwierdził dwie rzeczy: (1) definicja — dodatkowa WIDOCZNOŚĆ nieudanych
prób analizy, które wyglądają na zautomatyzowane (regularne odstępy
czasowe), NIEZALEŻNA od istniejącego już mechanizmu blokad
(`RATE_LIMIT_*` w `analyze/index.ts` — ten reaguje dopiero po
przekroczeniu progu liczby prób, nie patrzy na regularność); (2)
umieszczenie — w tym samym, dziennym `daily-report` (nie osobny mail):
"skoro są blokady to raz dziennie wystarczy razem z daily report".

**Mechanizm**: dla każdego konta z 4+ nieudanymi próbami (`failed_scan_attempts`)
we wczorajszej doby polskiej, liczymy odstępy czasowe między kolejnymi
próbami i współczynnik zmienności (odchylenie standardowe / średnia
odstępów, w sekundach) — człowiek klika nieregularnie (wysoki
współczynnik), skrypt/bot bijący w regularnych odstępach zostawia bardzo
NISKI współczynnik. Próg `BOT_MAX_COEFFICIENT_OF_VARIATION` ustalony na
10% PO realnym teście w Node (scratchpad, nie zgadnięty): symulowane boty
(regularne odstępy ±kilka%) dawały współczynnik ~2-4%, a przypadkowo dość
regularny "człowiek" (mała próbka, 5 wartości) ~10-11% — pierwsza wersja
progu (15%) dawała na TYM konkretnym teście fałszywy alarm, 10% zostawia
bezpieczny margines. Konta powyżej progu trafiają do nowej sekcji „Wykrywanie
botów" w mailu, z adresem e-mail (dociągniętym tylko dla flagowanych kont,
żeby nie robić dodatkowego zapytania na co dzień), liczbą prób, średnim
odstępem i współczynnikiem zmienności — WYŁĄCZNIE informacyjnie, żadna
automatyczna akcja się z tego nie wyzwala (blokady istnieją już osobno).

Weryfikacja: `tsc --noEmit --skipLibCheck` (te same znane błędy
środowiskowe: `jsr:`/`Deno`, niezwiązane z tą zmianą) oraz `node
--experimental-strip-types --check` — brak błędów. Logika współczynnika
zmienności przetestowana osobno w Node (scratchpad) na czterech
syntetycznych przypadkach (dwa "boty", jeden wyraźnie nieregularny
człowiek, jeden przypadkowo regularny człowiek) przed ustaleniem progu.

**POPRAWKA 2026-08-28(b) — rozszerzenie wykrywania botów o dwa kolejne
sygnały, na pytanie właściciela "czy jeszcze jakiś sygnałów botowych nie
powinniśmy dodać".** Właściciel wprost zapytał, czy nowe kontrole kosztują
— odpowiedź: NIE, obie to WYŁĄCZNIE odczyty z bazy (SELECT) + liczenie w
pamięci tej samej funkcji, zero zapytań do Gemini, zero kosztu dolarowego
(dokładnie jak pierwsza wersja mechanizmu).

1. **Ta sama logika regularności zastosowana do `content_reanalysis_attempts`**
   (powtarzane "Sprawdź, czy coś się zmieniło" na TYM SAMYM linku) —
   grupowane po PARZE `(user_id, content_hash)` razem (klucz złożony
   `"${user_id}::${content_hash}"`), tak jak już robi to istniejący limit
   `SAME_FILE_ATTEMPT_LIMIT` w `analyze/index.ts` — żeby odstępy liczyły
   się dla JEDNEJ, konkretnej treści, nie zlepka wszystkich linków danego
   użytkownika naraz (mieszanie różnych treści zaburzałoby sygnał
   regularności). Przetestowane w Node (scratchpad): użytkownik hammerujący
   jeden `content_hash` co ~20s wykryty (cv 0%), ten sam użytkownik
   sporadycznie sprawdzający INNĄ treść poprawnie zignorowany (za mało
   próbek, nie miesza się z pierwszym sygnałem).
2. **Nowy, NIEZALEŻNY od regularności sygnał objętościowy** —
   `BOT_VOLUME_THRESHOLD = 20`: konto z 20+ nieudanymi próbami w ciągu
   jednej doby, nawet jeśli odstępy są celowo rozlosowane (bot świadomie
   unikający wykrycia po regularności) — liczone z TYCH SAMYCH danych co
   punkt (1) z poprzedniej poprawki (`failed_scan_attempts`), bez
   dodatkowego zapytania do bazy.

Wspólny pomocniczy kod (`groupBy()`, `gapStats()`, `attachEmails()`)
wydzielony z pierwszej wersji, żeby oba sygnały (nieudane próby,
powtórne sprawdzanie) używały identycznej logiki bez duplikacji. Karta
maila "Wykrywanie botów" rozszerzona o trzy podsekcje (regularne odstępy
— nieudane próby / regularne odstępy — powtórne sprawdzanie / nietypowa
objętość), każda pokazuje "Brak." gdy nic się nie znajdzie.

Weryfikacja: `tsc --noEmit --skipLibCheck` (te same znane błędy
środowiskowe) oraz `node --experimental-strip-types --check` — brak
błędów.

**POPRAWKA 2026-08-28(c) — `daily-report`: przebudowa sekcji "Najpopularniejsze
analizy" na wyraźną prośbę właściciela.** Dawniej: top 5 WSZECH CZASÓW,
jeden wspólny ranking (link+tekst razem), tytuły w oryginalnym języku
analizy. Właściciel poprosił o cztery zmiany naraz: (1) tylko wczorajsza
doba (te same `yr.start`/`yr.end` co reszta raportu) — "nie chcę żeby
wisiały mi stare analizy"; (2) osobne rankingi na język: top 5 linków +
top 3 analiz tekstu (rozdzielone `input_type`); (3) język bez ŻADNEJ
analizy wczoraj znika z raportu całkowicie, nie pokazuje pustej sekcji;
(4) tytuły przetłumaczone na polski (raport czyta wyłącznie po polsku).

**Punkt (4) to PIERWSZY realny koszt AI w tej funkcji** — dotąd
`daily-report` kosztował $0 (tylko wysyłka maila przez Brevo). Nowa
funkcja `translateTitlesToPolish()` — JEDNO, zbiorcze zapytanie do Gemini
(`gemini-3.5-flash-lite`, ten sam model co `analyze/index.ts`) na CAŁĄ
listę tytułów naraz (nie osobne zapytanie na każdy tytuł, wyraźnie
zaznaczone właścicielowi PRZED wdrożeniem i zaakceptowane) —
`responseSchema` typu tablica stringów, długość musi się zgadzać z
wejściem. Świadomie NIE podłączona do współdzielonej infrastruktury
kill-switcha z `analyze/index.ts` (`costTracker`/`system_daily_spend`) —
uzasadnienie: to stały, z góry ograniczony koszt raz dziennie (maks.
kilkadziesiąt krótkich tytułów), nie coś wywoływanego bezpośrednio przez
użytkowników, więc nie ma tego samego ryzyka "spirali kosztu", przed
którym chroni główny wyłącznik. Nowy wymagany sekret `GEMINI_API_KEY`
(dopisany do listy na górze pliku). Fail-open na każdym etapie
(błąd sieci, zły JSON, niezgodna długość odpowiedzi, pojedynczy pusty
element) — zawsze zostają oryginalne tytuły zamiast wywalać raport;
przetestowane osobno w Node (scratchpad) na pięciu przypadkach (poprawna
odpowiedź, zła długość, zepsuty JSON, pusty string, pojedynczy pusty
element w tablicy).

Weryfikacja: `tsc --noEmit --skipLibCheck` (te same znane błędy
środowiskowe) oraz `node --experimental-strip-types --check` — brak
błędów.

**POPRAWKA 2026-08-28(g) — obrazy dostają PRAWDZIWĄ prywatność (jak PDF-y)
+ nowy checkbox "prywatna analiza" dla wklejonego tekstu.** Właściciel
poprosił: (1) obrazy mają zostawać w prywatnej historii, dokładnie jak
PDF-y; (2) dla tekstu — checkbox, którym użytkownik SAM decyduje, czy dana
konkretna analiza ma być prywatna; (3) obraz sam w sobie nigdy nie ma
trafiać do bazy, tylko jego nazwa jako źródło (to już było prawdą — obraz
zawsze istniał tylko chwilowo w pamięci, do wysłania do Gemini, nigdy nie
trafiał do `scans`/żadnego magazynu plików).

Sprawdzone przed wdrożeniem: obrazy dziś NIE są widoczne na stronie
głównej z publicznymi analizami (`index.html` już filtruje `input_type`
`image`/`pdf` z tej listy), ale — tak jak kiedyś PDF-y przed POPRAWKĄ
2026-08-19(b) — wynik nadal dało się otworzyć pod `scan.html?id=...`, jeśli
ktoś poznał/zgadł link (RLS na `scans` dawała publiczny odczyt wszystkiemu
poza `pdf`). To właśnie naprawione — rozszerzenie DOKŁADNIE tego samego
mechanizmu `scan_access`, który już chronił PDF-y.

**Ustalenia z właścicielem** (`AskUserQuestion`): (a) checkbox prywatności
dotyczy WYŁĄCZNIE wklejonego tekstu (`input_type = 'text'`) — link (`url`)
zawsze zostaje publiczny, bez wyjątku; (b) na `historia.html` trzy OSOBNE
sekcje pod sobą (PDF-y / Obrazy / Prywatne teksty), nie jedna wspólna
lista.

**Zmiany:**
1. **`scans`**: nowa kolumna `is_private` (boolean, domyślnie `false`) —
   ma znaczenie WYŁĄCZNIE dla `input_type = 'text'`. Dla `pdf`/`image`
   prywatność wynika już z samego `input_type` (zawsze prywatne); dla
   `url` zawsze publiczne.
2. **RLS na `scans`** (ten sam wzorzec samoczyszczącego skryptu co przy
   pierwotnej prywatności PDF-ów — usuwa WSZYSTKIE stare reguły `SELECT`,
   niezależnie od nazwy, i stawia dwie nowe): publiczny odczyt dla `url`
   ZAWSZE oraz `text` gdy `is_private = false`; odczyt wyłącznie przez
   `scan_access` dla `pdf`/`image` ZAWSZE oraz `text` gdy `is_private =
   true`.
3. **`analyze/index.ts`**: nowe pola w body — `image_filenames` (nazwy
   przesłanych plików obrazów, może być kilka naraz, łączone przecinkiem
   do etykiety w `scan_access.source_filename`, analogicznie do
   `pdf_filename`) i `is_private` (checkbox tekstu). Rozszerzony mechanizm
   przyznawania dostępu w `scan_access` — dotąd WYŁĄCZNIE dla
   `input_type === 'pdf'`, teraz też dla `image` (zawsze) i `text` gdy
   `isPrivateText` — w OBU miejscach, gdzie wynik trafia do kogoś
   (trafienie w cache i świeża analiza), dokładnie tak samo jak PDF-y już
   działały. **Ważne zabezpieczenie**: `isPrivateText` wymaga zalogowanego
   `user_id` — gość zaznaczający checkbox jest po cichu ignorowany (analiza
   zostaje publiczna), bo bez konta nie ma komu przyznać dostępu w
   `scan_access` — inaczej wynik byłby NA ZAWSZE niedostępny dla nikogo
   (uwięziony za RLS bez pasującego `auth.uid()`).
4. **`index.html`**: nowy checkbox "Zachować tę analizę jako prywatną" w
   panelu tekstu; przy obrazach wysyłane są teraz też nazwy oryginalnych
   plików (`file.name` z realnego wyboru pliku).
5. **`historia.html`**: przemianowana na "Twoje prywatne analizy" (też w
   `<title>` i linku z `account.html`), trzy osobne sekcje (PDF-y / Obrazy
   / Prywatne teksty) — widoczna tylko ta sekcja, w której są jakieś
   wyniki. Dla obrazów etykieta to nazwa(-y) pliku (jak PDF); dla tekstu
   nie ma pojęcia "nazwa pliku" — pokazywany jest zamiast tego krótki
   (60 znaków) fragment samej treści.
6. **`scan.html`**: komentarz przy `sessionReady` (mechanizm czekania na
   sesję PRZED zapytaniem do `scans`, żeby właściciel prywatnego wyniku nie
   dostał fałszywego "nie znaleziono") zaktualizowany — mechanizm był już
   ogólny (nie tylko dla PDF), tylko opis tego nie odzwierciedlał.

**SQL migracji** (wklejony i uruchomiony ręcznie w Supabase SQL Editor):
```sql
alter table public.scans add column if not exists is_private boolean not null default false;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'scans' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.scans', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "scans_select_public" ON public.scans
  FOR SELECT USING (
    input_type = 'url'
    OR (input_type = 'text' AND is_private = false)
  );

CREATE POLICY "scans_select_own_private" ON public.scans
  FOR SELECT USING (
    (
      input_type = 'pdf'
      OR input_type = 'image'
      OR (input_type = 'text' AND is_private = true)
    )
    AND EXISTS (
      SELECT 1 FROM public.scan_access sa
      WHERE sa.scan_id = scans.id AND sa.user_id = auth.uid()
    )
  );
```
Ten skrypt sam znajduje i usuwa WSZYSTKIE dotychczasowe reguły `SELECT` na
`scans` (niezależnie od nazwy) i zastępuje je dwiema nowymi — bezpieczny do
wielokrotnego uruchomienia. Zero zmian w `scan_access` (struktura tabeli
bez zmian, tylko więcej typów wierszy w niej ląduje).

Weryfikacja: `node --experimental-strip-types --check` (poprawna składnia,
też dla `historia.html`/`index.html` — wyciągnięte i sprawdzone osobno
przez `node --check`) oraz `tsc --noEmit --skipLibCheck` dla
`analyze/index.ts` (te same znane błędy środowiskowe co zawsze).

**POPRAWKA 2026-08-28(g2) — checkbox prywatności wyglądał "paskudnie"
(zgłoszenie właściciela ze zrzutem ekranu): rozjechana belka zamiast
małego kwadracika.** Przyczyna: globalna reguła `input, textarea { width:
100%; padding: ...; border: ...; }` w `style.css` (myślana dla pól
tekstowych) stosowała się też do `<input type="checkbox">`, bo selektor
`input` łapie WSZYSTKIE typy pól. Naprawa: selektor zawężony do
`input:not([type="checkbox"]):not([type="radio"])`, plus nowa, osobna,
mała reguła `input[type="checkbox"], input[type="radio"] { width: 16px;
height: 16px; ... }`. Poprawiony też `align-items` etykiety w `index.html`
(`flex-start` zamiast `center`), żeby dwuwierszowy tekst obok checkboxa
wyglądał naturalnie.

**POPRAWKA 2026-08-28(h) — duży pakiet: prawdziwe tytuły analiz + naprawa
ucinania tekstu WSZĘDZIE + przebudowa "Twoje prywatne analizy" (3 karty +
wspólna wyszukiwarka + limit 20/typ) + naprawa słabego wyszukiwania na
stronie głównej.** Właściciel zgłosił żywym zrzutem ekranu (lista "Twoje
prywatne analizy"), że wolałby osobne karty na typ, wspólną wyszukiwarkę
przeszukującą wszystkie typy naraz, limit do 20 wyników — i przy okazji
zauważył, że tytuły się ucinają (dotyczy też strony głównej, "Wyszukaj
analizę" — drugi zrzut ekranu). Zapytany wprost, dlaczego wyszukiwarka na
stronie głównej "słabo szuka", odpowiedział, że koncept NADAWANIA tytułów
też trzeba ustalić, bo dzisiejsze są "chaotyczne i bez znaczenia".

**Diagnoza (przed jakąkolwiek zmianą)**: dzisiejszy "tytuł" na obu listach
to w praktyce PRZYPADKOWY fragment — pierwszy wykryty cytat wzorca albo
`source_quote`/`summary` — nie prawdziwy tytuł treści. To samo źródło
tłumaczy oba zgłoszenia naraz: (1) wygląda chaotycznie, bo to nie jest
zaprojektowany tytuł, tylko urwany środek zdania; (2) wyszukiwarka na
stronie głównej sprawdzała WYŁĄCZNIE `source_quote`/`summary` — czyli
często coś INNEGO niż to, co faktycznie wyświetlała jako tytuł
(`patterns[0].quote`) — więc wpisanie dokładnie tego, co widać na liście,
regularnie nic nie znajdowało.

**Ustalona z właścicielem koncepcja tytułu** (`AskUserQuestion` — kierunek
paska: pionowy, nie poziomy/karuzela; tytuł tekstu: wygenerowany przez AI,
nie pierwsze znaki treści):
- **Link** — PRAWDZIWY tytuł strony, wyciągnięty przez Readability
  (`article.title` — INNY, dużo bardziej niezawodny mechanizm niż zawodny
  `article.excerpt` z POPRAWKI (e): `title` pochodzi z `<title>`/nagłówka
  strony, nie z meta-opisu SEO). Darmowe, dokładne, zero ryzyka
  "wymyślenia" złego tytułu.
- **PDF i obraz** — bez zmian, mają już sensowny tytuł: prawdziwą nazwę
  pliku (`scan_access.source_filename`).
- **Wklejony tekst** — nie ma naturalnego tytułu, więc Gemini generuje go
  jako część TEJ SAMEJ analizy (zero dodatkowych zapytań/kosztu) — nowe
  pole "title" w schemacie odpowiedzi.

**Zmiany w `analyze/index.ts`:**
1. Nowa sekcja "TYTUŁ" w `buildSystemPrompt()` (i bullet w "Zasady") —
   3-8 słów, w języku wyniku, opisuje TEMAT treści (jak nagłówek
   artykułu), WPROST zakazane słowa oceniające ("manipulacja", "uważaj",
   "fałsz" itd. — ten sam duch co sekcja NEUTRALNOŚĆ) z jawnym złym
   przykładem ("Manipulacyjny artykuł o..." — to ocena, nie temat).
2. Nowe pole `title: { type: 'string' }` w `RESPONSE_SCHEMA` i
   `DETECTION_RESPONSE_SCHEMA` (wymagane) — celowo UMIESZCZONE PO
   `patterns`/`summary` w kolejności schematu (Gemini wypełnia pola po
   kolei), żeby model najpierw przetrawił całą treść i własne
   podsumowanie, zanim napisze zwięzły tytuł — dokładnie ten sam
   mechanizm co "reasoning_steps na początku" z POPRAWKI 2026-08-20(c),
   tylko w drugą stronę (tu chcemy tytuł NA KOŃCU, nie na początku).
3. `fetchUrlAsText()` zwraca teraz `{ text, title }` zamiast samego
   tekstu (title = `article.title` z Readability, przycięty do 200
   znaków, bez prób obcinania nazwy serwisu z końca — zbyt ryzykowne,
   zależne od strony). Oba miejsca wywołania (`maybeRecheckLinkFreshness`,
   główna gałąź "url") zaktualizowane.
4. Dla linku z własnym, udanym pobraniem: `result.title` NADPISYWANY
   prawdziwym tytułem strony zaraz po sparsowaniu odpowiedzi Gemini —
   tytuł od AI zostaje WYŁĄCZNIE gdy własne pobranie nie dało tytułu albo
   to ścieżka awaryjna (Gemini "URL context", nigdy własnego pobrania).
5. `translateResult()` — "title" dopisany do listy tłumaczonych pól
   (razem z name/explanation/tip/stakes/summary) — działa automatycznie,
   bo funkcja już używa `RESPONSE_SCHEMA` (teraz z "title") jako domyślny
   schemat.
6. **Brak nowej kolumny/migracji SQL** — "title" to nowy klucz WEWNĄTRZ
   istniejącego jsonb `scans.result` (dokładnie tak jak "summary"/
   "q_score"), nie osobna kolumna — płynie przez cache/tłumaczenia/scalanie
   bez żadnych dodatkowych zmian w bazie.
7. Stare analizy sprzed tej zmiany NIE mają pola "title" (brak
   backfillu) — każde miejsce, które go czyta, ma fallback na starą
   metodę (patrz frontend niżej).

**Zmiany w `style.css` (naprawa ucinania — dotyczy WSZYSTKICH list w
całej aplikacji, nie tylko `historia.html`):** `.scan-row-snippet`
(dawniej `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`
— stąd "Polisa-400-0681903.pdf · 28 sie 2026, 1...") zamieniona na
`display: flex; flex-direction: column;` z dwoma nowymi klasami:
`.scan-row-title` (zawija się w pełni, `overflow-wrap: break-word`) i
`.scan-row-date` (mniejsza, osobna linia pod spodem). `min-width: 0` na
`.scan-row-snippet` jest konieczne — bez tego flex-item nie pozwala
tekstowi się zawinąć. Nowa klasa `.scan-list-scroll` (`max-height: 320px;
overflow-y: auto`) do pionowego przewijania list per typ w
`historia.html` — właściciel wprost potwierdził kierunek PIONOWY, nie
poziomy/karuzelę.

**Zmiany w `index.html` (lista publiczna "Wyszukaj analizę"):**
1. Wiersz listy pokazuje teraz `result.title` (z fallbackiem na starą
   metodę cytatu dla analiz bez pola "title") jako tytuł ORAZ osobną linię
   z datą analizy (`scanDateFmt`, dawniej data nigdzie nie była pokazywana
   na tej liście — "przydałyby się daty", zgłoszenie właściciela).
2. Filtr wyszukiwania (`request.or(...)`) rozszerzony o
   `result->>title.ilike...` (obok istniejących `source_quote`/
   `summary`) — teraz szuka DOKŁADNIE w tym, co pokazuje jako tytuł,
   zamiast w innych, rzadko wypełnionych polach.

**Przebudowa `historia.html` ("Twoje prywatne analizy"):**
1. Trzy OSOBNE karty (`.card`) zamiast jednej wspólnej z sekcjami — PDF-y
   / Obrazy / Prywatne teksty, każda z licznikiem `(N)` w nagłówku, każda
   chowana całkowicie, gdy pusta.
2. JEDEN wspólny pasek wyszukiwania nad kartami (`#historySearch`,
   pokazywany dopiero gdy jest cokolwiek do przeszukania) — filtruje
   WSZYSTKIE trzy typy naraz, każdy niezależnie, po stronie klienta
   (debounce 150ms) — bez kolejnego zapytania do bazy przy każdym
   wciśniętym znaku. Limit zapytania do Supabase podniesiony ze 100 do
   300 wierszy, żeby wyszukiwarka miała w czym szukać (limit
   WYŚWIETLANIA zostaje 20/typ, ale trzeba pobrać więcej niż 20, żeby
   filtrowanie miało sens).
3. Etykieta "Prywatne teksty" używa teraz `result.title` (z fallbackiem na
   starą metodę — fragment `text_content` — dla analiz sprzed tej
   zmiany).
4. Limit **20 wyników na typ, zawsze** (i bez wyszukiwania, i w trakcie)
   — świadomy wybór (nie tylko dla wyszukiwania), ta sama zasada co
   publiczna lista na stronie głównej. Gdy wyszukiwanie zwęzi listę,
   licznik pokazuje `(pasujące/wszystkie)`, np. `(3/47)`.
5. Każda karta dostała własną, pionowo przewijaną listę
   (`.scan-list-scroll`, maks. 320px wysokości) zamiast jednej długiej,
   nieograniczonej listy.

**Nowe klucze i18n (10 języków)**: `history_search_placeholder`,
`history_no_match`.

Weryfikacja: `node --experimental-strip-types --check` dla
`analyze/index.ts` oraz `node --check` dla wyciągniętych osobno skryptów
inline z `index.html`/`historia.html` (i `i18n.js` wprost) — wszystko
czyste. `tsc --noEmit --skipLibCheck` — te same znane błędy środowiskowe
co zawsze, nic nowego.

**POPRAWKA 2026-08-28(i) — responsywność na dużym ekranie (PC/laptop).**
Właściciel zgłosił, że na telefonie aplikacja wygląda dobrze, ale na
komputerze panel jest "bardzo wąski", co ogranicza czytelność. Przyczyna:
`style.css` celowo nie miało ŻADNYCH `@media` (patrz notatka w sekcji
"Zasady współpracy" niżej) — `.card`/`.result-card` mają sztywny
`max-width: 400px`, zaprojektowany pod telefon, więc na szerokim ekranie
zostaje wyśrodkowana, wąska kolumna z dużą ilością pustego miejsca po
bokach. Właściciel poprosił na start WYŁĄCZNIE o poszerzenie panelu (nie
pełny redesign na wielokolumnowy układ pulpitowy — to zostało nazwane
jako możliwa, osobna, poważniejsza opcja na później).

**Naprawa** (`style.css`): pierwszy w całym projekcie `@media (min-width:
700px)` — podnosi `max-width` `.card`/`.result-card`/(nowej) `.card-stack`
do 640px WYŁĄCZNIE na ekranach szerszych niż próg; telefon (poniżej
progu) zostaje dosłownie bez jednej zmienionej linii. Nowa klasa
`.card-stack` (pionowy stos kilku kart pod sobą, patrz `historia.html`) —
wydzielona z inline'owego stylu, żeby też reagowała na tę samą regułę
`@media`. Przy okazji usunięte inline'owe `style="max-width:400px"` /
`"max-width:480px"` na głównych kartach w `scan.html`, `account.html` i
`historia.html` — inline styl ZAWSZE wygrywa z regułą w arkuszu stylów
(nawet wewnątrz `@media`), więc te nadpisania blokowałyby nową
responsywność, gdyby zostały. Teraz wszystkie strony korzystają z tej
samej, współdzielonej reguły szerokości.

Weryfikacja: `node --check` dla wyciągniętych skryptów inline z
`index.html`/`historia.html`/`account.html`/`scan.html` — bez błędów.
Czysto wizualna zmiana CSS/HTML, bez zmian w backendzie — nic do wklejenia
w Supabase.

## Audyt systemowy — główny wyłącznik ("organizm") — dodane 2026-08-21

Po pełnym audycie MVP wg inżynierii systemowej (stocki, przepływy, sprzężenia
zwrotne — patrz rozmowa z 2026-08-21) ustalono, że NAJWAŻNIEJSZYM
priorytetem jest hierarchiczny system awaryjnego zatrzymywania, na wzór
organizmu: jeden główny wyłącznik dla całego systemu, sprawdzany jako
absolutnie pierwsza rzecz w `analyze/index.ts` — zanim cokolwiek innego się
wydarzy. Docelowo (NIE zbudowane jeszcze) mają dojść węższe, "podwyłączniki"
dla mniejszych części systemu (np. tylko rejestracja/maile) — na razie
Etap 1 dotyczy WYŁĄCZNIE `analyze` (jedyne miejsce z prawdziwym kosztem i
prawdziwym ryzykiem finansowym — reszta systemu jest darmowa).

**Filozofia**: fail-open na SAMYM sprawdzeniu wyłącznika (błąd odczytu
`system_status`/`system_thresholds` nie blokuje analizy — awaria KONTROLI
nie może stać się nowym powodem przestoju), ale fail-CLOSED, gdy wyłącznik
jest jawnie zgaszony. System wyłącza się automatycznie sam (żeby chronić,
gdy właściciela nie ma przy komputerze), ale **włączyć z powrotem może
WYŁĄCZNIE właściciel, ręcznie**, po sprawdzeniu, co się stało — automatyczne
wyłączanie nigdy nie ocenia samo, czy już naprawdę bezpiecznie wrócić do
działania.

**Co się dzieje, gdy KTÓRAKOLWIEK z reguł niżej się spełni** (bez wyjątków):
system zatrzymuje się natychmiast dla WSZYSTKICH, TO JEDNO zapytanie, które
akurat wywołało regułę, też nic nie dostaje (żadnego wyniku, żadnego
obciążenia — świadoma decyzja: nie wiadomo, czy to zapytanie samo w sobie
nie jest przyczyną problemu, np. wyjątkowo kosztownym plikiem), do
właściciela (`REPORT_RECIPIENT_EMAIL`, ten sam adres co raport dzienny)
leci natychmiastowy mail z dokładnym powodem, a każdy użytkownik widzi
spokojny komunikat w SWOIM języku (i18n.js, klucz `err_system_paused`) —
nie po polsku na sztywno. Jeśli po zbadaniu sprawy okaże się, że zatrzymanie
tego jednego zapytania było niesprawiedliwe (błąd był po naszej stronie, nie
podejrzana próba) — właściciel poprawia ręcznie zapis w historii tej osoby;
to NIE jest zautomatyzowane.

**Wdrożone reguły (Etap 1, `analyze/index.ts`)** — dwie grupy:

Grupa A — księgowość, ZERO tolerancji (sprawdzenie dokładne, bez progów do
zgadywania), sprawdzane przy każdej próbie naliczenia/odjęcia kredytów
(funkcje `chargeCredits()` i sprawdzenie tuż przed sekcją "6. ZAPIS WYNIKU
DO CACHE'U"):
1. Zrobiono analizę (nie z cache'u), ale próbowano naliczyć kredyty bez
   zalogowanego konta/profilu — nie powinno się zdarzyć strukturalnie, to
   dodatkowe zabezpieczenie na wypadek przyszłego błędu.
2. Odjęcie kredytów niepotwierdzone przez bazę (błąd zapisu `UPDATE`
   `profiles`, zwrócone saldo inne niż oczekiwane, albo błąd zapisu do
   `wallet_transactions`) — dawniej te błędy były CICHO ignorowane (kod nie
   sprawdzał `error`/wyniku `UPDATE` w ogóle).
3. Saldo użytkownika wyszło na minus po odjęciu.
4. Naliczona liczba kredytów (`cost`) nie zgadza się z tym, co niezależnie
   przelicza `computeExpectedCost()` wg tego samego wzoru cennika, dla
   danego typu treści.
5. **Rozliczenie konta**: saldo musi zawsze DOKŁADNIE równać się
   `INITIAL_WALLET_BONUS` (20, musi być zgodne z DEFAULT kolumny
   `profiles.wallet_balance`) plus suma WSZYSTKICH wierszy tego konta w
   `wallet_transactions`. **WAŻNE — zapamiętać przy budowie systemu
   płatności**: gdy powstaną prawdziwe zakupy pakietów, ta reguła musi
   zostać rozszerzona o porównanie z historią zakupów (`package_purchases`),
   żeby dalej być prawdziwie "absolutnym" zabezpieczeniem księgowości.
   **WAŻNE — ręczne korekty**: jeśli KIEDYKOLWIEK poprawiasz komuś saldo
   bezpośrednio w Supabase Table Editor, dopisz też odpowiadający wiersz w
   `wallet_transactions` (np. `type: 'manual_adjustment'`) — inaczej ta
   reguła niesłusznie zatrzyma cały system.

**Reguła D13 (dodana 2026-08-23, punkt D pakietu poprawek "przejrzystość
kosztów + integralność PDF")** — TA SAMA powaga/zero tolerancji co grupa A
wyżej, mimo że sprawdzana osobno w sekcji analizy PDF, zaraz po zebraniu
wzorców ze wszystkich części dokumentu, PRZED zapisem do cache'u: jeśli
numer strony (`page`) jakiegokolwiek wykrytego wzorca PRZEKRACZA
rzeczywistą, niezależnie policzoną (pdf-lib) liczbę stron pliku —
natychmiastowe zatrzymanie systemu, bez obciążenia zapytania, które to
wykryło. Patrz POPRAWKA 2026-08-23(a), punkt D, po pełne uzasadnienie
(w tym pułapkę z fragmentami książek, gdzie WIDOCZNY numer strony w treści
nie jest tym samym co jej fizyczna pozycja w pliku).

Grupa C — skala i jakość (progi liczbowe w `system_thresholds`, startowe
zgadywanki do skorygowania na realnych danych produkcyjnych), sprawdzane w
`logSystemIncident()`, wywoływanej OBOK (nie zamiast) istniejącego
`logFailedAttempt()` przy każdej prawdziwej awarii (nie przy zwykłym
"trzeba potwierdzić koszt PDF-a" — to nie jest awaria):
6. **Konsekwentne porażki bez sukcesu między nimi** (domyślnie 50) — liczone
   NIE w sztywnym oknie czasowym, tylko jako "ile wpisów w
   `system_incident_log` powstało od ostatniej NOWEJ analizy zapisanej do
   `scans`" — dzięki temu reguła działa identycznie przy dużym i przy
   znikomym ruchu, bez potrzeby trzymania osobnego, mutowalnego licznika.
7. **Odsetek błędów w krótkim oknie** (domyślnie 3% w 15 min), liczony
   DOPIERO gdy w oknie było wystarczająco dużo prób (domyślnie 20 —
   inaczej 1 błąd na 2 próby wyglądałby jak "50% katastrofa"). "Sukces" =
   NOWA analiza zapisana do `scans` — świadomie NIE liczymy trafień w
   cache (nic nie mówią o tym, czy Gemini/nasz kod aktualnie działają, i
   mogłyby ukryć prawdziwą awarię przy dobrym ruchu na już-zapisanych
   treściach). Reguły 6 i 7 NIE blokują się wzajemnie — działają
   niezależnie i równolegle, uzupełniają się: 6 szybciej złapie awarię przy
   dużym ruchu (dużo błędów naraz), 7 szybciej złapie awarię przy małym
   ruchu (mało zapytań, ale proporcjonalnie prawie wszystkie padają) —
   razem dają najszybsze możliwe wykrycie przy KAŻDYM poziomie ruchu.
9. **Nieprawidłowe/bezużyteczne odpowiedzi od Gemini** (domyślnie 5 w 10
   min) — odpowiedź technicznie przyszła, ale nie da się jej sparsować jako
   JSON albo brakuje wymaganych pól (`patterns`/`q_score`) — sygnał, że
   dostawca AI mógł coś zmienić po swojej stronie, nie zwykły błąd sieci.
   Świadomie sprawdzane w PEŁNI TYLKO na głównej ścieżce tekst/link
   (najważniejszy, najbardziej reprezentatywny punkt) — ścieżki obraz/PDF
   mają WŁASNE, już wcześniej istniejące sprawdzenia kształtu odpowiedzi w
   `analyzeImageChunk()`/`analyzePdfChunk()` (liczą się do reguł 6/7 jako
   zwykły `gemini_error`, ale nie są osobno tagowane jako
   `malformed_response` — nie było potrzeby dublować już istniejącej
   ochrony).

**Etap 2 (dodane 2026-08-21, wdrożone) — reguły A8/A10, prawdziwy koszt
Gemini**: mierzone we WSZYSTKICH ~12 miejscach wywołania Gemini w kodzie
(główna analiza, kategoryzacja, tłumaczenie, druga runda szukania wzorców,
weryfikacja/scalanie PDF i obrazu, każdy fragment PDF-a osobno, każdy obraz
osobno, ratunkowa ścieżka "URL context") — Gemini sam mówi, ile "zużył"
(`usageMetadata` w każdej odpowiedzi), więc `callGemini()` samo przelicza to
na dolary (`computeGeminiCostUsd()`, stałe `GEMINI_INPUT_PRICE_PER_MILLION_USD`/
`GEMINI_OUTPUT_PRICE_PER_MILLION_USD`) i dopisuje do współdzielonego
`CostTracker` (`{ totalUsd: number }`), przekazywanego przez WSZYSTKIE
funkcje pomocnicze wywołujące Gemini aż do samego `Deno.serve`.
**Świadoma decyzja z właścicielem 2026-08-21: liczymy WYŁĄCZNIE w dolarach
(USD)** — "globalna waluta", zero przeliczeń kursowych, zero zewnętrznych
zależności walutowych.
8. **Koszt jednego zapytania** (`costTracker.totalUsd`, suma WSZYSTKICH
   wywołań Gemini w obrębie TEGO JEDNEGO zapytania użytkownika) nie może
   przekroczyć `system_thresholds.single_request_cost_limit_usd`
   (domyślnie $6.25 — 5% dziennego budżetu). Sprawdzane PRZED zapisem do
   cache'u, tuż po regułach 1/4.
10. **Dzienny budżet w USD**, wszyscy użytkownicy razem —
    `system_thresholds.daily_budget_usd` (ustalone z właścicielem: **$125
    dziennie, do podniesienia, gdy projekt się rozrośnie**). Suma dnia żyje
    w nowej tabeli `system_daily_spend` (`spend_date` data jako klucz,
    `total_usd`) — jeden wiersz na dzień **czasu polskiego** (Europe/Warsaw,
    nie UTC — patrz POPRAWKA 2026-08-21(t) przy opisie tabeli wyżej), więc
    licznik "resetuje się" sam o północy każdego nowego dnia, bez żadnego
    zadania cyklicznego ani ręcznej interwencji.

Obie reguły, tak jak wszystkie pozostałe: natychmiastowe zatrzymanie dla
wszystkich, TO JEDNO zapytanie też nic nie dostaje, mail do właściciela,
komunikat w języku użytkownika, włączenie z powrotem wyłącznie ręczne.

## Cennik (do skalibrowania na realnych danych — na razie przybliżenia)

- **DO ROZWAŻENIA przy następnym przeglądzie cennika (zanotowane
  2026-08-26, właściciel poprosił zapisać na później, NIE decydować
  teraz)**: rosnące koszty AI (POPRAWKA (r) — biblioteka modeli mentalnych
  urosła ~102%, z realnym wpływem na marżę rzędu ~10% przychodu na
  najtańszych, minimalnych analizach — patrz wyliczenia w rozmowie
  2026-08-26; do tego dochodzi ewentualna nowa weryfikacja wyboru modelu)
  — właściciel wprost: "musimy określić czy nie podnieść stawki obecnych
  kosztów kredytowych za analizy ze względu na rosnące koszty, oraz
  mniejsze rabaty na pakietach, bo mocno nas trafiają." Czyli przy
  następnym ustalaniu wartości kredytów/cennika rozważyć: (1) podniesienie
  `FIXED_FEE`/`MULTIPLIER_PER_1000_CHARS` (obecnie 2 i 1), (2) zmniejszenie
  rabatów na pakiecie Średnim/Dużym (obecnie -24%/-44,4% względem
  pakietu Małego, patrz tabela niżej) — bo to właśnie duże, mocno
  zrabatowane pakiety najbardziej obniżają cenę za kredyt (do $0,00556),
  więc to na nich rosnący koszt AI najmocniej "zjada" marżę.
- **USTALONE 2026-08-26 — docelowy poziom marży: 88-95%.** Odpowiedź na
  notatkę wyżej — po przeliczeniu okazało się, że kierunek problemu jest
  ODWROTNY niż się wydawało: to nie rosnące koszty AI zagrażają marży (te
  zostają w granicach grosza nawet przy planowanej hierarchii dla PDF-a,
  patrz niżej), tylko **PDF jest dziś przeceniony dla użytkownika**
  względem realnego kosztu — 160-stronicowy PDF kosztuje klienta 1280
  kredytów (ok. $7-13), a realny koszt AI to ~$0,25, czyli marża
  96-98%. Właściciel wprost: "wydaje mi się po prostu że 1280 to za
  dużo" — ustalił **88-95% jako docelowy, akceptowalny poziom marży**
  (nie sufit do maksymalnego wykorzystania na koszty architektury, tylko
  punkt odniesienia przy ustalaniu CEN dla użytkownika — im niższa cena
  w tym przedziale marży, tym lepiej dla klienta, ale nie schodzimy
  poniżej niego).

  **Konkretna decyzja dla PDF-a**: nowa cena celuje w ok. **400 kredytów
  za 160-stronicowy PDF** (zamiast dzisiejszych 1280) — to nie przypadkowa
  liczba, tylko w przybliżeniu to, co dałby TEN SAM wzór co dla tekstu
  (`FIXED_FEE + znaki/1000 × MULTIPLIER`) przy typowej gęstości ~2500
  znaków/stronę. Przy koszcie ~$0,25 to wciąż 88,7-93,8% marży, zależnie
  od pakietu — mieści się w ustalonym przedziale.

  **Nie zaimplementowane jeszcze** — to ustalony KIERUNEK i docelowa
  liczba, wymaga jeszcze: (1) sprawdzenia, czy da się realnie policzyć
  liczbę znaków w PDF-ie LOKALNIE (bez Gemini), zanim policzymy cenę —
  dziś `pdf-lib` służy do liczenia STRON, nie ekstrakcji tekstu, więc
  trzeba sprawdzić, czy/jak wyciągnąć prawdziwą liczbę znaków (albo
  zostać przy przybliżeniu opartym o liczbę stron, np. ustaloną, niższą
  stawkę kredytów/stronę zamiast dzisiejszego `PDF_PAGE_COST = 8`,
  odziedziczonego po cenie zdjęcia — realnego związku z kosztem PDF-a
  jako tekstu nigdy nie miało), (2) decyzji, czy stawka ma być płaska
  (kredyty/strona) czy oparta o rzeczywistą liczbę znaków jak w tekście.

  **Sprawdzone 2026-08-26 (testy w Node.js, poza produkcyjnym kodem) —
  wynik ekstrakcji tekstu z PDF-a lokalnie**: biblioteka `unpdf`
  (kandydatka, deklaruje zgodność z Deno/edge) poprawnie wyciągnęła
  prosty, wygenerowany programowo tekst angielski/ASCII i poprawną
  liczbę stron. **Nierozstrzygnięte, świadomie NIE potwierdzone**: (a)
  polskie znaki diakrytyczne (ą/ć/ę...) — test w tym kierunku natrafił
  na osobny problem przy TWORZENIU testowego PDF-a (standardowy font
  Helvetica nie umie ich zapisać), więc odczyt polskich znaków wciąż
  jest niezweryfikowany, nie potwierdzony jako działający; (b) zgodność
  z prawdziwym środowiskiem Deno (test był w Node.js, sandbox nie ma
  dostępu do żywego Supabase); (c) prawdziwe, "brudne" PDF-y (skany,
  wielokolumnowy tekst, PDF-y z Worda) — testowano tylko czysty tekst;
  (d) wydajność/czas przy dużych (100+ stron) plikach. **Decyzja
  właściciela**: przy niepewności dotyczącej cashflow/cennika zawsze
  sprawdzać/pytać, nie zgadywać (ustalone wprost 2026-08-26, patrz
  "Zasady współpracy" niżej) — dlatego na razie REKOMENDACJA to płaska,
  niższa stawka kredytów/stronę (bez nowej zależności, zero ryzyka
  błędnej ekstrakcji zaniżającej cenę), a prawdziwą ekstrakcję znaków
  przetestować dopiero na realnym, polskim PDF-ie od właściciela, zanim
  cokolwiek wdrożymy na tej podstawie.
- Tekst: `FIXED_FEE (2) + ceil(char_count / 1000) * MULTIPLIER (1)`.
- **Link** (od POPRAWKA 2026-08-23(a), punkt C): TEN SAM wzór co tekst,
  liczony od realnej liczby znaków strony — ale to wymaga NAJPIERW
  darmowego pobrania strony (`fetchUrlAsText()`), więc cena jest znana
  dopiero po tym kroku. Jeśli własne pobranie zawiedzie (np. strona wymaga
  JavaScriptu), zostaje stara, płaska stawka `URL_SCAN_COST = 6` jako
  uczciwy kompromis dla tej rzadkiej, awaryjnej ścieżki. Zawsze
  dwuetapowa zgoda (`needs_confirmation`/`confirmed`, ten sam wzorzec co
  PDF) — użytkownik widzi realną cenę PRZED obciążeniem. Analiza linku
  wymaga zawsze konta (nie ma trybu anonimowego dla linków, żeby ktoś nie
  wygenerował dużego kosztu API za darmo, podając link do ogromnej
  strony).
- Pierwszy skan anonimowy (tylko tryb tekstowy): darmowy do
  `ANONYMOUS_MAX_CHARS = 3000` znaków.
- **Obraz**: stawka `IMAGE_SCAN_COST = 8` **za każdy obraz z osobna**, tak
  jak link wymaga zawsze konta (brak trybu anonimowego). Od 2026-08-18
  można wybrać **więcej niż jeden obraz naraz** (do `MAX_IMAGES_PER_SCAN =
  6`, ta sama liczba musi się zgadzać w `index.html` jako
  `MAX_SELECTED_IMAGES` — jeśli zmieniasz limit, zmień w obu miejscach) —
  koszt to `IMAGE_SCAN_COST × liczba obrazów`. Limit rozmiaru pliku: **8 MB
  na obraz** + dodatkowy, ostrożny limit **20 MB łącznie**
  (`MAX_TOTAL_IMAGE_BYTES`) dla całego zestawu — oba egzekwowane PO OBU
  stronach (przeglądarka daje szybki komunikat, ale prawdziwe
  zabezpieczenie jest w backendzie — nigdy nie ufamy samej przeglądarce).
  Backend rozpoznaje prawdziwy typ pliku po jego zawartości (magiczne
  bajty na początku pliku — JPEG/PNG/GIF/WEBP), nie po tym, co deklaruje
  przeglądarka — ten sam wzorzec "zero zaufania" co przy `user_id` z body
  — sprawdzane dla KAŻDEGO obrazu z osobna. `content_hash` dla cache'u to
  hash CAŁEGO zestawu (konkatenacja hashów poszczególnych obrazów w
  kolejności wyboru, potem zahashowana ponownie) — inny zestaw albo inna
  kolejność to inna, osobno wyceniona analiza. Podglądy w `scan.html`
  (jednorazowe, z sessionStorage, nigdy nie trafiają na serwer) są tablicą,
  jedną na obraz.
  - **POPRAWKA 2026-08-19(e) — architektura wieloetapowa dla obrazów, ten
    sam mechanizm co PDF-owy chunking**: pierwotnie WSZYSTKIE obrazy z
    zestawu leciały w JEDNYM wspólnym zapytaniu do Gemini (bez taniego
    etapu kategoryzacji jak przy tekście/linku — nie ma z góry żadnego
    tekstu, po którym dałoby się zgrubnie wybrać kategorie), z jedną,
    wspólną listą wzorców, BEZ przypisania który wzorzec pochodzi z
    którego obrazu (świadoma decyzja z 2026-08-18 na rzecz prostoty). Na
    żywo zaobserwowano, że przy kilku obrazach naraz model skupiał się
    tylko na NAJBARDZIEJ RZUCAJĄCYM SIĘ W OCZY obrazie i ignorował resztę —
    nawet mimo wyraźnej instrukcji tekstowej wymuszającej sprawdzenie
    wszystkich. To dokładnie ten sam rodzaj problemu, co przy PDF-ach
    (patrz POPRAWKA 2026-08-19(c) niżej) — i naprawiono go tą samą metodą:
    KAŻDY obraz dostaje teraz WŁASNE, osobne, pełne zapytanie (**Etap 1**,
    `analyzeImageChunk()`), równolegle — model fizycznie nie ma jak
    pominąć żadnego na rzecz innego. Bonus: skoro wynik z każdego
    zapytania z definicji dotyczy JEDNEGO obrazu, przypisanie wzorca do
    konkretnego obrazu (`image_index`, analogicznie do `page` przy PDF-ie)
    wychodzi praktycznie za darmo — dopisywane deterministycznie w kodzie,
    nie zgadywane przez model. Moderacja niedozwolonej treści też jest
    teraz PER OBRAZ (mocniejsza niż wcześniej — nie może już "zgubić się"
    przy obrazie, którym model się mniej zainteresował); jeśli
    KTÓRYKOLWIEK obraz jest niedozwolony, cała próba nadal jest karana
    pełną, zsumowaną stawką, tak jak wcześniej. **Etap 2**
    (`verifyAndRefineImagePatterns()` + `composeImageSummary()`) scala
    wyniki wszystkich obrazów w jedną listę (usuwa duplikaty — ta sama
    treść mogła się powtórzyć na dwóch różnych obrazach, np. dwa zrzuty
    ekranu tej samej rozmowy), poprawia słabe uzasadnienia i pisze jedno
    wspólne podsumowanie — fail-open (błąd/timeout zwraca oryginalną listę
    zamiast wywalać analizę). Przy maks. `MAX_IMAGES_PER_SCAN` (6) wynikach
    do scalenia nie potrzeba osobnego trzeciego etapu jak przy PDF-ie
    (który mógł mieć nawet 20 kawałków) — Etap 2 sam pisze finalne
    podsumowanie. `q_score` liczony jako zwykła średnia z surowych wyników
    Etapu 1 (nie z listy po Etapie 2), tym samym uzasadnieniem co przy
    PDF-ie: ocena rzetelności nie zależy od tego, ile duplikatów akurat
    usunięto. Koszt: powtarza się tylko lista 100 modeli w promptcie
    (tekst, tani element) N razy zamiast raz — ten sam, już policzony
    wcześniej wzorzec kosztowy co przy PDF-owym Etapie 1 — realny wpływ na
    marżę jest pomijalny (grosze przy przychodzie liczonym w złotówkach).
- **USTALONE (2026-08-20) — finalny cennik pakietów kredytów do kupienia.**
  System płatności sam w sobie JESZCZE nie istnieje w kodzie (patrz niżej
  "Do dopisania w przyszłości") — to jest ustalona TARGETOWA cena do
  wdrożenia, gdy ten system powstanie, żeby się już nigdzie po drodze nie
  zgubiła:

  | Pakiet | Cena | Kredyty | Cena za 1 kredyt | Rabat vs pakiet Mały |
  |---|---|---|---|---|
  | Mały | 5 USD (~20 zł) | 500 | $0,01 (0,04 zł) | — (cena bazowa) |
  | Średni | 19 USD (~76 zł) | 2 500 | $0,0076 (0,0304 zł) | -24% |
  | Duży | 89 USD (~356 zł) | 16 000 | $0,00556 (0,0222 zł) | -44,4% |

  Uzasadnienie strategiczne: niska cena wejścia + hojna liczba kredytów w
  droższych pakietach ma usuwać "tarcie" przy decyzji o zakupie, żeby
  ludzie analizowali częściej i bez wahania — to napędza pętlę wzrostu:
  więcej analiz → szybciej rosnąca, publiczna baza treści (przewaga w
  wynikach wyszukiwania) → więcej nowych użytkowników trafiających z
  wyszukiwarki na już gotowe analizy → więcej kolejnych analiz. Przy
  marży rzędu 91-95% (koszt Gemini per analiza to ułamek grosza, patrz
  niżej) ta hojność nic realnie nie kosztuje, więc nie ma napięcia między
  "szybko zbudować przewagę" a "być rentownym".
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
  `style.css` (brakującą regułę `.gakori-backdrop` widać było jako
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
- **Pierwsze prawdziwe zadziałanie głównego wyłącznika (2026-08-23) —
  reguła 5 (rozliczenie konta) i ukryta, nieznana wcześniej luka w
  bazie.** Zaraz po wdrożeniu punktów 3-5 audytu bezpieczeństwa system
  sam się zatrzymał: `disabled_reason` = "Reguła 5: saldo konta nie
  zgadza się z historią transakcji" dla konta właściciela. Diagnoza
  (zapytanie SQL szukające WSZYSTKICH kont z niezgodnością salda —
  `SELECT p.id, p.wallet_balance, SUM(wt.amount)... HAVING ...`, patrz
  wzór w historii sesji) pokazała różnicę 4382 kredytów — dokładnie
  scenariusz, przed którym ostrzegaliśmy w opisie reguły 5: konto
  właściciela było wielokrotnie ręcznie doładowywane w Supabase Table
  Editor podczas testowania appki, bez odpowiadających wpisów w
  `wallet_transactions`. **System zadziałał poprawnie** — złapał prawdziwą
  niezgodność (nieszkodliwą, ale realną), zgodnie z zamierzeniem.
  Naprawa: jeden wyrównujący wpis w `wallet_transactions`
  (`type: 'manual_adjustment'`, kwota = różnica), potem ręczne włączenie
  `system_status.analyze_enabled` z powrotem — dokładnie procedura opisana
  w "Audyt systemowy" wyżej.

  **Przy okazji złapane, osobna, prawdziwa usterka**: próba wpisania
  `manual_adjustment` odsłoniła, że kolumna `wallet_transactions.type` ma
  ograniczenie (`CHECK`, `wallet_transactions_type_check`) z ZAMKNIĘTĄ
  listą dozwolonych wartości (`welcome_bonus`, `purchase`, `spend`,
  `discovery_bonus`, `refund`) — i na tej liście od początku BRAKOWAŁO
  `unsafe_content_penalty`, mimo że `analyze/index.ts`
  (`respondUnsafeContent()`) od dawna próbuje wstawiać transakcje właśnie
  tego typu! Ten błąd nigdy nie został zauważony, bo prawdziwa kara za
  niedozwoloną treść na obrazie jeszcze się w praktyce nie zdarzyła —
  dopiero by się ujawnił przy pierwszym realnym przypadku, i to w
  najgorszy możliwy sposób (błąd zapisu W TRAKCIE karania kogoś za
  złamanie zasad). Naprawione razem z dodaniem `manual_adjustment`:
  ```sql
  ALTER TABLE wallet_transactions DROP CONSTRAINT wallet_transactions_type_check;
  ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check
    CHECK (type = ANY (ARRAY[
      'welcome_bonus'::text, 'purchase'::text, 'spend'::text,
      'discovery_bonus'::text, 'refund'::text,
      'manual_adjustment'::text, 'unsafe_content_penalty'::text
    ]));
  ```
  **Wniosek na przyszłość**: każdy NOWY typ transakcji (`type`) dodawany w
  kodzie (`analyze/index.ts` albo gdziekolwiek indziej) musi być od razu
  dopisany też do tego ograniczenia w bazie — sam kod nie wystarczy, baza
  ma z tyłu własną, niezależną listę dozwolonych wartości (ten sam wzorzec
  pułapki co z RLS/regułami `.eq()` opisanymi wyżej).

## Infrastruktura — własne domeny (USTALONE 2026-08-20)

Użytkownik kupił i skonfigurował dwie domeny (OVH), rozwiązując punkt
"własna domena", który wcześniej był na liście "świadomie odłożone":

- **`gakori.app`** — adres samej aplikacji (PWA). Podpięty jako "Custom
  domain" w GitHub Pages (plik `CNAME` w repo, 4 rekordy DNS `A` na adresy
  GitHub `185.199.108/109/110/111.153`, `www` jako `CNAME` na
  `areq93.github.io`). HTTPS wymuszony (Enforce HTTPS w ustawieniach
  GitHub Pages). Mail `support@gakori.app` to przekierowanie (OVH) na
  prywatny mail właściciela — nie prawdziwa skrzynka.
- **`gakori.com`** — zarezerwowana pod przyszłą, osobną stronę marki
  (jeszcze nie zbudowana, patrz zadanie w TODO). Mail `contact@gakori.com`
  — tak samo, przekierowanie na prywatny mail.
- **Cloudflare Turnstile** (captcha logowania/rejestracji, patrz sekcja
  "Logowanie" niżej) — hostname `gakori.app` dopisany do widżetu (obok
  starego `areq93.github.io`), secret key rotowany i zaktualizowany w
  Supabase (Authentication → Attack Protection → Captcha secret).
- **Brevo (wysyłka maili transakcyjnych)** — domena `gakori.app`
  uwierzytelniona w Brevo (rekordy DKIM ×2, DMARC, "Brevo code" TXT —
  żadnych konfliktów z istniejącym SPF/MX pod `@`, bo Brevo w tym wariancie
  configu NIE wymagał osobnego wpisu SPF). Branded subdomain `mail.gakori.app`
  (linki śledzące/obrazki w mailach pokazują teraz naszą domenę zamiast
  domeny Brevo). Nowy zweryfikowany nadawca `support@gakori.app` (nazwa
  "Zespół Gakori") zastąpił stary, niepoprawnie skonfigurowany nadawca
  oparty na prywatnym Gmailu (`BREVO_SENDER_EMAIL` w Supabase
  zaktualizowany) — to naprawiło brzydki, techniczny adres nadawcy
  (`...@NNNNN.brevosend.com`) widoczny wcześniej w skrzynkach odbiorców.

**Ryzyko przy zmianie nazwy repo/domeny (poznane na żywo)**: zmiana nazwy
repozytorium GitHub z `pragma` na `Gakori` (zrobiona przez właściciela w
panelu GitHub) automatycznie przekierowuje stary adres, więc nic się nie
psuje od razu — ale już zainstalowane ikonki PWA na telefonach
użytkowników (wskazujące na stary `start_url`/`scope`) mogą przestać
działać poprawnie i wymagać ponownej instalacji.

## Świadomie odłożone na później (nie budować bez wyraźnej prośby)

- **Własny, samodzielnie hostowany serwer z przeglądarką (np. Playwright na
  Fly.io/Railway) do pobierania stron wymagających JavaScriptu** —
  jedyna droga do pełnej, własnej kontroli nad analizą linków, które dziś
  kończą się `url_fetch_failed` (patrz "POPRAWKA 2026-08-21(b)" wyżej).
  Świadomie odłożone: to osobny projekt infrastrukturalny (koszt
  hostingu, utrzymanie, zabezpieczenie przed nadużyciem jako otwartego
  proxy), a nie dopisanie kawałka kodu — właściciel świadomie NIE chce
  też w międzyczasie zewnętrznej usługi trzeciej strony (np. gotowego
  "czytnika stron") w krytycznej ścieżce produktu, bo to ograniczałoby
  kontrolę biznesu. Wracać do tego tylko po wyraźnej prośbie, najlepiej
  gdy zbierze się więcej realnych przypadków linków, które dziś zawodzą.
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
- Analiza nagrań audio (np. podcastów) i wideo — potwierdzone 2026-08-19
  jako kierunek na PÓŹNIEJ, po PDF, nie teraz. Inna skala trudności/kosztu
  niż PDF: wymaga najpierw transkrypcji mowy na tekst (osobny, wyraźnie
  droższy krok niż analiza tekstu/obrazu), więc to osobny, większy projekt
  — nie rozszerzenie istniejącego flow "policz strony/obrazy, policz
  koszt". Nie zaczynać bez wyraźnej, osobnej prośby użytkownika.

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

- **DOKŁADNOŚĆ PRZY CASHFLOW — SPRAWDZAJ LUB PYTAJ, NIGDY NIE ZGADUJ
  (ustalone wprost 2026-08-26).** Cytat wprost: "jak musisz coś bardzo
  dokładnie zweryfikować dla cashflow żeby nie popełnić błędu
  księgowości, to sprawdzaj lub pytaj, a ręcznie wykonam pracę i razem
  dojdziemy do złotego punktu." W praktyce: przy każdej liczbie, która
  wpływa na realny przychód/koszt/cennik (nie tylko architekturę) —
  zanim się na niej oprze rekomendację, albo (1) zweryfikować ją realnym
  testem/sprawdzeniem (tak jak test biblioteki do ekstrakcji tekstu z
  PDF-a, patrz "Cennik" niżej — sprawdzone, co działa, a co pozostaje
  niepewne, zamiast zakładać), albo (2) jawnie zapytać właściciela,
  zamiast przyjmować przybliżenie jako pewnik. Właściciel deklaruje
  gotowość do wspólnej, ręcznej weryfikacji (np. przesłania realnego
  pliku do przetestowania) — z tego korzystać zamiast zgadywać.
- **PODEJŚCIE ETAPOWE/HIERARCHICZNE JAKO STANDARD JAKOŚCI (ustalone wprost
  2026-08-26), dopóki nie znajdziemy lepszego.** Właściciel, po rozmowie o
  różnicach między architekturą tekstu/linku a PDF/obrazu, ustalił wprost:
  bez etapów i podejścia hierarchicznego nie dostaniemy analiz wysokiej
  jakości, a jakość jest naszym absolutnym priorytetem wobec odbiorców.
  Mniej więcej taki, orientacyjny zamysł kolejnych faz (NIE sztywny,
  obowiązkowy szablon do każdej zmiany — chodzi o KIERUNEK myślenia, nie
  o dosłowne 6 kroków za każdym razem): zbieranie → przesiewanie →
  sprawdzanie → konsolidacja → analizowanie → tworzenie raportu. W
  praktyce: przy projektowaniu/rozbudowie silnika analizy domyślnie
  rozważać rozbicie na etapy zamiast jednego, dużego zapytania robiącego
  wszystko naraz — to już sprawdzony wzorzec w tym kodzie (kaskada
  tekstu/linku, wieloetapowa architektura PDF-a/obrazu, patrz "Kaskada
  dwuetapowa" niżej) i ma pozostać domyślnym sposobem myślenia o
  jakości, nie wyjątkiem.
- **GAKORI TO PRESTIŻOWA MARKA (ustalone wprost 2026-08-20): aplikacja ma
  oferować jakość WIELOKROTNIE większą niż to, czego odbiorca się
  spodziewa i ile płaci za analizę.** To nie jest tanie, masowe narzędzie
  do odhaczenia — każda decyzja produktowa (jakość promptu, wygląd wyniku,
  ton komunikacji z użytkownikiem, sposób prezentowania wzorców) ma być
  oceniana przez pryzmat: "czy to buduje wrażenie prestiżu i realnej
  wartości, wyraźnie przewyższającej cenę?". To jest bezpośrednie
  uzasadnienie dla "NADRZĘDNY, STAŁY CEL" niżej (jakość analiz stale
  rośnie) i dla wszystkich POPRAWEK dotyczących jakości/tonu podpowiedzi —
  nie są to kosmetyczne poprawki, tylko realizacja tej samej, nadrzędnej
  zasady marki.
- **NADRZĘDNY, STAŁY CEL (ustalone wprost 2026-08-20): jakość wyników analizy
  ma być stale podnoszona — zawsze, bez końca, nie tylko "do pierwszej
  wystarczającej wersji".** Właściciel świadomie chce, żeby wykrywanie
  wzorców (liczba, trafność, różnorodność) było ciągle weryfikowane na
  żywych przykładach i poprawiane, nawet gdy formalnie "działa" — to nie
  jest jednorazowe zadanie z listy TODO, tylko stały priorytet przy każdej
  pracy nad silnikiem analizy (`analyze/index.ts`, `buildSystemPrompt()`,
  biblioteka modeli mentalnych). Konkretny, żywy przykład niedostatecznej
  jakości i pierwsza poprawka: patrz "POPRAWKA 2026-08-20(b) — Etap 3,
  druga runda szukania" w sekcji "Kaskada dwuetapowa" wyżej.
- **ZASADA PRACY WŁASNEJ (ustalone wprost 2026-08-20): "myślenie krok po
  kroku, wypisanie ryzyk każdego podejścia, dopiero potem finalna
  propozycja" — TA SAMA zasada, którą stosujemy w promptach dla Gemini
  (patrz "Chain of Thought"/`reasoning_steps` w sekcji "Kaskada
  dwuetapowa"), obowiązuje też w SAMEJ procedurze pracy nad tym projektem
  między asystentem a właścicielem, nie tylko w promptach dla AI.**
  Właściciel świadomie chce, żeby przed każdą nietrywialną propozycją
  (zmiana architektury, decyzja produktowa, coś z realnym kosztem/ryzykiem)
  asystent najpierw rozpisał tok rozumowania i możliwe ryzyka/kompromisy
  różnych podejść, a dopiero na końcu zaproponował konkretne rozwiązanie —
  nie odwrotnie.
- Właściciel nie jest programistą — tłumaczenia zawsze proste, po
  polsku, bez żargonu, z analogiami.
- Rozmowa prowadzona jest po polsku — nawet gdy treść w kodzie/UI jest
  po angielsku (np. domyślny język aplikacji), **rozmowa z użytkownikiem
  zawsze zostaje po polsku**, chyba że wyraźnie poprosi inaczej.
- Decyzje produktowe warto rozważać przez pryzmat myślenia systemowego
  (zasoby/przepływy, sprzężenia zwrotne wzmacniające i równoważące,
  "zawory bezpieczeństwa") — użytkownik świadomie przyjął tę ramę do
  podejmowania decyzji.
- **KAŻDA zmiana zwiększająca koszt/ryzyko finansowe MUSI mieć w tej samej
  turze rozważony/zbudowany mechanizm odcięcia (ustalone wprost
  2026-08-26, po tym jak właściciel zauważył, że dawno tego nie robiłem).**
  Cytat wprost: "zawsze musisz takie rzeczy rozważać na myśl sprzężeń
  zwrotnych w naszym systemie i tworzenia od razu możliwości odcięcia gdy
  wykryte będzie zagrożenie, dawno tego nie robiłeś a chciałem żebyś robił
  zawsze." W praktyce, przy KAŻDEJ propozycji dodającej nowe wywołanie
  Gemini/nowy koszt: (1) sprawdzić i jawnie potwierdzić, że koszt
  przechodzi przez współdzielony `costTracker` (patrz "Etap 2 — reguły
  A8/A10" niżej) — dzięki temu automatycznie łapie go już istniejący
  główny wyłącznik (reguła 8: $6,25/zapytanie, reguła 10: $125/dzień) bez
  budowania niczego nowego; (2) jeśli zmiana wprowadza NOWY rodzaj ryzyka,
  którego istniejące reguły 1-10 nie łapią (np. nowy typ pętli, nowy
  zewnętrzny zasób) — zaprojektować dla niego osobny próg/regułę w tej
  samej turze, nie "później"; (3) jeśli to zmiana kosztowa, ale nie
  ryzyko awarii (np. świadomy, zaakceptowany wzrost kosztu jak POPRAWKA
  (r) — biblioteka modeli), zadbać o WIDOCZNOŚĆ (raport/dashboard), a nie
  o twardy wyłącznik — "kill switch" jest dla ANOMALII, nie dla
  świadomie zaakceptowanego, zwykłego kosztu.
- **KOMPLETNOŚĆ WDROŻENIA (ustalone wprost 2026-08-20, po realnym
  incydencie): żadna zmiana nie jest "zrobiona", dopóki NIE działa na
  żywo u właściciela.** Właściciel nie ma jak sam sprawdzić, czy coś
  wymaga jeszcze wdrożenia, czy już działa — nie jest programistą i nie
  śledzi stanu gałęzi/repo. Incydent: frontend (`scan.html`/`style.css`,
  zwijane karty wzorców) trafił tylko na roboczą gałąź, NIE na `main`
  (z którego serwuje się gakori.app), więc mimo komunikatu "zmiana wdroży
  się sama" — nic się nie pojawiło, a właściciel nie miał jak tego
  wykryć. Wniosek, zasada na zawsze: (1) kończąc pracę nad czymkolwiek,
  co ma być widoczne u właściciela, doprowadzić WSZYSTKIE niezbędne kroki
  do końca w tej samej turze — łącznie z scaleniem do `main`, jeśli to
  gałąź, z której serwuje się produkcja — a nie tylko przygotować kod i
  założyć, że "wdroży się samo"; (2) jeśli mimo to zostaje jakiś krok,
  którego assystent NIE MOŻE wykonać sam (typowo: ręczne wklejenie do
  Supabase Dashboard, bo nie ma tu CLI/dostępu), podsumować to jako jasną,
  kompletną listę "co już działa" / "co jeszcze wymaga Twojej ręcznej
  akcji, i dokładnie jakiej" — nigdy nie zostawiać milczącego założenia,
  że coś "powinno" zadziałać.
- Zawsze podawaj **całą** zaktualizowaną zawartość plików wymagających
  ręcznego wdrożenia (backend, migracje SQL) — nie fragmenty/diffy.
- Po każdej większej zmianie: zaktualizuj ten plik (`GAKORI_CONTEXT.md`)
  w tym samym PR-ze, żeby nie stał się nieaktualny.
- **Gakori to przede wszystkim aplikacja mobilna (PWA)** — przy KAŻDEJ
  zmianie wizualnej/UI pilnuj responsywności na telefonach, nie tylko na
  desktopie/tablecie (użytkownik świadomie o to poprosił). W praktyce:
  `style.css` przez długi czas nie miało ŻADNYCH `@media` (celowo — układ
  jest płynny, jedna kolumna kart o ograniczonej `max-width`, co długo
  wystarczało), ale przy dodawaniu nowych elementów, zwłaszcza
  `position: fixed` (jak `#userMenuBtn`/`.credit-balance` w prawym
  górnym rogu), sprawdź w myślach (albo realnie, w narzędziach
  deweloperskich przeglądarki, w trybie widoku mobilnego) wąski ekran
  (~320-360px szerokości) — czy elementy się nie nachodzą, nie wychodzą
  poza ekran, tekst się nie przycina w nieczytelny sposób. POPRAWKA
  2026-08-28(i) dodała PIERWSZĄ regułę `@media (min-width: 700px)`
  (właściciel zgłosił, że panel na PC jest za wąski) — próg 700px jest
  świadomie WYŻSZY niż typowa szerokość telefonu w pionie, więc telefon
  (nawet duży, w trybie poziomym rzadko używanym w tej appce) zostaje bez
  zmian; jeśli w przyszłości dojdą kolejne `@media`, trzymaj się tego
  samego progu dla spójności, chyba że właściciel wyraźnie poprosi
  inaczej.
