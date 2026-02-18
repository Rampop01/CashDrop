"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiBitcoincash } from "react-icons/si";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);

  const validateUsername = (val: string) => {
    setForm((f) => ({ ...f, username: val.toLowerCase() }));
    setUsernameValid(/^[a-z0-9_-]{3,20}$/.test(val.toLowerCase()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
              <SiBitcoincash className="text-black text-xl" />
            </div>
            <span className="text-2xl font-bold gradient-text">CashDrop</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Claim your username</h1>
          <p className="text-gray-400">Start receiving Bitcoin Cash instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Username</label>
            <div className="relative">
              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => validateUsername(e.target.value)}
                placeholder="satoshi"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                required
              />
              {usernameValid !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameValid ? (
                    <FaCheck className="text-green-400" />
                  ) : (
                    <span className="text-red-400 text-xs">Invalid</span>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              cashdrop.app/<span className="text-green-400">{form.username || "username"}</span>
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Display Name</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Satoshi Nakamoto"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                required
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !usernameValid}
            className="w-full py-3 rounded-xl gradient-green text-black font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Create Account <FaArrowRight />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-green-400 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
