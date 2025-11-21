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
    default: "TQB - Travel Quote Bot",
    template: "%s | TQA"
  },
  description: "AI-powered travel itinerary and quote generation platform. Create personalized travel experiences with intelligent pricing and planning.",
  applicationName: "Travel Quote Bot",
  keywords: ["travel", "quotes", "AI", "itinerary", "travel planning", "tour operator", "travel agency"],
  authors: [{ name: "TQA Team" }],
  creator: "Travel Quote Bot",
  publisher: "Travel Quote Bot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://travelquotebot.com'),
  openGraph: {
    title: "TQB - Travel Quote Bot",
    description: "AI-powered travel itinerary and quote generation platform",
    url: "/",
    siteName: "Travel Quote Bot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TQB - Travel Quote Bot",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
