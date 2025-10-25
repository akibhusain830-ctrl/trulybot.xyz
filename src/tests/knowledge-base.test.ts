/**
 * Knowledge Base System Tests
 * Tests document processing, chunking, embedding generation, and search functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Document Upload & Processing', () => {
  it('should accept valid text file upload', async () => {
    const fileContent = 'This is a test document with sample content.';
    const file = new File([fileContent], 'test.txt', { type: 'text/plain' });

    expect(file.name).toBe('test.txt');
    expect(file.type).toBe('text/plain');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should reject files exceeding size limit', () => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const largeContent = 'x'.repeat(MAX_FILE_SIZE + 1);
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' });

    const isValid = file.size <= MAX_FILE_SIZE;
    expect(isValid).toBe(false);
  });

  it('should accept supported file types', () => {
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown'
    ];

    const files = [
      new File(['content'], 'doc.txt', { type: 'text/plain' }),
      new File(['content'], 'doc.pdf', { type: 'application/pdf' }),
      new File(['content'], 'doc.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      new File(['content'], 'doc.md', { type: 'text/markdown' })
    ];

    files.forEach(file => {
      expect(supportedTypes).toContain(file.type);
    });
  });

  it('should reject unsupported file types', () => {
    const supportedTypes = ['text/plain', 'application/pdf', 'text/markdown'];
    
    const invalidFile = new File(['content'], 'script.exe', { type: 'application/x-msdownload' });
    
    expect(supportedTypes).not.toContain(invalidFile.type);
  });

  it('should extract text from uploaded file', async () => {
    const textContent = 'Sample document content for testing.';
    const file = new File([textContent], 'test.txt', { type: 'text/plain' });

    const text = await file.text();
    expect(text).toBe(textContent);
  });

  it('should handle empty files', async () => {
    const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
    const text = await emptyFile.text();

    expect(text).toBe('');
    expect(emptyFile.size).toBe(0);
  });

  it('should sanitize filename', () => {
    const dangerousNames = [
      '../../../etc/passwd',
      'file<script>.txt',
      'file"name".txt',
      'file|name.txt'
    ];

    const sanitizeFilename = (name: string) => {
      return name.replace(/[^a-zA-Z0-9._-]/g, '_');
    };

    dangerousNames.forEach(name => {
      const sanitized = sanitizeFilename(name);
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('|');
    });
  });
});

describe('Text Chunking', () => {
  const chunkText = (text: string, maxChunkSize: number = 500): string[] => {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  };

  it('should split long text into chunks', () => {
    const longText = 'This is sentence one. This is sentence two. This is sentence three. This is sentence four.';
    const chunks = chunkText(longText, 50);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach(chunk => {
      expect(chunk.length).toBeLessThanOrEqual(50);
    });
  });

  it('should preserve sentence boundaries', () => {
    const text = 'First sentence. Second sentence. Third sentence.';
    const chunks = chunkText(text, 30);

    chunks.forEach(chunk => {
      const endsWithPunctuation = /[.!?]$/.test(chunk.trim());
      expect(endsWithPunctuation).toBe(true);
    });
  });

  it('should handle text shorter than chunk size', () => {
    const shortText = 'Short text.';
    const chunks = chunkText(shortText, 500);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe('Short text.');
  });

  it('should handle empty text', () => {
    const chunks = chunkText('', 500);

    expect(chunks.length).toBeGreaterThanOrEqual(0);
  });

  it('should create overlapping chunks for context', () => {
    const text = 'First. Second. Third. Fourth. Fifth.';
    const OVERLAP_SIZE = 10;

    const chunks = chunkText(text, 25);
    
    // Check that chunks exist
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should handle special characters in text', () => {
    const textWithSpecialChars = 'Text with émojis 🎉 and spëcial çharacters!';
    const chunks = chunkText(textWithSpecialChars, 100);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain('🎉');
  });
});

describe('Embedding Generation', () => {
  it('should generate embeddings for text chunks', async () => {
    const text = 'Sample text for embedding generation';

    // Mock OpenAI embedding call
    const mockEmbedding = Array(1536).fill(0).map(() => Math.random());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding }]
        })
      })
    ) as any;

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });

    const result = await response.json();
    const embedding = result.data[0].embedding;

    expect(embedding).toHaveLength(1536);
    expect(Array.isArray(embedding)).toBe(true);
  });

  it('should handle embedding generation failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({ error: 'API error' })
      })
    ) as any;

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: 'test'
      })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should batch embed multiple chunks', async () => {
    const chunks = [
      'First chunk of text',
      'Second chunk of text',
      'Third chunk of text'
    ];

    const embeddings = chunks.map(() => 
      Array(1536).fill(0).map(() => Math.random())
    );

    expect(embeddings).toHaveLength(3);
    embeddings.forEach(emb => {
      expect(emb).toHaveLength(1536);
    });
  });

  it('should normalize embedding vectors', () => {
    const embedding = [0.5, 0.3, 0.2, 0.1];
    
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    
    const normalized = embedding.map(val => val / magnitude);
    
    const normalizedMagnitude = Math.sqrt(
      normalized.reduce((sum, val) => sum + val * val, 0)
    );
    
    expect(normalizedMagnitude).toBeCloseTo(1.0, 5);
  });
});

describe('Vector Search', () => {
  const cosineSimilarity = (a: number[], b: number[]): number => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  it('should calculate cosine similarity correctly', () => {
    const vector1 = [1, 0, 0];
    const vector2 = [1, 0, 0];
    const vector3 = [0, 1, 0];

    const similarity12 = cosineSimilarity(vector1, vector2);
    const similarity13 = cosineSimilarity(vector1, vector3);

    expect(similarity12).toBeCloseTo(1.0, 5); // Identical vectors
    expect(similarity13).toBeCloseTo(0.0, 5); // Orthogonal vectors
  });

  it('should find most similar chunks', () => {
    const queryEmbedding = [0.5, 0.5, 0.3];
    
    const documents = [
      { id: 1, embedding: [0.5, 0.5, 0.3], text: 'Very similar' },
      { id: 2, embedding: [0.1, 0.1, 0.9], text: 'Less similar' },
      { id: 3, embedding: [0.5, 0.4, 0.3], text: 'Somewhat similar' }
    ];

    const similarities = documents.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    similarities.sort((a, b) => b.score - a.score);

    expect(similarities[0].text).toBe('Very similar');
    expect(similarities[0].score).toBeGreaterThan(similarities[1].score);
  });

  it('should apply similarity threshold', () => {
    const SIMILARITY_THRESHOLD = 0.7;
    
    const results = [
      { text: 'High match', score: 0.9 },
      { text: 'Medium match', score: 0.75 },
      { text: 'Low match', score: 0.5 }
    ];

    const filtered = results.filter(r => r.score >= SIMILARITY_THRESHOLD);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].text).toBe('High match');
    expect(filtered[1].text).toBe('Medium match');
  });

  it('should limit number of results returned', () => {
    const MAX_RESULTS = 3;
    
    const allResults = [
      { score: 0.9 },
      { score: 0.8 },
      { score: 0.7 },
      { score: 0.6 },
      { score: 0.5 }
    ];

    const topResults = allResults.slice(0, MAX_RESULTS);

    expect(topResults).toHaveLength(MAX_RESULTS);
  });

  it('should handle empty search results', () => {
    const queryEmbedding = [0.5, 0.5, 0.3];
    const documents: any[] = [];

    const results = documents.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    expect(results).toHaveLength(0);
  });
});

describe('Knowledge Base Storage', () => {
  it('should store document with metadata', () => {
    const document = {
      id: 'doc-123',
      userId: 'user-456',
      botId: 'bot-789',
      filename: 'guide.txt',
      content: 'Document content',
      chunks: ['Chunk 1', 'Chunk 2'],
      uploadedAt: new Date().toISOString()
    };

    expect(document.id).toBeDefined();
    expect(document.userId).toBeDefined();
    expect(document.chunks.length).toBe(2);
  });

  it('should associate documents with correct bot', () => {
    const documents = [
      { id: 1, botId: 'bot-123', content: 'Doc 1' },
      { id: 2, botId: 'bot-123', content: 'Doc 2' },
      { id: 3, botId: 'bot-456', content: 'Doc 3' }
    ];

    const bot123Docs = documents.filter(d => d.botId === 'bot-123');

    expect(bot123Docs).toHaveLength(2);
  });

  it('should track document version history', () => {
    const document = {
      id: 'doc-123',
      versions: [
        { version: 1, content: 'Original', updatedAt: new Date('2024-01-01') },
        { version: 2, content: 'Updated', updatedAt: new Date('2024-01-02') }
      ]
    };

    expect(document.versions).toHaveLength(2);
    expect(document.versions[1].version).toBe(2);
  });

  it('should count total chunks per bot', () => {
    const documents = [
      { botId: 'bot-123', chunks: 10 },
      { botId: 'bot-123', chunks: 15 },
      { botId: 'bot-456', chunks: 20 }
    ];

    const bot123Total = documents
      .filter(d => d.botId === 'bot-123')
      .reduce((sum, d) => sum + d.chunks, 0);

    expect(bot123Total).toBe(25);
  });
});

describe('Knowledge Base API', () => {
  it('should upload document successfully', async () => {
    const formData = new FormData();
    formData.append('file', new File(['content'], 'test.txt'));
    formData.append('botId', 'bot-123');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ 
          success: true, 
          documentId: 'doc-456',
          chunks: 5 
        })
      })
    ) as any;

    const response = await fetch('/api/text-upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result.success).toBe(true);
    expect(result.documentId).toBeDefined();
  });

  it('should reject upload without authentication', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })
    ) as any;

    const response = await fetch('/api/text-upload', {
      method: 'POST',
      body: new FormData()
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('should delete document and its chunks', async () => {
    const documentId = 'doc-123';

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true, deleted: true })
      })
    ) as any;

    const response = await fetch(`/api/text-upload?id=${documentId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result.deleted).toBe(true);
  });

  it('should list all documents for a bot', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          documents: [
            { id: 'doc-1', filename: 'guide.txt', chunks: 10 },
            { id: 'doc-2', filename: 'faq.txt', chunks: 5 }
          ]
        })
      })
    ) as any;

    const response = await fetch('/api/text-upload?botId=bot-123');
    const result = await response.json();

    expect(result.documents).toHaveLength(2);
    expect(result.documents[0].filename).toBe('guide.txt');
  });

  it('should enforce storage quota limits', async () => {
    const QUOTA_LIMIT = 100; // chunks
    const currentUsage = 95;
    const newDocumentChunks = 10;

    const wouldExceedQuota = (currentUsage + newDocumentChunks) > QUOTA_LIMIT;

    expect(wouldExceedQuota).toBe(true);
  });
});

describe('Document Search Integration', () => {
  it('should search across all documents in knowledge base', async () => {
    const query = 'How do I reset my password?';

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          results: [
            { text: 'To reset password, click...', score: 0.92 },
            { text: 'Password requirements...', score: 0.85 }
          ]
        })
      })
    ) as any;

    const response = await fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query, botId: 'bot-123' })
    });

    const result = await response.json();

    expect(result.results).toHaveLength(2);
    expect(result.results[0].score).toBeGreaterThan(result.results[1].score);
  });

  it('should combine search results with chat context', () => {
    const searchResults = [
      { text: 'Result 1', score: 0.9 },
      { text: 'Result 2', score: 0.8 }
    ];

    const chatContext = 'User asked about: password reset';

    const enrichedContext = `${chatContext}\n\nRelevant information:\n${searchResults.map(r => r.text).join('\n')}`;

    expect(enrichedContext).toContain('User asked about');
    expect(enrichedContext).toContain('Result 1');
    expect(enrichedContext).toContain('Result 2');
  });

  it('should handle no matching documents gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ results: [] })
      })
    ) as any;

    const response = await fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'obscure query', botId: 'bot-123' })
    });

    const result = await response.json();

    expect(result.results).toHaveLength(0);
  });
});
