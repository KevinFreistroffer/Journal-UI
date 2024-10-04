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
    const { userId, title, entry, category, favorite } = body;
    console.log(body);

    const response = await fetch(`${process.env.API_URL}/user/entry/create`, {
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
        favorite,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to create entrie" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
    // const body = await req.json();
    // const { userId, entryIds } = body;

    // if (!userId || !entryIds || !Array.isArray(entryIds)) {
    //   return NextResponse.json(
    //     { error: "Invalid request body" },
    //     { status: 400 }
    //   );
    // }

    // const response = await fetch(`${process.env.API_URL}/user/entry/delete`, {
    //   method: "DELETE",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //     Cookie: cookies().toString(),
    //   },
    //   body: JSON.stringify({ userId, entryIds }),
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return NextResponse.json(
    //     { error: errorData.message || "Failed to delete entrie(s)" },
    //     { status: response.status }
    //   );
    // }

    // const data = await response.json();
    // return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting entrie(s):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
