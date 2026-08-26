// Gakori — słownik tłumaczeń interfejsu i mechanizm przełączania języka.
// Pole "quote" w wynikach analizy AI NIE jest tłumaczone przez ten plik —
// to dosłowny cytat, który backend (analyze/index.ts) świadomie zostawia
// w oryginalnym języku analizowanego tekstu. Reszta wyniku AI (name,
// explanation, summary) jest generowana przez Gemini już w wybranym
// tu języku (patrz payload.language wysyłany do analyze).

// Posortowane alfabetycznie wg wyświetlanej nazwy (nie wg kodu ani "polski
// pierwszy") — to jedna, wspólna lista używana wszędzie, gdzie w interfejsie
// pojawia się wybór języka (ekran logowania, ustawienia konta), więc
// wystarczy posortować ją raz tutaj.
const SUPPORTED_LANGUAGES = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'pl', name: 'Polski' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
];

const RTL_LANGUAGES = ['ar'];

const TRANSLATIONS = {
    pl: {
        tab_login: "Zaloguj", tab_signup: "Zarejestruj",
        placeholder_email: "e-mail", placeholder_password: "hasło (min. 6 znaków)",
        btn_login: "Zaloguj się", btn_signup: "Zarejestruj się",
        link_forgot_password: "Zapomniałeś hasła?", divider_or: "— lub —",
        btn_google_login: "Zaloguj przez Google", btn_google_signup: "Zarejestruj przez Google",
        err_provide_credentials: "Podaj e-mail i hasło.",
        err_captcha_required: "Zaznacz pole \"nie jestem robotem\" powyżej.",
        status_please_wait: "Chwileczkę...",
        err_account_exists_login: "Konto z tym adresem e-mail już istnieje. Spróbuj się zalogować.",
        status_check_email: "Sprawdź skrzynkę e-mail i kliknij link potwierdzający, aby dokończyć rejestrację.",
        err_email_first: "Najpierw wpisz swój e-mail powyżej.",
        status_recovery_email_sent: "Wysłaliśmy link do odzyskania hasła na Twój e-mail.",
        status_email_may_be_delayed: "Z powodu dużego ruchu wysyłka maila może dziś chwilę potrwać — jeśli za jakiś czas nic nie zobaczysz, wróć tutaj i kliknij „Wyślij mail ponownie”.",
        btn_resend_email: "Wyślij mail ponownie",
        status_resend_sent: "Wysłaliśmy nowy mail — sprawdź skrzynkę.",
        err_google_account_exists: "Konto z tym adresem Google już istnieje. Zaloguj się zamiast rejestrować.",
        recovery_title: "Ustaw nowe hasło do konta:",
        placeholder_new_password: "nowe hasło (min. 6 znaków)", btn_set_new_password: "Ustaw nowe hasło",
        err_password_min: "Hasło musi mieć co najmniej 6 znaków.",
        recovery_success: "Hasło ustawione! Możesz teraz korzystać z aplikacji.",
        err_invalid_credentials: "Nieprawidłowy e-mail lub hasło.",
        err_email_not_confirmed: "Potwierdź adres e-mail — sprawdź skrzynkę i kliknij link, który wysłaliśmy.",
        err_invalid_email_format: "Nieprawidłowy format adresu e-mail.",
        err_captcha_generic: "Potwierdź, że nie jesteś robotem (zaznacz pole powyżej) i spróbuj ponownie.",
        account_aria_label: "Twoje konto", credit_balance_label: "Stan kredytów", account_back: "← Wróć do Gakori", account_title: "Twoje konto",
        loading: "Ładowanie...", account_logged_in_as: "Zalogowano jako:",
        btn_logout: "Wyloguj", link_change_password: "Zmień hasło", btn_save_password: "Zapisz nowe hasło",
        password_changed: "Hasło zmienione.",
        account_load_error: "Nie udało się wczytać danych konta (sprawdź połączenie z internetem i odśwież stronę).",
        language_label: "Język aplikacji",
        theme_label: "Motyw", theme_light: "Jasny", theme_dark: "Ciemny",
        username_label: "Nazwa użytkownika", btn_save_username: "Zapisz nazwę", username_saved: "Nazwa użytkownika zapisana.",
        username_cooldown_note: "Kolejną zmianę będzie można zrobić od: {date}",
        err_username_length: "Nazwa musi mieć od 2 do 24 znaków.", err_username_cooldown: "Nazwę można zmieniać tylko raz na 14 dni.",
        err_username_taken: "Ta nazwa jest już zajęta — wybierz inną.",
        err_username_forbidden: "Ta nazwa zawiera niedozwolone słowo — wybierz inną.",
        tab_link: "Link", tab_text: "Tekst", tab_image: "Obraz",
        label_paste_link: "Wklej link do analizy:", placeholder_url: "https://...",
        label_paste_text: "Wklej tekst do analizy:", placeholder_text_content: "Wklej treść, którą chcesz przeanalizować...", label_text_source_url_optional: "Opcjonalnie: link do źródła (doda się do wyniku):",
        label_choose_image: "Wybierz zdjęcie do analizy:", btn_choose_image: "Wybierz zdjęcie",
        btn_analyze: "Analizuj",
        analyze_label_url: "Analizuj stronę", analyze_label_text: "Analizuj tekst", analyze_label_image: "Analizuj obraz",
        status_analyzing: "Analizuję...",
        status_step_1: "Wysyłam treść do sprawdzenia...", status_step_2: "Sprawdzam, czy ktoś już to analizował...",
        status_step_3: "Rozpoznaję, jakich wzorców szukać...", status_step_4: "Czytam treść uważnie...",
        status_step_5: "Szukam konkretnych cytatów...", status_step_6: "Już prawie gotowe...",
        status_step_7: "Porównuję z biblioteką znanych wzorców...", status_step_8: "Sprawdzam kontekst każdego zdania...",
        status_step_9: "Oceniam, czy to manipulacja, czy rzetelne rozumowanie...", status_step_10: "Dobieram najtrafniejsze nazwy dla wykrytych wzorców...",
        status_step_11: "Układam wynik w czytelną formę...", status_step_12: "Ostatnie szlify...",
        alert_enter_link: "Wpisz link!", alert_paste_text: "Wklej jakiś tekst!", alert_choose_image: "Wybierz obraz!", alert_image_too_large: "Ten plik jest za duży (limit 8 MB).",
        status_err_prefix: "❌ Błąd: ",
        badge_manipulation: "Manipulacja: {score}/100", badge_clean: "Czysty tekst: {score}/100", badge_partial: "Częściowo: {score}/100",
        badge_info: "Info", result_generic_error: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
        err_signup_required: "Załóż konto, aby kontynuować.",
        err_insufficient_credits: "Nie masz wystarczająco kredytów na to.",
        err_url_fetch_failed: "Nie udało się pobrać treści tej strony — sprawdź, czy link jest poprawny i publicznie dostępny. Możesz też skopiować treść artykułu i wkleić ją w trybie „Tekst” — zadziała niezależnie od tego problemu.",
        err_system_paused: "Gakori jest teraz chwilowo wstrzymane — nasz zespół już o tym wie i pracuje nad tym. Spróbuj ponownie za jakiś czas.",
        err_save_failed: "Nie udało się zapisać wyniku analizy. Spróbuj ponownie.",
        err_too_many_failed_attempts: "Zbyt wiele nieudanych prób analizy pod rząd. Spróbuj ponownie za {time}.",
        retry_minutes: "{minutes} min", retry_hours: "{hours} godz.", retry_days: "{days} dni",
        rate_limit_expired: "Możesz już spróbować ponownie.",
        err_invalid_image: "To nie jest rozpoznawalny plik obrazu (JPEG/PNG/GIF/WEBP).",
        err_unsafe_content: "Ten obraz przedstawia treści niedozwolone w Gakori (np. nagość, przemoc, drastyczne obrazy) i nie może zostać przeanalizowany. Zgodnie z zasadami ta próba została policzona jak zwykła analiza.",
        err_too_many_images: "Można analizować maksymalnie {max} obrazów naraz.",
        label_images_selected: "Wybrano {count}/{max} obrazów",
        alert_max_images: "Możesz dodać maksymalnie {max} obrazów naraz.",
        tab_pdf: "PDF", analyze_label_pdf: "Analizuj PDF", label_choose_pdf: "Wybierz plik PDF do analizy:", btn_choose_pdf: "Wybierz PDF", label_pdf_selected: "Wybrano plik: {name}", label_pdf_large_file_notice: "(duży plik — wysyłanie może chwilę potrwać)", alert_choose_pdf: "Wybrany plik nie jest plikiem PDF.", alert_choose_pdf_file: "Najpierw wybierz plik PDF do analizy.", alert_pdf_too_large: "Plik PDF jest za duży (limit 10 MB).", pdf_confirm_title: "Potwierdź analizę", pdf_confirm_pages: "Liczba stron: {count}", pdf_confirm_cost: "Koszt: {cost} kredytów", pdf_confirm_wait_notice: "Dłuższe pliki mogą się analizować zauważalnie dłużej niż zwykle — to normalne.", btn_pdf_confirm_yes: "Tak, analizuj", btn_pdf_confirm_no: "Anuluj", err_invalid_pdf: "Przesłany plik nie jest prawidłowym PDF-em.", err_pdf_too_long: "Ten plik ma {count} stron — maksymalnie obsługujemy {max}.", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "Usuń ten obraz",
        image_not_saved_notice: "Ten obraz jest analizowany na bieżąco i nie jest zapisywany w naszym systemie — widzisz go tylko Ty, teraz.",
        label_paste_image_zone: "Wklej obraz tutaj (np. zrzut ekranu)",
        alert_paste_not_image: "To, co skopiowałeś, nie zawiera obrazu (tylko tekst) — spróbuj zamiast tego przycisku „Wybierz zdjęcie”.",
        err_file_too_large: "Ten plik jest za duży (limit 8 MB).",
        public_scans_heading: "Wyszukaj analizę", placeholder_search: "Szukaj po słowach kluczowych...",
        public_scans_empty: "Jeszcze nic tu nie ma — bądź pierwszy!",
        public_scans_no_results: "Brak wyników dla \"{query}\".", public_scans_load_error: "Nie udało się wczytać.",
        scan_not_found: "Nie znaleziono takiej analizy.", scan_source_label: "Źródło: ", scan_text_source_label: "Pokaż pełny tekst źródłowy", btn_copy_source_text: "Kopiuj", btn_copy_source_text_done: "Skopiowano!", scan_text_source_char_count: "{count} znaków",
        manual_source_notice: "Ta treść pochodzi z ręcznego wklejenia przez użytkownika, nie z bezpośredniego pobrania strony.",
        btn_report_mismatch: "Zgłoś niezgodność z treścią źródła", btn_force_refresh: "Sprawdź, czy coś się zmieniło",
        status_mismatch_reported: "Dziękujemy za zgłoszenie — sprawdzimy to.",
        live_cost_estimate: "Szacowany koszt: {cost} kredytów", cost_free_cache_notice: "Za darmo — z pamięci", scan_view_count: "Wyświetlono {count} razy",
        url_confirm_char_count: "Do analizy: {count} znaków", url_confirm_clean_notice: "Cena uwzględnia oczyszczenie strony z menu, reklam i innych elementów niezwiązanych z treścią artykułu.",
        btn_paste_own_content: "Nie zgadzasz się? Wklej własną treść",
        force_refresh_confirm_cost: "Sprawdzenie i ponowna analiza będzie kosztować {cost} kredytów. Kontynuować?",
        scan_retracted_notice: "Ta treść została automatycznie wycofana — wiele osób zgłosiło, że nie zgadza się już z aktualną treścią źródła. Wynik nadal jest widoczny, ale nie jest już serwowany jako aktualny innym osobom.",
        scan_pdf_source_label: "Plik: ", pattern_page_label: "Strona {page}", pattern_image_label: "Obraz {index}", link_pdf_history: "Twoje analizy PDF →", history_back: "← Wróć do konta", history_title: "Twoje analizy PDF", history_intro: "Tylko Ty widzisz tę listę — analizy PDF nie są publiczne.", history_empty: "Nie masz jeszcze żadnych analiz PDF.", history_unnamed_file: "plik bez nazwy",
        tip_label: "Co teraz zrobić:", pattern_tag_manipulation: "WZORZEC", pattern_tag_reasoning: "OBSERWACJA", summary_label: "Podsumowanie",
        scan_load_error: "Nie udało się wczytać analizy (sprawdź połączenie z internetem i odśwież stronę).",
    },
    en: {
        tab_login: "Log in", tab_signup: "Sign up",
        placeholder_email: "email", placeholder_password: "password (min. 6 characters)",
        btn_login: "Log in", btn_signup: "Sign up",
        link_forgot_password: "Forgot your password?", divider_or: "— or —",
        btn_google_login: "Log in with Google", btn_google_signup: "Sign up with Google",
        err_provide_credentials: "Enter your email and password.",
        err_captcha_required: "Check the \"I'm not a robot\" box above.",
        status_please_wait: "Just a moment...",
        err_account_exists_login: "An account with this email already exists. Try logging in.",
        status_check_email: "Check your email and click the confirmation link to finish signing up.",
        err_email_first: "Enter your email above first.",
        status_recovery_email_sent: "We sent a password recovery link to your email.",
        status_email_may_be_delayed: "Due to high demand, email delivery may take a bit longer today — if you don't see anything after a while, come back here and click \"Resend email\".",
        btn_resend_email: "Resend email",
        status_resend_sent: "We've sent a new email — check your inbox.",
        err_google_account_exists: "An account with this Google address already exists. Log in instead.",
        recovery_title: "Set a new password for your account:",
        placeholder_new_password: "new password (min. 6 characters)", btn_set_new_password: "Set new password",
        err_password_min: "Password must be at least 6 characters.",
        recovery_success: "Password set! You can now use the app.",
        err_invalid_credentials: "Invalid email or password.",
        err_email_not_confirmed: "Confirm your email — check your inbox and click the link we sent.",
        err_invalid_email_format: "Invalid email format.",
        err_captcha_generic: "Confirm you're not a robot (check the box above) and try again.",
        account_aria_label: "Your account", credit_balance_label: "Credit balance", account_back: "← Back to Gakori", account_title: "Your account",
        loading: "Loading...", account_logged_in_as: "Logged in as:",
        btn_logout: "Log out", link_change_password: "Change password", btn_save_password: "Save new password",
        password_changed: "Password changed.",
        account_load_error: "Couldn't load your account (check your connection and reload the page).",
        language_label: "App language",
        theme_label: "Theme", theme_light: "Light", theme_dark: "Dark",
        username_label: "Username", btn_save_username: "Save name", username_saved: "Username saved.",
        username_cooldown_note: "You can change it again from: {date}",
        err_username_length: "Name must be 2–24 characters long.", err_username_cooldown: "You can only change your username once every 14 days.",
        err_username_taken: "That name is already taken — choose another one.",
        err_username_forbidden: "That name contains a word that isn't allowed — choose another one.",
        tab_link: "Link", tab_text: "Text", tab_image: "Image",
        label_paste_link: "Paste a link to analyze:", placeholder_url: "https://...",
        label_paste_text: "Paste text to analyze:", placeholder_text_content: "Paste the content you want to analyze...", label_text_source_url_optional: "Optional: source link (will be added to the result):",
        label_choose_image: "Choose an image to analyze:", btn_choose_image: "Choose image",
        btn_analyze: "Analyze",
        analyze_label_url: "Analyze page", analyze_label_text: "Analyze text", analyze_label_image: "Analyze image",
        status_analyzing: "Analyzing...",
        status_step_1: "Sending content for review...", status_step_2: "Checking if this was already analyzed...",
        status_step_3: "Figuring out which patterns to look for...", status_step_4: "Reading the content carefully...",
        status_step_5: "Looking for specific quotes...", status_step_6: "Almost done...",
        status_step_7: "Comparing against the library of known patterns...", status_step_8: "Checking the context of each sentence...",
        status_step_9: "Judging whether this is manipulation or sound reasoning...", status_step_10: "Picking the most fitting names for the patterns found...",
        status_step_11: "Putting the result into a readable form...", status_step_12: "Final touches...",
        alert_enter_link: "Enter a link!", alert_paste_text: "Paste some text!", alert_choose_image: "Choose an image!", alert_image_too_large: "This file is too large (8 MB limit).",
        status_err_prefix: "❌ Error: ",
        badge_manipulation: "Manipulation: {score}/100", badge_clean: "Clean text: {score}/100", badge_partial: "Partial: {score}/100",
        badge_info: "Info", result_generic_error: "Something went wrong. Please try again shortly.",
        err_signup_required: "Create an account to continue.",
        err_insufficient_credits: "You don't have enough credits for this.",
        err_url_fetch_failed: "We couldn't fetch this page — check that the link is correct and publicly accessible. You can also copy the article text and paste it in \"Text\" mode — that works regardless of this issue.",
        err_system_paused: "Gakori is temporarily paused — our team already knows and is working on it. Please try again shortly.",
        err_save_failed: "We couldn't save the analysis result. Please try again.",
        err_too_many_failed_attempts: "Too many failed analysis attempts in a row. Try again in {time}.",
        retry_minutes: "{minutes} min", retry_hours: "{hours} h", retry_days: "{days} days",
        rate_limit_expired: "You can try again now.",
        err_invalid_image: "This isn't a recognizable image file (JPEG/PNG/GIF/WEBP).",
        err_unsafe_content: "This image shows content that isn't allowed on Gakori (e.g. nudity, violence, graphic imagery) and can't be analyzed. Per our rules, this attempt was still charged like a normal analysis.",
        err_too_many_images: "You can analyze up to {max} images at once.",
        label_images_selected: "{count}/{max} images selected",
        alert_max_images: "You can add up to {max} images at once.",
        tab_pdf: "PDF", analyze_label_pdf: "Analyze PDF", label_choose_pdf: "Choose a PDF file to analyze:", btn_choose_pdf: "Choose PDF", label_pdf_selected: "Selected file: {name}", label_pdf_large_file_notice: "(large file — uploading may take a moment)", alert_choose_pdf: "The selected file is not a PDF.", alert_choose_pdf_file: "Choose a PDF file first.", alert_pdf_too_large: "The PDF file is too large (10 MB limit).", pdf_confirm_title: "Confirm analysis", pdf_confirm_pages: "Page count: {count}", pdf_confirm_cost: "Cost: {cost} credits", pdf_confirm_wait_notice: "Longer files may take noticeably longer to analyze than usual — that's normal.", btn_pdf_confirm_yes: "Yes, analyze", btn_pdf_confirm_no: "Cancel", err_invalid_pdf: "The uploaded file is not a valid PDF.", err_pdf_too_long: "This file has {count} pages — we support up to {max}.", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "Remove this image",
        image_not_saved_notice: "This image is analyzed on the spot and isn't saved in our system — you're the only one who sees it, right now.",
        label_paste_image_zone: "Paste an image here (e.g. a screenshot)",
        alert_paste_not_image: "What you copied doesn't contain an image (just text) — try the \"Choose image\" button instead.",
        err_file_too_large: "This file is too large (8 MB limit).",
        public_scans_heading: "Search an analysis", placeholder_search: "Search by keyword...",
        public_scans_empty: "Nothing here yet — be the first!",
        public_scans_no_results: "No results for \"{query}\".", public_scans_load_error: "Couldn't load.",
        scan_not_found: "This analysis could not be found.", scan_source_label: "Source: ", scan_text_source_label: "Show full source text", btn_copy_source_text: "Copy", btn_copy_source_text_done: "Copied!", scan_text_source_char_count: "{count} characters",
        manual_source_notice: "This content was manually pasted by a user, not fetched directly from the page.",
        btn_report_mismatch: "Report mismatch with source content", btn_force_refresh: "Check if something changed",
        status_mismatch_reported: "Thanks for reporting — we'll take a look.",
        live_cost_estimate: "Estimated cost: {cost} credits", cost_free_cache_notice: "Free — from cache", scan_view_count: "Viewed {count} times",
        url_confirm_char_count: "To analyze: {count} characters", url_confirm_clean_notice: "The price already accounts for cleaning the page of menus, ads, and other elements unrelated to the article content.",
        btn_paste_own_content: "Don't agree? Paste your own content",
        force_refresh_confirm_cost: "Checking and re-analyzing will cost {cost} credits. Continue?",
        scan_retracted_notice: "This content has been automatically retracted — many people reported that it no longer matches the current source content. The result is still visible, but it's no longer served as current to other people.",
        scan_pdf_source_label: "File: ", pattern_page_label: "Page {page}", pattern_image_label: "Image {index}", link_pdf_history: "Your PDF analyses →", history_back: "← Back to account", history_title: "Your PDF analyses", history_intro: "Only you can see this list — PDF analyses are not public.", history_empty: "You don't have any PDF analyses yet.", history_unnamed_file: "unnamed file",
        tip_label: "What to do now:", pattern_tag_manipulation: "PATTERN", pattern_tag_reasoning: "OBSERVATION", summary_label: "Summary",
        scan_load_error: "Couldn't load the analysis (check your connection and reload the page).",
    },
    es: {
        tab_login: "Iniciar sesión", tab_signup: "Registrarse",
        placeholder_email: "correo electrónico", placeholder_password: "contraseña (mín. 6 caracteres)",
        btn_login: "Iniciar sesión", btn_signup: "Registrarse",
        link_forgot_password: "¿Olvidaste tu contraseña?", divider_or: "— o —",
        btn_google_login: "Iniciar sesión con Google", btn_google_signup: "Registrarse con Google",
        err_provide_credentials: "Introduce tu correo y contraseña.",
        err_captcha_required: "Marca la casilla \"no soy un robot\" de arriba.",
        status_please_wait: "Un momento...",
        err_account_exists_login: "Ya existe una cuenta con este correo. Intenta iniciar sesión.",
        status_check_email: "Revisa tu correo y haz clic en el enlace de confirmación para completar el registro.",
        err_email_first: "Primero escribe tu correo arriba.",
        status_recovery_email_sent: "Te enviamos un enlace para recuperar tu contraseña por correo.",
        status_email_may_be_delayed: "Debido a mucha demanda, el envío del correo puede tardar un poco más hoy — si no ves nada después de un rato, vuelve aquí y haz clic en «Reenviar correo».",
        btn_resend_email: "Reenviar correo",
        status_resend_sent: "Hemos enviado un nuevo correo — revisa tu bandeja de entrada.",
        err_google_account_exists: "Ya existe una cuenta con esta dirección de Google. Inicia sesión en su lugar.",
        recovery_title: "Establece una nueva contraseña para tu cuenta:",
        placeholder_new_password: "nueva contraseña (mín. 6 caracteres)", btn_set_new_password: "Establecer nueva contraseña",
        err_password_min: "La contraseña debe tener al menos 6 caracteres.",
        recovery_success: "¡Contraseña establecida! Ya puedes usar la aplicación.",
        err_invalid_credentials: "Correo o contraseña incorrectos.",
        err_email_not_confirmed: "Confirma tu correo electrónico: revisa tu bandeja de entrada y haz clic en el enlace que enviamos.",
        err_invalid_email_format: "Formato de correo electrónico no válido.",
        err_captcha_generic: "Confirma que no eres un robot (marca la casilla de arriba) e inténtalo de nuevo.",
        account_aria_label: "Tu cuenta", credit_balance_label: "Créditos disponibles", account_back: "← Volver a Gakori", account_title: "Tu cuenta",
        loading: "Cargando...", account_logged_in_as: "Sesión iniciada como:",
        btn_logout: "Cerrar sesión", link_change_password: "Cambiar contraseña", btn_save_password: "Guardar nueva contraseña",
        password_changed: "Contraseña cambiada.",
        account_load_error: "No se pudieron cargar los datos de tu cuenta (revisa tu conexión y recarga la página).",
        language_label: "Idioma de la aplicación",
        theme_label: "Tema", theme_light: "Claro", theme_dark: "Oscuro",
        username_label: "Nombre de usuario", btn_save_username: "Guardar nombre", username_saved: "Nombre de usuario guardado.",
        username_cooldown_note: "Podrás cambiarlo de nuevo a partir de: {date}",
        err_username_length: "El nombre debe tener entre 2 y 24 caracteres.", err_username_cooldown: "Solo puedes cambiar tu nombre de usuario una vez cada 14 días.",
        err_username_taken: "Ese nombre ya está en uso — elige otro.",
        err_username_forbidden: "Ese nombre contiene una palabra no permitida — elige otro.",
        tab_link: "Enlace", tab_text: "Texto", tab_image: "Imagen",
        label_paste_link: "Pega un enlace para analizar:", placeholder_url: "https://...",
        label_paste_text: "Pega el texto a analizar:", placeholder_text_content: "Pega el contenido que quieres analizar...", label_text_source_url_optional: "Opcional: enlace de la fuente (se añadirá al resultado):",
        label_choose_image: "Elige una imagen para analizar:", btn_choose_image: "Elegir imagen",
        btn_analyze: "Analizar",
        analyze_label_url: "Analizar página", analyze_label_text: "Analizar texto", analyze_label_image: "Analizar imagen",
        status_analyzing: "Analizando...",
        status_step_1: "Enviando el contenido para revisión...", status_step_2: "Comprobando si ya se analizó esto...",
        status_step_3: "Averiguando qué patrones buscar...", status_step_4: "Leyendo el contenido con atención...",
        status_step_5: "Buscando citas concretas...", status_step_6: "Ya casi está...",
        status_step_7: "Comparando con la biblioteca de patrones conocidos...", status_step_8: "Comprobando el contexto de cada frase...",
        status_step_9: "Evaluando si esto es manipulación o razonamiento sólido...", status_step_10: "Eligiendo los nombres más adecuados para los patrones encontrados...",
        status_step_11: "Dando forma legible al resultado...", status_step_12: "Últimos retoques...",
        alert_enter_link: "¡Escribe un enlace!", alert_paste_text: "¡Pega algún texto!", alert_choose_image: "¡Elige una imagen!", alert_image_too_large: "Este archivo es demasiado grande (límite 8 MB).",
        status_err_prefix: "❌ Error: ",
        badge_manipulation: "Manipulación: {score}/100", badge_clean: "Texto limpio: {score}/100", badge_partial: "Parcial: {score}/100",
        badge_info: "Info", result_generic_error: "Algo salió mal. Inténtalo de nuevo en un momento.",
        err_signup_required: "Crea una cuenta para continuar.",
        err_insufficient_credits: "No tienes suficientes créditos para esto.",
        err_url_fetch_failed: "No pudimos obtener el contenido de esta página — comprueba que el enlace sea correcto y esté disponible públicamente. También puedes copiar el texto del artículo y pegarlo en el modo «Texto» — funciona independientemente de este problema.",
        err_system_paused: "Gakori está temporalmente en pausa — nuestro equipo ya lo sabe y está trabajando en ello. Inténtalo de nuevo en un momento.",
        err_save_failed: "No se pudo guardar el resultado del análisis. Inténtalo de nuevo.",
        err_too_many_failed_attempts: "Demasiados intentos de análisis fallidos seguidos. Vuelve a intentarlo en {time}.",
        retry_minutes: "{minutes} min", retry_hours: "{hours} h", retry_days: "{days} días",
        rate_limit_expired: "Ya puedes volver a intentarlo.",
        err_invalid_image: "Esto no es un archivo de imagen reconocible (JPEG/PNG/GIF/WEBP).",
        err_unsafe_content: "Esta imagen muestra contenido no permitido en Gakori (por ejemplo, desnudez, violencia, imágenes explícitas) y no se puede analizar. Según nuestras normas, este intento se ha cobrado igualmente como un análisis normal.",
        err_too_many_images: "Puedes analizar un máximo de {max} imágenes a la vez.",
        label_images_selected: "{count}/{max} imágenes seleccionadas",
        alert_max_images: "Puedes añadir un máximo de {max} imágenes a la vez.",
        tab_pdf: "PDF", analyze_label_pdf: "Analizar PDF", label_choose_pdf: "Elige un archivo PDF para analizar:", btn_choose_pdf: "Elegir PDF", label_pdf_selected: "Archivo seleccionado: {name}", label_pdf_large_file_notice: "(archivo grande — la subida puede tardar un momento)", alert_choose_pdf: "El archivo seleccionado no es un PDF.", alert_choose_pdf_file: "Elige primero un archivo PDF.", alert_pdf_too_large: "El archivo PDF es demasiado grande (límite de 10 MB).", pdf_confirm_title: "Confirmar análisis", pdf_confirm_pages: "Número de páginas: {count}", pdf_confirm_cost: "Coste: {cost} créditos", pdf_confirm_wait_notice: "Los archivos más largos pueden tardar notablemente más de lo habitual — es normal.", btn_pdf_confirm_yes: "Sí, analizar", btn_pdf_confirm_no: "Cancelar", err_invalid_pdf: "El archivo enviado no es un PDF válido.", err_pdf_too_long: "Este archivo tiene {count} páginas — el máximo permitido es {max}.", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "Quitar esta imagen",
        image_not_saved_notice: "Esta imagen se analiza al momento y no se guarda en nuestro sistema — solo tú la ves, ahora.",
        label_paste_image_zone: "Pega una imagen aquí (p. ej. una captura de pantalla)",
        alert_paste_not_image: "Lo que copiaste no contiene una imagen (solo texto) — prueba en su lugar el botón «Elegir imagen».",
        err_file_too_large: "Este archivo es demasiado grande (límite 8 MB).",
        public_scans_heading: "Busca un análisis", placeholder_search: "Buscar por palabras clave...",
        public_scans_empty: "Todavía no hay nada aquí — ¡sé el primero!",
        public_scans_no_results: "Sin resultados para \"{query}\".", public_scans_load_error: "No se pudo cargar.",
        scan_not_found: "No se encontró este análisis.", scan_source_label: "Fuente: ", scan_text_source_label: "Mostrar el texto fuente completo", btn_copy_source_text: "Copiar", btn_copy_source_text_done: "¡Copiado!", scan_text_source_char_count: "{count} caracteres",
        manual_source_notice: "Este contenido fue pegado manualmente por un usuario, no obtenido directamente de la página.",
        btn_report_mismatch: "Reportar discrepancia con el contenido original", btn_force_refresh: "Comprobar si algo ha cambiado",
        status_mismatch_reported: "Gracias por avisar — lo revisaremos.",
        live_cost_estimate: "Costo estimado: {cost} créditos", cost_free_cache_notice: "Gratis — desde la memoria", scan_view_count: "Visto {count} veces",
        url_confirm_char_count: "A analizar: {count} caracteres", url_confirm_clean_notice: "El precio ya tiene en cuenta la limpieza de la página de menús, anuncios y otros elementos no relacionados con el contenido del artículo.",
        btn_paste_own_content: "¿No estás de acuerdo? Pega tu propio contenido",
        force_refresh_confirm_cost: "Comprobar y volver a analizar costará {cost} créditos. ¿Continuar?",
        scan_retracted_notice: "Este contenido se ha retirado automáticamente — muchas personas informaron que ya no coincide con el contenido actual de la fuente. El resultado sigue siendo visible, pero ya no se ofrece como actual a otras personas.",
        scan_pdf_source_label: "Archivo: ", pattern_page_label: "Página {page}", pattern_image_label: "Imagen {index}", link_pdf_history: "Tus análisis de PDF →", history_back: "← Volver a la cuenta", history_title: "Tus análisis de PDF", history_intro: "Solo tú puedes ver esta lista — los análisis de PDF no son públicos.", history_empty: "Todavía no tienes ningún análisis de PDF.", history_unnamed_file: "archivo sin nombre",
        tip_label: "Qué hacer ahora:", pattern_tag_manipulation: "PATRÓN", pattern_tag_reasoning: "OBSERVACIÓN", summary_label: "Resumen",
        scan_load_error: "No se pudo cargar el análisis (revisa tu conexión y recarga la página).",
    },
    de: {
        tab_login: "Anmelden", tab_signup: "Registrieren",
        placeholder_email: "E-Mail", placeholder_password: "Passwort (mind. 6 Zeichen)",
        btn_login: "Anmelden", btn_signup: "Registrieren",
        link_forgot_password: "Passwort vergessen?", divider_or: "— oder —",
        btn_google_login: "Mit Google anmelden", btn_google_signup: "Mit Google registrieren",
        err_provide_credentials: "Bitte E-Mail und Passwort eingeben.",
        err_captcha_required: "Bitte das Kästchen \"Ich bin kein Roboter\" oben anklicken.",
        status_please_wait: "Einen Moment...",
        err_account_exists_login: "Ein Konto mit dieser E-Mail existiert bereits. Bitte melde dich an.",
        status_check_email: "Prüfe dein Postfach und klicke auf den Bestätigungslink, um die Registrierung abzuschließen.",
        err_email_first: "Bitte zuerst deine E-Mail oben eingeben.",
        status_recovery_email_sent: "Wir haben dir einen Link zur Wiederherstellung deines Passworts per E-Mail geschickt.",
        status_email_may_be_delayed: "Wegen hoher Nachfrage kann der Mailversand heute etwas länger dauern — wenn du nach einer Weile nichts siehst, komm zurück und klicke auf „E-Mail erneut senden“.",
        btn_resend_email: "E-Mail erneut senden",
        status_resend_sent: "Wir haben eine neue E-Mail gesendet — schau in deinem Postfach nach.",
        err_google_account_exists: "Ein Konto mit dieser Google-Adresse existiert bereits. Bitte melde dich stattdessen an.",
        recovery_title: "Neues Passwort für dein Konto festlegen:",
        placeholder_new_password: "neues Passwort (mind. 6 Zeichen)", btn_set_new_password: "Neues Passwort festlegen",
        err_password_min: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        recovery_success: "Passwort festgelegt! Du kannst die App jetzt nutzen.",
        err_invalid_credentials: "Ungültige E-Mail oder Passwort.",
        err_email_not_confirmed: "Bitte bestätige deine E-Mail — prüfe dein Postfach und klicke auf den gesendeten Link.",
        err_invalid_email_format: "Ungültiges E-Mail-Format.",
        err_captcha_generic: "Bitte bestätige, dass du kein Roboter bist (Kästchen oben anklicken) und versuche es erneut.",
        account_aria_label: "Dein Konto", credit_balance_label: "Guthaben", account_back: "← Zurück zu Gakori", account_title: "Dein Konto",
        loading: "Wird geladen...", account_logged_in_as: "Angemeldet als:",
        btn_logout: "Abmelden", link_change_password: "Passwort ändern", btn_save_password: "Neues Passwort speichern",
        password_changed: "Passwort geändert.",
        account_load_error: "Kontodaten konnten nicht geladen werden (Verbindung prüfen und Seite neu laden).",
        language_label: "App-Sprache",
        theme_label: "Thema", theme_light: "Hell", theme_dark: "Dunkel",
        username_label: "Benutzername", btn_save_username: "Namen speichern", username_saved: "Benutzername gespeichert.",
        username_cooldown_note: "Erneute Änderung möglich ab: {date}",
        err_username_length: "Der Name muss 2–24 Zeichen lang sein.", err_username_cooldown: "Der Benutzername kann nur alle 14 Tage geändert werden.",
        err_username_taken: "Dieser Name ist bereits vergeben — wähle einen anderen.",
        err_username_forbidden: "Dieser Name enthält ein nicht erlaubtes Wort — wähle einen anderen.",
        tab_link: "Link", tab_text: "Text", tab_image: "Bild",
        label_paste_link: "Link zur Analyse einfügen:", placeholder_url: "https://...",
        label_paste_text: "Text zur Analyse einfügen:", placeholder_text_content: "Füge den Inhalt ein, den du analysieren möchtest...", label_text_source_url_optional: "Optional: Quellenlink (wird dem Ergebnis hinzugefügt):",
        label_choose_image: "Bild zur Analyse auswählen:", btn_choose_image: "Bild auswählen",
        btn_analyze: "Analysieren",
        analyze_label_url: "Seite analysieren", analyze_label_text: "Text analysieren", analyze_label_image: "Bild analysieren",
        status_analyzing: "Wird analysiert...",
        status_step_1: "Inhalt wird zur Prüfung gesendet...", status_step_2: "Wird geprüft, ob das schon analysiert wurde...",
        status_step_3: "Wird ermittelt, wonach gesucht werden soll...", status_step_4: "Inhalt wird sorgfältig gelesen...",
        status_step_5: "Konkrete Zitate werden gesucht...", status_step_6: "Gleich fertig...",
        status_step_7: "Wird mit der Bibliothek bekannter Muster verglichen...", status_step_8: "Der Kontext jedes Satzes wird geprüft...",
        status_step_9: "Wird beurteilt, ob es sich um Manipulation oder fundiertes Denken handelt...", status_step_10: "Die treffendsten Namen für die gefundenen Muster werden ausgewählt...",
        status_step_11: "Das Ergebnis wird in eine lesbare Form gebracht...", status_step_12: "Letzter Feinschliff...",
        alert_enter_link: "Bitte einen Link eingeben!", alert_paste_text: "Bitte einen Text einfügen!", alert_choose_image: "Bitte ein Bild auswählen!", alert_image_too_large: "Diese Datei ist zu groß (Limit 8 MB).",
        status_err_prefix: "❌ Fehler: ",
        badge_manipulation: "Manipulation: {score}/100", badge_clean: "Sauberer Text: {score}/100", badge_partial: "Teilweise: {score}/100",
        badge_info: "Info", result_generic_error: "Etwas ist schiefgelaufen. Bitte versuche es gleich noch einmal.",
        err_signup_required: "Erstelle ein Konto, um fortzufahren.",
        err_insufficient_credits: "Du hast nicht genug Guthaben dafür.",
        err_url_fetch_failed: "Wir konnten den Inhalt dieser Seite nicht abrufen — prüfe, ob der Link korrekt und öffentlich zugänglich ist. Du kannst den Artikeltext auch kopieren und im Modus „Text“ einfügen — das funktioniert unabhängig von diesem Problem.",
        err_system_paused: "Gakori ist vorübergehend pausiert — unser Team weiß bereits Bescheid und arbeitet daran. Bitte versuche es gleich noch einmal.",
        err_save_failed: "Das Analyseergebnis konnte nicht gespeichert werden. Bitte versuche es erneut.",
        err_too_many_failed_attempts: "Zu viele fehlgeschlagene Analyseversuche hintereinander. Versuche es in {time} erneut.",
        retry_minutes: "{minutes} Min.", retry_hours: "{hours} Std.", retry_days: "{days} Tagen",
        rate_limit_expired: "Du kannst es jetzt erneut versuchen.",
        err_invalid_image: "Das ist keine erkennbare Bilddatei (JPEG/PNG/GIF/WEBP).",
        err_unsafe_content: "Dieses Bild zeigt Inhalte, die bei Gakori nicht erlaubt sind (z. B. Nacktheit, Gewalt, drastische Darstellungen), und kann nicht analysiert werden. Gemäß unseren Regeln wurde dieser Versuch trotzdem wie eine normale Analyse berechnet.",
        err_too_many_images: "Du kannst maximal {max} Bilder auf einmal analysieren.",
        label_images_selected: "{count}/{max} Bilder ausgewählt",
        alert_max_images: "Du kannst maximal {max} Bilder auf einmal hinzufügen.",
        tab_pdf: "PDF", analyze_label_pdf: "PDF analysieren", label_choose_pdf: "Wähle eine PDF-Datei zur Analyse:", btn_choose_pdf: "PDF wählen", label_pdf_selected: "Ausgewählte Datei: {name}", label_pdf_large_file_notice: "(große Datei — das Hochladen kann einen Moment dauern)", alert_choose_pdf: "Die ausgewählte Datei ist kein PDF.", alert_choose_pdf_file: "Wähle zuerst eine PDF-Datei aus.", alert_pdf_too_large: "Die PDF-Datei ist zu groß (Limit 10 MB).", pdf_confirm_title: "Analyse bestätigen", pdf_confirm_pages: "Seitenzahl: {count}", pdf_confirm_cost: "Kosten: {cost} Credits", pdf_confirm_wait_notice: "Längere Dateien können spürbar länger dauern als gewöhnlich — das ist normal.", btn_pdf_confirm_yes: "Ja, analysieren", btn_pdf_confirm_no: "Abbrechen", err_invalid_pdf: "Die hochgeladene Datei ist kein gültiges PDF.", err_pdf_too_long: "Diese Datei hat {count} Seiten — wir unterstützen maximal {max}.", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "Dieses Bild entfernen",
        image_not_saved_notice: "Dieses Bild wird sofort analysiert und nicht in unserem System gespeichert — nur du siehst es, jetzt gerade.",
        label_paste_image_zone: "Bild hier einfügen (z. B. einen Screenshot)",
        alert_paste_not_image: "Das, was du kopiert hast, enthält kein Bild (nur Text) — probiere stattdessen die Schaltfläche „Bild auswählen“.",
        err_file_too_large: "Diese Datei ist zu groß (Limit 8 MB).",
        public_scans_heading: "Analyse suchen", placeholder_search: "Nach Stichwörtern suchen...",
        public_scans_empty: "Hier ist noch nichts — sei der Erste!",
        public_scans_no_results: "Keine Ergebnisse für \"{query}\".", public_scans_load_error: "Laden fehlgeschlagen.",
        scan_not_found: "Diese Analyse wurde nicht gefunden.", scan_source_label: "Quelle: ", scan_text_source_label: "Vollständigen Quelltext anzeigen", btn_copy_source_text: "Kopieren", btn_copy_source_text_done: "Kopiert!", scan_text_source_char_count: "{count} Zeichen",
        manual_source_notice: "Dieser Inhalt wurde von einem Nutzer manuell eingefügt, nicht direkt von der Seite abgerufen.",
        btn_report_mismatch: "Abweichung vom Quellinhalt melden", btn_force_refresh: "Prüfen, ob sich etwas geändert hat",
        status_mismatch_reported: "Danke für den Hinweis — wir schauen es uns an.",
        live_cost_estimate: "Geschätzte Kosten: {cost} Credits", cost_free_cache_notice: "Kostenlos — aus dem Speicher", scan_view_count: "{count} Mal angesehen",
        url_confirm_char_count: "Zu analysieren: {count} Zeichen", url_confirm_clean_notice: "Der Preis berücksichtigt bereits die Bereinigung der Seite von Menüs, Werbung und anderen Elementen, die nichts mit dem Artikelinhalt zu tun haben.",
        btn_paste_own_content: "Nicht einverstanden? Eigenen Inhalt einfügen",
        force_refresh_confirm_cost: "Die Prüfung und erneute Analyse kostet {cost} Credits. Fortfahren?",
        scan_retracted_notice: "Dieser Inhalt wurde automatisch zurückgezogen — viele Personen haben gemeldet, dass er nicht mehr mit dem aktuellen Quellinhalt übereinstimmt. Das Ergebnis ist weiterhin sichtbar, wird aber anderen Personen nicht mehr als aktuell angezeigt.",
        scan_pdf_source_label: "Datei: ", pattern_page_label: "Seite {page}", pattern_image_label: "Bild {index}", link_pdf_history: "Deine PDF-Analysen →", history_back: "← Zurück zum Konto", history_title: "Deine PDF-Analysen", history_intro: "Nur du siehst diese Liste — PDF-Analysen sind nicht öffentlich.", history_empty: "Du hast noch keine PDF-Analysen.", history_unnamed_file: "Datei ohne Namen",
        tip_label: "Was jetzt tun:", pattern_tag_manipulation: "MUSTER", pattern_tag_reasoning: "BEOBACHTUNG", summary_label: "Zusammenfassung",
        scan_load_error: "Analyse konnte nicht geladen werden (Verbindung prüfen und Seite neu laden).",
    },
    fr: {
        tab_login: "Connexion", tab_signup: "Inscription",
        placeholder_email: "e-mail", placeholder_password: "mot de passe (min. 6 caractères)",
        btn_login: "Se connecter", btn_signup: "S'inscrire",
        link_forgot_password: "Mot de passe oublié ?", divider_or: "— ou —",
        btn_google_login: "Se connecter avec Google", btn_google_signup: "S'inscrire avec Google",
        err_provide_credentials: "Indiquez votre e-mail et votre mot de passe.",
        err_captcha_required: "Cochez la case \"je ne suis pas un robot\" ci-dessus.",
        status_please_wait: "Un instant...",
        err_account_exists_login: "Un compte avec cet e-mail existe déjà. Essayez de vous connecter.",
        status_check_email: "Consultez votre e-mail et cliquez sur le lien de confirmation pour finaliser l'inscription.",
        err_email_first: "Indiquez d'abord votre e-mail ci-dessus.",
        status_recovery_email_sent: "Nous vous avons envoyé un lien de récupération de mot de passe par e-mail.",
        status_email_may_be_delayed: "En raison d'une forte demande, l'envoi de l'e-mail peut prendre un peu plus de temps aujourd'hui — si vous ne voyez rien après un moment, revenez ici et cliquez sur « Renvoyer l'e-mail ».",
        btn_resend_email: "Renvoyer l'e-mail",
        status_resend_sent: "Nous avons envoyé un nouvel e-mail — vérifiez votre boîte de réception.",
        err_google_account_exists: "Un compte avec cette adresse Google existe déjà. Connectez-vous plutôt.",
        recovery_title: "Définissez un nouveau mot de passe pour votre compte :",
        placeholder_new_password: "nouveau mot de passe (min. 6 caractères)", btn_set_new_password: "Définir le nouveau mot de passe",
        err_password_min: "Le mot de passe doit contenir au moins 6 caractères.",
        recovery_success: "Mot de passe défini ! Vous pouvez maintenant utiliser l'application.",
        err_invalid_credentials: "E-mail ou mot de passe incorrect.",
        err_email_not_confirmed: "Confirmez votre e-mail — consultez votre boîte de réception et cliquez sur le lien envoyé.",
        err_invalid_email_format: "Format d'e-mail invalide.",
        err_captcha_generic: "Confirmez que vous n'êtes pas un robot (cochez la case ci-dessus) et réessayez.",
        account_aria_label: "Votre compte", credit_balance_label: "Solde de crédits", account_back: "← Retour à Gakori", account_title: "Votre compte",
        loading: "Chargement...", account_logged_in_as: "Connecté en tant que :",
        btn_logout: "Se déconnecter", link_change_password: "Changer le mot de passe", btn_save_password: "Enregistrer le nouveau mot de passe",
        password_changed: "Mot de passe modifié.",
        account_load_error: "Impossible de charger les données du compte (vérifiez votre connexion et rechargez la page).",
        language_label: "Langue de l'application",
        theme_label: "Thème", theme_light: "Clair", theme_dark: "Sombre",
        username_label: "Nom d'utilisateur", btn_save_username: "Enregistrer le nom", username_saved: "Nom d'utilisateur enregistré.",
        username_cooldown_note: "Vous pourrez le modifier à nouveau à partir du : {date}",
        err_username_length: "Le nom doit comporter entre 2 et 24 caractères.", err_username_cooldown: "Vous ne pouvez changer votre nom d'utilisateur qu'une fois tous les 14 jours.",
        err_username_taken: "Ce nom est déjà pris — choisissez-en un autre.",
        err_username_forbidden: "Ce nom contient un mot non autorisé — choisissez-en un autre.",
        tab_link: "Lien", tab_text: "Texte", tab_image: "Image",
        label_paste_link: "Collez un lien à analyser :", placeholder_url: "https://...",
        label_paste_text: "Collez le texte à analyser :", placeholder_text_content: "Collez le contenu que vous souhaitez analyser...", label_text_source_url_optional: "Facultatif : lien source (sera ajouté au résultat) :",
        label_choose_image: "Choisissez une image à analyser :", btn_choose_image: "Choisir une image",
        btn_analyze: "Analyser",
        analyze_label_url: "Analyser la page", analyze_label_text: "Analyser le texte", analyze_label_image: "Analyser l'image",
        status_analyzing: "Analyse en cours...",
        status_step_1: "Envoi du contenu pour vérification...", status_step_2: "Vérification que ce n'a pas déjà été analysé...",
        status_step_3: "Détermination des schémas à rechercher...", status_step_4: "Lecture attentive du contenu...",
        status_step_5: "Recherche de citations précises...", status_step_6: "Presque terminé...",
        status_step_7: "Comparaison avec la bibliothèque de schémas connus...", status_step_8: "Vérification du contexte de chaque phrase...",
        status_step_9: "Évaluation : manipulation ou raisonnement solide...", status_step_10: "Choix des noms les plus adaptés pour les schémas détectés...",
        status_step_11: "Mise en forme lisible du résultat...", status_step_12: "Dernières retouches...",
        alert_enter_link: "Entrez un lien !", alert_paste_text: "Collez du texte !", alert_choose_image: "Choisissez une image !", alert_image_too_large: "Ce fichier est trop volumineux (limite 8 Mo).",
        status_err_prefix: "❌ Erreur : ",
        badge_manipulation: "Manipulation : {score}/100", badge_clean: "Texte sain : {score}/100", badge_partial: "Partiel : {score}/100",
        badge_info: "Info", result_generic_error: "Une erreur s'est produite. Réessayez dans un instant.",
        err_signup_required: "Créez un compte pour continuer.",
        err_insufficient_credits: "Vous n'avez pas assez de crédits pour cela.",
        err_url_fetch_failed: "Impossible de récupérer le contenu de cette page — vérifiez que le lien est correct et accessible publiquement. Vous pouvez aussi copier le texte de l'article et le coller en mode « Texte » — cela fonctionne indépendamment de ce problème.",
        err_system_paused: "Gakori est temporairement en pause — notre équipe est déjà au courant et s'en occupe. Réessayez dans un instant.",
        err_save_failed: "Impossible d'enregistrer le résultat de l'analyse. Veuillez réessayer.",
        err_too_many_failed_attempts: "Trop de tentatives d'analyse échouées d'affilée. Réessayez dans {time}.",
        retry_minutes: "{minutes} min", retry_hours: "{hours} h", retry_days: "{days} jours",
        rate_limit_expired: "Vous pouvez réessayer maintenant.",
        err_invalid_image: "Ce n'est pas un fichier image reconnaissable (JPEG/PNG/GIF/WEBP).",
        err_unsafe_content: "Cette image montre un contenu non autorisé sur Gakori (nudité, violence, images choquantes, etc.) et ne peut pas être analysée. Conformément à nos règles, cette tentative a tout de même été facturée comme une analyse normale.",
        err_too_many_images: "Vous pouvez analyser au maximum {max} images à la fois.",
        label_images_selected: "{count}/{max} images sélectionnées",
        alert_max_images: "Vous pouvez ajouter au maximum {max} images à la fois.",
        tab_pdf: "PDF", analyze_label_pdf: "Analyser le PDF", label_choose_pdf: "Choisissez un fichier PDF à analyser :", btn_choose_pdf: "Choisir un PDF", label_pdf_selected: "Fichier sélectionné : {name}", label_pdf_large_file_notice: "(fichier volumineux — l'envoi peut prendre un moment)", alert_choose_pdf: "Le fichier sélectionné n'est pas un PDF.", alert_choose_pdf_file: "Choisissez d'abord un fichier PDF.", alert_pdf_too_large: "Le fichier PDF est trop volumineux (limite de 10 Mo).", pdf_confirm_title: "Confirmer l'analyse", pdf_confirm_pages: "Nombre de pages : {count}", pdf_confirm_cost: "Coût : {cost} crédits", pdf_confirm_wait_notice: "Les fichiers plus longs peuvent prendre nettement plus de temps que d'habitude — c'est normal.", btn_pdf_confirm_yes: "Oui, analyser", btn_pdf_confirm_no: "Annuler", err_invalid_pdf: "Le fichier envoyé n'est pas un PDF valide.", err_pdf_too_long: "Ce fichier comporte {count} pages — nous prenons en charge {max} maximum.", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "Retirer cette image",
        image_not_saved_notice: "Cette image est analysée à la volée et n'est pas enregistrée dans notre système — vous êtes le seul à la voir, maintenant.",
        label_paste_image_zone: "Collez une image ici (par ex. une capture d'écran)",
        alert_paste_not_image: "Ce que vous avez copié ne contient pas d'image (juste du texte) — essayez plutôt le bouton « Choisir une image ».",
        err_file_too_large: "Ce fichier est trop volumineux (limite 8 Mo).",
        public_scans_heading: "Rechercher une analyse", placeholder_search: "Rechercher par mots-clés...",
        public_scans_empty: "Rien ici pour l'instant — soyez le premier !",
        public_scans_no_results: "Aucun résultat pour \"{query}\".", public_scans_load_error: "Échec du chargement.",
        scan_not_found: "Cette analyse est introuvable.", scan_source_label: "Source : ", scan_text_source_label: "Afficher le texte source complet", btn_copy_source_text: "Copier", btn_copy_source_text_done: "Copié !", scan_text_source_char_count: "{count} caractères",
        manual_source_notice: "Ce contenu a été collé manuellement par un utilisateur, pas récupéré directement depuis la page.",
        btn_report_mismatch: "Signaler une différence avec le contenu source", btn_force_refresh: "Vérifier si quelque chose a changé",
        status_mismatch_reported: "Merci pour votre signalement — nous allons vérifier.",
        live_cost_estimate: "Coût estimé : {cost} crédits", cost_free_cache_notice: "Gratuit — depuis la mémoire", scan_view_count: "Vu {count} fois",
        url_confirm_char_count: "À analyser : {count} caractères", url_confirm_clean_notice: "Le prix tient déjà compte du nettoyage de la page (menus, publicités et autres éléments sans rapport avec le contenu de l'article).",
        btn_paste_own_content: "Pas d'accord ? Collez votre propre contenu",
        force_refresh_confirm_cost: "La vérification et la nouvelle analyse coûteront {cost} crédits. Continuer ?",
        scan_retracted_notice: "Ce contenu a été retiré automatiquement — de nombreuses personnes ont signalé qu'il ne correspond plus au contenu actuel de la source. Le résultat reste visible, mais n'est plus présenté comme actuel aux autres personnes.",
        scan_pdf_source_label: "Fichier : ", pattern_page_label: "Page {page}", pattern_image_label: "Image {index}", link_pdf_history: "Vos analyses de PDF →", history_back: "← Retour au compte", history_title: "Vos analyses de PDF", history_intro: "Vous seul voyez cette liste — les analyses de PDF ne sont pas publiques.", history_empty: "Vous n'avez pas encore d'analyse de PDF.", history_unnamed_file: "fichier sans nom",
        tip_label: "Que faire maintenant :", pattern_tag_manipulation: "SCHÉMA", pattern_tag_reasoning: "OBSERVATION", summary_label: "Résumé",
        scan_load_error: "Impossible de charger l'analyse (vérifiez votre connexion et rechargez la page).",
    },
    ru: {
        tab_login: "Войти", tab_signup: "Регистрация",
        placeholder_email: "эл. почта", placeholder_password: "пароль (мин. 6 символов)",
        btn_login: "Войти", btn_signup: "Зарегистрироваться",
        link_forgot_password: "Забыли пароль?", divider_or: "— или —",
        btn_google_login: "Войти через Google", btn_google_signup: "Зарегистрироваться через Google",
        err_provide_credentials: "Введите e-mail и пароль.",
        err_captcha_required: "Отметьте галочку \"я не робот\" выше.",
        status_please_wait: "Секунду...",
        err_account_exists_login: "Аккаунт с этим e-mail уже существует. Попробуйте войти.",
        status_check_email: "Проверьте почту и перейдите по ссылке подтверждения, чтобы завершить регистрацию.",
        err_email_first: "Сначала введите свой e-mail выше.",
        status_recovery_email_sent: "Мы отправили ссылку для восстановления пароля на вашу почту.",
        status_email_may_be_delayed: "Из-за высокой нагрузки отправка письма сегодня может занять чуть больше времени — если через некоторое время ничего не придёт, вернитесь сюда и нажмите «Отправить письмо ещё раз».",
        btn_resend_email: "Отправить письмо ещё раз",
        status_resend_sent: "Мы отправили новое письмо — проверьте почту.",
        err_google_account_exists: "Аккаунт с этим адресом Google уже существует. Пожалуйста, войдите.",
        recovery_title: "Задайте новый пароль для аккаунта:",
        placeholder_new_password: "новый пароль (мин. 6 символов)", btn_set_new_password: "Установить новый пароль",
        err_password_min: "Пароль должен содержать минимум 6 символов.",
        recovery_success: "Пароль установлен! Теперь вы можете пользоваться приложением.",
        err_invalid_credentials: "Неверный e-mail или пароль.",
        err_email_not_confirmed: "Подтвердите e-mail — проверьте почту и перейдите по отправленной ссылке.",
        err_invalid_email_format: "Неверный формат e-mail.",
        err_captcha_generic: "Подтвердите, что вы не робот (отметьте галочку выше), и попробуйте снова.",
        account_aria_label: "Ваш аккаунт", credit_balance_label: "Баланс кредитов", account_back: "← Назад в Gakori", account_title: "Ваш аккаунт",
        loading: "Загрузка...", account_logged_in_as: "Вы вошли как:",
        btn_logout: "Выйти", link_change_password: "Изменить пароль", btn_save_password: "Сохранить новый пароль",
        password_changed: "Пароль изменён.",
        account_load_error: "Не удалось загрузить данные аккаунта (проверьте подключение и обновите страницу).",
        language_label: "Язык приложения",
        theme_label: "Тема", theme_light: "Светлая", theme_dark: "Тёмная",
        username_label: "Имя пользователя", btn_save_username: "Сохранить имя", username_saved: "Имя пользователя сохранено.",
        username_cooldown_note: "Сможете изменить снова начиная с: {date}",
        err_username_length: "Имя должно содержать от 2 до 24 символов.", err_username_cooldown: "Имя пользователя можно менять не чаще раза в 14 дней.",
        err_username_taken: "Это имя уже занято — выберите другое.",
        err_username_forbidden: "Это имя содержит запрещённое слово — выберите другое.",
        tab_link: "Ссылка", tab_text: "Текст", tab_image: "Изображение",
        label_paste_link: "Вставьте ссылку для анализа:", placeholder_url: "https://...",
        label_paste_text: "Вставьте текст для анализа:", placeholder_text_content: "Вставьте содержимое, которое хотите проанализировать...", label_text_source_url_optional: "Необязательно: ссылка на источник (будет добавлена к результату):",
        label_choose_image: "Выберите изображение для анализа:", btn_choose_image: "Выбрать изображение",
        btn_analyze: "Анализировать",
        analyze_label_url: "Анализировать страницу", analyze_label_text: "Анализировать текст", analyze_label_image: "Анализировать изображение",
        status_analyzing: "Анализируем...",
        status_step_1: "Отправляю содержимое на проверку...", status_step_2: "Проверяю, не анализировали ли это уже...",
        status_step_3: "Определяю, какие приёмы искать...", status_step_4: "Внимательно читаю текст...",
        status_step_5: "Ищу конкретные цитаты...", status_step_6: "Почти готово...",
        status_step_7: "Сравниваю с библиотекой известных приёмов...", status_step_8: "Проверяю контекст каждого предложения...",
        status_step_9: "Оцениваю, манипуляция это или обоснованное рассуждение...", status_step_10: "Подбираю наиболее точные названия для найденных приёмов...",
        status_step_11: "Привожу результат в читаемый вид...", status_step_12: "Последние штрихи...",
        alert_enter_link: "Введите ссылку!", alert_paste_text: "Вставьте текст!", alert_choose_image: "Выберите изображение!", alert_image_too_large: "Этот файл слишком большой (лимит 8 МБ).",
        status_err_prefix: "❌ Ошибка: ",
        badge_manipulation: "Манипуляция: {score}/100", badge_clean: "Чистый текст: {score}/100", badge_partial: "Частично: {score}/100",
        badge_info: "Инфо", result_generic_error: "Что-то пошло не так. Попробуйте снова через некоторое время.",
        err_signup_required: "Зарегистрируйтесь, чтобы продолжить.",
        err_insufficient_credits: "У вас недостаточно кредитов для этого.",
        err_url_fetch_failed: "Не удалось получить содержимое этой страницы — проверьте, что ссылка верна и общедоступна. Вы также можете скопировать текст статьи и вставить его в режиме «Текст» — это сработает независимо от этой проблемы.",
        err_system_paused: "Gakori временно приостановлен — наша команда уже знает об этом и работает над решением. Попробуйте ещё раз через некоторое время.",
        err_save_failed: "Не удалось сохранить результат анализа. Попробуйте снова.",
        err_too_many_failed_attempts: "Слишком много неудачных попыток анализа подряд. Повторите попытку через {time}.",
        retry_minutes: "{minutes} мин", retry_hours: "{hours} ч", retry_days: "{days} дн.",
        rate_limit_expired: "Теперь можно попробовать снова.",
        err_invalid_image: "Это не распознаваемый файл изображения (JPEG/PNG/GIF/WEBP).",
        err_unsafe_content: "Это изображение содержит контент, запрещённый в Gakori (например, наготу, насилие, шокирующие сцены), и не может быть проанализировано. Согласно правилам, эта попытка всё равно была списана как обычный анализ.",
        err_too_many_images: "Можно анализировать не более {max} изображений за раз.",
        label_images_selected: "Выбрано {count}/{max} изображений",
        alert_max_images: "Можно добавить не более {max} изображений за раз.",
        tab_pdf: "PDF", analyze_label_pdf: "Анализировать PDF", label_choose_pdf: "Выберите PDF-файл для анализа:", btn_choose_pdf: "Выбрать PDF", label_pdf_selected: "Выбран файл: {name}", label_pdf_large_file_notice: "(большой файл — загрузка может занять некоторое время)", alert_choose_pdf: "Выбранный файл не является PDF.", alert_choose_pdf_file: "Сначала выберите PDF-файл.", alert_pdf_too_large: "PDF-файл слишком большой (лимит 10 МБ).", pdf_confirm_title: "Подтвердите анализ", pdf_confirm_pages: "Количество страниц: {count}", pdf_confirm_cost: "Стоимость: {cost} кредитов", pdf_confirm_wait_notice: "Более длинные файлы могут анализироваться заметно дольше обычного — это нормально.", btn_pdf_confirm_yes: "Да, анализировать", btn_pdf_confirm_no: "Отмена", err_invalid_pdf: "Загруженный файл не является корректным PDF.", err_pdf_too_long: "В этом файле {count} страниц — максимум поддерживается {max}.", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "Убрать это изображение",
        image_not_saved_notice: "Это изображение анализируется на лету и не сохраняется в нашей системе — его видите только вы, сейчас.",
        label_paste_image_zone: "Вставьте изображение сюда (например, скриншот)",
        alert_paste_not_image: "То, что вы скопировали, не содержит изображения (только текст) — попробуйте вместо этого кнопку «Выбрать изображение».",
        err_file_too_large: "Этот файл слишком большой (лимит 8 МБ).",
        public_scans_heading: "Найти анализ", placeholder_search: "Поиск по ключевым словам...",
        public_scans_empty: "Здесь пока пусто — станьте первым!",
        public_scans_no_results: "Нет результатов по запросу \"{query}\".", public_scans_load_error: "Не удалось загрузить.",
        scan_not_found: "Такой анализ не найден.", scan_source_label: "Источник: ", scan_text_source_label: "Показать полный исходный текст", btn_copy_source_text: "Копировать", btn_copy_source_text_done: "Скопировано!", scan_text_source_char_count: "{count} симв.",
        manual_source_notice: "Этот текст был вручную вставлен пользователем, а не получен напрямую со страницы.",
        btn_report_mismatch: "Сообщить о несоответствии с источником", btn_force_refresh: "Проверить, не изменилось ли что-то",
        status_mismatch_reported: "Спасибо за сообщение — мы проверим.",
        live_cost_estimate: "Примерная стоимость: {cost} кредитов", cost_free_cache_notice: "Бесплатно — из памяти", scan_view_count: "Просмотрено {count} раз",
        url_confirm_char_count: "Для анализа: {count} символов", url_confirm_clean_notice: "Цена уже учитывает очистку страницы от меню, рекламы и других элементов, не связанных с содержанием статьи.",
        btn_paste_own_content: "Не согласны? Вставьте свой текст",
        force_refresh_confirm_cost: "Проверка и повторный анализ будут стоить {cost} кредитов. Продолжить?",
        scan_retracted_notice: "Этот контент был автоматически отозван — многие сообщили, что он больше не соответствует текущему содержанию источника. Результат по-прежнему виден, но больше не предоставляется другим как актуальный.",
        scan_pdf_source_label: "Файл: ", pattern_page_label: "Страница {page}", pattern_image_label: "Изображение {index}", link_pdf_history: "Ваши анализы PDF →", history_back: "← Назад в аккаунт", history_title: "Ваши анализы PDF", history_intro: "Этот список видите только вы — анализы PDF не публичные.", history_empty: "У вас пока нет ни одного анализа PDF.", history_unnamed_file: "файл без названия",
        tip_label: "Что делать сейчас:", pattern_tag_manipulation: "ПРИЁМ", pattern_tag_reasoning: "НАБЛЮДЕНИЕ", summary_label: "Итог",
        scan_load_error: "Не удалось загрузить анализ (проверьте подключение и обновите страницу).",
    },
    zh: {
        tab_login: "登录", tab_signup: "注册",
        placeholder_email: "电子邮箱", placeholder_password: "密码（至少6个字符）",
        btn_login: "登录", btn_signup: "注册",
        link_forgot_password: "忘记密码？", divider_or: "— 或 —",
        btn_google_login: "使用 Google 登录", btn_google_signup: "使用 Google 注册",
        err_provide_credentials: "请输入邮箱和密码。",
        err_captcha_required: "请勾选上方的“我不是机器人”。",
        status_please_wait: "请稍候…",
        err_account_exists_login: "该邮箱已注册账户，请尝试登录。",
        status_check_email: "请查收邮件并点击确认链接以完成注册。",
        err_email_first: "请先在上方输入您的邮箱。",
        status_recovery_email_sent: "我们已将密码找回链接发送到您的邮箱。",
        status_email_may_be_delayed: "由于访问量较大，今天邮件发送可能会稍有延迟——如果过一会儿还没收到，请返回这里点击「重新发送邮件」。",
        btn_resend_email: "重新发送邮件",
        status_resend_sent: "我们已发送新邮件——请查收。",
        err_google_account_exists: "该 Google 邮箱已注册账户，请改为登录。",
        recovery_title: "为您的账户设置新密码：",
        placeholder_new_password: "新密码（至少6个字符）", btn_set_new_password: "设置新密码",
        err_password_min: "密码至少需要6个字符。",
        recovery_success: "密码已设置！现在可以使用应用了。",
        err_invalid_credentials: "邮箱或密码不正确。",
        err_email_not_confirmed: "请确认您的邮箱——查收邮件并点击我们发送的链接。",
        err_invalid_email_format: "邮箱格式无效。",
        err_captcha_generic: "请确认您不是机器人（勾选上方方框）并重试。",
        account_aria_label: "您的账户", credit_balance_label: "积分余额", account_back: "← 返回 Gakori", account_title: "您的账户",
        loading: "加载中…", account_logged_in_as: "已登录为：",
        btn_logout: "退出登录", link_change_password: "修改密码", btn_save_password: "保存新密码",
        password_changed: "密码已修改。",
        account_load_error: "无法加载账户数据（请检查网络连接并刷新页面）。",
        language_label: "应用语言",
        theme_label: "主题", theme_light: "浅色", theme_dark: "深色",
        username_label: "用户名", btn_save_username: "保存名称", username_saved: "用户名已保存。",
        username_cooldown_note: "下次可修改时间：{date}",
        err_username_length: "名称长度须为2到24个字符。", err_username_cooldown: "用户名每14天只能修改一次。",
        err_username_taken: "该名称已被占用，请换一个。",
        err_username_forbidden: "该名称包含不允许的词语，请换一个。",
        tab_link: "链接", tab_text: "文本", tab_image: "图片",
        label_paste_link: "粘贴要分析的链接：", placeholder_url: "https://...",
        label_paste_text: "粘贴要分析的文本：", placeholder_text_content: "粘贴您想分析的内容…", label_text_source_url_optional: "可选：来源链接（会添加到结果中）：",
        label_choose_image: "选择要分析的图片：", btn_choose_image: "选择图片",
        btn_analyze: "分析",
        analyze_label_url: "分析网页", analyze_label_text: "分析文本", analyze_label_image: "分析图片",
        status_analyzing: "分析中…",
        status_step_1: "正在发送内容以供检查…", status_step_2: "正在检查是否已经分析过…",
        status_step_3: "正在确定要寻找哪些模式…", status_step_4: "正在仔细阅读内容…",
        status_step_5: "正在查找具体引用…", status_step_6: "快好了…",
        status_step_7: "正在与已知模式库进行比对…", status_step_8: "正在检查每句话的语境…",
        status_step_9: "正在判断这是操纵还是合理的论证…", status_step_10: "正在为发现的模式挑选最贴切的名称…",
        status_step_11: "正在整理成易读的结果…", status_step_12: "最后润色中…",
        alert_enter_link: "请输入链接！", alert_paste_text: "请粘贴一些文本！", alert_choose_image: "请选择一张图片！", alert_image_too_large: "这个文件太大了（限制 8 MB）。",
        status_err_prefix: "❌ 错误：",
        badge_manipulation: "操纵：{score}/100", badge_clean: "内容干净：{score}/100", badge_partial: "部分操纵：{score}/100",
        badge_info: "信息", result_generic_error: "出了点问题，请稍后重试。",
        err_signup_required: "请注册账户以继续。",
        err_insufficient_credits: "您的积分不足。",
        err_url_fetch_failed: "无法获取该页面的内容——请检查链接是否正确且可公开访问。你也可以复制文章文本，粘贴到「文本」模式中——这不受此问题影响。",
        err_system_paused: "Gakori 暂时停止服务——我们的团队已经知晓并正在处理。请稍后再试。",
        err_save_failed: "无法保存分析结果，请重试。",
        err_too_many_failed_attempts: "连续太多次分析失败。请在 {time} 后重试。",
        retry_minutes: "{minutes} 分钟", retry_hours: "{hours} 小时", retry_days: "{days} 天",
        rate_limit_expired: "现在可以重试了。",
        err_invalid_image: "这不是可识别的图片文件（JPEG/PNG/GIF/WEBP）。",
        err_unsafe_content: "这张图片包含 Gakori 不允许的内容（例如裸露、暴力、令人不适的画面），无法进行分析。根据规则，本次尝试仍将按正常分析扣费。",
        err_too_many_images: "一次最多可以分析 {max} 张图片。",
        label_images_selected: "已选择 {count}/{max} 张图片",
        alert_max_images: "一次最多可以添加 {max} 张图片。",
        tab_pdf: "PDF", analyze_label_pdf: "分析 PDF", label_choose_pdf: "选择要分析的 PDF 文件：", btn_choose_pdf: "选择 PDF", label_pdf_selected: "已选择文件：{name}", label_pdf_large_file_notice: "(文件较大 — 上传可能需要一些时间)", alert_choose_pdf: "所选文件不是 PDF。", alert_choose_pdf_file: "请先选择一个 PDF 文件。", alert_pdf_too_large: "PDF 文件过大（限制 10 MB）。", pdf_confirm_title: "确认分析", pdf_confirm_pages: "页数：{count}", pdf_confirm_cost: "费用：{cost} 积分", pdf_confirm_wait_notice: "较长的文件分析时间可能明显更久，这是正常的。", btn_pdf_confirm_yes: "是，分析", btn_pdf_confirm_no: "取消", err_invalid_pdf: "上传的文件不是有效的 PDF。", err_pdf_too_long: "此文件有 {count} 页 — 我们最多支持 {max} 页。", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "移除这张图片",
        image_not_saved_notice: "这张图片是即时分析的，不会保存在我们的系统中——现在只有你能看到它。",
        label_paste_image_zone: "在此粘贴图片（例如截图）",
        alert_paste_not_image: "你复制的内容不包含图片（只有文本）——请改用「选择图片」按钮。",
        err_file_too_large: "这个文件太大了（限制 8 MB）。",
        public_scans_heading: "搜索分析", placeholder_search: "按关键词搜索…",
        public_scans_empty: "这里还没有内容——成为第一个吧！",
        public_scans_no_results: "没有找到与“{query}”相关的结果。", public_scans_load_error: "加载失败。",
        scan_not_found: "未找到该分析。", scan_source_label: "来源：", scan_text_source_label: "显示完整原文", btn_copy_source_text: "复制", btn_copy_source_text_done: "已复制！", scan_text_source_char_count: "{count} 字符",
        manual_source_notice: "此内容是用户手动粘贴的，并非直接从页面抓取。",
        btn_report_mismatch: "举报与原文不符", btn_force_refresh: "检查是否有变化",
        status_mismatch_reported: "感谢举报——我们会核查。",
        live_cost_estimate: "预估费用：{cost} 积分", cost_free_cache_notice: "免费——来自缓存", scan_view_count: "已查看 {count} 次",
        url_confirm_char_count: "待分析：{count} 个字符", url_confirm_clean_notice: "价格已包含清理页面中与文章内容无关的菜单、广告等元素的成本。",
        btn_paste_own_content: "不同意？粘贴你自己的内容",
        force_refresh_confirm_cost: "检查并重新分析将花费 {cost} 积分。是否继续？",
        scan_retracted_notice: "此内容已被自动撤回——许多人报告它与当前来源内容不再一致。结果仍然可见，但不再作为最新内容提供给其他人。",
        scan_pdf_source_label: "文件：", pattern_page_label: "第 {page} 页", pattern_image_label: "图片 {index}", link_pdf_history: "你的 PDF 分析 →", history_back: "← 返回账户", history_title: "你的 PDF 分析", history_intro: "只有你能看到这份列表——PDF 分析不公开。", history_empty: "你还没有任何 PDF 分析。", history_unnamed_file: "未命名文件",
        tip_label: "现在该怎么做：", pattern_tag_manipulation: "手法", pattern_tag_reasoning: "观察", summary_label: "总结",
        scan_load_error: "无法加载分析结果（请检查网络连接并刷新页面）。",
    },
    ja: {
        tab_login: "ログイン", tab_signup: "新規登録",
        placeholder_email: "メールアドレス", placeholder_password: "パスワード（6文字以上）",
        btn_login: "ログイン", btn_signup: "登録する",
        link_forgot_password: "パスワードをお忘れですか？", divider_or: "— または —",
        btn_google_login: "Googleでログイン", btn_google_signup: "Googleで登録",
        err_provide_credentials: "メールアドレスとパスワードを入力してください。",
        err_captcha_required: "上の「私はロボットではありません」にチェックを入れてください。",
        status_please_wait: "少々お待ちください…",
        err_account_exists_login: "このメールアドレスのアカウントは既に存在します。ログインをお試しください。",
        status_check_email: "メールを確認し、確認リンクをクリックして登録を完了してください。",
        err_email_first: "まず上にメールアドレスを入力してください。",
        status_recovery_email_sent: "パスワードの復旧用リンクをメールで送信しました。",
        status_email_may_be_delayed: "アクセスが集中しているため、本日はメールの送信に少し時間がかかることがあります — しばらく待っても届かない場合は、ここに戻って「メールを再送する」をクリックしてください。",
        btn_resend_email: "メールを再送する",
        status_resend_sent: "新しいメールを送信しました — 受信箱をご確認ください。",
        err_google_account_exists: "このGoogleアドレスのアカウントは既に存在します。代わりにログインしてください。",
        recovery_title: "アカウントの新しいパスワードを設定してください：",
        placeholder_new_password: "新しいパスワード（6文字以上）", btn_set_new_password: "新しいパスワードを設定",
        err_password_min: "パスワードは6文字以上にしてください。",
        recovery_success: "パスワードが設定されました！アプリを利用できます。",
        err_invalid_credentials: "メールアドレスまたはパスワードが正しくありません。",
        err_email_not_confirmed: "メールアドレスを確認してください — 受信トレイを確認し、送信されたリンクをクリックしてください。",
        err_invalid_email_format: "メールアドレスの形式が正しくありません。",
        err_captcha_generic: "ロボットではないことを確認し（上のチェックボックスをクリック）、もう一度お試しください。",
        account_aria_label: "アカウント", credit_balance_label: "クレジット残高", account_back: "← Gakoriに戻る", account_title: "アカウント",
        loading: "読み込み中…", account_logged_in_as: "ログイン中：",
        btn_logout: "ログアウト", link_change_password: "パスワードを変更", btn_save_password: "新しいパスワードを保存",
        password_changed: "パスワードを変更しました。",
        account_load_error: "アカウント情報を読み込めませんでした（接続を確認してページを再読み込みしてください）。",
        language_label: "アプリの言語",
        theme_label: "テーマ", theme_light: "ライト", theme_dark: "ダーク",
        username_label: "ユーザー名", btn_save_username: "名前を保存", username_saved: "ユーザー名を保存しました。",
        username_cooldown_note: "次に変更できるのは: {date} から",
        err_username_length: "名前は2〜24文字で入力してください。", err_username_cooldown: "ユーザー名の変更は14日に1回までです。",
        err_username_taken: "その名前はすでに使われています。別の名前を選んでください。",
        err_username_forbidden: "その名前には使用できない単語が含まれています。別の名前を選んでください。",
        tab_link: "リンク", tab_text: "テキスト", tab_image: "画像",
        label_paste_link: "分析するリンクを貼り付けてください：", placeholder_url: "https://...",
        label_paste_text: "分析するテキストを貼り付けてください：", placeholder_text_content: "分析したい内容を貼り付けてください…", label_text_source_url_optional: "任意：出典リンク（結果に追加されます）：",
        label_choose_image: "分析する画像を選択してください：", btn_choose_image: "画像を選択",
        btn_analyze: "分析する",
        analyze_label_url: "ページを分析", analyze_label_text: "テキストを分析", analyze_label_image: "画像を分析",
        status_analyzing: "分析中…",
        status_step_1: "内容を送信して確認しています…", status_step_2: "すでに分析済みか確認しています…",
        status_step_3: "探すべきパターンを見極めています…", status_step_4: "内容をじっくり読んでいます…",
        status_step_5: "具体的な引用を探しています…", status_step_6: "もうすぐ完了します…",
        status_step_7: "既知のパターンのライブラリと照合しています…", status_step_8: "各文の文脈を確認しています…",
        status_step_9: "操作なのか、妥当な推論なのかを判断しています…", status_step_10: "見つかったパターンに最も適した名前を選んでいます…",
        status_step_11: "結果を読みやすい形に整えています…", status_step_12: "最後の仕上げをしています…",
        alert_enter_link: "リンクを入力してください！", alert_paste_text: "テキストを貼り付けてください！", alert_choose_image: "画像を選択してください！", alert_image_too_large: "このファイルは大きすぎます（上限8MB）。",
        status_err_prefix: "❌ エラー：",
        badge_manipulation: "操作あり：{score}/100", badge_clean: "クリーンなテキスト：{score}/100", badge_partial: "一部操作あり：{score}/100",
        badge_info: "情報", result_generic_error: "問題が発生しました。しばらくしてからもう一度お試しください。",
        err_signup_required: "続けるにはアカウントを作成してください。",
        err_insufficient_credits: "クレジットが不足しています。",
        err_url_fetch_failed: "このページの内容を取得できませんでした — リンクが正しく、一般公開されているか確認してください。記事のテキストをコピーして「テキスト」モードに貼り付けることもできます — この問題とは関係なく動作します。",
        err_system_paused: "Gakoriは一時的に停止しています — チームはすでに把握しており、対応中です。しばらくしてからもう一度お試しください。",
        err_save_failed: "分析結果を保存できませんでした。もう一度お試しください。",
        err_too_many_failed_attempts: "分析の失敗が続きました。{time}後にもう一度お試しください。",
        retry_minutes: "{minutes}分", retry_hours: "{hours}時間", retry_days: "{days}日",
        rate_limit_expired: "もう一度お試しいただけます。",
        err_invalid_image: "これは認識できる画像ファイル（JPEG/PNG/GIF/WEBP）ではありません。",
        err_unsafe_content: "この画像にはGakoriで許可されていない内容（ヌード、暴力、ショッキングな描写など）が含まれているため、分析できません。規約に基づき、この試行にも通常の分析と同じ料金が発生しています。",
        err_too_many_images: "一度に分析できる画像は最大{max}枚です。",
        label_images_selected: "{count}/{max}枚の画像を選択済み",
        alert_max_images: "一度に追加できる画像は最大{max}枚です。",
        tab_pdf: "PDF", analyze_label_pdf: "PDFを分析", label_choose_pdf: "分析するPDFファイルを選択:", btn_choose_pdf: "PDFを選択", label_pdf_selected: "選択したファイル: {name}", label_pdf_large_file_notice: "(大きいファイル — アップロードに時間がかかる場合があります)", alert_choose_pdf: "選択したファイルはPDFではありません。", alert_choose_pdf_file: "先にPDFファイルを選択してください。", alert_pdf_too_large: "PDFファイルが大きすぎます(上限10MB)。", pdf_confirm_title: "分析を確認", pdf_confirm_pages: "ページ数: {count}", pdf_confirm_cost: "費用: {cost} クレジット", pdf_confirm_wait_notice: "長いファイルは通常より明らかに時間がかかることがあります — 正常な動作です。", btn_pdf_confirm_yes: "はい、分析する", btn_pdf_confirm_no: "キャンセル", err_invalid_pdf: "アップロードされたファイルは有効なPDFではありません。", err_pdf_too_long: "このファイルは{count}ページあります — 対応できるのは最大{max}ページです。", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "この画像を削除",
        image_not_saved_notice: "この画像はその場で分析され、システムには保存されません — 今、これを見ているのはあなただけです。",
        label_paste_image_zone: "ここに画像を貼り付け（スクリーンショットなど）",
        alert_paste_not_image: "コピーした内容に画像が含まれていません（テキストのみ）— 代わりに「画像を選択」ボタンをお試しください。",
        err_file_too_large: "このファイルは大きすぎます（上限8MB）。",
        public_scans_heading: "分析を検索", placeholder_search: "キーワードで検索…",
        public_scans_empty: "まだ何もありません — あなたが最初になりましょう！",
        public_scans_no_results: "「{query}」に一致する結果はありません。", public_scans_load_error: "読み込みに失敗しました。",
        scan_not_found: "この分析結果は見つかりませんでした。", scan_source_label: "出典：", scan_text_source_label: "元のテキスト全文を表示", btn_copy_source_text: "コピー", btn_copy_source_text_done: "コピーしました！", scan_text_source_char_count: "{count} 文字",
        manual_source_notice: "このコンテンツはユーザーが手動で貼り付けたものであり、ページから直接取得したものではありません。",
        btn_report_mismatch: "元のページと異なる内容を報告する", btn_force_refresh: "変更がないか確認する",
        status_mismatch_reported: "報告ありがとうございます — 確認します。",
        live_cost_estimate: "概算費用: {cost} クレジット", cost_free_cache_notice: "無料 — キャッシュから", scan_view_count: "{count} 回閲覧されました",
        url_confirm_char_count: "分析対象: {count} 文字", url_confirm_clean_notice: "この価格には、メニューや広告など記事内容と関係のない要素をページから取り除く処理がすでに含まれています。",
        btn_paste_own_content: "納得できない場合は、自分で内容を貼り付ける",
        force_refresh_confirm_cost: "確認と再分析には {cost} クレジットかかります。続けますか?",
        scan_retracted_notice: "このコンテンツは自動的に撤回されました — 多くの人が、現在の元コンテンツと一致しなくなったと報告しています。結果は引き続き表示されますが、他の人には最新の内容として提供されなくなります。",
        scan_pdf_source_label: "ファイル：", pattern_page_label: "{page} ページ", pattern_image_label: "画像 {index}", link_pdf_history: "あなたのPDF分析 →", history_back: "← アカウントに戻る", history_title: "あなたのPDF分析", history_intro: "このリストはあなただけが見ることができます — PDFの分析は公開されません。", history_empty: "まだPDFの分析はありません。", history_unnamed_file: "名前のないファイル",
        tip_label: "今できること：", pattern_tag_manipulation: "パターン", pattern_tag_reasoning: "気づき", summary_label: "まとめ",
        scan_load_error: "分析結果を読み込めませんでした（接続を確認してページを再読み込みしてください）。",
    },
    hi: {
        tab_login: "लॉग इन करें", tab_signup: "साइन अप करें",
        placeholder_email: "ईमेल", placeholder_password: "पासवर्ड (कम से कम 6 अक्षर)",
        btn_login: "लॉग इन करें", btn_signup: "साइन अप करें",
        link_forgot_password: "पासवर्ड भूल गए?", divider_or: "— या —",
        btn_google_login: "Google से लॉग इन करें", btn_google_signup: "Google से साइन अप करें",
        err_provide_credentials: "कृपया ईमेल और पासवर्ड दर्ज करें।",
        err_captcha_required: "कृपया ऊपर \"मैं रोबोट नहीं हूं\" चेकबॉक्स चुनें।",
        status_please_wait: "कृपया प्रतीक्षा करें...",
        err_account_exists_login: "इस ईमेल से खाता पहले से मौजूद है। कृपया लॉग इन करने का प्रयास करें।",
        status_check_email: "पंजीकरण पूरा करने के लिए अपना ईमेल जांचें और पुष्टिकरण लिंक पर क्लिक करें।",
        err_email_first: "पहले ऊपर अपना ईमेल दर्ज करें।",
        status_recovery_email_sent: "हमने आपके ईमेल पर पासवर्ड पुनर्प्राप्ति लिंक भेज दिया है।",
        status_email_may_be_delayed: "अधिक ट्रैफ़िक के कारण आज ईमेल भेजने में थोड़ा समय लग सकता है — अगर कुछ देर बाद भी कुछ न दिखे, तो यहां वापस आकर 'ईमेल फिर से भेजें' पर क्लिक करें।",
        btn_resend_email: "ईमेल फिर से भेजें",
        status_resend_sent: "हमने एक नया ईमेल भेज दिया है — अपना इनबॉक्स देखें।",
        err_google_account_exists: "इस Google पते से खाता पहले से मौजूद है। कृपया इसके बजाय लॉग इन करें।",
        recovery_title: "अपने खाते के लिए नया पासवर्ड सेट करें:",
        placeholder_new_password: "नया पासवर्ड (कम से कम 6 अक्षर)", btn_set_new_password: "नया पासवर्ड सेट करें",
        err_password_min: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए।",
        recovery_success: "पासवर्ड सेट हो गया! अब आप ऐप का उपयोग कर सकते हैं।",
        err_invalid_credentials: "गलत ईमेल या पासवर्ड।",
        err_email_not_confirmed: "अपना ईमेल सत्यापित करें — इनबॉक्स जांचें और भेजे गए लिंक पर क्लिक करें।",
        err_invalid_email_format: "अमान्य ईमेल फॉर्मेट।",
        err_captcha_generic: "पुष्टि करें कि आप रोबोट नहीं हैं (ऊपर चेकबॉक्स चुनें) और फिर से प्रयास करें।",
        account_aria_label: "आपका खाता", credit_balance_label: "क्रेडिट बैलेंस", account_back: "← Gakori पर वापस जाएं", account_title: "आपका खाता",
        loading: "लोड हो रहा है...", account_logged_in_as: "इस रूप में लॉग इन:",
        btn_logout: "लॉग आउट करें", link_change_password: "पासवर्ड बदलें", btn_save_password: "नया पासवर्ड सहेजें",
        password_changed: "पासवर्ड बदल दिया गया।",
        account_load_error: "खाते का डेटा लोड नहीं हो सका (कनेक्शन जांचें और पेज रीलोड करें)।",
        language_label: "ऐप की भाषा",
        theme_label: "थीम", theme_light: "हल्की", theme_dark: "गहरी",
        username_label: "उपयोगकर्ता नाम", btn_save_username: "नाम सहेजें", username_saved: "उपयोगकर्ता नाम सहेजा गया।",
        username_cooldown_note: "आप इसे फिर से बदल सकेंगे: {date} से",
        err_username_length: "नाम 2 से 24 अक्षरों के बीच होना चाहिए।", err_username_cooldown: "उपयोगकर्ता नाम हर 14 दिनों में केवल एक बार बदला जा सकता है।",
        err_username_taken: "यह नाम पहले से लिया जा चुका है — कोई और नाम चुनें।",
        err_username_forbidden: "इस नाम में एक अस्वीकृत शब्द है — कोई और नाम चुनें।",
        tab_link: "लिंक", tab_text: "टेक्स्ट", tab_image: "छवि",
        label_paste_link: "विश्लेषण के लिए लिंक पेस्ट करें:", placeholder_url: "https://...",
        label_paste_text: "विश्लेषण के लिए टेक्स्ट पेस्ट करें:", placeholder_text_content: "वह सामग्री पेस्ट करें जिसका आप विश्लेषण करना चाहते हैं...", label_text_source_url_optional: "वैकल्पिक: स्रोत लिंक (परिणाम में जोड़ा जाएगा):",
        label_choose_image: "विश्लेषण के लिए एक छवि चुनें:", btn_choose_image: "छवि चुनें",
        btn_analyze: "विश्लेषण करें",
        analyze_label_url: "पेज का विश्लेषण करें", analyze_label_text: "टेक्स्ट का विश्लेषण करें", analyze_label_image: "छवि का विश्लेषण करें",
        status_analyzing: "विश्लेषण हो रहा है...",
        status_step_1: "जांच के लिए सामग्री भेज रहे हैं...", status_step_2: "जांच रहे हैं कि क्या यह पहले से विश्लेषित है...",
        status_step_3: "पता लगा रहे हैं कि किन पैटर्न को खोजना है...", status_step_4: "सामग्री को ध्यान से पढ़ रहे हैं...",
        status_step_5: "सटीक उद्धरण खोज रहे हैं...", status_step_6: "लगभग तैयार है...",
        status_step_7: "ज्ञात पैटर्न की लाइब्रेरी से तुलना कर रहे हैं...", status_step_8: "हर वाक्य का संदर्भ जांच रहे हैं...",
        status_step_9: "आकलन कर रहे हैं कि यह हेरफेर है या ठोस तर्क...", status_step_10: "मिले पैटर्न के लिए सबसे उपयुक्त नाम चुन रहे हैं...",
        status_step_11: "परिणाम को पढ़ने योग्य रूप में ढाल रहे हैं...", status_step_12: "अंतिम रूप दे रहे हैं...",
        alert_enter_link: "एक लिंक दर्ज करें!", alert_paste_text: "कुछ टेक्स्ट पेस्ट करें!", alert_choose_image: "एक छवि चुनें!", alert_image_too_large: "यह फ़ाइल बहुत बड़ी है (सीमा 8 MB)।",
        status_err_prefix: "❌ त्रुटि: ",
        badge_manipulation: "मैनिपुलेशन: {score}/100", badge_clean: "स्वच्छ टेक्स्ट: {score}/100", badge_partial: "आंशिक: {score}/100",
        badge_info: "जानकारी", result_generic_error: "कुछ गलत हो गया। कृपया थोड़ी देर बाद फिर से प्रयास करें।",
        err_signup_required: "जारी रखने के लिए खाता बनाएं।",
        err_insufficient_credits: "इसके लिए आपके पास पर्याप्त क्रेडिट नहीं हैं।",
        err_url_fetch_failed: "हम इस पेज की सामग्री प्राप्त नहीं कर सके — जांचें कि लिंक सही है और सार्वजनिक रूप से उपलब्ध है। आप लेख का टेक्स्ट कॉपी करके “टेक्स्ट” मोड में पेस्ट भी कर सकते हैं — यह इस समस्या के बावजूद काम करेगा।",
        err_system_paused: "Gakori अभी अस्थायी रूप से रुका हुआ है — हमारी टीम को पहले से पता है और वे इस पर काम कर रहे हैं। कृपया थोड़ी देर बाद फिर से कोशिश करें।",
        err_save_failed: "विश्लेषण परिणाम सहेजा नहीं जा सका। कृपया पुनः प्रयास करें।",
        err_too_many_failed_attempts: "लगातार बहुत सारे विश्लेषण प्रयास असफल हुए। {time} बाद फिर कोशिश करें।",
        retry_minutes: "{minutes} मिनट", retry_hours: "{hours} घंटे", retry_days: "{days} दिन",
        rate_limit_expired: "अब आप फिर से कोशिश कर सकते हैं।",
        err_invalid_image: "यह एक पहचानने योग्य छवि फ़ाइल (JPEG/PNG/GIF/WEBP) नहीं है।",
        err_unsafe_content: "इस छवि में ऐसी सामग्री है जो Gakori पर अनुमति नहीं है (जैसे नग्नता, हिंसा, भयावह दृश्य), इसलिए इसका विश्लेषण नहीं किया जा सकता। हमारे नियमों के अनुसार, इस प्रयास के लिए भी सामान्य विश्लेषण जितना ही शुल्क लिया गया है।",
        err_too_many_images: "एक बार में अधिकतम {max} छवियों का विश्लेषण किया जा सकता है।",
        label_images_selected: "{count}/{max} छवियां चुनी गईं",
        alert_max_images: "आप एक बार में अधिकतम {max} छवियां जोड़ सकते हैं।",
        tab_pdf: "PDF", analyze_label_pdf: "PDF का विश्लेषण करें", label_choose_pdf: "विश्लेषण के लिए एक PDF फ़ाइल चुनें:", btn_choose_pdf: "PDF चुनें", label_pdf_selected: "चुनी गई फ़ाइल: {name}", label_pdf_large_file_notice: "(बड़ी फ़ाइल — अपलोड होने में समय लग सकता है)", alert_choose_pdf: "चुनी गई फ़ाइल PDF नहीं है।", alert_choose_pdf_file: "पहले एक PDF फ़ाइल चुनें।", alert_pdf_too_large: "PDF फ़ाइल बहुत बड़ी है (सीमा 10 MB)।", pdf_confirm_title: "विश्लेषण की पुष्टि करें", pdf_confirm_pages: "पृष्ठों की संख्या: {count}", pdf_confirm_cost: "लागत: {cost} क्रेडिट", pdf_confirm_wait_notice: "लंबी फ़ाइलों के विश्लेषण में सामान्य से काफी अधिक समय लग सकता है — यह सामान्य है।", btn_pdf_confirm_yes: "हां, विश्लेषण करें", btn_pdf_confirm_no: "रद्द करें", err_invalid_pdf: "अपलोड की गई फ़ाइल मान्य PDF नहीं है।", err_pdf_too_long: "इस फ़ाइल में {count} पृष्ठ हैं — हम अधिकतम {max} तक समर्थन देते हैं।", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "यह छवि हटाएं",
        image_not_saved_notice: "यह छवि तुरंत विश्लेषित की जाती है और हमारे सिस्टम में सहेजी नहीं जाती — इसे अभी केवल आप ही देख रहे हैं।",
        label_paste_image_zone: "यहाँ एक छवि चिपकाएं (जैसे स्क्रीनशॉट)",
        alert_paste_not_image: "आपने जो कॉपी किया उसमें कोई छवि नहीं है (केवल टेक्स्ट) — इसके बजाय \"छवि चुनें\" बटन आज़माएं।",
        err_file_too_large: "यह फ़ाइल बहुत बड़ी है (सीमा 8 MB)।",
        public_scans_heading: "विश्लेषण खोजें", placeholder_search: "कीवर्ड से खोजें...",
        public_scans_empty: "यहां अभी तक कुछ नहीं है — पहले बनें!",
        public_scans_no_results: "\"{query}\" के लिए कोई परिणाम नहीं।", public_scans_load_error: "लोड नहीं हो सका।",
        scan_not_found: "यह विश्लेषण नहीं मिला।", scan_source_label: "स्रोत: ", scan_text_source_label: "पूरा स्रोत टेक्स्ट दिखाएं", btn_copy_source_text: "कॉपी करें", btn_copy_source_text_done: "कॉपी हो गया!", scan_text_source_char_count: "{count} अक्षर",
        manual_source_notice: "यह सामग्री किसी उपयोगकर्ता द्वारा मैन्युअल रूप से पेस्ट की गई है, सीधे पेज से नहीं ली गई।",
        btn_report_mismatch: "स्रोत सामग्री से बेमेल की रिपोर्ट करें", btn_force_refresh: "जांचें कि कुछ बदला तो नहीं",
        status_mismatch_reported: "रिपोर्ट के लिए धन्यवाद — हम इसे देखेंगे।",
        live_cost_estimate: "अनुमानित लागत: {cost} क्रेडिट", cost_free_cache_notice: "मुफ़्त — मेमोरी से", scan_view_count: "{count} बार देखा गया",
        url_confirm_char_count: "विश्लेषण के लिए: {count} अक्षर", url_confirm_clean_notice: "कीमत में पहले से ही पृष्ठ को मेनू, विज्ञापनों और लेख की सामग्री से असंबंधित अन्य तत्वों से साफ़ करना शामिल है।",
        btn_paste_own_content: "सहमत नहीं हैं? अपनी खुद की सामग्री पेस्ट करें",
        force_refresh_confirm_cost: "जाँच और पुनः विश्लेषण की लागत {cost} क्रेडिट होगी। जारी रखें?",
        scan_retracted_notice: "इस सामग्री को स्वचालित रूप से वापस ले लिया गया है — कई लोगों ने बताया कि यह अब मूल स्रोत सामग्री से मेल नहीं खाती। परिणाम अभी भी दिखाई देता है, लेकिन अब इसे दूसरों को वर्तमान के रूप में नहीं दिखाया जाता।",
        scan_pdf_source_label: "फ़ाइल: ", pattern_page_label: "पृष्ठ {page}", pattern_image_label: "छवि {index}", link_pdf_history: "आपके PDF विश्लेषण →", history_back: "← खाते पर वापस जाएं", history_title: "आपके PDF विश्लेषण", history_intro: "यह सूची केवल आप देख सकते हैं — PDF विश्लेषण सार्वजनिक नहीं होते।", history_empty: "अभी तक आपका कोई PDF विश्लेषण नहीं है।", history_unnamed_file: "बिना नाम वाली फ़ाइल",
        tip_label: "अभी क्या करें:", pattern_tag_manipulation: "पैटर्न", pattern_tag_reasoning: "अवलोकन", summary_label: "सारांश",
        scan_load_error: "विश्लेषण लोड नहीं हो सका (कनेक्शन जांचें और पेज रीलोड करें)।",
    },
    ar: {
        tab_login: "تسجيل الدخول", tab_signup: "إنشاء حساب",
        placeholder_email: "البريد الإلكتروني", placeholder_password: "كلمة المرور (6 أحرف على الأقل)",
        btn_login: "تسجيل الدخول", btn_signup: "إنشاء حساب",
        link_forgot_password: "هل نسيت كلمة المرور؟", divider_or: "— أو —",
        btn_google_login: "تسجيل الدخول عبر Google", btn_google_signup: "إنشاء حساب عبر Google",
        err_provide_credentials: "الرجاء إدخال البريد الإلكتروني وكلمة المرور.",
        err_captcha_required: "الرجاء تحديد مربع \"أنا لست روبوتًا\" أعلاه.",
        status_please_wait: "لحظة من فضلك...",
        err_account_exists_login: "يوجد حساب بهذا البريد الإلكتروني بالفعل. حاول تسجيل الدخول.",
        status_check_email: "تحقق من بريدك الإلكتروني وانقر على رابط التأكيد لإتمام التسجيل.",
        err_email_first: "الرجاء إدخال بريدك الإلكتروني أعلاه أولاً.",
        status_recovery_email_sent: "لقد أرسلنا رابط استعادة كلمة المرور إلى بريدك الإلكتروني.",
        status_email_may_be_delayed: "بسبب الإقبال الكبير، قد يستغرق إرسال البريد وقتًا أطول قليلاً اليوم — إذا لم تر شيئًا بعد قليل، عد إلى هنا واضغط على «إعادة إرسال البريد».",
        btn_resend_email: "إعادة إرسال البريد",
        status_resend_sent: "أرسلنا بريدًا جديدًا — تحقق من صندوق الوارد.",
        err_google_account_exists: "يوجد حساب بعنوان Google هذا بالفعل. الرجاء تسجيل الدخول بدلاً من ذلك.",
        recovery_title: "قم بتعيين كلمة مرور جديدة لحسابك:",
        placeholder_new_password: "كلمة مرور جديدة (6 أحرف على الأقل)", btn_set_new_password: "تعيين كلمة المرور الجديدة",
        err_password_min: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
        recovery_success: "تم تعيين كلمة المرور! يمكنك الآن استخدام التطبيق.",
        err_invalid_credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        err_email_not_confirmed: "قم بتأكيد بريدك الإلكتروني — تحقق من صندوق الوارد وانقر على الرابط الذي أرسلناه.",
        err_invalid_email_format: "صيغة بريد إلكتروني غير صالحة.",
        err_captcha_generic: "أكّد أنك لست روبوتًا (حدد المربع أعلاه) وحاول مرة أخرى.",
        account_aria_label: "حسابك", credit_balance_label: "رصيد الأرصدة", account_back: "← العودة إلى Gakori", account_title: "حسابك",
        loading: "جارٍ التحميل...", account_logged_in_as: "تم تسجيل الدخول باسم:",
        btn_logout: "تسجيل الخروج", link_change_password: "تغيير كلمة المرور", btn_save_password: "حفظ كلمة المرور الجديدة",
        password_changed: "تم تغيير كلمة المرور.",
        account_load_error: "تعذّر تحميل بيانات الحساب (تحقق من الاتصال وأعد تحميل الصفحة).",
        language_label: "لغة التطبيق",
        theme_label: "المظهر", theme_light: "فاتح", theme_dark: "داكن",
        username_label: "اسم المستخدم", btn_save_username: "حفظ الاسم", username_saved: "تم حفظ اسم المستخدم.",
        username_cooldown_note: "يمكنك تغييره مرة أخرى ابتداءً من: {date}",
        err_username_length: "يجب أن يتكون الاسم من 2 إلى 24 حرفًا.", err_username_cooldown: "يمكن تغيير اسم المستخدم مرة واحدة كل 14 يومًا فقط.",
        err_username_taken: "هذا الاسم مُستخدم بالفعل — اختر اسمًا آخر.",
        err_username_forbidden: "يحتوي هذا الاسم على كلمة غير مسموح بها — اختر اسمًا آخر.",
        tab_link: "رابط", tab_text: "نص", tab_image: "صورة",
        label_paste_link: "الصق رابطًا للتحليل:", placeholder_url: "https://...",
        label_paste_text: "الصق نصًا للتحليل:", placeholder_text_content: "الصق المحتوى الذي تريد تحليله...", label_text_source_url_optional: "اختياري: رابط المصدر (سيُضاف إلى النتيجة):",
        label_choose_image: "اختر صورة للتحليل:", btn_choose_image: "اختيار صورة",
        btn_analyze: "تحليل",
        analyze_label_url: "تحليل الصفحة", analyze_label_text: "تحليل النص", analyze_label_image: "تحليل الصورة",
        status_analyzing: "جارٍ التحليل...",
        status_step_1: "جارٍ إرسال المحتوى للمراجعة...", status_step_2: "جارٍ التحقق مما إذا كان قد تم تحليله من قبل...",
        status_step_3: "جارٍ تحديد الأنماط التي يجب البحث عنها...", status_step_4: "جارٍ قراءة المحتوى بعناية...",
        status_step_5: "جارٍ البحث عن اقتباسات محددة...", status_step_6: "على وشك الانتهاء...",
        status_step_7: "جارٍ المقارنة مع مكتبة الأنماط المعروفة...", status_step_8: "جارٍ التحقق من سياق كل جملة...",
        status_step_9: "جارٍ تقييم ما إذا كان هذا تلاعبًا أم استدلالًا سليمًا...", status_step_10: "جارٍ اختيار أنسب الأسماء للأنماط المكتشفة...",
        status_step_11: "جارٍ تنسيق النتيجة بشكل قابل للقراءة...", status_step_12: "اللمسات الأخيرة...",
        alert_enter_link: "أدخل رابطًا!", alert_paste_text: "الصق بعض النص!", alert_choose_image: "اختر صورة!", alert_image_too_large: "هذا الملف كبير جدًا (الحد الأقصى 8 ميغابايت).",
        status_err_prefix: "❌ خطأ: ",
        badge_manipulation: "تلاعب: {score}/100", badge_clean: "نص نظيف: {score}/100", badge_partial: "جزئي: {score}/100",
        badge_info: "معلومات", result_generic_error: "حدث خطأ ما. حاول مرة أخرى بعد قليل.",
        err_signup_required: "أنشئ حسابًا للمتابعة.",
        err_insufficient_credits: "ليس لديك رصيد كافٍ لهذا.",
        err_url_fetch_failed: "تعذّر جلب محتوى هذه الصفحة — تحقق من أن الرابط صحيح ومتاح للجميع. يمكنك أيضًا نسخ نص المقال ولصقه في وضع «نص» — سيعمل ذلك بغض النظر عن هذه المشكلة.",
        err_system_paused: "تم إيقاف Gakori مؤقتًا — فريقنا يعلم بالأمر بالفعل ويعمل على حله. يرجى المحاولة مرة أخرى بعد قليل.",
        err_save_failed: "تعذّر حفظ نتيجة التحليل. حاول مرة أخرى.",
        err_too_many_failed_attempts: "عدد كبير جدًا من محاولات التحليل الفاشلة المتتالية. حاول مرة أخرى بعد {time}.",
        retry_minutes: "{minutes} دقيقة", retry_hours: "{hours} ساعة", retry_days: "{days} يوم",
        rate_limit_expired: "يمكنك المحاولة مرة أخرى الآن.",
        err_invalid_image: "هذا ليس ملف صورة معروفًا (JPEG/PNG/GIF/WEBP).",
        err_unsafe_content: "تحتوي هذه الصورة على محتوى غير مسموح به في Gakori (مثل العُري، أو العنف، أو المشاهد الصادمة) ولا يمكن تحليلها. وفقًا لقواعدنا، تم احتساب تكلفة هذه المحاولة كأنها تحليل عادي.",
        err_too_many_images: "يمكنك تحليل {max} صور كحد أقصى في المرة الواحدة.",
        label_images_selected: "تم اختيار {count}/{max} صور",
        alert_max_images: "يمكنك إضافة {max} صور كحد أقصى في المرة الواحدة.",
        tab_pdf: "PDF", analyze_label_pdf: "تحليل PDF", label_choose_pdf: "اختر ملف PDF للتحليل:", btn_choose_pdf: "اختيار PDF", label_pdf_selected: "الملف المختار: {name}", label_pdf_large_file_notice: "(ملف كبير — قد يستغرق الرفع بعض الوقت)", alert_choose_pdf: "الملف المختار ليس PDF.", alert_choose_pdf_file: "اختر أولاً ملف PDF.", alert_pdf_too_large: "ملف PDF كبير جدًا (الحد الأقصى 10 ميغابايت).", pdf_confirm_title: "تأكيد التحليل", pdf_confirm_pages: "عدد الصفحات: {count}", pdf_confirm_cost: "التكلفة: {cost} رصيد", pdf_confirm_wait_notice: "قد تستغرق الملفات الأطول وقتًا أطول ملحوظًا من المعتاد — هذا أمر طبيعي.", btn_pdf_confirm_yes: "نعم، حلّل", btn_pdf_confirm_no: "إلغاء", err_invalid_pdf: "الملف المرفوع ليس PDF صالحًا.", err_pdf_too_long: "يحتوي هذا الملف على {count} صفحة — الحد الأقصى المدعوم هو {max}.", cost_comparison_one: "≈ {item}", cost_comparison_many: "≈ {count} × {item}",
        btn_remove_image: "إزالة هذه الصورة",
        image_not_saved_notice: "يتم تحليل هذه الصورة فورًا ولا يتم حفظها في نظامنا — أنت الوحيد الذي يراها الآن.",
        label_paste_image_zone: "الصق صورة هنا (مثل لقطة شاشة)",
        alert_paste_not_image: "ما نسخته لا يحتوي على صورة (نص فقط) — جرّب بدلاً من ذلك زر \"اختيار صورة\".",
        err_file_too_large: "هذا الملف كبير جدًا (الحد الأقصى 8 ميغابايت).",
        public_scans_heading: "ابحث عن تحليل", placeholder_search: "ابحث بالكلمات المفتاحية...",
        public_scans_empty: "لا يوجد شيء هنا بعد — كن الأول!",
        public_scans_no_results: "لا توجد نتائج لـ \"{query}\".", public_scans_load_error: "تعذّر التحميل.",
        scan_not_found: "لم يتم العثور على هذا التحليل.", scan_source_label: "المصدر: ", scan_text_source_label: "عرض النص المصدر الكامل", btn_copy_source_text: "نسخ", btn_copy_source_text_done: "تم النسخ!", scan_text_source_char_count: "{count} حرف",
        manual_source_notice: "تم لصق هذا المحتوى يدويًا من قِبل مستخدم، ولم يتم جلبه مباشرة من الصفحة.",
        btn_report_mismatch: "الإبلاغ عن تعارض مع محتوى المصدر", btn_force_refresh: "تحقق مما إذا تغيّر شيء",
        status_mismatch_reported: "شكرًا على الإبلاغ — سنتحقق من ذلك.",
        live_cost_estimate: "التكلفة التقديرية: {cost} رصيد", cost_free_cache_notice: "مجانًا — من الذاكرة", scan_view_count: "شوهد {count} مرة",
        url_confirm_char_count: "للتحليل: {count} حرفًا", url_confirm_clean_notice: "يأخذ السعر في الاعتبار بالفعل تنظيف الصفحة من القوائم والإعلانات والعناصر الأخرى غير المتعلقة بمحتوى المقال.",
        btn_paste_own_content: "لا توافق؟ الصق المحتوى الخاص بك",
        force_refresh_confirm_cost: "سيكلف التحقق وإعادة التحليل {cost} رصيد. هل تريد المتابعة؟",
        scan_retracted_notice: "تم سحب هذا المحتوى تلقائيًا — أبلغ العديد من الأشخاص أنه لم يعد يتطابق مع محتوى المصدر الحالي. لا تزال النتيجة مرئية، لكنها لم تعد تُقدَّم للآخرين على أنها حديثة.",
        scan_pdf_source_label: "الملف: ", pattern_page_label: "الصفحة {page}", pattern_image_label: "الصورة {index}", link_pdf_history: "تحليلات PDF الخاصة بك →", history_back: "← العودة إلى الحساب", history_title: "تحليلات PDF الخاصة بك", history_intro: "أنت فقط من يرى هذه القائمة — تحليلات PDF ليست عامة.", history_empty: "ليس لديك أي تحليل PDF بعد.", history_unnamed_file: "ملف بدون اسم",
        tip_label: "ماذا تفعل الآن:", pattern_tag_manipulation: "نمط", pattern_tag_reasoning: "ملاحظة", summary_label: "الملخص",
        scan_load_error: "تعذّر تحميل التحليل (تحقق من الاتصال وأعد تحميل الصفحة).",
    },
};

