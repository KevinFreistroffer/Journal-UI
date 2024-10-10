import { NextResponse } from "next/server";
import { logout } from "@/actions/auth";

export async function GET(request: Request) {
  console.log(request.headers.get("Cookie"));
  try {
    await logout();
    // return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
