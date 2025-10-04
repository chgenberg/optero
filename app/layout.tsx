import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

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
      <body className="antialiased bg-white text-gray-900">
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

