"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Calendar } from "lucide-react";

export default function ContactPageSV() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contact'|'support'|'demo'>('contact');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold uppercase tracking-wider text-black mb-4">
            KONTAKTA OSS
          </h1>
          <p className="text-gray-600 uppercase tracking-wider text-sm">
            VI HJÄLPER DITT FÖRETAG ATT LYCKAS
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white rounded-xl shadow-sm p-1">
            {[
              { id: 'contact', label: 'KONTAKTINFO', icon: Mail },
              { id: 'support', label: 'SUPPORT', icon: MessageSquare },
              { id: 'demo', label: 'BOKA DEMO', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg uppercase tracking-wider text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-black text-white' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Contact Info Card */}
            <div className="minimal-card animate-pulse-shadow">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-black mb-8">
                CHRISTOPHER GENBERG AB
              </h2>
              
              <div className="space-y-8">
                {/* Address */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-black mb-2">KONTOR</h3>
                    <p className="text-gray-600">
                      Södra Skjutbanevägen 10<br />
                      439 55 Åsa<br />
                      Sverige
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-black mb-2">TELEFON</h3>
                    <button
                      onClick={() => copyToClipboard('+46732305521', 'phone')}
                      className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
                    >
                      <span className="text-lg">+46 732 30 55 21</span>
                      {copied === 'phone' ? (
                        <span className="text-green-600 text-sm font-bold">✓ KOPIERAD</span>
                      ) : (
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity uppercase">KLICKA FÖR ATT KOPIERA</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-black mb-2">E-POST</h3>
                    <button
                      onClick={() => copyToClipboard('ch.genberg@gmail.com', 'email')}
                      className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
                    >
                      <span className="text-lg">ch.genberg@gmail.com</span>
                      {copied === 'email' ? (
                        <span className="text-green-600 text-sm font-bold">✓ KOPIERAD</span>
                      ) : (
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity uppercase">KLICKA FÖR ATT KOPIERA</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-card animate-pulse-shadow cursor-pointer"
              >
                <a
                  href="mailto:ch.genberg@gmail.com?subject=Förfrågan om Mendio"
                  className="block"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-2">
                        SKICKA E-POST
                      </h3>
                      <p className="text-gray-600">
                        Få svar inom 24 timmar
                      </p>
                    </div>
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                </a>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-card animate-pulse-shadow cursor-pointer"
              >
                <a
                  href="tel:+46732305521"
                  className="block"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-2">
                        RING DIREKT
                      </h3>
                      <p className="text-gray-600">
                        Mån-Fre 09:00-17:00
                      </p>
                    </div>
                    <Phone className="w-8 h-8 text-gray-400" />
                  </div>
                </a>
              </motion.div>

              <div className="minimal-card bg-gray-100">
                <h3 className="font-bold uppercase tracking-wider text-black mb-4">
                  KONTORSTIDER
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-gray-700">Måndag - Fredag: 09:00 - 17:00</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700">Helger: Stängt</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Svarstid: Inom 24 timmar</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'support' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="minimal-card animate-pulse-shadow">
              <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-4">
                TEKNISK SUPPORT
              </h3>
              <p className="text-gray-600 mb-6">
                Har du problem med din bot? Vårt tekniska team hjälper dig.
              </p>
              <a
                href="mailto:ch.genberg@gmail.com?subject=Teknisk Support"
                className="minimal-button-outline w-full text-center"
              >
                FÅ TEKNISK HJÄLP
              </a>
            </div>

            <div className="minimal-card animate-pulse-shadow">
              <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-4">
                KONTOSUPPORT
              </h3>
              <p className="text-gray-600 mb-6">
                Frågor om fakturering, prenumerationer eller ditt konto?
              </p>
              <a
                href="mailto:ch.genberg@gmail.com?subject=Kontosupport"
                className="minimal-button-outline w-full text-center"
              >
                KONTOFRÅGOR
              </a>
            </div>

            <div className="minimal-card animate-pulse-shadow md:col-span-2">
              <h3 className="text-xl font-bold uppercase tracking-wider text-black mb-6">
                VANLIGA FRÅGOR
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-black mb-2">Hur integrerar jag min bot?</h4>
                  <p className="text-gray-600 text-sm">
                    Du får en inbäddningskod efter att du skapat din bot. Klistra bara in den i din webbplats HTML.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-black mb-2">Kan jag anpassa botens utseende?</h4>
                  <p className="text-gray-600 text-sm">
                    Ja! Fullständiga anpassningsalternativ finns inklusive färger, typsnitt och beteendeinställningar.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-black mb-2">Vad ingår i gratisplanen?</h4>
                  <p className="text-gray-600 text-sm">
                    50 meddelanden per dag, grundläggande funktioner och tillgång till botbyggaren. Uppgradera för obegränsade meddelanden.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-black mb-2">Hur lång tid tar uppsättningen?</h4>
                  <p className="text-gray-600 text-sm">
                    De flesta användare har sin bot igång på under 5 minuter. Ingen kodning krävs!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'demo' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="minimal-card animate-pulse-shadow text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold uppercase tracking-wider text-black mb-4">
                BOKA EN PERSONLIG DEMO
              </h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Se hur Mendio kan transformera dina kundinteraktioner. Få en personlig genomgång 
                av funktioner anpassade för ditt företags behov.
              </p>
              
              <div className="space-y-4 text-left max-w-md mx-auto mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-black">30 minuters personlig demo</p>
                    <p className="text-sm text-gray-600">Anpassad för ditt specifika användningsfall</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-black">ROI-beräkning</p>
                    <p className="text-sm text-gray-600">Se potentiella besparingar och effektivitetsvinster</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-black">Frågor & svar</p>
                    <p className="text-sm text-gray-600">Få alla dina frågor besvarade</p>
                  </div>
                </div>
              </div>

              <a
                href="mailto:ch.genberg@gmail.com?subject=Boka en Mendio Demo&body=Hej,%0D%0A%0D%0AJag är intresserad av att boka en demo av Mendio för mitt företag.%0D%0A%0D%0AFöretag:%0D%0AWebbplats:%0D%0AÖnskad tid:%0D%0A%0D%0ATack!"
                className="minimal-button inline-flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                BOKA DIN DEMO
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
