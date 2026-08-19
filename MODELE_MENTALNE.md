# Encyklopedia 100 Modeli Mentalnych Gakori

Pełna lista 100 modeli mentalnych używanych przez silnik analizy Gakori
(`supabase/functions/analyze/index.ts`) do nazywania i wyjaśniania wzorców
wykrytych w analizowanej treści — nie tylko manipulacji, ale też trafnych,
wartościowych obserwacji (np. tekst poprawnie stosujący Brzytwę Ockhama).

Ten plik jest dokumentacją "dla ludzi" (pełne opisy, zastosowanie,
przykłady). Skrócona, techniczna wersja (tylko nazwa + jednozdaniowy opis,
do wstrzyknięcia w prompt) żyje w kodzie jako stała `MENTAL_MODELS` w
`supabase/functions/analyze/index.ts` — **jeśli zmieniasz jedno, zaktualizuj
drugie**, żeby nie rozjechały się między sobą.

## 1. Logika i Myślenie

**1. Brzytwa Ockhama** — Jeśli istnieją dwa wyjaśnienia danego zjawiska, to
najprostsze z nich (wymagające najmniejszej liczby założeń) jest zazwyczaj
poprawne. *Przykład: teoria spiskowa o smugach kondensacyjnych vs zwykła
zamarznięta para wodna.*

**2. Brzytwa Hanlona** — Nigdy nie przypisuj złej woli temu, co można
dostatecznie wyjaśnić głupotą lub błędem. *Przykład: opóźnienie premiery
uznane za "manipulację giełdową", choć wynikało z błędu w kodzie.*

**3. First Principles (Zasady Pierwsze)** — Rozbijanie problemu na jego
najbardziej podstawowe prawdy, zamiast wnioskowania przez analogię.
*Przykład: bateria o "nieskończonym zasięgu" oceniana przez pryzmat
fizycznej gęstości energii ogniw.*

**4. Mapa to nie Terytorium** — Model rzeczywistości (statystyka, opis) nie
jest samą rzeczywistością, tylko uproszczeniem. *Przykład: raport o
wzroście PKB ignorujący spadek realnej siły nabywczej.*

**5. Krąg Kompetencji** — Skupianie się na obszarach, które naprawdę
rozumiemy, unikanie udawania eksperta poza nimi. *Przykład: celebryta
polecający eksperymentalną terapię genową.*

**6. Inwersja** — Rozwiązywanie problemów przez patrzenie na nie "od
końca": zamiast "jak wygrać", pytamy "czego unikać, żeby nie przegrać".
*Przykład: analiza "gwarantowanego zysku 20%" — co musiałoby się stać,
żeby system upadł?*

**7. Prawdopodobieństwo Bayesowskie** — Aktualizacja prawdopodobieństwa
zdarzenia w oparciu o nowe dowody. *Przykład: pierwsza informacja o
katastrofie vs dane z czarnych skrzynek.*

**8. Eksperyment Myślowy** — Badanie konsekwencji teorii w wyobraźni.
*Przykład: "gdyby każdy postąpił jak autor tej porady, co stałoby się z
rynkiem?"*

**9. Myślenie II Rzędu** — Rozważanie nie tylko bezpośrednich skutków
działania, ale i skutków tych skutków. *Przykład: dopłaty do mieszkań (I
rząd: taniej dla kupujących; II rząd: wzrost cen przez wyższy popyt).*

## 2. Fizyka

**10. Entropia** — Wszystkie układy dążą do nieładu, chyba że dostarczymy
im energii. *Przykład: obietnica pasywnego dochodu bez zarządzania
reklamami i towarem.*

**11. Względność** — Punkt widzenia zależy od układu odniesienia
obserwatora. *Przykład: artykuł o "stabilizacji regionu" napisany przez
stronę konfliktu.*

**12. Bezwładność (Inercja)** — Obiekty i organizacje mają tendencję do
kontynuowania obecnego stanu. *Przykład: wiara, że gigantyczna firma
zmieni model biznesowy w jeden kwartał.*

**13. Masa Krytyczna** — Ilość materiału potrzebna do podtrzymania reakcji
łańcuchowej (lub trendu). *Przykład: czy nowa sieć społecznościowa ma
wystarczająco użytkowników, by przetrwać (efekt sieciowy)?*

**14. Prędkość vs Szybkość** — Szybkość to tempo zmiany, prędkość to tempo
zmiany w konkretnym kierunku. *Przykład: startup z milionami wyświetleń,
ale zerowym przychodem.*

**15. Zasada Dźwigni** — Mała siła przyłożona w odpowiednim miejscu
pozwala podnieść wielki ciężar. *Przykład: jedna kluczowa zmiana nawyku
poprawiająca całe zdrowie.*

