import { NextRequest, NextResponse } from "next/server";
import { deleteIntegration } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

// DELETE /api/integrations/:provider → disconnect
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { provider } = await params;
    await deleteIntegration(user.id, String(provider));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
