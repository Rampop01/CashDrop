import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  HiOutlineLink,
  HiOutlineQrCode,
  HiOutlineBolt,
  HiOutlineCodeBracket,
  HiOutlineShieldCheck,
  HiOutlineGlobeAlt,
} from "react-icons/hi2";
import { SiBitcoincash } from "react-icons/si";
import { FaArrowRight, FaWallet, FaQrcode, FaShareAlt } from "react-icons/fa";

const features = [
  {
    icon: HiOutlineLink,
    title: "Username Payment Links",
    desc: "Claim your username and get a public payment page anyone can send BCH to.",
  },
  {
    icon: HiOutlineQrCode,
    title: "QR Code Generation",
    desc: "Every payment link generates a scannable QR code with the BCH URI.",
  },
  {
    icon: HiOutlineBolt,
    title: "Real-Time Detection",
    desc: "Payments are detected on-chain automatically. No manual confirmation needed.",
  },
  {
    icon: HiOutlineCodeBracket,
    title: "Developer API",
    desc: "Integrate BCH payments into your app with our simple REST API.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "HD Wallet Security",
    desc: "Each payment link gets a unique derived address. No address reuse.",
  },
  {
    icon: HiOutlineGlobeAlt,
    title: "Shareable Anywhere",
    desc: "Share your payment link on social media, embed in websites, or send via message.",
  },
];

const steps = [
  {
    icon: FaWallet,
    step: "01",
    title: "Claim Username",
    desc: "Sign up and pick your unique username. Your BCH wallet is generated instantly.",
  },
  {
    icon: FaQrcode,
    step: "02",
    title: "Create Payment Links",
    desc: "Create custom links for tips, invoices, or donations — each with its own BCH address.",
  },
  {
    icon: FaShareAlt,
    step: "03",
    title: "Share & Receive",
    desc: "Share your link anywhere. Payments are detected on-chain in real time.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-400 mb-8 animate-slide-up">
              <SiBitcoincash className="text-green-400" />
              <span>Built on Bitcoin Cash</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              Receive BCH with{" "}
              <span className="gradient-text">your username</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up">
              Create shareable payment links powered by Bitcoin Cash. One
              username, unlimited payment links, real blockchain transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                href="/signup"
                className="group px-8 py-4 rounded-full gradient-green text-black font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Claim Your Username
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#developers"
                className="px-8 py-4 rounded-full glass text-white font-semibold text-lg hover:bg-white/10 transition-all text-center"
              >
                View API Docs
              </Link>
            </div>

            {/* Demo URL */}
            <div className="mt-12 animate-slide-up">
              <div className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3">
                <span className="text-gray-500">cashdrop.app/</span>
                <span className="gradient-text font-semibold">satoshi</span>
              </div>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="mt-16 max-w-md mx-auto animate-float">
            <div className="glass-strong rounded-2xl p-6 glow-green">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full gradient-green flex items-center justify-center">
                  <span className="text-black font-bold text-lg">S</span>
                </div>
                <div>
                  <p className="font-semibold">satoshi</p>
                  <p className="text-sm text-gray-400">Satoshi Nakamoto</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:8px_8px] rounded" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">Send Bitcoin Cash to</p>
                <p className="text-xs font-mono text-green-400 break-all">
                  bitcoincash:qr7fzmep8g7hv4l...
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-green" />
                Waiting for payment...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need for{" "}
              <span className="gradient-text">BCH payments</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete infrastructure for receiving Bitcoin Cash — from simple
              payment links to a full developer API.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6 hover:bg-white/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-green-400 text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Three steps to{" "}
              <span className="gradient-text">start receiving</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl glass-strong flex items-center justify-center">
                    <step.icon className="text-green-400 text-2xl" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-green flex items-center justify-center text-black text-xs font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developers" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-3xl p-8 md:p-12 glow-green">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm mb-4">
                  <HiOutlineCodeBracket />
                  CashDrop Connect
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Integrate BCH payments{" "}
                  <span className="gradient-text">in minutes</span>
                </h2>
                <p className="text-gray-400 mb-6">
                  Register your app, get an API key, and start creating payment
                  links programmatically. Webhooks notify you when payments are
                  confirmed.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-green text-black font-semibold hover:opacity-90 transition-opacity"
                >
                  Get API Key <FaArrowRight />
                </Link>
              </div>

              <div className="glass rounded-xl p-4 font-mono text-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <pre className="text-gray-300 overflow-x-auto text-xs">
                  <code>{`POST /api/dev/create-link
Headers: x-api-key: cdk_abc123...

{
  "linkName": "coffee",
  "title": "Buy me a coffee",
  "amountBCH": 0.01
}

Response:
{
  "paymentLink": "/satoshi/coffee",
  "bchAddress": "bitcoincash:qr...",
  "linkId": "clx..."
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to receive{" "}
            <span className="gradient-text">Bitcoin Cash?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join CashDrop and start accepting BCH in under a minute.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-green text-black font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Create Your CashDrop
            <FaArrowRight />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
