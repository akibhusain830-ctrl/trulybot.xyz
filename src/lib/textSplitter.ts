/**
 * A simple text splitter that breaks text into chunks of a specified size.
 * It tries to split by paragraphs first, then sentences, then words to keep chunks meaningful.
 *
 * @param text The input text to split.
 * @param chunkSize The approximate size of each chunk in characters.
 * @returns An array of text chunks.
 */
export function simpleTextSplitter(text: string, chunkSize = 1000, overlap = 200): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;
    
    // If we're not at the end of the text, try to break at a sentence or word boundary
    if (end < text.length) {
      // Look for sentence endings first
      const sentenceEnd = text.lastIndexOf('.', end);
      const questionEnd = text.lastIndexOf('?', end);
      const exclamationEnd = text.lastIndexOf('!', end);
      
      const maxSentenceEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd);
      
      if (maxSentenceEnd > start + chunkSize * 0.5) {
        end = maxSentenceEnd + 1;
      } else {
        // Fall back to word boundary
        const wordEnd = text.lastIndexOf(' ', end);
        if (wordEnd > start + chunkSize * 0.5) {
          end = wordEnd;
        }
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position with overlap
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}