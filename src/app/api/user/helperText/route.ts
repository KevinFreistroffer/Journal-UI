import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function GET() {
  return NextResponse.json({ helperText: "Hello World" });
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userId, hasAcknowledgedHelperText } = await request.json();

    // Validate the input
    if (
      typeof userId !== "string" ||
      typeof hasAcknowledgedHelperText !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Send the API request to /user/update
    const response = await fetch(`${process.env.API_URL}/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({ userId, hasAcknowledgedHelperText }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
