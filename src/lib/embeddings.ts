
import OpenAI from 'openai';
import { logger } from './logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function embed(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    logger.error('Error creating embedding:', error);
    throw new Error('Failed to create embedding');
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts.map(text => text.trim()),
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    logger.error('Error creating batch embeddings:', error);
    throw new Error('Failed to create batch embeddings');
  }
}
