"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AIRecommendations from "@/components/AIRecommendations";

export default function SharedResultsPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedResults();
  }, [shareId]);

  const fetchSharedResults = async () => {
    try {
      const response = await fetch(`/api/share?id=${shareId}`);
      
      if (!response.ok) {
        throw new Error("Share link not found");
      }

      const sharedData = await response.json();
      setData(sharedData);
    } catch (err) {
      setError("Delningslänken hittades inte eller har utgått.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-gray-600">Laddar delade resultat...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Delningslänken hittades inte"}
          </h2>
          <p className="text-gray-600 mb-6">
            Länken kan ha utgått eller är felaktig. Gör en ny sökning för att få aktuella rekommendationer.
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            Gör en egen sökning
          </button>
        </div>
      </div>
    );
  }

  // Mock data to make AIRecommendations work with shared data
  const mockData = {
    profession: data.profession,
    specialization: data.specialization,
    experience: "",
    challenges: [],
    tasks: [],
    isDemo: true, // This prevents showing premium upgrade
  };

  return (
    <div>
      {/* Shared banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-4 text-center">
        <p className="text-sm mb-2">
          Detta är delade AI-rekommendationer för {data.specialization || data.profession}
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          Gör din egen sökning
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      {/* Pass the shared data to AIRecommendations */}
      <AIRecommendations
        {...mockData}
        onReset={() => router.push("/")}
      />
    </div>
  );
}
