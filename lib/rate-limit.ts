// Simple rate limiting using in-memory store
// For production, use Redis or Upstash

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Preset rate limit configs
export const rateLimitConfigs = {
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please try again later.'
  },
  login: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Too many login attempts. Please try again in 5 minutes.'
  },
  chat: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Chat rate limit exceeded. Please slow down.'
  },
  export: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many export requests. Please try again later.'
  }
};

// Helper to get client identifier
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

// Middleware wrapper for Next.js API routes
export async function withRateLimit(
  request: Request,
  config: RateLimitConfig,
  identifier?: string
): Promise<Response | null> {
  const clientId = identifier || getClientIdentifier(request);
  const result = await rateLimit(clientId, config);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({ 
        error: config.message || 'Rate limit exceeded',
        resetTime: result.resetTime 
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  return null;
}
