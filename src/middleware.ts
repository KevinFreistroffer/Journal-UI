import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { CLIENT_SESSION } from "@/lib/constants";

const protectedRoutes = [
  "/dashboard",
  "/categories",
  "/journal",
  "/journals",
  "/reminders",
  "/schedule",
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

  const isProtectedRoute = protectedRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );

  const isPublicRoute =
    publicRoutes.some(route => path === route) ||
    (path.startsWith("/login") &&
      request.nextUrl.searchParams.get("isVerified") !== null);

  const cookie = cookies().get(CLIENT_SESSION)?.value;
  let session;

  // const session = await decrypt(cookie);
  if (cookie) {
    session = await decrypt(cookie);
  }
  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!session?.userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!session.isVerified) {
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
    session?.userId &&
    session?.isVerified &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // return NextResponse.next();
}

export const config = {
  matcher: [
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
//     const response = await fetch(`${process.env.API_URL}/auth/authenticate`, {
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
