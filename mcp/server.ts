// ============================================================================
// Taskly MCP server (stdio transport)
//
// Exposes the Taskly data layer (tasks, docs, workspaces, goals, ideas, pages,
// notifications, activity, meetings, integrations) as MCP tools so an AI client
// (Claude Desktop, Cursor, VS Code, the MCP Inspector, …) can read and mutate
// a Taskly account.
//
// Run:  npm run mcp
// Transport is stdio — the client launches this process and talks JSON-RPC.
// ============================================================================
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z, type ZodRawShape } from "zod";

import {
  getContext,
  initContext,
  setWorkspace,
  newId,
} from "./context";

import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  listWorkspacesForUser,
  createWorkspace,
  getWorkspaceForUser,
  searchDocs,
  getDoc,
  getDocById,
  saveDoc,
  listDocVersions,
  listPages,
  createPageRow,
  updatePageRow,
  deletePageRow,
  listGoals,
  createGoalRow,
  updateGoalRow,
  deleteGoalRow,
  listIdeas,
  createIdeaRow,
  updateIdeaRow,
  deleteIdeaRow,
  listTemplates,
  createTemplate,
  getTemplate,
  deleteTemplate,
  listNotifications,
  createNotification,
  markNotificationRead,
  listActivity,
  createActivity,
  markActivityRead,
  createMeeting,
  listMeetings,
  deleteMeeting,
  listIntegrations,
  setIntegration,
  deleteIntegration,
} from "../src/lib/server/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type McpContent = { content: { type: "text"; text: string }[]; isError?: boolean };

function ok(data: unknown): McpContent {
  const text =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text", text }] };
}

function fail(err: unknown): McpContent {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: "text", text: `Errore Taskly: ${message}` }],
    isError: true,
  };
}

/**
 * Registers a tool whose handler returns plain data; wraps it so thrown errors
 * are surfaced as `isError` tool results instead of crashing the protocol.
 */
function tool(
  server: McpServer,
  name: string,
  description: string,
  schema: ZodRawShape,
  handler: (args: any) => Promise<unknown>,
): void {
  server.tool(name, description, schema, async (args) => {
    try {
      return ok(await handler(args));
    } catch (err) {
      return fail(err);
    }
  });
}

const server = new McpServer({
  name: "taskly",
  version: "1.0.0",
});

// ===========================================================================
// Identity / workspaces
// ===========================================================================
tool(server, "taskly_whoami", "Restituisce l'utente e il workspace attivi del server MCP.", {}, async () => {
  const ctx = getContext();
  return {
    userId: ctx.userId,
    email: ctx.email,
    activeWorkspaceId: ctx.workspaceId,
    activeWorkspaceName: ctx.workspaceName,
  };
});

tool(server, "taskly_list_workspaces", "Elenca i workspace dell'utente connesso.", {}, async () => {
  const ctx = getContext();
  return await listWorkspacesForUser(ctx.userId);
});

tool(
  server,
  "taskly_set_workspace",
  "Imposta il workspace attivo (per slug, nome o id) su cui operano gli altri tool.",
  { workspace: z.string().describe("slug, nome o id del workspace") },
  async ({ workspace }) => {
    const ctx = getContext();
    const ws = await getWorkspaceForUser(ctx.userId, workspace);
    if (!ws) {
      const all = await listWorkspacesForUser(ctx.userId);
      const match = all.find(
        (w) =>
          !!w &&
          (w.slug === workspace ||
            w.name.toLowerCase() === workspace.toLowerCase()),
      );
      if (!match) throw new Error("Workspace non trovato o non sei membro");
      setWorkspace(match._id, match.name);
      return { activeWorkspaceId: match._id, activeWorkspaceName: match.name };
    }
    setWorkspace(ws._id, ws.name);
    return { activeWorkspaceId: ws._id, activeWorkspaceName: ws.name };
  },
);

