import { updateSession } from "@/utils/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // No Supabase cookies → no session to refresh, skip the auth round-trip
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protected/private routes
    "/profile/:path*",
    "/settings/:path*",
    "/friends/:path*",
    "/badges/:path*",
    "/banner/:path*",
    "/match-history/:path*",
    // Auth routes
    "/auth/:path*",
  ],
};
