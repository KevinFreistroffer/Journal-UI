import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log("GETz /api/user/entry, req:", req.url);
  const id = searchParams.get("id");
  console.log("GETz /api/user/entry, params:", id);
  try {
    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Journal ID is required." },
        { status: 422 }
      );
    }

    const response = await fetch(`${process.env.API_URL}/user/journal/${id}`, {
      headers: {
        //     "Content-Type": "application/json",
        //     Accept: "application/json",
        Cookie: `session_token=${cookies().get("session_token")?.value || ""}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to get journal." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error getting journal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
