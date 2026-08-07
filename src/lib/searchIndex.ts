// Simple client-side search index stored in localStorage

interface SearchDoc {
  id: string;
  title: string;
  snippet: string;
}

interface IndexMap {
  [term: string]: { [docId: string]: number };
}

function tokenize(text: unknown): string[] {
  return String(text || "")
    .toLowerCase()
    .replace(/[\W_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function buildIndex(pages: any[] = []): {
  index: IndexMap;
  docs: Record<string, SearchDoc>;
} {
  const index: IndexMap = {};
  const docs: Record<string, SearchDoc> = {};

  pages.forEach((p) => {
    const id = String(p.id || p.slug || Math.random());
    const title = p.label || p.title || "";
    let body = "";
    if (p.data) {
      if (typeof p.data === "string") body = p.data;
      else if (p.data.text) body = p.data.text;
      else if (Array.isArray(p.data))
        body = p.data
          .map((it: any) => it.title || it.text || "")
          .join(" ");
    }
    const text = `${title} ${body}`;
    docs[id] = { id, title, snippet: body.substring(0, 200) };

    const tokens = tokenize(text);
    const counts: Record<string, number> = {};
    tokens.forEach((t) => (counts[t] = (counts[t] || 0) + 1));

    Object.entries(counts).forEach(([term, count]) => {
      if (!index[term]) index[term] = {};
      index[term][id] = (index[term][id] || 0) + count;
    });
  });

  try {
    localStorage.setItem("plannilab_search_index", JSON.stringify(index));
    localStorage.setItem("plannilab_search_docs", JSON.stringify(docs));
  } catch (e) {
    // ignore storage errors
  }

  return { index, docs };
}

export function searchIndex(
  query: string,
  {
    index = null,
    docs = null,
  }: { index?: IndexMap | null; docs?: Record<string, SearchDoc> | null } = {},
) {
  try {
    if (!index)
      index = JSON.parse(
        localStorage.getItem("plannilab_search_index") || "{}",
      ) as IndexMap;
    if (!docs)
      docs = JSON.parse(
        localStorage.getItem("plannilab_search_docs") || "{}",
      ) as Record<string, SearchDoc>;
  } catch (e) {
    index = index || {};
    docs = docs || {};
  }

  const tokens = tokenize(query).filter((t) => t.length > 1);
  if (tokens.length === 0) return [];

  const scores: Record<string, number> = {};
  tokens.forEach((t) => {
    const posting = index[t] || {};
    Object.entries(posting).forEach(([id, count]) => {
      scores[id] = (scores[id] || 0) + count;
    });
  });

  const results = Object.keys(scores)
    .map((id) => ({ ...(docs as Record<string, SearchDoc>)[id], id, score: scores[id] }))
    .sort((a, b) => b.score - a.score);

  return results;
}