function getCurrentLanguage() {
    return localStorage.getItem('gakori_lang') || 'en';
}

function t(key, vars) {
    const lang = getCurrentLanguage();
    let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key])
        || (TRANSLATIONS.en && TRANSLATIONS.en[key])
        || (TRANSLATIONS.pl && TRANSLATIONS.pl[key])
        || key;
    if (vars) {
        Object.keys(vars).forEach((k) => {
            str = str.replace('{' + k + '}', vars[k]);
        });
    }
    return str;
}

function applyTranslations() {
    const lang = getCurrentLanguage();
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.indexOf(lang) !== -1 ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.innerText = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
        el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });
    // Placeholder dla pól typu contenteditable (np. strefa wklejania obrazu) —
    // zwykły ".placeholder" nie istnieje na takich elementach, więc trzymamy
    // przetłumaczony tekst w atrybucie data-placeholder i pokazujemy go przez
    // CSS ":empty::before { content: attr(data-placeholder) }" (patrz style.css).
    document.querySelectorAll('[data-i18n-content-placeholder]').forEach((el) => {
        el.setAttribute('data-placeholder', t(el.getAttribute('data-i18n-content-placeholder')));
    });
}

// Zmienia język: zapisuje lokalnie (działa też dla niezalogowanych) i, jeśli
// podano klienta Supabase oraz ID zalogowanego użytkownika, zapisuje też w
// profilu — żeby ustawienie synchronizowało się między urządzeniami.
function setLanguage(lang, sb, userId) {
    if (!TRANSLATIONS[lang]) return;
    localStorage.setItem('gakori_lang', lang);
    applyTranslations();
    if (sb && userId) {
        // Jeśli ten zapis się nie uda (np. brak reguły RLS pozwalającej na
        // edycję własnego profilu), NIE chcemy tego ukrywać po cichu jak
        // dotąd — inaczej lokalny wybór językowy zostanie po chwili
        // nadpisany starą wartością z bazy przy najbliższej synchronizacji
        // (patrz syncLanguageFromProfile).
        sb.from('profiles').update({ language: lang }).eq('id', userId).then(({ error }) => {
            if (error) console.error('Nie udało się zapisać języka w profilu (sprawdź reguły RLS dla UPDATE na tabeli profiles):', error);
        });
    }
}

