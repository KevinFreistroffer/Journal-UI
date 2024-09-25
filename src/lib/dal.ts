"use server";

import { cache } from "react";
import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { IUser } from "@/lib/interfaces";

export const verifySession = cache(
  async (): Promise<{
    isAuth: boolean;
    user: IUser | null;
  }> => {
    const cookie = cookies().get("client_session")?.value;
    console.log("verifySession cookie", cookie);
    const session = await decrypt(cookie);

    console.log("verifySession session", session);
    if (!session || !(session.user as IUser)._id) {
      // return  redirect("/login");
      return { isAuth: false, user: null };
    }

    return { isAuth: true, user: session.user as IUser };
  }
);
