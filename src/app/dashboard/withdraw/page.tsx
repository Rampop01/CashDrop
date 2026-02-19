"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaExternalLinkAlt, FaCheckCircle } from "react-icons/fa";
import { HiOutlineBanknotes } from "react-icons/hi2";
import Link from "next/link";

export default function WithdrawPage() {
  const [toAddress, setToAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ txHash: string; amountBCH: number; explorerUrl: string } | null>(null);
  const [network, setNetwork] = useState("mainnet");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.network) setNetwork(user.network);
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Withdrawal failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up max-w-lg">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
        <FaArrowLeft /> Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-2">Withdraw Funds</h1>
      <p className="text-gray-400 text-sm mb-8">
        Sweep all received BCH from your payment links to an external wallet.
      </p>

      {network === "testnet" && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          ⚠ You are on <strong>Testnet</strong> — funds have no real value.
        </div>
      )}

      {result ? (
        <div className="glass-strong rounded-2xl p-8 text-center glow-green">
          <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 gradient-text">Withdrawal Sent!</h2>
          <p className="text-gray-400 text-sm mb-4">{result.amountBCH.toFixed(8)} BCH</p>
          <div className="glass rounded-xl p-3 mb-4">
            <p className="text-xs font-mono text-green-400 break-all">{result.txHash}</p>
          </div>
          <a
            href={result.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-400 hover:underline text-sm"
          >
            View on Explorer <FaExternalLinkAlt />
          </a>
        </div>
      ) : (
        <form onSubmit={handleWithdraw} className="glass-strong rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Destination BCH Address</label>
            <div className="relative">
              <HiOutlineBanknotes className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder={network === "testnet" ? "bchtest:q..." : "bitcoincash:q..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors font-mono text-sm"
                required
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              All spendable UTXOs from your {network} payment links will be swept to this address.
            </p>
          </div>

          <div className="glass rounded-xl p-4 text-sm text-gray-400 space-y-1">
            <p>• A network fee of ~1000 satoshis (~0.00001 BCH) will be deducted</p>
            <p>• All payment link addresses will be swept in one transaction</p>
            <p>• Links will remain active and can receive new payments</p>
          </div>

          <button
            type="submit"
            disabled={loading || !toAddress}
            className="w-full py-3 rounded-xl gradient-green text-black font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              "Withdraw All Funds"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
