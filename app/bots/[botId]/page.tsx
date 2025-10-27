"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  addEdge,
  Connection,
  MarkerType,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Settings, Plus, Zap, Globe, MessageSquare, FileText, BarChart, X, ChevronRight, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Bot {
  id: string;
  name: string;
  companyUrl?: string;
  spec?: any;
  integrations?: any[];
  createdAt?: string;
}

interface Integration {
  id: string;
  type: string;
  name: string;
  icon?: string;
  settings?: any;
  connectedBots: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback: "up" | "down" | null;
  timestamp: number;
}

// Enhanced Bot Node Component
const BotNode = ({ data }: { data: { bot: Bot; isMain?: boolean } }) => {
  const gradients = [
    "from-gray-900 to-gray-700",
    "from-gray-800 to-gray-600",
    "from-black to-gray-800"
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className={`relative group ${data.isMain ? 'scale-125' : ''}`}>
      <div className={`
        relative bg-gradient-to-br ${gradient} 
        ${data.isMain ? 'w-40 h-40' : 'w-32 h-32'}
        rounded-2xl flex items-center justify-center cursor-pointer 
        transform transition-all duration-300 hover:scale-110 hover:rotate-3
        shadow-2xl hover:shadow-3xl
        border-2 border-gray-300 hover:border-white
      `}>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white border-2 border-gray-800" />
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white border-2 border-gray-800" />
        <Handle type="source" position={Position.Top} className="w-3 h-3 bg-white border-2 border-gray-800" />
        <Handle type="target" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-gray-800" />
        
        <div className="text-center p-4">
          <div className="text-white mb-2">
            <MessageSquare size={data.isMain ? 32 : 24} />
          </div>
          <p className={`${data.isMain ? 'text-sm' : 'text-xs'} font-bold text-white truncate`}>
            {data.bot.name}
          </p>
          <p className="text-xs text-gray-300 truncate mt-1">
            {data.bot.companyUrl?.replace(/https?:\/\//, "") || "AI Agent"}
          </p>
        </div>
      </div>
      
      {/* Floating stats */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-medium border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
        💬 12 chats
      </div>
    </div>
  );
};

// Enhanced Integration Node Component
const IntegrationNode = ({ data }: { data: { integration: Integration } }) => {
  const icons: Record<string, JSX.Element> = {
    webhook: <Globe className="text-white" size={20} />,
    email: <MessageSquare className="text-white" size={20} />,
    slack: <Zap className="text-white" size={20} />,
    analytics: <BarChart className="text-white" size={20} />,
    documents: <FileText className="text-white" size={20} />,
  };

  const colors: Record<string, string> = {
    webhook: "from-purple-600 to-purple-800",
    email: "from-blue-600 to-blue-800",
    slack: "from-green-600 to-green-800",
    analytics: "from-orange-600 to-orange-800",
    documents: "from-red-600 to-red-800",
  };

  return (
    <div className="relative group">
      <div className={`
        relative bg-gradient-to-br ${colors[data.integration.type] || 'from-gray-600 to-gray-800'}
        w-24 h-24 rounded-xl flex items-center justify-center cursor-pointer
        transform transition-all duration-300 hover:scale-110 hover:-rotate-3
        shadow-xl hover:shadow-2xl
        border-2 border-white/20 hover:border-white/40
      `}>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white border-2 border-gray-800" />
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white border-2 border-gray-800" />
        <Handle type="source" position={Position.Top} className="w-3 h-3 bg-white border-2 border-gray-800" />
        <Handle type="target" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-gray-800" />
        
        <div className="text-center">
          <div className="mb-2">
            {icons[data.integration.type] || <Zap className="text-white" size={20} />}
          </div>
          <p className="text-xs font-medium text-white">
            {data.integration.name}
          </p>
        </div>
      </div>
      
      {/* Connection indicator */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
    </div>
  );
};

const nodeTypes = {
  bot: BotNode,
  integration: IntegrationNode,
};

export default function BotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.botId as string;

  const [bot, setBot] = useState<Bot | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "integrations" | "knowledge" | "approvals">("general");

  // Load bot data
  useEffect(() => {
    loadBotData();
  }, [botId]);

  const loadBotData = async () => {
    try {
      const res = await fetch(`/api/bots/${botId}`);
      if (res.ok) {
        const botData = await res.json();
        setBot(botData);
        
        // Create nodes for visualization
        const botNode: Node = {
          id: `bot-${botData.id}`,
          type: "bot",
          position: { x: 400, y: 250 },
          data: { bot: botData, isMain: true },
        };

        // Mock integrations for demo
        const mockIntegrations: Integration[] = [
          { id: "1", type: "webhook", name: "Webhook", connectedBots: [botData.id] },
          { id: "2", type: "email", name: "Email", connectedBots: [botData.id] },
          { id: "3", type: "analytics", name: "Analytics", connectedBots: [] },
        ];
        setIntegrations(mockIntegrations);

        const integrationNodes: Node[] = mockIntegrations.map((integration, index) => ({
          id: `integration-${integration.id}`,
          type: "integration",
          position: { 
            x: 150 + (index % 2) * 500, 
            y: 150 + Math.floor(index / 2) * 200 
          },
          data: { integration },
        }));

        setNodes([botNode, ...integrationNodes]);

        // Create edges for connected integrations
        const edges: Edge[] = mockIntegrations
          .filter(i => i.connectedBots.includes(botData.id))
          .map(integration => ({
            id: `edge-${integration.id}-${botData.id}`,
            source: `integration-${integration.id}`,
            target: `bot-${botData.id}`,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#666", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#666" },
          }));

        setEdges(edges);
      }
    } catch (error) {
      console.error("Failed to load bot:", error);
    }
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#666", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#666" },
    }, eds));
  }, [setEdges]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: chatInput,
      feedback: null,
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/bots/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          history: [...chatMessages, userMessage],
          locale: "en",
          tone: "professional",
        }),
      });

      if (res.ok) {
      const data = await res.json();
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: data.reply,
          feedback: null,
          timestamp: Date.now(),
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 relative" style={{ height: "calc(100vh - 160px)" }}>
        {/* Canvas */}
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
            }}
            fitView
          >
            <Background variant="dots" gap={20} size={1} color="#e5e5e5" />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>

        {/* Floating Action Buttons */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white border-2 border-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
            </div>

        {/* Settings Toggle */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-20">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`
              bg-black text-white rounded-l-lg p-3 transition-all duration-300
              ${showSettings ? 'translate-x-0' : 'translate-x-0'}
              hover:bg-gray-800
            `}
          >
            {showSettings ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Chat Toggle */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-black text-white rounded-full p-4 hover:bg-gray-800 transition-colors shadow-lg"
          >
            <MessageSquare size={24} />
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute top-0 right-0 w-1/2 h-full bg-white border-l-2 border-gray-200 shadow-2xl z-30 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Settings Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{bot?.name} Settings</h2>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex gap-4 mt-4">
                    {["general", "integrations", "knowledge", "approvals"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSettingsTab(tab as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          settingsTab === tab
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {settingsTab === "general" && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Bot Name</label>
                        <input
                          type="text"
                          value={bot?.name || ""}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Company URL</label>
                        <input
                          type="text"
                          value={bot?.companyUrl || ""}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          readOnly
                        />
                      </div>
                    </div>
                  )}

                  {settingsTab === "integrations" && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Drag and drop integrations from the canvas to connect them.</p>
                      <div className="grid gap-4">
                        {integrations.map((integration) => (
                          <div
                            key={integration.id}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{integration.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {integration.connectedBots.includes(botId) ? "Connected" : "Not connected"}
                                </p>
                              </div>
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Configure
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settingsTab === "knowledge" && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 mb-2">Drop documents here to upload</p>
                        <p className="text-sm text-gray-500">
                          Supports PDF, Word, Excel, PowerPoint, and more
                        </p>
                        <button className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                          Browse Files
                        </button>
                      </div>
                    </div>
                  )}

                  {settingsTab === "approvals" && (
                    <div className="space-y-4">
                      <p className="text-gray-600">Configure approval workflows for your bot.</p>
                      <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                        Add Approval Rule
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-30 flex flex-col"
            >
              {/* Chat Header */}
              <div className="bg-black text-white p-4 rounded-t-lg flex justify-between items-center">
                <h3 className="font-medium">Chat with {bot?.name}</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="mx-auto mb-2" size={32} />
                    <p>Start a conversation with your AI assistant</p>
                  </div>
                )}
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <ReactMarkdown className="text-sm">{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChat()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || chatLoading}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
        </div>
      </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}