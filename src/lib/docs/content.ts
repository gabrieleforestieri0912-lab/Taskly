import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DocHeading, DocPage, DocStatus } from "./types";
export { getSectionLabel } from "./labels";

const CONTENT_ROOT = path.join(process.cwd(), "content", "docs", "it");
const STATUSES: DocStatus[] = ["stable", "beta", "coming-soon"];

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function parseFrontmatter(source: string, filePath: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`Documentation frontmatter missing: ${filePath}`);
  }

  const fields = new Map<string, string>();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (field) fields.set(field[1], field[2].trim());
  }

  const scalar = (name: string) => {
    const value = fields.get(name);
    if (value === undefined) {
      throw new Error(`Documentation field "${name}" missing: ${filePath}`);
    }
    return value.replace(/^["']|["']$/g, "");
  };

  const title = scalar("title");
  const description = scalar("description");
  const section = scalar("section");
  const order = Number(scalar("order"));
  const route = scalar("route");
  const tagsValue = scalar("tags");
  const status = scalar("status") as DocStatus;
  const updated = scalar("updated");

  if (!title) throw new Error(`Documentation title is empty: ${filePath}`);
  if (!description || description.length > 160) {
    throw new Error(`Documentation description must be 1-160 chars: ${filePath}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section)) {
    throw new Error(`Invalid documentation section "${section}": ${filePath}`);
  }
  if (!Number.isInteger(order) || order < 0) {
    throw new Error(`Documentation order must be a non-negative integer: ${filePath}`);
  }
  if (route && !route.startsWith("/")) {
    throw new Error(`Documentation route must be empty or start with "/": ${filePath}`);
  }
  if (!STATUSES.includes(status)) {
    throw new Error(`Invalid documentation status "${status}": ${filePath}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated) || Number.isNaN(Date.parse(updated))) {
    throw new Error(`Documentation updated date must be YYYY-MM-DD: ${filePath}`);
  }

  let tags: string[];
  try {
    const parsed: unknown = JSON.parse(tagsValue);
    if (!Array.isArray(parsed) || !parsed.every((tag) => typeof tag === "string")) {
      throw new Error("tags must be an array of strings");
    }
    tags = parsed;
  } catch {
    throw new Error(`Documentation tags must be a JSON-style string array: ${filePath}`);
  }

  return {
    title,
    description,
    section,
    order,
    route,
    tags,
    status,
    updated,
    content: source.slice(match[0].length).trim(),
  };
}

function slugifyHeading(text: string): string {
  return text
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): DocHeading[] {
  const usedIds = new Map<string, number>();
  return markdown
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^(##|###)\s+(.+?)\s*#*\s*$/);
      if (!match) return [];
      const text = match[2].replace(/[`*_~]/g, "").trim();
      const baseId = slugifyHeading(text);
      const count = usedIds.get(baseId) || 0;
      usedIds.set(baseId, count + 1);
      return [{
        id: count ? `${baseId}-${count + 1}` : baseId,
        text,
        depth: match[1].length as 2 | 3,
      }];
    });
}

function markdownToText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSlug(filePath: string): string {
  const relative = path.relative(CONTENT_ROOT, filePath).replace(/\\/g, "/");
  if (relative === "index.md") return "";
  return relative.replace(/\.md$/, "").replace(/\/index$/, "");
}

export function getAllDocs(): DocPage[] {
  const docs = collectFiles(CONTENT_ROOT).map((filePath) => {
    const source = readFileSync(filePath, "utf8");
    const frontmatter = parseFrontmatter(source, filePath);
    const headings = extractHeadings(frontmatter.content);
    const searchText = [
      frontmatter.title,
      frontmatter.description,
      ...frontmatter.tags,
      ...headings.map((heading) => heading.text),
      markdownToText(frontmatter.content),
    ].join(" ");

    return { ...frontmatter, slug: getSlug(filePath), headings, searchText };
  });

  const seenSlugs = new Set<string>();
  for (const doc of docs) {
    if (seenSlugs.has(doc.slug)) {
      throw new Error(`Duplicate documentation slug: "${doc.slug}"`);
    }
    seenSlugs.add(doc.slug);
  }

  return docs.sort(
    (a, b) =>
      a.section.localeCompare(b.section) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  );
}

export function getDocBySlug(slug: string): DocPage | undefined {
  return getAllDocs().find((doc) => doc.slug === slug);
}

export function getDocForRoute(route: string): DocPage | undefined {
  const normalizedRoute = route.replace(/\/+$/, "") || "/";
  return getAllDocs().find((doc) => doc.route === normalizedRoute);
}