// Wczytuje zapisany w profilu język (dla zalogowanych) i stosuje go, jeśli
// różni się od tego zapisanego lokalnie (np. zmieniono na innym urządzeniu).
// Zwraca Promise — jeśli wywołujący kod chce poczekać, aż lokalny stan
// będzie na pewno zsynchronizowany z profilem, zanim np. wypełni jakiś
// selektor wartością, powinien to zrobić przez await.
function syncLanguageFromProfile(sb, userId) {
    if (!sb || !userId) return Promise.resolve();
    return sb.from('profiles').select('language').eq('id', userId).single().then(({ data }) => {
        if (data && data.language && data.language !== getCurrentLanguage()) {
            localStorage.setItem('gakori_lang', data.language);
            applyTranslations();
        }
    });
}

// --- Motyw (jasny/ciemny) — ten sam wzorzec co język wyżej: zapisany
// lokalnie (działa dla niezalogowanych), a dla zalogowanych też w profilu,
// żeby ustawienie synchronizowało się między urządzeniami. Motyw jest
// dodatkowo ustawiany SYNCHRONICZNIE, małym inline-skryptem w <head> każdej
// strony (przed wczytaniem CSS) — patrz komentarz w style.css przy
// [data-theme="dark"] — więc te funkcje tylko go PODTRZYMUJĄ/ZMIENIAJĄ po
// starcie strony, nie odpowiadają za pierwsze ustawienie przy ładowaniu.
function getCurrentTheme() {
    return localStorage.getItem('gakori_theme') || 'light';
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', getCurrentTheme());
}

