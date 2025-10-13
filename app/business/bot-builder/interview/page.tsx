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
      "knowledge": "Hej! Jag hjälper dig bygga en kunskapsbot. Vilka är de vanligaste frågorna era kunder/besökare har?",
      "lead-qualification": "Hej! Låt oss bygga en leadkvalificeringsbot. Vad är ditt huvudsakliga mål - fler demos, konsultationer eller direktförsäljning?",
      "customer-support": "Hej! Vi ska skapa en supportbot. Vilka är de 3 vanligaste supportärendena ni får?",
      "booking": "Hej! Vi bygger en bokningsbot. Vad för typ av bokningar hanterar ni och hur lång tid tar varje bokning?",
      "ecommerce": "Hej! Låt oss skapa en e-commerce assistant. Vilken typ av produkter säljer ni och vad är era kunders vanligaste frågor?",
      "hr-recruitment": "Hej! Vi bygger en rekryteringsbot. Vad är de viktigaste kriterierna ni screena kandidater på?"
    };
    return messages[problem] || "Hej! Låt oss börja bygga din bot. Berätta lite om ditt use case.";
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
        "Perfekt! Har ni några specifika dokument eller FAQ-sidor jag ska fokusera på?",
        "Förstår. Vilken typ av svar föredrar ni - korta och koncisa eller utförliga förklaringar?",
        "Bra! Hur formell ska boten vara - professionell eller mer avslappnad?",
        "Tack! Jag har allt jag behöver. Låt mig konfigurera din kunskapsbot..."
      ],
      "lead-qualification": [
        "Bra! Vilken information behöver ni samla in från leads? (Budget, tidsram, beslutsroll, etc)",
        "Förstår. Vad är en kvalificerad lead för er? Finns det några disqualifiers?",
        "Perfekt. Vart ska kvalificerade leads skickas - HubSpot, e-post, Slack?",
        "Utmärkt! Jag skapar nu en leadbot som matchar era behov..."
      ],
      "customer-support": [
        "Tack! Hur vill ni hantera ärenden boten inte kan lösa - skapa ticket eller e-posta direkt?",
        "Förstår. Finns det någon prioritering - brådskande ärenden först?",
        "Bra. Vilka system använder ni - Zendesk, Freshdesk, eller e-post?",
        "Perfekt! Jag konfigurerar nu en supportbot för er..."
      ],
      "booking": [
        "Bra! Vilka tider är ni tillgängliga? (Vardagar 9-17, helger, etc)",
        "Förstår. Hur mycket tid i förväg ska bokningar göras - samma dag OK eller minst 24h?",
        "Perfekt. Ska bekräftelse-mail skickas automatiskt?",
        "Utmärkt! Jag skapar nu en bokningsbot åt er..."
      ],
      "ecommerce": [
        "Intressant! Använder ni Shopify, WooCommerce eller annan plattform?",
        "Förstår. Ska boten kunna lägga produkter i kundvagn eller bara rekommendera?",
        "Bra! Vill ni att boten kan svara på order-status och returer också?",
        "Perfekt! Jag konfigurerar nu en e-commerce assistant..."
      ],
      "hr-recruitment": [
        "Bra! Vilken typ av roller rekryterar ni till? (Tech, sales, admin, etc)",
        "Förstår. Vilka är era deal-breakers - språk, erfarenhet, plats?",
        "Perfekt. Ska boten boka intervjuer direkt i er kalender?",
        "Utmärkt! Jag skapar nu en rekryteringsbot..."
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
                <p className="text-xs text-gray-500">Alltid aktiv</p>
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
                  placeholder="Skriv ditt svar..."
                  className="chat-input"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  Skicka
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
            ← Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}
