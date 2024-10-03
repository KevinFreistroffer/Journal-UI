"use server";

import { cache } from "react";
import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { CLIENT_SESSION } from "@/lib/constants";

export const verifySession = cache(
  async (): Promise<{
    isAuth: boolean;
    userId: string | null;
  }> => {
    try {
      const cookie = cookies().get(CLIENT_SESSION)?.value;
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
export const getUser = cache(async () => {
  try {
    const session = await verifySession();

    if (!session) {
      return null;
    }

    if (!process.env.API_URL) {
      console.error("API_URL is not set");
      return null;
    }

    const response = await fetch(
      `${process.env.API_URL}/user/${session.userId}`,
      {
        headers: { Cookie: cookies().toString() },
      }
    );

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
    if (!process.env.API_URL) {
      console.error("API_URL is not set");
      return null;
    }

    const response = await fetch(`${process.env.API_URL}/user/${userId}`, {
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
