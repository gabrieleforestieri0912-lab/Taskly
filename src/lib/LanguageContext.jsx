"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext(null);

const translations = {
  it: {
    // Navbar / General
    features: "Funzionalità",
    howItWorks: "Come funziona",
    demo: "Demo",
    pricing: "Prezzi",
    faq: "FAQ",
    dashboard: "Dashboard",
    settings: "Impostazioni",
    logout: "Disconnetti",
    login: "Accedi",
    start: "Inizia",
    account: "Account",

    // Sidebar
    home: "Home",
    homePages: "Home (Pagine)",
    meetingsVoice: "Riunioni (Registrazione Vocale)",
    aiAssistant: "Assistente AI (Chat)",
    search: "Cerca",
    newPage: "Nuova Pagina",
    newTranscription: "Nuova Trascrizione",
    yourPages: "Le tue pagine",
    meetingRecording: "Registrazione Riunioni",
    meetingRecordingDesc:
      "Registra audio ed ottieni trascrizioni istantanee e riassunti con l'AI.",
    changeTheme: "Cambia Tema",
    searchPagesPlaceholder: "Cerca pagine...",
    history: "Cronologia",
    noPagesFound: "Nessuna pagina trovata",
    delete: "Elimina",

    // Dashboard page settings menu
    lightMode: "Modalità chiara",
    darkMode: "Modalità scura",
    accountSettings: "Impostazioni account",

    // Settings Page
    settingsTitle: "Impostazioni",
    subscription: "Abbonamento",
    status: "Stato",
    manage: "Gestisci",
    language: "Lingua",
    selectLanguageDesc: "Seleziona la lingua dell'applicazione",
    backToDashboard: "Torna alla dashboard",
    active: "Attivo",
    inactive: "Non attivo",
    loading: "Caricamento...",
  },
  en: {
    // Navbar / General
    features: "Features",
    howItWorks: "How it works",
    demo: "Demo",
    pricing: "Pricing",
    faq: "FAQ",
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    start: "Get Started",
    account: "Account",

    // Sidebar
    home: "Home",
    homePages: "Home (Pages)",
    meetingsVoice: "Meetings (Voice Recording)",
    aiAssistant: "AI Assistant (Chat)",
    search: "Search",
    newPage: "New Page",
    newTranscription: "New Transcription",
    yourPages: "Your pages",
    meetingRecording: "Meeting Recording",
    meetingRecordingDesc:
      "Record audio and get instant transcriptions and summaries with AI.",
    changeTheme: "Change Theme",
    searchPagesPlaceholder: "Search pages...",
    history: "History",
    noPagesFound: "No pages found",
    delete: "Delete",

    // Dashboard page settings menu
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    accountSettings: "Account Settings",

    // Settings Page
    settingsTitle: "Settings",
    subscription: "Subscription",
    status: "Status",
    manage: "Manage",
    language: "Language",
    selectLanguageDesc: "Select the application language",
    backToDashboard: "Back to Dashboard",
    active: "Active",
    inactive: "Inactive",
    loading: "Loading...",
  },
  es: {
    // Navbar / General
    features: "Funcionalidades",
    howItWorks: "Cómo funciona",
    demo: "Demo",
    pricing: "Precios",
    faq: "Preguntas frecuentes",
    dashboard: "Tablero",
    settings: "Configuración",
    logout: "Cerrar sesión",
    login: "Iniciar sesión",
    start: "Empezar",
    account: "Cuenta",

    // Sidebar
    home: "Inicio",
    homePages: "Inicio (Páginas)",
    meetingsVoice: "Reuniones (Grabación de voz)",
    aiAssistant: "Asistente AI (Chat)",
    search: "Buscar",
    newPage: "Nueva Página",
    newTranscription: "Nueva Transcripción",
    yourPages: "Tus páginas",
    meetingRecording: "Grabación de Reuniones",
    meetingRecordingDesc:
      "Graba audio y obtén transcripciones instantáneas y resúmenes con IA.",
    changeTheme: "Cambiar Tema",
    searchPagesPlaceholder: "Buscar páginas...",
    history: "Historial",
    noPagesFound: "No se encontraron páginas",
    delete: "Eliminar",

    // Dashboard page settings menu
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",
    accountSettings: "Configuración de la cuenta",

    // Settings Page
    settingsTitle: "Configuración",
    subscription: "Suscripción",
    status: "Estado",
    manage: "Gestionar",
    language: "Idioma",
    selectLanguageDesc: "Selecciona el idioma de la aplicación",
    backToDashboard: "Volver al tablero",
    active: "Activo",
    inactive: "Inactivo",
    loading: "Cargando...",
  },
  fr: {
    // Navbar / General
    features: "Fonctionnalités",
    howItWorks: "Comment ça marche",
    demo: "Démo",
    pricing: "Tarifs",
    faq: "FAQ",
    dashboard: "Tableau de bord",
    settings: "Paramètres",
    logout: "Déconnexion",
    login: "Connexion",
    start: "Démarrer",
    account: "Compte",

    // Sidebar
    home: "Accueil",
    homePages: "Accueil (Pages)",
    meetingsVoice: "Réunions (Enregistrement vocal)",
    aiAssistant: "Assistant IA (Chat)",
    search: "Rechercher",
    newPage: "Nouvelle Page",
    newTranscription: "Nouvelle Transcription",
    yourPages: "Vos pages",
    meetingRecording: "Enregistrement de Réunion",
    meetingRecordingDesc:
      "Enregistrez de l'audio et obtenez des transcriptions instantanées et des résumés avec l'IA.",
    changeTheme: "Changer de Thème",
    searchPagesPlaceholder: "Rechercher des pages...",
    history: "Historique",
    noPagesFound: "Aucune page trouvée",
    delete: "Supprimer",

    // Dashboard page settings menu
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    accountSettings: "Paramètres du compte",

    // Settings Page
    settingsTitle: "Paramètres",
    subscription: "Abonnement",
    status: "Statut",
    manage: "Gérer",
    language: "Langue",
    selectLanguageDesc: "Sélectionnez la langue de l'application",
    backToDashboard: "Retour au tableau de bord",
    active: "Actif",
    inactive: "Inactif",
    loading: "Chargement...",
  },
  de: {
    // Navbar / General
    features: "Funktionen",
    howItWorks: "Wie es funktioniert",
    demo: "Demo",
    pricing: "Preise",
    faq: "FAQ",
    dashboard: "Dashboard",
    settings: "Einstellungen",
    logout: "Abmelden",
    login: "Anmelden",
    start: "Loslegen",
    account: "Konto",

    // Sidebar
    home: "Startseite",
    homePages: "Startseite (Seiten)",
    meetingsVoice: "Meetings (Sprachaufzeichnung)",
    aiAssistant: "KI-Assistent (Chat)",
    search: "Suchen",
    newPage: "Neue Seite",
    newTranscription: "Neue Transkription",
    yourPages: "Ihre Seiten",
    meetingRecording: "Meeting-Aufzeichnung",
    meetingRecordingDesc:
      "Nehmen Sie Audio auf und erhalten Sie sofortige Transkriptionen und Zusammenfassungen mit KI.",
    changeTheme: "Design ändern",
    searchPagesPlaceholder: "Seiten suchen...",
    history: "Verlauf",
    noPagesFound: "Keine Seiten gefunden",
    delete: "Löschen",

    // Dashboard page settings menu
    lightMode: "Heller Modus",
    darkMode: "Dunkler Modus",
    accountSettings: "Kontoeinstellungen",

    // Settings Page
    settingsTitle: "Einstellungen",
    subscription: "Abonnement",
    status: "Status",
    manage: "Verwalten",
    language: "Sprache",
    selectLanguageDesc: "Wählen Sie die Anwendungssprache",
    backToDashboard: "Zurück zum Dashboard",
    active: "Aktiv",
    inactive: "Inaktiv",
    loading: "Laden...",
  },
};

export const LanguageProvider = ({ children }) => {
  // Initialize to a server-stable default to avoid hydration mismatches.
  // Read `localStorage` only after mount so the initial client render
  // matches the server-rendered HTML.
  const [language, setLanguageState] = useState("it");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("language");
      if (savedLang && translations[savedLang] && savedLang !== language) {
        setLanguageState(savedLang);
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep document language in sync
  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch (e) {}
  }, [language]);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem("language", lang);
      } catch (e) {}
      try {
        document.documentElement.lang = lang;
      } catch (e) {}
      // notify listeners
      try {
        window.dispatchEvent(
          new CustomEvent("language-changed", { detail: { language: lang } }),
        );
      } catch (e) {}
      // automatic reload to ensure server-rendered and static text updates
      try {
        if (typeof window !== "undefined") window.location.reload();
      } catch (e) {}
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations["it"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
