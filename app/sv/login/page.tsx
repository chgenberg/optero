"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Special handling for demo account - instant login
      if (email === "demo@mendio.com") {
        localStorage.setItem("userEmail", email);
        setMessage({ 
          type: 'success', 
          text: `Välkommen! Loggar in på demo-konto...` 
        });
        setSubmitted(true);
        
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
        return;
      }

      const response = await fetch("/api/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.found) {
        // Set email in localStorage for dashboard access
        localStorage.setItem("userEmail", email);
        
        setMessage({ 
          type: 'success', 
          text: `Magisk länk skickad! Vi hittade ${data.count} bot(s) för din e-post.` 
        });
        setSubmitted(true);
        
        // For demo: Show the link directly and auto-redirect
        if (data.magicLink) {
          setTimeout(() => {
            window.location.href = data.magicLink;
          }, 1500);
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || "Inga resultat hittades för denna e-post" 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: "Något gick fel. Försök igen." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white px-8 py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="w-8 h-8 text-black" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Välkommen tillbaka</h1>
              <p className="text-gray-300 text-sm">
                Logga in med magisk länk för att få tillgång till dina botar
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                      E-postadress
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="din@epost.se"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Ange e-postadressen som är kopplad till dina botar
                    </p>
                  </div>

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl flex gap-3 ${
                        message.type === 'success' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <p className={`text-sm ${
                        message.type === 'success' 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        {message.text}
                      </p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Skickar länk...
                      </>
                    ) : (
                      <>
                        Skicka magisk länk
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Har du ingen bot än?{" "}
                    <a href="/bot" className="font-semibold text-black hover:underline">
                      Skapa en nu
                    </a>
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-900">Kontrollera din e-post!</h2>
                  <p className="text-gray-600 text-sm">
                    Vi har skickat en magisk länk till <strong>{email}</strong>. Klicka på den för att komma åt din instrumentpanel.
                  </p>
                  <p className="text-xs text-gray-500">
                    Länken förfaller om 7 dagar. Kontrollera skräpfiltret om du inte ser den.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                      setMessage(null);
                    }}
                    className="w-full mt-6 py-2 text-gray-600 hover:text-black transition-colors text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Prova en annan e-post
                  </button>
                </motion.div>
              )}

              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                  🔒 Säker. Inget lösenord behövs. 100% krypterad.
                </p>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Frågor? <a href="/sv/contact" className="text-black font-semibold hover:underline">Kontakta oss</a>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
