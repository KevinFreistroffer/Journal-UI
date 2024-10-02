import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userId, category } = await request.json();

    // Validate input
    if (!userId || !category) {
      return NextResponse.json(
        { message: "User ID and category name are required.", success: false },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.API_URL}/user/journal/category/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: cookies().toString(),
        },
        body: JSON.stringify({ userId, category }),
      }
    );

    console.log("response", response);

    const body = await response.json();
    console.log("body", body);

    if (response.status === 200) {
      return NextResponse.json(
        { success: true, message: "Category created successfully." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to create category." },
        { status: 500 }
      );
    }

    // Create a new category
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
