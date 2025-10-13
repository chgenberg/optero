"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText } from "lucide-react";

export default function IdentifyProblem() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState("");

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
      setError("Fyll i alla fält och godkänn integritetspolicyn");
      return;
    }
    
    if (!email.includes('@')) {
      setError("Ange en giltig e-postadress");
      return;
    }

    const normalizedUrl = normalizeUrlInput(url);
    setAnalyzing(true);
    setError("");
    
    try {
      // Create user
      const userRes = await fetch('/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!userRes.ok) throw new Error('Failed to create user');
      const userData = await userRes.json();
      
      // Upload documents if any
      let documentContent = "";
      if (uploadedFiles.length > 0) {
        setUploadProgress(`Bearbetar ${uploadedFiles.length} dokument...`);
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
      
      // Store everything
      sessionStorage.setItem("botUserEmail", email);
      sessionStorage.setItem("botUserId", userData.userId);
      sessionStorage.setItem("botWebsiteUrl", normalizedUrl);
      sessionStorage.setItem("botDocuments", documentContent);
      sessionStorage.setItem("botDocumentFiles", JSON.stringify(uploadedFiles.map(f => f.name)));
      
      router.push("/business/bot-builder/analyze");
    } catch (error) {
      console.error("Error:", error);
      setError("Ett fel uppstod. Försök igen.");
      setAnalyzing(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <div className="minimal-box">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            Låt oss börja med din webbplats
          </h2>
          
          <div className="space-y-6">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setUrl((v) => normalizeUrlInput(v))}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleAnalyze(); }}
              placeholder="https://dinwebbplats.se"
              className="w-full px-6 py-4 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.se"
              className="w-full px-6 py-4 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
            />
            
            {/* Document Upload */}
            <div>
              <label className="text-sm text-gray-600 mb-3 block">
                Dokument om ditt företag (valfritt)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Dra in filer eller klicka för att välja
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, Word, Excel, PowerPoint, Text
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-3">
                💡 Ladda upp produktkataloger, prislistor, FAQ, branschinfo för att göra boten smartare
              </p>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">
                Jag godkänner att ni skapar ett konto, analyserar min webbplats och dokument samt lagrar data enligt{' '}
                <a 
                  href="/integritetspolicy-bot-builder" 
                  target="_blank"
                  className="text-black underline hover:text-gray-700"
                >
                  integritetspolicyn
                </a>
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            
            {uploadProgress && (
              <p className="text-sm text-blue-600 text-center">{uploadProgress}</p>
            )}
            
            <p className="text-sm text-gray-600 text-center">
              Vi analyserar din webbplats och dokument djupgående för att förstå ditt företag
            </p>

            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!url.trim() || !email.trim() || !consent || analyzing}
                className="btn-minimal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? "Analyserar..." : "Fortsätt"}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/business/bot-builder")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}
