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
  title: {
    default: "TQA - Travel Quote AI",
    template: "%s | TQA"
  },
  description: "AI-powered travel itinerary and quote generation platform. Create personalized travel experiences with intelligent pricing and planning.",
  applicationName: "Travel Quote AI",
  keywords: ["travel", "quotes", "AI", "itinerary", "travel planning", "tour operator", "travel agency"],
  authors: [{ name: "TQA Team" }],
  creator: "Travel Quote AI",
  publisher: "Travel Quote AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://travelquoteai.com'),
  openGraph: {
    title: "TQA - Travel Quote AI",
    description: "AI-powered travel itinerary and quote generation platform",
    url: "/",
    siteName: "Travel Quote AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TQA - Travel Quote AI",
    description: "AI-powered travel itinerary and quote generation platform",
    creator: "@travelquoteai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
