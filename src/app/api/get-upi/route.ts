import { NextResponse } from "next/server";

// Replace this with real UPI fetching logic later
export async function GET() {
  return NextResponse.json({ upi: "user@upi" });
}