function setTheme(theme, sb, userId) {
    if (theme !== 'light' && theme !== 'dark') return;
    localStorage.setItem('gakori_theme', theme);
    applyTheme();
    if (sb && userId) {
        sb.from('profiles').update({ theme: theme }).eq('id', userId).then(({ error }) => {
            if (error) console.error('Nie udało się zapisać motywu w profilu (sprawdź reguły RLS dla UPDATE na tabeli profiles):', error);
        });
    }
}

function syncThemeFromProfile(sb, userId) {
    if (!sb || !userId) return Promise.resolve();
    return sb.from('profiles').select('theme').eq('id', userId).single().then(({ data }) => {
        if (data && data.theme && data.theme !== getCurrentTheme()) {
            localStorage.setItem('gakori_theme', data.theme);
            applyTheme();
        }
    });
}

// Porównanie kosztu dużej analizy (na razie: PDF powyżej progu stron) z
// czymś codziennym i tanim, zamiast suchej liczby kredytów — użytkownik
// wprost poprosił o to zamiast pokazywania kwoty w walucie (2026-08-19):
// duża liczba kredytów ma się kojarzyć z drobnostką, na którą ludzie
// wydają pieniądze bez wahania kilka razy w miesiącu, a nie z abstrakcyjną
// liczbą. Dwie decyzje projektowe warte zapamiętania:
// 1. Zamiast odmieniać rzeczownik przez liczbę (co w części języków, np.
//    polskim czy rosyjskim, wymagałoby osobnej gramatyki dla 1/2-4/5+),
//    używamy zapisu "N × przedmiot" (jak na paragonie) — to samo brzmi
//    naturalnie w każdym języku bez żadnej odmiany.
// 2. To CELOWO NIE jest przelicznik po realnym kursie waluty — cena
//    kawy/herbaty w Indiach czy Egipcie przeliczona 1:1 dawałaby absurdalne
//    "21 herbat" zamiast "to mniej więcej tyle, ile wydajesz na kawę".
//    Zamiast tego: jedna, stała liczba kredytów = "1 sztuka" wszędzie na
//    świecie (450 kr., oparta o realny punkt odniesienia użytkownika: mała
//    kawa w Polsce, 16-20 zł) — zmienia się tylko NAZWA przedmiotu i jego
//    ROZMIAR (mała/średnia/duża) wraz z progiem kredytów, nie kurs.
const COST_COMPARISON_UNIT_PRICE_SMALL = 450 // < 1000 kredytów
const COST_COMPARISON_UNIT_PRICE_MEDIUM = 900 // 1000-3000 kredytów
const COST_COMPARISON_UNIT_PRICE_LARGE = 1800 // > 3000 kredytów
// Powyżej tylu "sztuk" porównanie przestaje być pomocne (przestaje czuć
// się jak drobnostka) — wtedy costComparisonText() zwraca null, a wołający
// (patrz index.html) po prostu nie pokazuje tej linijki, tylko samą liczbę
// kredytów.
const COST_COMPARISON_CAP_UNITS = 4

