import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lordscare-portal.vercel.app"),
  title: {
    default: "LordsCare Bot Support",
    template: "%s · LordsCare",
  },
  description: "Explore LordsCare automation features, subscription plans, Guild Bank commands, event strategies, and Monster Hunt guides.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    title: "LordsCare Bot Support & Subscription Plans",
    description: "Automation features, commands, event strategies, Monster Hunt guides, and subscription plans with direct WhatsApp enquiry.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "LordsCare subscription plans" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LordsCare Bot Support & Subscription Plans",
    description: "Compare plans and send a prepared enquiry directly through WhatsApp.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
