// src/app/api/dashboard-stats/route.ts

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// This function runs when your dashboard page requests data.
export async function GET() {
  try {
    // In the future, you will get real data from your database here.
    // For now, we send back realistic sample data.
    const sampleData = {
      totalConversations: Math.floor(Math.random() * 5000) + 1000,
      resolutionRate: Math.floor(Math.random() * 10) + 88,
      avgResponseTime: (Math.random() * 2 + 1).toFixed(1),
    };

    return NextResponse.json(sampleData);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}