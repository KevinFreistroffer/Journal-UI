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

async function checkAuth(request: NextRequest): Promise<boolean> {
  console.log("checkAuth");
  // Implement your auth check here
  // This could involve checking for a session cookie, JWT in headers, etc.
  // Return true if authenticated, false otherwise

  try {
    // Get the authentication token from the request headers or cookies
    const token =
      request.headers.get("Authorization") ||
      request.cookies.get("user")?.value;

    console.log("token", token);

    if (!token) {
      return false;
    }

    // Send a request to the /auth/authenticate endpoint
    const response = await fetch(`${process.env.API_URL}/auth/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("response", response);

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
}
