import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { CLIENT_SESSION, SESSION_TOKEN } from "@/lib/constants";
const secretKey = process.env.SESSION_SECRET;

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

      return payload;
    }
  } catch (error: unknown) {
    console.error("Error decrypting session:", error);
    return null;
  }
}

export async function createClientSession(userId: string, isVerified: boolean) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, isVerified, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_SESSION, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateClientSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(CLIENT_SESSION)?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  cookieStore.set(CLIENT_SESSION, session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSessions() {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_SESSION);
  cookieStore.delete(SESSION_TOKEN);
}