// Dwie opcje na język (losowane przy każdym wywołaniu), żeby nie było
// zawsze identycznie — dobrane kulturowo, nie tłumaczone dosłownie z
// polskiego (np. w Chinach zwykła herbata bywa prawie darmowa, więc
// zamiennikiem jest bardziej "drobna przyjemność" — herbata mleczna).
const COST_COMPARISON_ITEMS = {
    pl: { small: ['mała kawa', 'mała herbata'], medium: ['średnia kawa', 'średnia herbata'], large: ['duża kawa', 'duża herbata'] },
    en: { small: ['small coffee', 'small tea'], medium: ['medium coffee', 'medium tea'], large: ['large coffee', 'large tea'] },
    es: { small: ['café pequeño', 'té pequeño'], medium: ['café mediano', 'té mediano'], large: ['café grande', 'té grande'] },
    de: { small: ['kleiner Kaffee', 'kleiner Tee'], medium: ['mittlerer Kaffee', 'mittlerer Tee'], large: ['großer Kaffee', 'großer Tee'] },
    fr: { small: ['petit café', 'petit thé'], medium: ['café moyen', 'thé moyen'], large: ['grand café', 'grand thé'] },
    ru: { small: ['маленький кофе', 'маленький чай'], medium: ['средний кофе', 'средний чай'], large: ['большой кофе', 'большой чай'] },
    zh: { small: ['小杯咖啡', '小杯奶茶'], medium: ['中杯咖啡', '中杯奶茶'], large: ['大杯咖啡', '大杯奶茶'] },
    ja: { small: ['小さいコーヒー', '小さい緑茶'], medium: ['普通のコーヒー', '普通の緑茶'], large: ['大きいコーヒー', '大きい緑茶'] },
    hi: { small: ['छोटी चाय', 'छोटी कॉफ़ी'], medium: ['मध्यम चाय', 'मध्यम कॉफ़ी'], large: ['बड़ी चाय', 'बड़ी कॉफ़ी'] },
    ar: { small: ['شاي صغير', 'قهوة صغيرة'], medium: ['شاي متوسط', 'قهوة متوسطة'], large: ['شاي كبير', 'قهوة كبيرة'] },
}

