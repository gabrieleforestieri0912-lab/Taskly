/**
 * Embedding disabilitati: l'unico provider AI è xKiro (chat).
 * La ricerca semantica usa il fallback full-text Postgres
 * (vedi /api/search/vector). Teniamo lo stub per non rompere gli import.
 */
async function getEmbedding(_text: string): Promise<number[] | null> {
  return null;
}

export { getEmbedding };
