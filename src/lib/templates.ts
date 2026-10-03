export interface PageTemplate {
  id: string;
  title: string;
  category: "Pianificazione" | "Lavoro" | "Personale" | "Studio" | "Progetti";
  description: string;
  icon: string;
  iconColor: string;
  type: "notes" | "tasks";
  isCustom?: boolean;
  data: any;
}

export const BUILTIN_TEMPLATES: PageTemplate[] = [
  {
    id: "weekly-planner",
    title: "Pianificazione settimanale",
    category: "Pianificazione",
    description: "Organizza la tua settimana lavorativa, stabilisci le priorità chiave e traccia i progressi giorno per giorno.",
    icon: "calendar",
    iconColor: "text-blue-500",
    type: "notes",
    data: {
      blocks: [
        { id: "b1", type: "h1", content: "Pianificazione Settimanale" },
        { id: "b2", type: "text", content: "Definisci le priorità strategiche della settimana e monitora i task giornalieri." },
        { id: "b3", type: "h2", content: "🎯 Obiettivi Chiave della Settimana" },
        { id: "b4", type: "checkbox", content: "Priorità 1: Completare la release dell'app", checked: false },
        { id: "b5", type: "checkbox", content: "Priorità 2: Allineamento con il team di design", checked: false },
        { id: "b6", type: "checkbox", content: "Priorità 3: Revisione budget e metriche mensili", checked: false },
        { id: "b7", type: "divider", content: "" },
        { id: "b8", type: "h2", content: "📅 Giorni della Settimana" },
        { id: "b9", type: "h3", content: "Lunedì" },
        { id: "b10", type: "checkbox", content: "Pianificazione sprint e revisione backlog", checked: true },
        { id: "b11", type: "checkbox", content: "Incontro di sincronizzazione team", checked: false },
        { id: "b12", type: "h3", content: "Martedì" },
        { id: "b13", type: "checkbox", content: "Deep work su sviluppo feature", checked: false },
        { id: "b14", type: "h3", content: "Mercoledì" },
        { id: "b15", type: "checkbox", content: "Test di qualità e revisione PR", checked: false },
        { id: "b16", type: "h3", content: "Giovedì" },
        { id: "b17", type: "checkbox", content: "Allineamento clienti / stakeholder", checked: false },
        { id: "b18", type: "h3", content: "Venerdì" },
        { id: "b19", type: "checkbox", content: "Retrospettiva e pulizia inbox", checked: false },
      ],
    },
  },
  {
    id: "meeting-notes",
    title: "Note riunione",
    category: "Lavoro",
    description: "Modello strutturato per preparare l'agenda, registrare presenze, decisioni prese e action items da assegnare.",
    icon: "file-text",
    iconColor: "text-purple-500",
    type: "notes",
    data: {
      blocks: [
        { id: "m1", type: "h1", content: "Note Riunione — [Oggetto Riunione]" },
        { id: "m2", type: "text", content: "Data: " + new Date().toLocaleDateString("it-IT") + " | Durata: 45 min" },
        { id: "m3", type: "h2", content: "👥 Partecipanti" },
        { id: "m4", type: "bullet", content: "Organizzatore: Me" },
        { id: "m5", type: "bullet", content: "Team: Design, Engineering, Product" },
        { id: "m6", type: "h2", content: "📋 Ordine del Giorno" },
        { id: "m7", type: "numbered", content: "Stato di avanzamento sprint attuale" },
        { id: "m8", type: "numbered", content: "Discussione blocchi e criticità tecniche" },
        { id: "m9", type: "numbered", content: "Pianificazione prossimi passi" },
        { id: "m10", type: "divider", content: "" },
        { id: "m11", type: "h2", content: "💡 Decisioni Prese" },
        { id: "m12", type: "bullet", content: "Approvata la nuova palette colori per la dark mode" },
        { id: "m13", type: "bullet", content: "Rinviata la migrazione server alla prossima settimana" },
        { id: "m14", type: "h2", content: "✅ Azioni Assegnate (Action Items)" },
        { id: "m15", type: "checkbox", content: "Inviare riassunto via email a tutti i partecipanti", checked: false },
        { id: "m16", type: "checkbox", content: "Creare ticket su backlog per il bug della ricerca", checked: false },
      ],
    },
  },
  {
    id: "habit-tracker",
    title: "Tracker abitudini",
    category: "Personale",
    description: "Costruisci routine sane tracciando quotidianamente le tue abitudini positive: salute, studio e benessere.",
    icon: "target",
    iconColor: "text-emerald-500",
    type: "notes",
    data: {
      blocks: [
        { id: "h1", type: "h1", content: "Tracker Abitudini Mensile" },
        { id: "h2", type: "text", content: "«La costanza batte il talento quando il talento non è costante.»" },
        { id: "h3", type: "h2", content: "🌱 Abitudini del Mattino" },
        { id: "h4", type: "checkbox", content: "Bere 500ml di acqua appena svegli", checked: true },
        { id: "h5", type: "checkbox", content: "15 minuti di meditazione o respirazione", checked: true },
        { id: "h6", type: "checkbox", content: "Colazione sana senza schermi", checked: false },
        { id: "h7", type: "h2", content: "⚡ Produttività & Focus" },
        { id: "h8", type: "checkbox", content: "Almeno 90 minuti di deep work senza notifiche", checked: false },
        { id: "h9", type: "checkbox", content: "Pianificazione del giorno successivo prima di chiudere", checked: false },
        { id: "h10", type: "h2", content: "🌙 Routine della Sera" },
        { id: "h11", type: "checkbox", content: "Leggere 20 pagine di un libro", checked: false },
        { id: "h12", type: "checkbox", content: "Nessuno schermo 30 minuti prima di dormire", checked: false },
      ],
    },
  },
  {
    id: "project-roadmap",
    title: "Roadmap progetto",
    category: "Progetti",
    description: "Definisci la visione di alto livello, le fasi di rilascio e le milestone fondamentali del tuo progetto.",
    icon: "rocket",
    iconColor: "text-orange-500",
    type: "tasks",
    data: [
      {
        id: "pr-1",
        title: "Fase 1: Ricerca e Definizione Requisiti",
        status: "done",
        priority: "high",
        deadline: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0],
        subtasks: [
          { id: "prs-1", title: "Interviste utenti e competitor analysis", done: true },
          { id: "prs-2", title: "Stesura documento requisiti (PRD)", done: true },
        ],
      },
      {
        id: "pr-2",
        title: "Fase 2: Prototipazione UI/UX su Figma",
        status: "in_progress",
        priority: "high",
        deadline: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        subtasks: [
          { id: "prs-3", title: "Wireframe a bassa fedeltà", done: true },
          { id: "prs-4", title: "Component library e design system", done: false },
        ],
      },
      {
        id: "pr-3",
        title: "Fase 3: Sviluppo Frontend & Backend",
        status: "todo",
        priority: "urgent",
        deadline: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
        subtasks: [
          { id: "prs-5", title: "Setup ambiente e architettura dati", done: false },
          { id: "prs-6", title: "Implementazione API e viste principali", done: false },
        ],
      },
      {
        id: "pr-4",
        title: "Fase 4: Testing, QA e Lancio Pubblico",
        status: "todo",
        priority: "medium",
        deadline: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
        subtasks: [],
      },
    ],
  },
  {
    id: "reading-list",
    title: "Lista di lettura",
    category: "Studio",
    description: "Cataloga i libri da leggere, gli articoli salvati, le note chiave e le citazioni preferite.",
    icon: "book-open",
    iconColor: "text-amber-500",
    type: "notes",
    data: {
      blocks: [
        { id: "r1", type: "h1", content: "📚 La Mia Lista di Lettura" },
        { id: "r2", type: "text", content: "Traccia i libri in corso di lettura, quelli completati e le recensioni personali." },
        { id: "r3", type: "h2", content: "📖 In Corso di Lettura" },
        { id: "r4", type: "bullet", content: "«Atomic Habits» — James Clear (Capitolo 4)" },
        { id: "r5", type: "bullet", content: "«Deep Work» — Cal Newport (Iniziato questa settimana)" },
        { id: "r6", type: "h2", content: "⏳ Da Leggere (Backlog)" },
        { id: "r7", type: "bullet", content: "«Designing Data-Intensive Applications» — Martin Kleppmann" },
        { id: "r8", type: "bullet", content: "«The Pragmatic Programmer» — Andrew Hunt & David Thomas" },
        { id: "r9", type: "bullet", content: "«Thinking, Fast and Slow» — Daniel Kahneman" },
        { id: "r10", type: "h2", content: "🏆 Libri Completati & Voto" },
        { id: "r11", type: "bullet", content: "«Sapiens: Da animali a dèi» — Yuval Noah Harari ⭐⭐⭐⭐⭐" },
        { id: "r12", type: "bullet", content: "«Clean Code» — Robert C. Martin ⭐⭐⭐⭐☆" },
      ],
    },
  },
  {
    id: "daily-journal",
    title: "Diario / Journal",
    category: "Personale",
    description: "Uno spazio per la riflessione personale, tre gratitudini quotidiane e gli apprendimenti del giorno.",
    icon: "sparkles",
    iconColor: "text-rose-500",
    type: "notes",
    data: {
      blocks: [
        { id: "j1", type: "h1", content: "Diario Quotidiano — " + new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }) },
        { id: "j2", type: "h2", content: "☀️ Gratitudine del Mattino" },
        { id: "j3", type: "bullet", content: "1. Una nuova giornata piena di opportunità di apprendimento" },
        { id: "j4", type: "bullet", content: "2. Una tazza di caffè caldo e tempo per concentrarmi" },
        { id: "j5", type: "bullet", content: "3. La salute e le persone care al mio fianco" },
        { id: "j6", type: "h2", content: "🎯 Qual è la singola cosa che renderà oggi un successo?" },
        { id: "j7", type: "text", content: "[Scrivi qui l'obiettivo primario di oggi...]" },
        { id: "j8", type: "divider", content: "" },
        { id: "j9", type: "h2", content: "🌙 Riflessione della Sera" },
        { id: "j10", type: "text", content: "Cosa è andato bene oggi? Quali ostacoli ho incontrato e cosa ho imparato?" },
      ],
    },
  },
];

const CUSTOM_TEMPLATES_KEY = "taskly_custom_templates_v1";

export function loadAllTemplates(): PageTemplate[] {
  if (typeof window === "undefined") return BUILTIN_TEMPLATES;
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (raw) {
      const customs = JSON.parse(raw);
      if (Array.isArray(customs)) {
        return [...BUILTIN_TEMPLATES, ...customs];
      }
    }
  } catch {}
  return BUILTIN_TEMPLATES;
}

export function saveCustomTemplate(template: Omit<PageTemplate, "id" | "isCustom">): PageTemplate {
  const newTmpl: PageTemplate = {
    ...template,
    id: `custom_tmpl_${Date.now()}`,
    isCustom: true,
  };
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    const existing: PageTemplate[] = raw ? JSON.parse(raw) : [];
    const updated = [newTmpl, ...existing];
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
  } catch {}
  return newTmpl;
}
