import { NextRequest, NextResponse } from "next/server";
import { getDoc, getWorkspaceRole } from "@/lib/server/db";
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
    const role = await getWorkspaceRole(user.id, workspace);
    if (!role) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const doc = await getDoc({
      userId: user.id,
      workspaceId: workspace,
      slug,
    });
    return NextResponse.json(
      doc
        ? { ...doc, canEdit: role !== "viewer" }
        : { blocks: [], canEdit: role !== "viewer" },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
