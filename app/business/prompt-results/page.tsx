"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink } from "lucide-react";

interface Solution {
  task: string;
  solution: string;
  prompt: string;
  recommendedTool?: string;
}

export default function PromptResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ url: string; department: string; solutions: Solution[] } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("companyPromptResults");
    if (!saved) {
      router.push("/business");
      return;
    }
    setData(JSON.parse(saved));
  }, [router]);

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">Laddar...</div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 pt-20 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI‑prompts för {data.department}</h1>
          <p className="text-gray-400">Baserade på {data.url}</p>
        </div>

        <div className="space-y-6">
          {data.solutions?.map((s, idx) => (
            <div key={idx} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{s.task}</h2>
                    <p className="text-gray-300 mt-1">{s.solution}</p>
                  </div>
                  {s.recommendedTool && (
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white inline-flex items-center gap-2"
                      title={`Öppna ${s.recommendedTool}`}
                    >
                      <span>{s.recommendedTool}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="bg-black rounded-lg p-4 border border-zinc-800">
                  <pre className="whitespace-pre-wrap text-gray-300 text-sm">{s.prompt}</pre>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => copyPrompt(s.prompt, idx)}
                    className="px-3 py-2 bg-white text-black rounded-lg hover:bg-gray-100 inline-flex items-center gap-2"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopierad
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopiera
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/business")}
            className="px-6 py-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"
          >
            Starta ny analys
          </button>
        </div>
      </div>
    </main>
  );
}


