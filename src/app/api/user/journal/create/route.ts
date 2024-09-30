import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userId, title, entry, category } = body;
    console.log("Create journal request:", userId, title, entry, category);

    const response = await fetch(`${process.env.API_URL}/user/journal/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        userId,
        title,
        entry,
        category,
      }),
    });

    const data = await response.json();
    console.log("Create journal response:", data);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to create journal" },
        { status: response.status }
      );
    }

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
