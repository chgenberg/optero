"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, FileSpreadsheet, FileType, X, Plus, Building2 } from "lucide-react";

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
    if (['xlsx', 'xls'].includes(ext || '')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (['docx', 'doc'].includes(ext || '')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <FileType className="w-5 h-5 text-gray-600" />;
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
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-20 sm:pt-24">
        <div className="space-y-12 max-w-5xl mx-auto w-full">
          {/* Hero section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-1000 group-hover:duration-200 animate-gradient-x overflow-hidden"></div>
            
            <div className="relative bg-white rounded-2xl p-8 sm:p-12">
              <div className="text-center animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                  <Building2 className="w-8 h-8 text-blue-700" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-wide">
                  Executive AI Consultant
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light px-4 sm:px-8 tracking-wide max-w-3xl mx-auto">
                  Djupgående AI-analys för ledningsgrupper. Ladda upp dokument, beskriv era utmaningar, få skräddarsydda lösningar.
                  <br/>
                  <span className="text-base sm:text-lg text-gray-500">Interaktiv konsultation. Konkreta implementationsplaner.</span>
                </p>
              </div>
              
              <div className="mt-12 space-y-8">
                {/* URL Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">
                    Företagets webbplats
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://dittforetag.se"
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 placeholder-gray-400 font-medium group-hover:border-gray-400"
                    />
                    <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">
                    Ladda upp dokument (valfritt)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Excel (.xlsx), Word (.docx) • Max 10 MB per fil
                      </p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
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
                      <div className="mt-4 space-y-2">
                        {files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.name)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(idx)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">
                    Beskriv tre specifika problem eller utmaningar
                  </label>
                  <div className="space-y-4">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="group">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center font-bold text-blue-700 text-sm">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-600">Problem {idx + 1}</span>
                        </div>
                        <textarea
                          value={problems[idx]}
                          onChange={(e) => updateProblem(idx, e.target.value)}
                          placeholder={`T.ex. "Vi har svårt att rekrytera rätt kompetens inom 6 månader" eller "Vår kundservice tar för lång tid att svara på ärenden"`}
                          rows={3}
                          className="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-xl focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none group-hover:border-gray-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={startConsultation}
                  disabled={!url || problems.filter(p => p.trim()).length < 3 || loading}
                  className={`group relative w-full py-4 text-lg rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${
                    !url || problems.filter(p => p.trim()).length < 3 || loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  }`}
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                        Förbereder konsultation... {uploadProgress}%
                      </span>
                    ) : (
                      "Starta AI-konsultation"
                    )}
                  </span>
                  {!loading && url && problems.filter(p => p.trim()).length >= 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="mt-16 animate-fade-in-up max-w-3xl mx-auto" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Så fungerar Executive Consultant</h2>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-transparent hidden sm:block"></div>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">Analysera företaget</h3>
                    <p className="text-sm text-gray-600">
                      Vi skrapar er webbplats och analyserar uppladdade dokument (strategier, rapporter, data).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">Interaktiv intervju</h3>
                    <p className="text-sm text-gray-600">
                      AI ställer riktade följdfrågor om era problem för att förstå situationen djupare.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">Djupgående lösningar</h3>
                    <p className="text-sm text-gray-600">
                      Få antingen färdiga AI-prompts eller kompletta instruktioner för att bygga specialiserade AI-botar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    4
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 mb-1">Implementationsplan</h3>
                    <p className="text-sm text-gray-600">
                      Detaljerade steg-för-steg instruktioner, kostnadsuppskattningar och förväntade resultat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

