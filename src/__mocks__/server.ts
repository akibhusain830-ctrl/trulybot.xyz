import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock API handlers
export const handlers = [
  // Mock Supabase auth
  http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      }
    })
  }),

  // Mock OpenAI API
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{
        message: {
          content: 'This is a mock AI response'
        }
      }]
    })
  }),

  // Mock embeddings
  http.post('https://api.openai.com/v1/embeddings', () => {
    return HttpResponse.json({
      data: [{
        embedding: new Array(1536).fill(0.1)
      }]
    })
  }),

  // Mock internal APIs
  http.get('/api/leads', () => {
    return HttpResponse.json({
      data: [],
      page: 1,
      pageSize: 10,
      total: 0
    })
  }),

  http.post('/api/chat', () => {
    return HttpResponse.json({
      reply: 'Test chat response'
    })
  }),
]

export const server = setupServer(...handlers)
