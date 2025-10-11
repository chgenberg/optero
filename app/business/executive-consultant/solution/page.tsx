"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Download, Copy, Check, Bot, FileText, ChevronDown, ChevronUp, ExternalLink, Sparkles, ArrowRight, Code, Zap, Clock, DollarSign, Users, BookOpen } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"solution" | "implementation">("solution");

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gray-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ANALYSERAR MED AI</h2>
              <p className="text-gray-600">Skapar skräddarsydda lösningar</p>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-gray-900 h-full rounded-full transition-all duration-1000 loading-progress" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
                  <span>Analyserar företagskontext...</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span>Genererar AI-lösningar...</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span>Förbereder implementationsplan...</span>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Detta kan ta upp till 2 minuter
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pt-20 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 uppercase tracking-tight mb-4">
              AI-LÖSNING FÖR DITT PROBLEM
            </h1>
            <p className="text-lg text-gray-600">
              Skräddarsydd lösning baserad på er situation
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={downloadAsMarkdown}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Ladda ner rapport</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {solutions.map((solution, idx) => (
          <div key={idx} className="space-y-8">
            {/* Problem Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-900">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">PROBLEMET</h2>
                  <p className="text-gray-600">{solution.problem}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-900 rounded-2xl p-1 inline-flex">
              <button
                onClick={() => setActiveTab("solution")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "solution"
                    ? "bg-white text-gray-900"
                    : "text-white hover:text-gray-300"
                }`}
              >
                LÖSNING
              </button>
              <button
                onClick={() => setActiveTab("implementation")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "implementation"
                    ? "bg-white text-gray-900"
                    : "text-white hover:text-gray-300"
                }`}
              >
                IMPLEMENTATION
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "solution" ? (
              <div className="space-y-6">
                {/* Analysis Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase">Analys</h3>
                  <div className="prose prose-gray max-w-none">
                    {solution.analysis.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Solution Card */}
                {solution.approach === "prompt" ? (
                  <div className="bg-gray-900 rounded-2xl p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6" />
                        <h3 className="text-xl font-bold uppercase">AI-Prompt</h3>
                      </div>
                      <button
                        onClick={() => handleCopy(solution.prompt || "", idx)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold">Kopierad!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-sm font-semibold">Kopiera</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-black/40 rounded-xl p-6 backdrop-blur">
                      <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono leading-relaxed">
                        {solution.prompt}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-2xl p-8 text-white">
                    <div className="flex items-center gap-3 mb-6">
                      <Bot className="w-6 h-6" />
                      <h3 className="text-xl font-bold uppercase">Bot-Implementation</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Overview */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Översikt</h4>
                        <p className="text-gray-100">{solution.botInstructions?.overview}</p>
                      </div>

                      {/* Tech Stack */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Teknisk Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {solution.botInstructions?.technicalStack.map((tech, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expected Outcomes */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase">Förväntade Resultat</h3>
                  <div className="grid gap-4">
                    {solution.expectedOutcomes.map((outcome, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-gray-700 leading-relaxed">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Implementation Tab */
              <div className="space-y-6">
                {solution.approach === "bot" && (
                  <>
                    {/* Implementation Steps */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase">Steg-för-steg Guide</h3>
                      <div className="space-y-6">
                        {solution.botInstructions?.implementation.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold">{i + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-700 leading-relaxed">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost & Timeline Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-900 rounded-2xl p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                          <DollarSign className="w-6 h-6" />
                          <h3 className="text-lg font-bold uppercase">Kostnad</h3>
                        </div>
                        <p className="text-gray-100">{solution.botInstructions?.cost}</p>
                      </div>
                      
                      <div className="bg-gray-900 rounded-2xl p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                          <Clock className="w-6 h-6" />
                          <h3 className="text-lg font-bold uppercase">Tidslinje</h3>
                        </div>
                        <p className="text-gray-100">{solution.botInstructions?.timeline}</p>
                      </div>
                    </div>
                  </>
                )}

                {solution.approach === "prompt" && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <BookOpen className="w-6 h-6 text-gray-900" />
                      <h3 className="text-xl font-bold text-gray-900 uppercase">Så Använder Du Prompten</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="font-bold">1</span>
                        </div>
                        <p className="text-gray-700">Kopiera prompten ovan genom att klicka på "Kopiera"-knappen</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="font-bold">2</span>
                        </div>
                        <p className="text-gray-700">Öppna ChatGPT, Claude eller annan AI-assistent</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="font-bold">3</span>
                        </div>
                        <p className="text-gray-700">Klistra in prompten och fyll i de markerade fälten med er specifika information</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="font-bold">4</span>
                        </div>
                        <p className="text-gray-700">Följ AI:ns instruktioner och iterera vid behov</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* CTA */}
        <div className="mt-16 bg-gray-900 rounded-2xl p-10 text-white text-center">
          <h3 className="text-3xl font-bold mb-4 uppercase">Redo att implementera?</h3>
          <p className="mb-8 text-gray-300 text-lg">
            Vi hjälper er att omsätta dessa lösningar i praktiken
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:ch.genberg@gmail.com?subject=Executive AI Konsultation - Implementation"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg"
            >
              <span>BOKA KONSULTATION</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <button
              onClick={() => router.push("/business/executive-consultant")}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-bold text-lg"
            >
              NY ANALYS
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-progress {
          0% { width: 0%; }
          10% { width: 10%; }
          30% { width: 35%; }
          50% { width: 50%; }
          70% { width: 70%; }
          90% { width: 90%; }
          100% { width: 100%; }
        }
        
        .loading-progress {
          animation: loading-progress 120s ease-out;
        }
      `}</style>
    </div>
  );
}