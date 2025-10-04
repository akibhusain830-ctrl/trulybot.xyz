import '@testing-library/jest-dom'

// Add fetch polyfill for Node.js environment
global.fetch = require('node-fetch')

// Note: Removed Request/Response polyfills due to conflicts with Next.js NextRequest/NextResponse
// API route tests are skipped until proper Next.js test environment is configured

// Mock environment variables for tests
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key'
process.env.SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'
process.env.OPENAI_API_KEY = 'sk-mock-openai-key'
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'mock-razorpay-key'
process.env.RAZORPAY_KEY_SECRET = 'mock-razorpay-secret'

// Mock OpenAI client
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mock OpenAI response'
              }
            }]
          })
        }
      },
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{
            embedding: new Array(1536).fill(0.1)
          }]
        })
      }
    }))
  }
})

// MSW setup temporarily disabled due to module resolution issues
// TODO: Fix MSW v2 compatibility with Jest
// import { beforeAll, afterEach, afterAll } from '@jest/globals'
// import { server } from './src/__mocks__/server'

// Establish API mocking before all tests.
// beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
// afterAll(() => server.close())

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.RAZORPAY_KEY_ID = 'test-razorpay-id'