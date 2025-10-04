'use client'

import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session && window.location.pathname !== '/login') {
        window.location.href = '/login'
        return
      }
      setReady(true)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!ready) return null

  return <Component {...pageProps} />
}
