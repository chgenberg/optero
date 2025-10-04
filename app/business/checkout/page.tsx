"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/business/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 9900,
          currency: "eur",
          companyInfo,
        }),
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: companyInfo.contactName,
            email: companyInfo.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Betalningen misslyckades");
      } else {
        sessionStorage.setItem("businessPremiumPurchased", "true");
        router.push("/business/premium-results");
      }
    } catch (err) {
      setError("Ett fel uppstod. Försök igen.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Företagsnamn *
          </label>
          <input
            type="text"
            value={companyInfo.companyName}
            onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kontaktperson *
          </label>
          <input
            type="text"
            value={companyInfo.contactName}
            onChange={(e) => setCompanyInfo({...companyInfo, contactName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-post *
          </label>
          <input
            type="email"
            value={companyInfo.email}
            onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon *
          </label>
          <input
            type="tel"
            value={companyInfo.phone}
            onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kortuppgifter *
        </label>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": { color: "#aab7c4" },
                },
                invalid: { color: "#9e2146" },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
      >
        {processing ? "Behandlar..." : "Betala 99€"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Genom att slutföra köpet godkänner du våra användarvillkor och integritetspolicy
      </p>
    </form>
  );
}

export default function BusinessCheckoutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.back()}
          className="mb-8 text-gray-600 hover:text-gray-900 transition-all flex items-center gap-2 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Tillbaka</span>
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-8">Din beställning</h2>
              
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-bold">Team Premium</p>
                      <p className="text-sm opacity-90">Komplett AI-transformation</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">99€</p>
                      <p className="text-xs opacity-90">engångspris</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  Vad ingår:
                </p>
                {[
                  { icon: "📋", text: "12-veckors implementeringsplan" },
                  { icon: "🎓", text: "Team training-material" },
                  { icon: "🔄", text: "Change management-guide" },
                  { icon: "💬", text: "30 dagars email-support" },
                  { icon: "📄", text: "Komplett PDF-rapport (30+ sidor)" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-800 text-sm font-medium">
                  💰 ROI-garanti: Får ni inte resultat inom 90 dagar får ni pengarna tillbaka
                </p>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl p-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Slutför beställningen</h1>
                <p className="text-gray-600">Få direkt tillgång till er AI-strategi</p>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Säker betalning</p>
                    <p className="text-xs text-gray-500">256-bit kryptering</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Direkt tillgång</p>
                    <p className="text-xs text-gray-500">Börja direkt</p>
                  </div>
                </div>

                <div className="text-center space-y-2 text-sm text-gray-500">
                  <p>🔒 Betalas säkert med Stripe</p>
                  <p>✅ 30 dagars pengarna-tillbaka-garanti</p>
                  <p>📧 Faktura skickas direkt till er email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </main>
  );
}