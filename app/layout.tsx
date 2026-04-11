import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "NIL Card - Virtual Sponsorship Profiles",
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
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
        >
          {children}
          <footer className="border-t border-zinc-200 bg-zinc-50 py-8 px-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto max-w-4xl flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                © 2026 NIL Card. All rights reserved.
              </span>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Terms
                </Link>
                <Link href="/contact" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
