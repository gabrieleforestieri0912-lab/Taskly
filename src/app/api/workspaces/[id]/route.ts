import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceForUser } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const workspace = await getWorkspaceForUser(user.id, id);
    if (!workspace) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Workspace get error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
