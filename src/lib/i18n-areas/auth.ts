// Dizionari area AUTH/LEGAL/SUPPORT (chiavi con prefisso "auth.").
// Popolato dagli agenti di traduzione: login, registrazione, privacy,
// termini, supporto, docs, activity, integrations.
export const authIt: Record<string, string> = {
  // Condivise
  "auth.backToHome": "Torna alla home",
  "auth.orDivider": "Oppure",
  "auth.emailPlaceholder": "nome@esempio.it",
  "auth.signIn": "Accedi",

  // Login
  "auth.loginError": "Errore durante l'accesso. Riprova.",
  "auth.googleLoginError": "Accesso Google fallito. Riprova.",
  "auth.googleLoginCancelled": "Accesso Google annullato o non riuscito.",
  "auth.welcomeBack": "Bentornato",
  "auth.loginSubtitle": "Accedi per gestire i tuoi obiettivi",
  "auth.forgotPassword": "Dimenticata?",
  "auth.signingIn": "Accesso in corso...",
  "auth.googleLoginUnavailable": "Google Login non disponibile: configura `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.",
  "auth.noAccountYet": "Non hai ancora un account?",
  "auth.registerNow": "Registrati ora",

  // Register
  "auth.registerError": "Errore durante la registrazione. Riprova.",
  "auth.googleRegisterError": "Registrazione con Google fallita. Riprova.",
  "auth.googleRegisterCancelled": "Registrazione Google annullata o non riuscita.",
  "auth.createAccount": "Crea un account",
  "auth.registerSubtitle": "Inizia subito a gestire i tuoi obiettivi",
  "auth.redirectingToLogin": "Reindirizzamento al login...",
  "auth.fullName": "Nome Completo",
  "auth.fullNamePlaceholder": "Mario Rossi",
  "auth.registering": "Registrazione in corso...",
  "auth.signUp": "Registrati",
  "auth.googleSignupUnavailable": "Google Sign-up non disponibile: configura `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.",
  "auth.alreadyHaveAccount": "Hai già un account?",

  // Privacy
  "auth.privacyTitle": "Informativa sulla Privacy",
  "auth.privacyUpdated": "Ultimo aggiornamento: 18 Settembre 2026",
  "auth.privacyS1Title": "1. Introduzione",
  "auth.privacyS1Body":
    "Benvenuti su Taskly. La tua privacy è fondamentale per noi. Questa Informativa sulla Privacy descrive come raccogliamo, utilizziamo e proteggiamo le tue informazioni quando utilizzi l'applicazione Taskly e i nostri servizi correlati.",
  "auth.privacyS2Title": "2. Dati che Raccogliamo",
  "auth.privacyS2aTitle": "Informazioni fornite tramite Google OAuth",
  "auth.privacyS2aBody":
    "Per facilitare l'accesso e la creazione dell'account, Taskly utilizza l'autenticazione Google. Attraverso questo processo, raccogliamo le seguenti informazioni dal tuo profilo Google:",
  "auth.privacyS2aLi1": "Indirizzo email (per l'identificazione dell'account e comunicazioni di servizio).",
  "auth.privacyS2aLi2": "Nome e Cognome (per personalizzare la tua esperienza all'interno dell'app).",
  "auth.privacyS2aLi3": "Foto del profilo (per la visualizzazione nel tuo workspace).",
  "auth.privacyS2bTitle": "Contenuti generati dall'utente",
  "auth.privacyS2bBody": "Raccogliamo e archiviamo i dati che inserisci attivamente nell'applicazione, tra cui:",
  "auth.privacyS2bLi1": "Task, note, obiettivi e scadenze.",
  "auth.privacyS2bLi2": "Eventi di calendario e pianificazioni.",
  "auth.privacyS2bLi3": "Eventuali collegamenti o documenti caricati nel workspace.",
  "auth.privacyS2cTitle": "Dati tecnici e di utilizzo",
  "auth.privacyS2cBody":
    "Raccogliamo automaticamente informazioni tecniche limitate per garantire la sicurezza e il corretto funzionamento dell'app, come l'indirizzo IP e il tipo di browser utilizzato.",
  "auth.privacyS3Title": "3. Come Utilizziamo i tuoi Dati",
  "auth.privacyS3Intro": "Utilizziamo le informazioni raccolte per i seguenti scopi:",
  "auth.privacyS3aLabel": "Fornitura del Servizio:",
  "auth.privacyS3aText":
    "Creazione e gestione del tuo account, sincronizzazione dei tuoi dati tra i dispositivi e gestione del workspace.",
  "auth.privacyS3bLabel": "Personalizzazione:",
  "auth.privacyS3bText": "Adattare l'interfaccia e le funzionalità in base alle tue preferenze.",
  "auth.privacyS3cLabel": "Sicurezza:",
  "auth.privacyS3cText": "Prevenire frodi, abusi e garantire l'integrità dei dati.",
  "auth.privacyS3dLabel": "Miglioramento del Prodotto:",
  "auth.privacyS3dText":
    "Analizzare l'utilizzo aggregato dell'app per sviluppare nuove funzionalità e ottimizzare quelle esistenti.",
  "auth.privacyS4Title": "4. Condivisione e Protezione dei Dati",
  "auth.privacyS4Bold":
    "Non vendiamo, noleggiamo né scambiamo i tuoi dati personali con terze parti per scopi di marketing.",
  "auth.privacyS4Intro":
    "Condividiamo i tuoi dati esclusivamente con i nostri fornitori di servizi infrastrutturali che operano come responsabili del trattamento, tra cui:",
  "auth.privacyS4aLabel": "Google Cloud Platform:",
  "auth.privacyS4aText": "Per l'hosting, l'autenticazione OAuth e i servizi di database.",
  "auth.privacyS4bLabel": "Supabase:",
  "auth.privacyS4bText": "Per la gestione del database in tempo reale e l'autenticazione.",
  "auth.privacyS4cLabel": "Vercel:",
  "auth.privacyS4cText": "Per il deployment e l'hosting della nostra applicazione web.",
  "auth.privacyS5Title": "5. I tuoi Diritti (GDPR)",
  "auth.privacyS5Intro":
    "In conformità al Regolamento Generale sulla Protezione dei Dati (GDPR), hai i seguenti diritti:",
  "auth.privacyS5aLabel": "Diritto di Accesso:",
  "auth.privacyS5aText": "Puoi richiedere una copia dei tuoi dati personali.",
  "auth.privacyS5bLabel": "Diritto di Rettifica:",
  "auth.privacyS5bText": "Puoi aggiornare o correggere i tuoi dati in qualsiasi momento.",
  "auth.privacyS5cLabel": "Diritto alla Cancellazione:",
  "auth.privacyS5cText":
    "Puoi richiedere la rimozione completa dei tuoi dati dai nostri sistemi (\"diritto all'oblio\").",
  "auth.privacyS5dLabel": "Diritto alla Portabilità:",
  "auth.privacyS5dText": "Puoi richiedere l'esportazione dei tuoi dati in un formato leggibile.",
  "auth.privacyS6Title": "6. Modifiche all'Informativa",
  "auth.privacyS6Body":
    "Ci riserviamo il diritto di aggiornare questa Informativa sulla Privacy. Qualsiasi modifica significativa sarà comunicata tramite l'applicazione o via email all'indirizzo associato al tuo account.",
  "auth.privacyS7Title": "7. Contatti",
  "auth.privacyS7Body":
    "Per domande relative a questa informativa o per esercitare i tuoi diritti, puoi contattarci all'indirizzo:",

  // Terms
  "auth.termsTitle": "Termini e condizioni",
  "auth.termsIntro":
    "Questa è una pagina di esempio per i termini e le condizioni. Inserisci qui i termini del servizio.",
  "auth.termsUsageTitle": "Uso del servizio",
  "auth.termsUsageBody": "Dettagli sui termini d'uso.",

  // Support
  "auth.supportTitle": "Supporto",
  "auth.supportSubtitle": "Se hai bisogno di aiuto o vuoi inviare feedback, scrivici qui sotto.",
  "auth.supportSentTitle": "Messaggio inviato!",
  "auth.supportSentBody": "Grazie per averci contattato. Risponderemo entro 24 ore.",
  "auth.supportSendAnother": "Invia un altro messaggio",
  "auth.supportNameLabel": "Nome (opzionale)",
  "auth.supportNamePlaceholder": "Il tuo nome",
  "auth.supportEmailLabel": "Email (opzionale)",
  "auth.supportEmailPlaceholder": "tua@email.it",
  "auth.supportMessageLabel": "Messaggio",
  "auth.supportMessagePlaceholder": "Descrivi il problema o il feedback...",
  "auth.supportError": "Errore nell'invio. Riprova più tardi.",
  "auth.supportSending": "Invio in corso...",
  "auth.supportSend": "Invia messaggio",

  // Docs
  "auth.docsTitle": "Documentazione",
  "auth.docsIntro":
    "Benvenuto nella documentazione ufficiale di Taskly. Qui trovi guide, tutorial e riferimenti alle funzionalità principali.",
  "auth.docsQuickTitle": "Guida Rapida",
  "auth.docsQuickBody": "Introduzione all'uso di Taskly.",
  "auth.docsApiTitle": "API & Integrazioni",
  "auth.docsApiBody": "Informazioni sulle integrazioni e API.",
  "auth.docsFaqBody": "Domande frequenti e risoluzione problemi.",

  // Activity
  "auth.activityTitle": "Attività recenti",
  "auth.activityEmpty": "Nessuna attività.",

  // Integrations
  "auth.intPasteWebhook": "Incolla l'URL del webhook Slack.",
  "auth.intSlackConnected": "Slack collegato ✓ Ora puoi inviare messaggi di test.",
  "auth.intConnectError": "Errore durante il collegamento.",
  "auth.intNetworkError": "Errore di rete durante il collegamento.",
  "auth.intDefaultTestMessage": "Collegamento Taskly verificato",
  "auth.intSlackSent": "Messaggio inviato a Slack",
  "auth.intSlackSendError": "Errore di invio a Slack.",
  "auth.intSlackDisconnected": "Slack scollegato.",
  "auth.intGoogleNotConfigured": "Google non configurato sul server. Aggiungi GOOGLE_CLIENT_ID.",
  "auth.intGoogleConnectError": "Errore durante il collegamento Google.",
  "auth.intGoogleDisconnected": "Google Calendar scollegato.",
  "auth.intTitle": "Integrazioni",
  "auth.intSubtitle": "Collega Taskly ai tuoi strumenti per automatizzare i flussi di lavoro.",
  "auth.intConnectedBadge": "Collegato",
  "auth.intGoogleDesc": "Sincronizza task e scadenze nel tuo calendario Google.",
  "auth.intDisconnect": "Scollega",
  "auth.intConnect": "Connetti",
  "auth.intSlackDesc": "Ricevi le notifiche dei task direttamente sul tuo canale Slack.",
  "auth.intConnectWebhook": "Collega webhook",
  "auth.intTestPlaceholder": "Messaggio di test (opzionale)",
  "auth.intSendTest": "Invia test",
  "auth.intWebhookDesc":
    "Pronto per il backend: ricevi eventi in tempo reale da Taskly (task creati, completati, pagine pubblicate).",
};

