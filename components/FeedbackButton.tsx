"use client";

import { useState } from "react";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number|undefined>(undefined);
  const [comment, setComment] = useState("");
  const submit = async () => {
    await fetch('/api/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ score, comment, context: { path: window.location.pathname } }) });
    setOpen(false); setScore(undefined); setComment("");
    alert('Tack för din feedback!');
  };
  return (
    <>
      <button onClick={()=>setOpen(true)} className="fixed bottom-5 right-5 px-4 py-2 rounded-full bg-gray-900 text-white shadow-lg">Feedback</button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-3">Hur troligt är det att du rekommenderar oss?</h3>
            <div className="flex gap-2 mb-3">
              {Array.from({length:11},(_,i)=>i).map(n=> (
                <button key={n} onClick={()=>setScore(n)} className={`w-8 h-8 rounded-full border ${score===n? 'bg-gray-900 text-white' : 'bg-white'}`}>{n}</button>
              ))}
            </div>
            <textarea value={comment} onChange={(e)=>setComment(e.target.value)} rows={4} placeholder="Valfri kommentar" className="w-full border rounded-xl px-3 py-2 mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={()=>setOpen(false)} className="px-4 py-2 bg-white border-2 border-gray-900 rounded-xl">Avbryt</button>
              <button onClick={submit} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Skicka</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";

interface FeedbackButtonProps {
  context?: {
    profession: string;
    specialization: string;
  };
}

export default function FeedbackButton({ context }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "results_feedback",
          rating: feedback,
          comment,
          context,
        }),
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
        setComment("");
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  return (
    <>
      {/* Floating feedback button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-white border-2 border-gray-200 rounded-full px-6 py-3 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-300 group animate-fade-in-up z-40"
        style={{ animationDelay: '1s' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl group-hover:scale-110 transition-transform">💭</span>
          <span className="text-sm font-medium text-gray-700">Ge feedback</span>
        </div>
      </button>

      {/* Feedback modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            {!submitted ? (
              <>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Var detta hjälpsamt?
                </h3>

                {/* Rating buttons */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setFeedback("positive")}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                      feedback === "positive"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-4xl mb-2 block">👍</span>
                    <span className="text-sm font-medium text-gray-700">Ja, absolut!</span>
                  </button>
                  
                  <button
                    onClick={() => setFeedback("negative")}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                      feedback === "negative"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-4xl mb-2 block">👎</span>
                    <span className="text-sm font-medium text-gray-700">Kan bli bättre</span>
                  </button>
                </div>

                {/* Comment field */}
                {feedback && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {feedback === "positive" 
                        ? "Vad gillade du mest? (valfritt)"
                        : "Hur kan vi förbättra? (valfritt)"
                      }
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all resize-none"
                      rows={3}
                      placeholder="Dela dina tankar..."
                    />
                  </div>
                )}

                {/* Submit button */}
                {feedback && (
                  <button
                    onClick={handleSubmit}
                    className="w-full btn-primary mt-6 animate-fade-in"
                  >
                    Skicka feedback
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tack för din feedback!</h3>
                <p className="text-gray-600">Den hjälper oss att göra Optero ännu bättre.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
