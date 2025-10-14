import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FeedbackButton from "@/components/FeedbackButton";

export const metadata: Metadata = {
  title: "Mendio - Build AI that understands your business",
  description: "Train a chatbot on your website and documents. Automate support and qualify leads in minutes.",
  keywords: ["AI", "chatbot", "automation", "support", "lead qualification"],
  authors: [{ name: "Mendio" }],
  openGraph: {
    title: "Mendio - Build AI that understands your business",
    description: "Train a chatbot on your website and documents",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mendio - Build AI that understands your business",
    description: "Train a chatbot on your website and documents",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Next.js genererar manifest från app/manifest.ts som /manifest.webmanifest */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
              <meta name="apple-mobile-web-app-title" content="Mendio" />
      </head>
      <body className="antialiased bg-white text-gray-900 min-h-screen flex flex-col">
        <LanguageProvider>
          <Header />
          <main className="pt-16 flex-grow">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <FeedbackButton />
        </LanguageProvider>
      </body>
    </html>
  );
}

