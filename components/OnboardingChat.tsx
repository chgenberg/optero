"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAgentTypes,
  generateSystemPrompt,
  createAgentProfile,
  type AgentType,
} from "@/lib/agents-client";
import { Send, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "buttons" | "file";
  buttons?: { label: string; value: string }[];
}

interface OnboardingChatProps {
  botId: string;
  onComplete: (profile: {
    agentTypeId: string;
    systemPrompt: string;
    mascot: string;
  }) => void;
}

const ONBOARDING_QUESTIONS: Record<string, string[]> = {
  customer_service: [
    "What are your 3 most common customer questions? Tell me briefly about each.",
    "What problems do you solve most often for your customers?",
    "Approximately how many support inquiries do you get per week?",
    "Are there any important policies I should know about? (returns, refunds, hours, etc)",
    "What's the best way to keep your customers happy according to you?",
  ],
  finance: [
    "What type of financial service do you offer? (investments, budgeting, tax planning, insurance, etc)",
    "Who is your typical customer? (individuals, small businesses, enterprises?)",
    "What are your main products or investment options?",
    "Is there a fee structure or commissions I should explain?",
    "What are the key regulations or compliance requirements in your industry?",
  ],
  creative: [
    "What type of creative work do you specialize in? (design, copywriting, video, music, branding, etc)",
    "What are your main services or packages?",
    "What's your pricing model? (per project, hourly, subscription?)",
    "What are your biggest strengths or unique selling points?",
    "What industries or client types do you prefer to work with?",
  ],
};

// Extended questions for Detailed setup
const EXTENDED_ONBOARDING_QUESTIONS: Record<string, string[]> = {
  customer_service: [
    ...ONBOARDING_QUESTIONS.customer_service,
    "What's your biggest challenge when it comes to customer satisfaction?",
    "How would you describe your ideal customer or customer profile?",
  ],
  finance: [
    ...ONBOARDING_QUESTIONS.finance,
    "What's your biggest challenge when managing customer relationships?",
    "What are the most important compliance or regulatory concerns for you?",
  ],
  creative: [
    ...ONBOARDING_QUESTIONS.creative,
    "What makes you different from other creative professionals?",
    "What's your typical project timeline and process?",
  ],
};

// Comprehensive questions with even more detail
const COMPREHENSIVE_ONBOARDING_QUESTIONS: Record<string, string[]> = {
  customer_service: [
    ...EXTENDED_ONBOARDING_QUESTIONS.customer_service,
    "Tell me about your company culture and core values.",
    "What metrics or KPIs matter most to you?",
    "Describe your ideal customer service interaction.",
    "What's your support team size and capabilities?",
  ],
  finance: [
    ...EXTENDED_ONBOARDING_QUESTIONS.finance,
    "Tell me about your company and your mission.",
    "What's your competitive advantage in the market?",
    "How do you measure success with your clients?",
    "What's your risk tolerance and investment philosophy?",
  ],
  creative: [
    ...EXTENDED_ONBOARDING_QUESTIONS.creative,
    "Tell me about your creative style and vision.",
    "What's your typical price range for projects?",
    "How do you handle client feedback and revisions?",
    "What are your career goals for the next 2 years?",
  ],
};

