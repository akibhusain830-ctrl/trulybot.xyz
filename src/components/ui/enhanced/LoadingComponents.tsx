'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Simple spinner icon component as fallback
function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

// Enhanced Loading States
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'accent'
  className?: string
}

export function LoadingSpinner({ size = 'md', variant = 'primary', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-500',
    accent: 'text-purple-600'
  }

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    />
  )
}

// Skeleton Loading Components
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}

// Progressive Loading Component
interface ProgressiveImageProps {
  src: string
  alt: string
  placeholderSrc?: string
  className?: string
  quality?: number
}

export function ProgressiveImage({ 
  src, 
  alt, 
  placeholderSrc, 
  className = '',
  quality = 75 
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence>
        {!isLoaded && !isError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
          >
            {placeholderSrc ? (
              <Image 
                src={placeholderSrc} 
                alt={alt}
                fill
                className="object-cover blur-sm scale-110"
              />
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <LoadingSpinner size="lg" />
                <span className="text-sm text-gray-500">Loading image...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        loading="lazy"
      />

      {isError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">�</div>
            <p className="text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Content Loading
interface ContentLoaderProps {
  isLoading: boolean
  error?: string | null
  children: React.ReactNode
  skeleton?: React.ReactNode
  loadingText?: string
}

export function ContentLoader({ 
  isLoading, 
  error, 
  children, 
  skeleton,
  loadingText = 'Loading...' 
}: ContentLoaderProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-4xl mb-4">!</div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-gray-500 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {skeleton || (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-500">{loadingText}</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Lazy Loading Hook
export function useLazyLoading<T>(
  loadFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const result = await loadFn()
        
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [loadFn, ...deps])

  return { data, isLoading, error, refetch: () => setIsLoading(true) }
}

// Progress Bar Component
interface ProgressBarProps {
  progress: number
  showLabel?: boolean
  className?: string
  variant?: 'primary' | 'success' | 'warning' | 'error'
}

export function ProgressBar({ 
  progress, 
  showLabel = false, 
  className = '',
  variant = 'primary' 
}: ProgressBarProps) {
  const variantClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${variantClasses[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  )
}

// Infinite Scroll Hook
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean,
  threshold: number = 100
) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleScroll = async () => {
      if (
        !isLoading && 
        hasMore && 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold
      ) {
        setIsLoading(true)
        await loadMore()
        setIsLoading(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore, hasMore, threshold, isLoading])

  return { isLoading }
}