import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface Chunk {
  documentId: string;
  title: string;
  url?: string | null; // Changed to allow null
  content: string;
  score: number;
}

interface AnswerParams {
  userMessage: string;
  chunks: Chunk[];
}

export async function generateAnswerFromDocs(params: AnswerParams) {
  const { userMessage, chunks } = params;

  const contextBlocks = chunks.map(c => {
    const snippet = c.content.slice(0, 800);
    return `[Doc: ${c.title} | Score: ${c.score.toFixed(2)}]\n${snippet}`;
  }).join('\n---\n');

  const system = `You answer ONLY using DOCUMENT CONTEXT. 
If the answer is not in the context, respond exactly: "I don’t find that in the stored documents."
No hallucinations. Concise and direct.`;

  const prompt = `DOCUMENT CONTEXT:
---
${contextBlocks}
---
USER QUESTION:
${userMessage}

If answerable from context, answer. Otherwise output the exact fallback sentence.`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ]
  });

  const modelResponse = completion.choices[0]?.message?.content?.trim() || '';
  const indicatesNoAnswer = /i don.?t find that in the stored documents/i.test(modelResponse);

  const usedDocIds = new Set<string>();
  const sources = [];
  for (const c of chunks) {
    if (!usedDocIds.has(c.documentId)) {
      usedDocIds.add(c.documentId);
      sources.push({
        title: c.title,
        docId: c.documentId,
        url: c.url || undefined,
        snippet: c.content.slice(0, 260)
      });
    }
    if (sources.length >= 4) break;
  }

  return {
    text: modelResponse,
    sources: indicatesNoAnswer ? [] : sources,
    indicatesNoAnswer
  };
}
