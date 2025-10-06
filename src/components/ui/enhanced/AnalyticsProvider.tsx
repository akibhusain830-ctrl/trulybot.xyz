'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// Enhanced Analytics Context
interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
  trackPageView: (page: string, properties?: Record<string, any>) => void
  trackConversion: (type: string, value?: number, properties?: Record<string, any>) => void
  setUserProperties: (properties: Record<string, any>) => void
  userId?: string
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )



  const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    try {
      // Track to multiple analytics platforms
      await Promise.allSettled([
        // Supabase analytics
        supabase.from('analytics_events').insert({
          event_name: eventName,
          properties: properties || {},
          user_id: userId,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        }),

        // Google Analytics (if configured)
        typeof window !== 'undefined' && (window as any).gtag && 
        (window as any).gtag('event', eventName, {
          custom_parameter_1: properties?.category,
          custom_parameter_2: properties?.label,
          value: properties?.value,
          user_id: userId,
        }),

        // Custom analytics endpoint
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventName,
            properties: {
              ...properties,
              timestamp: Date.now(),
              url: window.location.href,
              userId,
            },
          }),
        }),
      ])

      console.log('📊 Event tracked:', eventName, properties)
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }, [userId, supabase])

  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    trackEvent('page_view', {
      page,
      ...properties,
    })
  }, [trackEvent])

  const trackConversion = (type: string, value?: number, properties?: Record<string, any>) => {
    trackEvent('conversion', {
      conversion_type: type,
      conversion_value: value,
      ...properties,
    })
  }

  const setUserProperties = useCallback(async (properties: Record<string, any>) => {
    try {
      // Update user properties in Supabase
      if (userId) {
        await supabase.from('user_properties').upsert({
          user_id: userId,
          properties,
          updated_at: new Date().toISOString(),
        })
      }

      // Set properties in Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          custom_map: properties,
          user_id: userId,
        })
      }
    } catch (error) {
      console.error('User properties update error:', error)
    }
  }, [userId, supabase])

  useEffect(() => {
    // Initialize analytics and get user
    const initializeAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Set user properties for analytics
        setUserProperties({
          userId: user.id,
          email: user.email,
          signUpDate: user.created_at,
        })
      }

      // Track initial page view
      trackPageView(window.location.pathname)
    }

    initializeAnalytics()
  }, [setUserProperties, trackPageView, supabase.auth])

  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackPageView,
      trackConversion,
      setUserProperties,
      userId,
    }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return context
}

// HOC for automatic page view tracking
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) {
  return function TrackedComponent(props: P) {
    const { trackPageView } = useAnalytics()

    useEffect(() => {
      trackPageView(pageName || Component.displayName || Component.name || 'Unknown')
    }, [trackPageView])

    return <Component {...props} />
  }
}

// Hook for conversion tracking
export function useConversionTracking() {
  const { trackConversion, trackEvent } = useAnalytics()

  return {
    trackSignup: (method?: string) => trackConversion('signup', undefined, { method }),
    trackPurchase: (value: number, plan?: string) => trackConversion('purchase', value, { plan }),
    trackTrialStart: (plan?: string) => trackConversion('trial_start', undefined, { plan }),
    trackTrialEnd: (converted: boolean, plan?: string) => 
      trackConversion('trial_end', undefined, { converted, plan }),
    trackFeatureUsage: (feature: string) => trackEvent('feature_usage', { feature }),
    trackChatMessage: (botId?: string) => trackEvent('chat_message', { botId }),
    trackWidgetInstall: (domain?: string) => trackConversion('widget_install', undefined, { domain }),
  }
}