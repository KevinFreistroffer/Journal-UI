import { NextResponse } from "next/server";
// import { connectToDatabase } from '@/lib/db';
// import User from '@/models/User';
// import { generateSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // const { userId } = await req.json();

    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "User ID is required" },
    //     { status: 400 }
    //   );
    // }

    // await connectToDatabase();

    // const user = await User.findById(userId);

    // if (!user) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    // if (!user.isVerified) {
    //   return NextResponse.json(
    //     { error: "User is not verified" },
    //     { status: 403 }
    //   );
    // }

    // const sessionToken = generateSessionToken();

    // user.sessionToken = sessionToken;
    // await user.save();

    // Instead set cookie.

    return NextResponse.json(
      { sessionToken: "session-token" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error requesting session token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
