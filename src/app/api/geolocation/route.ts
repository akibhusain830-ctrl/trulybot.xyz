import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { geo } = req;
  const country = geo?.country || 'US'; // Default to US if country is not found

  return NextResponse.json({ country });
}