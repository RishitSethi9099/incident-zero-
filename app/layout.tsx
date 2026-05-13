import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { PhaseNav } from "@/components/PhaseNav";
import { TopBar } from "@/components/TopBar";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Incident Zero — Participant Portal",
  description:
    "A static, gamified event portal for investigating and fixing the ReliefNet AI crash.",
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
      <body className="min-h-full bg-[#0C0F0E] text-[#E8F0ED] font-sans">
        <div className="min-h-full flex flex-col">
          <TopBar />
          <PhaseNav />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
