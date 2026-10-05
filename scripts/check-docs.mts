import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { docsConfig } from "../docs.config";
import { getAllDocs } from "../src/lib/docs/content";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(repositoryRoot, docsConfig.contentRoot);
const appRoot = path.join(repositoryRoot, docsConfig.appRoot);
const errors: string[] = [];

function collectFiles(directory: string, extensions: Set<string>): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(filePath, extensions);
    return entry.isFile() && extensions.has(path.extname(entry.name))
      ? [filePath]
      : [];
  });
}

function routeFromPageFile(filePath: string): string {
  const relative = path.relative(appRoot, path.dirname(filePath));
  const segments = relative === "." ? [] : relative.split(path.sep);
  const routeSegments = segments.filter(
    (segment) => !segment.startsWith("(") && !segment.startsWith("@"),
  );

  if (routeSegments.includes("api")) return `/${routeSegments.join("/")}`;
  if (routeSegments.at(-1)?.startsWith("[[...")) {
    routeSegments.pop();
    return `/${routeSegments.join("/")}` || "/";
  }
  if (routeSegments.at(-1)?.startsWith("[...")) {
    routeSegments.pop();
    return `/${routeSegments.join("/")}` || "/";
  }
  return `/${routeSegments.join("/")}` || "/";
}

function normalizeRoute(route: string): string {
  const pathname = route.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return pathname || "/";
}

function patternMatches(pattern: string, route: string): boolean {
  const escaped = pattern
    .split("**")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*")
    .replace(/\\\*/g, "[^/]*");
  return new RegExp(`^${escaped}/?$`).test(route);
}

function isAllowlisted(route: string): boolean {
  return docsConfig.routeAllowlist.some(({ pattern }) =>
    patternMatches(pattern, route),
  );
}

function headingIds(markdown: string): Set<string> {
  const usedIds = new Map<string, number>();
  const ids = new Set<string>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^(##|###)\s+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const base = match[2]
      .replace(/[`*_~]/g, "")
      .trim()
      .toLocaleLowerCase("it")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const count = usedIds.get(base) || 0;
    usedIds.set(base, count + 1);
    ids.add(count ? `${base}-${count + 1}` : base);
  }
  return ids;
}

function checkMarkdownAccessibility(filePath: string, content: string) {
  const lines = content.split(/\r?\n/);
  let previousHeadingLevel = 1;

  lines.forEach((line, index) => {
    const heading = line.match(/^(#{1,6})\s+/);
    if (heading) {
      const level = heading[1].length;
      if (level > previousHeadingLevel + 1) {
        errors.push(
          `${path.relative(repositoryRoot, filePath)}:${index + 1}: heading level jumps from H${previousHeadingLevel} to H${level}.`,
        );
      }
      previousHeadingLevel = level;
    }

    for (const image of line.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
      if (!image[1].trim()) {
        errors.push(
          `${path.relative(repositoryRoot, filePath)}:${index + 1}: image is missing alternative text.`,
        );
      }
    }

    if (/^:::screenshot\b/.test(line) && !/\balt\s*=\s*["'][^"']+["']/.test(line)) {
      errors.push(
        `${path.relative(repositoryRoot, filePath)}:${index + 1}: screenshot directive is missing non-empty alt text.`,
      );
    }
  });
}

let docs;
try {
  docs = getAllDocs();
} catch (error) {
  console.error(
    `Invalid documentation content: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}

const seenOrders = new Map<string, string>();
for (const doc of docs) {
  const orderKey = `${doc.section}:${doc.order}`;
  const previousSlug = seenOrders.get(orderKey);
  if (previousSlug) {
    errors.push(
      `Duplicate order ${doc.order} in section "${doc.section}": "${previousSlug}" and "${doc.slug}".`,
    );
  } else {
    seenOrders.set(orderKey, doc.slug || "index");
  }
}

const pageFiles = collectFiles(appRoot, new Set([".tsx", ".ts"])).filter((filePath) =>
  /^page\.(tsx|ts)$/.test(path.basename(filePath)),
);
const appRoutes = new Set(pageFiles.map(routeFromPageFile));
const docsByRoute = new Map<string, typeof docs>();
const docFileBySlug = new Map(
  collectFiles(contentRoot, new Set([".md"])).map((filePath) => {
    const relative = path.relative(contentRoot, filePath).replace(/\\/g, "/");
    const slug =
      relative === "index.md"
        ? ""
        : relative.replace(/\.md$/, "").replace(/\/index$/, "");
    return [slug, filePath] as const;
  }),
);
for (const doc of docs) {
  if (!doc.route) continue;
  const route = normalizeRoute(doc.route);
  const matchingDocs = docsByRoute.get(route) || [];
  matchingDocs.push(doc);
  docsByRoute.set(route, matchingDocs);
  if (!appRoutes.has(route) && !isAllowlisted(route)) {
    errors.push(
      `Documentation route "${doc.route}" in "${doc.slug || "index"}" does not match an app page route.`,
    );
  }
}

const uncoveredRoutes = [...appRoutes].filter(
  (route) => !isAllowlisted(route) && !docsByRoute.has(route),
);
for (const route of uncoveredRoutes) {
  errors.push(`App route "${route}" has no documentation page.`);
}

const docsBySlug = new Map(docs.map((doc) => [doc.slug, doc]));
for (const doc of docs) {
  const filePath = docFileBySlug.get(doc.slug);
  if (!filePath) {
    errors.push(`Cannot resolve source file for documentation slug "${doc.slug}".`);
    continue;
  }
  checkMarkdownAccessibility(filePath, doc.content);
  const source = readFileSync(filePath, "utf8");
  const content = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  for (const link of content.matchAll(/!?\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g)) {
    const href = link[2];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    let targetPath: string;
    try {
      targetPath = decodeURIComponent(href.split(/[?#]/, 1)[0]);
    } catch {
      errors.push(`Invalid encoded documentation link "${href}" in "${doc.slug || "index"}".`);
      continue;
    }
    if (targetPath === "/docs" || targetPath.startsWith("/docs/")) {
      const targetSlug = targetPath.replace(/^\/docs\/?/, "").replace(/\/+$/, "");
      const targetDoc = docsBySlug.get(targetSlug);
      if (!targetDoc) {
        errors.push(`Broken documentation link "${href}" in "${doc.slug || "index"}".`);
        continue;
      }
      const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
      if (hash) {
        let decodedHash: string;
        try {
          decodedHash = decodeURIComponent(hash);
        } catch {
          errors.push(`Invalid encoded documentation anchor "${href}" in "${doc.slug || "index"}".`);
          continue;
        }
        if (!headingIds(targetDoc.content).has(decodedHash)) {
          errors.push(`Broken documentation anchor "${href}" in "${doc.slug || "index"}".`);
        }
      }
    } else if (!appRoutes.has(normalizeRoute(targetPath)) && !isAllowlisted(normalizeRoute(targetPath))) {
      errors.push(`Broken app route link "${href}" in "${doc.slug || "index"}".`);
    }
  }
}

if (errors.length) {
  console.error(`Documentation check failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Documentation check passed: ${docs.length} pages, ${appRoutes.size} app routes, no broken links, duplicate orders, or heading/alt-text issues.`,
);
