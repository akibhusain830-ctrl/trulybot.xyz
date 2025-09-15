import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { messages, userId } = await req.json()

  // ✅ Fetch documents for this user
  const { data: docs, error } = await supabase
    .from('documents')
    .select('content')
    .eq('user_id', userId)

  const context = docs?.map(d => d.content).join('\n\n') || ''

  // ✅ Inject context into system prompt
  const systemPrompt = {
    role: 'system',
    content: `You are a helpful assistant trained on the following user-provided documents:\n\n${context}\n\nAnswer based on this content when relevant.`,
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [systemPrompt, ...messages],
  })

  return NextResponse.json({ data: completion.choices[0].message })
}
