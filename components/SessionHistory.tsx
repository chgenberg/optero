"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, MessageCircle, Loader2, Search, Archive, Inbox } from "lucide-react";
import { fetchBotSessions, deleteChatSession, searchChatHistory, archiveSession, fetchArchivedSessions } from "@/lib/agents-client";

interface Session {
  id: string;
  metadata?: {
    title?: string;
  };
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SessionHistoryProps {
  botId: string;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export default function SessionHistory({
  botId,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: SessionHistoryProps) {
  const [tab, setTab] = useState<"recent" | "search" | "archive">("recent");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [archivedSessions, setArchivedSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "recent") {
      loadSessions();
    } else if (tab === "archive") {
      loadArchivedSessions();
    }
  }, [botId, tab]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const fetchedSessions = await fetchBotSessions(botId);
      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadArchivedSessions = async () => {
    try {
      setLoading(true);
      const fetchedSessions = await fetchArchivedSessions(botId);
      setArchivedSessions(fetchedSessions);
    } catch (error) {
      console.error("Failed to load archived sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchChatHistory(botId, query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      setDeleting(sessionId);
      await deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleArchive = async (sessionId: string, isArchive: boolean) => {
    try {
      setArchiving(sessionId);
      await archiveSession(sessionId, isArchive);
      if (isArchive) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        loadArchivedSessions();
      } else {
        setArchivedSessions((prev) => prev.filter((s) => s.id !== sessionId));
        loadSessions();
      }
    } catch (error) {
      console.error("Failed to archive session:", error);
    } finally {
      setArchiving(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Igår";
    } else {
      return date.toLocaleDateString("sv-SE");
    }
  };

  return (
    <div className="space-y-2">
      <motion.button
        onClick={onNewSession}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-900 flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ny chatt
      </motion.button>

      {/* Tabs */}
      <div className="flex gap-2 mt-4 border-b border-gray-200">
        <button
          onClick={() => setTab("recent")}
          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
            tab === "recent"
              ? "border-black text-black"
              : "border-transparent text-gray-600 hover:text-black"
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Tidigare
        </button>
        <button
          onClick={() => setTab("search")}
          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
            tab === "search"
              ? "border-black text-black"
              : "border-transparent text-gray-600 hover:text-black"
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Sök
        </button>
        <button
          onClick={() => setTab("archive")}
          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
            tab === "archive"
              ? "border-black text-black"
              : "border-transparent text-gray-600 hover:text-black"
          }`}
        >
          <Archive className="w-4 h-4 inline mr-2" />
          Arkiv
        </button>
      </div>

      {/* Recent Sessions */}
      {tab === "recent" && (
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 py-4 text-center">
              Inga tidigare chattar
            </p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group"
                  >
                    <button
                      onClick={() => onSessionSelect(session.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between gap-2 ${
                        currentSessionId === session.id
                          ? "bg-gray-200 text-gray-900"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageCircle className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {session.metadata?.title || `Chat`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(session.updatedAt)} • {session.messageCount} meddelanden
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(session.id, true);
                        }}
                        disabled={archiving === session.id}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-yellow-100 rounded transition-all"
                      >
                        <Archive className="w-4 h-4 text-yellow-600" />
                      </button>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      {tab === "search" && (
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök i chatthistorik..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          {searching && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}

          {!searching && searchResults.length === 0 && searchQuery && (
            <p className="text-xs text-gray-500 text-center py-4">
              Inga resultat hittades
            </p>
          )}

          <div className="space-y-1 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {searchResults.map((result, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onSessionSelect(result.sessionId)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {result.preview}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {result.matchCount} matcher • {formatDate(result.updatedAt)}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Archive */}
      {tab === "archive" && (
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : archivedSessions.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 py-4 text-center">
              Inga arkiverade chattar
            </p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {archivedSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Inbox className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.metadata?.title || `Chat`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(session.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleArchive(session.id, false)}
                      disabled={archiving === session.id}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-100 rounded transition-all"
                      title="Restore"
                    >
                      <Inbox className="w-4 h-4 text-green-600" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
