"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MinimalIcons } from "@/components/MinimalIcons";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function BotBuilderInterview() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    const c = messagesContainerRef.current;
    if (c) {
      c.scrollTop = c.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start conversation
    const problemData = sessionStorage.getItem("botProblemData");
    if (!problemData) {
      router.push("/business/bot-builder/analyze");
      return;
    }
    
    const problem = JSON.parse(problemData).problem;

    // Initial bot message
    setTimeout(() => {
      addBotMessage(getInitialMessage(problem));
    }, 500);
  }, [router]);

  const getInitialMessage = (problem: string) => {
    const messages: Record<string, string> = {
      "knowledge": "Hi! I'll help you build a knowledge bot. What are the most common questions your customers/visitors have?",
      "lead-qualification": "Hi! Let's build a lead qualification bot. What is your primary goal — more demos, consultations, or direct sales?",
      "customer-support": "Hi! We'll create a support bot. What are the 3 most common support issues you receive?",
      "booking": "Hi! We're building a booking bot. What kinds of bookings do you handle and how long is each appointment?",
      "ecommerce": "Hi! Let's create an e-commerce assistant. What products do you sell and what are your customers' most common questions?",
      "hr-recruitment": "Hi! We're building a recruiting bot. What are the most important criteria you screen candidates on?"
    };
    return messages[problem] || "Hi! Let's start building your bot. Tell me a little about your use case.";
  };

  const addBotMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: "bot",
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Get bot type-specific follow-up questions
    const problemData = sessionStorage.getItem("botProblemData");
    const botTypeId = problemData ? JSON.parse(problemData).problem : "knowledge";
    
    const typeQuestions: Record<string, string[]> = {
      "knowledge": [
        "Great! Do you have any specific documents or FAQ pages I should focus on?",
        "Understood. What response style do you prefer — short and concise or more detailed explanations?",
        "Got it! What tone should the bot use — professional or more casual?",
        "Thanks! I have what I need. Let me configure your knowledge bot..."
      ],
      "lead-qualification": [
        "Great! What information should we collect from leads? (Budget, timeline, decision role, etc)",
        "Understood. What qualifies a lead for you? Any disqualifiers?",
        "Perfect. Where should qualified leads be sent — HubSpot, email, Slack?",
        "Excellent! I'm now creating a lead bot tailored to your needs..."
      ],
      "customer-support": [
        "Thanks! How should we handle issues the bot can't resolve — create a ticket or email directly?",
        "Understood. Any prioritization — urgent cases first?",
        "Great. Which systems do you use — Zendesk, Freshdesk, or email?",
        "Perfect! I'm configuring a support bot for you now..."
      ],
      "booking": [
        "Great! What times are you available? (Weekdays 9–17, weekends, etc)",
        "Understood. How much notice is required — same day OK or at least 24h?",
        "Perfect. Should confirmation emails be sent automatically?",
        "Excellent! I'm creating a booking bot for you now..."
      ],
      "ecommerce": [
        "Interesting! Do you use Shopify, WooCommerce, or another platform?",
        "Understood. Should the bot add products to the cart or only recommend?",
        "Great! Should the bot also answer order status and returns?",
        "Perfect! I'm configuring an e-commerce assistant now..."
      ],
      "hr-recruitment": [
        "Great! What kinds of roles are you hiring for? (Tech, sales, admin, etc)",
        "Understood. What are your deal-breakers — language, experience, location?",
        "Perfect. Should the bot book interviews directly in your calendar?",
        "Excellent! I'm creating a recruiting bot now..."
      ]
    };
    
    const responses = typeQuestions[botTypeId] || [
      "Intressant! Kan du ge mig ett exempel?",
      "Förstår. Hur hanterar ni detta idag?",
      "Bra input. Vad är målet?",
      "Tack! Jag har vad jag behöver..."
    ];
    
    // Simulate bot response
    setTimeout(() => {
      if (currentQuestion < responses.length - 1) {
        addBotMessage(responses[currentQuestion]);
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Final message and redirect
        addBotMessage(responses[responses.length - 1]);
        setTimeout(() => {
          // Save all interview data properly
          const allMessages = [...messages, userMessage];
          sessionStorage.setItem("botInterviewData", JSON.stringify({
            messages: allMessages,
            answers: allMessages.filter(m => m.role === 'user').map(m => m.content)
          }));
          router.push("/business/bot-builder/customize");
        }, 2000);
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>

        <div className="minimal-box p-0 overflow-hidden">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <MinimalIcons.Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Bot Builder Assistant</h3>
                <p className="text-xs text-gray-500">Always active</p>
              </div>
            </div>
          </div>

          {/* Chat body: fixed height, scroll only messages */}
          <div className="flex flex-col h-[600px]">
            {/* Chat messages */}
            <div ref={messagesContainerRef} className="chat-messages scrollbar-minimal">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "chat-message-user" : "chat-message-bot"}
                >
                  <div className={message.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"}>
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-message-bot">
                  <div className="chat-bubble-bot">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="chat-input-container">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer..."
                  className="chat-input"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/business/bot-builder/analyze")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