// Interfaccia e contenuti senza prefisso di area: etichette accessibili,
// nomi propri di sezioni e termini dell'editor che non hanno ancora una
// voce dedicata negli altri dizionari.
export const miscIt: Record<string, string> = {
  "misc.toggleSidebar": "Apri/chiudi barra laterale",
  "misc.docsGuides": "Guide",
  "misc.termsLegal": "Note legali",
  "misc.backlinks": "Backlink",
  "misc.boardDesignSystem": "Design System",
  "misc.landingViews": "Viste",
  "misc.integration": "Integrazione",
  "misc.mainNavLabel": "Navigazione principale",
  "misc.openMenu": "Apri menu",
  "misc.mobileMenu": "Menu mobile",
  "misc.tasklyViews": "Viste di Taskly",
  "misc.altText": "Testo alternativo",
  "misc.youtubePlayer": "Player video YouTube",
  "misc.tasks": "Task",
  "misc.close": "Chiudi",
};

export const miscEn: Record<string, string> = {
  "misc.toggleSidebar": "Toggle sidebar",
  "misc.docsGuides": "Guides",
  "misc.termsLegal": "Legal",
  "misc.backlinks": "Backlinks",
  "misc.boardDesignSystem": "Design System",
  "misc.landingViews": "Views",
  "misc.integration": "Integration",
  "misc.mainNavLabel": "Main navigation",
  "misc.openMenu": "Open menu",
  "misc.mobileMenu": "Mobile menu",
  "misc.tasklyViews": "Taskly views",
  "misc.altText": "Alt text",
  "misc.youtubePlayer": "YouTube video player",
  "misc.tasks": "Tasks",
  "misc.close": "Close",
};

