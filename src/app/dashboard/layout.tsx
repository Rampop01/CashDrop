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
} from "react-icons/hi2";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: HiOutlineHome },
  { href: "/dashboard/links", label: "Payment Links", icon: HiOutlineLink },
  { href: "/dashboard/developer", label: "Developer", icon: HiOutlineCodeBracket },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string; displayName: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass-strong border-r border-white/5 p-4 flex flex-col fixed h-full">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
            <SiBitcoincash className="text-black text-lg" />
          </div>
          <span className="text-lg font-bold gradient-text">CashDrop</span>
        </Link>

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
            <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center">
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
      <div className="flex-1 ml-64 p-8">{children}</div>
    </div>
  );
}
