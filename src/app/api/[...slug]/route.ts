import { NextResponse } from "next/server";

// Unmatched API routes get a JSON 404 instead of Next.js's default HTML 404
// page (which API clients can't parse) — same shape as the old Express
// catch-all `app.use("/api", ...)`.
const NOT_FOUND = NextResponse.json(
  { error: { message: "Not Found", status: 404, code: "NOT_FOUND" } },
  { status: 404 },
);

export async function GET() {
  return NOT_FOUND;
}

export async function POST() {
  return NOT_FOUND;
}

export async function PUT() {
  return NOT_FOUND;
}

export async function DELETE() {
  return NOT_FOUND;
}

export async function PATCH() {
  return NOT_FOUND;
}

export async function HEAD() {
  return NOT_FOUND;
}

export async function OPTIONS() {
  return NOT_FOUND;
}