export const authEn: Record<string, string> = {
  // Shared
  "auth.backToHome": "Back to home",
  "auth.orDivider": "Or",
  "auth.emailPlaceholder": "name@example.com",
  "auth.signIn": "Sign in",

  // Login
  "auth.loginError": "Sign-in failed. Please try again.",
  "auth.googleLoginError": "Google sign-in failed. Please try again.",
  "auth.googleLoginCancelled": "Google sign-in cancelled or failed.",
  "auth.welcomeBack": "Welcome back",
  "auth.loginSubtitle": "Sign in to manage your goals",
  "auth.forgotPassword": "Forgot?",
  "auth.signingIn": "Signing in...",
  "auth.googleLoginUnavailable": "Google Login unavailable: configure `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.",
  "auth.noAccountYet": "Don't have an account yet?",
  "auth.registerNow": "Sign up now",

  // Register
  "auth.registerError": "Sign-up failed. Please try again.",
  "auth.googleRegisterError": "Google sign-up failed. Please try again.",
  "auth.googleRegisterCancelled": "Google sign-up cancelled or failed.",
  "auth.createAccount": "Create an account",
  "auth.registerSubtitle": "Start managing your goals right away",
  "auth.redirectingToLogin": "Redirecting to login...",
  "auth.fullName": "Full Name",
  "auth.fullNamePlaceholder": "John Doe",
  "auth.registering": "Creating your account...",
  "auth.signUp": "Sign up",
  "auth.googleSignupUnavailable": "Google sign-up unavailable: configure `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.",
  "auth.alreadyHaveAccount": "Already have an account?",

  // Privacy
  "auth.privacyTitle": "Privacy Policy",
  "auth.privacyUpdated": "Last updated: September 18, 2026",
  "auth.privacyS1Title": "1. Introduction",
  "auth.privacyS1Body":
    "Welcome to Taskly. Your privacy is essential to us. This Privacy Policy describes how we collect, use and protect your information when you use the Taskly application and our related services.",
  "auth.privacyS2Title": "2. Data We Collect",
  "auth.privacyS2aTitle": "Information provided via Google OAuth",
  "auth.privacyS2aBody":
    "To make sign-in and account creation easier, Taskly uses Google authentication. Through this process, we collect the following information from your Google profile:",
  "auth.privacyS2aLi1": "Email address (for account identification and service communications).",
  "auth.privacyS2aLi2": "First and last name (to personalize your in-app experience).",
  "auth.privacyS2aLi3": "Profile photo (for display in your workspace).",
  "auth.privacyS2bTitle": "User-generated content",
  "auth.privacyS2bBody": "We collect and store the data you actively enter into the application, including:",
  "auth.privacyS2bLi1": "Tasks, notes, goals and deadlines.",
  "auth.privacyS2bLi2": "Calendar events and schedules.",
  "auth.privacyS2bLi3": "Any links or documents uploaded to the workspace.",
  "auth.privacyS2cTitle": "Technical and usage data",
  "auth.privacyS2cBody":
    "We automatically collect limited technical information to ensure the security and proper functioning of the app, such as your IP address and browser type.",
  "auth.privacyS3Title": "3. How We Use Your Data",
  "auth.privacyS3Intro": "We use the information we collect for the following purposes:",
  "auth.privacyS3aLabel": "Service Provision:",
  "auth.privacyS3aText":
    "Creating and managing your account, syncing your data across devices and managing the workspace.",
  "auth.privacyS3bLabel": "Personalization:",
  "auth.privacyS3bText": "Adapting the interface and features to your preferences.",
  "auth.privacyS3cLabel": "Security:",
  "auth.privacyS3cText": "Preventing fraud, abuse and ensuring data integrity.",
  "auth.privacyS3dLabel": "Product Improvement:",
  "auth.privacyS3dText":
    "Analyzing aggregated app usage to develop new features and optimize existing ones.",
  "auth.privacyS4Title": "4. Data Sharing and Protection",
  "auth.privacyS4Bold": "We do not sell, rent or trade your personal data with third parties for marketing purposes.",
  "auth.privacyS4Intro":
    "We share your data exclusively with our infrastructure service providers acting as data processors, including:",
  "auth.privacyS4aLabel": "Google Cloud Platform:",
  "auth.privacyS4aText": "For hosting, OAuth authentication and database services.",
  "auth.privacyS4bLabel": "Supabase:",
  "auth.privacyS4bText": "For real-time database management and authentication.",
  "auth.privacyS4cLabel": "Vercel:",
  "auth.privacyS4cText": "For deployment and hosting of our web application.",
  "auth.privacyS5Title": "5. Your Rights (GDPR)",
  "auth.privacyS5Intro":
    "In accordance with the General Data Protection Regulation (GDPR), you have the following rights:",
  "auth.privacyS5aLabel": "Right of Access:",
  "auth.privacyS5aText": "You can request a copy of your personal data.",
  "auth.privacyS5bLabel": "Right to Rectification:",
  "auth.privacyS5bText": "You can update or correct your data at any time.",
  "auth.privacyS5cLabel": "Right to Erasure:",
  "auth.privacyS5cText":
    "You can request the complete removal of your data from our systems (\"right to be forgotten\").",
  "auth.privacyS5dLabel": "Right to Portability:",
  "auth.privacyS5dText": "You can request the export of your data in a readable format.",
  "auth.privacyS6Title": "6. Changes to This Policy",
  "auth.privacyS6Body":
    "We reserve the right to update this Privacy Policy. Any significant change will be communicated through the application or via email to the address associated with your account.",
  "auth.privacyS7Title": "7. Contact",
  "auth.privacyS7Body":
    "For questions about this policy or to exercise your rights, you can contact us at:",

  // Terms
  "auth.termsTitle": "Terms and conditions",
  "auth.termsIntro": "This is a sample page for the terms and conditions. Enter the terms of service here.",
  "auth.termsUsageTitle": "Use of the service",
  "auth.termsUsageBody": "Details on the terms of use.",

  // Support
  "auth.supportTitle": "Support",
  "auth.supportSubtitle": "If you need help or want to send feedback, write to us below.",
  "auth.supportSentTitle": "Message sent!",
  "auth.supportSentBody": "Thank you for contacting us. We will reply within 24 hours.",
  "auth.supportSendAnother": "Send another message",
  "auth.supportNameLabel": "Name (optional)",
  "auth.supportNamePlaceholder": "Your name",
  "auth.supportEmailLabel": "Email (optional)",
  "auth.supportEmailPlaceholder": "you@email.com",
  "auth.supportMessageLabel": "Message",
  "auth.supportMessagePlaceholder": "Describe the issue or feedback...",
  "auth.supportError": "Failed to send. Please try again later.",
  "auth.supportSending": "Sending...",
  "auth.supportSend": "Send message",

  // Docs
  "auth.docsTitle": "Documentation",
  "auth.docsIntro":
    "Welcome to the official Taskly documentation. Here you will find guides, tutorials and references to the main features.",
  "auth.docsQuickTitle": "Quick Guide",
  "auth.docsQuickBody": "Introduction to using Taskly.",
  "auth.docsApiTitle": "API & Integrations",
  "auth.docsApiBody": "Information about integrations and APIs.",
  "auth.docsFaqBody": "Frequently asked questions and troubleshooting.",

  // Activity
  "auth.activityTitle": "Recent activity",
  "auth.activityEmpty": "No activity.",

  // Integrations
  "auth.intPasteWebhook": "Paste the Slack webhook URL.",
  "auth.intSlackConnected": "Slack connected ✓ Now you can send test messages.",
  "auth.intConnectError": "Failed to connect.",
  "auth.intNetworkError": "Network error while connecting.",
  "auth.intDefaultTestMessage": "Taskly connection verified",
  "auth.intSlackSent": "Message sent to Slack",
  "auth.intSlackSendError": "Failed to send to Slack.",
  "auth.intSlackDisconnected": "Slack disconnected.",
  "auth.intGoogleNotConfigured": "Google is not configured on the server. Add GOOGLE_CLIENT_ID.",
  "auth.intGoogleConnectError": "Failed to connect Google.",
  "auth.intGoogleDisconnected": "Google Calendar disconnected.",
  "auth.intTitle": "Integrations",
  "auth.intSubtitle": "Connect Taskly to your tools to automate workflows.",
  "auth.intConnectedBadge": "Connected",
  "auth.intGoogleDesc": "Sync tasks and deadlines to your Google calendar.",
  "auth.intDisconnect": "Disconnect",
  "auth.intConnect": "Connect",
  "auth.intSlackDesc": "Receive task notifications directly in your Slack channel.",
  "auth.intConnectWebhook": "Connect webhook",
  "auth.intTestPlaceholder": "Test message (optional)",
  "auth.intSendTest": "Send test",
  "auth.intWebhookDesc":
    "Backend ready: receive real-time events from Taskly (created tasks, completed tasks, published pages).",
};
