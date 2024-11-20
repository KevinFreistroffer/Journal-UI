import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { CLIENT_SESSION, SESSION_TOKEN } from "@/lib/constants";
import { deleteSessions } from "@/lib/session";
import { experimental_jwksCache } from "jose";
import { FaSeedling } from "react-icons/fa";
import { Terminal, Waypoints } from "lucide-react";
import { Config } from "@/lib/configs";
const protectedRoutes = [
  "/dashboard",
  "/categories",
  "/journal",
  "/journals",
  "/reminders",
  "/schedule",
  "/settings/settings/profile",
  "/tweet",
];
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/recover-password",
  "/reset-password",
  "/terms",
  "/verify-account",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isPublicRoute =
    publicRoutes.some((route) => path === route) ||
    (path.startsWith("/login") &&
      request.nextUrl.searchParams.get("isVerified") !== null);
  const cookieStore = await cookies();

  const clientSessionCookie = cookieStore.get(CLIENT_SESSION)?.value;
  const serverSessionCookie = cookieStore.get(SESSION_TOKEN)?.value;
  let clientSession;

  // const session = await decrypt(cookie);
  if (clientSessionCookie) {
    clientSession = await decrypt(clientSessionCookie);
  }

  if (isProtectedRoute) {
    // If there's no server session, than data can't be fetched, so sign in again.
    if (!clientSession || !serverSessionCookie) {
      console.log("Redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (clientSession?.userId && !clientSession.isVerified) {
      console.log("Redirecting to /login?isVerified=false");
      return NextResponse.redirect(
        new URL("/login?isVerified=false", request.url)
      );
    }
  }

  /**
   * Why?
   * Instead trying the dashboard idea.
   */
  // if (
  //   isPublicRoute &&
  //   session?.userId &&
  //   !session?.isVerified &&
  //   !request.nextUrl.pathname.startsWith("/dashboard") &&
  //   !request.nextUrl.pathname.startsWith("/login")
  // ) {
  //
  //   return NextResponse.redirect(
  //     new URL("/login?isVerified=false", request.url)
  //   );
  // }

  // Commented this out 10/2 to add it to the public routes
  if (
    isPublicRoute &&
    clientSession?.userId &&
    clientSession?.isVerified &&
    serverSessionCookie &&
    !request.nextUrl.pathname.startsWith("/journal/write")
  ) {
    console.log("Redirecting to /journal/write");
    return NextResponse.redirect(new URL("/journal/write", request.url));
  }

  // return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/login",
    "/signup",
    "/journal/:path*",
    "/journals/:path",
    "/categories/:path*",
  ],
  // matcher: "/dashboard/:path*",
};

// async function checkAuth(request: NextRequest): Promise<boolean> {
//   ;
//   // Implement your auth check here
//   // This could involve checking for a session cookie, JWT in headers, etc.
//   // Return true if authenticated, false otherwise

//   try {
//     // Get the authentication token from the request headers or cookies
//     ;
//     const token =
//       request.headers.get("Authorization") ||
//       request.cookies.get("API_AUTHORIZATION_TOKEN")?.value;

//     ;

//     if (!token) {
//       return false;
//     }

//     // Send a request to the /auth/authenticate endpoint
//     const response = await fetch(`${Config.API_URL}/auth/authenticate`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     ;

//     if (response.ok) {
//       ;
//       return true;
//     } else {
//       ;
//       return false;
//     }
//   } catch (error) {
//     console.error("Authentication check failed:", error);
//     return false;
//   }
// }
