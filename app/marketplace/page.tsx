"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";

interface MarketplaceBot {
  id: string;
  name: string;
  type: string;
  description: string;
  companyUrl: string | null;
  installs: number;
  rating: number;
  reviewCount: number;
  createdBy: string;
  isVerified: boolean;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [bots, setBots] = useState<MarketplaceBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMarketplaceBots();
  }, []);

  const loadMarketplaceBots = async () => {
    try {
      const res = await fetch('/api/marketplace/bots');
      const data = await res.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error('Failed to load marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (botId: string) => {
    const userEmail = sessionStorage.getItem("botUserEmail");
    if (!userEmail) {
      alert('Logga in först för att klona en bot');
      router.push('/business/bot-builder/identify');
      return;
    }

    try {
      const res = await fetch('/api/marketplace/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, userEmail })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Bot klonad! Du hittar den i din dashboard.');
        router.push(`/dashboard/${data.newBotId}`);
      } else {
        alert('❌ Kunde inte klona bot: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Clone error:', error);
      alert('❌ Något gick fel');
    }
  };

  const botTypes = [
    { value: 'all', label: 'Alla' },
    { value: 'knowledge', label: 'FAQ & Kunskap' },
    { value: 'lead', label: 'Leadkvalificering' },
    { value: 'support', label: 'Kundsupport' },
    { value: 'workflow', label: 'Workflow & Booking' }
  ];

  const filteredBots = filter === 'all' 
    ? bots 
    : bots.filter(b => b.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MinimalIcons.Loader className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Bot Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Klona och anpassa verifierade bot-mallar för ditt use case
          </p>
          <button
            onClick={() => router.push('/business/bot-builder')}
            className="btn-minimal"
          >
            Eller skapa din egen bot från scratch
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-12">
          {botTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-6 py-3 rounded-full transition-all ${
                filter === type.value
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Bot Grid */}
        {filteredBots.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Inga botar i marketplace än. Var först att dela din!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBots.map(bot => (
              <div key={bot.id} className="minimal-box">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {bot.name}
                      </h3>
                      {bot.isVerified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {bot.description || 'Bot template'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{bot.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({bot.reviewCount})</span>
                  </div>
                  <div className="text-gray-600">
                    {bot.installs} installs
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    av {bot.createdBy}
                  </span>
                  <button
                    onClick={() => handleClone(bot.id)}
                    className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
                  >
                    Klona
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center minimal-box max-w-2xl mx-auto">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Dela din bot med communityn
          </h2>
          <p className="text-gray-600 mb-6">
            Publicera din bot i marketplace och tjäna 20% av alla premium-subscriptions från dina installs
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-minimal"
          >
            Gå till Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

