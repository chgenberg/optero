import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Optero - Gör vardagen lättare med AI",
  description: "Hitta AI-verktyg anpassade för ditt yrke. Spara 5-15 timmar varje vecka med smarta lösningar för din arbetsdag.",
  keywords: ["AI-verktyg", "produktivitet", "automation", "arbetsverktyg", "AI för yrken"],
  authors: [{ name: "Optero" }],
  openGraph: {
    title: "Optero - Gör vardagen lättare med AI",
    description: "Hitta AI-verktyg anpassade för ditt yrke",
    type: "website",
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Optero - Gör vardagen lättare med AI",
    description: "Hitta AI-verktyg anpassade för ditt yrke",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Optero" />
      </head>
      <body className="antialiased bg-white text-gray-900">
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

