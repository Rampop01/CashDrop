"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiBitcoincash } from "react-icons/si";
import { FaArrowRight } from "react-icons/fa";
import { HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
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
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
              <SiBitcoincash className="text-black text-xl" />
            </div>
            <span className="text-2xl font-bold gradient-text">CashDrop</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400">Log in to your CashDrop account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

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
                placeholder="Your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-green text-black font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Log in <FaArrowRight />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-green-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
