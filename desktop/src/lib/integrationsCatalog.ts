/**
 * Catalogo delle integrazioni di terze parti.
 *
 * Stato attuale: TUTTE le integrazioni sono in fase di sviluppo e risultano
 * marcate come "Prossimamente" (status: "coming_soon"). Nessuna di esse
 * effettua chiamate di rete: la UI e il catalogo sono pronti, il collegamento
 * OAuth/Webhook verra abilitato in un secondo momento.
 */

export type IntegrationCategory =
  | "comunicazione"
  | "calendario"
  | "produttivita"
  | "file"
  | "sviluppo"
  | "design"
  | "automazione"
  | "business";

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  comunicazione: "Comunicazione",
  calendario: "Calendario e riunioni",
  produttivita: "Produttivita",
  file: "File e storage",
  sviluppo: "Sviluppo",
  design: "Design",
  automazione: "Automazione",
  business: "Business e vendite",
};

export const CATEGORY_ORDER: IntegrationCategory[] = [
  "comunicazione",
  "calendario",
  "produttivita",
  "file",
  "sviluppo",
  "design",
  "automazione",
  "business",
];

export type IntegrationStatus = "coming_soon";

export type Integration = {
  slug: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  color: string;
  letter: string;
  features: string[];
  permissions: string[];
  status: IntegrationStatus;
};

/** [nome, categoria, descrizione, colore, lettera, funzionalita, permessi] */
type RawIntegration = [
  string,
  IntegrationCategory,
  string,
  string,
  string,
  string[],
  string[],
];

