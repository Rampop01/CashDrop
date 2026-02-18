"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaCopy, FaCheck, FaExternalLinkAlt } from "react-icons/fa";

interface PaymentLink {
  id: string;
  linkName: string;
  title: string;
  description: string;
  amountBCH: number | null;
  bchAddress: string;
  status: string;
  createdAt: string;
  totalReceived: number;
  transactionCount: number;
}

export default function LinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const fetchLinks = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/links", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLinks(data.links);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  const copyLink = (linkName: string) => {
    const url = `${window.location.origin}/${user.username}/${linkName}`;
    navigator.clipboard.writeText(url);
    setCopied(linkName);
    setTimeout(() => setCopied(""), 2000);
  };

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
          <h1 className="text-2xl font-bold">Payment Links</h1>
          <p className="text-gray-400 text-sm">{links.length} link{links.length !== 1 ? "s" : ""} created</p>
        </div>
        <Link
          href="/dashboard/links/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-green text-black font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <FaPlus /> New Link
        </Link>
      </div>

      {links.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <FaPlus className="text-green-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No payment links yet</h3>
          <p className="text-gray-400 mb-6 text-sm">Create your first payment link to start receiving BCH</p>
          <Link
            href="/dashboard/links/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-green text-black font-semibold text-sm"
          >
            <FaPlus /> Create Payment Link
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => (
            <div key={link.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{link.title}</h3>
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
                  {link.description && (
                    <p className="text-sm text-gray-400">{link.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLink(link.linkName)}
                    className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                    title="Copy link"
                  >
                    {copied === link.linkName ? (
                      <FaCheck className="text-green-400 text-sm" />
                    ) : (
                      <FaCopy className="text-gray-400 text-sm" />
                    )}
                  </button>
                  <Link
                    href={`/${user.username}/${link.linkName}`}
                    className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                    title="View page"
                    target="_blank"
                  >
                    <FaExternalLinkAlt className="text-gray-400 text-sm" />
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>/{user.username}/{link.linkName}</span>
                {link.amountBCH && <span>{link.amountBCH} BCH</span>}
                <span>{link.totalReceived.toFixed(8)} BCH received</span>
                <span>{link.transactionCount} tx{link.transactionCount !== 1 ? "s" : ""}</span>
              </div>

              <div className="mt-3 text-xs font-mono text-gray-600 truncate">
                {link.bchAddress}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
