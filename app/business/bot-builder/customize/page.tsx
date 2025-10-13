"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";
import { HexColorPicker } from "react-colorful";

export default function CustomizeBotPage() {
  const router = useRouter();
  const [brand, setBrand] = useState({
    primaryColor: '#111111',
    fontFamily: 'system-ui',
    tone: 'professional' as 'formal' | 'casual' | 'professional',
    logoUrl: '',
    logoPosition: 'bottom-right' as string,
    logoOffset: { x: 20, y: 20 } as { x: number, y: number },
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
  const [showIntegrations, setShowIntegrations] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get website URL from sessionStorage
    const websiteUrl = sessionStorage.getItem('botWebsiteUrl');
    const problemData = sessionStorage.getItem('botProblemData');
    const interviewData = sessionStorage.getItem('botInterviewData');
    
    if (!websiteUrl || !problemData || !interviewData) {
      router.push('/business/bot-builder');
      return;
    }

    // Set bot type
    try {
      const parsed = JSON.parse(problemData);
      setBotType(parsed.botType || 'knowledge');
    } catch {}

    // Auto-detect brand
    detectBrand(websiteUrl);
  }, [router]);

  useEffect(() => {
    // Click outside to close color picker
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
    // Save brand config + integrations
    sessionStorage.setItem('botBrandConfig', JSON.stringify(brand));
    sessionStorage.setItem('botIntegrations', JSON.stringify(integrations));
    router.push('/business/bot-builder/solution');
  };

  const fonts = [
    { value: 'system-ui', label: 'System (Standard)' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia (Serif)' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Inter', label: 'Inter' }
  ];

  const tones = [
    { value: 'formal', label: 'Formell', description: 'Professionell och artig' },
    { value: 'professional', label: 'Professionell', description: 'Balanserad och kunnig' },
    { value: 'casual', label: 'Avslappnad', description: 'Vänlig och personlig' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="minimal-box max-w-2xl w-full animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-gray-900">Anpassa botens utseende</h1>
          <MinimalIcons.Bot className="w-8 h-8 text-gray-400" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <MinimalIcons.Loader className="w-8 h-8 text-gray-400 animate-spin" />
            <span className="ml-3 text-gray-600">Analyserar webbplatsens design...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Color selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primärfärg
              </label>
              <div className="flex items-center gap-4">
                <div className="relative" ref={colorPickerRef}>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-20 h-20 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                  {showColorPicker && (
                    <div className="absolute top-24 left-0 z-50 bg-white rounded-xl shadow-2xl p-4 border border-gray-200">
                      <HexColorPicker
                        color={brand.primaryColor}
                        onChange={(color) => setBrand({ ...brand, primaryColor: color })}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Vi hittade denna färg på din webbplats
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Klicka för att ändra
                  </p>
                </div>
              </div>
            </div>

            {/* Font selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Typsnitt
              </label>
              <select
                value={brand.fontFamily}
                onChange={(e) => setBrand({ ...brand, fontFamily: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                style={{ fontFamily: brand.fontFamily }}
              >
                {fonts.map(font => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </option>
                ))}
              </select>
            <input
              type="url"
              value={brand.fontUrl}
              onChange={(e) => setBrand({ ...brand, fontUrl: e.target.value })}
              placeholder="(Valfritt) Google Fonts URL"
              className="mt-3 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
            </div>

            {/* Tone selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Konversationston
              </label>
              <div className="space-y-3">
                {tones.map(tone => (
                  <label
                    key={tone.value}
                    className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      brand.tone === tone.value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={tone.value}
                      checked={brand.tone === tone.value}
                      onChange={(e) => setBrand({ ...brand, tone: e.target.value as any })}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{tone.label}</p>
                      <p className="text-sm text-gray-600 mt-1">{tone.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Förhandsgranskning
              </label>
              <div className="bg-gray-100 rounded-xl p-6">
                <div 
                  className="bg-white rounded-xl p-4 shadow-sm max-w-sm"
                  style={{ fontFamily: brand.fontFamily }}
                >
                  <div 
                    className="w-12 h-12 rounded-full mb-3"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                {brand.logoUrl && (
                  <img src={brand.logoUrl} alt="Logo" className="w-8 h-8 object-contain mb-3" />
                )}
                  <p className="text-gray-900">
                    {brand.tone === 'formal' && "God dag! Hur kan jag bistå er idag?"}
                    {brand.tone === 'professional' && "Hej! Hur kan jag hjälpa dig idag?"}
                    {brand.tone === 'casual' && "Hej där! Vad kan jag hjälpa till med? 😊"}
                  </p>
                </div>
              </div>
            </div>

          {/* Logo controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Logo (valfritt)
            </label>
            <input
              type="url"
              value={brand.logoUrl}
              onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })}
              placeholder="https://ditt-domän.se/logo.svg"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <select
                value={brand.logoPosition}
                onChange={(e) => setBrand({ ...brand, logoPosition: e.target.value as any })}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="bottom-right">Nere höger</option>
                <option value="bottom-left">Nere vänster</option>
                <option value="top-right">Uppe höger</option>
                <option value="top-left">Uppe vänster</option>
              </select>
              <div className="flex gap-3">
                         <input
                           type="number"
                           value={brand.logoOffset?.x ?? 20}
                           onChange={(e) => {
                             const current = brand.logoOffset || { x: 20, y: 20 };
                             setBrand({ ...brand, logoOffset: { ...current, x: Number(e.target.value) } });
                           }}
                           className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                           placeholder="X offset"
                         />
                         <input
                           type="number"
                           value={brand.logoOffset?.y ?? 20}
                           onChange={(e) => {
                             const current = brand.logoOffset || { x: 20, y: 20 };
                             setBrand({ ...brand, logoOffset: { ...current, y: Number(e.target.value) } });
                           }}
                           className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                           placeholder="Y offset"
                         />
              </div>
            </div>
          </div>

          {/* Integrations (conditional based on bot type) */}
          {(botType === 'lead' || botType === 'support' || botType === 'workflow') && (
            <div>
              <button
                onClick={() => setShowIntegrations(!showIntegrations)}
                className="w-full flex justify-between items-center text-sm font-medium text-gray-700 mb-3"
              >
                <span>Integrationer (valfritt)</span>
                <span className="text-gray-400">{showIntegrations ? '−' : '+'}</span>
              </button>
              
              {showIntegrations && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  {/* HubSpot (for lead bots) */}
                  {botType === 'lead' && (
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={integrations.hubspotEnabled}
                        onChange={(e) => setIntegrations({ ...integrations, hubspotEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Aktivera HubSpot-integration</span>
                    </label>
                  )}
                  
                  {/* Calendly (for booking bots) */}
                  {(botType === 'workflow' || botType === 'lead') && (
                    <input
                      type="url"
                      value={integrations.calendlyUrl}
                      onChange={(e) => setIntegrations({ ...integrations, calendlyUrl: e.target.value })}
                      placeholder="Calendly URL (t.ex. https://calendly.com/dittnamn)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    />
                  )}
                  
                  {/* Zendesk (for support bots) */}
                  {botType === 'support' && (
                    <input
                      type="text"
                      value={integrations.zendeskDomain}
                      onChange={(e) => setIntegrations({ ...integrations, zendeskDomain: e.target.value })}
                      placeholder="Zendesk domain (t.ex. dittforetag.zendesk.com)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    />
                  )}
                  
                  {/* Shopify (for ecommerce bots) */}
                  {botType === 'workflow' && (
                    <input
                      type="text"
                      value={integrations.shopifyDomain}
                      onChange={(e) => setIntegrations({ ...integrations, shopifyDomain: e.target.value })}
                      placeholder="Shopify domain (t.ex. dinbutik.myshopify.com)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    />
                  )}
                  
                  {/* Webhook URL (all types) */}
                  <input
                    type="url"
                    value={integrations.webhookUrl}
                    onChange={(e) => setIntegrations({ ...integrations, webhookUrl: e.target.value })}
                    placeholder="Webhook URL (för notifikationer)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                  
                  {/* Slack Webhook */}
                  <input
                    type="url"
                    value={integrations.slackWebhook}
                    onChange={(e) => setIntegrations({ ...integrations, slackWebhook: e.target.value })}
                    placeholder="Slack Webhook URL"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                  
                  <p className="text-xs text-gray-600 mt-3">
                    💡 Integrationer gör att boten kan skicka leads, skapa tickets och utföra actions automatiskt
                  </p>
                </div>
              )}
            </div>
          )}

            <div className="flex justify-between pt-6">
              <button
                onClick={() => router.push('/business/bot-builder/interview')}
                className="btn-minimal-outline"
              >
                Tillbaka
              </button>
              <button
                onClick={handleContinue}
                className="btn-minimal flex items-center gap-2"
              >
                Fortsätt och bygg bot
                <MinimalIcons.Arrow className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
