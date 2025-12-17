/**
 * DEMO ACCESS API ROUTE
 *
 * Sets a cookie for demo access (prototype mode).
 * This allows temporary access to the dashboard for demonstration purposes.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Get the origin to redirect back to the same domain
  const origin = request.headers.get("origin") || request.url;
  const baseUrl = new URL(origin).origin;

  const response = NextResponse.redirect(new URL("/dashboard", baseUrl));

  // Set the org_access cookie
  // Use secure cookies in production (HTTPS), false in development
  const nodeEnv = process.env.NODE_ENV as string | undefined;
  const isProduction = nodeEnv === "production";

  response.cookies.set("org_access", "1", {
    httpOnly: true,
    secure: isProduction, // Secure cookies required for HTTPS in production
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}
