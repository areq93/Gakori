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

**`scans`** (współdzielony cache analiz; publiczny odczyt w RLS dla
`text`/`url`/`image` — **`pdf` jest wyjątkiem, patrz RLS niżej i
`scan_access`**):
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
- `id`, `user_id`, `blocked_until`, `created_at`

**`scan_access`** (dodane 2026-08-19 — kto ma prawo zobaczyć dany PDF,
patrz "Prywatność PDF-ów" niżej):
- `id`, `scan_id` (FK do `scans.id`, `ON DELETE CASCADE`), `user_id` (FK do
  `auth.users.id`, `ON DELETE CASCADE`), `source_filename` (text, nullable —
  oryginalna nazwa pliku, TYLKO etykieta, nie wpływa na cenę/analizę),
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

RLS: `scans` ma publiczny odczyt dla `input_type <> 'pdf'` (używane przez
niezalogowanych w przeglądarce publicznych analiz i na `scan.html`). Dla
`input_type = 'pdf'` odczyt ma WYŁĄCZNIE ten, kto ma odpowiadający wiersz w
`scan_access` (`EXISTS (... WHERE scan_id = scans.id AND user_id =
auth.uid())`) — patrz "Prywatność PDF-ów" niżej po pełne uzasadnienie i SQL.
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
  `style.css` na razie nie ma żadnych `@media` (celowo — układ jest
  płynny, jedna kolumna kart o ograniczonej `max-width`, co dotąd
  wystarczało), ale przy dodawaniu nowych elementów, zwłaszcza
  `position: fixed` (jak `#userMenuBtn`/`.credit-balance` w prawym
  górnym rogu), sprawdź w myślach (albo realnie, w narzędziach
  deweloperskich przeglądarki, w trybie widoku mobilnego) wąski ekran
  (~320-360px szerokości) — czy elementy się nie nachodzą, nie wychodzą
  poza ekran, tekst się nie przycina w nieczytelny sposób.
