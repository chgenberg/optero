"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px] bg-black" />
            <span className="text-xs font-medium text-[#4B5563] px-3">Steg 1</span>
            <div className="w-8 h-[2px] bg-[#E5E7EB]" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center relative">
            <h1 className="mb-2">Analysera din verksamhet</h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="absolute -right-8 top-0 p-2 hover:bg-[#F9FAFB] rounded-full transition-colors"
            >
              <Info className="w-4 h-4 text-[#4B5563]" />
            </button>
            
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-10 w-80 p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-lg text-left z-10"
              >
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  Vi analyserar din webbplats och dokument för att förstå din verksamhet 
                  och identifiera var AI kan göra störst skillnad.
                </p>
              </motion.div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-[#4B5563] block mb-2">
                Webbplats
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setUrl((v) => normalizeUrlInput(v))}
                placeholder="www.dittföretag.se"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#4B5563] block mb-2">
                E-post
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@företag.se"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors"
              />
            </div>
            
            {/* Document Upload */}
            <div>
              <label className="text-xs font-medium text-[#4B5563] block mb-2">
                Dokument <span className="text-[#9CA3AF] font-normal">(valfritt)</span>
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center hover:border-[#4B5563] transition-colors cursor-pointer"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#4B5563] mb-1">
                    Dra och släpp filer här
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    PDF, Word, Excel, PowerPoint
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="p-2 hover:bg-[#E5E7EB] rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-[#4B5563]" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 border-[#E5E7EB] rounded text-black focus:ring-black"
              />
              <span className="text-sm text-[#4B5563]">
                Jag godkänner{' '}
                <a 
                  href="/integritetspolicy-bot-builder" 
                  target="_blank"
                  className="text-black font-medium hover:underline"
                >
                  integritetspolicyn
                </a>
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-600 text-center font-medium">{error}</p>
            )}

            <div className="flex justify-center pt-4">
              <motion.button
                onClick={handleAnalyze}
                disabled={!url.trim() || !email.trim() || !consent || analyzing}
                whileHover={!analyzing && url && email && consent ? { scale: 1.02 } : {}}
                whileTap={!analyzing && url && email && consent ? { scale: 0.98 } : {}}
                className="btn-primary disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
              >
                {analyzing ? "Analyserar..." : "Analysera"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/business/bot-builder")}
            className="text-sm text-[#4B5563] hover:text-black transition-colors"
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}
