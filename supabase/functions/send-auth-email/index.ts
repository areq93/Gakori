// PRAGMA — Edge Function "send-auth-email"
// Wdrożenie: Supabase Dashboard → Edge Functions → Deploy a new function → Via Editor
//
// To jest tzw. "Send Email" Hook Supabase Auth. Gdy skonfigurujesz go w
// Dashboardzie (Authentication → Hooks → "Send Email hook"), Supabase
// PRZESTAJE wysyłać maile swoimi wbudowanymi, jednojęzycznymi szablonami
// (Confirm signup, Reset Password, i przełącznik "Password changed" w
// sekcji Security) i zamiast tego woła TĘ funkcję za każdym razem, gdy
// trzeba wysłać jakikolwiek mail związany z logowaniem/rejestracją.
// Dzięki temu możemy sami zdecydować, w jakim języku i jaką treścią
// odpowiedzieć — a nie jesteśmy ograniczeni do jednego języka na cały
// projekt.
//
// Obsługiwane typy maili (email_action_type z payloadu Supabase):
// - "signup"                         → potwierdzenie rejestracji
// - "recovery"                       → odzyskiwanie hasła (dawny "reset hasła")
// - "password_changed_notification"  → powiadomienie o zmianie hasła
//   (wysyłane automatycznie przez Supabase, gdy w Dashboardzie
//   Authentication → Emails → Security włączysz przełącznik
//   "Password changed" — to WŁĄCZA wysyłkę tego typu maila przez ten hook)
// - każdy inny typ (np. email_change, magiclink) → ogólny szablon
//   zapasowy, żeby żaden mail nigdy nie "zniknął" po cichu
//
// Język i nazwa użytkownika w mailu:
// - język: user_metadata.language (ustawiony PRZED rejestracją, jeśli
//   użytkownik wybrał język zanim się zarejestrował) → profiles.language
//   (ustawiony w panelu użytkownika PO zalogowaniu) → 'en' jako ostatnia
//   deska ratunku. Uwaga: przy mailu "signup" profil w bazie może jeszcze
//   nie istnieć / nie mieć języka, dlatego user_metadata sprawdzamy jako
//   pierwsze.
// - nazwa użytkownika: profiles.username → user_metadata.username →
//   część e-maila przed "@" jako ostatnia deska ratunku.
//
// Wymagane sekrety (Dashboard → Edge Functions → Manage secrets):
// - SEND_EMAIL_HOOK_SECRET — generowany automatycznie przez Supabase w
//   momencie włączenia hooka (Authentication → Hooks), w formacie
//   "v1,whsec_....". Wklej go tu DOKŁADNIE tak, jak pokazuje Supabase.
// - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — jak w innych funkcjach.
// - BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME — te same, które
//   już są skonfigurowane (były przygotowane pod notify-password-changed).

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

type EmailContent = {
  greeting: (username: string) => string
  body: string[]
  button: string | null
  footer: string
  signature: string
}

type LangContent = {
  teamName: string
  signup: { subject: string } & EmailContent
  recovery: { subject: string } & EmailContent
  password_changed: { subject: string } & EmailContent
  generic: { subject: string } & EmailContent
}

