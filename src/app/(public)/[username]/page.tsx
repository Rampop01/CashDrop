"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SiBitcoincash } from "react-icons/si";
import { HiOutlineLink } from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa";

interface UserProfile {
  username: string;
  displayName: string;
  links: Array<{
    linkName: string;
    title: string;
    description: string;
    amountBCH: number | null;
  }>;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/${username}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

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

  if (notFound || !profile) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-gray-400">User not found</p>
          <Link href="/" className="text-green-400 hover:underline text-sm">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="relative pt-28 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[120px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4">
          {/* Profile header */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="w-20 h-20 rounded-full gradient-green flex items-center justify-center mx-auto mb-4">
              <span className="text-black text-3xl font-bold">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-1">{profile.displayName}</h1>
            <p className="text-gray-400">@{profile.username}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <SiBitcoincash className="text-green-400" />
              <span className="text-sm text-gray-500">Accepts Bitcoin Cash</span>
            </div>
          </div>

          {/* Payment links */}
          {profile.links.length > 0 ? (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-sm text-gray-400 font-medium mb-3">Payment Links</h2>
              {profile.links.map((link) => (
                <Link
                  key={link.linkName}
                  href={`/${profile.username}/${link.linkName}`}
                  className="glass rounded-2xl p-5 flex items-center justify-between hover:bg-white/5 transition-all group block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <HiOutlineLink className="text-green-400 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{link.title}</h3>
                      {link.description && (
                        <p className="text-sm text-gray-400">{link.description}</p>
                      )}
                      {link.amountBCH && (
                        <p className="text-sm text-green-400 font-mono mt-1">
                          {link.amountBCH} BCH
                        </p>
                      )}
                    </div>
                  </div>
                  <FaArrowRight className="text-gray-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center animate-slide-up">
              <p className="text-gray-400">No active payment links</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
