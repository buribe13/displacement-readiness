/**
 * ROOT LAYOUT
 *
 * Global layout wrapper for the Outreach Window Planner.
 *
 * ETHICAL NOTE:
 * The application metadata explicitly states this is for organization use only.
 * Search engines should not index this tool (robots meta tag).
 *
 * DESIGN PHILOSOPHY:
 * This tool prioritizes time over space. Instead of asking "where" harm occurs,
 * we ask "when" care can be delivered with less disruption. This is a temporal
 * coordination problem, not a spatial surveillance one.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  title: "Outreach Window Planner",
  description:
    "Temporal planning tool for housing and homelessness outreach organizations. Helps identify low-disruption windows for effective outreach. Organization use only.",
  // Prevent search engine indexing - this is an internal tool
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
