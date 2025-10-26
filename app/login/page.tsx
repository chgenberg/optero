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
          text: `Magic link sent! We found ${data.count} bot(s) for your email.` 
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
          text: data.error || "No results found for this email" 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: "Something went wrong. Please try again." 
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
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-300 text-sm">
                Sign in with magic link to access your bots
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the email address associated with your bots
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
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send magic link
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Don't have a bot yet?{" "}
                    <a href="/bot" className="font-semibold text-black hover:underline">
                      Create one now
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
                  <h2 className="text-xl font-bold text-gray-900">Check your email!</h2>
                  <p className="text-gray-600 text-sm">
                    We've sent a magic link to <strong>{email}</strong>. Click it to access your dashboard.
                  </p>
                  <p className="text-xs text-gray-500">
                    The link expires in 7 days. Check your spam folder if you don't see it.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                      setMessage(null);
                    }}
                    className="w-full mt-6 py-2 text-gray-600 hover:text-black transition-colors text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Try another email
                  </button>
                </motion.div>
              )}

              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                  🔒 Secure. No password needed. 100% encrypted.
                </p>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Questions? <a href="/contact" className="text-black font-semibold hover:underline">Contact us</a>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
