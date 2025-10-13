"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Info } from "lucide-react";

export default function IdentifyProblem() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  const normalizeUrlInput = (value: string): string => {
    let v = (value || "").trim();
    if (!v) return v;
    if (/^www\./i.test(v)) v = `https://${v}`;
    if (!/^https?:\/\//i.test(v) && /\./.test(v)) v = `https://${v}`;
    try {
      const u = new URL(v);
      const hostLower = u.hostname.toLowerCase();
      return `${u.protocol}//${hostLower}${u.port ? `:${u.port}` : ""}${u.pathname}${u.search}${u.hash}`;
    } catch {
      return v;
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const allowed = Array.from(files).filter(f => {
      const n = f.name.toLowerCase();
      return n.endsWith('.pdf') || n.endsWith('.docx') || n.endsWith('.doc') || 
             n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.txt') ||
             n.endsWith('.pptx') || n.endsWith('.ppt');
    });
    setUploadedFiles(prev => [...prev, ...allowed]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!url.trim() || !email.trim() || !consent) {
      setError("Fyll i alla fält");
      return;
    }
    
    if (!email.includes('@')) {
      setError("Ogiltig e-post");
      return;
    }

    const normalizedUrl = normalizeUrlInput(url);
    setAnalyzing(true);
    setError("");
    
    try {
      const userRes = await fetch('/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!userRes.ok) throw new Error('Failed to create user');
      const userData = await userRes.json();
      
      let documentContent = "";
      if (uploadedFiles.length > 0) {
        const fd = new FormData();
        uploadedFiles.forEach(f => fd.append('files', f));
        
        const docRes = await fetch('/api/business/upload-documents', {
          method: 'POST',
          body: fd
        });
        
        if (docRes.ok) {
          const docData = await docRes.json();
          documentContent = docData.content || "";
        }
      }
      
      sessionStorage.setItem("botUserEmail", email);
      sessionStorage.setItem("botUserId", userData.userId);
      sessionStorage.setItem("botWebsiteUrl", normalizedUrl);
      sessionStorage.setItem("botDocuments", documentContent);
      sessionStorage.setItem("botDocumentFiles", JSON.stringify(uploadedFiles.map(f => f.name)));
      
      router.push("/business/bot-builder/analyze");
    } catch (error) {
      console.error("Error:", error);
      setError("Något gick fel");
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Progress */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-black" />
            <div className="text-xs uppercase tracking-widest">STEG 1</div>
            <div className="w-8 h-[1px] bg-gray-300" />
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center relative">
            <h1 className="text-3xl font-thin uppercase tracking-wider mb-3">
              ANALYSERA DIN VERKSAMHET
            </h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="absolute -right-8 top-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
            
            {showInfo && (
              <div className="absolute right-0 top-10 w-72 p-4 bg-white border border-gray-200 rounded-lg shadow-lg text-left">
                <p className="text-sm text-gray-600">
                  Vi analyserar din webbplats och dokument för att förstå din verksamhet och identifiera var AI kan göra störst skillnad.
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                Webbplats
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setUrl((v) => normalizeUrlInput(v))}
                placeholder="www.dittföretag.se"
                className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:border-black outline-none transition-colors text-lg"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                E-post
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@företag.se"
                className="w-full px-0 py-3 bg-transparent border-b border-gray-300 focus:border-black outline-none transition-colors text-lg"
              />
            </div>
            
            {/* Document Upload */}
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                Dokument
                <span className="ml-2 text-gray-400 normal-case tracking-normal">(valfritt)</span>
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                className="border border-gray-300 rounded-none p-12 text-center hover:border-black transition-colors cursor-pointer"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-8 h-8 border border-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-gray-600">
                    Släpp filer här
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 border-gray-300 rounded-none text-black focus:ring-0"
              />
              <span className="text-xs text-gray-600">
                Jag godkänner{' '}
                <a 
                  href="/integritetspolicy-bot-builder" 
                  target="_blank"
                  className="underline hover:text-black"
                >
                  integritetspolicyn
                </a>
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-600 text-center uppercase tracking-widest">{error}</p>
            )}

            <div className="flex justify-center pt-8">
              <button
                onClick={handleAnalyze}
                disabled={!url.trim() || !email.trim() || !consent || analyzing}
                className="px-16 py-4 bg-black text-white text-xs uppercase tracking-widest disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {analyzing ? "Analyserar..." : "Analysera"}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => router.push("/business/bot-builder")}
            className="text-xs text-gray-500 hover:text-black transition-colors"
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}