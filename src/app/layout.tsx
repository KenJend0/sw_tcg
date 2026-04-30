import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HOLOGRAPHIC ARCHIVE",
  description: "Star Wars Unlimited — collection & deck builder",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-space-950 text-sand pb-16">
        <main className="flex-1">{children}</main>
        <NavBar />
      </body>
    </html>
  );
}