const RAW: RawIntegration[] = [
  [
    "Slack",
    "comunicazione",
    "Notifiche dei task e aggiornamenti del workspace direttamente in un canale.",
    "#4A154B",
    "S",
    [
      "Invio automatico dei task completati",
      "Avvisi quando un teammate modifica una board",
      "Comandi rapide nei messaggi",
    ],
    ["Canali letti", "Messaggi in scrittura"],
  ],
  [
    "Microsoft Teams",
    "comunicazione",
    "Collega i workspace Taskly alle conversazioni di Microsoft Teams.",
    "#6264A7",
    "T",
    ["Notifiche di avanzamento", "Collegamento a canali", "Riunioni con agenda"],
    ["Chat", "Calendario"],
  ],
  [
    "Discord",
    "comunicazione",
    "Bot per ricevere gli aggiornamenti dei progetti su un server Discord.",
    "#5865F2",
    "D",
    ["Messaggi su canale dedicato", "Ruoli e permessi", "Comandi slash"],
    ["Messaggi"],
  ],
  [
    "Telegram",
    "comunicazione",
    "Riepiloghi giornalieri e promemoria diretti sulla tua chat Telegram.",
    "#229ED9",
    "T",
    ["Promemoria giornalieri", "Riepilogo settimanale", "Ricerca rapida"],
    ["Messaggi in scrittura"],
  ],
  [
    "Google Chat",
    "comunicazione",
    "Collega le notifiche di Taskly a Google Chat e Spaces.",
    "#1A73E8",
    "G",
    ["Notifiche di task", "Riepiloghi", "Menzoni diretti"],
    ["Chat"],
  ],
  [
    "Gmail",
    "comunicazione",
    "Crea e traccia email collegate ai task (invio, allegati, follow-up).",
    "#EA4335",
    "M",
    ["Task via email", "Email -> task", "Promemoria di follow-up"],
    ["Lettura", "Creazione email"],
  ],
  [
    "Google Calendar",
    "calendario",
    "Sincronizza scadenze, riunioni e blocchi di focus con il tuo calendario.",
    "#4285F4",
    "G",
    ["Task con scadenza nel calendario", "Time blocking assistito", "Link alle riunioni"],
    ["Calendario in lettura e scrittura"],
  ],
  [
    "Outlook Calendar",
    "calendario",
    "Scadenze e riunioni di Outlook mostrate dentro Taskly.",
    "#0078D4",
    "O",
    ["Sincronizzazione eventi", "Promemoria Outlook", "Riunioni Teams"],
    ["Calendario"],
  ],
  [
    "Zoom",
    "calendario",
    "Avvia riunioni video e allega automaticamente le trascrizioni ai task.",
    "#2D8CFF",
    "Z",
    ["Avvio riunioni dai task", "Trascrizioni allegate", "Promemoria"],
    ["Profilo e riunioni"],
  ],
  [
    "Google Meet",
    "calendario",
    "Collega le riunioni di Google Meet a board e documenti.",
    "#00897B",
    "M",
    ["Link riunioni nei task", "Trascrizioni", "Note condivise"],
    ["Calendar e Meet"],
  ],
  [
    "Calendly",
    "calendario",
    "Sincronizza i link di prenotazione e le riunioni pianificate.",
    "#006BFF",
    "C",
    ["Prenotazioni", "Link nei task", "Promemoria automatici"],
    ["Eventi"],
  ],
  [
    "Notion",
    "produttivita",
    "Sincronizza pagine e database con i tuoi documenti Taskly.",
    "#000000",
    "N",
    ["Import/Export pagine", "Database bidirezionali", "Template condivisi"],
    ["Pagine in lettura e scrittura"],
  ],
  [
    "Trello",
    "produttivita",
    "Specchi le liste Trello dentro le board del workspace.",
    "#0079BF",
    "T",
    ["Sincronizzazione board", "Card -> task", "Etichette condivise"],
    ["Board"],
  ],
  [
    "Asana",
    "produttivita",
    "Collega i progetti Asana ai workspace Taskly.",
    "#F06A6A",
    "A",
    ["Progetti e task", "Timeline", "Commenti"],
    ["Progetti"],
  ],
  [
    "Linear",
    "produttivita",
    "Sincronizza issue e cicli di sviluppo con le board.",
    "#5E6AD2",
    "L",
    ["Issue bidirezionali", "Cicli e roadmap", "Priorita"],
    ["Issues"],
  ],
  [
    "ClickUp",
    "produttivita",
    "Porta le liste ClickUp dentro il workspace e tieni lo stato allineato.",
    "#7B68EE",
    "C",
    ["Liste e task", "Stati personalizzati", "Priorita"],
    ["Workspace"],
  ],
  [
    "Monday.com",
    "produttivita",
    "Sincronizza board e automazioni con Monday.",
    "#FF3D57",
    "M",
    ["Board", "Colonne personalizzate", "Automazioni"],
    ["Boards"],
  ],
  [
    "Todoist",
    "produttivita",
    "Importa e esporta liste di attivita senza perdere le scadenze.",
    "#E44332",
    "T",
    ["Liste", "Scadenze", "Priorita"],
    ["Task"],
  ],
  [
    "Airtable",
    "produttivita",
    "Usa le basi Airtable come font dati per tabelle e dashboard.",
    "#18BFFF",
    "A",
    ["Basi come tabelle", "Campi personalizzati", "Sincronizzazione"],
    ["Basi in lettura"],
  ],
  [
    "Evernote",
    "produttivita",
    "Importa note e allegati nello spazio di lavoro condiviso.",
    "#00A82D",
    "E",
    ["Import note", "Allegati", "Tag condivisi"],
    ["Note"],
  ],
  [
    "Obsidian",
    "produttivita",
    "Sincronizza i vault locali con i documenti del workspace.",
    "#7C3AED",
    "O",
    ["Vault locali", "Link fra note", "Grafico delle connessioni"],
    ["File locali"],
  ],
  [
    "Google Drive",
    "file",
    "Allega documenti e cartelle del drive ai task e alle board.",
    "#4285F4",
    "D",
    ["Allegati nei task", "Cartelle come progetti", "Ricerca nei file"],
    ["File selezionati"],
  ],
  [
    "Dropbox",
    "file",
    "Sincronizza i file del workspace con il tuo Dropbox.",
    "#0061FF",
    "B",
    ["File allegati", "Sincronizzazione", "Condivisione link"],
    ["File"],
  ],
  [
    "OneDrive",
    "file",
    "Accedi ai documenti aziendali direttamente dai documenti Taskly.",
    "#0078D4",
    "O",
    ["Documenti Microsoft 365", "Allegati", "Co-autori"],
    ["File"],
  ],
  [
    "Box",
    "file",
    "Collega i contenuti aziendali Box ai progetti del team.",
    "#0061D5",
    "B",
    ["Cartelle come progetti", "Permessi", "Versioning"],
    ["File"],
  ],
  [
    "GitHub",
    "sviluppo",
    "Collega issue, pull request e repository ai task del workspace.",
    "#181717",
    "G",
    ["Issue -> task", "Pull request", "Commit collegati"],
    ["Repository"],
  ],
  [
    "GitLab",
    "sviluppo",
    "Sincronizza merge request e pipeline con le board.",
    "#FC6D26",
    "G",
    ["Merge request", "Pipeline", "Milestone"],
    ["Progetti"],
  ],
  [
    "Bitbucket",
    "sviluppo",
    "Collega repository Bitbucket al flusso di lavoro del team.",
    "#0052CC",
    "B",
    ["Pull request", "Repository", "Build status"],
    ["Repository"],
  ],
  [
    "Jira",
    "sviluppo",
    "Affianca i ticket Jira alle board e alle sprint.",
    "#2684FF",
    "J",
    ["Ticket bidirezionali", "Sprint", "Epic e story points"],
    ["Progetti"],
  ],
  [
    "Sentry",
    "sviluppo",
    "Collega gli errori in produzione ai task di bug.",
    "#362D59",
    "S",
    ["Errori -> task", "Issue collegate", "Priorita automatica"],
    ["Progetti"],
  ],
  [
    "Postman",
    "sviluppo",
    "Gestisci le API del workspace e le collection condivise.",
    "#FF6C37",
    "P",
    ["Collection", "Test automatici", "Monitoraggio"],
    ["Workspace"],
  ],
  [
    "Vercel",
    "sviluppo",
    "Collega i deploy ai progetti e alle checklist di rilascio.",
    "#000000",
    "V",
    ["Deploy -> checklist", "Preview URL", "Ambienti"],
    ["Progetti"],
  ],
  [
    "Figma",
    "design",
    "Incorpora prototipi e design dentro i documenti del team.",
    "#F24E1E",
    "F",
    ["Embed prototipi", "File di design", "Commenti"],
    ["File"],
  ],
  [
    "Miro",
    "design",
    "Affianca board Miro a quelle del workspace.",
    "#FFD02F",
    "M",
    ["Board", "Bacanze", "Workshop"],
    ["Board"],
  ],
  [
    "Canva",
    "design",
    "Crea grafica e presentazioni direttamente dai documenti.",
    "#00C4CC",
    "C",
    ["Modelli", "Presentazioni", "Esportazioni"],
    ["Design"],
  ],
  [
    "Loom",
    "design",
    "Allega registrazioni video e walkthrough ai task.",
    "#625DF5",
    "L",
    ["Video nei task", "Walkthrough", "Trascrizioni"],
    ["Video"],
  ],
  [
    "Zapier",
    "automazione",
    "Collega Taskly a migliaia di app con flussi automatici.",
    "#FF4F00",
    "Z",
    ["Trigger automatici", "Flussi tra piu app", "Template pronti"],
    ["Account Zapier"],
  ],
  [
    "Make",
    "automazione",
    "Costruisci scenari di automazione visuali per il tuo team.",
    "#6D00CC",
    "M",
    ["Scenario visuali", "Webhook in ingresso", "Moduli AI"],
    ["Account Make"],
  ],
  [
    "IFTTT",
    "automazione",
    "Crea automazioni semplici tra Taskly e i tuoi servizi.",
    "#1DA1F2",
    "I",
    ["Applet", "Eventi personali", "Sincronizzazione dati"],
    ["Account IFTTT"],
  ],
  [
    "n8n",
    "automazione",
    "Self-hosted: automazioni e workflow nel tuo ambiente.",
    "#EA4B71",
    "n",
    ["Workflow self-hosted", "Nodi personalizzati", "Esecuzioni pianificate"],
    ["Istanza n8n"],
  ],
  [
    "Webhook API",
    "automazione",
    "Ricevi e invia eventi Taskly verso i tuoi sistemi.",
    "#7C3AED",
    "W",
    ["Eventi in uscita", "Chiamate in ingresso", "Firma HMAC"],
    ["Chiavi API"],
  ],
  [
    "MCP Server",
    "automazione",
    "Collega Taskly agli assistenti AI (Claude, Cursor, VS Code).",
    "#10A37F",
    "M",
    ["Strumenti per AI", "Task e pagine via MCP", "Installazione guidata"],
    ["Token locale"],
  ],
  [
    "Stripe",
    "business",
    "Collega abbonamenti, pagamenti e fatturazione ai task.",
    "#635BFF",
    "S",
    ["Eventi di pagamento", "Abbonamenti", "Fatture"],
    ["Account Stripe"],
  ],
  [
    "HubSpot",
    "business",
    "Sincronizza contatti, deal e attivita commerciali.",
    "#FF7A59",
    "H",
    ["Contatti e deal", "Attivita", "Pipeline"],
    ["Account HubSpot"],
  ],
  [
    "Salesforce",
    "business",
    "Collega opportunita e account ai progetti del team.",
    "#00A1E0",
    "S",
    ["Opportunita", "Account", "Report"],
    ["Account Salesforce"],
  ],
  [
    "Zendesk",
    "business",
    "Trasforma i ticket di assistenza in task e attivita.",
    "#03363D",
    "Z",
    ["Ticket -> task", "SLA", "Macro"],
    ["Support"],
  ],
  [
    "Intercom",
    "business",
    "Collega conversazioni con i clienti e attivita di follow-up.",
    "#1F8DED",
    "I",
    ["Conversazioni", "Follow-up", "Segmenti"],
    ["Account Intercom"],
  ],
  [
    "Mailchimp",
    "business",
    "Sincronizza campagne e contatti con le liste del team.",
    "#FFE01B",
    "M",
    ["Campagne", "Contatti", "Segmentazione"],
    ["Account Mailchimp"],
  ],
  [
    "QuickBooks",
    "business",
    "Collega fatture, spese e clienti alla pianificazione.",
    "#2CA01C",
    "Q",
    ["Fatture", "Spese", "Clienti"],
    ["Contabilita"],
  ],
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const INTEGRATIONS: Integration[] = RAW.map(
  ([name, category, description, color, letter, features, permissions]) => ({
    slug: slugify(name),
    name,
    category,
    description,
    color,
    letter,
    features,
    permissions,
    status: "coming_soon",
  }),
);

export function findIntegration(slug: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.slug === slug);
}