function costComparisonUnitPrice(credits) {
    if (credits < 1000) return COST_COMPARISON_UNIT_PRICE_SMALL
    if (credits <= 3000) return COST_COMPARISON_UNIT_PRICE_MEDIUM
    return COST_COMPARISON_UNIT_PRICE_LARGE
}
function costComparisonSizeKey(credits) {
    if (credits < 1000) return 'small'
    if (credits <= 3000) return 'medium'
    return 'large'
}
// Poniżej 3 sztuk zaokrąglamy do najbliższej połówki (dokładniej przy
// małych wartościach), od 3 w górę do pełnej sztuki (prościej przy
// większych) — czysto kosmetyczna decyzja czytelności.
function costComparisonRoundUnits(raw) {
    if (raw < 3) return Math.round(raw * 2) / 2
    return Math.round(raw)
}
const COST_COMPARISON_LOCALES = {
    pl: 'pl-PL', en: 'en-US', es: 'es-ES', de: 'de-DE', fr: 'fr-FR',
    ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP', hi: 'hi-IN', ar: 'ar-EG',
}
// Zwraca gotowy do wyświetlenia napis (np. "≈ 2 × mała kawa") albo null,
// jeśli koszt przekracza COST_COMPARISON_CAP_UNITS sztuk — wtedy wołający
// ma pokazać samą liczbę kredytów, bez tej linijki.
function costComparisonText(credits, langCode) {
    if (typeof credits !== 'number' || credits <= 0) return null
    const unitPrice = costComparisonUnitPrice(credits)
    const units = costComparisonRoundUnits(credits / unitPrice)
    if (units <= 0 || units > COST_COMPARISON_CAP_UNITS) return null
    const items = COST_COMPARISON_ITEMS[langCode] || COST_COMPARISON_ITEMS.en
    const options = items[costComparisonSizeKey(credits)]
    const item = options[Math.floor(Math.random() * options.length)]
    if (units === 1) return t('cost_comparison_one', { item })
    const numFmt = new Intl.NumberFormat(COST_COMPARISON_LOCALES[langCode] || 'en-US', { maximumFractionDigits: 1 })
    return t('cost_comparison_many', { count: numFmt.format(units), item })
}

