import { NextResponse } from "next/server";
import { logout } from "@/actions/auth";
import { CLIENT_SESSION } from "@/lib/constants";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(CLIENT_SESSION)?.value;

    if (!cookie) {
      return NextResponse.json({ error: "No cookie" }, { status: 400 });
    }

    const session = await decrypt(cookie);

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "No session or no user ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
