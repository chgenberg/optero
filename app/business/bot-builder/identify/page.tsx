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
      setError("Please fill in all fields");
      return;
    }
    
    if (!email.includes('@')) {
      setError("Invalid email");
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
      setError("Something went wrong");
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="flex justify-center mb-20">
          <div className="flex items-center gap-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 bg-black text-white font-bold text-xl flex items-center justify-center rounded-2xl shadow-xl"
            >
              01
            </motion.div>
            <div className="w-24 h-[2px] bg-gray-300" />
            <div className="w-16 h-16 bg-white text-gray-400 font-bold text-xl flex items-center justify-center rounded-2xl border-2 border-gray-200">
              02
            </div>
            <div className="w-24 h-[2px] bg-gray-300" />
            <div className="w-16 h-16 bg-white text-gray-400 font-bold text-xl flex items-center justify-center rounded-2xl border-2 border-gray-200">
              03
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center relative">
            <h1 className="text-5xl font-bold uppercase tracking-wider text-black mb-4">
              ANALYZE YOUR BUSINESS
            </h1>
            <p className="text-gray-600 uppercase tracking-wider text-sm">
              STEP 01 — IDENTIFY OPPORTUNITIES
            </p>
            
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="absolute -right-12 top-0 p-3 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Info className="w-5 h-5 text-gray-500" />
            </button>
            
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-16 w-96 p-8 bg-white rounded-2xl shadow-2xl text-left z-10"
              >
                <p className="text-sm text-gray-600 leading-relaxed">
                  We analyze your website and documents to understand your business
                  and identify where AI creates the most value. Our deep analysis
                  finds hidden opportunities for automation.
                </p>
              </motion.div>
            )}
          </div>
          
          {/* Form Card */}
          <div className="minimal-card animate-pulse-shadow p-12 space-y-10">
            <div>
              <label className="minimal-label">
                WEBSITE URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setUrl((v) => normalizeUrlInput(v))}
                placeholder="www.yourcompany.com"
                className="minimal-input"
              />
            </div>

            <div>
              <label className="minimal-label">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="minimal-input"
              />
            </div>
            
            {/* Document Upload */}
            <div>
              <label className="minimal-label">
                UPLOAD DOCUMENTS <span className="font-normal text-gray-400">(OPTIONAL)</span>
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-black transition-all duration-300 cursor-pointer"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
                    DRAG & DROP FILES HERE
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    PDF • WORD • EXCEL • POWERPOINT
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  {uploadedFiles.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-100 rounded-xl shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-bold uppercase">{file.name}</p>
                        <p className="text-xs text-gray-600 uppercase tracking-wider">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-black" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 border-2 border-gray-400 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I agree to the{' '}
                <a 
                  href="/privacy-policy-bot-builder" 
                  target="_blank"
                  className="text-black font-bold underline hover:no-underline"
                >
                  privacy policy
                </a>
              </span>
            </label>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 text-center font-bold uppercase"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <motion.button
              onClick={handleAnalyze}
              disabled={!url.trim() || !email.trim() || !consent || analyzing}
              whileHover={!analyzing && url && email && consent ? { scale: 1.02 } : {}}
              whileTap={!analyzing && url && email && consent ? { scale: 0.98 } : {}}
              className="minimal-button disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {analyzing ? "ANALYZING..." : "START ANALYSIS"}
            </motion.button>
          </div>
        </motion.div>

        <div className="text-center mt-16">
          <button
            onClick={() => router.push("/business/bot-builder")}
            className="text-sm text-gray-500 hover:text-black transition-colors uppercase tracking-wider"
          >
            ← BACK
          </button>
        </div>
      </div>
    </div>
  );
}