tool(
  server,
  "taskly_create_workspace",
  "Crea un nuovo workspace e ti aggiunge come owner.",
  {
    name: z.string().describe("Nome del workspace"),
    slug: z.string().describe("Slug univoco (es. 'team-marketing')"),
  },
  async ({ name, slug }) => {
    const ctx = getContext();
    const ws = await createWorkspace(ctx.userId, { name, slug });
    if (!ws) throw new Error("Creazione workspace fallita");
    setWorkspace(ws._id, ws.name);
    return ws;
  },
);

// ===========================================================================
// Tasks
// ===========================================================================
tool(
  server,
  "taskly_list_tasks",
  "Elenca i task dell'utente. Filtra per stato (todo|in_progress|done) e/o workspace.",
  {
    status: z
      .enum(["todo", "in_progress", "done"])
      .optional()
      .describe("Filtra per stato"),
    workspaceId: z.string().optional().describe("Workspace (default: attivo)"),
    limit: z.number().int().min(1).max(500).optional().describe("Max risultati"),
  },
  async ({ status, workspaceId, limit }) => {
    const ctx = getContext();
    const ws = workspaceId ?? ctx.workspaceId;
    if (!ws) throw new Error("Nessun workspace attivo: usa taskly_set_workspace");
    return await listTasks({
      userId: ctx.userId,
      workspaceId: ws,
      status,
      limit: limit ?? 50,
    });
  },
);

tool(
  server,
  "taskly_get_task",
  "Recupera un singolo task per id.",
  { taskId: z.string().describe("Id del task") },
  async ({ taskId }) => {
    const ctx = getContext();
    const task = await getTask(ctx.userId, taskId);
    if (!task) throw new Error("Task non trovato");
    return task;
  },
);

tool(
  server,
  "taskly_create_task",
  "Crea un nuovo task.",
  {
    title: z.string().describe("Titolo del task"),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    dueDate: z.string().optional().describe("Data ISO (es. 2026-09-01)"),
    assignee: z.string().optional(),
    recurrence: z.string().optional().describe("Regola di ricorrenza"),
    subtasks: z.array(z.any()).optional(),
    dependencies: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    workspaceId: z.string().optional().describe("Workspace (default: attivo)"),
  },
  async (args) => {
    const ctx = getContext();
    const ws = args.workspaceId ?? ctx.workspaceId;
    if (!ws) throw new Error("Nessun workspace attivo: usa taskly_set_workspace");
    return await createTask(ctx.userId, {
      title: args.title,
      description: args.description,
      status: args.status,
      dueDate: args.dueDate,
      assignee: args.assignee,
      recurrence: args.recurrence,
      subtasks: args.subtasks,
      dependencies: args.dependencies,
      customFields: args.customFields,
      workspaceId: ws,
    });
  },
);

tool(
  server,
  "taskly_update_task",
  "Aggiorna un task esistente (solo i campi forniti).",
  {
    taskId: z.string().describe("Id del task"),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    dueDate: z.string().optional(),
    assignee: z.string().optional(),
    recurrence: z.string().optional(),
    subtasks: z.array(z.any()).optional(),
    dependencies: z.array(z.string()).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
  },
  async ({ taskId, ...patch }) => {
    const ctx = getContext();
    const updated = await updateTask(ctx.userId, taskId, patch);
    if (!updated) throw new Error("Task non trovato");
    return updated;
  },
);

tool(
  server,
  "taskly_delete_task",
  "Elimina un task per id.",
  { taskId: z.string().describe("Id del task") },
  async ({ taskId }) => {
    const ctx = getContext();
    await deleteTask(ctx.userId, taskId);
    return { deleted: true, taskId };
  },
);

