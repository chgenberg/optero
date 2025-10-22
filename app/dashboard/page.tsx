"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

interface Bot {
  id: string;
  name: string;
  companyUrl?: string;
  integrations?: any[];
}

interface Integration {
  id: string;
  type: string;
  name: string;
  settings?: any;
  connectedBots: string[];
}

// Custom Bot Node Component
const BotNode = ({ data }: { data: { bot: Bot; onEdit: () => void } }) => {
  return (
    <div
      className="relative bg-white border-2 border-black rounded-full w-32 h-32 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
      style={{
        clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
      }}
      onClick={data.onEdit}
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
      </div>
    </div>
  );
};

// Custom Integration Node Component
const IntegrationNode = ({ data }: { data: { integration: Integration; onClick: () => void } }) => {
  return (
    <div
      className="bg-white border-2 border-black rounded-full w-20 h-20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
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

export default function DashboardPage() {
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [showIntegrationMenu, setShowIntegrationMenu] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  // Fetch bots and integrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          router.push("/");
          return;
        }

        // Fetch bots
        const botsRes = await fetch(`/api/bots/stats?email=${encodeURIComponent(email)}`);
        if (!botsRes.ok) throw new Error("Failed to fetch bots");
        const botsData = await botsRes.json();
        setBots(botsData.bots || []);

        // Fetch integrations
        const intRes = await fetch(`/api/integrations?email=${encodeURIComponent(email)}`);
        if (intRes.ok) {
          const intData = await intRes.json();
          setIntegrations(intData.integrations || []);
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
        onEdit: () => router.push(`/dashboard/${bot.id}`)
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

  const addNewIntegration = async (type: string, name: string) => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type, name, settings: {} }),
      });

      if (res.ok) {
        const { integration } = await res.json();
        setIntegrations([...integrations, { ...integration, connectedBots: [] }]);
      }
    } catch (error) {
      console.error("Error creating integration:", error);
    }
    setShowIntegrationMenu(false);
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
        {/* Top right controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowIntegrationMenu(!showIntegrationMenu)}
            className="bg-white border-2 border-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl font-bold">+</span>
          </button>
          
          <button
            onClick={() => router.push("/dashboard/qa")}
            className="bg-white border-2 border-black rounded-full px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            Q&A
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
              className="absolute top-20 right-4 z-20 bg-white border-2 border-black rounded-lg p-4 shadow-lg"
            >
              <h3 className="font-bold mb-3">Add Integration</h3>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {AVAILABLE_INTEGRATIONS.map((int) => (
                  <button
                    key={int.type}
                    onClick={() => addNewIntegration(int.type, int.name)}
                    className="text-left p-2 hover:bg-gray-100 rounded border border-gray-300"
                  >
                    {int.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* React Flow Canvas */}
        <div className="w-full h-full" style={{ height: "calc(100vh - 200px)" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-100"
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowIntegrationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white border-2 border-black rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                Configure {selectedIntegration.name}
              </h2>
              
              <div className="space-y-4">
                {selectedIntegration.type === "webhook" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border-2 border-black rounded"
                        placeholder="https://your-webhook-url.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
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
                      <label className="block text-sm font-medium mb-1">
                        Slack Workspace
                      </label>
                      <button className="w-full px-3 py-2 border-2 border-black rounded bg-gray-100 hover:bg-gray-200">
                        Connect to Slack
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Channel
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border-2 border-black rounded"
                        placeholder="#general"
                      />
                    </div>
                  </>
                )}
                
                {/* Add more integration types as needed */}
                
                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() => setShowIntegrationModal(false)}
                    className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowIntegrationModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-black rounded hover:bg-gray-100"
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