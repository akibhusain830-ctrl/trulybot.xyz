'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // Adjust if needed

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth fields
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  // UPI update fields
  const [upi, setUpi] = useState(""); // Will be fetched from DB
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [newUpi, setNewUpi] = useState("");

  // Fetch user info and UPI on mount
  useEffect(() => {
    async function fetchUserAndUpi() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setEmail(data?.user?.email ?? "");
      // Fetch UPI from your backend
      const upiResp = await fetch("/api/get-upi");
      const upiData = await upiResp.json();
      setUpi(upiData.upi ?? "");
      setLoading(false);
    }
    fetchUserAndUpi();
  }, []);

  // Handle email update (future logic)
  function handleEmailUpdate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Email update: Not implemented yet.");
  }

  // Handle password update (works)
  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage(error.message);
    else {
      setMessage("Password updated!");
      setNewPassword("");
    }
  }

  // Placeholder for delete
  async function handleDeleteAccount() {
    setMessage("Account deletion must be done by admin or backend API.");
  }

  // UPI update logic
  async function saveUpi() {
    setMessage("");
    if (!/^[\w.\-]+@[\w.\-]+$/.test(newUpi)) {
      setMessage("Enter a valid UPI ID (e.g. yourname@bank).");
      return;
    }
    const resp = await fetch("/api/update-upi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upi: newUpi }),
    });
    if (resp.ok) {
      setUpi(newUpi);
      setShowUpiModal(false);
      setMessage("UPI updated!");
    } else {
      const err = await resp.json();
      setMessage(err.error || "Failed to update UPI.");
    }
  }

  const billing = {
    plan: "Pro",
    paymentMethod: upi ? `UPI: ${upi}` : "No UPI set",
    paymentHistory: [
      { month: "Sep 2025", amount: "₹299", status: "Paid" }
    ]
  };

  const EyeIcon = (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const EyeOffIcon = (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.83 21.83 0 0 1 5.06-6.06"/>
      <path d="M1 1l22 22"/>
      <path d="M9.53 9.53A3 3 0 1 0 12 15a3 3 0 0 0-2.47-5.47"/>
    </svg>
  );

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <div className="p-8 text-white">Not signed in.</div>;

  return (
    <div className="flex flex-col items-center gap-12 py-12 bg-black min-h-screen text-white">
      {/* Account Settings */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900/70 rounded-2xl p-8 w-full max-w-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        <form className="flex flex-col gap-6" onSubmit={handleEmailUpdate}>
          <div>
            <label className="block mb-1 text-sm font-medium">Email address</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-800 text-white px-4 py-2 rounded outline-none"
              />
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full bg-slate-800 text-white px-4 py-2 rounded outline-none"
                placeholder="New email"
              />
              <button
                type="submit"
                className="bg-blue-600 px-4 py-2 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
                disabled={!newEmail}
              >
                Update
              </button>
            </div>
          </div>
        </form>
        <form className="flex flex-col gap-6 mt-4" onSubmit={handlePasswordUpdate}>
          <div>
            <label className="block mb-1 text-sm font-medium">Change Password</label>
            <div className="flex gap-2">
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded pr-10 outline-none"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-blue-400"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? EyeIcon : EyeOffIcon}
                </button>
              </div>
              <button
                type="submit"
                className="bg-blue-600 px-4 py-2 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
                disabled={!newPassword}
              >
                Change
              </button>
            </div>
          </div>
        </form>
        <div className="mt-8">
          <button
            className="bg-red-600 px-4 py-2 rounded text-white font-semibold hover:bg-red-700 transition-colors"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
        {message && (
          <div className="mt-4 text-sm text-yellow-400">{message}</div>
        )}
      </section>
      {/* Billing & Subscription */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900/70 rounded-2xl p-8 w-full max-w-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Billing &amp; Subscription</h2>
        <div className="mb-4 flex flex-row items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-400">Current Plan</div>
            <div>
              <span className="inline-block bg-blue-700 px-3 py-1 text-white text-xs rounded-full font-semibold">{billing.plan}</span>
            </div>
          </div>
          <Link
            href="/#pricing"
            className="bg-green-600 px-4 py-2 rounded text-white font-semibold hover:bg-green-700 transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <div>
            <div className="text-sm font-medium text-slate-400">Payment Method</div>
            <div className="font-mono text-lg">{billing.paymentMethod}</div>
          </div>
          <button
            className="bg-blue-600 px-4 py-2 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
            onClick={() => {
              setNewUpi(upi);
              setShowUpiModal(true);
              setMessage("");
            }}
          >
            Update
          </button>
        </div>
        <div>
          <div className="text-sm font-medium text-slate-400 mb-1">Payment History</div>
          <div className="rounded-lg bg-slate-800 divide-y divide-slate-700">
            {billing.paymentHistory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3">
                <div>{item.month}</div>
                <div>{item.amount}</div>
                <div className={`font-semibold ${item.status === "Paid" ? "text-green-500" : "text-yellow-400"}`}>{item.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for UPI update */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-8 max-w-sm w-full flex flex-col gap-4 shadow-xl">
            <h3 className="text-xl font-bold mb-2">Update UPI ID</h3>
            <input
              type="text"
              value={newUpi}
              onChange={e => setNewUpi(e.target.value)}
              className="w-full bg-slate-800 text-white px-4 py-2 rounded outline-none"
              placeholder="yourupi@bank"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveUpi}
                className="bg-blue-600 px-4 py-2 rounded text-white font-semibold hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowUpiModal(false)}
                className="bg-slate-700 px-4 py-2 rounded text-white font-semibold hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
            {message && (
              <div className="text-sm text-yellow-400">{message}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}