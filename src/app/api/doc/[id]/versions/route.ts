import { NextRequest, NextResponse } from "next/server";
import { listDocVersions } from "@/lib/server/db";
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
    const versions = await listDocVersions(user.id, id);
    if (versions === null) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json(versions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