export default function OnboardingChat({
  botId,
  onComplete,
}: OnboardingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [setupType, setSetupType] = useState<"quick" | "detailed" | "comprehensive" | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load agent types on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const types = await fetchAgentTypes();
        setAgentTypes(types);

        // Add welcome message
        const welcomeMsg: Message = {
          id: "welcome",
          role: "assistant",
          content:
            "Hey! 👋 Nice to see you!\n\nI'm here to become your perfect AI assistant. To do that, I need to learn a bit about you and your business so I can personalize everything exactly to your needs.\n\nThis will only take a few minutes, and I promise to ask smart questions! Let's get started! 🚀",
          timestamp: new Date(),
          type: "text",
        };
        setMessages([welcomeMsg]);

        // Add agent selection message
        setTimeout(() => {
          const agentSelectMsg: Message = {
            id: "agent-select",
            role: "assistant",
            content: "First, what type of assistant would you like to create? Choose the one that best fits your needs:",
            timestamp: new Date(),
            type: "buttons",
            buttons: types.map((t) => ({
              label: t.name,
              value: t.id,
            })),
          };
          setMessages((prev) => [...prev, agentSelectMsg]);
        }, 1500);
      } catch (error) {
        console.error("Failed to load agent types:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAgentSelect = async (agentId: string) => {
    const agent = agentTypes.find((a) => a.id === agentId);
    if (!agent) return;

    setSelectedAgent(agent);

    // Add user response
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: agent.name,
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add first question
    setTimeout(() => {
      const questions = ONBOARDING_QUESTIONS[agent.slug] || [];
      if (questions.length > 0) {
        // Add confirmation message
        const confirmMsg: Message = {
          id: `confirm-${Date.now()}`,
          role: "assistant",
          content: `Perfect! 👌 I'll be a ${agent.name} assistant. This is great!\n\nNow I need to ask you how much time you want to spend on this setup:`,
          timestamp: new Date(),
          type: "buttons",
          buttons: [
            {
              label: "⚡ Quick Setup (5 min)",
              value: "quick",
            },
            {
              label: "📊 Detailed Setup (8 min)",
              value: "detailed",
            },
            {
              label: "🚀 Comprehensive Setup (12 min)",
              value: "comprehensive",
            },
          ],
        };
        setMessages((prev) => [...prev, confirmMsg]);
      }
    }, 500);
  };

  const handleSendResponse = async () => {
    if (!input.trim() || !selectedAgent || !setupType) return;

    // Get correct questions array based on setup type
    let questions: string[] = [];
    if (setupType === "quick") {
      questions = ONBOARDING_QUESTIONS[selectedAgent.slug] || [];
    } else if (setupType === "detailed") {
      questions = EXTENDED_ONBOARDING_QUESTIONS[selectedAgent.slug] || [];
    } else {
      questions = COMPREHENSIVE_ONBOARDING_QUESTIONS[selectedAgent.slug] || [];
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Store response
    const responseKey = `q${currentQuestionIndex}`;
    setResponses((prev) => ({
      ...prev,
      [responseKey]: input,
    }));

    // Check if there are more questions
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      // Add positive feedback
      const feedbackMessages = [
        "Thanks for sharing! That's really helpful. 👌",
        "Great! I'm starting to understand your business better. 💡",
        "Perfect! This info will help me serve you better. ✨",
        "Excellent! I'm learning so much about you. 🎯",
        "Love it! You're doing great. 🚀",
      ];
      
      const randomFeedback = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
      
      setTimeout(() => {
        const feedbackMsg: Message = {
          id: `feedback-${nextQuestionIndex}`,
          role: "assistant",
          content: randomFeedback,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, feedbackMsg]);
      }, 300);

      // Add next question
      setTimeout(() => {
        const progressText = `Question ${nextQuestionIndex + 1} of ${questions.length}`;
        const nextQuestion: Message = {
          id: `question-${nextQuestionIndex}`,
          role: "assistant",
          content: `${progressText}\n\n${questions[nextQuestionIndex]}`,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, nextQuestion]);
        setCurrentQuestionIndex(nextQuestionIndex);
      }, 1500);
    } else {
      // All questions answered - generate system prompt
      await finalizeOnboarding();
    }
  };

  const finalizeOnboarding = async () => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      // Add processing message
      const processingMsg: Message = {
        id: `processing-${Date.now()}`,
        role: "assistant",
        content: "Thanks so much! 🙏 Let me create your personalized system with all this information...",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, processingMsg]);

      // Generate system prompt
      const systemPrompt = await generateSystemPrompt({
        agentTypeId: selectedAgent.id,
        selectedCategoryPath: [selectedAgent.slug],
        selectedUseCases: [],
        onboardingResponses: responses,
        companyData: {},
      });

      // Add intermediate success message
      setTimeout(() => {
        const successMsg: Message = {
          id: `success-${Date.now()}`,
          role: "assistant",
          content: `✅ Done! I've analyzed everything you told me and I'm now fully configured to help you.\n\nI understand your needs, your business, and exactly how to help. I'm ready to answer questions, provide guidance, and support you in everything you do.`,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, successMsg]);
      }, 1500);

      // Add completion message with what they can do now
      setTimeout(() => {
        const completionMsg: Message = {
          id: `completion-${Date.now()}`,
          role: "assistant",
          content: `Let's get started! 🚀\n\nYou can now:\n• Ask me questions about anything\n• Get advice and recommendations\n• Brainstorm ideas\n• Get help with tasks\n\nI'll use everything you told me to give you the best possible help. What would you like to know?`,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, completionMsg]);

        // Complete onboarding
        setTimeout(() => {
          onComplete({
            agentTypeId: selectedAgent.id,
            systemPrompt,
            mascot: selectedAgent.mascot,
          });
        }, 2000);
      }, 3500);
    } catch (error) {
      console.error("Failed to finalize onboarding:", error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Oops! Something went wrong. 😅 Let's try that again. Could you help me understand what went wrong?",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTypeSelect = (type: "quick" | "detailed" | "comprehensive") => {
    if (!selectedAgent) return;

    setSetupType(type);

    // Add user response
    const setupLabels = {
      quick: "⚡ Quick Setup (5 min)",
      detailed: "📊 Detailed Setup (8 min)",
      comprehensive: "🚀 Comprehensive Setup (12 min)",
    };

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: setupLabels[type],
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);

    // Get questions based on setup type
    let questions: string[] = [];
    if (type === "quick") {
      questions = ONBOARDING_QUESTIONS[selectedAgent.slug] || [];
    } else if (type === "detailed") {
      questions = EXTENDED_ONBOARDING_QUESTIONS[selectedAgent.slug] || [];
    } else {
      questions = COMPREHENSIVE_ONBOARDING_QUESTIONS[selectedAgent.slug] || [];
    }

    // Add encouraging message
    setTimeout(() => {
      const encourageMsg: Message = {
        id: `encourage-${Date.now()}`,
        role: "assistant",
        content: `Perfect! 💪 I'll ask you ${questions.length} questions to really understand your business. Let's go!`,
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, encourageMsg]);
    }, 500);

    // Add first question
    setTimeout(() => {
      const firstQuestion: Message = {
        id: `question-0`,
        role: "assistant",
        content: `Question 1 of ${questions.length}\n\n${questions[0]}`,
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, firstQuestion]);
      setCurrentQuestionIndex(0);
    }, 1200);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-black"
                }`}
              >
                <p className="text-sm">{msg.content}</p>

                {/* Buttons for agent/setup selection */}
                {msg.type === "buttons" && msg.buttons && (
                  <div className="mt-3 space-y-2">
                    {msg.buttons.map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => {
                          // Check if this is agent selection or setup type selection
                          if (msg.id === "agent-select") {
                            handleAgentSelect(btn.value);
                          } else if (msg.id === "confirm-" || msg.id.startsWith("confirm-")) {
                            handleSetupTypeSelect(btn.value as "quick" | "detailed" | "comprehensive");
                          }
                        }}
                        disabled={loading}
                        className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {selectedAgent && currentQuestionIndex < (ONBOARDING_QUESTIONS[selectedAgent.slug]?.length || 0) && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleSendResponse();
                }
              }}
              placeholder="Type your answer..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
            <button
              onClick={handleSendResponse}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
