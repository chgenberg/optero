// Utility functions for interacting with agent APIs

export interface AgentType {
  id: string;
  slug: string;
  name: string;
  description: string;
  mascot: string;
  color: string;
  onboardingPrompt: string;
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  systemPromptTemplate: string;
  exampleTasks?: string[];
}

export interface AgentCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  contextQuestions: string[];
  children?: AgentCategory[];
  useCases?: UseCase[];
}

export interface AgentProfile {
  id: string;
  botId: string;
  agentTypeId: string;
  selectedCategoryPath: string[];
  selectedUseCases?: string[];
  onboardingResponses: Record<string, string>;
  generatedContext?: Record<string, any>;
  systemPrompt: string;
  onboardingCompleted: boolean;
  onboardingVersion: number;
  agentType?: AgentType;
}

// Fetch all agent types
export async function fetchAgentTypes(): Promise<AgentType[]> {
  const res = await fetch("/api/agents/types");
  if (!res.ok) {
    throw new Error("Failed to fetch agent types");
  }
  return res.json();
}

// Fetch categories for a specific agent type
export async function fetchAgentCategories(
  agentTypeSlug: string
): Promise<{ agentType: any; categories: AgentCategory[] }> {
  const res = await fetch(
    `/api/agents/categories?agentType=${agentTypeSlug}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

// Fetch use cases for a specific category
export async function fetchUseCases(categoryId: string): Promise<UseCase[]> {
  const res = await fetch(`/api/agents/use-cases?categoryId=${categoryId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch use cases");
  }
  const data = await res.json();
  return data.useCases;
}

// Create or update agent profile
export async function createAgentProfile(
  profileData: Partial<AgentProfile>
): Promise<AgentProfile> {
  const res = await fetch("/api/agents/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    throw new Error("Failed to create agent profile");
  }

  return res.json();
}

// Fetch existing agent profile
export async function fetchAgentProfile(botId: string): Promise<AgentProfile> {
  const res = await fetch(`/api/agents/profile?botId=${botId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch agent profile");
  }
  return res.json();
}

// Generate system prompt using AI
export async function generateSystemPrompt(data: {
  agentTypeId: string;
  selectedCategoryPath: string[];
  selectedUseCases?: string[];
  onboardingResponses: Record<string, string>;
  companyData?: Record<string, any>;
}): Promise<{ systemPrompt: string; agentType: string }> {
  const res = await fetch("/api/agents/generate-system-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to generate system prompt");
  }

  return res.json();
}

// Helper: Build category path from hierarchy
export function getCategoryPath(
  categories: AgentCategory[],
  targetSlug: string,
  currentPath: string[] = []
): string[] | null {
  for (const category of categories) {
    const newPath = [...currentPath, category.slug];

    if (category.slug === targetSlug) {
      return newPath;
    }

    if (category.children && category.children.length > 0) {
      const foundPath = getCategoryPath(
        category.children,
        targetSlug,
        newPath
      );
      if (foundPath) {
        return foundPath;
      }
    }
  }

  return null;
}

// Helper: Find category by slug in tree
export function findCategoryBySlug(
  categories: AgentCategory[],
  slug: string
): AgentCategory | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    if (category.children && category.children.length > 0) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

// Session management
export async function saveChatSession(data: {
  botId: string;
  sessionId: string;
  messages: any[];
  title?: string;
}): Promise<any> {
  const res = await fetch("/api/agents/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to save session");
  }

  return res.json();
}

// Fetch all sessions for a bot
export async function fetchBotSessions(botId: string): Promise<any[]> {
  const res = await fetch(`/api/agents/sessions?botId=${botId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }

  const data = await res.json();
  return data.sessions;
}

// Fetch specific session
export async function fetchChatSession(
  botId: string,
  sessionId: string
): Promise<any> {
  const res = await fetch(
    `/api/agents/sessions?botId=${botId}&sessionId=${sessionId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }

  return res.json();
}

// Delete session
export async function deleteChatSession(sessionId: string): Promise<void> {
  const res = await fetch(`/api/agents/sessions?sessionId=${sessionId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete session");
  }
}

// Search through chat history
export async function searchChatHistory(
  botId: string,
  query: string,
  limit: number = 20
): Promise<any[]> {
  const res = await fetch(
    `/api/agents/sessions/search?botId=${botId}&q=${encodeURIComponent(query)}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error("Failed to search chat history");
  }

  const data = await res.json();
  return data.results;
}

// Archive session
export async function archiveSession(
  sessionId: string,
  archive: boolean = true
): Promise<void> {
  const res = await fetch("/api/agents/sessions/archive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, archive }),
  });

  if (!res.ok) {
    throw new Error("Failed to archive session");
  }
}

// Fetch archived sessions
export async function fetchArchivedSessions(
  botId: string,
  limit: number = 50
): Promise<any[]> {
  const res = await fetch(
    `/api/agents/sessions/archive?botId=${botId}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch archived sessions");
  }

  const data = await res.json();
  return data.sessions;
}
