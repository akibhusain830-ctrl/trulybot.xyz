"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation'; // <-- Add this import

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter(); // <-- Add this line

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Check your email for confirmation!");
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (user) {
      // <-- Add this block to redirect on successful login
      router.push('/dashboard');
    } else {
      setMessage(error ? error.message : "Login failed!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl font-bold mb-4">Business Login / Signup</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={handleSignup} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign Up
        </button>
        <button onClick={handleLogin} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </div>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}