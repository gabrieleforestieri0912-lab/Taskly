/**
 * pageTree.ts
 * -----------
 * Type definitions and pure utility functions for the Notion-style page tree.
 *
 * Design decisions (from Fase 0 analysis):
 * - `label` is kept (not renamed to `title`) for backward compatibility with
 *   the existing dashboard/Sidebar codebase and Supabase schema.
 * - `section` is a TS-only concept; all user pages are implicitly "private".
 *   No DB migration required.
 * - `order` (client) maps to `sort_order` (DB) — both fields already exist.
 * - `icon` can be a Lucide ICON_MAP key ("layout-dashboard") OR a Unicode
 *   emoji ("🔥"). The renderer checks with isEmojiIcon().
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/** Sections predisposed for future "shared" / "favorites" extension */
export type PageSection = "private";

/**
 * Page — the canonical client-side representation of a Taskly page.
 * Aligns 1:1 with the existing page shape used in useUserData + Sidebar.
 */
export type Page = {
  /** Client-generated UUID (matches Supabase `pages.id`) */
  id: string;

  /**
   * Display title. Named `label` (not `title`) to stay compatible with
   * every existing component that reads `page.label`.
   */
  label: string;

  /**
   * Icon identifier. Either:
   * - A Lucide ICON_MAP key, e.g. "layout-dashboard"
   * - A Unicode emoji, e.g. "🔥"
   * - Undefined / empty → falls back to type-based icon
   */
  icon?: string;

  /** Tailwind colour class, e.g. "text-gray-400" */
  iconColor?: string;

  /** null = root page; non-null = child of the referenced page */
  parentId: string | null;

  /** Always "private" for now; prepared for "shared" / "favorites" */
  section: PageSection;

  /**
   * Sibling sort order (0-indexed, ascending).
   * Maps to `sort_order` in the DB and `order` in the legacy client code.
   */
  order: number;

  /** View type: "tasks" | "goals" | "calendar" | "notes" | "braindump" | "empty" */
  type: string;

  /** Soft-delete flag — deleted pages appear in Trash */
  deleted?: boolean;

  /** ISO timestamp set when `deleted` becomes true */
  deletedAt?: string;

  createdAt?: string;
  updatedAt?: string;

  /**
   * Maps to `user_id` in Supabase.
   * Optional because the legacy shape omits it on the client.
   */
  ownerId?: string;

  /** Page content (structure varies by `type`) */
  data?: unknown;

  /** Arbitrary client-side metadata (locked, font, …) */
  meta?: Record<string, unknown>;

  // -------------------------------------------------------------------------
  // Legacy fields kept for backward compatibility with existing code
  // -------------------------------------------------------------------------
  purpose?: string | null;
  isTemplate?: boolean;
  initialData?: unknown;
  locked?: boolean;
  font?: string;
  order_?: never; // sentinel to discourage direct use; use `order`
};

/**
 * PageTreeNode — a Page augmented with its resolved children.
 * Produced by buildTree(); consumed by the sidebar renderer.
 */
export type PageTreeNode = Page & {
  children: PageTreeNode[];
};

// ---------------------------------------------------------------------------
// Utility: icon type detection
// ---------------------------------------------------------------------------

/**
 * Returns true if the icon string is a Unicode emoji (not a Lucide key).
 * Heuristic: emoji strings are either a single code-point (length ≤ 2 chars
 * due to surrogate pairs) or contain characters outside the ASCII range.
 */
export function isEmojiIcon(icon: string | undefined): boolean {
  if (!icon || icon.length === 0) return false;
  // Lucide icon keys are kebab-case ASCII strings like "layout-dashboard"
  // Emoji are non-ASCII or very short
  return /[^\x00-\x7F]/.test(icon);
}

// ---------------------------------------------------------------------------
// Utility: build tree from flat list
// ---------------------------------------------------------------------------

/**
 * Converts a flat array of Pages into a nested tree of PageTreeNodes.
 * Only non-deleted pages are included.
 * Siblings are sorted by `order`, then alphabetically by `label`.
 *
 * @param pages - flat array (may include deleted pages)
 * @returns root-level PageTreeNodes with nested children
 */
