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

interface Bot {
  id: string;
  name: string;
  companyUrl?: string;
  spec?: any;
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
const BotNode = ({ data }: { data: { bot: Bot; onChat: () => void } }) => {
  return (
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
          {data.bot.companyUrl?.replace(/https?:\/\//, "") || "Ingen URL"}
        </p>
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
  { type: "email", name: "E-post" },
  { type: "sms", name: "SMS" },
  { type: "calendar", name: "Kalender" },
  { type: "crm", name: "CRM" },
  { type: "analytics", name: "Analys" },
  { type: "database", name: "Databas" },
  { type: "api", name: "Anpassat API" },
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

  // Fetch bots and integrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const botsUrl = email
          ? `/api/bots/stats?email=${encodeURIComponent(email)}`
          : `/api/bots/stats?email=all`;

        // Hämta bottar (fallback till admin-läge om ingen e‑post finns)
        const botsRes = await fetch(botsUrl);
        if (!botsRes.ok) throw new Error("Failed to fetch bots");
        const botsData = await botsRes.json();
        setBots(botsData.bots || []);

        // Hämta integrationer endast när e‑post finns
        if (email) {
          const intRes = await fetch(`/api/integrations?email=${encodeURIComponent(email)}`);
          if (intRes.ok) {
            const intData = await intRes.json();
            setIntegrations(intData.integrations || []);
          }
    } else {
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
          // Temporärt: öppna publik chatt utan inloggning
          router.push(`/bots/chat?botId=${bot.id}`);
        }
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
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type, name, settings: {} }),
      });

      if (res.ok) {
        const { integration } = await res.json();
        const newNode: Node = {
          id: `integration-${integration.id}`,
          type: "integration",
          position: position || { x: 300 + Math.random() * 200, y: 100 + Math.random() * 200 },
          data: {
            integration: { ...integration, connectedBots: [] },
            onClick: () => {
              setSelectedIntegration({ ...integration, connectedBots: [] });
              setShowIntegrationModal(true);
            }
          }
        };
        setNodes((nds) => [...nds, newNode]);
        setIntegrations([...integrations, { ...integration, connectedBots: [] }]);
      }
    } catch (error) {
      console.error("Error creating integration:", error);
    }
    setShowIntegrationMenu(false);
  };

  // DnD från integrationsmeny → canvas
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, int: { type: string; name: string }) => {
    try { e.dataTransfer.setData('application/xy-integration', JSON.stringify(int)); e.dataTransfer.effectAllowed = 'move'; } catch {}
  };
  const onDragOverCanvas = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; };
  const onDropCanvas = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const payload = e.dataTransfer.getData('application/xy-integration');
      if (!payload) return;
      const int = JSON.parse(payload) as { type: string; name: string };
      const pos = rfInstance?.screenToFlowPosition ? rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY }) : { x: 200, y: 200 };
      await addNewIntegration(int.type, int.name, pos);
    } catch {}
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
            onClick={() => router.push("/sv/dashboard/qa")}
            className="bg-white border-2 border-black rounded-full px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            F&S
              </button>
          
          <button
            onClick={() => router.push("/sv/bot")}
            className="bg-white border-2 border-black rounded-full px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            NY BOT
          </button>
                    </div>

        {/* Integration menu */}
        <AnimatePresence>
          {showIntegrationMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-20 right-4 z-30 bg-white border-2 border-black rounded-lg p-4 shadow-lg pointer-events-auto"
            >
              <h3 className="font-bold mb-3">Lägg till integration</h3>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {AVAILABLE_INTEGRATIONS.map((int) => {
                  const colorClass = integrationColors[int.type] || "bg-gray-100 border-gray-300";
                  return (
                    <button
                      key={int.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, int)}
                      onClick={() => addNewIntegration(int.type, int.name)}
                      className={`${colorClass} text-left p-3 rounded-lg border-2 hover:scale-105 transition-all cursor-pointer`}
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
        <div className="w-full h-full" style={{ height: "calc(100vh - 200px)" }} onDragOver={onDragOverCanvas} onDrop={onDropCanvas}>
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
              <h2 className="text-2xl font-bold mb-4">Inga botar än</h2>
              <p className="text-gray-600 mb-6">Skapa din första bot för att komma igång</p>
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
                Konfigurera {selectedIntegration.name}
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
                        placeholder="https://din-webhook-url.com"
                />
              </div>
              <div>
                      <label className="block text-sm font-medium mb-1">
                        Händelser att trigga
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Nytt meddelande mottaget
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Bot svarat
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Session startad
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
                        Anslut till Slack
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Kanal
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
                    Spara
                  </button>
                  <button
                    onClick={() => setShowIntegrationModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-black rounded hover:bg-gray-100"
                  >
                    Avbryt
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