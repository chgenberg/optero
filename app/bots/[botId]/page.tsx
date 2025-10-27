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
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "integrations" | "knowledge" | "approvals">("general");
  const [loading, setLoading] = useState(true);

  // Load bot data
  useEffect(() => {
    loadBotData();
  }, [botId]);

  const loadBotData = async () => {
    try {
      setLoading(true);
      // Load bot details
      const botRes = await fetch(`/api/bots/${botId}`);
      if (!botRes.ok) throw new Error("Failed to load bot");
      const botData = await botRes.json();
      setBot(botData);
      
      // Load integrations
      const intRes = await fetch(`/api/bots/${botId}/integrations`);
      if (intRes.ok) {
        const { integrations: integrationsData } = await intRes.json();
        setIntegrations(integrationsData);
      }

      // Load knowledge
      const knowRes = await fetch(`/api/bots/${botId}/knowledge`);
      if (knowRes.ok) {
        const { documents } = await knowRes.json();
        setKnowledge(documents);
      }
      
      // Create nodes for visualization
      const botNode: Node = {
        id: `bot-${botData.id}`,
        type: "bot",
        position: { x: 400, y: 250 },
        data: { bot: botData, isMain: true },
      };

      // Load integrations from API
      const intRes2 = await fetch(`/api/bots/${botId}/integrations`);
      let integrationsForNodes: any[] = [];
      if (intRes2.ok) {
        const { integrations: apiIntegrations } = await intRes2.json();
        integrationsForNodes = apiIntegrations;
      }

      const integrationNodes: Node[] = integrationsForNodes.map((integration, index) => ({
        id: `integration-${integration.id}`,
        type: "integration",
        position: { 
          x: 150 + (index % 2) * 500, 
          y: 150 + Math.floor(index / 2) * 200 
        },
        data: { integration },
      }));

      setNodes([botNode, ...integrationNodes] as Node[]);

      // Create edges for connected integrations
      const edgesData: Edge[] = integrationsForNodes
        .filter((i: any) => i.isConnected)
        .map((integration: any) => ({
          id: `edge-${integration.id}-${botData.id}`,
          source: `integration-${integration.id}`,
          target: `bot-${botData.id}`,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#666", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#666" },
        }));

      setEdges(edgesData);
    } catch (error) {
      console.error("Failed to load bot:", error);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback((params: Connection) => {
    // Extract integration ID from source node
    const sourceId = params.source?.replace("integration-", "") || "";
    
    // Save connection to API
    if (sourceId) {
      fetch(`/api/bots/${botId}/integrations/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId: sourceId }),
      }).catch(err => console.error("Failed to save connection:", err));
    }

    setEdges((eds) => addEdge({
      ...params,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#666", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#666" },
    }, eds));
  }, [setEdges, botId]);

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
                      {/* Document Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 mb-2">Drop documents here to upload</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Supports PDF, Word, Excel, PowerPoint, CSV, and more
                        </p>
                        <label className="inline-block">
                          <input
                            type="file"
                            multiple
                            onChange={async (e) => {
                              const files = e.currentTarget.files;
                              if (!files) return;

                              const formData = new FormData();
                              for (let i = 0; i < files.length; i++) {
                                formData.append("files", files[i]);
                              }

                              try {
                                const res = await fetch(`/api/bots/${botId}/knowledge/upload`, {
                                  method: "POST",
                                  body: formData,
                                });
                                
                                if (res.ok) {
                                  const data = await res.json();
                                  console.log("Uploaded:", data);
                                  // Reload knowledge
                                  const knowRes = await fetch(`/api/bots/${botId}/knowledge`);
                                  if (knowRes.ok) {
                                    const { documents } = await knowRes.json();
                                    setKnowledge(documents);
                                  }
                                }
                              } catch (error) {
                                console.error("Upload failed:", error);
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json,.rtf"
                          />
                          <button
                            type="button"
                            onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                          >
                            Browse Files
                          </button>
                        </label>
                      </div>

                      {/* Uploaded Documents List */}
                      {knowledge.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Uploaded Documents ({knowledge.length})</h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {knowledge.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <FileText size={16} className="text-gray-400" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{doc.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {doc.fileType} • {new Date(doc.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={async () => {
                                    // Delete document
                                    const res = await fetch(`/api/bots/${botId}/knowledge/${doc.id}`, {
                                      method: "DELETE",
                                    });
                                    if (res.ok) {
                                      setKnowledge(prev => prev.filter(d => d.id !== doc.id));
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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