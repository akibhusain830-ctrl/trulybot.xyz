'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { AuthProvider } from '@/context/AuthContext' // Make sure this path is correct

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        window.location.reload()
      }
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
