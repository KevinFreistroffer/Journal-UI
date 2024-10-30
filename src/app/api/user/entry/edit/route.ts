import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(req: Request) {
  console.log("updating journal");
  try {
    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    const body: {
      userId: string;
      journalId: string;
      favorite: boolean;
    } = await req.json();
    const { userId, journalId, favorite } = body;
    console.log("body", body);

    const cookieStore = await cookies();
    const cookie = cookieStore.get("session_token")?.value;
    console.log({
      userId,
      journalId,
      favorite: favorite,
    });
    const response = await fetch(`${process.env.API_URL}/user/journal/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `session_token=${cookie || ""}`,
      },
      body: JSON.stringify({
        userId,
        journalId,
        favorite: favorite,
      }),
    });

    console.log(response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to delete journal(s)" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting journal(s):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
