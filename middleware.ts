/**
 * MIDDLEWARE - DISABLED FOR PROTOTYPE
 *
 * ETHICAL DESIGN NOTE:
 * The previous middleware implemented a demo access gate for the dashboard.
 * For the Outreach Window Planner prototype, we've chosen to remove technical
 * gating in favor of:
 *
 * 1. Clear UI disclaimers about org-only use
 * 2. Metadata that prevents search engine indexing
 * 3. Contextual framing throughout the application
 *
 * This decision was made to simplify the prototype while maintaining
 * ethical boundaries through design rather than technical enforcement.
 *
 * FUTURE CONSIDERATIONS:
 * A production deployment would implement proper authentication:
 * - NextAuth or similar for org verification
 * - Role-based access control
 * - Audit logging for accountability
 *
 * The gate is commented out but preserved for reference.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(
  _request: NextRequest
): ReturnType<typeof NextResponse.next> {
  // Prototype mode: no gating, pass through all requests
  return NextResponse.next();
}

export const config = {
  // Match nothing in prototype mode
  matcher: [],
};

/*
 * PREVIOUS IMPLEMENTATION (preserved for reference):
 *
 * const PUBLIC_ROUTES = ["/access", "/api/health"];
 * const STATIC_PATTERNS = ["/_next", "/favicon.ico", "/api/auth"];
 *
 * export function middleware(request: NextRequest) {
 *   const { pathname } = request.nextUrl;
 *
 *   if (STATIC_PATTERNS.some((pattern) => pathname.startsWith(pattern))) {
 *     return NextResponse.next();
 *   }
 *
 *   if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
 *     return NextResponse.next();
 *   }
 *
 *   const hasOrgAccessCookie = request.cookies.get("org_access")?.value === "1";
 *   const hasOrgAccessHeader = request.headers.get("x-org-access") === "1";
 *
 *   if (hasOrgAccessCookie || hasOrgAccessHeader) {
 *     return NextResponse.next();
 *   }
 *
 *   const accessUrl = new URL("/access", request.url);
 *   return NextResponse.redirect(accessUrl);
 * }
 */