**16. Tarcie** — Siła przeciwdziałająca ruchowi; w biznesie wszystko, co
utrudnia zakup lub działanie. *Przykład: ukryty przycisk "usuń konto"
(dark pattern).*

## 3. Chemia

**17. Energia Aktywacji** — Minimalna ilość energii potrzebna do
rozpoczęcia reakcji. *Przykład: dlaczego większość ludzi nie zaczyna
ćwiczyć.*

**18. Katalizator** — Substancja przyspieszająca reakcję, sama nie ulegając
zużyciu. *Przykład: AI jako katalizator rozwoju automatyzacji marketingu.*

**19. Półokres Rozpadu** — Czas, po którym połowa substancji ulega
rozpadowi. *Przykład: kurs programowania oparty na martwych już
technologiach.*

**20. Entalpia (Hype)** — Całkowita energia/poziom ekscytacji wokół
tematu. *Przykład: nagły wzrost zainteresowania niszową kryptowalutą bez
fundamentów.*

## 4. Biologia

**21. Dobór Naturalny** — Przetrwanie najlepiej przystosowanych do
środowiska. *Przykład: platformy streamingowe wypierające wypożyczalnie
DVD.*

**22. Koewolucja** — Proces, w którym dwa gatunki wzajemnie wpływają na
swoją ewolucję (wyścig zbrojeń). *Przykład: filtry antyspamowe vs coraz
bardziej wyrafinowany phishing.*

**23. Homeostaza** — Zdolność układu do utrzymywania równowagi. *Przykład:
wiara w gospodarkę rosnącą 10% rocznie bez inflacji.*

**24. Nisza Ekologiczna** — Specyficzna rola i miejsce w ekosystemie.
*Przykład: "specjalista od reklam dla dentystów" zamiast "agencja dla
wszystkich".*

**25. Pasożytnictwo vs Symbioza** — Jeden korzysta kosztem drugiego, vs
obie strony korzystają. *Przykład: darmowa gra wymuszająca mikropłatności
co 5 minut.*

**26. Regresja do Średniej** — Po ekstremalnym wyniku kolejny prawdopodobnie
będzie bliższy średniej. *Przykład: "ta dieta pozwoliła mi schudnąć 5 kg w
2 dni".*

**27. Sygnalizacja (Signaling)** — Kosztowne sygnały wysyłane w celu
udowodnienia cechy. *Przykład: biuro w prestiżowej dzielnicy firmy bez
przychodów.*

## 5. Systemy i Inżynieria

**28. Pętle Sprzężenia** — Dodatnie (wzmacniające trend) lub ujemne
(hamujące trend). *Przykład: panika giełdowa (cena spada → ludzie
sprzedają → cena spada jeszcze bardziej).*

**29. Redundancja** — Posiadanie zapasowych systemów na wypadek awarii.
*Przykład: oszczędności na 6 miesięcy.*

**30. Wąskie Gardło** — Element systemu ograniczający jego całkowitą
przepustowość. *Przykład: szybki komputer, ale wolny internet.*

**31. Margines Bezpieczeństwa** — Pozostawienie marginesu na błąd lub
nieprzewidziane zdarzenia. *Przykład: dom kosztujący dokładnie tyle, ile
masz oszczędności — zero marginesu.*

**32. Antykruchość** — Stawanie się silniejszym w wyniku chaosu i stresu
(Nassim Taleb). *Przykład: system uczący się na każdym ataku hakerskim.*

**33. Modułowość** — Budowanie systemów z niezależnych części. *Przykład:
aplikacja, w której można wymienić bazę danych bez przepisywania
wszystkiego.*

**34. Prawo Moore'a** — Liczba tranzystorów w procesorze podwaja się co ok.
2 lata przy stałym koszcie. *Przykład: dlaczego nie warto kupować
najdroższego sprzętu dziś.*

## 6. Matematyka i Statystyka

**35. Rozkład Normalny (Krzywa Gaussa)** — Większość danych skupia się
wokół średniej. *Przykład: "wszyscy nasi kursanci zarabiają 20 tys. zł" —
statystycznie nieprawdopodobne.*

**36. Zasada Pareta (80/20)** — 80% efektów pochodzi z 20% przyczyn.
*Przykład: 20% słownictwa pozwala zrozumieć 80% rozmów w obcym języku.*

**37. Złożone Odsetki** — Efekt kuli śnieżnej — zysk dopisywany do
kapitału generuje kolejny zysk. *Przykład: 100 zł miesięcznie przez 30 lat
vs przez 5 lat.*

**38. Survivorship Bias (Błąd Przeżywalności)** — Skupianie się na tych,
którzy "przetrwali", ignorując tych, którzy zniknęli. *Przykład:
biografie miliarderów sugerujące, że rzucenie studiów gwarantuje sukces.*

