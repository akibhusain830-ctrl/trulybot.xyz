'use client';

import { motion, easeOut } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

// --- Google Icon Component ---
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12.27V14.25H18.17C17.92 15.77 17.09 17.09 15.82 18V20.72H19.5C21.46 18.91 22.56 15.89 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12.27 23C15.22 23 17.68 22.09 19.5 20.72L15.82 18C14.76 18.66 13.59 19 12.27 19C9.37 19 6.88 17.13 5.95 14.5H2.18V17.32C3.99 20.67 7.84 23 12.27 23Z" fill="#34A853"/>
        <path d="M5.95 14.5C5.7 13.84 5.56 13.13 5.56 12.4C5.56 11.67 5.7 10.96 5.95 10.3L2.18 7.48C1.41 8.91 1 10.6 1 12.4C1 14.2 1.41 15.89 2.18 17.32L5.95 14.5Z" fill="#FBBC05"/>
        <path d="M12.27 5.8C13.75 5.8 15.04 6.31 16.03 7.23L19.58 3.86C17.68 2.05 15.22 1 12.27 1C7.84 1 3.99 3.33 2.18 7.48L5.95 10.3C6.88 7.67 9.37 5.8 12.27 5.8Z" fill="#EA4335"/>
    </svg>
);

export default function SignInPageContent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user) {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');
            
            // Prevent redirect loops - don't redirect to sign-in pages
            if (redirectTo && !redirectTo.includes('/sign-in') && !redirectTo.includes('%2Fsign-in')) {
                router.push(redirectTo);
            } else {
                // Default redirect to home, avoiding any sign-in URLs
                router.push('/');
            }
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

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push('/'); // Redirect to home
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            // Use canonical site URL if provided to avoid www/apex domain mismatch (PKCE cookie scope issue)
            const canonical = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
            const canonicalOrigin = new URL(canonical).origin;

            // Only redirect if we're actually on a different domain (not just different paths)
            const currentOrigin = window.location.origin;
            const currentPath = window.location.pathname + window.location.search;
            
            // Prevent redirect loops by checking if we're already trying to redirect to sign-in
            if (currentOrigin !== canonicalOrigin && !currentPath.includes('/sign-in')) {
                console.log('🔄 Redirecting to canonical domain:', { from: currentOrigin, to: canonicalOrigin });
                window.location.href = `${canonicalOrigin}/sign-in?redirect=${encodeURIComponent(currentPath)}`;
                return; // Stop here; flow continues on canonical host
            }

            // Log OAuth attempt for analytics
            console.log('🔐 Initiating Google OAuth sign-in', {
                timestamp: new Date().toISOString(),
                canonicalOrigin,
                userAgent: navigator.userAgent,
            });

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${canonicalOrigin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) {
                console.error('❌ Google OAuth initiation failed:', error);
                
                // Enhanced error messages for better user experience
                let userFriendlyMessage = 'Failed to sign in with Google. Please try again.';
                
                if (error.message.includes('Provider not found')) {
                    userFriendlyMessage = 'Google sign-in is temporarily unavailable. Please try again later or use email/password.';
                } else if (error.message.includes('redirect')) {
                    userFriendlyMessage = 'There was a configuration issue. Please refresh the page and try again.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    userFriendlyMessage = 'Network error. Please check your connection and try again.';
                }
                
                setError(userFriendlyMessage);
            } else {
                console.log('✅ Google OAuth initiated successfully');
                // OAuth redirect will happen automatically, so we keep loading state
                // Don't set loading to false here as user is being redirected
                return;
            }
        } catch (err: any) {
            console.error('❌ Google sign-in error:', err);
            
            let userFriendlyMessage = 'An unexpected error occurred. Please try again.';
            
            if (err?.message?.includes('popup')) {
                userFriendlyMessage = 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
            } else if (err?.message?.includes('network')) {
                userFriendlyMessage = 'Network error. Please check your internet connection.';
            }
            
            setError(userFriendlyMessage);
        } finally {
            // Only set loading to false if there was an error
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
                            <h1 className="text-3xl font-bold tracking-tighter">Welcome Back</h1>
                            <p className="text-slate-400 mt-2 text-sm">Sign in to continue to your dashboard.</p>
                        </motion.div>
                        {error && (
                            <motion.div variants={itemVariants} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </motion.div>
                        )}
                        <motion.div variants={itemVariants}>
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Connecting to Google...</span>
                                    </>
                                ) : (
                                    <>
                                        <GoogleIcon />
                                        <span>Continue with Google</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                        <form className="space-y-5" onSubmit={handleSignIn}>
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
                                    {loading ? "Signing In..." : "Sign In"}
                                </button>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
                <p className="text-center text-sm text-slate-500 mt-6">
                    Don&apos;t have an account? <Link href="/sign-up" className="font-semibold text-blue-400 hover:text-blue-300">Sign Up</Link>
                </p>
            </motion.div>
        </main>
    );
}
