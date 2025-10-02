"use client";

import { useState } from "react";
import AIRecommendations from "@/components/AIRecommendations";
import Link from "next/link";

// Mockdata för en ekonomiassistent
const mockData = {
  profession: "Ekonomiassistent",
  specialization: "Redovisning",
  experience: "intermediate",
  challenges: ["time", "accuracy", "learning"],
  tasks: [
    { name: "Bokföra leverantörsfakturor", priority: 3 },
    { name: "Stämma av konton", priority: 2 },
    { name: "Skapa månadsrapporter", priority: 3 },
    { name: "Hantera kundfakturor", priority: 2 },
    { name: "Följa upp betalningar", priority: 1 }
  ]
};

export default function DemoEkonomiassistent() {
  const [showDemo, setShowDemo] = useState(true);

  const handleReset = () => {
    // Redirect to main page
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Demo banner */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white px-4 py-3 text-center z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-sm">
            <strong>Demo-läge:</strong> Detta är ett exempel för yrkesrollen Ekonomiassistent
          </span>
          <Link
            href="/"
            className="text-sm underline hover:no-underline"
          >
            Testa med ditt eget yrke →
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mt-12">
        {/* Logo and info button */}
        <div className="flex justify-between items-start mb-8">
          <img
            src="/Optero_logo.png"
            alt="Optero"
            className="h-10 md:h-12 lg:h-16"
          />
        </div>

        {/* Demo content */}
        {showDemo && (
          <AIRecommendations
            profession={mockData.profession}
            specialization={mockData.specialization}
            experience={mockData.experience}
            challenges={mockData.challenges}
            tasks={mockData.tasks}
            onReset={handleReset}
            isDemo={true}
          />
        )}
      </div>
    </main>
  );
}
