"use client";

import { useRouter } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";

export default function BotBuilderHero() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="minimal-box max-w-2xl w-full text-center">
        {/* Minimal logo */}
        <div className="mb-12">
          <div className="w-16 h-16 bg-black rounded-full mx-auto mb-8 flex items-center justify-center">
            <MinimalIcons.Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-4">
            Bot Builder
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Bygg intelligenta chatbots som löser verkliga affärsproblem
          </p>
        </div>

        {/* Main CTA */}
        <button
          onClick={() => router.push("/business/bot-builder/identify")}
          className="btn-minimal mb-6"
        >
          Börja bygga
        </button>

        {/* Secondary info */}
        <div className="grid grid-cols-3 gap-8 mt-16 text-sm text-gray-600">
          <div>
            <div className="text-2xl font-light text-gray-900 mb-2">5 min</div>
            <div>Tid att komma igång</div>
          </div>
          <div>
            <div className="text-2xl font-light text-gray-900 mb-2">0 kr</div>
            <div>Kostnad att testa</div>
          </div>
          <div>
            <div className="text-2xl font-light text-gray-900 mb-2">24/7</div>
            <div>Tillgänglighet</div>
          </div>
        </div>
      </div>
    </div>
  );
}
