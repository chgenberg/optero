"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface Message {
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

interface Problem {
  problem: string;
  questionsAsked: number;
  completed: boolean;
}

export default function ExecutiveInterview() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("executiveConsultation");
    if (!saved) {
      router.push("/business/executive-consultant");
      return;
    }
    const parsedData = JSON.parse(saved);
    setData(parsedData);
    
    // Initialize problems tracking
    const problemsState = parsedData.problems.map((p: string) => ({
      problem: p,
      questionsAsked: 0,
      completed: false
    }));
    setProblems(problemsState);
    
    // Start first interview
    startProblemInterview(0, parsedData);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startProblemInterview = async (problemIndex: number, consultData: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/business/generate-interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: consultData.problems[problemIndex],
          websiteContext: consultData.websiteSummary?.mainText?.slice(0, 2000) || "",
          documentsContext: consultData.documentsContent?.slice(0, 2000) || "",
          conversationHistory: []
        })
      });
      
      const result = await response.json();
      const aiMessage: Message = {
        role: "ai",
        content: result.question || "Berätta mer om detta problem. Vad är de största utmaningarna?",
        timestamp: new Date()
      };
      
      setMessages([aiMessage]);
      setConversationHistory([]);
    } catch (error) {
      console.error("Failed to start interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: input }
      ];
      
      const response = await fetch("/api/business/generate-interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problems[currentProblemIndex].problem,
          websiteContext: data.websiteSummary?.mainText?.slice(0, 2000) || "",
          documentsContext: data.documentsContent?.slice(0, 2000) || "",
          conversationHistory: newHistory
        })
      });
      
      const result = await response.json();
      
      // Update problem state
      const updatedProblems = [...problems];
      updatedProblems[currentProblemIndex].questionsAsked += 1;
      
      // Check if we have enough information (after 3-5 questions)
      const shouldComplete = result.hasEnoughInfo || updatedProblems[currentProblemIndex].questionsAsked >= 5;
      
      if (shouldComplete) {
        updatedProblems[currentProblemIndex].completed = true;
        setProblems(updatedProblems);
        
        const aiMessage: Message = {
          role: "ai",
          content: "Tack! Jag har nu tillräckligt med information om detta problem. " + 
                   (currentProblemIndex < problems.length - 1 
                     ? "Låt oss gå vidare till nästa problem." 
                     : "Jag har nu all information jag behöver. Klicka på 'Generera lösningar' för att få dina rekommendationer."),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Save conversation for this problem (in session)
        const savedConversations = JSON.parse(sessionStorage.getItem("problemConversations") || "[]");
        savedConversations.push({
          problem: problems[currentProblemIndex].problem,
          conversation: [...newHistory, { role: "assistant", content: aiMessage.content }]
        });
        sessionStorage.setItem("problemConversations", JSON.stringify(savedConversations));

        // Persist conversation to API/DB
        try {
          await fetch("/api/business/executive/log-conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: (typeof window !== 'undefined' && window.sessionStorage.getItem('execSessionId')) || undefined,
              companyUrl: data.url,
              problem: problems[currentProblemIndex].problem,
              conversation: savedConversations[savedConversations.length - 1].conversation
            })
          });
        } catch {}
        
        // Move to next problem or finish
        if (currentProblemIndex < problems.length - 1) {
          setTimeout(() => {
            setCurrentProblemIndex(currentProblemIndex + 1);
            setConversationHistory([]);
            startProblemInterview(currentProblemIndex + 1, data);
          }, 2000);
        }
      } else {
        setProblems(updatedProblems);
        const aiMessage: Message = {
          role: "ai",
          content: result.question || "Berätta mer...",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setConversationHistory([...newHistory, { role: "assistant", content: aiMessage.content }]);
      }
      
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        role: "ai",
        content: "Ursäkta, något gick fel. Försök igen.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateSolutions = () => {
    router.push("/business/executive-consultant/solution");
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    );
  }

  const allProblemsCompleted = problems.every(p => p.completed);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gray-900" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              AI-intervju
            </h1>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            {problems.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
                  idx === currentProblemIndex
                    ? 'bg-white text-black scale-110'
                    : p.completed
                    ? 'bg-green-600 text-gray-900'
                    : 'bg-white text-gray-600'
                }`}>
                  {p.completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                {idx < problems.length - 1 && (
                  <div className={`w-8 h-0.5 ${p.completed ? 'bg-green-600' : 'bg-white'}`} />
                )}
              </div>
            ))}
          </div>
          
          {currentProblemIndex < problems.length && (
            <div className="p-4 bg-white rounded-xl">
              <p className="text-sm font-medium text-gray-600 mb-1">Diskuterar:</p>
              <p className="text-gray-900">{problems[currentProblemIndex].problem}</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="mb-6">
          <div className="h-[65vh] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-white text-black'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-gray-500' : 'text-gray-600'}`}>
                    {msg.timestamp.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 pt-4">
            {allProblemsCompleted ? (
              <button
                onClick={generateSolutions}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold"
              >
                <span>Generera lösningar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Skriv ditt svar..."
                  disabled={loading}
                  className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="p-4 bg-white text-black rounded-xl hover:bg-gray-100 disabled:bg-white disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

