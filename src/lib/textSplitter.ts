/**
 * A simple text splitter that breaks text into chunks of a specified size.
 * It tries to split by paragraphs first, then sentences, then words to keep chunks meaningful.
 *
 * @param text The input text to split.
 * @param chunkSize The approximate size of each chunk in characters.
 * @returns An array of text chunks.
 */
export function simpleTextSplitter(text: string, chunkSize = 1000): string[] {
  if (!text) return [];
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let currentChunk = '';

  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 1 > chunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If a single paragraph is larger than chunkSize, split it further
      if (paragraph.length > chunkSize) {
        const sentences = paragraph.split('. ');
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length + 2 > chunkSize) {
            chunks.push(sentenceChunk.trim());
            sentenceChunk = '';
          }
          sentenceChunk += sentence + '. ';
        }
        if (sentenceChunk) {
          chunks.push(sentenceChunk.trim());
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}