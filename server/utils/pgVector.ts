import { getSupabase } from "../supabase/client";

/**
 * Semantic search using pgvector (replaces MongoDB Atlas knnBeta).
 * Requires the `vector` extension and the `match_documents` function
 * defined in server/supabase/schema.sql.
 */
async function searchVectors({
  userId,
  workspace,
  embedding,
  limit = 10,
}: {
  userId: string;
  workspace: string;
  embedding: number[] | null;
  limit?: number;
}) {
  if (!embedding || !Array.isArray(embedding) || embedding.length === 0)
    return [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: Number(limit),
      p_user_id: userId,
      p_workspace: workspace,
    });
    if (error) {
      console.error("pgVector search error:", error);
      return [];
    }
    return (data || []).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      score: r.score,
    }));
  } catch (e) {
    console.error("pgVector search error", e);
    return [];
  }
}

export { searchVectors };
