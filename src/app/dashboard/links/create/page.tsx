"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { HiOutlineLink } from "react-icons/hi2";

export default function CreateLinkPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    linkName: "",
    title: "",
    description: "",
    amountBCH: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/links/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          amountBCH: form.amountBCH ? parseFloat(form.amountBCH) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/dashboard/links");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up max-w-xl">
      <Link
        href="/dashboard/links"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
      >
        <FaArrowLeft /> Back to links
      </Link>

      <h1 className="text-2xl font-bold mb-2">Create Payment Link</h1>
      <p className="text-gray-400 text-sm mb-8">
        Each link gets a unique BCH address for payment tracking.
      </p>

      <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Link Name</label>
          <div className="relative">
            <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={form.linkName}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  linkName: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                }))
              }
              placeholder="coffee"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
              required
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            /{user.username}/<span className="text-green-400">{form.linkName || "link-name"}</span>
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Buy me a coffee"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Support my work with a small BCH donation..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Amount BCH (optional)</label>
          <input
            type="number"
            step="0.00000001"
            value={form.amountBCH}
            onChange={(e) => setForm((f) => ({ ...f, amountBCH: e.target.value }))}
            placeholder="0.01"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
          />
          <p className="text-xs text-gray-600 mt-1">Leave empty for any amount</p>
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
              Create Link <FaArrowRight />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
