import { NextRequest, NextResponse } from "next/server";
import { saveDoc } from "@/lib/server/db";
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

    const { workspaceId, slug, title, blocks, author } = body as {
      workspaceId?: string;
      slug?: string;
      title?: string;
      blocks?: unknown;
      author?: string;
    };
    const blocksArray = blocks as any[] | undefined;
    if (!workspaceId || !slug) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const { docId, version } = await saveDoc({
      userId: user.id,
      workspaceId,
      slug,
      title,
      blocks: blocksArray,
      author,
    });

    return NextResponse.json({ ok: true, docId, version });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
