"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, FileSpreadsheet, FileType, X, Plus, Building2, ArrowRight, Sparkles } from "lucide-react";

export default function ExecutiveConsultant() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [problems, setProblems] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['xlsx', 'xls', 'docx', 'doc'].includes(ext || '');
      });
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const updateProblem = (index: number, value: string) => {
    const newProblems = [...problems];
    newProblems[index] = value;
    setProblems(newProblems);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['xlsx', 'xls'].includes(ext || '')) return <FileSpreadsheet className="w-4 h-4" />;
    if (['docx', 'doc'].includes(ext || '')) return <FileText className="w-4 h-4" />;
    return <FileType className="w-4 h-4" />;
  };

  const startConsultation = async () => {
    if (!url || problems.filter(p => p.trim()).length < 3) {
      alert("Fyll i företagets URL och alla 3 problem för att fortsätta.");
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      // Step 1: Scrape website
      setUploadProgress(20);
      const scrapeResp = await fetch("/api/business/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const scrapeData = await scrapeResp.json();
      
      // Step 2: Upload and parse documents
      setUploadProgress(40);
      let documentsContent = "";
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
        
        const uploadResp = await fetch("/api/business/upload-documents", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadResp.json();
        documentsContent = uploadData.content || "";
      }
      
      // Step 3: Save to session and navigate to interview
      setUploadProgress(80);
      sessionStorage.setItem("executiveConsultation", JSON.stringify({
        url,
        websiteContent: scrapeData.content || "",
        websiteSummary: scrapeData.summary || {},
        documentsContent,
        problems: problems.filter(p => p.trim()),
        files: files.map(f => f.name)
      }));
      
      setUploadProgress(100);
      router.push("/business/executive-consultant/interview");
    } catch (error) {
      console.error("Setup failed:", error);
      alert("Kunde inte starta konsultationen. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-20 sm:pt-24">
        <div className="space-y-16 max-w-3xl mx-auto w-full">
          {/* Hero section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl mb-4 group hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-8 h-8 text-white group-hover:text-gray-300 transition-colors" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
              Executive AI Consultant
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Djupgående AI-analys för ledningsgrupper. 
              <br className="hidden sm:block" />
              Ladda upp dokument, beskriv utmaningar, få konkreta lösningar.
            </p>
          </div>
          {/* Form */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 space-y-8 shadow-xl relative overflow-hidden">
            {/* Animated blue border effect */}
            <div className="absolute inset-0 rounded-3xl">
              <div className="absolute inset-0 rounded-3xl animate-pulse-blue"></div>
            </div>
            
            <div className="relative z-10 space-y-8">
            {/* URL Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Företagets webbplats
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://dittforetag.se"
                className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-900 rounded-2xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 placeholder-gray-500 font-medium"
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Dokument (valfritt)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-gray-400 transition-colors bg-gray-50">
                <div className="text-center">
                  <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    Excel (.xlsx), Word (.docx) • Max 10 MB
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Välj filer</span>
                    <input
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600">
                            {getFileIcon(file.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Problems */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Tre specifika utmaningar
              </label>
              <div className="space-y-4">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center font-bold text-white text-sm">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">Problem {idx + 1}</span>
                    </div>
                    <textarea
                      value={problems[idx]}
                      onChange={(e) => updateProblem(idx, e.target.value)}
                      placeholder={`T.ex. "Vi har svårt att rekrytera rätt kompetens inom 6 månader"`}
                      rows={2}
                      className="w-full px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-50 transition-all duration-200 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={startConsultation}
              disabled={!url || problems.filter(p => p.trim()).length < 3 || loading}
              className={`w-full py-4 rounded-2xl font-semibold transition-all duration-200 ${
                !url || problems.filter(p => p.trim()).length < 3 || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-md"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-700 border-t-black rounded-full animate-spin"></div>
                  Analyserar... {uploadProgress}%
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Starta AI-konsultation
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
            </div>
          </div>

          {/* Info section */}
          <div className="space-y-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Så fungerar det</h2>
            
            <div className="grid gap-8">
              {[
                {
                  num: "1",
                  title: "Analysera",
                  desc: "Vi skrapar webbplatsen och analyserar dokument"
                },
                {
                  num: "2", 
                  title: "Intervju",
                  desc: "AI ställer riktade följdfrågor om era problem"
                },
                {
                  num: "3",
                  title: "Lösningar",
                  desc: "Få färdiga AI-prompts eller bot-instruktioner"
                },
                {
                  num: "4",
                  title: "Implementera",
                  desc: "Detaljerade steg-för-steg instruktioner"
                }
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse-blue {
          0%, 100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); }
        }
      `}</style>
    </div>
  );
}

