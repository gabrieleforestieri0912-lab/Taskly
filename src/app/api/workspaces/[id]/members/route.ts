import { NextRequest, NextResponse } from "next/server";
import {
  getWorkspaceForUser,
  getWorkspaceMembers,
  upsertWorkspaceMember,
  getProfileByEmail,
} from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

function canManage(
  members: { userId: string; role?: string }[],
  userId: string,
): boolean {
  const member = members.find((m) => String(m.userId) === String(userId));
  return ["owner", "admin"].includes(member?.role || "");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { email, role = "member" } = body as {
      email?: string;
      role?: string;
    };
    if (!email) return NextResponse.json({ error: "missing_email" }, { status: 400 });
    if (!["admin", "member", "viewer"].includes(role)) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }

    const { id } = await params;
    const workspace = await getWorkspaceForUser(user.id, id);
    if (!workspace) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!canManage(workspace.members, user.id)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const profile = await getProfileByEmail(email);
    if (!profile) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    await upsertWorkspaceMember(workspace._id, profile.id, role);

    const members = await getWorkspaceMembers(workspace._id);
    return NextResponse.json({ ...workspace, members });
  } catch (error) {
    console.error("Workspace member error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
