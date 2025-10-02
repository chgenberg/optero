"use client";

import { useState } from "react";

interface FeedbackSystemProps {
  recommendationId: number;
  recommendationName: string;
}

export default function FeedbackSystem({ recommendationId, recommendationName }: FeedbackSystemProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const submitRating = async (selectedRating: number) => {
    setRating(selectedRating);
    setHasRated(true);
    setShowThankYou(true);

    // Skicka rating till backend (kan implementeras senare)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId,
          recommendationName,
          rating: selectedRating
        })
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }

    setTimeout(() => setShowThankYou(false), 3000);
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Var denna rekommendation användbar?</p>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => !hasRated && submitRating(star)}
                onMouseEnter={() => !hasRated && setHoveredRating(star)}
                onMouseLeave={() => !hasRated && setHoveredRating(0)}
                disabled={hasRated}
                className={`transition-all duration-200 ${hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              >
                <svg
                  className={`w-6 h-6 ${
                    star <= (hoveredRating || rating)
                      ? 'text-gray-800 fill-current'
                      : 'text-gray-300 fill-current'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          
          {showThankYou && (
            <span className="text-sm text-green-600 animate-fade-in-up">
              Tack för din feedback!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
