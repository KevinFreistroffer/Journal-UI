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
  const session = await verifySession();
  if (!session) return null;

  try {
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`
    );

    const user = await data.json();

    return user;
  } catch (error: unknown) {
    console.log("Failed to fetch user", error);
    return null;
  }
});
