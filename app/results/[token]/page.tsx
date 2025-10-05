"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AIRecommendations from "@/components/AIRecommendations";

export default function MagicLinkResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/shared/${params?.token}`);
        
        if (!response.ok) {
          throw new Error("Resultat hittades inte eller har löpt ut");
        }

        const data = await response.json();
        setResultData(data);
      } catch (err) {
        setError("Kunde inte ladda resultat. Länken kan ha löpt ut.");
      } finally {
        setLoading(false);
      }
    };

    if (params?.token) {
      fetchResults();
    }
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Laddar dina resultat...</p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Resultat hittades inte</h1>
          <p className="text-gray-600 mb-8">{error || "Denna länk är ogiltig eller har löpt ut."}</p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary px-6 py-3"
          >
            Gör en ny analys
          </button>
        </div>
      </div>
    );
  }

  return (
    <AIRecommendations
      profession={resultData.profession}
      specialization={resultData.specialization}
      experience={resultData.experience || ""}
      challenges={resultData.challenges || []}
      tasks={resultData.tasks || []}
      onReset={() => router.push("/")}
      showLoadingState={false}
    />
  );
}
