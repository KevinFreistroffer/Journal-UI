import "server-only";

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
    console.log("cookie", cookie);
    const session = await decrypt(cookie);
    console.log("data access layer: session", session);
    if (!session?.userId) {
      // return  redirect("/login");
      return { isAuth: false, userId: null };
    }

    return { isAuth: true, userId: session.userId as string };
  }
);