const EMAIL_CONTENT: Record<string, LangContent> = {
  pl: {
    teamName: 'Zespół Pragma',
    signup: {
      subject: 'Potwierdź rejestrację w Pragmie',
      greeting: (u) => `Cześć, ${u}!`,
      body: [
        'Dziękujemy za rejestrację w Pragmie — aplikacji, która pomaga rozpoznawać manipulację i zdrowe wzorce rozumowania w tekstach, które czytasz.',
        'Żeby dokończyć zakładanie konta, potwierdź swój adres e-mail:',
      ],
      button: 'Potwierdź adres e-mail',
      footer: 'Jeśli to nie Ty zakładałeś to konto, po prostu zignoruj tę wiadomość.',
      signature: 'Dziękujemy, że jesteś z nami od samego początku.<br>Zespół Pragma',
    },
    recovery: {
      subject: 'Odzyskaj dostęp do konta w Pragmie',
      greeting: (u) => `Cześć, ${u}!`,
      body: [
        'Dostaliśmy prośbę o odzyskanie dostępu do Twojego konta w Pragmie.',
        'Kliknij poniższy przycisk, żeby ustawić nowe hasło:',
      ],
      button: 'Ustaw nowe hasło',
      footer: 'Jeśli to nie Ty prosiłeś o odzyskanie hasła, zignoruj tę wiadomość — Twoje obecne hasło nadal działa.',
      signature: 'Dziękujemy, że jesteś z nami od samego początku.<br>Zespół Pragma',
    },
    password_changed: {
      subject: 'Twoje hasło w Pragmie zostało zmienione',
      greeting: (u) => `Cześć, ${u}!`,
      body: [
        'Dajemy Ci znać, że hasło do Twojego konta w Pragmie zostało właśnie zmienione.',
        'Jeśli to Twoja zmiana — świetnie, nie musisz nic robić.',
        'Jeśli to NIE Twoja zmiana, jak najszybciej skorzystaj z opcji odzyskiwania hasła w Pragmie, żeby zabezpieczyć swoje konto.',
      ],
      button: null,
      footer: '',
      signature: 'Dziękujemy, że jesteś z nami od samego początku.<br>Zespół Pragma',
    },
    generic: {
      subject: 'Pragma — potwierdzenie',
      greeting: (u) => `Cześć, ${u}!`,
      body: ['Aby potwierdzić tę czynność w Pragmie, kliknij poniższy przycisk:'],
      button: 'Przejdź dalej',
      footer: 'Jeśli to nie Ty wykonałeś tę czynność, zignoruj tę wiadomość.',
      signature: 'Dziękujemy, że jesteś z nami od samego początku.<br>Zespół Pragma',
    },
  },
  en: {
    teamName: 'The Pragma Team',
    signup: {
      subject: 'Confirm your registration on Pragma',
      greeting: (u) => `Hi, ${u}!`,
      body: [
        'Thanks for signing up for Pragma — the app that helps you spot manipulation and healthy reasoning patterns in the texts you read.',
        'To finish setting up your account, please confirm your email address:',
      ],
      button: 'Confirm email address',
      footer: "If you didn't create this account, just ignore this message.",
      signature: 'Thanks for being with us from the start.<br>The Pragma Team',
    },
    recovery: {
      subject: 'Recover access to your Pragma account',
      greeting: (u) => `Hi, ${u}!`,
      body: [
        'We received a request to recover access to your Pragma account.',
        'Click the button below to set a new password:',
      ],
      button: 'Set a new password',
      footer: "If you didn't request a password recovery, ignore this message — your current password still works.",
      signature: 'Thanks for being with us from the start.<br>The Pragma Team',
    },
    password_changed: {
      subject: 'Your Pragma password has been changed',
      greeting: (u) => `Hi, ${u}!`,
      body: [
        'Just letting you know that the password for your Pragma account was just changed.',
        'If this was you — great, no action needed.',
        'If this was NOT you, please use the password recovery option in Pragma right away to secure your account.',
      ],
      button: null,
      footer: '',
      signature: 'Thanks for being with us from the start.<br>The Pragma Team',
    },
    generic: {
      subject: 'Pragma — confirmation',
      greeting: (u) => `Hi, ${u}!`,
      body: ['To confirm this action in Pragma, click the button below:'],
      button: 'Continue',
      footer: "If you didn't do this, please ignore this message.",
      signature: 'Thanks for being with us from the start.<br>The Pragma Team',
    },
  },
  es: {
    teamName: 'El equipo de Pragma',
    signup: {
      subject: 'Confirma tu registro en Pragma',
      greeting: (u) => `¡Hola, ${u}!`,
      body: [
        'Gracias por registrarte en Pragma, la aplicación que te ayuda a detectar manipulación y patrones de razonamiento sanos en los textos que lees.',
        'Para terminar de crear tu cuenta, confirma tu dirección de correo:',
      ],
      button: 'Confirmar correo electrónico',
      footer: 'Si tú no creaste esta cuenta, simplemente ignora este mensaje.',
      signature: 'Gracias por estar con nosotros desde el principio.<br>El equipo de Pragma',
    },
    recovery: {
      subject: 'Recupera el acceso a tu cuenta de Pragma',
      greeting: (u) => `¡Hola, ${u}!`,
      body: [
        'Recibimos una solicitud para recuperar el acceso a tu cuenta de Pragma.',
        'Haz clic en el botón de abajo para establecer una nueva contraseña:',
      ],
      button: 'Establecer nueva contraseña',
      footer: 'Si tú no solicitaste recuperar tu contraseña, ignora este mensaje: tu contraseña actual sigue funcionando.',
      signature: 'Gracias por estar con nosotros desde el principio.<br>El equipo de Pragma',
    },
    password_changed: {
      subject: 'Tu contraseña de Pragma ha sido cambiada',
      greeting: (u) => `¡Hola, ${u}!`,
      body: [
        'Te avisamos de que la contraseña de tu cuenta de Pragma se acaba de cambiar.',
        'Si fuiste tú, perfecto, no tienes que hacer nada.',
        'Si NO fuiste tú, usa cuanto antes la opción de recuperar contraseña en Pragma para proteger tu cuenta.',
      ],
      button: null,
      footer: '',
      signature: 'Gracias por estar con nosotros desde el principio.<br>El equipo de Pragma',
    },
    generic: {
      subject: 'Pragma — confirmación',
      greeting: (u) => `¡Hola, ${u}!`,
      body: ['Para confirmar esta acción en Pragma, haz clic en el botón de abajo:'],
      button: 'Continuar',
      footer: 'Si tú no hiciste esto, ignora este mensaje.',
      signature: 'Gracias por estar con nosotros desde el principio.<br>El equipo de Pragma',
    },
  },
  de: {
    teamName: 'Das Pragma-Team',
    signup: {
      subject: 'Bestätige deine Registrierung bei Pragma',
      greeting: (u) => `Hallo, ${u}!`,
      body: [
        'Danke für deine Anmeldung bei Pragma – der App, die dir hilft, Manipulation und gesunde Denkmuster in Texten zu erkennen, die du liest.',
        'Um dein Konto fertig einzurichten, bestätige bitte deine E-Mail-Adresse:',
      ],
      button: 'E-Mail-Adresse bestätigen',
      footer: 'Wenn du dieses Konto nicht erstellt hast, ignoriere diese Nachricht einfach.',
      signature: 'Danke, dass du von Anfang an dabei bist.<br>Das Pragma-Team',
    },
    recovery: {
      subject: 'Zugang zu deinem Pragma-Konto wiederherstellen',
      greeting: (u) => `Hallo, ${u}!`,
      body: [
        'Wir haben eine Anfrage erhalten, den Zugang zu deinem Pragma-Konto wiederherzustellen.',
        'Klicke auf den Button unten, um ein neues Passwort festzulegen:',
      ],
      button: 'Neues Passwort festlegen',
      footer: 'Wenn du keine Wiederherstellung angefordert hast, ignoriere diese Nachricht – dein aktuelles Passwort funktioniert weiterhin.',
      signature: 'Danke, dass du von Anfang an dabei bist.<br>Das Pragma-Team',
    },
    password_changed: {
      subject: 'Dein Pragma-Passwort wurde geändert',
      greeting: (u) => `Hallo, ${u}!`,
      body: [
        'Wir wollten dich wissen lassen, dass das Passwort für dein Pragma-Konto gerade geändert wurde.',
        'Wenn du das warst – super, du musst nichts tun.',
        'Wenn du das NICHT warst, nutze so schnell wie möglich die Passwort-Wiederherstellung in Pragma, um dein Konto zu schützen.',
      ],
      button: null,
      footer: '',
      signature: 'Danke, dass du von Anfang an dabei bist.<br>Das Pragma-Team',
    },
    generic: {
      subject: 'Pragma — Bestätigung',
      greeting: (u) => `Hallo, ${u}!`,
      body: ['Um diese Aktion in Pragma zu bestätigen, klicke auf den Button unten:'],
      button: 'Weiter',
      footer: 'Wenn das nicht du warst, ignoriere diese Nachricht.',
      signature: 'Danke, dass du von Anfang an dabei bist.<br>Das Pragma-Team',
    },
  },
  fr: {
    teamName: "L'équipe Pragma",
    signup: {
      subject: 'Confirmez votre inscription sur Pragma',
      greeting: (u) => `Bonjour, ${u} !`,
      body: [
        "Merci de vous être inscrit(e) sur Pragma, l'application qui vous aide à repérer la manipulation et les schémas de raisonnement sains dans les textes que vous lisez.",
        'Pour terminer la création de votre compte, confirmez votre adresse e-mail :',
      ],
      button: "Confirmer l'adresse e-mail",
      footer: "Si vous n'êtes pas à l'origine de la création de ce compte, ignorez simplement ce message.",
      signature: "Merci d'être avec nous depuis le début.<br>L'équipe Pragma",
    },
    recovery: {
      subject: 'Récupérez l\'accès à votre compte Pragma',
      greeting: (u) => `Bonjour, ${u} !`,
      body: [
        "Nous avons reçu une demande de récupération d'accès à votre compte Pragma.",
        'Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :',
      ],
      button: 'Définir un nouveau mot de passe',
      footer: "Si vous n'avez pas demandé cette récupération, ignorez ce message : votre mot de passe actuel fonctionne toujours.",
      signature: "Merci d'être avec nous depuis le début.<br>L'équipe Pragma",
    },
    password_changed: {
      subject: 'Votre mot de passe Pragma a été modifié',
      greeting: (u) => `Bonjour, ${u} !`,
      body: [
        'Nous vous informons que le mot de passe de votre compte Pragma vient d\'être modifié.',
        "Si c'est vous qui l'avez fait, tout va bien, vous n'avez rien à faire.",
        "Si ce n'est PAS vous, utilisez au plus vite l'option de récupération de mot de passe dans Pragma pour sécuriser votre compte.",
      ],
      button: null,
      footer: '',
      signature: "Merci d'être avec nous depuis le début.<br>L'équipe Pragma",
    },
    generic: {
      subject: 'Pragma — confirmation',
      greeting: (u) => `Bonjour, ${u} !`,
      body: ['Pour confirmer cette action dans Pragma, cliquez sur le bouton ci-dessous :'],
      button: 'Continuer',
      footer: "Si ce n'est pas vous, ignorez ce message.",
      signature: "Merci d'être avec nous depuis le début.<br>L'équipe Pragma",
    },
  },
  ru: {
    teamName: 'Команда Pragma',
    signup: {
      subject: 'Подтвердите регистрацию в Pragma',
      greeting: (u) => `Привет, ${u}!`,
      body: [
        'Спасибо за регистрацию в Pragma — приложении, которое помогает замечать манипуляции и здоровые модели рассуждений в текстах, которые вы читаете.',
        'Чтобы завершить создание аккаунта, подтвердите свой адрес электронной почты:',
      ],
      button: 'Подтвердить e-mail',
      footer: 'Если вы не создавали этот аккаунт, просто проигнорируйте это письмо.',
      signature: 'Спасибо, что вы с нами с самого начала.<br>Команда Pragma',
    },
    recovery: {
      subject: 'Восстановите доступ к аккаунту Pragma',
      greeting: (u) => `Привет, ${u}!`,
      body: [
        'Мы получили запрос на восстановление доступа к вашему аккаунту Pragma.',
        'Нажмите на кнопку ниже, чтобы задать новый пароль:',
      ],
      button: 'Задать новый пароль',
      footer: 'Если вы не запрашивали восстановление пароля, проигнорируйте это письмо — ваш текущий пароль по-прежнему действует.',
      signature: 'Спасибо, что вы с нами с самого начала.<br>Команда Pragma',
    },
    password_changed: {
      subject: 'Ваш пароль в Pragma был изменён',
      greeting: (u) => `Привет, ${u}!`,
      body: [
        'Сообщаем, что пароль от вашего аккаунта Pragma только что был изменён.',
        'Если это сделали вы — всё в порядке, ничего делать не нужно.',
        'Если это сделали НЕ вы, как можно скорее воспользуйтесь восстановлением пароля в Pragma, чтобы защитить свой аккаунт.',
      ],
      button: null,
      footer: '',
      signature: 'Спасибо, что вы с нами с самого начала.<br>Команда Pragma',
    },
    generic: {
      subject: 'Pragma — подтверждение',
      greeting: (u) => `Привет, ${u}!`,
      body: ['Чтобы подтвердить это действие в Pragma, нажмите на кнопку ниже:'],
      button: 'Продолжить',
      footer: 'Если это были не вы, проигнорируйте это письмо.',
      signature: 'Спасибо, что вы с нами с самого начала.<br>Команда Pragma',
    },
  },
  zh: {
    teamName: 'Pragma 团队',
    signup: {
      subject: '确认您在 Pragma 的注册',
      greeting: (u) => `你好，${u}！`,
      body: [
        '感谢您注册 Pragma——这款应用能帮助您识别所读文本中的操纵手法和健康的推理模式。',
        '请点击下方按钮确认您的邮箱地址，以完成账户设置：',
      ],
      button: '确认邮箱地址',
      footer: '如果这不是您本人创建的账户，请忽略这封邮件。',
      signature: '感谢您从一开始就与我们同在。<br>Pragma 团队',
    },
    recovery: {
      subject: '找回您的 Pragma 账户访问权限',
      greeting: (u) => `你好，${u}！`,
      body: [
        '我们收到了一个找回您 Pragma 账户访问权限的请求。',
        '请点击下方按钮设置新密码：',
      ],
      button: '设置新密码',
      footer: '如果这不是您本人发起的请求，请忽略此邮件——您当前的密码仍然有效。',
      signature: '感谢您从一开始就与我们同在。<br>Pragma 团队',
    },
    password_changed: {
      subject: '您的 Pragma 密码已被修改',
      greeting: (u) => `你好，${u}！`,
      body: [
        '提醒您，您 Pragma 账户的密码刚刚被修改。',
        '如果是您本人操作——很好，无需任何操作。',
        '如果不是您本人操作，请尽快使用 Pragma 中的找回密码功能来保护您的账户。',
      ],
      button: null,
      footer: '',
      signature: '感谢您从一开始就与我们同在。<br>Pragma 团队',
    },
    generic: {
      subject: 'Pragma — 确认',
      greeting: (u) => `你好，${u}！`,
      body: ['要确认您在 Pragma 中的这项操作，请点击下方按钮：'],
      button: '继续',
      footer: '如果这不是您本人操作，请忽略此邮件。',
      signature: '感谢您从一开始就与我们同在。<br>Pragma 团队',
    },
  },
  ja: {
    teamName: 'Pragmaチーム',
    signup: {
      subject: 'Pragmaのご登録を確認してください',
      greeting: (u) => `${u}さん、こんにちは。`,
      body: [
        'Pragmaにご登録いただきありがとうございます。Pragmaは、読んでいる文章の中にある操作的な表現や、健全な考え方のパターンを見つけるお手伝いをするアプリです。',
        'アカウント設定を完了するために、下のボタンからメールアドレスを確認してください：',
      ],
      button: 'メールアドレスを確認する',
      footer: 'このアカウントに心当たりがない場合は、このメールは無視してください。',
      signature: '最初からPragmaと一緒にいてくれてありがとうございます。<br>Pragmaチーム',
    },
    recovery: {
      subject: 'Pragmaアカウントへのアクセスを回復する',
      greeting: (u) => `${u}さん、こんにちは。`,
      body: [
        'Pragmaアカウントへのアクセス回復のリクエストを受け付けました。',
        '下のボタンをクリックして、新しいパスワードを設定してください：',
      ],
      button: '新しいパスワードを設定する',
      footer: 'パスワードの回復をリクエストしていない場合は、このメールを無視してください。現在のパスワードはそのまま使えます。',
      signature: '最初からPragmaと一緒にいてくれてありがとうございます。<br>Pragmaチーム',
    },
    password_changed: {
      subject: 'Pragmaのパスワードが変更されました',
      greeting: (u) => `${u}さん、こんにちは。`,
      body: [
        'Pragmaアカウントのパスワードがたった今変更されたことをお知らせします。',
        'ご本人による変更であれば、特に対応は必要ありません。',
        'もしご本人でない場合は、すぐにPragmaのパスワード回復機能を使ってアカウントを保護してください。',
      ],
      button: null,
      footer: '',
      signature: '最初からPragmaと一緒にいてくれてありがとうございます。<br>Pragmaチーム',
    },
    generic: {
      subject: 'Pragma — 確認',
      greeting: (u) => `${u}さん、こんにちは。`,
      body: ['Pragmaでのこの操作を確認するために、下のボタンをクリックしてください：'],
      button: '続ける',
      footer: '心当たりがない場合は、このメールを無視してください。',
      signature: '最初からPragmaと一緒にいてくれてありがとうございます。<br>Pragmaチーム',
    },
  },
  hi: {
    teamName: 'Pragma टीम',
    signup: {
      subject: 'Pragma पर अपना पंजीकरण पुष्ट करें',
      greeting: (u) => `नमस्ते, ${u}!`,
      body: [
        'Pragma पर पंजीकरण करने के लिए धन्यवाद — यह ऐप आपको पढ़े जा रहे टेक्स्ट में हेरफेर और स्वस्थ तर्क पैटर्न पहचानने में मदद करता है।',
        'अपना खाता पूरा करने के लिए, कृपया अपना ईमेल पता पुष्ट करें:',
      ],
      button: 'ईमेल पता पुष्ट करें',
      footer: 'अगर यह खाता आपने नहीं बनाया, तो कृपया इस संदेश को अनदेखा करें।',
      signature: 'शुरुआत से हमारे साथ रहने के लिए धन्यवाद।<br>Pragma टीम',
    },
    recovery: {
      subject: 'अपने Pragma खाते तक पहुंच पुनर्प्राप्त करें',
      greeting: (u) => `नमस्ते, ${u}!`,
      body: [
        'हमें आपके Pragma खाते तक पहुंच पुनर्प्राप्त करने का अनुरोध मिला है।',
        'नया पासवर्ड सेट करने के लिए नीचे दिए गए बटन पर क्लिक करें:',
      ],
      button: 'नया पासवर्ड सेट करें',
      footer: 'अगर आपने पासवर्ड पुनर्प्राप्ति का अनुरोध नहीं किया, तो इस संदेश को अनदेखा करें — आपका मौजूदा पासवर्ड अभी भी काम करता है।',
      signature: 'शुरुआत से हमारे साथ रहने के लिए धन्यवाद।<br>Pragma टीम',
    },
    password_changed: {
      subject: 'आपका Pragma पासवर्ड बदल दिया गया है',
      greeting: (u) => `नमस्ते, ${u}!`,
      body: [
        'आपको बता रहे हैं कि आपके Pragma खाते का पासवर्ड अभी-अभी बदला गया है।',
        'अगर यह आपने किया है — बहुत बढ़िया, आपको कुछ करने की जरूरत नहीं है।',
        'अगर यह आपने नहीं किया, तो कृपया जल्द से जल्द अपने खाते को सुरक्षित करने के लिए Pragma में पासवर्ड पुनर्प्राप्ति विकल्प का उपयोग करें।',
      ],
      button: null,
      footer: '',
      signature: 'शुरुआत से हमारे साथ रहने के लिए धन्यवाद।<br>Pragma टीम',
    },
    generic: {
      subject: 'Pragma — पुष्टि',
      greeting: (u) => `नमस्ते, ${u}!`,
      body: ['Pragma में इस कार्रवाई की पुष्टि करने के लिए, नीचे दिए गए बटन पर क्लिक करें:'],
      button: 'आगे बढ़ें',
      footer: 'अगर यह आपने नहीं किया, तो कृपया इस संदेश को अनदेखा करें।',
      signature: 'शुरुआत से हमारे साथ रहने के लिए धन्यवाद।<br>Pragma टीम',
    },
  },
  ar: {
    teamName: 'فريق Pragma',
    signup: {
      subject: 'أكّد تسجيلك في Pragma',
      greeting: (u) => `مرحبًا يا ${u}!`,
      body: [
        'شكرًا لتسجيلك في Pragma، التطبيق الذي يساعدك على اكتشاف التلاعب وأنماط التفكير السليمة في النصوص التي تقرأها.',
        'لإكمال إعداد حسابك، يرجى تأكيد عنوان بريدك الإلكتروني:',
      ],
      button: 'تأكيد عنوان البريد الإلكتروني',
      footer: 'إذا لم تكن أنت من أنشأ هذا الحساب، يمكنك تجاهل هذه الرسالة ببساطة.',
      signature: 'شكرًا لبقائك معنا منذ البداية.<br>فريق Pragma',
    },
    recovery: {
      subject: 'استعد الوصول إلى حسابك في Pragma',
      greeting: (u) => `مرحبًا يا ${u}!`,
      body: [
        'تلقّينا طلبًا لاستعادة الوصول إلى حسابك في Pragma.',
        'اضغط على الزر أدناه لتعيين كلمة مرور جديدة:',
      ],
      button: 'تعيين كلمة مرور جديدة',
      footer: 'إذا لم تطلب استعادة كلمة المرور، تجاهل هذه الرسالة — كلمة مرورك الحالية ما زالت تعمل.',
      signature: 'شكرًا لبقائك معنا منذ البداية.<br>فريق Pragma',
    },
    password_changed: {
      subject: 'تم تغيير كلمة مرور Pragma الخاصة بك',
      greeting: (u) => `مرحبًا يا ${u}!`,
      body: [
        'نود إعلامك بأن كلمة مرور حسابك في Pragma تم تغييرها للتو.',
        'إذا كنت أنت من قام بذلك — رائع، لا داعي لفعل أي شيء.',
        'إذا لم تكن أنت من قام بذلك، يرجى استخدام خيار استعادة كلمة المرور في Pragma في أقرب وقت ممكن لحماية حسابك.',
      ],
      button: null,
      footer: '',
      signature: 'شكرًا لبقائك معنا منذ البداية.<br>فريق Pragma',
    },
    generic: {
      subject: 'Pragma — تأكيد',
      greeting: (u) => `مرحبًا يا ${u}!`,
      body: ['لتأكيد هذا الإجراء في Pragma، اضغط على الزر أدناه:'],
      button: 'متابعة',
      footer: 'إذا لم تكن أنت من قام بهذا الإجراء، يرجى تجاهل هذه الرسالة.',
      signature: 'شكرًا لبقائك معنا منذ البداية.<br>فريق Pragma',
    },
  },
}

