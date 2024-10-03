import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NextApiRequest, NextApiResponse } from "next";
import { IUser } from "@/lib/interfaces";

export async function POST(
  request: Request,
  response: NextApiResponse<{ message: string; success: boolean; data?: IUser }>
) {
  try {
    // Parse the request body
    const { userId, category } = await request.json();

    // Get the query params
    const url = new URL(request.url || "");
    const returnUser = url.searchParams.get("returnUser");

    // Validate input
    if (!userId || !category) {
      return NextResponse.json(
        { message: "User ID and category name are required.", success: false },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.API_URL}/user/journal/category/create?${
        returnUser &&
        typeof returnUser === "string" &&
        ["true", "false"].includes(returnUser.toLowerCase())
          ? "returnUser=" + returnUser
          : ""
      }`,
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

    const body = await response.json();

    if (response.status === 200) {
      return NextResponse.json(
        {
          success: true,
          message: "Category created successfully.",
          data: body.data,
        },
        { status: 200 }
      );
    } else {
      NextResponse.json(
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
