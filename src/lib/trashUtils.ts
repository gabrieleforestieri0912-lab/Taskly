import type { Task } from "./taskModel";

export type TrashItemType = "page" | "task" | "project";

export interface TrashItem {
  id: string;
  title: string;
  type: TrashItemType;
  deletedAt?: string;
  pageType: string;
  hasParent: boolean;
  expired: boolean;
  daysLeft: number | null;
}

export const TRASH_RETENTION_DAYS = 30;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** Una pagina e' considerata "Progetto" se ha type/purpose/label da progetto. */
export function isProjectPage(p: any): boolean {
  if (!p) return false;
  const type = String(p.type || "").toLowerCase();
  const purpose = String(p.purpose || "").toLowerCase();
  const label = String(p.label || p.title || "").toLowerCase();
  if (type === "project" || type === "progetto" || type === "projects") return true;
  if (purpose.includes("project") || purpose.includes("progett")) return true;
  if (label.startsWith("progetto") || label.startsWith("project")) return true;
  return false;
}

export function getDeletedAt(p: any): string | undefined {
  return p?.deletedAt || p?.deleted_at || p?.updatedAt || undefined;
}

export function trashStatus(deletedAt?: string): { expired: boolean; daysLeft: number | null } {
  if (!deletedAt) return { expired: false, daysLeft: null };
  const ts = new Date(deletedAt).getTime();
  if (Number.isNaN(ts)) return { expired: false, daysLeft: null };
  const elapsed = Date.now() - ts;
  const daysLeft = Math.max(0, Math.ceil((TRASH_RETENTION_MS - elapsed) / 86400000));
  return { expired: elapsed > TRASH_RETENTION_MS, daysLeft };
}

/** Tutti gli id discendenti (ricorsivi) di una pagina. */
export function collectDescendantIds(pages: any[], rootId: string): string[] {
  const byParent = new Map<string, any[]>();
  (pages || []).forEach((p) => {
    if (!p) return;
    const key = p.parentId == null ? "__root__" : String(p.parentId);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(p);
  });
  const out: string[] = [];
  const stack = [String(rootId)];
  while (stack.length) {
    const cur = stack.pop()!;
    const children = byParent.get(cur) || [];
    children.forEach((c) => {
      out.push(String(c.id));
      stack.push(String(c.id));
    });
  }
  return out;
}

/** Soft-delete a cascata: pagina + tutte le sottopagine. */
export function softDeletePageCascade(pages: any[], rootId: string): any[] {
  const ids = new Set([String(rootId), ...collectDescendantIds(pages, rootId)]);
  const now = new Date().toISOString();
  return (pages || []).map((p) =>
    ids.has(String(p.id))
      ? { ...p, deleted: true, deletedAt: p.deletedAt || now, updatedAt: now }
      : p,
  );
}

/** Ripristino a cascata: sistema la gerarchia se il genitore non c'e' piu'. */
export function restorePageCascade(pages: any[], rootId: string): any[] {
  const ids = new Set([String(rootId), ...collectDescendantIds(pages, rootId)]);
  const byId = new Map((pages || []).map((p) => [String(p.id), p]));
  const now = new Date().toISOString();
  return (pages || []).map((p) => {
    if (!ids.has(String(p.id))) return p;
    let parentId = p.parentId ?? null;
    if (parentId != null) {
      const parent = byId.get(String(parentId));
      if (!parent || (parent.deleted && !ids.has(String(parent.id)))) parentId = null;
    }
    const next: any = { ...p, parentId, deleted: false, updatedAt: now };
    delete next.deletedAt;
    return next;
  });
}

/** Elimina definitivamente una pagina + discendenti. */
export function hardDeletePageCascade(pages: any[], rootId: string): any[] {
  const ids = new Set([String(rootId), ...collectDescendantIds(pages, rootId)]);
  return (pages || []).filter((p) => !ids.has(String(p.id)));
}

export function purgeExpiredPages(pages: any[]): { kept: any[]; purgedIds: string[] } {
  const purgedIds: string[] = [];
  const kept = (pages || []).filter((p) => {
    if (!p?.deleted) return true;
    if (trashStatus(getDeletedAt(p)).expired) {
      purgedIds.push(String(p.id));
      return false;
    }
    return true;
  });
  return { kept, purgedIds };
}

export function purgeExpiredTasks(tasks: Task[]): { kept: Task[]; purgedIds: string[] } {
  const purgedIds: string[] = [];
  const kept = (tasks || []).filter((t: any) => {
    if (!t?.deleted) return true;
    const deletedAt = t.deletedAt || t.updatedAt || t.completedAt || t.createdAt;
    if (trashStatus(deletedAt).expired) {
      purgedIds.push(String(t.id));
      return false;
    }
    return true;
  });
  return { kept, purgedIds };
}

export function getTaskDeletedAt(t: any): string | undefined {
  return t?.deletedAt || t?.updatedAt || t?.completedAt || t?.createdAt || undefined;
}

export function buildTrashItems(pages: any[], tasks: Task[]): TrashItem[] {
  const items: TrashItem[] = [];
  (pages || [])
    .filter((p) => p && p.deleted)
    .forEach((p) => {
      const deletedAt = getDeletedAt(p);
      const st = trashStatus(deletedAt);
      items.push({
        id: String(p.id),
        title: p.label || p.title || "Pagina senza titolo",
        type: isProjectPage(p) ? "project" : "page",
        deletedAt,
        pageType: p.type || "notes",
        hasParent: !!p.parentId,
        expired: st.expired,
        daysLeft: st.daysLeft,
      });
    });
  (tasks || [])
    .filter((t: any) => t && t.deleted)
    .forEach((t: any) => {
      const deletedAt = getTaskDeletedAt(t);
      const st = trashStatus(deletedAt);
      items.push({
        id: String(t.id),
        title: t.title || "Task senza titolo",
        type: "task",
        deletedAt,
        pageType: "task",
        hasParent: false,
        expired: st.expired,
        daysLeft: st.daysLeft,
      });
    });
  return items;
}

export function softDeleteTaskValue(task: Task): Task {
  const now = new Date().toISOString();
  return { ...task, deleted: true, deletedAt: now, updatedAt: now } as unknown as Task;
}

export function restoreTaskValue(task: Task): Task {
  const next: any = { ...task, deleted: false, updatedAt: new Date().toISOString() };
  delete next.deletedAt;
  return next as Task;
}