// ===========================================================================
// Documents
// ===========================================================================
tool(
  server,
  "taskly_search_docs",
  "Cerca documenti per parola chiave nel titolo o nello slug.",
  {
    query: z.string().describe("Testo da cercare"),
    workspaceId: z.string().optional().describe("Workspace (default: attivo)"),
    limit: z.number().int().min(1).max(50).optional(),
  },
  async ({ query, workspaceId, limit }) => {
    const ctx = getContext();
    const ws = workspaceId ?? ctx.workspaceId;
    if (!ws) throw new Error("Nessun workspace attivo: usa taskly_set_workspace");
    return await searchDocs({ userId: ctx.userId, workspaceId: ws, q: query, limit: limit ?? 10 });
  },
);

tool(
  server,
  "taskly_get_doc",
  "Recupera un documento per slug o per id.",
  {
    slug: z.string().optional().describe("Slug del documento"),
    docId: z.string().optional().describe("Id del documento"),
    workspaceId: z.string().optional().describe("Workspace (default: attivo)"),
  },
  async ({ slug, docId, workspaceId }) => {
    const ctx = getContext();
    const ws = workspaceId ?? ctx.workspaceId;
    if (!ws) throw new Error("Nessun workspace attivo: usa taskly_set_workspace");
    let doc: any = null;
    if (docId) doc = await getDocById(ctx.userId, docId);
    else if (slug) doc = await getDoc({ userId: ctx.userId, workspaceId: ws, slug });
    if (!doc) throw new Error("Documento non trovato");
    return doc;
  },
);

tool(
  server,
  "taskly_save_doc",
  "Crea o aggiorna un documento (blocchi TipTap/ProseMirror).",
  {
    slug: z.string().describe("Slug univoco del documento"),
    title: z.string().optional(),
    blocks: z.array(z.any()).optional().describe("Array di blocchi del documento"),
    workspaceId: z.string().optional().describe("Workspace (default: attivo)"),
  },
  async ({ slug, title, blocks, workspaceId }) => {
    const ctx = getContext();
    const ws = workspaceId ?? ctx.workspaceId;
    if (!ws) throw new Error("Nessun workspace attivo: usa taskly_set_workspace");
    const res = await saveDoc({
      userId: ctx.userId,
      workspaceId: ws,
      slug,
      title,
      blocks,
      author: "mcp",
    });
    return { ...res, slug, title };
  },
);

tool(
  server,
  "taskly_list_doc_versions",
  "Elenca le versioni salvate di un documento.",
  { docId: z.string().describe("Id del documento") },
  async ({ docId }) => {
    const ctx = getContext();
    const versions = await listDocVersions(ctx.userId, docId);
    if (!versions) throw new Error("Documento non trovato");
    return versions;
  },
);

// ===========================================================================
// Pages (dashboard)
// ===========================================================================
tool(server, "taskly_list_pages", "Elenca le pagine della dashboard dell'utente.", {}, async () => {
  const ctx = getContext();
  return await listPages(ctx.userId);
});

tool(
  server,
  "taskly_create_page",
  "Crea una nuova pagina della dashboard.",
  {
    type: z.string().describe("Tipo di pagina (es. 'dashboard')"),
    label: z.string().describe("Etichetta"),
    icon: z.string().optional(),
    iconColor: z.string().optional(),
    parentId: z.string().optional(),
    purpose: z.string().optional(),
    data: z.any().optional(),
  },
  async (args) => {
    const ctx = getContext();
    return await createPageRow(ctx.userId, {
      id: newId(),
      type: args.type,
      label: args.label,
      icon: args.icon,
      iconColor: args.iconColor,
      parentId: args.parentId,
      purpose: args.purpose,
      data: args.data,
    });
  },
);

tool(
  server,
  "taskly_update_page",
  "Aggiorna una pagina esistente.",
  {
    id: z.string().describe("Id della pagina"),
    label: z.string().optional(),
    icon: z.string().optional(),
    iconColor: z.string().optional(),
    parentId: z.string().optional(),
    purpose: z.string().optional(),
    data: z.any().optional(),
  },
  async ({ id, ...patch }) => {
    const ctx = getContext();
    const updated = await updatePageRow(ctx.userId, id, patch);
    if (!updated) throw new Error("Pagina non trovata");
    return updated;
  },
);

