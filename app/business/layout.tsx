import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI för företag - Mendio",
  description: "Transformera ditt företag med AI. Få en skräddarsydd AI-strategi för er organisation.",
  robots: "noindex, nofollow" // Hide from search engines
};

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
