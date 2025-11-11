import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  // Simple readiness probe for Kubernetes
  // Returns 200 if app is ready to serve traffic
  return NextResponse.json(
    { ok: true },
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
