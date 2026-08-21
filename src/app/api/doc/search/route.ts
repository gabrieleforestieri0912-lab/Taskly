import { NextRequest, NextResponse } from "next/server";
import { searchDocs } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

// Search endpoint used for mention autocompletion
// (GET /api/doc/search?workspace=...&q=...)
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { searchParams } = request.nextUrl;
    const workspace = searchParams.get("workspace") || undefined;
    const q = searchParams.get("q") || undefined;
    if (!workspace || !q) return NextResponse.json([]);

    const items = await searchDocs({
      userId: user.id,
      workspaceId: workspace,
      q,
      limit: 10,
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
