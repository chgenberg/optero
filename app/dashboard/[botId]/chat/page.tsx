"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, ArrowLeft, Bot, User, Loader2, RefreshCw,
  FileText, Package, TrendingUp, ShoppingCart
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface BotInfo {
  id: string;
  name: string;
  type: string;
  spec?: any;
}

export default function HeadlessChatPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params?.botId as string;
  
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBot, setLoadingBot] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (botId) loadBot();
  }, [botId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadBot = async () => {
    try {
      const res = await fetch(`/api/bots/stats?botId=${botId}`);
      const data = await res.json();
      if (data.bot) {
        setBot(data.bot);
        // Add welcome message
        setMessages([{
          id: '1',
          role: 'assistant',
          content: getWelcomeMessage(data.bot),
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to load bot:', error);
    } finally {
      setLoadingBot(false);
    }
  };

  const getWelcomeMessage = (bot: BotInfo): string => {
    if (bot.spec?.centraApiBaseUrl) {
      return "Hi! I'm connected to your Centra e-commerce system. I can help you check orders, products, inventory levels, and more. What would you like to know?";
    }
    if (bot.spec?.hubspotEnabled) {
      return "Hello! I have access to your HubSpot CRM. I can analyze customers, deals, contacts, and provide insights. How can I help you today?";
    }
    if (bot.spec?.zendeskDomain) {
      return "Welcome! I'm connected to your Zendesk support system. I can check tickets, customer issues, and support metrics. What can I help you with?";
    }
    if (bot.spec?.shopifyDomain) {
      return "Hi there! I'm integrated with your Shopify store. I can check orders, products, customers, and analytics. What would you like to explore?";
    }
    return `Welcome! I'm ${bot.name}, your AI assistant. How can I help you today?`;
  };

  const scrollToBottom = () => {
    // Keep the page position fixed and move only the messages container
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/bots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          message: input,
          sessionId: sessionStorage.getItem(`chat-session-${botId}`) || undefined
        })
      });

      const data = await response.json();
      
      // Save session ID
      if (data.sessionId) {
        sessionStorage.setItem(`chat-session-${botId}`, data.sessionId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I couldn't process that request. Please try again.",
        timestamp: new Date(),
        metadata: data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    if (confirm("Clear chat history and start over?")) {
      sessionStorage.removeItem(`chat-session-${botId}`);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getWelcomeMessage(bot!),
        timestamp: new Date()
      }]);
    }
  };

  const getSuggestedQueries = () => {
    if (!bot) return [];
    
    if (bot.spec?.centraApiBaseUrl) {
      return [
        "Show me today's orders",
        "What's the current inventory for our top products?",
        "List products that are low in stock",
        "Show sales trends for this month"
      ];
    }
    if (bot.spec?.hubspotEnabled) {
      return [
        "Analyze our top 10 customers by revenue",
        "What's the average deal size this quarter?",
        "Show me deals closing this week",
        "Who are our most engaged contacts?"
      ];
    }
    if (bot.spec?.zendeskDomain) {
      return [
        "How many open tickets do we have?",
        "What are the most common support issues?",
        "Show average resolution time this week",
        "List high priority tickets"
      ];
    }
    if (bot.spec?.shopifyDomain) {
      return [
        "What are our best selling products?",
        "Show me abandoned carts from today",
        "What's our conversion rate this month?",
        "List customers with multiple orders"
      ];
    }
    return [];
  };

  if (loadingBot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full"
        />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bot not found</p>
          <button onClick={() => router.push('/dashboard')} className="minimal-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const suggestedQueries = getSuggestedQueries();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/${botId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">{bot.name}</h1>
              <p className="text-sm text-gray-600">Internal Assistant</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div 
                      className="prose prose-sm max-w-none prose-p:my-2 prose-strong:font-bold prose-strong:text-black prose-ul:my-2 prose-li:my-1"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {message.metadata.source || "API Response"}
                      </p>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Queries */}
      {messages.length === 1 && suggestedQueries.length > 0 && (
        <div className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(query);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your connected systems..."
              rows={1}
              className="flex-1 resize-none px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              style={{
                minHeight: "48px",
                maxHeight: "120px"
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
