"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  avgTimeSpent: number;
}

interface PopularProfession {
  profession: string;
  _count: {
    profession: number;
  };
}

interface PopularCombination {
  profession: string;
  specialization: string;
  _count: {
    profession: number;
  };
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  topEntries: Array<{
    profession: string;
    specialization: string;
    hitCount: number;
    lastUsed: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [professions, setProfessions] = useState<PopularProfession[]>([]);
  const [combinations, setCombinations] = useState<PopularCombination[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch analytics summary
      const analyticsRes = await fetch("/api/session");
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // Fetch popular professions
      const professionsRes = await fetch("/api/session?type=popular-professions");
      const professionsData = await professionsRes.json();
      setProfessions(professionsData.professions || []);

      // Fetch popular combinations
      const combinationsRes = await fetch("/api/session?type=popular-combinations");
      const combinationsData = await combinationsRes.json();
      setCombinations(combinationsData.combinations || []);

      // Fetch cache stats
      const cacheRes = await fetch("/api/cache-stats");
      const cacheData = await cacheRes.json();
      setCacheStats(cacheData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-gray-600">Laddar analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Översikt över användning och populära kombinationer</p>
        </div>

        {/* Summary Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Totalt sessioner</div>
              <div className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Fullständiga sessioner</div>
              <div className="text-3xl font-bold text-gray-900">{analytics.completedSessions}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Completion rate</div>
              <div className="text-3xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">Genomsnittlig tid</div>
              <div className="text-3xl font-bold text-gray-900">{Math.round(analytics.avgTimeSpent / 60)}min</div>
            </div>
          </div>
        )}

        {/* Cache Performance */}
        {cacheStats && (
          <div className="card mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cache Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-sm text-gray-600 mb-1">Cachade kombinationer</div>
                <div className="text-2xl font-bold text-gray-900">{cacheStats.totalEntries}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Totala cache hits</div>
                <div className="text-2xl font-bold text-gray-900">{cacheStats.totalHits}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Genomsnittliga hits per entry</div>
                <div className="text-2xl font-bold text-gray-900">
                  {cacheStats.totalEntries > 0 ? (cacheStats.totalHits / cacheStats.totalEntries).toFixed(1) : 0}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 mest använda kombinationer</h3>
            <div className="space-y-2">
              {cacheStats.topEntries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{entry.profession}</div>
                    <div className="text-sm text-gray-600">{entry.specialization}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{entry.hitCount} hits</div>
                    <div className="text-xs text-gray-500">
                      Senast: {new Date(entry.lastUsed).toLocaleDateString('sv-SE')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Professions */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Populära yrken</h2>
            <div className="space-y-3">
              {professions.map((prof, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{prof.profession}</span>
                  </div>
                  <span className="text-gray-600">{prof._count.profession} sökningar</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Combinations */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Populära kombinationer</h2>
            <div className="space-y-3">
              {combinations.slice(0, 10).map((combo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{combo.profession}</div>
                    <div className="text-sm text-gray-600">{combo.specialization}</div>
                  </div>
                  <span className="text-gray-600">{combo._count.profession}×</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={fetchAllData}
            className="btn-primary"
          >
            Uppdatera data
          </button>
          <a
            href="/"
            className="btn-secondary"
          >
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    </div>
  );
}
