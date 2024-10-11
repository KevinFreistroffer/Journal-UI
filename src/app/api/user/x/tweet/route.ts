import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("x_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { text } = await request.json();

  if (!text) {
    return NextResponse.json(
      { error: "Tweet text is required" },
      { status: 400 }
    );
  }

  try {
    // TODO: use fetch
    const response = await axios.post(
      "https://api.twitter.com/2/tweets",
      { text },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json(
      { error: "Failed to post tweet" },
      { status: 500 }
    );
  }
}