tool(
  server,
  "taskly_delete_page",
  "Elimina una pagina per id.",
  { id: z.string().describe("Id della pagina") },
  async ({ id }) => {
    const ctx = getContext();
    await deletePageRow(ctx.userId, id);
    return { deleted: true, id };
  },
);

// ===========================================================================
// Goals
// ===========================================================================
tool(server, "taskly_list_goals", "Elenca gli obiettivi dell'utente.", {}, async () => {
  const ctx = getContext();
  return await listGoals(ctx.userId);
});

tool(
  server,
  "taskly_create_goal",
  "Crea un obiettivo.",
  {
    title: z.string(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    subGoals: z.array(z.any()).optional(),
  },
  async (args) => {
    const ctx = getContext();
    return await createGoalRow(ctx.userId, args);
  },
);

tool(
  server,
  "taskly_update_goal",
  "Aggiorna un obiettivo.",
  {
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    subGoals: z.array(z.any()).optional(),
  },
  async ({ id, ...patch }) => {
    const ctx = getContext();
    const updated = await updateGoalRow(ctx.userId, id, patch);
    if (!updated) throw new Error("Obiettivo non trovato");
    return updated;
  },
);

tool(server, "taskly_delete_goal", "Elimina un obiettivo per id.", { id: z.string() }, async ({ id }) => {
  const ctx = getContext();
  await deleteGoalRow(ctx.userId, id);
  return { deleted: true, id };
});

// ===========================================================================
// Ideas
// ===========================================================================
tool(server, "taskly_list_ideas", "Elenca le idee dell'utente.", {}, async () => {
  const ctx = getContext();
  return await listIdeas(ctx.userId);
});

tool(
  server,
  "taskly_create_idea",
  "Crea un'idea.",
  { title: z.string(), category: z.string().optional() },
  async (args) => {
    const ctx = getContext();
    return await createIdeaRow(ctx.userId, args);
  },
);

tool(
  server,
  "taskly_delete_idea",
  "Elimina un'idea per id.",
  { id: z.string() },
  async ({ id }) => {
    const ctx = getContext();
    await deleteIdeaRow(ctx.userId, id);
    return { deleted: true, id };
  },
);

// ===========================================================================
// Templates
// ===========================================================================
tool(
  server,
  "taskly_list_templates",
  "Elenca i template dell'utente.",
  { workspaceId: z.string().optional().describe("Workspace (default: attivo)") },
  async ({ workspaceId }) => {
    const ctx = getContext();
    return await listTemplates(ctx.userId, workspaceId ?? ctx.workspaceId ?? undefined);
  },
);

tool(
  server,
  "taskly_create_template",
  "Crea un template.",
  {
    name: z.string(),
    type: z.string().optional(),
    payload: z.any().optional(),
    workspaceId: z.string().optional().describe("Workspace (default: attivo)"),
  },
  async (args) => {
    const ctx = getContext();
    return await createTemplate(ctx.userId, {
      name: args.name,
      type: args.type,
      payload: args.payload,
      workspaceId: args.workspaceId ?? ctx.workspaceId ?? undefined,
    });
  },
);

tool(
  server,
  "taskly_delete_template",
  "Elimina un template per id.",
  { templateId: z.string() },
  async ({ templateId }) => {
    const ctx = getContext();
    await deleteTemplate(ctx.userId, templateId);
    return { deleted: true, templateId };
  },
);

// ===========================================================================
// Notifications / Activity
// ===========================================================================
tool(
  server,
  "taskly_list_notifications",
  "Elenca le notifiche dell'utente.",
  { workspaceId: z.string().optional().describe("Filtra per workspace") },
  async ({ workspaceId }) => {
    const ctx = getContext();
    return await listNotifications(ctx.userId, workspaceId ?? null);
  },
);

tool(
  server,
  "taskly_create_notification",
  "Crea una notifica per l'utente.",
  {
    title: z.string(),
    body: z.string().optional(),
    workspaceId: z.string().optional().describe("Workspace (default: attivo)"),
  },
  async (args) => {
    const ctx = getContext();
    return await createNotification(ctx.userId, {
      title: args.title,
      body: args.body,
      workspaceId: args.workspaceId ?? ctx.workspaceId ?? undefined,
    });
  },
);

tool(
  server,
  "taskly_mark_notification_read",
  "Segna una notifica come letta.",
  { notificationId: z.string() },
  async ({ notificationId }) => {
    const ctx = getContext();
    return await markNotificationRead(ctx.userId, notificationId);
  },
);

tool(
  server,
  "taskly_list_activity",
  "Elenca l'attività recente dell'utente.",
  { limit: z.number().int().min(1).max(200).optional() },
  async ({ limit }) => {
    const ctx = getContext();
    return await listActivity(ctx.userId, limit ?? 50);
  },
);

tool(
  server,
  "taskly_create_activity",
  "Registra un evento di attività.",
  {
    type: z.string().optional(),
    title: z.string(),
    body: z.string().optional(),
  },
  async (args) => {
    const ctx = getContext();
    return await createActivity(ctx.userId, args);
  },
);

tool(
  server,
  "taskly_mark_activity_read",
  "Segna uno o più eventi di attività come letti.",
  { ids: z.array(z.string()).describe("Id degli eventi") },
  async ({ ids }) => {
    const ctx = getContext();
    await markActivityRead(ctx.userId, ids);
    return { marked: ids.length };
  },
);

// ===========================================================================
// Meetings
// ===========================================================================
tool(
  server,
  "taskly_list_meetings",
  "Elenca i resoconti delle riunioni dell'utente.",
  {},
  async () => {
    const ctx = getContext();
    return await listMeetings(ctx.userId);
  },
);

tool(
  server,
  "taskly_create_meeting",
  "Crea un resoconto di riunione.",
  {
    title: z.string(),
    transcript: z.string().optional(),
    summary: z.string().optional(),
    category: z.string().optional(),
    duration: z.string().optional(),
    date: z.string().optional().describe("Data ISO"),
  },
  async (args) => {
    const ctx = getContext();
    return await createMeeting(ctx.userId, args);
  },
);

tool(
  server,
  "taskly_delete_meeting",
  "Elimina un resoconto di riunione per id.",
  { id: z.string() },
  async ({ id }) => {
    const ctx = getContext();
    await deleteMeeting(ctx.userId, id);
    return { deleted: true, id };
  },
);

// ===========================================================================
// Integrations
// ===========================================================================
tool(
  server,
  "taskly_list_integrations",
  "Elenca le integrazioni collegate dell'utente.",
  {},
  async () => {
    const ctx = getContext();
    return await listIntegrations(ctx.userId);
  },
);

tool(
  server,
  "taskly_set_integration",
  "Connette o aggiorna un'integrazione (es. 'slack', 'google').",
  {
    provider: z.string(),
    config: z.any().optional(),
    connected: z.boolean().optional(),
  },
  async (args) => {
    const ctx = getContext();
    return await setIntegration(ctx.userId, args.provider, args.config ?? {}, args.connected ?? true);
  },
);

tool(
  server,
  "taskly_delete_integration",
  "Scollega un'integrazione per provider.",
  { provider: z.string() },
  async ({ provider }) => {
    const ctx = getContext();
    await deleteIntegration(ctx.userId, provider);
    return { deleted: true, provider };
  },
);

// ===========================================================================
// Boot
// ===========================================================================
async function main() {
  const ctx = await initContext();
  console.error(
    `[taskly-mcp] connesso come ${ctx.email ?? ctx.userId} · workspace "${ctx.workspaceName ?? "(nessuno)"}"`,
  );
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[taskly-mcp] server MCP pronto (stdio)");
}

main().catch((err) => {
  console.error("[taskly-mcp] errore di avvio:", err);
  process.exit(1);
});
