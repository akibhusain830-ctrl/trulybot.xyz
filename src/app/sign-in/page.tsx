'use client'

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Google Icon Component ---
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12.27V14.25H18.17C17.92 15.77 17.09 17.09 15.82 18V20.72H19.5C21.46 18.91 22.56 15.89 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12.27 23C15.22 23 17.68 22.09 19.5 20.72L15.82 18C14.76 18.66 13.59 19 12.27 19C9.37 19 6.88 17.13 5.95 14.5H2.18V17.32C3.99 20.67 7.84 23 12.27 23Z" fill="#34A853"/>
        <path d="M5.95 14.5C5.7 13.84 5.56 13.13 5.56 12.4C5.56 11.67 5.7 10.96 5.95 10.3L2.18 7.48C1.41 8.91 1 10.6 1 12.4C1 14.2 1.41 15.89 2.18 17.32L5.95 14.5Z" fill="#FBBC05"/>
        <path d="M12.27 5.8C13.75 5.8 15.04 6.31 16.03 7.23L19.58 3.86C17.68 2.05 15.22 1 12.27 1C7.84 1 3.99 3.33 2.18 7.48L5.95 10.3C6.88 7.67 9.37 5.8 12.27 5.8Z" fill="#EA4335"/>
    </svg>
);

export default function SignInPage() {
    const router = useRouter();
    const formVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.42, 0, 1, 1] } } };

    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault();
        router.push('/');
    };

    return (
        <main className="min-h-screen font-sans text-white bg-black flex items-center justify-center p-6">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-900/40 rounded-full blur-[150px] pointer-events-none z-0 opacity-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.42, 0, 1, 1] }} className="relative z-10 w-full max-w-md">
                <div className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl shadow-blue-900/30">
                    <motion.div variants={formVariants} initial="hidden" animate="visible">
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <h1 className="text-3xl font-bold tracking-tighter">Welcome Back</h1>
                            <p className="text-slate-400 mt-2 text-sm">Sign in to continue to your dashboard.</p>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <a href="#" className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors mb-6">
                                <GoogleIcon />
                                Continue with Google
                            </a>
                        </motion.div>
                        <form className="space-y-5" onSubmit={handleSignIn}>
                            <motion.div variants={itemVariants}>
                                <label className="text-sm font-medium text-slate-400" htmlFor="email">Email</label>
                                <input id="email" type="email" placeholder="you@example.com" required className="mt-2 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="text-sm font-medium text-slate-400" htmlFor="password">Password</label>
                                <input id="password" type="password" placeholder="••••••••" required className="mt-2 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
                            </motion.div>
                            <motion.div variants={itemVariants} className="pt-2">
                                <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                                    Sign In
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
