import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function GET() {
  return NextResponse.json({ helperText: "Hello World" });
}

export interface ISuccessResponse {
  message: string;
}

export async function DELETE(request: Request) {
  try {
    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }

    // Parse the request body
    const { userId, avatarId } = await request.json();

    // Validate the input
    if (typeof userId !== "string" || typeof avatarId !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Send the DELETE request to /user/avatar/delete
    const response = await fetch(`${process.env.API_URL}/user/avatar/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({ userId, avatarId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete avatar");
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
