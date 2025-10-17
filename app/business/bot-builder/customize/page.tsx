"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X, Info, Plus, Check, Palette, Type, MessageSquare, Clock, Link2, Key, ExternalLink } from "lucide-react";
import Stepper from "@/components/Stepper";

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
  const [customHex, setCustomHex] = useState('#000000');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [activeTab, setActiveTab] = useState<'brand'|'interaction'|'advanced'>('brand');
  const [botName, setBotName] = useState<string>('');
  
  // Bot type
  const [botType, setBotType] = useState<string>('knowledge');
  const [botSubtype, setBotSubtype] = useState<string>('');
  
  // Interaction config
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [newQuickReply, setNewQuickReply] = useState<string>("");
  const [ctaLabel, setCtaLabel] = useState<string>("Book a demo");
  const [ctaUrl, setCtaUrl] = useState<string>("");
  
  // Advanced response controls
  const [responseLength, setResponseLength] = useState<'short'|'normal'|'long'>('normal');
  const [fallbackText, setFallbackText] = useState<string>("");
  const [startHour, setStartHour] = useState<number>(9);
  const [endHour, setEndHour] = useState<number>(17);
  const [offHoursMessage, setOffHoursMessage] = useState<string>('We are offline right now. Please leave your message.');
  
  // Custom buttons
  type CustomButton = { label: string; url: string };
  const [customButtons, setCustomButtons] = useState<CustomButton[]>([]);
  
  // Type-specific settings
  const [leadRequiredFields, setLeadRequiredFields] = useState({
    email: true,
    phone: false,
    name: true,
    company: false
  });
  const [supportCategories, setSupportCategories] = useState<string[]>(['Technical', 'Billing', 'General']);
  const [bookingServices, setBookingServices] = useState<string[]>(['Consultation', 'Demo']);
  const [ecommerceRecommendations, setEcommerceRecommendations] = useState(true);
  const [knowledgeCiteSources, setKnowledgeCiteSources] = useState(false);

  useEffect(() => {
    const storedType = sessionStorage.getItem("selectedBotType");
    const storedSubtype = sessionStorage.getItem("selectedBotSubtype");
    
    if (storedType) {
      setBotType(storedType);
      setBotSubtype(storedSubtype || '');
      
      // Set default bot names based on type
      const nameDefaults: Record<string, string> = {
        'lead': 'Sales Assistant',
        'support': 'Support Agent',
        'workflow': 'Process Helper',
        'knowledge': 'Knowledge Expert'
      };
      setBotName(nameDefaults[storedType] || 'AI Assistant');
      
      // Set default welcome messages based on type
      const welcomeDefaults: Record<string, string> = {
        'lead': 'Hi! I can help you find the perfect solution for your needs.',
        'support': 'Hello! How can I assist you today?',
        'workflow': 'Welcome! I\'m here to help you get things done quickly.',
        'knowledge': 'Hi there! Ask me anything about our products and services.'
      };
      setWelcomeMessage(welcomeDefaults[storedType] || welcomeDefaults.knowledge);
    } else {
      // Default to Support Standard
      setBotType('support');
      setBotSubtype('it_helpdesk');
      setBotName('Support Agent');
      setWelcomeMessage('Hello! How can I assist you today?');
      sessionStorage.setItem('selectedBotType', 'support');
      sessionStorage.setItem('selectedBotSubtype', 'it_helpdesk');
      // Provide sensible support defaults
      setSupportCategories(['Technical', 'Billing', 'General']);
    }
    
    detectBrand();
  }, []);

  const detectBrand = async () => {
    const url = sessionStorage.getItem("botWebsiteUrl");
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch('/api/bots/detect-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      if (data.brand) {
        setBrand({
          ...brand,
          ...data.brand,
          logoOffset: data.brand.logoOffset || { x: 20, y: 20 }
        });
        setCustomHex(data.brand.primaryColor || '#000000');
      }
    } catch (error) {
      console.error('Brand detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await fetch('/api/uploads/logo', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setBrand({ ...brand, logoUrl: data.url });
      }
    } catch (error) {
      console.error('Logo upload error:', error);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const imageFile = Array.from(files).find(f => 
      f.type.startsWith('image/')
    );
    if (imageFile) {
      uploadLogo(imageFile);
    }
  };

  const updateHexColor = (hex: string) => {
    const validHex = /^#[0-9A-F]{6}$/i.test(hex);
    if (validHex) {
      setCustomHex(hex);
      setBrand({ ...brand, primaryColor: hex });
    }
  };

  const addQuickReply = () => {
    if (newQuickReply.trim() && quickReplies.length < 3) {
      setQuickReplies([...quickReplies, newQuickReply.trim()]);
      setNewQuickReply("");
    }
  };

  const addCustomButton = () => {
    const label = prompt("Button text:");
    const url = prompt("Button URL:");
    if (label && url) {
      setCustomButtons([...customButtons, { label, url }]);
    }
  };

  const handleContinue = () => {
    sessionStorage.setItem("botBrandConfig", JSON.stringify({
      ...brand,
      botName: botName || 'AI Assistant',
      welcomeMessage,
      quickReplies,
      responseLength,
      fallbackText: fallbackText || `I don't have information about that. Would you like to speak with our team?`,
      workingHoursStart: startHour,
      workingHoursEnd: endHour,
      offHoursMessage,
      customButtons
    }));
    
    sessionStorage.setItem("botIntegrations", JSON.stringify({
      calendlyUrl: ctaUrl || '',
      ctaLabel: ctaLabel || ''
    }));
    
    const typeSettings = {
      lead: leadRequiredFields,
      support: { categories: supportCategories },
      workflow: { 
        booking: { services: bookingServices },
        ecommerce: { recommendations: ecommerceRecommendations }
      },
      knowledge: { citeSources: knowledgeCiteSources }
    };
    
    sessionStorage.setItem("botTypeSettings", JSON.stringify(typeSettings));
    sessionStorage.setItem("botAdditionalContext", additionalInfo);
    
    router.push("/business/bot-builder/integrations");
  };

  const colorPresets = [
    { name: 'BLACK', hex: '#000000' },
    { name: 'GRAY', hex: '#6B7280' },
    { name: 'BLUE', hex: '#3B82F6' },
    { name: 'GREEN', hex: '#10B981' },
    { name: 'RED', hex: '#EF4444' }
  ];

  const fontPresets = [
    { name: 'INTER', value: 'Inter' },
    { name: 'HELVETICA', value: 'Helvetica' },
    { name: 'GEORGIA', value: 'Georgia' },
    { name: 'MONO', value: 'monospace' }
  ];

  const tonePresets = [
    { name: 'PROFESSIONAL', value: 'professional' },
    { name: 'FRIENDLY', value: 'casual' },
    { name: 'FORMAL', value: 'formal' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper currentStep={2} steps={['Overview', 'Choose', 'Customize', 'Integrations', 'Test', 'Launch']} />
      
      <div className="max-w-6xl mx-auto p-4 md:p-8">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            CUSTOMIZE YOUR BOT
          </h1>
          <p className="text-gray-600 uppercase tracking-wider text-xs md:text-sm">
            STEP 02 — BRAND & BEHAVIOR
          </p>
        </motion.div>

        {/* Bot Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="minimal-card">
            <label className="minimal-label">
              BOT NAME
            </label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Give your bot a name..."
              className="minimal-input text-center text-2xl font-bold"
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              This name will be displayed in the chat header
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto">
          <div className="inline-flex bg-white rounded-xl shadow-sm p-1 min-w-fit">
            {(['brand', 'interaction', 'advanced'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-8 py-2 md:py-3 rounded-lg uppercase tracking-wider text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-black text-white' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab === 'brand' && <Palette className="w-4 h-4 inline mr-2" />}
                {tab === 'interaction' && <MessageSquare className="w-4 h-4 inline mr-2" />}
                {tab === 'advanced' && <Clock className="w-4 h-4 inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Settings */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {activeTab === 'brand' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Colors */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">COLORS</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="minimal-label mb-4">PRESET COLORS</label>
                      <div className="flex gap-2 md:gap-4 flex-wrap">
                        {colorPresets.map(color => (
                          <button
                            key={color.hex}
                            onClick={() => updateHexColor(color.hex)}
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 transition-all duration-300 ${
                              brand.primaryColor === color.hex ? 'border-black scale-110 shadow-lg' : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color.hex }}
                          >
                            <span className="sr-only">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="minimal-label">CUSTOM HEX COLOR</label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="text"
                          value={customHex}
                          onChange={(e) => setCustomHex(e.target.value)}
                          onBlur={(e) => updateHexColor(e.target.value)}
                          placeholder="#000000"
                          className="minimal-input w-32"
                        />
                        <div 
                          className="w-20 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: customHex }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">TYPOGRAPHY</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {fontPresets.map(font => (
                      <button
                        key={font.value}
                        onClick={() => setBrand({ ...brand, fontFamily: font.value })}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          brand.fontFamily === font.value 
                            ? 'border-black bg-gray-100 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <p className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-700">{font.name}</p>
                        <p style={{ fontFamily: font.value }} className="text-2xl text-black">
                          Hello World
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">LOGO</h3>
                  
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileSelect(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-500 transition-colors cursor-pointer"
                  >
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                      {brand.logoUrl ? (
                        <div>
                          <img src={brand.logoUrl} alt="Logo" className="h-16 mx-auto mb-4" />
                          <p className="text-sm text-gray-500 uppercase tracking-wider">
                            CLICK TO REPLACE
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">
                            UPLOAD LOGO
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            PNG • SVG • JPG
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Tone */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">TONE OF VOICE</h3>
                  
                  <div className="space-y-4">
                    {tonePresets.map(tone => (
                      <button
                        key={tone.value}
                        onClick={() => setBrand({ ...brand, tone: tone.value })}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                          brand.tone === tone.value 
                            ? 'border-black bg-gray-100 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <p className="font-bold uppercase tracking-wider mb-1 text-black">{tone.name}</p>
                        <p className="text-sm text-gray-600">
                          {tone.value === 'professional' && 'Clear, concise, and business-focused'}
                          {tone.value === 'casual' && 'Friendly, approachable, and conversational'}
                          {tone.value === 'formal' && 'Polite, respectful, and traditional'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'interaction' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Welcome Message */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">WELCOME MESSAGE</h3>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Hi! How can I help you today?"
                    className="w-full h-24 bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                {/* Quick Replies */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">QUICK REPLIES</h3>
                  
                  <div className="space-y-4">
                    {quickReplies.map((reply, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-xl">
                          {reply}
                        </div>
                        <button
                          onClick={() => setQuickReplies(quickReplies.filter((_, idx) => idx !== i))}
                          className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    ))}
                    
                    {quickReplies.length < 3 && (
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={newQuickReply}
                          onChange={(e) => setNewQuickReply(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addQuickReply()}
                          placeholder="Add quick reply..."
                          className="flex-1 minimal-input"
                        />
                        <button
                          onClick={addQuickReply}
                          className="minimal-button-outline px-6"
                        >
                          ADD
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">CALL TO ACTION</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="minimal-label">BUTTON TEXT</label>
                      <input
                        type="text"
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        placeholder="Book a demo"
                        className="minimal-input"
                      />
                    </div>
                    
                    <div>
                      <label className="minimal-label">BUTTON URL</label>
                      <input
                        type="url"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="https://calendly.com/..."
                        className="minimal-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Type-specific settings */}
                {botType === 'lead' && (
                  <div className="minimal-card animate-pulse-shadow">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">LEAD CAPTURE FIELDS</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(leadRequiredFields).map(([field, required]) => (
                        <label key={field} className="flex items-center gap-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={required}
                            onChange={(e) => setLeadRequiredFields({
                              ...leadRequiredFields,
                              [field]: e.target.checked
                            })}
                            className="w-5 h-5 bg-white border-2 border-gray-300 text-black focus:ring-black rounded"
                          />
                          <span className="uppercase tracking-wider text-sm text-gray-700">
                            REQUIRE {field.toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {botType === 'support' && (
                  <div className="minimal-card animate-pulse-shadow">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">SUPPORT CATEGORIES</h3>
                    
                    <div className="space-y-2">
                      {supportCategories.map((cat, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-xl">
                            {cat}
                          </div>
                          <button
                            onClick={() => setSupportCategories(supportCategories.filter((_, idx) => idx !== i))}
                            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const cat = prompt("Category name:");
                          if (cat) setSupportCategories([...supportCategories, cat]);
                        }}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-500 transition-colors"
                      >
                        <Plus className="w-5 h-5 mx-auto text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Response Length */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">RESPONSE LENGTH</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {(['short', 'normal', 'long'] as const).map(length => (
                      <button
                        key={length}
                        onClick={() => setResponseLength(length)}
                        className={`p-4 rounded-xl border-2 uppercase tracking-wider text-sm font-bold transition-all duration-300 ${
                          responseLength === length 
                            ? 'border-black bg-gray-100 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {length}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fallback */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">FALLBACK MESSAGE</h3>
                  <textarea
                    value={fallbackText}
                    onChange={(e) => setFallbackText(e.target.value)}
                    placeholder="I don't have that information. Would you like to speak with someone?"
                    className="w-full h-24 bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                {/* Working Hours */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">WORKING HOURS</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="minimal-label">START TIME</label>
                      <select
                        value={startHour}
                        onChange={(e) => setStartHour(Number(e.target.value))}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:border-black focus:outline-none"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="minimal-label">END TIME</label>
                      <select
                        value={endHour}
                        onChange={(e) => setEndHour(Number(e.target.value))}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:border-black focus:outline-none"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="minimal-label">OFF-HOURS MESSAGE</label>
                    <textarea
                      value={offHoursMessage}
                      onChange={(e) => setOffHoursMessage(e.target.value)}
                      className="w-full h-20 bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Custom Buttons */}
                <div className="minimal-card animate-pulse-shadow">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">CUSTOM CHAT BUTTONS</h3>
                  
                  <div className="space-y-2">
                    {customButtons.map((btn, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-gray-100 border border-gray-200 rounded-xl">
                        <div className="flex-1">
                          <p className="font-bold">{btn.label}</p>
                          <p className="text-sm text-gray-500">{btn.url}</p>
                        </div>
                        <button
                          onClick={() => setCustomButtons(customButtons.filter((_, idx) => idx !== i))}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addCustomButton}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-500 transition-colors"
                    >
                      <Plus className="w-5 h-5 mx-auto text-gray-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CRM Integration for Lead/Support Bots */}
            {(botType === 'lead' || botType === 'support') && activeTab === 'advanced' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="minimal-card animate-pulse-shadow mt-8"
              >
                <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">
                  <Key className="w-5 h-5 inline mr-2" />
                  CRM INTEGRATION
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Connect your CRM to automatically sync leads, analyze customer profiles, and provide data-driven responses.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { name: 'HubSpot', id: 'hubspot', available: true },
                      { name: 'Salesforce', id: 'salesforce', available: true },
                      { name: 'Pipedrive', id: 'pipedrive', available: true },
                      { name: 'Zendesk', id: 'zendesk', available: true },
                      { name: 'Intercom', id: 'intercom', available: true },
                      { name: 'Freshdesk', id: 'freshdesk', available: true }
                    ].map(crm => (
                      <button
                        key={crm.id}
                        onClick={() => router.push(`/integrations?focus=${crm.id}`)}
                        className="p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-black rounded-xl transition-all text-center group"
                      >
                        <p className="font-bold text-sm">{crm.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {crm.available ? 'Click to connect' : 'Coming soon'}
                        </p>
                        <ExternalLink className="w-4 h-4 mx-auto mt-2 text-gray-400 group-hover:text-black transition-colors" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mt-6">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">WHAT HAPPENS AFTER CONNECTION</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic analysis of your customer database to identify ideal customer profile (ICP)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Bot learns from successful deals and customer interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time lead scoring and qualification based on your data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic sync of conversations and new contacts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="sticky top-8">
            <div className="minimal-card animate-pulse-shadow h-[600px] flex flex-col">
              <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-6">LIVE PREVIEW</h3>
              
              <div 
                className="flex-1 bg-white rounded-lg overflow-hidden flex flex-col border border-gray-200"
                style={{ fontFamily: brand.fontFamily }}
              >
                {/* Chat Header */}
                <div 
                  className="p-4 text-white flex items-center gap-3"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {brand.logoUrl && (
                    <img src={brand.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
                  )}
                  <div>
                    <p className="font-bold">Support Bot</p>
                    <p className="text-xs opacity-80">Always active</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%] border border-gray-100">
                      <p className="text-sm text-gray-800">
                        {welcomeMessage || 'Hi! How can I help you today?'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Replies */}
                  {quickReplies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-gray-100"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                      disabled
                    />
                    <button 
                      className="p-2 rounded-full text-white"
                      style={{ backgroundColor: brand.primaryColor }}
                      disabled
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-16"
        >
          <button
            onClick={handleContinue}
            className="minimal-button"
          >
            CONTINUE TO BUILD
          </button>
        </motion.div>
      </div>
    </div>
  );
}