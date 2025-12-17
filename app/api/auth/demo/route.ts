/**
 * DEMO ACCESS API ROUTE
 *
 * Sets a cookie for demo access in development mode.
 * This is a workaround for server action issues in Next.js 16.
 */

import { NextResponse } from "next/server";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const response = NextResponse.redirect(
    new URL(
      "/dashboard",
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"
    )
  );

  // Set the org_access cookie
  // This route only runs in development, so secure should be false
  response.cookies.set("org_access", "1", {
    httpOnly: true,
    secure: false, // Always false in development (this route only runs in dev)
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}
