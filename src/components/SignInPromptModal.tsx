'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface SignInPromptModalProps {
  onClose: () => void;
}

export default function SignInPromptModal({ onClose }: SignInPromptModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] rounded-2xl p-8 text-center max-w-sm w-full border border-slate-800 shadow-2xl"
        >
          <h2 className="text-2xl font-bold">Please Sign In</h2>
          <p className="text-slate-400 mt-2 mb-6">
            You need to create an account or sign in to purchase a plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-colors text-center bg-slate-800 text-white hover:bg-slate-700"
            >
              Cancel
            </button>
            <Link
              href="/sign-in"
              className="w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-colors text-center bg-blue-600 text-white hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
