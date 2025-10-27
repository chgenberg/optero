"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Menu, X, LogOut, Settings, Bot, User, Loader2 } from "lucide-react";
import Image from "next/image";
import { fetchAgentProfile, fetchChatSession, saveChatSession } from "@/lib/agents-client";
import SessionHistory from "@/components/SessionHistory";
import AgentTreeOnboarding from "@/components/AgentTreeOnboarding";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AgentData {
  id: string;
  name: string;
  mascot: string;
  color: string;
  selectedCategoryPath: string[];
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
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load agent profile on mount
  useEffect(() => {
    const loadAgent = async () => {
      try {
        if (!sessionStorage.getItem("agentEmail")) {
          router.push("/agent");
          return;
        }

        const profile = await fetchAgentProfile(botId);
        if (profile && profile.agentType) {
          setAgentData({
            id: profile.agentType.id,
            name: profile.agentType.name,
            mascot: profile.agentType.mascot,
            color: profile.agentType.color,
            selectedCategoryPath: profile.selectedCategoryPath,
          });
          setNeedsOnboarding(false);
        } else {
          // No profile yet - show onboarding
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to load agent profile:", error);
        // If error fetching profile, show onboarding
        setNeedsOnboarding(true);
      } finally {
        setAgentLoading(false);
      }
    };

    if (botId) {
      loadAgent();
    }
  }, [botId]);

  // Load or create session
  useEffect(() => {
    if (!agentLoading) {
      const existingSessionId = localStorage.getItem(`agent-session-${botId}`);
      if (existingSessionId) {
        setSessionId(existingSessionId);
        loadSession(existingSessionId);
      } else {
        createSession();
      }
    }
  }, [botId, agentLoading]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const createSession = async () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setSessionId(newSessionId);
    
    // Add welcome message from agent
    const welcomeMessage = agentData
      ? `Hej! Jag är ${agentData.name}. ${agentData.selectedCategoryPath.join(" → ")} - Hur kan jag hjälpa dig idag?`
      : "Hej! Jag är din AI-assistent. Hur kan jag hjälpa dig?";

    const initialMessages = [{
      id: "1",
      role: "assistant" as const,
      content: welcomeMessage,
      timestamp: new Date()
    }];

    setMessages(initialMessages);

    // Save initial session to DB
    try {
      await saveChatSession({
        botId,
        sessionId: newSessionId,
        messages: initialMessages,
        title: `Chat ${new Date().toLocaleDateString()}`,
      });
      // Store session ID in localStorage for quick access
      localStorage.setItem(`agent-session-${botId}`, newSessionId);
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const session = await fetchChatSession(botId, sessionId);
      
      if (session && session.messages) {
        setMessages(session.messages);
      } else {
        createSession();
      }
    } catch (error) {
      console.error("Failed to load session:", error);
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
        content: data.reply || "Jag kunde inte bearbeta din begäran. Försök igen.",
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      
      // Save session to DB
      if (sessionId) {
        try {
          await saveChatSession({
            botId,
            sessionId,
            messages: updatedMessages,
          });
        } catch (error) {
          console.error("Failed to save session:", error);
        }
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
          content: "Jag har lärt mig från dokumenten du skickade. Du kan nu ställa frågor om dem!",
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
    // Don't remove localStorage session ID - it will be used when logging back in
    router.push("/agent");
  };

  const getMascotPath = (mascot: string) => `/Mascots/${mascot}`;

  if (agentLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show onboarding if no agent profile exists
  if (needsOnboarding) {
    return (
      <AgentTreeOnboarding
        botId={botId}
        onComplete={(profile) => {
          // Reload agent data after onboarding
          setNeedsOnboarding(false);
          setAgentData({
            id: profile.agentTypeId,
            name: "", // Will be loaded in next effect
            mascot: profile.mascot,
            color: "",
            selectedCategoryPath: [],
          });
          // Reload the agent profile
          const loadAgent = async () => {
            try {
              const profile = await fetchAgentProfile(botId);
              if (profile && profile.agentType) {
                setAgentData({
                  id: profile.agentType.id,
                  name: profile.agentType.name,
                  mascot: profile.agentType.mascot,
                  color: profile.agentType.color,
                  selectedCategoryPath: profile.selectedCategoryPath,
                });
              }
            } catch (error) {
              console.error("Failed to reload agent profile:", error);
            }
          };
          loadAgent();
        }}
      />
    );
  }

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
                
                {/* Agent Info in Sidebar */}
                {agentData && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src={getMascotPath(agentData.mascot)}
                        alt={agentData.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-sm font-semibold text-center">{agentData.name}</p>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      {agentData.selectedCategoryPath.join(" → ")}
                    </p>
                  </div>
                )}
                
                {/* Session History */}
                <SessionHistory
                  botId={botId}
                  currentSessionId={sessionId || undefined}
                  onSessionSelect={(newSessionId) => {
                    setSessionId(newSessionId);
                    loadSession(newSessionId);
                  }}
                  onNewSession={() => {
                    createSession();
                  }}
                />

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors mt-4 border-t border-gray-200 pt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
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
              
              <div className="flex items-center gap-3">
                {agentData && (
                  <div className="relative w-10 h-10">
                    <Image
                      src={getMascotPath(agentData.mascot)}
                      alt={agentData.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="font-semibold">{agentData?.name || "Company Assistant"}</h1>
                  <p className="text-sm text-gray-600">Always ready to help</p>
                </div>
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
                  {message.role === "assistant" && agentData && (
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={getMascotPath(agentData.mascot)}
                        alt={agentData.name}
                        fill
                        className="object-contain rounded-full bg-gray-100 p-1"
                      />
                    </div>
                  )}
                  {message.role === "assistant" && !agentData && (
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
                {agentData && (
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={getMascotPath(agentData.mascot)}
                      alt={agentData.name}
                      fill
                      className="object-contain rounded-full bg-gray-100 p-1"
                    />
                  </div>
                )}
                {!agentData && (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
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
