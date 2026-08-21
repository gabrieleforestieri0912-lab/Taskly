import { NextRequest, NextResponse } from "next/server";
import { getDoc } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slug: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id: workspace, slug } = await params;
    const doc = await getDoc({
      userId: user.id,
      workspaceId: workspace,
      slug,
    });
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
