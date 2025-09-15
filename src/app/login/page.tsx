'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/')
    })
  }, [router])

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      router.push('/')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-slate-900 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Sign Up'}</h1>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 border border-slate-700"
        />
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 border border-slate-700"
        />
        {error && <div className="text-red-400">{error}</div>}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full p-3 bg-blue-600 rounded hover:bg-blue-700"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full p-2 text-sm text-slate-400 hover:underline"
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  )
}
