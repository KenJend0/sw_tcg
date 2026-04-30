import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SW:TCG — Collection Manager",
  description: "Star Wars Unlimited card collection manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 pb-16">
        <main className="flex-1">{children}</main>
        <nav className="fixed bottom-0 inset-x-0 z-50 flex border-t border-zinc-800 bg-zinc-950">
          <a href="/cards" className="flex-1 flex flex-col items-center py-3 text-xs text-zinc-400 hover:text-yellow-400 transition-colors">
            <span className="text-lg leading-none mb-0.5">🃏</span>Cartes
          </a>
          <a href="/collection" className="flex-1 flex flex-col items-center py-3 text-xs text-zinc-400 hover:text-yellow-400 transition-colors">
            <span className="text-lg leading-none mb-0.5">📦</span>Collection
          </a>
          <a href="/decks" className="flex-1 flex flex-col items-center py-3 text-xs text-zinc-400 hover:text-yellow-400 transition-colors">
            <span className="text-lg leading-none mb-0.5">⚡</span>Decks
          </a>
        </nav>
      </body>
    </html>
  );
}
