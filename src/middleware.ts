import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = checkAuth(request); // Implement this function based on your auth method

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};

function checkAuth(request: NextRequest): boolean {
  console.log("checkAuth");
  // Implement your auth check here
  // This could involve checking for a session cookie, JWT in headers, etc.
  // Return true if authenticated, false otherwise
  return false; // Placeholder
}
