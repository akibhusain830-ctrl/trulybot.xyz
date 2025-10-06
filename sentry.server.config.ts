// This file configures the initialization of Sentry on the server side
let SentryServer: any

try {
  SentryServer = require('@sentry/nextjs')
} catch (e) {
  // Sentry not installed, use mock
  SentryServer = {
    init: () => {},
    httpIntegration: () => ({}),
    prismaIntegration: () => ({}),
    Integrations: {
      Http: class {},
    },
  }
}

SentryServer.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture 100% of the transactions, reduce in production!
  debug: process.env.NODE_ENV === 'development',
  
  // Configure error filtering
  beforeSend(event: any) {
    // Filter out expected errors
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.type === 'ChunkLoadError' || 
          error?.value?.includes('Loading chunk') ||
          error?.value?.includes('Loading CSS chunk')) {
        return null
      }
    }
    return event
  },
  
  // Performance monitoring
  integrations: [
    SentryServer.httpIntegration?.() || {},
    SentryServer.prismaIntegration?.() || {},
  ],
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
})