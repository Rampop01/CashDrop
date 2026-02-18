import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CashDrop — Username-Based BCH Payments",
  description:
    "Receive Bitcoin Cash via shareable profile links. Create payment pages, generate QR codes, and integrate BCH payments via API.",
  keywords: ["Bitcoin Cash", "BCH", "payments", "crypto", "payment links"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[#050505] text-white`}>
        {children}
      </body>
    </html>
  );
}
