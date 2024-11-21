import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Config } from "@/lib/configs";
export async function GET() {
  return NextResponse.json({ helperText: "Hello World" });
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
    const {
      userId,
      hasAcknowledgedHelperText,
      avatar,
      name,
      bio,
      company,
      location,
      website,
      sex,
    } = await request.json();

    // Validate the input
    if (
      typeof userId !== "string" ||
      (hasAcknowledgedHelperText !== undefined &&
        typeof hasAcknowledgedHelperText !== "boolean") ||
      (avatar !== undefined && typeof avatar !== "string") ||
      (name !== undefined && typeof name !== "string") ||
      (bio !== undefined && typeof bio !== "string") ||
      (company !== undefined && typeof company !== "string") ||
      (location !== undefined && typeof location !== "string") ||
      (website !== undefined && typeof website !== "string") ||
      (sex !== undefined && typeof sex !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Prepare the update object
    const updateData: {
      userId: string;
      hasAcknowledgedHelperText?: boolean;
      avatar?: string;
      name?: string;
      bio?: string;
      company?: string;
      location?: string;
      website?: string;
      sex?: string;
    } = { userId };

    if (hasAcknowledgedHelperText !== undefined) {
      updateData.hasAcknowledgedHelperText = hasAcknowledgedHelperText;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (name !== undefined) {
      updateData.name = name;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (company !== undefined) {
      updateData.company = company;
    }

    if (location !== undefined) {
      updateData.location = location;
    }

    if (website !== undefined) {
      updateData.website = website;
    }

    if (sex !== undefined) {
      updateData.sex = sex;
    }

    console.log(updateData);

    // Send the API request to /user/update
    console.log("Sending update request to", `${Config.API_URL}/user/update`);
    const response = await fetch(`${Config.API_URL}/user/update`, {
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
    console.log("result = ", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
