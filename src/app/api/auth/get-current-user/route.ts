import { NextResponse } from "next/server";
import { logout } from "@/actions/auth";
import { CLIENT_SESSION } from "@/lib/constants";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { Config } from "@/lib/configs";
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(CLIENT_SESSION)?.value;
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

    if (!Config.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    const userResponse = await fetch(
      `${Config.API_URL}/user/${session.userId}`
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
