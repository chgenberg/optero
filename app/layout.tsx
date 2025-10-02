import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyAIGuy - Hitta AI-verktyg för ditt yrke",
  description: "Upptäck AI-verktyg som kan underlätta ditt dagliga arbete",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased">
        <header className="w-full border-b border-gray-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
            <a href="/" className="inline-flex items-center gap-2">
              <img src="/optero_logo.png" alt="Optero" className="h-8 w-auto" />
            </a>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

