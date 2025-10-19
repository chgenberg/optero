"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Menu, X, LogOut, Settings, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params?.botId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("agentEmail")) {
      router.push("/agent");
      return;
    }
    
    // Load or create session
    const existingSessionId = localStorage.getItem(`agent-session-${botId}`);
    if (existingSessionId) {
      setSessionId(existingSessionId);
      loadSession(existingSessionId);
    } else {
      createSession();
    }
  }, [botId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const createSession = async () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setSessionId(newSessionId);
    localStorage.setItem(`agent-session-${botId}`, newSessionId);
    
    // Add welcome message
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hello! I'm your company AI assistant. I've learned from your website and documents. How can I help you today?",
      timestamp: new Date()
    }]);
  };

  const loadSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/session?sessionId=${sessionId}`);
      const data = await res.json();
      
      if (data.session && data.session.messages) {
        setMessages(data.session.messages);
      } else {
        createSession();
      }
    } catch (error) {
      createSession();
    }
  };

  const sendMessage = async () => {
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
      const res = await fetch("/api/bots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          history: [...messages, userMessage],
          sessionId
        })
      });
      
      const data = await res.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I couldn't process that request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save session
      if (sessionId) {
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            botId,
            messages: [...messages, userMessage, assistantMessage]
          })
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("files", file));
    
    try {
      const uploadRes = await fetch("/api/business/upload-documents", {
        method: "POST",
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      
      if (uploadData.content) {
        await fetch("/api/bots/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botId,
            title: "Uploaded documents",
            content: uploadData.content,
            source: "chat_upload"
          })
        });
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "I've learned from the documents you uploaded. You can now ask me questions about them!",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("agentEmail");
    sessionStorage.removeItem("agentCompanyUrl");
    localStorage.removeItem(`agent-session-${botId}`);
    router.push("/agent");
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 h-full w-72 bg-gray-50 border-r border-gray-200 z-50 md:relative md:z-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">Assistant</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  <button className="w-full text-left px-4 py-3 bg-white rounded-lg font-medium flex items-center gap-3">
                    <Bot className="w-5 h-5" />
                    Current Chat
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 text-gray-700"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                  
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 text-gray-700"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="font-semibold">Company Assistant</h1>
                <p className="text-sm text-gray-600">Always ready to help</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {sessionStorage.getItem("agentEmail")}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${
                    message.role === "user" ? "order-1" : ""
                  }`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-white border border-gray-200"
                    }`}>
                      {message.role === "assistant" ? (
                        <div 
                          className="prose prose-sm max-w-none prose-p:my-2 prose-strong:font-bold prose-strong:text-black prose-ul:my-2 prose-li:my-1"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <motion.div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me anything..."
                  rows={1}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black"
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
              </div>
              
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
