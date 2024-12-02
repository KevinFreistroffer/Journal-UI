import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { cookies } from "next/headers";

export async function GET() {
  console.log("GET /api/user/users");
  try {
    if (!process.env.API_URL) {
      throw new Error("API_URL or API_KEY is not set");
    }

    // Verify admin role

    // Fetch users from external server
    const headers = {
      Cookie: cookies().toString(),
    };
    console.log("headerszfdsafsa", headers);
    const response = await fetch(`${process.env.API_URL}/user/users`, {
      headers: {
        Cookie: cookies().toString(),
        "access-key":
          "c2a6795f1d2f3ae44653647b020136fca567321b17c957f5ad01b2b9a994035d",
      },
    });

    console.log(response.status);

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const users = await response.json();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
