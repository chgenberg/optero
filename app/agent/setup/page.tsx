"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, Check, ArrowRight, X } from "lucide-react";

export default function AgentSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [step, setStep] = useState<"scraping" | "documents" | "ready">("scraping");
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [botId, setBotId] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("agentEmail");
    const storedUrl = sessionStorage.getItem("agentCompanyUrl");
    
    if (!storedEmail || !storedUrl) {
      router.push("/agent");
      return;
    }
    
    setEmail(storedEmail);
    setCompanyUrl(storedUrl);
    startScraping(storedUrl);
  }, []);

  const startScraping = async (url: string) => {
    // Simulate progress
    const interval = setInterval(() => {
      setScrapeProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.random() * 15;
      });
    }, 500);

    try {
      const scrapeRes = await fetch("/api/business/deep-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      
      const scrapeData = await scrapeRes.json();
      setScrapeProgress(100);
      
      // Store scrape data
      sessionStorage.setItem("agentScrapeData", JSON.stringify(scrapeData));
      
      setTimeout(() => setStep("documents"), 1000);
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("files", file));

    try {
      const res = await fetch("/api/business/upload-documents", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (data.content) {
        setDocumentContent(data.content);
        setUploadedFiles(Array.from(files));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const buildBot = async () => {
    const scrapeData = JSON.parse(sessionStorage.getItem("agentScrapeData") || "{}");
    
    const res = await fetch("/api/bots/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consult: {
          url: companyUrl,
          pages: scrapeData.pages || [],
          websiteSummary: scrapeData.analysis || {},
          documentsContent: documentContent,
          documentFiles: uploadedFiles.map(f => f.name),
          userEmail: email,
          botType: "knowledge",
          botSubtype: "pro"
        }
      })
    });
    
    const data = await res.json();
    if (data.botId) {
      setBotId(data.botId);
      setStep("ready");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Setting up your assistant</h1>
            <div className="text-sm text-gray-600">{email}</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Scraping Step */}
          {step === "scraping" && (
            <motion.div
              key="scraping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <motion.div
                  className="w-24 h-24 bg-black rounded-full mx-auto mb-6 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-2">Learning from your website</h2>
                <p className="text-gray-600">{companyUrl}</p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-full h-3 overflow-hidden border border-gray-200">
                  <motion.div
                    className="bg-gray-700 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${scrapeProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{Math.round(scrapeProgress)}% complete</p>
              </div>
            </motion.div>
          )}

          {/* Documents Step */}
          {step === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Add your documents</h2>
                <p className="text-gray-600">Help your assistant learn more about your company</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <motion.div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-black");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("border-black");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-black");
                    if (e.dataTransfer.files) {
                      handleFileUpload(e.dataTransfer.files);
                    }
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-gray-500">PDF, Word, Excel, PowerPoint, Text files</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  />
                </motion.div>

                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 space-y-2"
                  >
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="flex-1 text-sm">{file.name}</span>
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => buildBot()}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Skip this step
                  </button>
                  
                  <motion.button
                    onClick={() => buildBot()}
                    disabled={uploadedFiles.length === 0}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex-1 bg-black text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Ready Step */}
          {step === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-green-600" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-2">Your assistant is ready!</h2>
              <p className="text-gray-600 mb-8">Start chatting with your intelligent company assistant</p>
              
              <motion.button
                onClick={() => router.push(`/agent/chat/${botId}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-white px-8 py-4 rounded-lg font-medium inline-flex items-center gap-2"
              >
                Open Assistant
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
