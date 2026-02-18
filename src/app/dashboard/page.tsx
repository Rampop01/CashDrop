"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineLink, HiOutlineBolt, HiOutlineCurrencyDollar } from "react-icons/hi2";
import { FaPlus, FaCopy, FaCheck } from "react-icons/fa";

interface Stats {
  totalLinks: number;
  totalReceived: number;
  totalTransactions: number;
}

interface PaymentLink {
  id: string;
  linkName: string;
  title: string;
  amountBCH: number | null;
  bchAddress: string;
  status: string;
  createdAt: string;
  transactions: Array<{ txHash: string; amountBCH: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalLinks: 0, totalReceived: 0, totalTransactions: 0 });
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setLinks(data.paymentLinks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const copyLink = (username: string, linkName: string) => {
    const url = `${window.location.origin}/${username}/${linkName}`;
    navigator.clipboard.writeText(url);
    setCopied(linkName);
    setTimeout(() => setCopied(""), 2000);
  };

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, {user.displayName}</p>
        </div>
        <Link
          href="/dashboard/links/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-green text-black font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <FaPlus /> New Link
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <HiOutlineLink className="text-green-400 text-xl" />
            </div>
            <span className="text-sm text-gray-400">Payment Links</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalLinks}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <HiOutlineCurrencyDollar className="text-green-400 text-xl" />
            </div>
            <span className="text-sm text-gray-400">Total Received</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalReceived.toFixed(8)} <span className="text-lg text-gray-400">BCH</span></p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <HiOutlineBolt className="text-green-400 text-xl" />
            </div>
            <span className="text-sm text-gray-400">Transactions</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalTransactions}</p>
        </div>
      </div>

      {/* Profile link */}
      <div className="glass rounded-2xl p-5 mb-8">
        <p className="text-sm text-gray-400 mb-2">Your public profile</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-green-400 bg-white/5 rounded-xl px-4 py-2.5 text-sm">
            {typeof window !== "undefined" ? window.location.origin : ""}/{user.username}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${user.username}`);
              setCopied("profile");
              setTimeout(() => setCopied(""), 2000);
            }}
            className="px-4 py-2.5 rounded-xl glass hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
          >
            {copied === "profile" ? <FaCheck className="text-green-400" /> : <FaCopy />}
            {copied === "profile" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Recent links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Payment Links</h2>
        {links.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-gray-400 mb-4">No payment links yet</p>
            <Link
              href="/dashboard/links/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-green text-black font-semibold text-sm"
            >
              <FaPlus /> Create Your First Link
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {links.slice(0, 5).map((link) => (
              <div key={link.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{link.title}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        link.status === "paid"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {link.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    /{user.username}/{link.linkName}
                    {link.amountBCH && ` · ${link.amountBCH} BCH`}
                  </p>
                </div>
                <button
                  onClick={() => copyLink(user.username, link.linkName)}
                  className="px-3 py-2 rounded-lg glass hover:bg-white/10 transition-colors text-sm"
                >
                  {copied === link.linkName ? (
                    <FaCheck className="text-green-400" />
                  ) : (
                    <FaCopy className="text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