**39. Istotność Statystyczna** — Czy wynik badania nie jest wynikiem
przypadku? *Przykład: "naukowcy odkryli, że kawa leczy raka" na próbie 5
osób.*

**40. Twierdzenie Graniczne** — Suma wielu niezależnych zmiennych losowych
dąży do rozkładu normalnego.

**41. Czarny Łabędź** — Zdarzenie o niskim prawdopodobieństwie, ale
gigantycznym wpływie (Taleb). *Przykład: pandemia COVID-19 dla turystyki.*

**42. Zasada Gołębnika** — Jeśli masz więcej gołębi niż dziur, w
przynajmniej jednej dziurze muszą być dwa gołębie (błędy w alokacji
zasobów).

## 7. Ekonomia

**43. Koszt Alternatywny** — Koszt wyboru jednej opcji mierzony utratą
korzyści z opcji odrzuconej. *Przykład: "jeśli kupisz ten kurs za 2000 zł,
nie pojedziesz na wakacje".*

**44. Bodźce (Incentives)** — "Pokaż mi bodźce, a pokażę ci wynik" (Charlie
Munger). *Przykład: dlaczego doradca poleca akurat ten fundusz — bo ma z
niego prowizję.*

**45. Sunk Costs (Koszty Utopione)** — Kontynuowanie nierentownego
działania tylko dlatego, że już zainwestowaliśmy w nie czas/pieniądze.
*Przykład: granie w nudną grę, bo kupiona za 200 zł.*

**46. Podaż i Popyt** — Cena zależy od dostępności towaru i chęci jego
zakupu.

**47. Przewaga Komparatywna** — Zdolność do wytwarzania dobra niższym
kosztem alternatywnym niż inni.

**48. Tragedia Wspólnego Pastwiska** — Indywidualne dbanie o własny
interes niszczy wspólne zasoby.

**49. Teoria Gier** — Analiza strategii w sytuacjach, gdzie wynik zależy od
decyzji innych (np. Dylemat Więźnia).

**50. Efekt Sieciowy** — Wartość usługi rośnie wraz z liczbą użytkowników
(np. telefon, Facebook).

**51. Malejące Przychody** — Kolejna jednostka nakładu daje coraz mniejszy
przyrost efektu. *Przykład: nauka 10h dziennie nie jest 10x lepsza niż 1h.*

**52. Asymetria Informacji** — Jedna strona transakcji wie więcej (np.
sprzedawca używanego auta).

**53. Arbitraż** — Wykorzystywanie różnic cen na różnych rynkach.

## 8. Psychologia

**54. Social Proof (Dowód Społeczny)** — Jeśli inni tak robią, to musi być
dobre. *Przykład: "najczęściej wybierany produkt" — przez ludzi czy przez
boty?*

**55. Confirmation Bias (Efekt Potwierdzenia)** — Ignorowanie faktów
sprzecznych z naszymi poglądami.

**56. Dysonans Poznawczy** — Dyskomfort wynikający z posiadania dwóch
sprzecznych przekonań.

**57. Efekt Halo** — Przenoszenie jednej pozytywnej cechy na cały obraz
osoby (np. ładny = mądry).

**58. Heurystyka Dostępności** — Ocenianie prawdopodobieństwa na podstawie
tego, jak łatwo przypominamy sobie przykład. *Przykład: strach przed
lataniem po filmie o katastrofie.*

**59. Warunkowanie** — Tworzenie powiązań między bodźcem a reakcją.
*Przykład: dźwięk powiadomienia = dopamina.*

**60. Dunning-Kruger** — Osoby o niskich kompetencjach przeceniają swoją
wiedzę, eksperci ją doceniają.

**61. Awersja do Straty** — Strata 100 zł boli bardziej niż cieszy
znalezienie 100 zł.

**62. Framing (Ramowanie)** — Zmiana decyzji w zależności od tego, jak
przedstawiono problem.

**63. Zasada Wzajemności** — Czujemy potrzebę odwdzięczenia się za darmowy
prezent/przysługę. *Przykład: "darmowy ebook" mający skłonić do drogiego
zakupu.*

## 9. Socjologia

**64. Liczba Dunbara** — Limit osób (ok. 150), z którymi jesteśmy w stanie
utrzymać stabilne relacje społeczne.

**65. Mądrość Tłumu** — Agregacja opinii wielu osób często daje wynik
bliższy prawdy niż opinia jednego eksperta.

**66. Dyfuzja Odpowiedzialności** — Im więcej świadków zdarzenia, tym
mniejsza szansa, że ktoś pomoże.

**67. Rdzeń-Peryferia** — Podział na dominujące centrum i zależne od niego
obrzeża.

