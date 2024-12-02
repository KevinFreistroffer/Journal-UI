import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Config } from "@/lib/configs";
export async function GET() {
  return NextResponse.json({ helperText: "Hello World" });
}

export interface ISuccessResponse {
  fileId: string;
  filename: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    if (!Config.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    // Parse the request body
    const { userId, avatar } = await request.json();
    // Validate the input
    if (
      typeof userId !== "string" ||
      (avatar !== undefined && typeof avatar.data !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Prepare the update object
    const updateData: {
      userId: string;
      avatar?: string;
    } = { userId };

    if (avatar !== undefined) {
      updateData.avatar = avatar.data;
    }


    // Send the API request to /user/update
    const response = await fetch(`${Config.API_URL}/user/avatar/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const result = await response.json();
    /**
     * fileId: "6732741ff598d0858563387d"
     * filename: "avatar-67316785c8793fae8af74654-1731359775876.png"
     * message: "Avatar uploaded successfully"
     */

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
