"use client";

import { useRouter } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";

export default function BusinessIndex() {
  const router = useRouter();

  const solutions = [
    {
      title: "Bot Builder",
      description: "Bygg intelligenta chatbots som löser verkliga affärsproblem",
      icon: <MinimalIcons.Bot className="w-10 h-10" />,
      href: "/business/bot-builder",
      primary: true
    },
    {
      title: "AI för företag",
      description: "Få skräddarsydda AI-prompts för din avdelning",
      icon: <MinimalIcons.Target className="w-10 h-10" />,
      href: "/business"
    },
    {
      title: "Site Analyzer",
      description: "Analysera din webbplats och få AI-förslag",
      icon: <MinimalIcons.Analysis className="w-10 h-10" />,
      href: "/business/site-analyzer"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            AI-lösningar för företag
          </h1>
          <p className="text-xl text-gray-600">
            Välj den lösning som passar ditt företag bäst
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution) => (
            <button
              key={solution.href}
              onClick={() => router.push(solution.href)}
              className={`minimal-box text-center hover:scale-[1.02] transition-transform ${
                solution.primary ? "ring-2 ring-black" : ""
              }`}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                {solution.icon}
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                {solution.title}
              </h2>
              <p className="text-gray-600">
                {solution.description}
              </p>
              {solution.primary && (
                <div className="mt-6 inline-flex items-center text-sm font-medium text-black">
                  Rekommenderad
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
