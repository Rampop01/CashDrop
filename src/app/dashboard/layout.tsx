"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SiBitcoincash } from "react-icons/si";
import {
  HiOutlineHome,
  HiOutlineLink,
  HiOutlineCodeBracket,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBanknotes,
} from "react-icons/hi2";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: HiOutlineHome },
  { href: "/dashboard/links", label: "Payment Links", icon: HiOutlineLink },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: HiOutlineBanknotes },
  { href: "/dashboard/developer", label: "Developer", icon: HiOutlineCodeBracket },
];

interface StoredUser {
  username: string;
  displayName: string;
  network?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [network, setNetwork] = useState<"mainnet" | "testnet">("mainnet");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const parsed: StoredUser = JSON.parse(stored);
    setUser(parsed);
    setNetwork((parsed.network as "mainnet" | "testnet") || "mainnet");
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const toggleNetwork = async () => {
    if (toggling) return;
    setToggling(true);
    const next = network === "mainnet" ? "testnet" : "mainnet";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/user/network", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ network: next }),
      });
      if (res.ok) {
        setNetwork(next);
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, network: next }));
      }
    } finally {
      setToggling(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass-strong border-r border-white/5 p-4 flex flex-col fixed h-full overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
            <SiBitcoincash className="text-black text-lg" />
          </div>
          <span className="text-lg font-bold gradient-text">CashDrop</span>
        </Link>

        {/* Network toggle */}
        <div className="mb-5 px-2">
          <div className="flex items-center justify-between glass rounded-xl p-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Network</p>
              <p className={`text-sm font-semibold ${network === "testnet" ? "text-yellow-400" : "text-green-400"}`}>
                {network === "testnet" ? "⚠ Testnet" : "● Mainnet"}
              </p>
            </div>
            <button
              onClick={toggleNetwork}
              disabled={toggling}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                network === "testnet" ? "bg-yellow-500/40" : "bg-green-500/40"
              } disabled:opacity-50`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                  network === "testnet"
                    ? "left-5 bg-yellow-400"
                    : "left-0.5 bg-green-400"
                }`}
              />
            </button>
          </div>
          {network === "testnet" && (
            <p className="text-xs text-yellow-500/70 mt-1.5 px-1">
              Test mode — no real value. Get free BCH from a faucet.
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-green-500/10 text-green-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center shrink-0">
              <span className="text-black text-sm font-bold">
                {user.displayName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <HiOutlineArrowRightOnRectangle className="text-lg" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 p-8">
        {network === "testnet" && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm flex items-center gap-2">
            <span>⚠</span>
            <span>
              <strong>Testnet mode</strong> — addresses and transactions have no real value.
              Get free test BCH from{" "}
              <a href="https://tbch.googol.cash" target="_blank" rel="noopener noreferrer" className="underline">
                tbch.googol.cash
              </a>
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
