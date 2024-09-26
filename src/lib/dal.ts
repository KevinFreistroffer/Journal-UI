"use server";

import { cache } from "react";
import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";

export const verifySession = cache(
  async (): Promise<{
    isAuth: boolean;
    userId: string | null;
  }> => {
    const cookie = cookies().get("client_session")?.value;
    const session = await decrypt(cookie);

    if (!session || !session.userId) {
      // return  redirect("/login");
      return { isAuth: false, userId: null };
    }

    return { isAuth: true, userId: session.userId as string };
  }
);
export const getUser = cache(async (userId: string) => {
  console.log("getUser called with userId", userId);

  try {
    if (!process.env.API_URL) {
      console.error("API_URL is not set");
      return null;
    }

    const response = await fetch(`${process.env.API_URL}/user/${userId}`);

    if (!response.ok) {
      console.error("Failed to fetch user");
      return null;
    } else {
      const body = await response.json();
      console.log("getUser got user", body.data);
      return body.data;
    }
  } catch (error: unknown) {
    console.log("Failed to fetch user", error);
    return null;
  }
});
