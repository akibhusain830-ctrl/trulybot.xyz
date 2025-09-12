import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });
    return NextResponse.json({ data: completion.choices[0].message });
  } catch (error: any) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch response from OpenAI.' }, { status: 500 });
  }
}