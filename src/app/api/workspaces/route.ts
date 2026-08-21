import { NextRequest, NextResponse } from "next/server";
import { listWorkspacesForUser, createWorkspace } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

function slugify(value: unknown): string {
  return (
    String(value || "workspace")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "workspace"
  );
}

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const workspaces = await listWorkspacesForUser(user.id);
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Workspace list error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const name = String(body?.name || "").trim();
    if (!name) return NextResponse.json({ error: "missing_name" }, { status: 400 });

    const workspace = await createWorkspace(user.id, {
      name,
      slug: slugify(body?.slug || name),
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "workspace_slug_exists" }, { status: 409 });
    }
    console.error("Workspace create error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
