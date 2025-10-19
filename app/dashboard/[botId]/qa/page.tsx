"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Trash2,
  Filter,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  Search
} from "lucide-react";

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string;
  confidence: number;
  verified: boolean;
  hitCount: number;
  sourceType: string;
  feedbackScore?: number;
  feedbackCount: number;
}

export default function QAManagementPage() {
  const params = useParams() as Record<string, string | string[]> | null;
  const botId = params
    ? (Array.isArray(params.botId) ? params.botId[0] : (params.botId || ""))
    : "";

  const [qaList, setQaList] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<{
    category: string;
    verified: string;
    search: string;
  }>({
    category: 'all',
    verified: 'all',
    search: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    question: '',
    answer: '',
    confidence: 0,
    category: ''
  });

  useEffect(() => {
    if (botId) {
      loadQA();
    }
  }, [botId, filter.category, filter.verified]);

  const loadQA = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        botId,
        ...(filter.category !== 'all' && { category: filter.category }),
        ...(filter.verified !== 'all' && { verified: filter.verified })
      });

      const response = await fetch(`/api/bots/qa/list?${params}`);
      const data = await response.json();

      if (data.success) {
        setQaList(data.qaList);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading Q&A:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      const response = await fetch('/api/bots/qa/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verified })
      });

      if (response.ok) {
        loadQA();
      }
    } catch (error) {
      console.error('Error verifying Q&A:', error);
    }
  };

  const handleEdit = (qa: QAPair) => {
    setEditingId(qa.id);
    setEditForm({
      question: qa.question,
      answer: qa.answer,
      confidence: qa.confidence,
      category: qa.category
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch('/api/bots/qa/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          ...editForm
        })
      });

      if (response.ok) {
        setEditingId(null);
        loadQA();
      }
    } catch (error) {
      console.error('Error updating Q&A:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Q&A pair?')) return;

    try {
      const response = await fetch(`/api/bots/qa/update?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadQA();
      }
    } catch (error) {
      console.error('Error deleting Q&A:', error);
    }
  };

  const filteredQA = qaList.filter(qa => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return qa.question.toLowerCase().includes(searchLower) ||
             qa.answer.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Q&A Knowledge Base
          </h1>
          <p className="text-gray-600">
            Manage, verify, and improve your bot's question-answer pairs
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Q&A Pairs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Filter className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.total - stats.verified}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Most Popular</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {qaList[0]?.question.substring(0, 30) || 'N/A'}...
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  placeholder="Search questions or answers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="customer">Customer</option>
                <option value="internal">Internal</option>
                <option value="faq">FAQ</option>
                <option value="product">Product</option>
                <option value="support">Support</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter.verified}
                onChange={(e) => setFilter({ ...filter, verified: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Q&A List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading Q&A pairs...</p>
            </div>
          ) : filteredQA.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No Q&A pairs found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredQA.map((qa) => (
                <div key={qa.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {editingId === qa.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question
                        </label>
                        <textarea
                          value={editForm.question}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer
                        </label>
                        <textarea
                          value={editForm.answer}
                          onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confidence
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={editForm.confidence}
                            onChange={(e) => setEditForm({ ...editForm, confidence: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="general">General</option>
                            <option value="product">Product</option>
                            <option value="support">Support</option>
                            <option value="customer">Customer</option>
                            <option value="internal">Internal</option>
                            <option value="faq">FAQ</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Q: {qa.question}
                            </h3>
                            {qa.verified && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-gray-700 mb-3">
                            A: {qa.answer}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="px-3 py-1 bg-gray-100 rounded-full">
                              {qa.category}
                            </span>
                            <span>
                              Confidence: {(qa.confidence * 100).toFixed(0)}%
                            </span>
                            <span>
                              Used {qa.hitCount} times
                            </span>
                            <span>
                              Source: {qa.sourceType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!qa.verified ? (
                          <button
                            onClick={() => handleVerify(qa.id, true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(qa.id, false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Unverify
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(qa)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(qa.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

