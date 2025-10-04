import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

// Mock OpenAI
jest.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'This is a test response'
            }
          }]
        })
      }
    }
  }
}))

// Mock embedding
jest.mock('@/lib/embedding', () => ({
  embed: jest.fn().mockResolvedValue(new Array(1536).fill(0.1))
}))

describe.skip('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle valid chat request', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        botId: 'demo',
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ]
      })
    })

    const response = await POST(request)
    const data = await response.text()

    expect(response.status).toBe(200)
    expect(data).toBeTruthy()
  })

  it('should reject invalid request without botId', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('botId is required')
  })

  it('should reject empty messages array', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        botId: 'demo',
        messages: []
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('messages array required')
  })

  it('should handle malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid JSON body')
  })
})