// Stan kredytów: zawsze czytany na żywo z profilu (nigdy z pamięci
// przeglądarki, w przeciwieństwie do języka/motywu) — to liczba, która
// musi być zawsze aktualna, nie coś, co ma "pamiętać" ostatnią wartość
// między sesjami. Wywoływane przy każdym zalogowaniu i po każdej
// zakończonej analizie (patrz index.html), żeby wyświetlana liczba nigdy
// nie została "w tyle" po wydaniu kredytów.
function refreshCreditBalance(sb, userId) {
    if (!sb || !userId) return Promise.resolve();
    const el = document.getElementById('creditBalanceValue');
    if (!el) return Promise.resolve();
    return sb.from('profiles').select('wallet_balance').eq('id', userId).single().then(({ data, error }) => {
        if (!error && data && typeof data.wallet_balance === 'number') {
            el.textContent = data.wallet_balance;
        }
    });
}

// Nazwa użytkownika: w przeciwieństwie do języka/motywu NIE ma domyślnej
// wartości trzymanej lokalnie — dotyczy tylko zalogowanych, więc zawsze
// czyta się/zapisuje wprost z profilu (patrz account.html). Jeśli konto
// (nowe albo już istniejące sprzed wprowadzenia tej funkcji) jeszcze nie ma
// nazwy, ustawia domyślną — pierwszy człon adresu e-mail przed "@". Dzięki
// wywoływaniu tego przy KAŻDYM logowaniu, backfill dla starych kont dzieje
// się sam, bez osobnej migracji dla każdego konta z osobna (choć jest też
// jednorazowe zapytanie SQL wypełniające to od razu dla wszystkich, patrz
// GAKORI_CONTEXT.md — to i tak nie zaszkodzi, zapytanie tu jest no-opem dla
// kont, które już mają nazwę ustawioną).
// Podstawowa lista zakazanych słów (silne wulgaryzmy + najbardziej
// rozpoznawalne obelgi, PL + EN), dopasowywana jako podciąg w małych
// literach. To NIE jest i nigdy nie będzie wyczerpująca lista — trzeba ją
// z czasem rozszerzać, jeśli coś się prześlizgnie (zgłoszenie od
// użytkowników). Ta sama lista jest (przede wszystkim, jako prawdziwe
// zabezpieczenie) powielona w wyzwalaczu bazy danych — patrz
// GAKORI_CONTEXT.md. Jeśli dodajesz/usuwasz słowo, zrób to w OBU miejscach.
// Uporządkowane wg języka (kody jak w SUPPORTED_LANGUAGES) — łatwiej
// rozszerzać/poprawiać pojedynczy język, niż grzebać w jednej wielkiej
// nieposegregowanej liście. Dla języków spoza alfabetu łacińskiego (ru, zh,
// ja, hi, ar) lista jest solidną podstawą, ale nie była sprawdzona przez
// osobę mówiącą danym językiem natywnie — jeśli coś jest nietrafione albo
// czegoś brakuje, popraw/dopisz tutaj (i w tej samej liście w wyzwalaczu
// bazy danych, patrz GAKORI_CONTEXT.md).
const USERNAME_BLOCKLIST_BY_LANG = {
    pl: ['kurw', 'chuj', 'huj', 'jeban', 'jebac', 'jebał', 'jebie', 'pierdol', 'pizd', 'cipa', 'cipo', 'skurwysyn', 'skurwiel', 'dziwka', 'szmata', 'spierdalaj', 'pedał', 'ciota'],
    en: ['fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'retard'],
    es: ['puta', 'put', 'mierda', 'cabron', 'cabrón', 'joder', 'gilipollas', 'pendejo', 'maricon', 'maricón', 'coño', 'verga', 'chinga', 'zorra'],
    de: ['scheiße', 'scheisse', 'arschloch', 'hurensohn', 'wichser', 'fotze', 'schlampe', 'hure', 'ficker', 'fick dich'],
    fr: ['merde', 'putain', 'salope', 'connard', 'connasse', 'enculé', 'encule', 'bâtard', 'batard', 'pute', 'con'],
    ru: ['сука', 'блять', 'блядь', 'хуй', 'пизда', 'ебать', 'ебан', 'мудак', 'пидор', 'гандон', 'шлюха'],
    zh: ['操你', '妈的', '傻逼', '婊子', '狗屎', '王八蛋', '贱人', '混蛋', '去死'],
    ja: ['死ね', 'ちんこ', 'まんこ', 'くたばれ', 'ぶす', 'やりまん'],
    hi: ['मादरचोद', 'भोसड़ी', 'चूतिया', 'रंडी', 'गांडू', 'लौड़ा', 'कुतिया'],
    ar: ['خرا', 'زبي', 'عاهرة', 'منيك', 'شرموطة'],
};
const USERNAME_BLOCKLIST = Object.values(USERNAME_BLOCKLIST_BY_LANG).flat();

function containsForbiddenWord(username) {
    const normalized = username.toLowerCase();
    return USERNAME_BLOCKLIST.some((word) => normalized.includes(word));
}

async function ensureDefaultUsername(sb, userId, email) {
    if (!sb || !userId || !email) return;
    const { data } = await sb.from('profiles').select('username').eq('id', userId).single();
    if (data && data.username) {
        // Konto już ma nazwę — tylko upewniamy się, że metadane logowania
        // (używane do spersonalizowania maili wysyłanych przez Supabase,
        // np. "Cześć, {{ .Data.username }}!") są z nią zgodne, na wypadek
        // gdyby konto dostało nazwę zanim to lustrowanie tu istniało.
        sb.auth.updateUser({ data: { username: data.username } }).catch(() => {});
        return;
    }
    // Jeśli sam pierwszy człon e-maila jest zakazanym słowem (rzadkie, ale
    // się zdarza), nie próbujemy go w ogóle — zaczynamy od razu od
    // neutralnej nazwy zamiast dopisywać cyfry do obraźliwej podstawy.
    const emailBase = email.split('@')[0].slice(0, 24);
    const base = containsForbiddenWord(emailBase) ? 'uzytkownik' : emailBase;
    // Nazwy muszą być unikalne (baza to wymusza) — jeśli sama nazwa jest
    // już zajęta przez kogoś innego (np. ten sam człon e-maila w innej
    // domenie), dopisujemy losowe cyfry i próbujemy ponownie, zamiast
    // zostawić konto bez żadnej nazwy.
    for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = attempt === 0 ? base : (base.slice(0, 20) + Math.floor(1000 + Math.random() * 9000));
        const { error } = await sb.from('profiles').update({ username: candidate }).eq('id', userId);
        if (!error) {
            sb.auth.updateUser({ data: { username: candidate } }).catch(() => {});
            return;
        }
        if (error.code !== '23505') {
            console.error('Nie udało się ustawić domyślnej nazwy użytkownika:', error);
            return;
        }
    }
}
