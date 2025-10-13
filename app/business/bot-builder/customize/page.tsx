"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HexColorPicker } from "react-colorful";

export default function CustomizeBotPage() {
  const router = useRouter();
  const [brand, setBrand] = useState({
    primaryColor: '#111111',
    fontFamily: 'system-ui',
    tone: 'professional' as 'formal' | 'casual' | 'professional',
    logoUrl: '',
    logoPosition: 'bottom-right',
    logoOffset: { x: 20, y: 20 },
    fontUrl: ''
  });
  const [integrations, setIntegrations] = useState({
    hubspotEnabled: false,
    calendlyUrl: '',
    zendeskDomain: '',
    shopifyDomain: '',
    webhookUrl: '',
    slackWebhook: ''
  });
  const [botType, setBotType] = useState('knowledge');
  const [loading, setLoading] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const websiteUrl = sessionStorage.getItem('botWebsiteUrl');
    const problemData = sessionStorage.getItem('botProblemData');
    const interviewData = sessionStorage.getItem('botInterviewData');
    
    if (!websiteUrl || !problemData || !interviewData) {
      router.push('/business/bot-builder');
      return;
    }

    try {
      const parsed = JSON.parse(problemData);
      setBotType(parsed.botType || 'knowledge');
    } catch {}

    detectBrand(websiteUrl);
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      console.error('Failed to detect brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    sessionStorage.setItem('botBrandConfig', JSON.stringify(brand));
    sessionStorage.setItem('botIntegrations', JSON.stringify(integrations));
    router.push('/business/bot-builder/solution');
  };

  const fonts = [
    { value: 'system-ui', label: 'System' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Inter', label: 'Inter' }
  ];

  const tones = [
    { value: 'formal', label: 'Formell', description: 'Professionell och artig' },
    { value: 'professional', label: 'Professionell', description: 'Balanserad och kunnig' },
    { value: 'casual', label: 'Avslappnad', description: 'Vänlig och personlig' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyserar din webbplats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={() => router.push('/business/bot-builder/interview')}
            className="mb-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Tillbaka
          </button>
          <h1 className="text-4xl font-extralight text-gray-900 mb-2">Designa din bot</h1>
          <p className="text-gray-600">Skapa en unik upplevelse som matchar ditt varumärke</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Brand Colors */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-light mb-6">Varumärkesfärger</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-3 block">Primärfärg</label>
                  <div className="relative" ref={colorPickerRef}>
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-full h-24 rounded-xl shadow-inner relative overflow-hidden group"
                      style={{ backgroundColor: brand.primaryColor }}
                    >
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-mono">
                        {brand.primaryColor}
                      </div>
                    </button>
                    
                    {showColorPicker && (
                      <div className="absolute top-28 left-0 z-50 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                        <HexColorPicker
                          color={brand.primaryColor}
                          onChange={(color) => setBrand({ ...brand, primaryColor: color })}
                        />
                        <div className="mt-4 flex gap-2">
                          {['#000000', '#1a1a1a', '#4F46E5', '#059669', '#DC2626'].map(color => (
                            <button
                              key={color}
                              onClick={() => setBrand({ ...brand, primaryColor: color })}
                              className="w-8 h-8 rounded-lg shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-3 block">Förslag från din webbplats</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['#111111', '#666666', '#E5E5E5', '#ffffff'].map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setBrand({ ...brand, primaryColor: color })}
                        className="h-12 rounded-lg shadow-sm border border-gray-200 hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Tone */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-light mb-6">Typografi & Ton</h2>
              
              {/* Font Selection */}
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-4 block">Typsnitt</label>
                <div className="grid grid-cols-2 gap-3">
                  {fonts.map(font => (
                    <button
                      key={font.value}
                      onClick={() => setBrand({ ...brand, fontFamily: font.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        brand.fontFamily === font.value 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-lg mb-1" style={{ fontFamily: font.value }}>
                        Aa Bb Cc
                      </div>
                      <div className="text-xs text-gray-500">{font.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tone Selection */}
              <div>
                <label className="text-sm text-gray-600 mb-4 block">Konversationston</label>
                <div className="space-y-3">
                  {tones.map(tone => (
                    <button
                      key={tone.value}
                      onClick={() => setBrand({ ...brand, tone: tone.value as any })}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all group ${
                        brand.tone === tone.value
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">{tone.label}</p>
                          <p className="text-sm text-gray-600">{tone.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          brand.tone === tone.value 
                            ? 'border-black bg-black' 
                            : 'border-gray-300'
                        }`}>
                          {brand.tone === tone.value && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo & Position */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-light mb-6">Logo (valfritt)</h2>
              
              <input
                type="url"
                value={brand.logoUrl}
                onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })}
                placeholder="https://din-domän.se/logo.svg"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm mb-4"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'top-left', label: '↖' },
                      { value: 'top-right', label: '↗' },
                      { value: 'bottom-left', label: '↙' },
                      { value: 'bottom-right', label: '↘' }
                    ].map(pos => (
                      <button
                        key={pos.value}
                        onClick={() => setBrand({ ...brand, logoPosition: pos.value })}
                        className={`p-3 rounded-lg border-2 text-lg transition-all ${
                          brand.logoPosition === pos.value
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Avstånd (px)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={brand.logoOffset?.x ?? 20}
                      onChange={(e) => setBrand({ ...brand, logoOffset: { ...brand.logoOffset, x: Number(e.target.value) } })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      value={brand.logoOffset?.y ?? 20}
                      onChange={(e) => setBrand({ ...brand, logoOffset: { ...brand.logoOffset, y: Number(e.target.value) } })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="Y"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations */}
            {(botType === 'lead' || botType === 'support' || botType === 'workflow') && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-light mb-6">Integrationer (valfritt)</h2>
                
                <div className="space-y-4">
                  {botType === 'lead' && (
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={integrations.hubspotEnabled}
                        onChange={(e) => setIntegrations({ ...integrations, hubspotEnabled: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">HubSpot</span>
                        <p className="text-xs text-gray-600">Synka leads automatiskt</p>
                      </div>
                    </label>
                  )}
                  
                  {(botType === 'workflow' || botType === 'lead') && (
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Calendly</label>
                      <input
                        type="url"
                        value={integrations.calendlyUrl}
                        onChange={(e) => setIntegrations({ ...integrations, calendlyUrl: e.target.value })}
                        placeholder="https://calendly.com/dittnamn"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-light mb-6">Live förhandsgranskning</h3>
                
                <div className="relative bg-gray-50 rounded-xl p-6 min-h-[400px]">
                  <div 
                    className="bg-white rounded-t-xl px-4 py-3 flex items-center gap-3 shadow-sm"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 bg-white/40 rounded-full" />
                    </div>
                    <div>
                      <p className="text-white font-medium" style={{ fontFamily: brand.fontFamily }}>
                        Chatbot
                      </p>
                      <p className="text-white/80 text-xs">Alltid aktiv</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-b-xl p-4 space-y-4">
                    <div className="flex gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: brand.primaryColor }}
                      />
                      <div 
                        className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]"
                        style={{ fontFamily: brand.fontFamily }}
                      >
                        <p className="text-gray-900 text-sm">
                          {brand.tone === 'formal' && "God dag! Hur kan jag bistå er idag?"}
                          {brand.tone === 'professional' && "Hej! Hur kan jag hjälpa dig idag?"}
                          {brand.tone === 'casual' && "Hej där! Vad kan jag hjälpa till med? 😊"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {brand.logoUrl && (
                    <img 
                      src={brand.logoUrl} 
                      alt="Logo" 
                      className="absolute w-12 h-12 object-contain rounded-lg shadow-sm"
                      style={{
                        [brand.logoPosition.includes('top') ? 'top' : 'bottom']: `${brand.logoOffset?.y ?? 20}px`,
                        [brand.logoPosition.includes('left') ? 'left' : 'right']: `${brand.logoOffset?.x ?? 20}px`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all text-lg font-light"
          >
            Fortsätt och bygg bot →
          </button>
        </div>
      </div>
    </div>
  );
}