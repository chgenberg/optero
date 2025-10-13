"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Info, Eye } from "lucide-react";

export default function CustomizeBotPage() {
  const router = useRouter();
  const [brand, setBrand] = useState({
    primaryColor: '#000000',
    secondaryColor: '#666666',
    fontFamily: 'system-ui',
    tone: 'professional',
    logoUrl: '',
    logoPosition: 'top-left',
    logoOffset: { x: 20, y: 20 },
    fontUrl: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const problemData = sessionStorage.getItem("botProblemData");
    const url = sessionStorage.getItem("botWebsiteUrl");
    
    if (!problemData || !url) {
      router.push("/business/bot-builder");
      return;
    }

    // Auto-detect brand
    detectBrand(url);
  }, [router]);

  const detectBrand = async (url: string) => {
    try {
      const res = await fetch('/api/bots/detect-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.brand) {
        setBrand({
          ...brand,
          ...data.brand,
          logoOffset: data.brand.logoOffset || { x: 20, y: 20 }
        });
      }
    } catch (error) {
      console.error('Brand detection failed:', error);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/uploads/logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.logoUrl) {
        setBrand(prev => ({ ...prev, logoUrl: data.logoUrl }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const allowed = Array.from(files).filter(f => {
      const n = f.name.toLowerCase();
      return n.endsWith('.pdf') || n.endsWith('.docx') || n.endsWith('.doc') || 
             n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.txt');
    });
    setUploadedFiles(prev => [...prev, ...allowed]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    sessionStorage.setItem("botBrandConfig", JSON.stringify(brand));
    
    // Process additional documents if any
    if (uploadedFiles.length > 0) {
      const fd = new FormData();
      uploadedFiles.forEach(f => fd.append('files', f));
      
      try {
        const res = await fetch('/api/business/upload-documents', {
          method: 'POST',
          body: fd
        });
        
        if (res.ok) {
          const data = await res.json();
          const existingDocs = sessionStorage.getItem("botDocuments") || "";
          sessionStorage.setItem("botDocuments", existingDocs + "\n\n" + data.content);
        }
      } catch (error) {
        console.error('Document upload error:', error);
      }
    }
    
    sessionStorage.setItem("botAdditionalInfo", additionalInfo);
    router.push("/business/bot-builder/solution");
  };

  const colors = ['#000000', '#1E40AF', '#DC2626', '#059669', '#7C3AED', '#D97706'];
  const fonts = [
    { value: 'system-ui', label: 'SYSTEM' },
    { value: 'serif', label: 'SERIF' },
    { value: 'mono', label: 'MONO' }
  ];
  const tones = [
    { value: 'professional', label: 'PROFESSIONELL' },
    { value: 'casual', label: 'VARDAGLIG' },
    { value: 'formal', label: 'FORMELL' }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-gray-300" />
            <div className="text-xs uppercase tracking-widest">STEG 3</div>
            <div className="w-8 h-[1px] bg-gray-300" />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-thin uppercase tracking-wider">
            ANPASSA DIN BOT
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Configuration */}
          <div className="space-y-8">
            {/* Brand Colors */}
            <div className="relative">
              <h3 className="text-xs uppercase tracking-widest mb-4">
                VARUMÄRKE
                <button
                  onClick={() => setShowInfo(showInfo === 'brand' ? null : 'brand')}
                  className="ml-3 p-1 hover:bg-gray-100 rounded-full inline-flex"
                >
                  <Info className="w-3 h-3" />
                </button>
              </h3>
              
              {showInfo === 'brand' && (
                <div className="absolute left-0 top-8 w-64 p-4 bg-white border border-gray-200 shadow-lg z-10">
                  <p className="text-xs text-gray-600">
                    Anpassa botens utseende efter ditt varumärke. Vi har automatiskt detekterat färger från din webbplats.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 mb-4">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setBrand({ ...brand, primaryColor: color })}
                    className={`w-10 h-10 border-2 transition-all ${
                      brand.primaryColor === color ? 'border-black' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Logo Upload */}
              <div className="mt-6">
                <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                  Logotyp
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) await uploadLogo(file);
                  }}
                  className="border border-gray-300 p-8 text-center hover:border-black transition-colors cursor-pointer"
                >
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await uploadLogo(file);
                      }}
                      className="hidden"
                    />
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt="Logo" className="h-12 mx-auto mb-2" />
                    ) : (
                      <div className="w-8 h-8 border border-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <p className="text-xs uppercase tracking-widest text-gray-600">
                      {brand.logoUrl ? 'Byt logo' : 'Ladda upp logo'}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Tone */}
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-4">Tonalitet</h3>
              <div className="flex gap-3">
                {tones.map(tone => (
                  <button
                    key={tone.value}
                    onClick={() => setBrand({ ...brand, tone: tone.value })}
                    className={`px-6 py-3 border text-xs uppercase tracking-widest transition-all ${
                      brand.tone === tone.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Training */}
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-4">
                Specifik träning
                <span className="ml-2 text-gray-400 normal-case tracking-normal">(valfritt)</span>
              </h3>
              
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                className="border border-gray-300 p-6 text-center hover:border-black transition-colors cursor-pointer mb-4"
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.txt"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <p className="text-xs uppercase tracking-widest text-gray-600">
                    Ladda upp dokument
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    FAQ, manualer, prislista etc.
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mb-4">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm">{file.name}</span>
                      <button
                        onClick={() => removeFile(i)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Beskriv speciella instruktioner, vanliga frågor, eller annat som boten ska veta..."
                className="w-full p-4 border border-gray-300 focus:border-black outline-none transition-colors resize-none h-32 text-sm"
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            <div className="sticky top-6">
              <h3 className="text-xs uppercase tracking-widest mb-4 flex items-center justify-between">
                Förhandsvisning
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </h3>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div 
                  className="p-4 text-white"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  <div className="flex items-center gap-3">
                    {brand.logoUrl && (
                      <img src={brand.logoUrl} alt="Logo" className="h-8 invert" />
                    )}
                    <div>
                      <p className="font-medium">Support</p>
                      <p className="text-xs opacity-80">Alltid aktiv</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 min-h-[300px]">
                  <div className="bg-white rounded-lg p-3 mb-3 inline-block">
                    <p className="text-sm" style={{ fontFamily: brand.fontFamily }}>
                      {brand.tone === 'formal' 
                        ? 'God dag! Hur kan jag bistå er idag?'
                        : brand.tone === 'casual'
                        ? 'Hej! Vad kan jag hjälpa till med? 😊'
                        : 'Hej! Hur kan jag hjälpa dig idag?'}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <input
                    type="text"
                    placeholder="Skriv ett meddelande..."
                    className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-16">
          <button
            onClick={() => router.push("/business/bot-builder/analyze")}
            className="px-12 py-4 border border-gray-300 text-xs uppercase tracking-widest hover:border-black transition-colors"
          >
            Tillbaka
          </button>
          <button
            onClick={handleContinue}
            className="px-16 py-4 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-900 transition-colors"
          >
            Bygg bot
          </button>
        </div>
      </div>
    </div>
  );
}