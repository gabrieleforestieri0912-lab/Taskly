import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const profile = await getProfile(user.id);
    if (!profile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      subscription: profile.subscription || { status: "inactive" },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { message: "Error fetching subscription" },
      { status: 500 },
    );
  }
}
