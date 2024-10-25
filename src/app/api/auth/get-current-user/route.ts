import { NextResponse } from "next/server";
import { logout } from "@/actions/auth";
import { CLIENT_SESSION } from "@/lib/constants";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookie = cookies().get(CLIENT_SESSION)?.value;
    let session;

    if (cookie) {
      session = await decrypt(cookie);
    }

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "No session or no user ID" },
        { status: 400 }
      );
    }

    const userResponse = await fetch(
      `${process.env.API_URL}/user/${session.userId}`
    );

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get user" },
        { status: 500 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
