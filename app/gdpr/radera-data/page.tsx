"use client";

import { useState } from "react";

export default function DeleteDataPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gdpr/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Delete my data
          </h1>
          
          <p className="text-gray-600 mb-6">
            Under GDPR you have the right to have your personal data deleted from our systems.
            Enter your email below and we will delete all data linked to it.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Note:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• All your saved data will be permanently deleted</li>
              <li>• You will no longer have access to previous results</li>
              <li>• This cannot be undone</li>
              <li>• If you have Premium, your subscription will be terminated</li>
            </ul>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Your data has been deleted
              </h3>
              <p className="text-green-700">
                All data linked to your email has been removed from our systems.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="name@example.com"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete my data"}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Other GDPR rights:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <strong>Right to data portability:</strong>{" "}
                <a href="/gdpr/exportera-data" className="text-blue-600 hover:underline">
                  Export your data
                </a>
              </li>
              <li>
                <strong>Data protection questions:</strong>{" "}
                <a href="/contact" className="text-blue-600 hover:underline">
                  Contact us
                </a>
              </li>
              <li>
                <strong>Read more:</strong>{" "}
                <a href="/integritetspolicy" className="text-blue-600 hover:underline">
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
