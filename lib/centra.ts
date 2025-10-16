import prisma from '@/lib/prisma';
import { decryptSecret } from '@/lib/integrations';

export type CentraConfig = {
  apiBaseUrl: string;
  storeId?: string | null;
  accessToken: string;
};

export async function getCentraConfigForBot(botId: string): Promise<CentraConfig | null> {
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    include: { integration: true }
  });

  if (!bot) return null;
  const spec = (bot.spec as any) || {};
  const apiBaseUrl: string | undefined = spec.centraApiBaseUrl;
  const storeId: string | undefined = spec.centraStoreId;
  const enc = bot.integration?.centraAccessTokenEnc || (spec.centraAccessTokenEnc as string | undefined);
  const accessToken = decryptSecret(enc) || '';

  if (!apiBaseUrl || !accessToken) return null;
  return { apiBaseUrl, storeId: storeId || null, accessToken };
}

export type CentraClientOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  defaultHeaders?: Record<string, string>;
};

export function createCentraClient(config: CentraConfig, options: CentraClientOptions = {}) {
  const timeoutMs = options.timeoutMs ?? 15000;
  const maxRetries = options.maxRetries ?? 2;

  async function request<T>(path: string, init: RequestInit & { retryCount?: number } = {}): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const retryCount = init.retryCount ?? 0;

    try {
      const url = path.startsWith('http') ? path : `${config.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`,
        ...(options.defaultHeaders || {}),
        ...(init.headers as Record<string, string> | undefined || {})
      };

      const res = await fetch(url, { ...init, headers, signal: controller.signal });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (res.status >= 500 && retryCount < maxRetries) {
          return request<T>(path, { ...init, retryCount: retryCount + 1 });
        }
        throw new Error(`Centra request failed ${res.status}: ${text}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) return await res.json();
      // @ts-expect-error allow text fallback
      return await res.text();
    } finally {
      clearTimeout(id);
    }
  }

  return {
    get<T>(path: string): Promise<T> {
      return request<T>(path, { method: 'GET' });
    },
    post<T>(path: string, body?: unknown): Promise<T> {
      return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
    },
    graphql<T = any>(query: string, variables?: Record<string, unknown>, graphqlPath: string = 'graphql'): Promise<T> {
      return request<T>(graphqlPath, { method: 'POST', body: JSON.stringify({ query, variables }) });
    }
  };
}

export type CentraProduct = {
  id: string;
  sku?: string;
  name?: string;
  [key: string]: any;
};

export type CentraOrder = {
  id: string;
  number?: string;
  status?: string;
  [key: string]: any;
};

export function withStore(path: string, storeId?: string | null): string {
  if (!storeId) return path;
  const url = new URL(path, 'http://x');
  url.searchParams.set('storeId', storeId);
  return `${url.pathname}${url.search}`.replace(/^\//, '');
}

export async function listCentraProducts(botId: string): Promise<CentraProduct[] | null> {
  const cfg = await getCentraConfigForBot(botId);
  if (!cfg) return null;
  const client = createCentraClient(cfg);
  // Endpoint path may vary by Centra setup; adjust to your plugin path
  const path = withStore('products', cfg.storeId);
  return client.get<CentraProduct[]>(path);
}

export async function listCentraOrders(botId: string): Promise<CentraOrder[] | null> {
  const cfg = await getCentraConfigForBot(botId);
  if (!cfg) return null;
  const client = createCentraClient(cfg);
  const path = withStore('orders', cfg.storeId);
  return client.get<CentraOrder[]>(path);
}

export async function getCentraProduct(botId: string, productId: string): Promise<CentraProduct | null> {
  const cfg = await getCentraConfigForBot(botId);
  if (!cfg) return null;
  const client = createCentraClient(cfg);
  const path = withStore(`products/${encodeURIComponent(productId)}`, cfg.storeId);
  return client.get<CentraProduct>(path);
}

// Write helpers
export async function updateCentraOrderStatus(botId: string, orderId: string, status: string) {
  const cfg = await getCentraConfigForBot(botId);
  if (!cfg) return { ok: false, error: 'centra_not_configured' };
  const client = createCentraClient(cfg);
  const path = withStore(`orders/${encodeURIComponent(orderId)}/status`, cfg.storeId);
  return client.post<{ ok: boolean }>(path, { status });
}

export async function adjustCentraInventory(botId: string, productId: string, delta: number) {
  const cfg = await getCentraConfigForBot(botId);
  if (!cfg) return { ok: false, error: 'centra_not_configured' };
  const client = createCentraClient(cfg);
  const path = withStore(`products/${encodeURIComponent(productId)}/inventory`, cfg.storeId);
  return client.post<{ ok: boolean }>(path, { delta });
}

export async function centraSalesReport(botId: string, period: { from: string; to: string }) {
  const cfg = await getCentraConfigForBot(botId);
  if (!cfg) return null;
  const client = createCentraClient(cfg);
  const path = withStore(`reports/sales?from=${encodeURIComponent(period.from)}&to=${encodeURIComponent(period.to)}`, cfg.storeId);
  return client.get<any>(path);
}

