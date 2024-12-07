"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { CLIENT_SESSION, SESSION_TOKEN } from "@/lib/constants";
import { Config } from "./configs";

export const verifyClientSession = cache(
  async (): Promise<{
    isAuth: boolean;
    userId: string | null;
  }> => {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(CLIENT_SESSION)?.value;
      const session = await decrypt(cookie);

      if (!session || !session.userId) {
        // return  redirect("/login");
        return { isAuth: false, userId: null };
      }

      return { isAuth: true, userId: session.userId as string };
    } catch (error: unknown) {
      return {
        isAuth: false,
        userId: null,
      };
    }
  }
);

// verify the session cookie exists
export const verifyServerSession = cache(async (): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_TOKEN)?.value;

    return !!cookie;
  } catch (error: unknown) {
    console.error("Failed to verify server session", error);
    return false;
  }
});

export const getUser = cache(async () => {
  try {
    const SESSION_TOKEN = "session_token";
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_TOKEN)?.value;
    if (!sessionToken) {
      return null;
    }
    if (!Config.API_URL) {
      return null;
    }

    const session = await verifyClientSession();
    if (!session || !session.userId) {
      return null;
    }

    if (!Config.API_URL) {
      console.error("API_URL is not set");
      return null;
    }
    const response = await fetch(`${Config.API_URL}/user/${session.userId}`, {
      headers: { Cookie: cookies().toString() },
    });

    if (!response.ok) {
      console.error("Failed to fetch user");
      return null;
    } else {
      const body = await response.json();

      return body.data;
    }
  } catch (error: unknown) {
    console.error("Failed to fetch user", error);
    return null;
  }
});

export const getUserById = cache(async (userId: string) => {
  try {
    if (!Config.API_URL) {
      console.error("API_URL is not set");
      return null;
    }

    const response = await fetch(`${Config.API_URL}/user/${userId}`, {
      headers: { Cookie: cookies().toString() },
    });

    if (!response.ok) {
      console.error("Failed to fetch user");
      return null;
    } else {
      const body = await response.json();

      return body.data;
    }
  } catch (error: unknown) {
    console.error("Failed to fetch user", error);
    return null;
  }
});
