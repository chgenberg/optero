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
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-8 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          ← Tillbaka
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Din beställning</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Premium</span>
                  <span className="font-medium">99€</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Totalt</span>
                    <span>99€</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Moms ingår</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">Detta ingår:</p>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>12-veckors implementeringsplan</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Team training-material</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Change management-guide</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>30 dagars email-support</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Komplett PDF-rapport (30+ sidor)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h1 className="text-2xl font-bold mb-2">Kontaktuppgifter</h1>
              <p className="text-gray-600 mb-8">Vi skickar faktura och material hit</p>

              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>

              <div className="mt-8 pt-8 border-t border-gray-200 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Säker betalning med Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>30 dagars pengarna-tillbaka-garanti</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}