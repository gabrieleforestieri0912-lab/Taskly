/**
 * Taskly Landing — Centralized copy
 * D1: Italiano (struttura pronta per EN)
 * Tutti i testi della landing vivono qui per i18n futura.
 */

export const landingContent = {
  meta: {
    title: "Taskly — Organizza il tuo lavoro, senza stress",
    description:
      "Un unico workspace intelligente per task, note, calendario e obiettivi. Pianifica con chiarezza, collabora in tempo reale e lascia che l'AI semplifichi ogni giornata.",
  },
  nav: {
    logo: "Taskly",
    links: [
      { label: "Funzionalità", href: "#funzionalita" },
      { label: "Casi d'uso", href: "#casi-uso" },
      { label: "Prezzi", href: "#prezzi" },
      { label: "FAQ", href: "#faq" },
    ],
    ctaLogin: "Accedi",
    ctaPrimary: "Inizia gratis",
  },
  hero: {
    headline: "Organizza il tuo lavoro, senza stress",
    headlineAccent: "senza stress",
    subheadline:
      "Un unico workspace intelligente per task, note, calendario e obiettivi. Pianifica con chiarezza, collabora in tempo reale e lascia che l'AI semplifichi ogni giornata.",
    ctaPrimary: "Inizia gratis",
    ctaPrimaryHref: "/signup",
    ctaSecondary: "Guarda come funziona",
    ctaSecondaryHref: "#demo",
    reassurance: "Nessuna carta di credito richiesta",
    mockup: {
      workspace: "Workspace Demo",
      columns: ["Da fare", "In corso", "Fatto"],
      cards: [
        { title: "Brief cliente Q4", assignee: "MR", tag: "Priorità alta", due: "Oggi" },
        { title: "Wireframe homepage", assignee: "AL", tag: "Design", due: "Domani" },
        { title: "Review sprint", assignee: "GT", tag: "Team", due: "Ven" },
      ],
    },
  },
  views: {
    eyebrow: "Viste multiple",
    title: "Una app, tante viste",
    description: "Passa da lista a board, calendario e timeline senza perdere contesto.",
    tabs: [
      { id: "lista", label: "Lista" },
      { id: "board", label: "Board" },
      { id: "calendario", label: "Calendario" },
      { id: "timeline", label: "Timeline" },
    ],
  },
  bento: {
    title: "Tutto ciò che ti serve per fare progressi",
    items: [
      { icon: "CheckSquare", title: "Task e sotto-task", desc: "Scomponi il lavoro in passi chiari." },
      { icon: "Target", title: "Progetti e obiettivi", desc: "Collega任务 a obiettivi misurabili." },
      { icon: "MessageCircle", title: "Collaborazione", desc: "Commenti, menzioni e attività in tempo reale." },
      { icon: "Bell", title: "Promemoria e scadenze", desc: "Non perdere mai una consegna." },
      { icon: "Zap", title: "Automazioni semplici", desc: "Regole leggere per risparmiare tempo." },
      { icon: "Search", title: "Ricerca globale", desc: "Trova qualsiasi cosa in un istante." },
    ],
  },
  socialProof: {
    title: "TODO: sostituire con dato reale",
    description: "Sezione predisposta — nessun dato finto. Sostituire con loghi/testimonianze reali quando disponibili.",
  },
  useCases: {
    eyebrow: "Casi d'uso",
    title: "Pensato per come lavori davvero",
    cases: [
      { persona: "Freelance", desc: "Gestisci clienti e consegne senza fogli sparsi.", flow: "Brief → Task → Consegna" },
      { persona: "Team piccoli", desc: "Allinea il team con viste condivise.", flow: "Pianifica → Assegna → Revisiona" },
      { persona: "Studenti", desc: "Organizza corsi, esami e progetti.", flow: "Appunti → Scadenze → Revisione" },
      { persona: "Startup", desc: "Dall'idea al lancio, in un unico posto.", flow: "Roadmap → Sprint → Release" },
    ],
  },
  howItWorks: {
    title: "Come funziona",
    steps: [
      { n: "01", title: "Crea", desc: "Cattura task, note e idee in secondi." },
      { n: "02", title: "Organizza", desc: "Scegli la vista giusta e dai priorità." },
      { n: "03", title: "Collabora", desc: "Condividi, commenta e avanza insieme." },
    ],
  },
  integrations: {
    title: "Si integra con i tuoi strumenti",
    description: "Connessioni leggere con i servizi che già usi. Loghi testuali, nessun asset di terze parti.",
    items: ["Google Drive", "Slack", "Notion", "Calendar", "GitHub", "Figma"],
  },
  pricing: {
    eyebrow: "Prezzi",
    title: "Scegli il piano giusto per te",
    toggleMonthly: "Mensile",
    toggleYearly: "Annuale",
    plans: [
      {
        name: "Free",
        price: "TODO: €0",
        period: "/mese",
        features: ["Task illimitati (personali)", "3 progetti", "Vista lista e board", "Supporto community"],
        cta: "Inizia gratis",
        highlighted: false,
      },
      {
        name: "Pro",
        price: "TODO: €9",
        period: "/mese",
        features: ["Tutto Free +", "Progetti illimitati", "Calendario e Timeline", "Automazioni e ricerca AI", "Supporto prioritario"],
        cta: "Prova Pro",
        highlighted: true,
      },
      {
        name: "Team",
        price: "TODO: €19",
        period: "/utente/mese",
        features: ["Tutto Pro +", "Permessi avanzati", "SSO e audit", "Onboarding dedicato"],
        cta: "Contatta vendite",
        highlighted: false,
      },
    ],
    footnote: "Prezzi placeholder — TODO: sostituire con listino reale.",
  },
  faq: {
    title: "Domande frequenti",
    items: [
      { q: "Posso usare Taskly gratis?", a: "Sì, il piano Free resta gratuito e include l'essenziale per iniziare." },
      { q: "I miei dati sono al sicuro?", a: "Usiamo provider infrastrutturali affidabili (Supabase, Vercel) e best practice di sicurezza. Nessun dato venduto a terze parti." },
      { q: "Posso invitare il mio team?", a: "Sì, invita collaboratori e gestisci permessi per workspace." },
      { q: "Posso esportare i miei dati?", a: "Esportazione disponibile nei piani a pagamento; roadmap per esportazione self-serve." },
      { q: "C'è un'app mobile?", a: "Web app ottimizzata per mobile; app nativa in roadmap." },
      { q: "Che supporto offrite?", a: "Community per Free, prioritario per Pro/Team." },
    ],
  },
  ctaFinal: {
    title: "Pronto a dare ordine al tuo lavoro?",
    description: "Inizia oggi e porta chiarezza nel tuo workflow.",
    cta: "Inizia gratis",
    reassurance: "Nessuna carta richiesta — disdici quando vuoi",
  },
  footer: {
    product: ["Funzionalità", "Prezzi", "Changelog", "Roadmap"],
    resources: ["Documentazione", "Guida", "Template", "Supporto"],
    company: ["Chi siamo", "Carriere", "Blog", "Contatti"],
    legal: ["Privacy", "Termini", "Cookie"],
    copyright: "© 2026 Taskly. Tutti i diritti riservati.",
  },
} as const;

export type LandingContent = typeof landingContent;
