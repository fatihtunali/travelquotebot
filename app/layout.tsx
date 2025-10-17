import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelQuoteBot - AI-Powered Tour Itinerary Platform",
  description: "B2B SaaS platform for tour operators with real-time pricing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
