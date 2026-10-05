import { NextRequest, NextResponse } from "next/server";
import {
  createWorkspaceComment,
  getWorkspaceRole,
  listWorkspaceComments,
} from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isEntityType(value: unknown): value is "task" | "document" {
  return value === "task" || value === "document";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  const { id: workspaceId } = await params;
  const { searchParams } = request.nextUrl;
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId") || "";
  if (!UUID_RE.test(workspaceId) || !isEntityType(entityType) || !entityId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const comments = await listWorkspaceComments(
      user.id,
      workspaceId,
      entityType,
      entityId,
    );
    if (!comments) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Workspace comments read error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  const { id: workspaceId } = await params;
  if (!UUID_RE.test(workspaceId)) {
    return NextResponse.json({ error: "invalid_workspace" }, { status: 400 });
  }

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const { entityType, entityId, body: text, mentions = [] } = body;
    if (
      !isEntityType(entityType) ||
      typeof entityId !== "string" ||
      !entityId.trim() ||
      entityId.length > 200 ||
      (entityType === "task" && !UUID_RE.test(entityId)) ||
      typeof text !== "string" ||
      !text.trim() ||
      text.trim().length > 5000 ||
      !Array.isArray(mentions) ||
      mentions.some((mention: unknown) => typeof mention !== "string" || !UUID_RE.test(mention))
    ) {
      return NextResponse.json({ error: "invalid_comment" }, { status: 400 });
    }

    const role = await getWorkspaceRole(user.id, workspaceId);
    if (!role) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (role === "viewer") {
      return NextResponse.json({ error: "workspace_read_only" }, { status: 403 });
    }

    const comment = await createWorkspaceComment(
      user.id,
      workspaceId,
      entityType,
      entityId,
      text.trim(),
      mentions,
    );
    if (!comment) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "workspace_read_only") {
      return NextResponse.json({ error: "workspace_read_only" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "invalid_workspace_mention") {
      return NextResponse.json({ error: "invalid_workspace_mention" }, { status: 400 });
    }
    console.error("Workspace comment create error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
