"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExecutiveConsultant() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new bot builder
    router.replace("/business/bot-builder");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
    </div>
  );
}