import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CLIENT_SESSION } from "@/lib/constants";
import { decrypt } from "@/lib/session";

interface Session {
  userId: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      // Is this valid?
      const cookieStore = await cookies();
      const cookie = cookieStore.get(CLIENT_SESSION)?.value;
      let session;

      if (cookie) {
        session = await decrypt(cookie);
        if (typeof session?.userId !== "string") {
          return NextResponse.json(
            { error: "Invalid session format" },
            { status: 400 }
          );
        }

        userId = session.userId;
      }

      if (!session || !session.userId) {
        return NextResponse.json(
          { error: "No session or no user ID" },
          { status: 400 }
        );
      }
    }

    const response = await fetch(
      `${process.env.API_URL}/auth/send-verification-email/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: cookies().toString(),
        },
      }
    );

    if (!response.ok || response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to resend verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Verification email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
