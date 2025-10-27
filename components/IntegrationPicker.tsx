"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, GripHorizontal, Plus, Trash2 } from "lucide-react";
import integrations from "@/data/integrations.json";

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  type: string;
}

interface ConnectedIntegration extends IntegrationItem {
  connectedAt: Date;
}

interface IntegrationPickerProps {
  botId: string;
  onAdd?: (integration: IntegrationItem) => void;
  onRemove?: (integrationId: string) => void;
  connectedIntegrations?: ConnectedIntegration[];
  onIntegrationsChange?: () => void;
}

export default function IntegrationPicker({
  botId,
  onAdd,
  onRemove,
  connectedIntegrations = [],
  onIntegrationsChange,
}: IntegrationPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [draggedIntegration, setDraggedIntegration] = useState<IntegrationItem | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(integrations.integrations.map((i) => i.category));
    return Array.from(cats).sort();
  }, []);

  // Filter integrations based on search and category
  const filteredIntegrations = useMemo(() => {
    let filtered = integrations.integrations;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.description.toLowerCase().includes(term) ||
          i.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((i) => i.category === selectedCategory);
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const handleDragStart = (e: React.DragEvent, integration: IntegrationItem) => {
    setDraggedIntegration(integration);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIntegration && onAdd) {
      // Check if already connected
      if (!connectedIds.has(draggedIntegration.id)) {
        // Save to API
        saveIntegration(draggedIntegration);
        onAdd(draggedIntegration);
      }
    }
    setDraggedIntegration(null);
  };

  const saveIntegration = async (integration: IntegrationItem) => {
    try {
      const res = await fetch("/api/bots/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          integrationId: integration.id,
          name: integration.name,
        }),
      });

      if (res.ok) {
        onIntegrationsChange?.();
      } else {
        console.error("Failed to save integration");
      }
    } catch (error) {
      console.error("Error saving integration:", error);
    }
  };

  const removeIntegration = async (connectionId: string) => {
    try {
      const res = await fetch(
        `/api/bots/integrations?connectionId=${connectionId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        onRemove?.(connectionId);
        onIntegrationsChange?.();
      }
    } catch (error) {
      console.error("Error removing integration:", error);
    }
  };

  const connectedIds = new Set(connectedIntegrations.map((c) => c.id));

  return (
    <div className="w-full">
      {/* Connected Integrations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Anslutna integrationer</h3>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 rounded-lg border-2 border-dashed transition-colors ${
            draggedIntegration
              ? "border-black bg-gray-50"
              : "border-gray-300 bg-white"
          } min-h-[200px]`}
        >
          <AnimatePresence>
            {connectedIntegrations.length === 0 && !draggedIntegration ? (
              <div className="col-span-full flex items-center justify-center text-gray-400">
                <p>Dra och släpp integrationer här</p>
              </div>
            ) : null}

            {connectedIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white border border-gray-200 hover:shadow-lg transition-shadow group"
              >
                <div className="text-4xl">{integration.icon}</div>
                <p className="text-sm font-medium text-center text-gray-900 truncate w-full">
                  {integration.name}
                </p>
                <button
                  onClick={() => removeIntegration(integration.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Integration Picker Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        {showPicker ? "Göm integrationer" : "Lägg till integration"}
      </button>

      {/* Integration Picker Panel */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök integrationer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="px-4 py-3 border-b border-gray-200 overflow-x-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === null
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Integrations List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {filteredIntegrations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Inga integrationer hittades</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredIntegrations.map((integration) => (
                    <motion.div
                      key={integration.id}
                      draggable={!connectedIds.has(integration.id)}
                      onDragStart={(e) => handleDragStart(e, integration)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-move ${
                        connectedIds.has(integration.id)
                          ? "opacity-50 cursor-not-allowed border-gray-300 bg-gray-50"
                          : "border-gray-200 bg-white hover:border-black hover:shadow-md"
                      }`}
                    >
                      <div className="text-3xl">{integration.icon}</div>
                      <p className="text-xs font-medium text-center text-gray-900 truncate w-full">
                        {integration.name}
                      </p>
                      {connectedIds.has(integration.id) && (
                        <div className="text-xs text-gray-500">Redan kopplad</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              💡 Dra en integration till rutan ovan för att lägga till den
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
