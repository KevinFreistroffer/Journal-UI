import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function GET() {
  return NextResponse.json({ helperText: "Hello World" });
}

export async function POST(request: Request) {
  try {
    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Server Error. Please try again later." },
        { status: 500 }
      );
    }
    console.log("API /user/update POST");
    // Parse the request body
    const { userId, hasAcknowledgedHelperText, avatar } = await request.json();
    console.log("userId", userId);

    // Validate the input
    if (
      typeof userId !== "string" ||
      (hasAcknowledgedHelperText !== undefined &&
        typeof hasAcknowledgedHelperText !== "boolean") ||
      (avatar !== undefined && typeof avatar !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Prepare the update object
    const updateData: {
      userId: string;
      hasAcknowledgedHelperText?: boolean;
      avatar?: string;
    } = { userId };

    if (hasAcknowledgedHelperText !== undefined) {
      updateData.hasAcknowledgedHelperText = hasAcknowledgedHelperText;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    // Send the API request to /user/update
    console.log(
      "Sending update request to",
      `${process.env.API_URL}/user/update`
    );
    const response = await fetch(`${process.env.API_URL}/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(updateData),
    });
    console.log("Response:", response);
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
