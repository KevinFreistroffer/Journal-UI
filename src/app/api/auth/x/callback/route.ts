import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const codeVerifier = request.cookies.get("x_code_verifier")?.value;

  if (!code || !codeVerifier) {
    return NextResponse.json(
      { error: "Missing code or code verifier" },
      { status: 400 }
    );
  }

  try {
    if (
      !process.env.X_CLIENT_ID ||
      !process.env.X_CLIENT_SECRET ||
      !process.env.X_REDIRECT_URI
    ) {
      throw new Error(
        "X_CLIENT_ID, X_CLIENT_SECRET and X_REDIRECT_URI are not set"
      );
    }
    // TODO: use fetch instead
    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: process.env.X_CLIENT_ID,
          redirect_uri: process.env.X_REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      }
    );

    const data = await tokenResponse.json();

    if (tokenResponse.status !== 200) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 }
      );
    }

    const { token_type, expires_in, access_token, scope, refresh_token } = data;

    // In a real app, you'd store these tokens securely (e.g., in a database)
    // For this example, we'll just set them as cookies
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/tweet`
    );
    response.cookies.set("x_access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    response.cookies.set("x_refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
