import { openai } from './openai'; // Uses your existing OpenAI client

const MODEL = 'text-embedding-3-small';
const DIMENSIONS = 1536; // Must match the model's output and your DB column

// Simple in-memory cache to avoid re-embedding the same text within a short period.
// For a production system, a more persistent cache like Redis would be better.
const cache = new Map<string, number[]>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Creates a vector embedding from a text string using the OpenAI API.
 * @param text The text to embed.
 * @returns A promise that resolves to an array of numbers (the vector embedding).
 */
export async function embed(text: string): Promise<number[]> {
  // Return cached value if it exists and is not expired
  if (cache.has(text) && (cacheExpiry.get(text) || 0) > Date.now()) {
    return cache.get(text)!;
  }

  // Clean up the text by removing newlines and excessive whitespace
  const cleanedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    const response = await openai.embeddings.create({
      model: MODEL,
      input: cleanedText,
      dimensions: DIMENSIONS,
    });

    if (!response.data[0]?.embedding) {
      throw new Error('Invalid response from OpenAI API: no embedding found.');
    }

    const embedding = response.data[0].embedding;

    // Store in cache
    cache.set(text, embedding);
    cacheExpiry.set(text, Date.now() + CACHE_DURATION_MS);

    return embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    // Depending on the use case, you might want to throw the error
    // or return a zero-vector as a fallback.
    throw new Error('Failed to create text embedding.');
  }
}