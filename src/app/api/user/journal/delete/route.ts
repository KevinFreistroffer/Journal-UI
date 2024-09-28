import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(req: Request) {
  try {
    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userId, journalIds } = body;
    console.log("Delete journal request:", { userId, journalIds });
    const response = await fetch(`${process.env.API_URL}/user/journal/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `session_token=${cookies().get("session_token")?.value || ""}`,
      },
      body: JSON.stringify({
        userId,
        journalIds,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to delete journal(s)" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Delete journal response:", data);
    return NextResponse.json(data, { status: 200 });
    // const body = await req.json();
    // const { userId, journalIds } = body;

    // if (!userId || !journalIds || !Array.isArray(journalIds)) {
    //   return NextResponse.json(
    //     { error: "Invalid request body" },
    //     { status: 400 }
    //   );
    // }

    // const response = await fetch(`${process.env.API_URL}/user/journal/delete`, {
    //   method: "DELETE",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //     Cookie: cookies().toString(),
    //   },
    //   body: JSON.stringify({ userId, journalIds }),
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return NextResponse.json(
    //     { error: errorData.message || "Failed to delete journal(s)" },
    //     { status: response.status }
    //   );
    // }

    // const data = await response.json();
    // return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting journal(s):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
