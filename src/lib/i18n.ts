import { appviewsIt, appviewsEn } from "./i18n-areas/appviews";
import { authIt, authEn, miscIt, miscEn } from "./i18n-areas/auth";
import { landingIt, landingEn } from "./i18n-areas/landing";
import { pagesIt, pagesEn } from "./i18n-areas/pages";

export type LangCode = "it" | "en";
export type TranslationDict = Record<string, string>;
export type Translations = Record<LangCode, TranslationDict>;

// Dizionari per area (prefissi "views.", "auth.", "land.", "pg.").
// Vivono in file separati per area; il core le merge in un unico dizionario.
const areaIt: TranslationDict[] = [appviewsIt, authIt, miscIt, landingIt, pagesIt];
const areaEn: TranslationDict[] = [appviewsEn, authEn, miscEn, landingEn, pagesEn];

export const coreTranslations: Translations = {
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
    homePages: "Dashboard & Analitiche",
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
    appearance: "Aspetto",
    appearanceDesc: "Scegli tra tema chiaro o scuro. Di default la piattaforma usa il tema chiaro.",
    active: "Attivo",
    inactive: "Non attivo",
    loading: "Caricamento...",
    confirmLogoutTitle: "Sei sicuro di voler uscire?",
    confirmLogoutDesc: "La sessione verrà terminata e verrai riportato alla home.",
    cancel: "Annulla",
    confirmLogout: "Conferma logout",

    // Dashboard
    dashboardTitle: "Il tuo centro di comando",
    dashboardSubtitle: "Tutto sotto controllo.",
    statActiveTasks: "Task Attivi",
    statAwaiting: "In attesa di completamento",
    statGoals: "Obiettivi",
    statGoalsAchieved: "raggiunti",
    statIdeas: "Idee Brainstorm",
    statIdeasAwaiting: "In attesa di conversione",
    statFocus: "Focus Oggi",
    statFocusSub: "Focus principale",
    noFocus: "Nessun focus impostato per oggi",
    focusToday: "Focus di Oggi",
    criticalTasks: "Task critici",
    activeGoalsLabel: "Obiettivi attivi",
    done: "Done",
    priorityHigh: "Priorità Alta",
    seeAll: "Vedi Tutti",
    noCriticalTasks: "Nessun task critico. Ottimo!",
    recentIdeas: "Ultime Idee",
    noIdeas: "Fai un brain dump delle tue idee!",
    goalProgress: "Progressi Obiettivi",
    noActiveGoals: "Nessun obiettivo attivo.",
    quickNav: "Navigazione Rapida",
    newProject: "Nuovo Progetto",
    newIdea: "Nuova Idea",
    aiAnalysis: "L'assistente AI ha analizzato il tuo workspace. Hai 3 task urgenti che potrebbero bloccare i tuoi obiettivi.",
    aiAction: "Analisi Completa",
    resourcesTools: "Risorse e Strumenti",
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
    homePages: "Dashboard & Analytics",
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
    appearance: "Appearance",
    appearanceDesc: "Choose between light or dark theme. The platform uses the light theme by default.",
    active: "Active",
    inactive: "Inactive",
    loading: "Loading...",
    confirmLogoutTitle: "Are you sure you want to log out?",
    confirmLogoutDesc: "Your session will end and you will be returned to the home page.",
    cancel: "Cancel",
    confirmLogout: "Confirm logout",

    // Dashboard
    dashboardTitle: "Your command center",
    dashboardSubtitle: "Everything under control.",
    statActiveTasks: "Active Tasks",
    statAwaiting: "Waiting to be completed",
    statGoals: "Goals",
    statGoalsAchieved: "achieved",
    statIdeas: "Brainstorm Ideas",
    statIdeasAwaiting: "Pending conversion",
    statFocus: "Today's Focus",
    statFocusSub: "Main focus",
    noFocus: "No focus set for today",
    focusToday: "Today's Focus",
    criticalTasks: "Critical tasks",
    activeGoalsLabel: "Active goals",
    done: "Done",
    priorityHigh: "High Priority",
    seeAll: "See All",
    noCriticalTasks: "No critical tasks. Great job!",
    recentIdeas: "Recent Ideas",
    noIdeas: "Brain dump your ideas!",
    goalProgress: "Goal Progress",
    noActiveGoals: "No active goals.",
    quickNav: "Quick Navigation",
    newProject: "New Project",
    newIdea: "New Idea",
    aiAnalysis: "Your AI assistant has analyzed your workspace. You have 3 urgent tasks that could be blocking your goals.",
    aiAction: "Full Analysis",
    resourcesTools: "Resources & Tools",
  },
};

/**
 * Dizionario finale = core (chiavi senza prefisso) + dizionari per area
 * (prefissi "views.", "auth.", "land.", "pg."). Le aree vengono merge
 * per ultime: se una chiave areas coincide con una del core, l'area vince.
 */
export const translations: Translations = {
  it: Object.assign({}, coreTranslations.it, ...areaIt),
  en: Object.assign({}, coreTranslations.en, ...areaEn),
};

export const translate = (lang: LangCode, key: string): string =>
  translations[lang]?.[key] || translations["it"]?.[key] || key;

/**
 * Traduce una chiave sostituendo i placeholder `{name}` con i valori dati.
 * Restituisce la chiave se la traduzione manca, per rendere ovvio in
 * sviluppo quali stringhe non sono ancora state tradotte.
 */
export const translateWith = (
  lang: LangCode,
  key: string,
  vars?: Record<string, string | number>,
): string => {
  let out = translate(lang, key);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.split(`{${name}}`).join(String(value));
    }
  }
  return out;
};