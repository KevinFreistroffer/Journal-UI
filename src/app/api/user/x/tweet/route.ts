import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { TwitterApi } from "twitter-api-v2";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.X_BEARER_TOKEN) {
      throw new Error("X_BEARER_TOKEN is not set");
    }

    const twitterClient = new TwitterApi(process.env.X_BEARER_TOKEN);
    const readOnlyClient = twitterClient.readOnly;
    const user = await readOnlyClient.v2.userByUsername("FrikinFrak");

    await twitterClient.v2.tweet("Hello, this is a test.");
    return NextResponse.json({ message: "Tweet posted" }, { status: 200 });
    // const accessToken =
    //   request.cookies.get("x_access_token")?.value || process.env.X_ACCESS_TOKEN;
    //
    // if (!accessToken) {
    //   return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    // }

    // const { text } = await request.json();

    // if (!text) {
    //   return NextResponse.json(
    //     { error: "Tweet text is required" },
    //     { status: 400 }
    //   );
    // }

    // try {
    //
    //   // TODO: use fetch
    //   const response = await fetch("https://api.twitter.com/2/tweets", {
    //     method: "POST",
    //     body: JSON.stringify({ text }),
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "Content-Type": "application/json",
    //     },
    //   });
    //
    //   const data = await response.json();
    //
    //   return NextResponse.json(data);
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json(
      { error: "Failed to post tweet" },
      { status: 500 }
    );
  }
}
