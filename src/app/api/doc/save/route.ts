import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceRole, saveDoc } from "@/lib/server/db";
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

    const { workspaceId, slug, title, blocks } = body as {
      workspaceId?: string;
      slug?: string;
      title?: string;
      blocks?: unknown;
    };
    const blocksArray = blocks as any[] | undefined;
    if (!workspaceId || !slug) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const role = await getWorkspaceRole(user.id, workspaceId);
    if (!role) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (role === "viewer") {
      return NextResponse.json({ error: "workspace_read_only" }, { status: 403 });
    }

    const { docId, version } = await saveDoc({
      userId: user.id,
      workspaceId,
      slug,
      title,
      blocks: blocksArray,
      author: user.id,
    });

    return NextResponse.json({ ok: true, docId, version });
  } catch (err) {
    if (err instanceof Error && err.message === "workspace_read_only") {
      return NextResponse.json({ error: "workspace_read_only" }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
