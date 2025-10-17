"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";
import Stepper from "@/components/Stepper";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    source?: string;
    requiresApproval?: boolean;
    approved?: boolean;
  };
}

interface QuickTest {
  id: string;
  label: string;
  message: string;
  expectedAction?: string;
}

const quickTestsByType: Record<string, QuickTest[]> = {
  support: [
    {
      id: 'reset-password',
      label: 'Password Reset',
      message: 'I forgot my password and need to reset it',
      expectedAction: 'Create support ticket'
    },
    {
      id: 'refund',
      label: 'Refund Request',
      message: 'I want to return my order and get a refund',
      expectedAction: 'Create return ticket'
    },
    {
      id: 'technical',
      label: 'Technical Issue',
      message: 'The app keeps crashing when I try to log in',
      expectedAction: 'Create technical ticket'
    }
  ],
  lead: [
    {
      id: 'demo',
      label: 'Book Demo',
      message: 'I\'d like to see a demo of your product',
      expectedAction: 'Capture lead info'
    },
    {
      id: 'pricing',
      label: 'Pricing Info',
      message: 'What are your pricing plans?',
      expectedAction: 'Share pricing'
    },
    {
      id: 'contact',
      label: 'Contact Sales',
      message: 'I need to speak with someone from sales',
      expectedAction: 'Route to sales'
    }
  ],
  knowledge: [
    {
      id: 'hours',
      label: 'Business Hours',
      message: 'What are your opening hours?'
    },
    {
      id: 'features',
      label: 'Product Features',
      message: 'What features does your premium plan include?'
    },
    {
      id: 'shipping',
      label: 'Shipping Info',
      message: 'Do you ship internationally?'
    }
  ],
  workflow: [
    {
      id: 'invoice',
      label: 'Find Invoice',
      message: 'Show me invoice #12345',
      expectedAction: 'Lookup invoice'
    },
    {
      id: 'vacation',
      label: 'Time Off Request',
      message: 'I want to request vacation days for next week',
      expectedAction: 'Create request'
    },
    {
      id: 'expense',
      label: 'Submit Expense',
      message: 'I need to submit an expense report',
      expectedAction: 'Start expense flow'
    }
  ]
};

export default function TestBotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [botType, setBotType] = useState('support');
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedType = sessionStorage.getItem('selectedBotType') || 'support';
    setBotType(storedType);
    
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: 'Hi! I\'m your test bot. Try out some quick tests or type your own message to see how I respond.'
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickTest = async (test: QuickTest) => {
    await sendMessage(test.message);
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate bot response
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate response based on bot type
    let response: Message = {
      role: 'assistant',
      content: '',
      metadata: {}
    };

    if (botType === 'support' && content.toLowerCase().includes('password')) {
      response.content = 'I can help you reset your password. I\'ll create a support ticket for you right away.';
      response.metadata = {
        source: 'Zendesk',
        requiresApproval: true
      };
      
      // Add to pending approvals
      setPendingApprovals(prev => [...prev, {
        id: Date.now(),
        type: 'zendesk_ticket',
        action: 'Create password reset ticket',
        status: 'pending'
      }]);
    } else if (botType === 'lead' && content.toLowerCase().includes('demo')) {
      response.content = 'I\'d be happy to schedule a demo for you! Let me collect some information first. What\'s your email address?';
      response.metadata = {
        source: 'HubSpot'
      };
    } else if (botType === 'knowledge') {
      response.content = 'Based on our documentation: We\'re open Monday-Friday 9 AM to 6 PM EST. Our customer service team is available during these hours to assist you.';
      response.metadata = {
        source: 'Website FAQ'
      };
    } else {
      response.content = 'I understand your request. In a live environment, I would process this for you using the configured integrations.';
    }

    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  const handleSendMessage = () => {
    if (input.trim() && !loading) {
      sendMessage(input);
    }
  };

  const handleApprove = (approvalId: number) => {
    setPendingApprovals(prev => 
      prev.map(a => a.id === approvalId ? { ...a, status: 'approved' } : a)
    );
    
    // Add system message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '✅ Action approved and executed successfully.',
      metadata: { approved: true }
    }]);
  };

  const handleReject = (approvalId: number) => {
    setPendingApprovals(prev => 
      prev.map(a => a.id === approvalId ? { ...a, status: 'rejected' } : a)
    );
  };

  const handleContinue = () => {
    router.push('/business/bot-builder/launch');
  };

  const quickTests = quickTestsByType[botType] || quickTestsByType.knowledge;

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper currentStep={4} steps={['Overview', 'Choose', 'Customize', 'Integrations', 'Test', 'Launch']} />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            Test Your Bot
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Try out your bot before launching. Test different scenarios to make sure everything works as expected.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl h-[600px] flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Test Bot</h3>
                    <p className="text-xs text-gray-500">Testing mode</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl
                      ${message.role === 'user' 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-900'
                      }
                    `}>
                      <p className="text-sm">{message.content}</p>
                      {message.metadata?.source && (
                        <p className="text-xs mt-2 opacity-70">
                          via {message.metadata.source}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t-2 border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      p-2 rounded-xl transition-colors
                      ${input.trim() && !loading
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border-2 border-gray-200 p-6"
            >
              <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Quick Tests
              </h3>
              <div className="space-y-2">
                {quickTests.map(test => (
                  <motion.button
                    key={test.id}
                    onClick={() => handleQuickTest(test)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-sm text-black">{test.label}</p>
                    <p className="text-xs text-gray-500 mt-1">"{test.message}"</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Pending Approvals */}
            {pendingApprovals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border-2 border-yellow-400 p-6"
              >
                <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Approvals
                </h3>
                <div className="space-y-3">
                  {pendingApprovals.filter(a => a.status === 'pending').map(approval => (
                    <div key={approval.id} className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-black mb-2">{approval.action}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(approval.id)}
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.button
              onClick={handleContinue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full minimal-button flex items-center justify-center gap-2"
            >
              Continue to Launch
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
