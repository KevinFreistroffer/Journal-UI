import {
  generateCodeVerifier,
  generateCodeChallenge,
  getAuthorizationUrl,
} from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const authorizationUrl = getAuthorizationUrl(codeChallenge);

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set("x_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return response;
}
