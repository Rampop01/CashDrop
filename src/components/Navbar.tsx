"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { SiBitcoincash } from "react-icons/si";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = document.cookie.includes("token=");
    setLoggedIn(token);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center group-hover:scale-110 transition-transform">
              <SiBitcoincash className="text-black text-lg" />
            </div>
            <span className="text-xl font-bold gradient-text">CashDrop</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Features
            </Link>
            <Link
              href="/#developers"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Developers
            </Link>
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-full gradient-green text-black font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-full gradient-green text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <div className="md:hidden glass rounded-xl mt-2 p-4 animate-slide-up">
            <div className="flex flex-col gap-3">
              <Link
                href="/#features"
                className="text-gray-400 hover:text-white transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#developers"
                className="text-gray-400 hover:text-white transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Developers
              </Link>
              {loggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-full gradient-green text-black font-semibold text-sm text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-400 hover:text-white transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2 rounded-full gradient-green text-black font-semibold text-sm text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
