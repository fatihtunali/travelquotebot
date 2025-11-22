import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

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
    template: "%s | TQB"
  },
  description: "AI-powered travel itinerary and quote generation platform. Create personalized travel experiences with intelligent pricing and planning.",
  applicationName: "Travel Quote Bot",
  keywords: ["travel", "quotes", "AI", "itinerary", "travel planning", "tour operator", "travel agency"],
  authors: [{ name: "TQB Team" }],
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
    images: [
      {
        url: '/logo-assets/og-image-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Travel Quote Bot - Intelligent Travel, Simplified',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TQB - Travel Quote Bot",
    description: "AI-powered travel itinerary and quote generation platform",
    creator: "@travelquotebot",
    images: ['/logo-assets/twitter-header-1500x500.png'],
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
      { url: '/logo-assets/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-assets/favicon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/logo-assets/favicon-32.png',
    apple: '/logo-assets/favicon-192.png',
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
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TQB" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo-assets/favicon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <FloatingWhatsApp
          phoneNumber="905325858786"
          companyName="Travel Quote Bot"
          defaultMessage="Hello! I'm interested in Travel Quote Bot for my travel agency."
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed: ', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
