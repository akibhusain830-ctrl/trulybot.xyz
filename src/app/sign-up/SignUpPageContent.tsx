'use client';

import { motion, easeOut } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

// --- Google Icon Component (optional) ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function SignUpPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const misconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('placeholder') ||
      String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).includes('placeholder');
    if (misconfigured) {
      setError('Sign up is temporarily unavailable due to configuration. Please try again later.');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [user, authLoading, router]);

  // Show loading while checking authentication state
  if (authLoading) {
    return (
      <main className="min-h-screen font-sans text-white bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render anything if user is authenticated (redirect is in progress)
  if (user) {
    return null;
  }

  const formVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect');
    const desiredNext = redirectParam && !redirectParam.includes('/sign-up') ? redirectParam : '/';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(desiredNext)}`
      }
    });

    if (error) {
      if (error.message && error.message.toLowerCase().includes('database error')) {
        try {
          const res = await fetch('/api/auth/admin-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, next: desiredNext })
          });
          if (res.ok) {
            setSuccess('Check your email to confirm your account before signing in!');
            setError('');
          } else {
            const data = await res.json();
            setError(data?.error || 'Sign up failed. Please try again.');
          }
        } catch (e: any) {
          setError(e?.message || 'Sign up failed. Please try again.');
        }
      } else {
        setError(error.message);
      }
    } else {
      setSuccess('Check your email to confirm your account before signing in!');
      // Don't auto-redirect - wait for email confirmation
    }
    setLoading(false);
  };

  // Google sign-up (actually just Google sign-in; account is created if not exists)
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      const canonical = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
      const canonicalOrigin = new URL(canonical).origin;

      if (window.location.origin !== canonicalOrigin) {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `${canonicalOrigin}/sign-up?redirect=${encodeURIComponent(currentPath)}`;
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      const desiredNext = redirectParam && !redirectParam.includes('/sign-up') ? redirectParam : '/';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${canonicalOrigin}/auth/callback?next=${encodeURIComponent(desiredNext)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen font-sans text-white bg-black flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-full bg-blue-900/40 rounded-full blur-[150px] pointer-events-none z-0 opacity-50" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: easeOut }} className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl shadow-blue-900/30">
          <motion.div variants={formVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter">Create Account</h1>
              <p className="text-slate-400 mt-2 text-sm">Sign up to get started.</p>
            </motion.div>
            {error && (
              <motion.div variants={itemVariants} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div variants={itemVariants} className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">{success}</p>
              </motion.div>
            )}
            <motion.div variants={itemVariants}>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors mb-6 disabled:opacity-50"
              >
                <GoogleIcon />
                {loading ? "Signing up..." : "Continue with Google"}
              </button>
            </motion.div>
            <form className="space-y-5" onSubmit={handleSignUp}>
              <motion.div variants={itemVariants}>
                <label className="text-sm font-medium text-slate-400" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="text-sm font-medium text-slate-400" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="mt-2 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link href="/sign-in" className="font-semibold text-blue-400 hover:text-blue-300">Sign In</Link>
        </p>
      </motion.div>
    </main>
  );
}
