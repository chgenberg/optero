"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { X } from "lucide-react";

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
  settings?: any;
  connectedBots: string[];
}

// Custom Bot Node Component
const BotNode = ({ data }: { data: { bot: Bot; onChat: () => void; onDelete: () => void; onEdit: () => void; stats?: any } }) => {
  return (
    <div className="relative">
    <div
      className="relative bg-white border-2 border-black rounded-full w-32 h-32 flex items-center justify-center cursor-pointer hover:scale-105 transition-all bot-node-shadow"
      onClick={data.onChat}
    >
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      
      <div className="text-center p-4">
        <p className="text-xs font-bold truncate">{data.bot.name}</p>
        <p className="text-xs text-gray-500 truncate mt-1">
          {data.bot.companyUrl?.replace(/https?:\/\//, "") || "No URL"}
        </p>
          {data.stats && (
            <p className="text-xs text-blue-600 mt-1">
              💬 {data.stats.chats || 0}
            </p>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit();
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors"
          title="Edit bot"
        >
          ✎
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${data.bot.name}"? This cannot be undone.`)) {
              data.onDelete();
            }
          }}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors"
          title="Delete bot"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Pastel colors for different integration types
const integrationColors: Record<string, string> = {
  webhook: "bg-purple-100 border-purple-300",
  slack: "bg-pink-100 border-pink-300",
  teams: "bg-blue-100 border-blue-300",
  discord: "bg-indigo-100 border-indigo-300",
  zapier: "bg-orange-100 border-orange-300",
  email: "bg-green-100 border-green-300",
  sms: "bg-yellow-100 border-yellow-300",
  calendar: "bg-red-100 border-red-300",
  crm: "bg-teal-100 border-teal-300",
  analytics: "bg-cyan-100 border-cyan-300",
  database: "bg-gray-100 border-gray-300",
  api: "bg-purple-100 border-purple-300",
};

// Custom Integration Node Component
const IntegrationNode = ({ data }: { data: { integration: Integration; onClick: () => void } }) => {
  const colorClass = integrationColors[data.integration.type] || "bg-gray-100 border-gray-300";
  
  return (
    <div
      className={`${colorClass} border-2 rounded-full w-20 h-20 flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-md hover:shadow-lg`}
      onClick={data.onClick}
    >
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      <div className="text-center">
        <p className="text-xs font-semibold">{data.integration.name}</p>
      </div>
    </div>
  );
};

const nodeTypes = {
  bot: BotNode,
  integration: IntegrationNode,
};

// Available integrations
const AVAILABLE_INTEGRATIONS = [
  { type: "webhook", name: "Webhook" },
  { type: "slack", name: "Slack" },
  { type: "teams", name: "Teams" },
  { type: "discord", name: "Discord" },
  { type: "zapier", name: "Zapier" },
  { type: "email", name: "Email" },
  { type: "sms", name: "SMS" },
  { type: "calendar", name: "Calendar" },
  { type: "crm", name: "CRM" },
  { type: "analytics", name: "Analytics" },
  { type: "database", name: "Database" },
  { type: "api", name: "Custom API" },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bots, setBots] = useState<Bot[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [showIntegrationMenu, setShowIntegrationMenu] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [integrationSettings, setIntegrationSettings] = useState<any>({});

  // Fetch bots and integrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const botsUrl = email
          ? `/api/bots/stats?email=${encodeURIComponent(email)}`
          : `/api/bots/stats?email=all`;

        // Fetch bots (fallback to admin mode when no email present)
        const botsRes = await fetch(botsUrl);
        if (!botsRes.ok) throw new Error("Failed to fetch bots");
        const botsData = await botsRes.json();
        setBots(botsData.bots || []);

        // Fetch integrations
        if (email) {
          const intRes = await fetch(`/api/integrations?email=${encodeURIComponent(email)}`);
          if (intRes.ok) {
            const intData = await intRes.json();
            setIntegrations(intData.integrations || []);
          }
        } else {
          // No email -> show no integrations (still allow viewing bots)
          setIntegrations([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Create nodes and edges from bots and integrations
  useEffect(() => {
    const botNodes: Node[] = bots.map((bot, index) => ({
      id: `bot-${bot.id}`,
      type: "bot",
      position: { 
        x: 200 + (index % 3) * 300, 
        y: 200 + Math.floor(index / 3) * 300 
      },
      data: { 
        bot, 
        onChat: () => {
          // Navigate to bot detail page
          router.push(`/bots/${bot.id}`);
        },
        onDelete: async () => {
          try {
            const res = await fetch('/api/bots/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ botId: bot.id })
            });
            if (res.ok) {
              setBots(prev => prev.filter(b => b.id !== bot.id));
              setNodes(prev => prev.filter(node => !node.id.startsWith(`bot-${bot.id}`)));
              setEdges(prev => prev.filter(edge => !edge.source.startsWith(`bot-${bot.id}`) && !edge.target.startsWith(`bot-${bot.id}`)));
              alert('Bot deleted successfully');
            }
          } catch (error) {
            console.error('Failed to delete bot:', error);
            alert('Failed to delete bot');
          }
        },
        onEdit: () => {
          // Implement edit bot logic
          console.log("Edit bot:", bot.id);
          router.push(`/bot/${bot.id}`);
        },
        stats: bot.spec?.stats || {} // Assuming bot.spec contains stats
      },
    }));

    const integrationNodes: Node[] = integrations.map((integration, index) => ({
      id: `integration-${integration.id}`,
      type: "integration",
      position: { 
        x: 100 + (index % 4) * 250, 
        y: 100 + Math.floor(index / 4) * 200 
      },
      data: { 
        integration,
        onClick: () => {
          setSelectedIntegration(integration);
          setIntegrationSettings(integration.settings || {});
          setShowIntegrationModal(true);
        }
      },
    }));

    setNodes([...botNodes, ...integrationNodes]);

    // Create edges for connected integrations
    const newEdges: Edge[] = integrations.flatMap(integration =>
      integration.connectedBots.map(botId => ({
        id: `edge-${integration.id}-${botId}`,
        source: `integration-${integration.id}`,
        target: `bot-${botId}`,
        animated: true,
        style: { stroke: "#000", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
      }))
    );

    setEdges(newEdges);
  }, [bots, integrations, router]);

  // Center on specific bot if focus query param is present
  useEffect(() => {
    const focusId = searchParams?.get('focus');
    if (!focusId || !rfInstance) return;
    // Wait a tick to ensure nodes are mounted
    const t = setTimeout(() => {
      try {
        rfInstance.fitView({ nodes: [{ id: `bot-${focusId}` }], padding: 0.3, includeHiddenNodes: true });
      } catch {}
    }, 50);
    return () => clearTimeout(t);
  }, [searchParams, rfInstance, nodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: "#000", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#000" },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Update integration connections
      if (params.source?.startsWith("integration-") && params.target?.startsWith("bot-")) {
        const integrationId = params.source.replace("integration-", "");
        const botId = params.target.replace("bot-", "");
        
        setIntegrations(prev =>
          prev.map(int =>
            int.id === integrationId
              ? { ...int, connectedBots: [...int.connectedBots, botId] }
              : int
          )
        );
      }
    },
    []
  );

  const addNewIntegration = async (type: string, name: string, position?: { x: number; y: number }) => {
    try {
      // Try to get email from localStorage or from first bot's userId
      let email = localStorage.getItem("userEmail");
      
      if (!email && bots.length > 0) {
        // Try to fetch user email from first bot
        try {
          const botRes = await fetch(`/api/bots/stats?botId=${bots[0].id}`);
          if (botRes.ok) {
            const botData = await botRes.json();
            // Use a default email if we can't get one from the bot
            email = "demo@optero.com";
          }
        } catch {}
      }
      
      if (!email) {
        email = "demo@optero.com"; // Fallback email
      }

      // Create integration via API
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type, name, settings: {} }),
      });

      if (res.ok) {
        const { integration } = await res.json();
        
        // Add new integration node to canvas
        const newIntegrationNode: Node = {
          id: `integration-${integration.id}`,
          type: "integration",
          position: position || { 
            x: 300 + Math.random() * 200, 
            y: 100 + Math.random() * 200 
          },
          data: { 
            integration: { ...integration, connectedBots: [] },
            onClick: () => {
              setSelectedIntegration({ ...integration, connectedBots: [] });
              setIntegrationSettings(integration.settings || {});
              setShowIntegrationModal(true);
            }
          },
        };
        
        setNodes((nds) => [...nds, newIntegrationNode]);
        setIntegrations([...integrations, { ...integration, connectedBots: [] }]);
        
        // Open config modal immediately
        setSelectedIntegration({ ...integration, connectedBots: [] });
        setShowIntegrationModal(true);
      }
    } catch (error) {
      console.error("Error creating integration:", error);
      alert("Failed to create integration");
    }
    setShowIntegrationMenu(false);
  };

  // DnD from integration menu → canvas
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, int: { type: string; name: string }) => {
    try {
      e.dataTransfer!.setData('application/xy-integration', JSON.stringify(int));
      e.dataTransfer!.effectAllowed = 'move';
      // Add visual feedback
      e.currentTarget.style.opacity = '0.5';
    } catch (err) {
      console.error('Drag start error:', err);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const onDragOverCanvas = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
      // Visual feedback on canvas
      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
    }
  };

  const onDragLeaveCanvas = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      e.currentTarget.style.backgroundColor = '';
    }
  };

  const onDropCanvas = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.backgroundColor = '';
    
    try {
      const payload = e.dataTransfer?.getData('application/xy-integration');
      if (!payload) return;
      const int = JSON.parse(payload) as { type: string; name: string };
      const pos = rfInstance?.screenToFlowPosition
        ? rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        : { x: 200, y: 200 };
      await addNewIntegration(int.type, int.name, pos);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const saveIntegrationSettings = async () => {
    if (!selectedIntegration) return;
    
    try {
      // Get connected bot IDs from edges
      const connectedBotIds = edges
        .filter(edge => edge.source === `integration-${selectedIntegration.id}`)
        .map(edge => edge.target.replace('bot-', ''));
      
      const res = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          settings: integrationSettings,
          connectedBots: connectedBotIds
        })
      });
      
      if (res.ok) {
        // Update local state
        setIntegrations(prev => 
          prev.map(int => 
            int.id === selectedIntegration.id 
              ? { ...int, settings: integrationSettings, connectedBots: connectedBotIds }
              : int
          )
        );
        alert('Integration saved!');
        setShowIntegrationModal(false);
        setIntegrationSettings({});
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Failed to save integration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 relative">
        {/* Dashboard Stats Panel */}
        <div className="absolute top-4 left-4 z-10 bg-white border-2 border-black rounded-lg p-4 shadow-md">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{bots.length}</p>
              <p className="text-xs text-gray-600">Bots</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-2xl font-bold text-black">{integrations.length}</p>
              <p className="text-xs text-gray-600">Integrations</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-2xl font-bold text-blue-600">{bots.reduce((sum, b) => sum + (b.spec?.stats?.totalChats || 0), 0)}</p>
              <p className="text-xs text-gray-600">Total Chats</p>
            </div>
          </div>
        </div>
        
        {/* Top right controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowIntegrationMenu(!showIntegrationMenu)}
            className="bg-white border-2 border-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl font-bold">+</span>
          </button>
          
          <button
            onClick={() => router.push("/bot")}
            className="bg-white border-2 border-black rounded-full px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            NEW BOT
          </button>
            </div>

        {/* Integration menu */}
        <AnimatePresence>
          {showIntegrationMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-20 right-4 z-30 bg-white border-2 border-black rounded-lg p-4 shadow-lg pointer-events-auto max-w-xs"
            >
              <h3 className="font-bold mb-2">Add Integration</h3>
              <p className="text-xs text-gray-500 mb-4">Drag to canvas or click to add</p>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {AVAILABLE_INTEGRATIONS.map((int) => {
                  const colorClass = integrationColors[int.type] || "bg-gray-100 border-gray-300";
                  return (
                    <button
                      key={int.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, int)}
                      onDragEnd={handleDragEnd}
                      onClick={() => addNewIntegration(int.type, int.name)}
                      className={`${colorClass} text-left p-3 rounded-lg border-2 hover:scale-105 transition-all cursor-move hover:shadow-md`}
                      title={`Click to add or drag to canvas: ${int.name}`}
                    >
                      <span className="font-semibold text-sm">{int.name}</span>
                    </button>
                  );
                })}
          </div>
        </motion.div>
          )}
        </AnimatePresence>

        {/* React Flow Canvas */}
        <div className="w-full h-full" style={{ height: "calc(100vh - 200px)" }} onDragOver={onDragOverCanvas} onDragLeave={onDragLeaveCanvas} onDrop={onDropCanvas}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-100"
            onInit={(instance) => setRfInstance(instance)}
          >
            <Background color="#e5e5e5" gap={20} />
            <Controls className="bg-white border-2 border-black" />
          </ReactFlow>
          </div>

        {/* Empty state */}
        {bots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No bots yet</h2>
              <p className="text-gray-600 mb-6">Create your first bot to get started</p>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Integration Settings Modal */}
      <AnimatePresence>
        {showIntegrationModal && selectedIntegration && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowIntegrationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white border-2 border-black rounded-lg p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                Configure {selectedIntegration.name}
                </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Set up the credentials and connect to your bots
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowIntegrationModal(false);
                    setIntegrationSettings({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {selectedIntegration.type === "webhook" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all"
                        placeholder="https://your-webhook-url.com"
                        value={integrationSettings.webhookUrl || ''}
                        onChange={(e) => setIntegrationSettings({...integrationSettings, webhookUrl: e.target.value})}
                      />
              </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Events to trigger
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          New message received
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Bot responded
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Session started
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {selectedIntegration.type === "slack" && (
                  <>
                      <div>
                      <label className="block text-sm font-medium mb-2">
                        Slack Workspace
                      </label>
                      <button className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors font-medium">
                        Connect to Slack
                      </button>
                      </div>
                      <div>
                      <label className="block text-sm font-medium mb-2">
                        Channel
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all"
                        placeholder="#general"
                      />
                        </div>
                  </>
                )}
                
                {selectedIntegration.type === "teams" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Teams Webhook URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all"
                        placeholder="https://outlook.office.com/webhook/..."
                      />
                        </div>
                  </>
                )}
                
                {selectedIntegration.type === "email" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all"
                        placeholder="notifications@company.com"
                      />
                      </div>
                      <div>
                      <label className="block text-sm font-medium mb-2">
                        Email on
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          New leads
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Daily summary
                        </label>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedIntegration.type === "zapier" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Zapier Webhook URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all"
                        placeholder="https://hooks.zapier.com/..."
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Create a Zapier trigger with "Webhooks by Zapier"
                    </p>
                  </>
                )}
                
                {selectedIntegration.type === "crm" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        CRM System
                      </label>
                      <select className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all">
                        <option value="">Select CRM</option>
                        <option value="hubspot">HubSpot</option>
                        <option value="salesforce">Salesforce</option>
                        <option value="pipedrive">Pipedrive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all"
                        placeholder="Your API key"
                      />
            </div>
                  </>
                )}
                
                {selectedIntegration.type === "api" && (
                  <>
              <div>
                      <label className="block text-sm font-medium mb-2">
                        API Endpoint
                      </label>
                <input
                        type="url"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all"
                        placeholder="https://api.example.com/endpoint"
                />
              </div>
              <div>
                      <label className="block text-sm font-medium mb-2">
                        Headers (JSON)
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all font-mono text-sm"
                        rows={3}
                        placeholder='{"Authorization": "Bearer YOUR_TOKEN"}'
                />
              </div>
                  </>
                )}
                
                <div className="pt-4 flex gap-2 border-t border-gray-200 mt-6">
                  <button
                    onClick={saveIntegrationSettings}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
                  >
                    Save Configuration
                  </button>
                  <button
                    onClick={() => {
                      setShowIntegrationModal(false);
                      setIntegrationSettings({});
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}