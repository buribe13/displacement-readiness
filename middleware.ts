/**
 * ORG-ONLY ACCESS GATE
 *
 * ETHICAL DESIGN NOTE:
 * This middleware implements a simple prototype gate to ensure the dashboard
 * is not publicly accessible. The tool is designed for housing/homelessness
 * service organizations (like PATH, Dream Center) and should never be exposed
 * to the general public or used for surveillance purposes.
 *
 * PROTOTYPE NOTE:
 * This is NOT production-ready authentication. For a real deployment:
 * - Implement proper auth (NextAuth, Clerk, etc.)
 * - Add role-based access control
 * - Audit logging for accountability
 * - Session management with proper expiration
 *
 * Current gate: Checks for `org_access=1` cookie OR `x-org-access: 1` header.
 * This allows easy testing while keeping the dashboard gated.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that should be accessible without org access
const PUBLIC_ROUTES = [
  "/access", // The "access required" page
  "/api/health", // Health check endpoint (if needed)
  "/api/signals", // Signals API (dashboard page is already protected)
];

// Static file patterns to always allow
const STATIC_PATTERNS = [
  "/_next",
  "/favicon.ico",
  "/api/auth", // Reserved for future auth endpoints
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static files and Next.js internals
  if (STATIC_PATTERNS.some((pattern) => pathname.startsWith(pattern))) {
    return NextResponse.next();
  }

  // Always allow explicitly public routes
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // Check for org access via cookie or header
  const hasOrgAccessCookie = request.cookies.get("org_access")?.value === "1";
  const hasOrgAccessHeader = request.headers.get("x-org-access") === "1";

  if (hasOrgAccessCookie || hasOrgAccessHeader) {
    // Org access confirmed - allow request
    return NextResponse.next();
  }

  // No org access - redirect to access page
  // ETHICAL NOTE: We redirect rather than showing an error to avoid
  // revealing the existence of protected resources to unauthorized users
  const accessUrl = new URL("/access", request.url);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  // Match all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
