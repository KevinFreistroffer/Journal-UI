import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/signup", "/"];

export async function middleware(request: NextRequest) {
  console.log("middleware");
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const cookie = cookies().get("client_session")?.value;

  let session;
  // const session = await decrypt(cookie);
  if (cookie) {
    session = await decrypt(cookie);
    console.log("middleware decrypt session", session);
  }

  if ((isProtectedRoute && !session) || !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("middleware path", path);
  console.log("isPublicRoute", isPublicRoute);
  console.log("session", session);
  console.log("session.userId", session?.userId);
  console.log(
    "!request.nextUrl.pathname.startsWith(/dashboard)",
    !request.nextUrl.pathname.startsWith("/dashboard")
  );

  if (
    isPublicRoute &&
    session &&
    session.userId &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    console.log("middleware redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/login", "/signup"],
  // matcher: "/dashboard/:path*",
};

// async function checkAuth(request: NextRequest): Promise<boolean> {
//   console.log("checkAuth");
//   // Implement your auth check here
//   // This could involve checking for a session cookie, JWT in headers, etc.
//   // Return true if authenticated, false otherwise

//   try {
//     // Get the authentication token from the request headers or cookies
//     console.log(request.cookies);
//     const token =
//       request.headers.get("Authorization") ||
//       request.cookies.get("session_token")?.value;

//     console.log("token", token);

//     if (!token) {
//       return false;
//     }

//     // Send a request to the /auth/authenticate endpoint
//     const response = await fetch(`${process.env.API_URL}/auth/authenticate`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     console.log("response", response.ok);

//     if (response.ok) {
//       console.log("authenticated!!!!!!!!!!!!!!!");
//       return true;
//     } else {
//       console.log("not authenticated!!!!!!!!!!!!!!!");
//       return false;
//     }
//   } catch (error) {
//     console.error("Authentication check failed:", error);
//     return false;
//   }
// }
