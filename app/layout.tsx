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
        {children}
      </body>
    </html>
  );
}

