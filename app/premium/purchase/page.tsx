"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const TIERS = {
  basic: {
    name: "Basic",
    price: 19,
    features: [
      "✅ Personlig AI-guide",
      "✅ 5 utvalda AI-verktyg",
      "✅ Användningsfall & exempel",
      "✅ Implementeringstips",
      "❌ PDF-nedladdning",
      "❌ AI-Coach support"
    ],
    description: "Perfekt för att komma igång med AI",
    popular: false
  },
  pro: {
    name: "Pro",
    price: 29,
    features: [
      "✅ Allt i Basic",
      "✅ 15+ AI-verktyg",
      "✅ Nedladdningsbar PDF-guide",
      "✅ AI-Coach i 30 dagar",
      "✅ Detaljerad implementeringsplan",
      "✅ Prioriterad support"
    ],
    description: "För dig som vill maximera AI:s potential",
    popular: true
  }
};

function CheckoutForm({ selectedTier }: { selectedTier: "basic" | "pro" }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/premium/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: TIERS[selectedTier].price * 100, // Convert to cents
          currency: "eur",
          tier: selectedTier,
          email: email
        })
      });

      const { clientSecret } = await response.json();

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: name,
            email: email,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Betalningen misslyckades");
      } else if (paymentIntent?.status === "succeeded") {
        // Save tier info and redirect
        sessionStorage.setItem("purchasedTier", selectedTier);
        sessionStorage.setItem("purchaseDate", new Date().toISOString());
        sessionStorage.setItem("premiumEmail", email);
        router.push("/premium/interview");
      }
    } catch (err) {
      setError("Ett fel uppstod. Försök igen.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ditt namn
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Din e-post
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kortuppgifter
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
        {processing ? "Behandlar..." : `Betala ${TIERS[selectedTier].price}€`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Säker betalning med Stripe. 30 dagars pengarna-tillbaka-garanti.
      </p>
    </form>
  );
}

export default function PremiumPurchasePage() {
  const [selectedTier, setSelectedTier] = useState<"basic" | "pro">("pro");
  const { t } = useLanguage();
  const router = useRouter();

  // Get context from session
  const context = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("premiumContext") || "{}") : {};
  const profession = context.profession || "ditt yrke";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="mb-8 text-gray-600 hover:text-gray-900 transition-all flex items-center gap-2 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Tillbaka</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Välj din AI-guide för {profession}
          </h1>
          <p className="text-xl text-gray-600">
            Få tillgång till allt du behöver för att lyckas med AI
          </p>
        </div>

        {/* Tier Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {(Object.entries(TIERS) as [keyof typeof TIERS, typeof TIERS[keyof typeof TIERS]][]).map(([key, tier]) => (
            <div
              key={key}
              onClick={() => setSelectedTier(key)}
              className={`relative bg-white rounded-3xl p-8 cursor-pointer transition-all transform hover:scale-105 ${
                selectedTier === key
                  ? "ring-4 ring-gray-900 shadow-2xl"
                  : "ring-1 ring-gray-200 hover:ring-gray-400 shadow-lg"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    POPULÄRAST
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm">{tier.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-gray-900">{tier.price}€</span>
                <span className="text-gray-500 ml-2">engångspris</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={feature.startsWith("❌") ? "opacity-50" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={`text-center font-medium ${
                selectedTier === key ? "text-gray-900" : "text-gray-500"
              }`}>
                {selectedTier === key ? "✓ Vald" : "Välj detta"}
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Form */}
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Slutför din beställning
          </h2>
          
          <Elements stripe={stripePromise}>
            <CheckoutForm selectedTier={selectedTier} />
          </Elements>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Säker betalning</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>30 dagars garanti</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>Kvitto via email</span>
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
    </div>
  );
}