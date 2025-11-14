import { NextResponse } from "next/server";

// Replace this with real UPI fetching logic later
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unavailable' }, { status: 404 });
  }
  return NextResponse.json({ upi: "user@upi" });
}
