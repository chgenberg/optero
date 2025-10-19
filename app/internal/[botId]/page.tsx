"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  Shield,
  LogOut,
  Settings,
  Search,
  Paperclip,
  Download,
  HelpCircle,
  Building2
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export default function InternalBotDashboard() {
  const router = useRouter();
  const params = useParams() as Record<string, string | string[]> | null;
  const botId = params
    ? (Array.isArray(params.botId) ? params.botId[0] : (params.botId || ""))
    : "";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [bot, setBot] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      if (!botId) return;
      try {
        const authResponse = await fetch("/api/auth/me");
        if (!authResponse.ok) {
          router.push(`/internal/login?redirect=/internal/${botId}`);
          return;
        }
        const userData = await authResponse.json();
        setUser(userData);

        // Load bot info
        const botResponse = await fetch(`/api/bots/${botId}`);
        if (botResponse.ok) {
          const botData = await botResponse.json();
          // Verify this is an internal bot
          if (botData.spec?.purpose !== 'internal') {
            router.push('/dashboard');
            return;
          }
          setBot(botData);
          
          // Add welcome message
          setMessages([{
            id: '1',
            role: 'assistant',
            content: botData.spec?.welcomeMessage || `Hi ${userData.name}! I'm here to help with company policies, procedures, and any internal questions you have.`,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/internal/login');
      }
    };

    checkAuth();
  }, [botId, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          history: messages.map(m => ({ role: m.role, content: m.content })),
          sessionId: `internal-${user?.id}-${botId}`,
          locale: 'en',
          tone: 'professional'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, upload file and process it
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I've uploaded a file: ${file.name}. Can you help me with this?`,
      timestamp: new Date(),
      attachments: [file.name]
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've received your file. Let me analyze it and help you with any questions you have about it.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const commonQuestions = [
    "What's our expense reimbursement policy?",
    "How do I request time off?",
    "What are our brand colors?",
    "Help me with an Excel formula"
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const handleLogout = () => {
    // Clear auth and redirect
    fetch('/api/auth/logout', { method: 'POST' });
    router.push('/internal/login');
  };

  if (!user || !bot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{bot.name}</h1>
              <p className="text-sm text-gray-500">Internal Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Secure Internal Access</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 flex-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Common Questions
          </h3>
          <div className="space-y-2">
            {commonQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                <Download className="w-4 h-4" />
                Brand Guidelines
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                <HelpCircle className="w-4 h-4" />
                Employee Handbook
              </a>
            </div>
          </div>
        </div>

        {/* User section */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {/* Role Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
            user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
            user.role === 'USER' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            <Shield className="w-3 h-3" />
            {user.role === 'ADMIN' ? 'Admin' : user.role === 'USER' ? 'User' : 'Viewer'}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Internal Knowledge Base</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => router.push('/internal/admin')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Admin Panel"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' ? 'bg-gray-900' : 'bg-gray-100'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-700" />
                )}
              </div>
              <div className={`max-w-2xl ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.attachments && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((file, idx) => (
                        <div key={idx} className="text-xs opacity-70 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {file}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-700" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              disabled={user.role === 'VIEWER'}
            />
            {user.role !== 'VIEWER' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={user.role === 'VIEWER' 
                ? "You have read-only access. Ask questions to view responses." 
                : "Ask about policies, procedures, Excel formulas, or anything else..."}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              This is a secure internal channel. All conversations are logged for compliance.
            </p>
            {user.role === 'VIEWER' && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Read-only access
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
