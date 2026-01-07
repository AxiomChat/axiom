import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { parseClientSettings } from "@/lib/clientSettings";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axiom | Your Conversations, Your Privacy, Your Community.",
  description:
    "Axiom is a modern chat app built for speed, simplicity, and collaboration. Experience real-time messaging with powerful tools for teams and communities.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = await cookies();
  const settings = parseClientSettings(c.get("settings")?.value);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${settings.theme}`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
