import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  console.log(
    "process.env.NEXT_PUBLIC_APP_URL",
    process.env.NEXT_PUBLIC_APP_URL
  );
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
    // TODO: use fetch instead
    const tokenResponse = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      null,
      {
        params: {
          code,
          grant_type: "authorization_code",
          client_id: process.env.X_CLIENT_ID,
          redirect_uri: process.env.X_REDIRECT_URI,
          code_verifier: codeVerifier,
        },
        auth: {
          username: process.env.X_CLIENT_ID!,
          password: process.env.X_CLIENT_SECRET!,
        },
      }
    );

    if (tokenResponse.status !== 200) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 }
      );
    }

    const data = tokenResponse.data as {
      token_type: string;
      expires_in: number;
      access_token: string;
      scope: string;
      refresh_token: string;
    };

    const { access_token, refresh_token } = data;
    console.log("access_token", access_token);
    console.log("refresh_token", refresh_token);
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

    console.log("SUCCESSFULLY AUTHENTICATED");

    return response;
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
