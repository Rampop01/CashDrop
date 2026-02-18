import Link from "next/link";
import { SiBitcoincash } from "react-icons/si";
import { FaGithub, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
                <SiBitcoincash className="text-black text-lg" />
              </div>
              <span className="text-xl font-bold gradient-text">CashDrop</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-md">
              Username-based BCH payment links. Receive Bitcoin Cash instantly
              with shareable profiles and QR codes.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Product</h3>
            <div className="flex flex-col gap-2">
              <Link href="/#features" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Features
              </Link>
              <Link href="/#developers" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Developer API
              </Link>
              <Link href="/signup" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Get Started
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Connect</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <FaGithub size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <FaTwitter size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} CashDrop. Built on Bitcoin Cash.
          </p>
        </div>
      </div>
    </footer>
  );
}
