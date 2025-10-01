// This file configures the initialization of Sentry for client-side JavaScript.
let SentryClient: any

try {
  SentryClient = require('@sentry/nextjs')
} catch (e) {
  // Sentry not installed, use mock
  SentryClient = {
    init: () => {},
    browserTracingIntegration: () => ({}),
    replayIntegration: () => ({}),
    BrowserTracing: class {},
  }
}

SentryClient.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture 100% of the transactions, reduce in production!
  debug: process.env.NODE_ENV === 'development',
  
  // Configure error filtering
  beforeSend(event: any) {
    // Filter out expected errors and third-party errors
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.type === 'ChunkLoadError' || 
          error?.value?.includes('Loading chunk') ||
          error?.value?.includes('Loading CSS chunk') ||
          error?.value?.includes('Script error') ||
          error?.stacktrace?.frames?.some((frame: any) => 
            frame.filename?.includes('extension') ||
            frame.filename?.includes('chrome-extension') ||
            frame.filename?.includes('moz-extension')
          )) {
        return null
      }
    }
    return event
  },
  
  // Session tracking
  autoSessionTracking: true,
  
  // Performance monitoring
  integrations: [
    SentryClient.browserTracingIntegration?.() || {},
    SentryClient.replayIntegration?.() || {},
  ],
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment and release tracking
  environment: process.env.NODE_ENV,
})