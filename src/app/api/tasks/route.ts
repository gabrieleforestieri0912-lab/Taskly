import { NextRequest, NextResponse } from "next/server";
import { listTasks, createTask } from "@/lib/server/db";
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
    const t = await createTask(user.id, body);
    return NextResponse.json(t);
  } catch (e) {
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