const RTL_LANGUAGES = ['ar']

function buildHtml(content: { subject: string } & EmailContent, username: string, actionUrl: string | null, lang: string): string {
  const greeting = content.greeting(username)
  const bodyHtml = content.body.map((p) => `<p>${p}</p>`).join('\n')
  const buttonHtml =
    actionUrl && content.button
      ? `<p style="text-align:center;margin:32px 0;">
<a href="${actionUrl}" style="background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">${content.button}</a>
</p>`
      : ''
  const footerHtml = content.footer ? `<p style="color:#6b7280;font-size:14px;">${content.footer}</p>` : ''
  const inner = `<p>${greeting}</p>
${bodyHtml}
${buttonHtml}
${footerHtml}
<p>${content.signature}</p>`
  if (RTL_LANGUAGES.includes(lang)) {
    return `<div dir="rtl" style="text-align:right;">${inner}</div>`
  }
  return inner
}

Deno.serve(async (req: Request) => {
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  const rawSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? ''
  const hookSecret = rawSecret.replace('v1,whsec_', '')

  let verified: any
  try {
    const wh = new Webhook(hookSecret)
    verified = wh.verify(payload, headers)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { user, email_data } = verified as {
      user: { id: string; email: string; user_metadata?: Record<string, unknown> }
      email_data: {
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: profile } = await supabase.from('profiles').select('language, username').eq('id', user.id).single()

    const language =
      (user.user_metadata?.language as string | undefined) || profile?.language || 'en'
    const username =
      profile?.username || (user.user_metadata?.username as string | undefined) || user.email.split('@')[0]

    const langContent = EMAIL_CONTENT[language] || EMAIL_CONTENT.en

    const { token_hash, redirect_to, email_action_type } = email_data
    // Uwaga: NIE używamy tu email_data.site_url jako adresu bazowego —
    // w tym projekcie ta wartość sama już zawiera "/auth/v1" na końcu,
    // więc doklejenie "/auth/v1/verify" dawało zdublowaną, błędną ścieżkę
    // (".../auth/v1/auth/v1/verify" → 404, konto nigdy nie zostawało
    // potwierdzone, znalezione empirycznie w realnym teście). Zamiast
    // tego budujemy adres wprost z SUPABASE_URL, które na pewno nie ma
    // niczego doklejonego.
    //
    // /auth/v1/verify, mimo że to link klikany z maila (nie wywołanie z
    // zalogowanej sesji), i tak wymaga parametru `apikey` — bez niego
    // Supabase odpowiada "No API key found in request" i NIE potwierdza
    // konta (też znalezione empirycznie). `SUPABASE_ANON_KEY` jest
    // dostarczany automatycznie przez Supabase do każdej Edge Function,
    // nie trzeba go dodawać ręcznie jako sekret.
    const actionUrl = token_hash
      ? `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}&apikey=${Deno.env.get('SUPABASE_ANON_KEY')}`
      : null

    let content: { subject: string } & EmailContent
    let urlForThisEmail: string | null = actionUrl
    if (email_action_type === 'signup') {
      content = langContent.signup
    } else if (email_action_type === 'recovery') {
      content = langContent.recovery
    } else if (email_action_type === 'password_changed_notification') {
      content = langContent.password_changed
      urlForThisEmail = null
    } else {
      content = langContent.generic
    }

    const brevoKey = Deno.env.get('BREVO_API_KEY')
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
    // Nazwa nadawcy widoczna w skrzynce odbiorcy MUSI być w tym samym
    // języku co treść maila — inaczej np. niemiecki mail podpisuje się
    // po polsku ("Zespół Pragma"), co wygląda na pomyłkę. Każdy język w
    // EMAIL_CONTENT ma własne teamName; zmienna środowiskowa
    // BREVO_SENDER_NAME zostaje tylko jako ostateczny fallback.
    const senderName = langContent.teamName || Deno.env.get('BREVO_SENDER_NAME') || 'Zespół Pragma'

    if (!brevoKey || !senderEmail) {
      return new Response(JSON.stringify({ error: 'not_configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const htmlContent = buildHtml(content, username, urlForThisEmail, language)

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: user.email, name: username }],
        subject: content.subject,
        htmlContent,
      }),
    })

    if (!brevoRes.ok) {
      const details = await brevoRes.text()
      return new Response(JSON.stringify({ error: 'brevo_error', details }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
