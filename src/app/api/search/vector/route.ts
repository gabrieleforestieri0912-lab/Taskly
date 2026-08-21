import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/server/supabase";
import { getEmbedding } from "@/lib/server/embeddings";
import { searchVectors } from "@/lib/server/pgVector";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { workspace, q, limit = 10 } = body as {
      workspace?: string;
      q?: string;
      limit?: number;
    };
    if (!workspace || !q) {
      return NextResponse.json({ error: "missing" }, { status: 400 });
    }

    // Semantic search via pgvector (only when explicitly enabled)
    if (process.env.ENABLE_VECTOR === "true") {
      const embedding = await getEmbedding(q);
      const vectorResults = await searchVectors({
        userId: user.id,
        workspace,
        embedding,
        limit: Number(limit),
      });
      if (vectorResults.length > 0) {
        return NextResponse.json(vectorResults);
      }
    }

    // Fallback: Postgres full-text search with relevance ranking
    const needle = `%${String(q)
      .replace(/[,\\\\(\\\\)\\\\*\\\\|\\\\\"\\\\'\\\\`\\\\\\\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")}%`;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("documents")
      .select("id, slug, title")
      .eq("user_id", user.id)
      .eq("workspace_id", workspace)
      .or(`title.ilike.${needle},plain_text.ilike.${needle}`)
      .order("updated_at", { ascending: false })
      .limit(Number(limit));
    if (error) throw error;

    const out = (data || []).map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      score: 1,
    }));
    return NextResponse.json(out);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
