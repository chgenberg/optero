// Minimal fetch with retry/backoff and naive in-memory rate limiting per host

type FetchOptions = RequestInit & { retries?: number; baseDelayMs?: number };

const rateBucket: Map<string, { ts: number[]; limit: number }> = new Map();

function allow(host: string, limitPerMinute = 60) {
  const now = Date.now();
  const windowMs = 60_000;
  const rec = rateBucket.get(host) || { ts: [], limit: limitPerMinute };
  rec.ts = rec.ts.filter((t) => now - t < windowMs);
  if (rec.ts.length >= rec.limit) return false;
  rec.ts.push(now);
  rateBucket.set(host, rec);
  return true;
}

export async function fetchWithRetry(url: string, opts: FetchOptions = {}) {
  const { retries = 2, baseDelayMs = 400, ...init } = opts;
  const host = (() => {
    try { return new URL(url).host; } catch { return 'default'; }
  })();

  let attempt = 0;
  // simple token bucket per host
  if (!allow(host, 120)) throw new Error(`rate_limited: ${host}`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url, init);
      if (!res.ok && res.status >= 500 && attempt < retries) {
        throw new Error(`server_error_${res.status}`);
      }
      return res;
    } catch (e) {
      if (attempt >= retries) throw e;
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
}