**68. Kapitał Społeczny** — Wartość wynikająca z sieci relacji i zaufania.

**69. Zasada Petera** — W hierarchii każdy awansuje aż do osiągnięcia
własnego poziomu niekompetencji.

## 10. Filozofia i Etyka

**70. Imperatyw Kanta** — Postępuj tylko według takiej zasady, co do której
mógłbyś chcieć, aby stała się prawem powszechnym.

**71. Utylitaryzm** — Największe dobro dla największej liczby osób.

**72. Falsyfikacja Poppera** — Teoria jest naukowa tylko wtedy, gdy można
określić warunki, w których byłaby fałszywa. *Przykład: "wszystko dzieje
się z woli losu" — niefalsyfikowalne, więc nie jest to fakt naukowy.*

**73. Relatywizm Kulturowy** — Normy etyczne zależą od kultury.

**74. Epistemologia** — Nauka o tym, skąd wiemy, że coś wiemy — podstawa
krytycznego myślenia.

**75. Stoicyzm** — Skupianie się na tym, co zależy od nas, akceptacja tego,
co niezależne.

**76. Eudajmonia** — Stan rozkwitu i poczucia sensu (nie mylić z chwilową
przyjemnością).

**77. Primum non nocere** — "Po pierwsze nie szkodzić" — podstawowa zasada
medyczna i etyczna.

## 11. Strategia Wojskowa

**78. Wojna Asymetryczna** — Walka przeciwników o nierównym potencjale
(np. haker vs korporacja).

**79. Pyrrusowe Zwycięstwo** — Zwycięstwo osiągnięte tak dużym kosztem, że
w praktyce jest porażką.

**80. Dwa Fronty** — Walka z dwoma przeciwnikami jednocześnie prowadzi do
porażki.

**81. Hindsight Bias (Efekt Pewności Wstecznej)** — "Wiedziałem, że tak
będzie" (po fakcie).

**82. Spalona Ziemia** — Niszczenie wszystkiego, co mogłoby przydać się
wrogowi podczas odwrotu.

**83. Blitzkrieg** — Wojna błyskawiczna — szybkie uderzenie przed
mobilizacją wroga. *Przykład: agresywne kampanie marketingowe.*

## 12. Literatura i Język

**84. Narrative Fallacy (Błąd Narracji)** — Wrodzona potrzeba tworzenia
spójnych historii z faktów, które mogą być losowe.

**85. Semantyka** — Znaczenie słów i ich interpretacja; manipulacja
znaczeniami. *Przykład: "optymalizacja zatrudnienia" zamiast "zwolnienia".*

**86. Ironia Losu** — Wynik działania jest dokładnie odwrotny do
zamierzonego.

**87. Podtekst (Subtext)** — To, co nie zostało powiedziane wprost, ale
wynika z kontekstu.

**88. Archetypy** — Uniwersalne wzorce postaci i sytuacji (np. Bohater,
Mędrzec).

## 13. Informatyka

**89. GIGO (Garbage In, Garbage Out)** — Śmieci na wejściu = śmieci na
wyjściu; jakość decyzji zależy od jakości danych.

**90. Abstrakcja** — Ukrywanie skomplikowanych szczegółów za prostym
interfejsem.

**91. Złożoność Obliczeniowa** — Ile czasu/zasobów zajmie rozwiązanie
problemu.

**92. Deadlock (Zakleszczenie)** — Sytuacja, w której dwie strony czekają
na siebie nawzajem, blokując system.

## 14. Design

**93. Form Follows Function** — Wygląd obiektu powinien wynikać z jego
przeznaczenia. *Przykład: "pusty luksus", przerost formy nad treścią.*

**94. Złota Proporcja** — Proporcje uznawane za estetyczne.

**95. Afordancja** — Cecha przedmiotu sugerująca jego użycie (np. klamka
sugeruje naciskanie); w UX: intuicyjność lub manipulacja interfejsem.

## 15. Interdyscyplinarne

**96. Efekt Lindy'ego** — Im dłużej coś istnieje (niebiologicznego), tym
dłużej prawdopodobnie jeszcze będzie istnieć.

**97. Brzytwa Adlera** — Jeśli coś nie może zostać rozstrzygnięte przez
eksperyment lub obserwację, nie jest warte debaty.

**98. Prawo Parkinsona** — Praca rozszerza się tak, aby wypełnić czas
dostępny na jej ukończenie.

**99. Hanlon dla Systemów** — Rozszerzenie Brzytwy Hanlona na błędy w
złożonych systemach (biurokracji).

**100. Heurystyka Uznania** — Jeśli jedna z dwóch rzeczy jest
rozpoznawalna, uznajemy ją za ważniejszą/lepszą. *Przykład: manipulacja
"znanymi markami" oferującymi gorszy produkt.*
