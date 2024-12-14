import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Config } from "@/lib/configs";
export async function PUT(req: Request) {
  try {
    if (!Config.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    const body: {
      userId: string;
      journalId: string;
      favorite?: boolean;
      categories?: string[];
    } = await req.json();
    const { userId, journalId, favorite, categories } = body;

    const cookieStore = await cookies();
    const cookie = cookieStore.get("session_token")?.value;

    const requestBody: any = {
      userId,
      journalId,
    };

    if (favorite !== undefined && favorite !== null) {
      requestBody.favorite = favorite;
    }

    if (categories !== undefined && categories !== null) {
      requestBody.categories = categories;
    }

    const response = await fetch(`${Config.API_URL}/user/journal/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `session_token=${cookie || ""}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();

      return NextResponse.json(
        { error: errorData.message || "Failed to delete journal(s)" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting journal(s):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
