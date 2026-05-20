import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "NIL-Card",
  description: "Create your NIL profile card. Share your stats, social reach, and partnership opportunities with brands and sponsors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <footer className="border-t border-zinc-800 bg-[#08090a] py-8 px-4">
            <div className="mx-auto max-w-4xl flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="text-sm text-zinc-500">
                © 2026 NIL Card. All rights reserved.
              </span>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/contact" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
