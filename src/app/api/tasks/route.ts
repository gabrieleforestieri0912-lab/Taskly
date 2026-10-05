import { NextRequest, NextResponse } from "next/server";
import { listTasks, createTask, getWorkspaceRole } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// Create task
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const workspace = body.workspaceId || body.workspace || "personal";
    if (workspace !== "personal") {
      const role = await getWorkspaceRole(user.id, workspace);
      if (!role) return NextResponse.json({ error: "not_found" }, { status: 404 });
      if (role === "viewer") {
        return NextResponse.json({ error: "workspace_read_only" }, { status: 403 });
      }
    }
    const t = await createTask(user.id, body);
    if (!t) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(t);
  } catch (e) {
    if (e instanceof Error && e.message === "workspace_read_only") {
      return NextResponse.json({ error: "workspace_read_only" }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// List tasks with pagination and filters
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { searchParams } = request.nextUrl;
    const workspace = searchParams.get("workspace") || undefined;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const status = searchParams.get("status") || undefined;

    if (!workspace) {
      return NextResponse.json({ error: "missing_workspace" }, { status: 400 });
    }
    if (workspace !== "personal") {
      const role = await getWorkspaceRole(user.id, workspace);
      if (!role) return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const tasks = await listTasks({
      userId: user.id,
      workspaceId: workspace,
      status,
      page: Number(page),
      limit: Number(limit),
    });
    return NextResponse.json(tasks);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