export function buildTree(pages: Page[]): PageTreeNode[] {
  const active = pages.filter((p) => !p.deleted);

  // Build a map: parentId → children[]
  const childrenMap = new Map<string | null, Page[]>();
  for (const page of active) {
    const key = page.parentId ?? null;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(page);
  }

  // Sort siblings
  const sortSiblings = (arr: Page[]): Page[] =>
    arr.slice().sort((a, b) => {
      if (typeof a.order === "number" && typeof b.order === "number") {
        if (a.order !== b.order) return a.order - b.order;
      }
      return (a.label ?? "").localeCompare(b.label ?? "");
    });

  // Recursively build nodes
  const buildNode = (page: Page): PageTreeNode => {
    const rawChildren = childrenMap.get(page.id) ?? [];
    return {
      ...page,
      children: sortSiblings(rawChildren).map(buildNode),
    };
  };

  const roots = childrenMap.get(null) ?? [];
  return sortSiblings(roots).map(buildNode);
}

// ---------------------------------------------------------------------------
// Utility: ancestor path (breadcrumb)
// ---------------------------------------------------------------------------

/**
 * Returns the ancestor chain from root to (but not including) the target page.
 * Useful for breadcrumbs and auto-expanding parents when navigating.
 *
 * @param pages - flat array of all pages
 * @param pageId - the page whose ancestors we want
 * @returns ordered array [root, ..., direct-parent]
 */
export function getAncestors(pages: Page[], pageId: string): Page[] {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const ancestors: Page[] = [];

  let current = byId.get(pageId);
  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}

/**
 * Returns the IDs of all ancestors of the given page.
 * Convenience wrapper around getAncestors().
 */
export function getAncestorIds(pages: Page[], pageId: string): Set<string> {
  return new Set(getAncestors(pages, pageId).map((p) => p.id));
}

// ---------------------------------------------------------------------------
// Utility: child count
// ---------------------------------------------------------------------------

/**
 * Returns the number of direct (non-deleted) children for a given page.
 */
export function countDirectChildren(pages: Page[], pageId: string): number {
  return pages.filter((p) => !p.deleted && p.parentId === pageId).length;
}

/**
 * Returns the total number of descendants (recursive) for a given page.
 */
export function countAllDescendants(pages: Page[], pageId: string): number {
  let count = 0;
  const stack = [pageId];
  const active = pages.filter((p) => !p.deleted);
  while (stack.length > 0) {
    const id = stack.pop()!;
    const children = active.filter((p) => p.parentId === id);
    count += children.length;
    stack.push(...children.map((c) => c.id));
  }
  return count;
}

// ---------------------------------------------------------------------------
// Utility: create a new empty page payload
// ---------------------------------------------------------------------------

/**
 * Builds a new Page object ready to be optimistically inserted into state.
 * The caller is responsible for persisting it to the backend.
 */
export function createEmptyPage(opts: {
  parentId?: string | null;
  ownerId?: string;
  siblingCount?: number;
}): Page {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `pg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    label: "",
    icon: undefined,
    iconColor: "text-gray-400",
    parentId: opts.parentId ?? null,
    section: "private",
    order: opts.siblingCount ?? 0,
    type: "empty",
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: opts.ownerId,
    data: { text: "" },
    meta: {},
  };
}

// ---------------------------------------------------------------------------
// Utility: coerce legacy page shape → Page
// ---------------------------------------------------------------------------

/**
 * Maps the legacy page shape used by useUserData / Sidebar to the canonical
 * Page type. Safe to call on already-correct Page objects (idempotent).
 */
export function normalizePage(raw: Record<string, unknown>): Page {
  return {
    id: String(raw.id ?? ""),
    label: String(raw.label ?? raw.title ?? ""),
    icon: (raw.icon as string | undefined) ?? undefined,
    iconColor: (raw.iconColor as string | undefined) ?? "text-gray-400",
    parentId: (raw.parentId as string | null) ?? null,
    section: "private",
    order:
      typeof raw.order === "number"
        ? raw.order
        : typeof raw.sort_order === "number"
          ? raw.sort_order
          : 0,
    type: String(raw.type ?? "empty"),
    deleted: Boolean(raw.deleted),
    deletedAt: (raw.deletedAt as string | undefined) ?? undefined,
    createdAt: (raw.createdAt as string | undefined) ?? undefined,
    updatedAt: (raw.updatedAt as string | undefined) ?? undefined,
    ownerId: (raw.ownerId as string | undefined) ?? undefined,
    data: raw.data,
    meta: (raw.meta as Record<string, unknown> | undefined) ?? {},
    purpose: (raw.purpose as string | null | undefined) ?? null,
    isTemplate: Boolean(raw.isTemplate),
  };
}
