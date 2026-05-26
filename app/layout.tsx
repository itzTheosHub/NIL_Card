import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  description: "Connecting college athletes with brands through shareable NIL profile cards. Built for athletes to showcase their reach and brands to find their perfect partner.",
  openGraph: {
    title: "NIL-Card",
    description: "Connecting college athletes with brands through shareable NIL profile cards. Built for athletes to showcase their reach and brands to find their perfect partner.",
    url: "https://nil-card.com",
    siteName: "NIL-Card",
    images: [
      {
        url: "https://nil-card.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "NIL-Card — Athlete profiles for NIL deals",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIL-Card",
    description: "Connecting college athletes with brands through shareable NIL profile cards.",
    images: ["https://nil-card.com/og-image.png"],
  },
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
          <Analytics />
          <SpeedInsights />
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
