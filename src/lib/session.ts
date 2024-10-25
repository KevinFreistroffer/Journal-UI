import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { CLIENT_SESSION, SESSION_TOKEN } from "@/lib/constants";
const secretKey = process.env.SESSION_SECRET;
console.log("secretKey", secretKey);
const encodedKey = new TextEncoder().encode(secretKey?.toString());

export async function encrypt(payload: {
  userId: string;
  isVerified: boolean;
  expiresAt: Date;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (session) {
      const { payload } = await jwtVerify(session, encodedKey, {
        algorithms: ["HS256"],
      });
      console.log("decrypted() DECRYPTED session", payload);
      return payload;
    }
  } catch (error: unknown) {
    console.error("Error decrypting session:", error);
    return null;
  }
}

export async function createSession(userId: string, isVerified: boolean) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, isVerified, expiresAt });
  console.log("createSession() session", session);
  cookies().set(CLIENT_SESSION, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateSession() {
  const session = cookies().get(CLIENT_SESSION)?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  cookies().set(CLIENT_SESSION, session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export function deleteSession() {
  cookies().delete(CLIENT_SESSION);
  cookies().delete(SESSION_TOKEN);
}
