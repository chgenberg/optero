"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Fetch user's bots and redirect to first one, or to build bot page
    const fetchAndRedirect = async () => {
      try {
        const res = await fetch("/api/bots/list");
        if (res.ok) {
          const { bots } = await res.json();
          if (bots && bots.length > 0) {
            // Redirect to first bot
            router.push(`/bots/${bots[0].id}`);
          } else {
            // No bots - redirect to build bot page
            router.push("/bot");
          }
        } else {
          // If fetch fails, go to build bot
          router.push("/bot");
        }
      } catch (error) {
        console.error("Failed to fetch bots:", error);
        router.push("/bot");
      }
    };

    fetchAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Laddar din dashboard...</p>
      </div>
    </div>
  );
}