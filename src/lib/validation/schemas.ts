import { z } from 'zod'

// Common validation schemas
export const IdSchema = z.string().uuid('Invalid ID format')

export const EmailSchema = z.string().email('Invalid email address')

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
})

export const TimestampSchema = z.string().datetime('Invalid timestamp format')

// Chat API schemas
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'bot', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty').max(10000, 'Message too long'),
  text: z.string().optional(), // Legacy support
})

export const ChatRequestSchema = z.object({
  botId: z.string().min(1, 'Bot ID is required'),
  messages: z.array(ChatMessageSchema).min(1, 'At least one message is required'),
})

// Lead schemas
export const CreateLeadSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: EmailSchema.optional(),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  workspaceId: IdSchema.optional(),
  conversation: z.array(z.object({
    role: z.string(),
    text: z.string(),
  })).optional(),
  intentKeywords: z.array(z.string()).optional(),
  sourceUrl: z.string().url().optional(),
})

export const UpdateLeadSchema = z.object({
  status: z.enum(['new', 'incomplete', 'qualified', 'contacted', 'discarded']).optional(),
  notes: z.string().max(5000).optional(),
  assignedTo: IdSchema.optional(),
})

// Document schemas
export const CreateDocumentSchema = z.object({
  filename: z.string().min(1).max(255),
  content: z.string().min(1).max(1000000), // 1MB text limit
  contentType: z.string().default('text/plain'),
})

export const UpdateDocumentSchema = z.object({
  content: z.string().min(1).max(1000000),
  filename: z.string().min(1).max(255).optional(),
})

// Payment schemas
export const CreateOrderSchema = z.object({
  planId: z.enum(['basic', 'pro', 'ultra']),
  currency: z.enum(['INR', 'USD']).default('INR'),
  billingPeriod: z.enum(['monthly', 'yearly']).default('monthly'),
  userId: IdSchema,
  notes: z.record(z.any()).optional(),
})

export const PaymentVerificationSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  userId: IdSchema,
  planId: z.string(),
})

// User profile schemas
export const UpdateProfileSchema = z.object({
  chatbotName: z.string().max(255).optional(),
  welcomeMessage: z.string().max(1000).optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
})

// Query parameter schemas
export const LeadQuerySchema = z.object({
  workspaceId: z.string().optional(),
  status: z.enum(['new', 'incomplete', 'qualified', 'contacted', 'discarded']).optional(),
  ...PaginationSchema.shape,
})

export const DocumentQuerySchema = z.object({
  userId: IdSchema.optional(),
  status: z.enum(['pending', 'processing', 'completed', 'error']).optional(),
  ...PaginationSchema.shape,
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: TimestampSchema,
})

// Success response schemas
export const SuccessResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.literal(true),
  data: dataSchema,
  meta: z.object({
    timestamp: TimestampSchema,
    requestId: z.string(),
  }).optional(),
})

export const PaginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// Health check schema
export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: TimestampSchema,
  checks: z.object({
    database: z.enum(['pass', 'fail']),
    openai: z.enum(['pass', 'fail']),
    environment: z.enum(['pass', 'fail']),
  }),
  version: z.string(),
  uptime: z.number(),
})

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new Error(`Validation failed: ${message}`)
    }
    throw error
  }
}

// Async validation helper
export async function validateInputAsync<T>(schema: z.ZodSchema<T>, input: unknown): Promise<T> {
  try {
    return await schema.parseAsync(input)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new Error(`Validation failed: ${message}`)
    }
    throw error
  }
}

// Type exports for TypeScript
export type ChatRequest = z.infer<typeof ChatRequestSchema>
export type CreateLead = z.infer<typeof CreateLeadSchema>
export type UpdateLead = z.infer<typeof UpdateLeadSchema>
export type CreateDocument = z.infer<typeof CreateDocumentSchema>
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>
export type CreateOrder = z.infer<typeof CreateOrderSchema>
export type PaymentVerification = z.infer<typeof PaymentVerificationSchema>
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>
export type LeadQuery = z.infer<typeof LeadQuerySchema>
export type DocumentQuery = z.infer<typeof DocumentQuerySchema>
export type HealthCheck = z.infer<typeof HealthCheckSchema>
