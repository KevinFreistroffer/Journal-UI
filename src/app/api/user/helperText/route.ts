import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ helperText: "Hello World" });
}

export async function POST(request: Request) {
  return NextResponse.json({ helperText: "Hello World" });
}
