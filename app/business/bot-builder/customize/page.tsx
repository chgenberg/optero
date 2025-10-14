"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X, Info, Plus } from "lucide-react";

export default function CustomizeBotPage() {
  const router = useRouter();
  const [brand, setBrand] = useState({
    primaryColor: '#000000',
    secondaryColor: '#666666',
    fontFamily: 'Inter',
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
  // Interaction config
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [newQuickReply, setNewQuickReply] = useState<string>("");
  const [ctaLabel, setCtaLabel] = useState<string>("Boka demo");
  const [ctaUrl, setCtaUrl] = useState<string>("");
  // Advanced response controls
  const [responseLength, setResponseLength] = useState<'short'|'normal'|'long'>('normal');
  const [fallbackText, setFallbackText] = useState<string>("");
  // Working hours
  const [startHour, setStartHour] = useState<number>(8);
  const [endHour, setEndHour] = useState<number>(17);
  const [offHoursMessage, setOffHoursMessage] = useState<string>('Vi är offline just nu. Lämna gärna din e‑post så återkommer vi.');
  // Custom buttons
  type CustomButton = { label: string; url: string };
  const [customButtons, setCustomButtons] = useState<CustomButton[]>([]);
  const [newBtnLabel, setNewBtnLabel] = useState<string>('');
  const [newBtnUrl, setNewBtnUrl] = useState<string>('');

  useEffect(() => {
    const problemData = sessionStorage.getItem("botProblemData");
    const url = sessionStorage.getItem("botWebsiteUrl");
    
    if (!problemData || !url) {
      router.push("/business/bot-builder");
      return;
    }

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
    // Save brand + interaction config
    const brandWithInteraction = { 
      ...brand, 
      welcomeMessage, 
      quickReplies,
      responseLength,
      fallbackText,
      workingHours: { startHour, endHour, offHoursMessage },
      buttons: customButtons
    };
    sessionStorage.setItem("botBrandConfig", JSON.stringify(brandWithInteraction));
    
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

    // Save integrations (CTA / Calendly)
    try {
      const existing = JSON.parse(sessionStorage.getItem("botIntegrations") || '{}');
      const merged = { ...existing, calendlyUrl: ctaUrl || null, ctaLabel: ctaLabel || null };
      sessionStorage.setItem("botIntegrations", JSON.stringify(merged));
    } catch {}
    router.push("/business/bot-builder/solution");
  };

  const colors = ['#000000', '#1E40AF', '#DC2626', '#059669', '#7C3AED', '#D97706'];
  const tones = [
    { value: 'professional', label: 'Professionell' },
    { value: 'casual', label: 'Vardaglig' },
    { value: 'formal', label: 'Formell' }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px] bg-[#E5E7EB]" />
            <span className="text-xs font-medium text-[#4B5563] px-3">Steg 3</span>
            <div className="w-8 h-[2px] bg-[#E5E7EB]" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1>Anpassa din bot</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left - Configuration */}
            <div className="space-y-8">
              {/* Brand */}
              <div className="card relative">
                <div className="flex items-center justify-between mb-4">
                  <h3>Varumärke</h3>
                  <button
                    onClick={() => setShowInfo(showInfo === 'brand' ? null : 'brand')}
                    className="p-2 hover:bg-[#F9FAFB] rounded-full transition-colors"
                  >
                    <Info className="w-4 h-4 text-[#9CA3AF]" />
                  </button>
                </div>
                
                {showInfo === 'brand' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute left-0 right-0 top-full mt-2 p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10"
                  >
                    <p className="text-sm text-[#4B5563] leading-relaxed">
                      Anpassa botens utseende efter ditt varumärke. Vi har automatiskt 
                      detekterat färger från din webbplats.
                    </p>
                  </motion.div>
                )}
                
                <div className="flex gap-3 mb-6">
                  {colors.map(color => (
                    <motion.button
                      key={color}
                      onClick={() => setBrand({ ...brand, primaryColor: color })}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        brand.primaryColor === color ? 'border-black scale-110' : 'border-[#E5E7EB]'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Logo */}
                <div>
                  <label className="text-xs font-medium text-[#4B5563] block mb-3">
                    Logotyp
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) await uploadLogo(file);
                    }}
                    className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center hover:border-[#4B5563] transition-colors cursor-pointer"
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
                        <img src={brand.logoUrl} alt="Logo" className="h-16 mx-auto mb-3" />
                      ) : (
                        <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
                      )}
                      <p className="text-sm font-medium text-[#4B5563]">
                        {brand.logoUrl ? 'Byt logo' : 'Ladda upp logo'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tone */}
              <div className="card">
                <h3 className="mb-4">Tonalitet</h3>
                <div className="flex gap-3">
                  {tones.map(tone => (
                    <motion.button
                      key={tone.value}
                      onClick={() => setBrand({ ...brand, tone: tone.value })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all ${
                        brand.tone === tone.value
                          ? 'border-black bg-black text-white'
                          : 'border-[#E5E7EB] hover:border-[#4B5563]'
                      }`}
                    >
                      {tone.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Training */}
              <div className="card">
                <h3 className="mb-4">
                  Specifik träning
                  <span className="ml-2 text-[#9CA3AF] font-normal text-sm">(valfritt)</span>
                </h3>
                
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileSelect(e.dataTransfer.files);
                  }}
                  className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-6 text-center hover:border-[#4B5563] transition-colors cursor-pointer mb-4"
                >
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.xlsx,.xls,.txt"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <p className="text-sm font-medium text-[#4B5563] mb-1">
                      Ladda upp dokument
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      FAQ, manualer, prislista
                    </p>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {uploadedFiles.map((file, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg"
                      >
                        <span className="text-sm">{file.name}</span>
                        <button
                          onClick={() => removeFile(i)}
                          className="p-1 hover:bg-[#E5E7EB] rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-[#4B5563]" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Beskriv speciella instruktioner eller vanliga frågor som boten ska kunna svara på..."
                  className="w-full p-4 border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors resize-none h-32 text-sm"
                />
              </div>

              {/* Interaction */}
              <div className="card">
                <h3 className="mb-4">Interaktion</h3>

                {/* Welcome message */}
                <div className="mb-6">
                  <label className="text-xs font-medium text-[#4B5563] block mb-2">Välkomstmeddelande</label>
                  <input
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Hej! Hur kan jag hjälpa dig idag?"
                    className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors text-sm"
                  />
                </div>

                {/* Quick replies */}
                <div className="mb-6">
                  <label className="text-xs font-medium text-[#4B5563] block mb-2">Föreslagna frågor</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={newQuickReply}
                      onChange={(e) => setNewQuickReply(e.target.value)}
                      placeholder="Lägg till förslag..."
                      className="flex-1 px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const v = (newQuickReply || '').trim();
                        if (!v) return;
                        setQuickReplies(prev => Array.from(new Set([...prev, v])).slice(0, 6));
                        setNewQuickReply("");
                      }}
                      className="px-3 py-2 border border-[#E5E7EB] rounded-xl hover:border-black transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((q, i) => (
                        <span key={i} className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-full inline-flex items-center gap-2">
                          {q}
                          <button onClick={() => setQuickReplies(prev => prev.filter((_, idx) => idx !== i))} className="text-[#9CA3AF] hover:text-black">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA / Calendly */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#4B5563] block mb-2">CTA‑text</label>
                    <input
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      placeholder="Boka demo"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#4B5563] block mb-2">CTA‑länk (Calendly)</label>
                    <input
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://calendly.com/.."
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Response policy */}
              <div className="card">
                <h3 className="mb-4">Svarspolicy</h3>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  {[
                    { key: 'short', label: 'Kort' },
                    { key: 'normal', label: 'Normal' },
                    { key: 'long', label: 'Lång' }
                  ].map((opt: any) => (
                    <button
                      key={opt.key}
                      onClick={() => setResponseLength(opt.key)}
                      className={`px-4 py-2 border-2 rounded-xl text-sm font-medium ${responseLength===opt.key ? 'border-black bg-black text-white' : 'border-[#E5E7EB] hover:border-[#4B5563]'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <label className="text-xs font-medium text-[#4B5563] block mb-2">Fallback‑svar</label>
                <input
                  value={fallbackText}
                  onChange={(e) => setFallbackText(e.target.value)}
                  placeholder="Jag är osäker på det. Vill du lämna din e‑post så återkommer vi?"
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl focus:border-black focus:outline-none transition-colors text-sm"
                />
              </div>

              {/* Working hours */}
              <div className="card">
                <h3 className="mb-4">Öppettider</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-[#4B5563] block mb-1">Start</label>
                    <input type="number" min={0} max={23} value={startHour} onChange={(e)=>setStartHour(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-black outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#4B5563] block mb-1">Slut</label>
                    <input type="number" min={0} max={23} value={endHour} onChange={(e)=>setEndHour(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-black outline-none text-sm" />
                  </div>
                </div>
                <label className="text-xs font-medium text-[#4B5563] block mb-2">Meddelande utanför öppettider</label>
                <input value={offHoursMessage} onChange={(e)=>setOffHoursMessage(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl focus:border-black outline-none text-sm" />
              </div>

              {/* Custom buttons */}
              <div className="card">
                <h3 className="mb-4">Chat‑knappar</h3>
                <div className="flex gap-2 mb-3">
                  <input value={newBtnLabel} onChange={(e)=>setNewBtnLabel(e.target.value)} placeholder="Etikett (t.ex. Priser)" className="flex-1 px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-black outline-none text-sm" />
                  <input value={newBtnUrl} onChange={(e)=>setNewBtnUrl(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-black outline-none text-sm" />
                  <button onClick={()=>{ if(!newBtnLabel||!newBtnUrl) return; setCustomButtons(prev=>[...prev, {label:newBtnLabel, url:newBtnUrl}]); setNewBtnLabel(''); setNewBtnUrl(''); }} className="px-3 py-2 border border-[#E5E7EB] rounded-xl hover:border-black">Lägg till</button>
                </div>
                {customButtons.length>0 && (
                  <div className="flex flex-wrap gap-2">
                    {customButtons.map((b, i)=>(
                      <span key={i} className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-full inline-flex items-center gap-2">
                        {b.label}
                        <button onClick={()=>setCustomButtons(prev=>prev.filter((_,idx)=>idx!==i))} className="text-[#9CA3AF] hover:text-black">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Preview */}
            <div>
              <div className="sticky top-6">
                <h3 className="mb-4">Förhandsvisning</h3>
                
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                  <div 
                    className="p-4 text-white"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    <div className="flex items-center gap-3">
                      {brand.logoUrl && (
                        <img src={brand.logoUrl} alt="Logo" className="h-8 brightness-0 invert" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">Support</p>
                        <p className="text-xs opacity-80">Alltid aktiv</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#F9FAFB] min-h-[300px]">
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 inline-block shadow-sm">
                      <p className="text-sm" style={{ fontFamily: brand.fontFamily }}>
                        {brand.tone === 'formal' 
                          ? 'God dag! Hur kan jag bistå er idag?'
                          : brand.tone === 'casual'
                          ? 'Hej! Vad kan jag hjälpa till med?'
                          : 'Hej! Hur kan jag hjälpa dig idag?'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-[#E5E7EB]">
                    <input
                      type="text"
                      placeholder="Skriv ett meddelande..."
                      className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-full text-sm"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-12">
            <motion.button
              onClick={() => router.push("/business/bot-builder/analyze")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary"
            >
              Tillbaka
            </motion.button>
            <motion.button
              onClick={handleContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
            >
              Bygg bot
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
