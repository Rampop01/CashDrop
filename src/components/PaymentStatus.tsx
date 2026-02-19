"use client";

import { useEffect, useState, useCallback } from "react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import { HiOutlineClock } from "react-icons/hi2";

interface PaymentStatusProps {
  address: string;
  amount?: number;
  network?: "mainnet" | "testnet";
}

interface StatusData {
  paid: boolean;
  amount: number;
  txHash?: string;
  confirmations: number;
}

export default function PaymentStatus({ address, amount, network = "mainnet" }: PaymentStatusProps) {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [checking, setChecking] = useState(false);

  const checkPayment = useCallback(async () => {
    setChecking(true);
    try {
      const params = new URLSearchParams({ address, network });
      if (amount) params.set("amount", amount.toString());
      const res = await fetch(`/api/check-payment?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  }, [address, amount, network]);

  useEffect(() => {
    checkPayment();
    const interval = setInterval(checkPayment, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [checkPayment]);

  if (status?.paid) {
    return (
      <div className="glass-strong rounded-2xl p-6 text-center glow-green animate-slide-up">
        <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-1 gradient-text">Payment Received!</h3>
        <p className="text-sm text-gray-400 mb-3">
          {status.amount.toFixed(8)} BCH · {status.confirmations} confirmation{status.confirmations !== 1 ? "s" : ""}
        </p>
        {status.txHash && (
          <a
            href={network === "testnet"
              ? `https://chipnet.imaginary.cash/tx/${status.txHash}`
              : `https://blockchair.com/bitcoin-cash/transaction/${status.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-400 hover:underline font-mono break-all"
          >
            {status.txHash}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
      {checking ? (
        <FaSpinner className="animate-spin text-green-400" />
      ) : (
        <HiOutlineClock className="text-yellow-400" />
      )}
      <span>Waiting for payment...</span>
      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse-green" />
    </div>
  );
}
