"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Zap, Crown } from "lucide-react";
import { PRICING_TIERS } from "@/lib/pricing";

export default function SubscriptionPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    setLoading(tierId);
    // TODO: Implement Stripe checkout
    setTimeout(() => {
      router.push(`/checkout?tier=${tierId}&billing=${billingPeriod}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choose your AI superpower
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get access to AI tools that save you hours every week. The more people use Mendio, the better it gets.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Yearly <span className="text-green-600">(-17%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 relative">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {PRICING_TIERS.FREE.name}
              </h3>
              <p className="text-gray-600">{PRICING_TIERS.FREE.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">{PRICING_TIERS.FREE.price} kr</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {PRICING_TIERS.FREE.highlights.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue for free
            </button>
          </div>

          {/* Professional Tier */}
          <div className="bg-white rounded-2xl shadow-xl p-8 relative border-2 border-blue-500 transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most popular
              </span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Zap className="w-6 h-6 text-blue-500 mr-2" />
                {PRICING_TIERS.PROFESSIONAL.name}
              </h3>
              <p className="text-gray-600">{PRICING_TIERS.PROFESSIONAL.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {billingPeriod === "monthly" 
                    ? PRICING_TIERS.PROFESSIONAL.price 
                    : Math.round(PRICING_TIERS.PROFESSIONAL.priceYearly / 12)
                  } kr
                </span>
                <span className="text-gray-500">/month</span>
                {billingPeriod === "yearly" && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {PRICING_TIERS.PROFESSIONAL.price * 12 - PRICING_TIERS.PROFESSIONAL.priceYearly} kr/year
                  </p>
                )}
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {PRICING_TIERS.PROFESSIONAL.highlights.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe("professional")}
              disabled={loading === "professional"}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading === "professional" ? "Loading..." : "Start now"}
            </button>
          </div>

          {/* Business Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 relative">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Crown className="w-6 h-6 text-purple-500 mr-2" />
                {PRICING_TIERS.BUSINESS.name}
              </h3>
              <p className="text-gray-600">{PRICING_TIERS.BUSINESS.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {billingPeriod === "monthly" 
                    ? PRICING_TIERS.BUSINESS.price 
                    : Math.round(PRICING_TIERS.BUSINESS.priceYearly / 12)
                  } kr
                </span>
                <span className="text-gray-500">/month</span>
                {billingPeriod === "yearly" && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {PRICING_TIERS.BUSINESS.price * 12 - PRICING_TIERS.BUSINESS.priceYearly} kr/year
                  </p>
                )}
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {PRICING_TIERS.BUSINESS.highlights.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe("business")}
              disabled={loading === "business"}
              className="w-full py-3 px-4 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {loading === "business" ? "Loading..." : "Contact us"}
            </button>
          </div>
        </div>

        {/* One-time Purchase Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Prefer a one-time purchase?
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
              <div className="md:flex items-center justify-between">
                <div className="md:flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <Star className="w-6 h-6 text-yellow-500 mr-2" />
                    {PRICING_TIERS.ONETIME.PREMIUM_ANALYSIS.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {PRICING_TIERS.ONETIME.PREMIUM_ANALYSIS.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {PRICING_TIERS.ONETIME.PREMIUM_ANALYSIS.highlights.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 md:mt-0 md:ml-8 text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {PRICING_TIERS.ONETIME.PREMIUM_ANALYSIS.price} kr
                  </div>
                  <p className="text-gray-500 mb-4">One-time payment</p>
                  <button
                    onClick={() => router.push("/premium")}
                    className="px-8 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                  >
                    Order now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Payments are securely handled by Stripe</p>
          <div className="flex justify-center items-center gap-8">
            <img src="/stripe-badge.png" alt="Stripe" className="h-8 opacity-50" />
            <img src="/visa.png" alt="Visa" className="h-8 opacity-50" />
            <img src="/mastercard.png" alt="Mastercard" className="h-8 opacity-50" />
            <img src="/klarna.png" alt="Klarna" className="h-8 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
