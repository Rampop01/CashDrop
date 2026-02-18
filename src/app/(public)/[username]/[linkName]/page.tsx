"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QRCodeDisplay from "@/components/QRCode";
import PaymentStatus from "@/components/PaymentStatus";
import { SiBitcoincash } from "react-icons/si";
import { FaCopy, FaCheck, FaArrowLeft } from "react-icons/fa";

interface LinkData {
  linkName: string;
  title: string;
  description: string;
  amountBCH: number | null;
  bchAddress: string;
  status: string;
}

interface UserData {
  username: string;
  displayName: string;
}

export default function PaymentLinkPage() {
  const params = useParams();
  const username = params.username as string;
  const linkName = params.linkName as string;

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch link data
        const linkRes = await fetch(`/api/links/${username}/${linkName}`);
        if (linkRes.status === 404) {
          setNotFound(true);
          return;
        }
        if (linkRes.ok) {
          const data = await linkRes.json();
          setLinkData(data.link);
          setUserData(data.user);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username, linkName]);

  const copyAddress = () => {
    if (!linkData) return;
    navigator.clipboard.writeText(linkData.bchAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (notFound || !linkData || !userData) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-gray-400">Payment link not found</p>
          <Link href="/" className="text-green-400 hover:underline text-sm">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  const bchUri = linkData.amountBCH
    ? `${linkData.bchAddress}?amount=${linkData.amountBCH}`
    : linkData.bchAddress;

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="relative pt-28 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[120px]" />
        </div>

        <div className="relative max-w-md mx-auto px-4">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
          >
            <FaArrowLeft /> @{username}
          </Link>

          <div className="glass-strong rounded-3xl p-8 glow-green animate-slide-up">
            {/* User info */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full gradient-green flex items-center justify-center">
                <span className="text-black font-bold text-lg">
                  {userData.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold">{userData.displayName}</p>
                <p className="text-sm text-gray-400">@{userData.username}</p>
              </div>
            </div>

            {/* Title and description */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{linkData.title}</h1>
              {linkData.description && (
                <p className="text-gray-400 text-sm">{linkData.description}</p>
              )}
              {linkData.amountBCH && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10">
                  <SiBitcoincash className="text-green-400" />
                  <span className="text-xl font-bold gradient-text">
                    {linkData.amountBCH} BCH
                  </span>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <QRCodeDisplay value={bchUri} size={220} />
            </div>

            {/* Address */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2 text-center">
                Send Bitcoin Cash to this address
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-green-400 bg-white/5 rounded-xl px-4 py-3 break-all">
                  {linkData.bchAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className="px-3 py-3 rounded-xl glass hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <FaCheck className="text-green-400" />
                  ) : (
                    <FaCopy className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Payment status */}
            <PaymentStatus
              address={linkData.bchAddress}
              amount={linkData.amountBCH || undefined}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
