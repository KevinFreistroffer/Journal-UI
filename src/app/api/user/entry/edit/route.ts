import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(req: Request) {
  try {
    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userId, entryId, favorite } = body;

    const response = await fetch(`${process.env.API_URL}/user/entry/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `session_token=${cookies().get("session_token")?.value || ""}`,
      },
      body: JSON.stringify({
        userId,
        entryId,
        favorite,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to delete entrie(s)" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting entrie(s):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
