import { NextResponse } from "next/server";
import { logout } from "@/actions/auth";

export async function GET(request: Request) {
  try {
    await logout();
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
