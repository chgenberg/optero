"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Download, Copy, Check, Bot, FileText, ChevronDown, ChevronUp, ExternalLink, Sparkles, ArrowRight } from "lucide-react";

interface Solution {
  problem: string;
  analysis: string;
  approach: "prompt" | "bot";
  prompt?: string;
  botInstructions?: {
    overview: string;
    technicalStack: string[];
    implementation: string[];
    cost: string;
    timeline: string;
  };
  expectedOutcomes: string[];
}

export default function ExecutiveSolution() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const consultData = sessionStorage.getItem("executiveConsultation");
    const conversations = sessionStorage.getItem("problemConversations");
    
    if (!consultData || !conversations) {
      router.push("/business/executive-consultant");
      return;
    }

    generateSolutions(JSON.parse(consultData), JSON.parse(conversations));
  }, []);

  const generateSolutions = async (consultData: any, conversations: any[]) => {
    setLoading(true);
    try {
      const response = await fetch("/api/business/generate-executive-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: consultData.url,
          websiteContent: consultData.websiteContent,
          websiteSummary: consultData.websiteSummary,
          documentsContent: consultData.documentsContent,
          problems: consultData.problems,
          conversations
        })
      });

      const data = await response.json();
      setSolutions(data.solutions || []);
    } catch (error) {
      console.error("Failed to generate solutions:", error);
      alert("Kunde inte generera lösningar. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadAsMarkdown = () => {
    let markdown = `# Executive AI Konsultation\n\n`;
    
    solutions.forEach((sol, idx) => {
      markdown += `## Problem ${idx + 1}: ${sol.problem}\n\n`;
      markdown += `### Analys\n${sol.analysis}\n\n`;
      
      if (sol.approach === "prompt") {
        markdown += `### Lösning: AI-Prompt\n\`\`\`\n${sol.prompt}\n\`\`\`\n\n`;
      } else {
        markdown += `### Lösning: Specialiserad Bot\n\n`;
        markdown += `**Översikt:** ${sol.botInstructions?.overview}\n\n`;
        markdown += `**Teknisk Stack:**\n${sol.botInstructions?.technicalStack.map(t => `- ${t}`).join('\n')}\n\n`;
        markdown += `**Implementation:**\n${sol.botInstructions?.implementation.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        markdown += `**Kostnad:** ${sol.botInstructions?.cost}\n\n`;
        markdown += `**Tidslinje:** ${sol.botInstructions?.timeline}\n\n`;
      }
      
      markdown += `### Förväntade Resultat\n${sol.expectedOutcomes.map(o => `- ${o}`).join('\n')}\n\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-konsultation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-gray-900 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyserar med AI...</h2>
          <p className="text-gray-600">Detta kan ta upp till 2 minuter för optimala resultat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 pt-20 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  AI-lösningar
                </h1>
                <p className="text-gray-600">
                  {solutions.length} skräddarsydda lösningar
                </p>
              </div>
            </div>
            <button
              onClick={downloadAsMarkdown}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Ladda ner</span>
            </button>
          </div>
        </div>

        {/* Solutions */}
        <div className="space-y-4">
          {solutions.map((solution, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden border border-gray-200">
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-gray-900 font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {solution.problem}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {solution.approach === "prompt" ? (
                        <>
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">AI-prompt</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Bot-instruktioner</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {expandedIndex === idx ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* Content */}
              {expandedIndex === idx && (
                <div className="p-6 border-t border-gray-200 space-y-6">
                  {/* Analysis */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      Analys
                    </h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {solution.analysis}
                    </p>
                  </div>

                  {/* Solution */}
                  {solution.approach === "prompt" ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-gray-900">
                          AI-prompt
                        </h4>
                        <button
                          onClick={() => handleCopy(solution.prompt || "", idx)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-green-400">Kopierad!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">Kopiera</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded-xl p-6 border border-gray-200">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                          {solution.prompt}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        Bot-implementation
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Overview */}
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-200">
                          <h5 className="font-semibold text-gray-700 mb-2">Översikt</h5>
                          <p className="text-gray-600">{solution.botInstructions?.overview}</p>
                        </div>

                        {/* Tech Stack */}
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-200">
                          <h5 className="font-semibold text-gray-700 mb-3">Teknisk stack</h5>
                          <div className="flex flex-wrap gap-2">
                            {solution.botInstructions?.technicalStack.map((tech, i) => (
                              <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Implementation Steps */}
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-200">
                          <h5 className="font-semibold text-gray-700 mb-3">Implementationssteg</h5>
                          <ol className="space-y-2">
                            {solution.botInstructions?.implementation.map((step, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </span>
                                <span className="text-gray-600 pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Cost & Timeline */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-gray-900 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-700 mb-2">Kostnad</h5>
                            <p className="text-gray-600">{solution.botInstructions?.cost}</p>
                          </div>
                          <div className="bg-gray-900 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-700 mb-2">Tidslinje</h5>
                            <p className="text-gray-600">{solution.botInstructions?.timeline}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expected Outcomes */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      Förväntade resultat
                    </h4>
                    <ul className="space-y-2">
                      {solution.expectedOutcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Nästa steg</h3>
          <p className="mb-6 text-gray-600">
            Vill du ha hjälp med implementation eller mer detaljerad konsultation?
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:ch.genberg@gmail.com?subject=Executive AI Konsultation - Nästa steg"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-100 transition-colors font-semibold"
            >
              <span>Boka konsultation</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => router.push("/business/executive-consultant")}
              className="px-6 py-3 bg-gray-50 hover:bg-zinc-700 text-gray-900 rounded-xl transition-colors font-semibold"
            >
              Starta ny analys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

