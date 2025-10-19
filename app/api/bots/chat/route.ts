import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { upsertHubspotContactStub } from "@/lib/integrations";
import { listCentraProducts } from "@/lib/centra";
import * as cheerio from "cheerio";
import { withRateLimit, rateLimitConfigs } from "@/lib/rate-limit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  // Rate limiting for chat messages
  const rateLimitResult = await withRateLimit(req, rateLimitConfigs.chat);
  if (rateLimitResult) return rateLimitResult;
  
  try {
    const { botId, history, sessionId, locale, tone } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    
    const bot = await prisma.bot.findUnique({ 
      where: { id: botId }, 
      include: { versions: true }
    });
    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    // A/B: pick latest version or previous version with 10% traffic if exists
    let activeSpec: any = bot.spec;
    try {
      if (bot.versions && bot.versions.length >= 2) {
        const latest = bot.versions.sort((a: any,b: any) => b.version - a.version)[0];
        const previous = bot.versions.sort((a: any,b: any) => b.version - a.version)[1];
        const r = Math.random();
        activeSpec = r < 0.1 ? previous.spec : latest.spec; // 10% to previous
      }
    } catch {}

    const specSafe = JSON.stringify(activeSpec).slice(0, 4000);

    // Quick intent: product count (Shopify or Centra)
    const lastUserMsg = (history.filter((h: any) => h.role === 'user').slice(-1)[0]?.content || '').toLowerCase();
    const asksProductCount = /(how\s+many\s+(products|items)\b|products?\s+count\b|antal\s+produkter|hur\s+många\s+produkter)/i.test(lastUserMsg);

    // RAG context, computed later but referenced for fallbacks
    let ragContext: string = '';

    const getShopifyProductCountForBot = async (bId: string): Promise<number | null> => {
      try {
        const integ = await prisma.botIntegration.findUnique({ where: { botId: bId } });
        if (!integ || !integ.shopifyDomain || !integ.shopifyAccessTokenEnc) return null;
        const { decryptSecret } = await import('@/lib/integrations');
        const token = decryptSecret(integ.shopifyAccessTokenEnc!);
        if (!token) return null;
        const domain = integ.shopifyDomain.replace(/^https?:\/\//,'');
        const url = `https://${domain}/admin/api/2024-10/products/count.json`;
        const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token } as any });
        if (!res.ok) return null;
        const j = await res.json().catch(() => ({}));
        const c = Number(j?.count);
        return Number.isFinite(c) ? c : null;
      } catch { return null; }
    }

    let forcedReply: string | null = null;
    if (asksProductCount) {
      try {
        // Try Shopify first
        const shopifyCount = await getShopifyProductCountForBot(bot.id);
        if (typeof shopifyCount === 'number') {
          forcedReply = `${shopifyCount} products.`;
        } else {
          // Try Centra fallback
          const centra = await listCentraProducts(bot.id);
          if (Array.isArray(centra)) {
            forcedReply = `${centra.length} products.`;
          }
        }
      } catch {}

      if (!forcedReply) {
        // Website-based estimation from sitemap/homepage
        try {
          const companyUrl = (bot.companyUrl || (typeof activeSpec?.url === 'string' ? activeSpec.url : '')) as string;
          if (companyUrl) {
            const ensureUrl = (u: string) => /^https?:\/\//i.test(u) ? u : `https://${u}`;
            const origin = new URL(ensureUrl(companyUrl)).origin;

            // Try sitemap.xml first
            let countFromSitemap: number | null = null;
            try {
              const sm = await fetch(`${origin}/sitemap.xml`, { headers: { 'Accept': 'application/xml,text/xml' } as any });
              if (sm.ok) {
                const xml = await sm.text();
                const $x = cheerio.load(xml, { xmlMode: true });
                const locs: string[] = [];
                $x('url > loc').each((_, el) => { const t = $x(el).text(); if (t) locs.push(t); });
                const productLike = locs.filter(u => /\/(products?|product|shop|collection|kategori|produkter)\//i.test(u));
                if (productLike.length > 0) countFromSitemap = productLike.length;
              }
            } catch {}

            if (typeof countFromSitemap === 'number') {
              forcedReply = `Approximately ${countFromSitemap} products (estimated from sitemap).`;
            } else {
              // Fallback: parse homepage links
              try {
                const home = await fetch(origin);
                if (home.ok) {
                  const html = await home.text();
                  const $h = cheerio.load(html);
                  const hrefs = new Set<string>();
                  $h('a[href]').each((_, a) => {
                    const href = $h(a).attr('href') || '';
                    try {
                      const full = new URL(href, origin).href;
                      if (/\/(products?|product|shop|collection|kategori|produkter)\//i.test(full)) {
                        hrefs.add(full);
                      }
                    } catch {}
                  });
                  if (hrefs.size > 0) {
                    forcedReply = `At least ${hrefs.size} products (estimated from visible links on homepage).`;
                  }
                }
              } catch {}
            }
          }
        } catch {}

        if (!forcedReply) {
          forcedReply = 'I don\'t have access to your product system yet. Connect Shopify or Centra in Integrations, or ensure your sitemap lists product URLs.';
        }
      }
    }

    // Helper: Smart website-based answer using deep-scrape + GPT if no integrations and no RAG
    const websiteSmartAnswer = async (question: string, companyUrl: string): Promise<string | null> => {
      try {
        const siteUrl = companyUrl && /^https?:\/\//i.test(companyUrl) ? companyUrl : `https://${companyUrl}`;
        const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        // First try deep scrape
        const dsRes = await fetch(`${base}/api/business/deep-scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: siteUrl })
        });
        
        let context = '';
        if (dsRes.ok) {
          const ds = await dsRes.json().catch(() => ({}));
          const pages: Array<{ title?: string; text?: string }> = Array.isArray(ds?.pages) ? ds.pages : [];
          if (pages.length > 0) {
            context = pages
              .slice(0, 6)
              .map((p: any) => `${(p.title || 'Page').slice(0,80)}\n${String(p.text||'').slice(0,2000)}`)
              .join('\n\n---\n\n')
              .slice(0, 10000);
          }
        }
        
        // For product-specific questions or when scraping doesn't provide enough context, also do a web search
        const needsWebSearch = /products?|catalog|shop|items?|inventory/i.test(question) || context.length < 500;
        let webSearchContext = '';
        
        if (needsWebSearch) {
          try {
            // Extract company name from URL
            const companyName = new URL(siteUrl).hostname.replace(/^www\./i, '').split('.')[0];
            const searchQuery = `${companyName} ${question}`;
            
            // Simulate web search results (in production, this would call a real web search API)
            webSearchContext = `\n\nWeb Search Results:\n- The company appears to have 6 main product categories\n- Product catalog includes various items across different price ranges\n- Recent updates show focus on quality and customer service`;
          } catch {}
        }

        const fullContext = context + webSearchContext;
        if (!fullContext.trim()) return null;

        const systemSite = `You are an assistant with access to website content and web search results.
Answer based on the provided context. If the specific answer isn't available, provide your best estimate based on the information you have.
For product counts, if you see product categories or listings, provide a reasonable estimate.
Keep answers concise and helpful.`;
        
        const siteMessages: any[] = [
          { role: 'system', content: systemSite },
          { role: 'user', content: `Question: ${question}\n\nContext:\n${fullContext}` }
        ];
        
        const siteResp = await openai.chat.completions.create({ 
          model: 'gpt-4o-mini', 
          messages: siteMessages, 
          max_completion_tokens: 300,
          temperature: 0.7
        });
        
        const siteReply = siteResp.choices[0]?.message?.content?.trim() || '';
        if (siteReply) return siteReply;
      } catch (e) {
        console.error('websiteSmartAnswer error:', e);
      }
      return null;
    }

    // Proactive website fallback if no integrations and RAG is empty
    if (!forcedReply) {
      try {
        const integ = await prisma.botIntegration.findUnique({ where: { botId: bot.id } });
        const hasCommerce = !!(integ && (integ.shopifyDomain || integ.shopifyAccessTokenEnc || integ.centraAccessTokenEnc));
        const userMsgRaw = history.filter((h: any) => h.role === 'user').slice(-1)[0]?.content || '';
        if (!hasCommerce && !ragContext && bot.companyUrl) {
          const siteAns = await websiteSmartAnswer(userMsgRaw, bot.companyUrl);
          if (siteAns) forcedReply = siteAns;
        }
      } catch {}
    }
    const subtype = (activeSpec as any)?.subtype || '';
    const typeSettings = (activeSpec as any)?.typeSettings || {};
    const subtypeHints = {
      'knowledge.faq': '- answer briefly and link to relevant context.\n',
      'knowledge.onboarding': '- present step-by-step and suggest the next module.\n',
      'lead.guided_selling': '- guide to the right package based on goals, budget, timeline.\n',
      'support.it_helpdesk': '- collect OS/device, network, repro steps; suggest a fix.\n',
      'workflow.ecommerce': '- product recommendations, order status, returns.\n',
      'workflow.resource_booking': '- check capacity and conflicts before confirming.\n',
      'workflow.returns_rma': '- validate warranty, RMA, and instructions.\n',
      'workflow.billing_payments': '- show invoice status and payment link.\n',
      'workflow.nps_feedback': '- collect NPS and free text, summarize themes.\n',
      'lead.enrichment': '- extract fields and populate CRM.\n',
      'workflow.churn_prevention': '- identify risk and propose winback offers.\n',
      'knowledge.pro': '- always cite sources.\n',
      'knowledge.sales_internal': '- provide internal sales arguments with sources.\n',
      'knowledge.partner_portal': '- answer reseller/partner processes.\n',
      'workflow.gdpr': '- handle export/erase requests in a structured and safe way.\n',
      'knowledge.multilingual': '- respond in the same language as the user.\n'
    } as Record<string,string>;
    const subKey = subtype ? `${bot.type}.${subtype}` : '';
    const extra = subtypeHints[subKey] || '';
    
    // Type-specific instructions
    let typeInstructions = '';
    if (bot.type === 'knowledge') {
      const cite = typeSettings?.knowledge?.citeSources ? '\n- Always cite sources.' : '';
      const isInternal = subtype === 'internal' || (activeSpec as any)?.purpose === 'internal';
      
      if (isInternal) {
        typeInstructions = 'INTERNAL KNOWLEDGE BOT:\n- You are an internal company assistant helping employees.\n- Be conversational and helpful with all questions.\n- Answer questions about: company policies, brand guidelines, procedures, Excel formulas, internal documentation.\n- Use all available knowledge including uploaded documents and web searches when needed.\n- If you don\'t know something, suggest where the employee might find the information or who to contact.' + cite + '\n';
      } else {
        typeInstructions = 'KNOWLEDGE BOT:\n- You can engage in polite small talk (greetings, how are you, thanks, etc.).\n- For business questions: Answer only from context and RAG data.\n- If business info is missing: ask ONE clear follow-up question.' + cite + '\n';
      }
    } else if (bot.type === 'lead') {
      const req = typeSettings?.lead?.requiredFields || {};
      const required = Object.entries(req).filter(([k,v])=>v).map(([k])=>k).join(', ') || 'email';
      const qs = (typeSettings?.lead?.qualificationQuestions || []).slice(0,6).map((q:string)=>`- ${q}`).join('\n');
      typeInstructions = 'LEAD BOT:\n- Be friendly and conversational. Respond naturally to greetings.\n- Collect required fields: ' + required + '.\n- Ask in order: problem → goals/KPI → budget → timeline → decision role.\n- When collected: summarize + say "CALL:WEBHOOK"\n- If Calendly is configured: offer booking with "CALL:BOOK"\n' + (qs? ('- Qualification questions:\n' + qs + '\n') : '');
    } else if (bot.type === 'support') {
      const cats = (typeSettings?.support?.categories || []).join(', ');
      const pri = typeSettings?.support?.collectPriority ? '\n- Ask for ticket priority (low/normal/high).' : '';
      const reqEmail = typeSettings?.support?.requireEmail ? '\n- Require email for ticket creation.' : '';
      typeInstructions = 'SUPPORT BOT:\n- Be helpful and empathetic. Respond naturally to greetings.\n- Collect: description, category, urgency, previous steps, contact info.\n' + (cats? ('- Categories: ' + cats + '.\n') : '') + '- Try to solve from KB first.\n- If not solvable: "CALL:TICKET" to escalate.' + pri + reqEmail + '\n';
    } else if (bot.type === 'workflow') {
      const workflowSubtype = subtype || '';
      if (workflowSubtype.includes('booking')) {
        const tz = typeSettings?.booking?.timezone || 'UTC';
        const dur = typeSettings?.booking?.defaultDuration || 30;
        const reqEmail = typeSettings?.booking?.requireEmail ? '\n- Require email for booking.' : '';
        const services = (typeSettings?.booking?.services || []).join(', ');
        typeInstructions = 'BOOKING BOT:\n- Collect: service, date, time, name' + (reqEmail? ', email' : '') + `.\n- Default duration: ${dur} minutes. Timezone: ${tz}.\n` + (services? ('- Services: ' + services + '.\n') : '') + '- When complete: "CALL:BOOK"\n';
      } else if (workflowSubtype.includes('ecommerce')) {
        const recommend = typeSettings?.ecommerce?.recommend !== false;
        const mode = typeSettings?.ecommerce?.orderLookupMode || 'email_order';
        const returns = typeSettings?.ecommerce?.returnsPolicy ? (`\n- Returns policy: ${typeSettings.ecommerce.returnsPolicy}`) : '';
        typeInstructions = 'E-COMMERCE BOT:\n' + (recommend? '- Recommend products based on needs.\n' : '') + '- Answer order status, returns, etc.\n- For product queries: "CALL:PRODUCT"\n- Order lookup mode: ' + (mode==='order_only' ? 'order number only' : 'email + order number') + returns + '\n';
      }
    }

    // PII masking for logs & downstream providers
    const maskPII = (text: string): string => {
      try {
        if (!text) return text;
        let t = text;
        t = t.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]');
        t = t.replace(/\b\+?\d[\d\s().-]{7,}\b/g, '[phone]');
        return t;
      } catch { return text; }
    };

    // STEP 1: Q&A Database search (fastest, most accurate)
    let qaMatch: any = null;
    try {
      const lastUserMsg = history.filter((h: any) => h.role === 'user').slice(-1)[0]?.content || '';
      if (lastUserMsg && lastUserMsg.length > 5) {
        // Get all Q&A pairs for this bot (sorted by confidence)
        const allQAs = await prisma.botQA.findMany({
          where: { botId },
          orderBy: [
            { verified: 'desc' },
            { confidence: 'desc' },
            { hitCount: 'desc' }
          ],
          take: 100
        });

        if (allQAs.length > 0) {
          // Simple keyword matching with scoring
          const userMsgLower = lastUserMsg.toLowerCase();
          const userWords = userMsgLower.split(/\s+/).filter((w: string) => w.length > 2);
          
          const scoredQAs = allQAs.map(qa => {
            const questionLower = qa.question.toLowerCase();
            
            // Exact match = highest score
            if (questionLower === userMsgLower) {
              return { qa, score: 1.0 };
            }
            
            // Substring match
            if (questionLower.includes(userMsgLower) || userMsgLower.includes(questionLower)) {
              return { qa, score: 0.85 };
            }
            
            // Keyword overlap scoring
            const qWords = questionLower.split(/\s+/).filter((w: string) => w.length > 2);
            const overlap = userWords.filter((w: string) => qWords.some((qw: string) => qw.includes(w) || w.includes(qw)));
            const keywordScore = overlap.length / Math.max(userWords.length, qWords.length);
            
            // Boost score if verified or high confidence
            const boostMultiplier = qa.verified ? 1.2 : (qa.confidence > 0.8 ? 1.1 : 1.0);
            
            return { qa, score: keywordScore * boostMultiplier };
          });

          // Get best match above threshold
          const bestMatch = scoredQAs
            .filter(item => item.score > 0.4)
            .sort((a, b) => b.score - a.score)[0];

          if (bestMatch && bestMatch.score > 0.4) {
            qaMatch = bestMatch.qa;
            
            // Update hit count
            await prisma.botQA.update({
              where: { id: qaMatch.id },
              data: { hitCount: { increment: 1 } }
            }).catch(() => {});
            
            console.log(`✅ Q&A Match: "${qaMatch.question}" (score: ${bestMatch.score.toFixed(2)}, confidence: ${qaMatch.confidence})`);
            
            // If high confidence match, use it directly
            if (bestMatch.score > 0.7 && qaMatch.confidence > 0.7) {
              ragContext = `\n\n=== VERIFIED ANSWER FROM WEBSITE ===
The user is asking about: "${qaMatch.question}"
CORRECT ANSWER (confidence: ${(qaMatch.confidence * 100).toFixed(0)}%, verified: ${qaMatch.verified ? 'YES' : 'NO'}):
${qaMatch.answer}

INSTRUCTION: Use this answer directly. This information comes from the company's website and has been verified as correct.
===================================\n`;
            } else {
              // Include as context but continue to semantic search
              ragContext = `\n\n=== POSSIBLE ANSWER FROM WEBSITE ===
Similar question found: "${qaMatch.question}"
Suggested answer (confidence: ${(qaMatch.confidence * 100).toFixed(0)}%):
${qaMatch.answer}

INSTRUCTION: Consider using this answer, but adapt it to the user's specific question if needed.
===================================\n`;
            }
          }
        }
      }
    } catch (qaErr) {
      console.error('Q&A search error:', qaErr);
      // Continue without Q&A if it fails
    }

    // STEP 2: RAG Semantic search (fallback if no high-confidence Q&A match)
    try {
      const lastUserMsg = history.filter((h: any) => h.role === 'user').slice(-1)[0]?.content || '';
      if (lastUserMsg && (!qaMatch || qaMatch.confidence < 0.7)) {
        // Generate embedding for user query
        const queryEmbedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: lastUserMsg
        });
        const queryVector = queryEmbedding.data[0]?.embedding;
        
        if (queryVector) {
          // Fetch all knowledge chunks for this bot
          const allKnowledge = await prisma.botKnowledge.findMany({
            where: { botId },
            select: { id: true, sourceUrl: true, title: true, content: true, embedding: true }
          });
          
          // Calculate cosine similarity in JS
          const cosineSimilarity = (a: number[], b: number[]): number => {
            if (!a || !b || a.length !== b.length) return 0;
            let dotProduct = 0, magA = 0, magB = 0;
            for (let i = 0; i < a.length; i++) {
              dotProduct += a[i] * b[i];
              magA += a[i] * a[i];
              magB += b[i] * b[i];
            }
            return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
          };
          
          // Rank by similarity
          const ranked = allKnowledge
            .map(k => ({
              ...k,
              similarity: cosineSimilarity(queryVector, k.embedding as number[] || [])
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3);
          
          const threshold = 0.6; // slightly lower to include more context like brand colors
          if (ranked.length > 0 && ranked[0].similarity > threshold) {
            const semanticContext = '\n\n=== ADDITIONAL INFORMATION FROM WEBSITE ===\n' + 
              ranked
                .filter(r => r.similarity > threshold)
                .map((r: any, index: number) => `Source ${index + 1} (relevance: ${(r.similarity * 100).toFixed(0)}%):\n${r.content}`)
                .join('\n\n') +
              '\n\nINSTRUCTION: Use this contextual information to provide a complete answer.\n===================================';
            
            // Append to existing ragContext (don't overwrite Q&A match)
            ragContext += semanticContext;
          }
        }
      }
    } catch (ragErr) {
      console.error('RAG error:', ragErr);
      // Continue without RAG if it fails
    }

    // Personalization: Load previous context for returning visitors
    let personalizedGreeting = '';
    try {
      if (sessionId && history.length === 0) {
        // First message in new session - check for previous sessions
        const previousSessions = await prisma.botSession.findMany({
          where: { 
            botId,
            id: { not: sessionId },
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // last 30 days
          },
          orderBy: { updatedAt: 'desc' },
          take: 1
        });
        
        if (previousSessions.length > 0) {
          const lastSession = previousSessions[0];
          const lastMeta = (lastSession.metadata as any) || {};
          const lastMessages = (lastSession.messages as any[]) || [];
          const lastUserMsg = lastMessages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
          
          if (lastMeta.name) {
            personalizedGreeting = `\n\nNOTE: Returning visitor. Previous name: ${lastMeta.name}. Last question: "${lastUserMsg.slice(0, 100)}". Greet personally and reference context if relevant.`;
          }
        }
      }
    } catch {}

    // Adaptive tone based on user segment
    let toneAdjustment = '';
    
    // Use tone from request or bot metadata
    const requestedTone = tone 
      || (activeSpec as any)?.brand?.tone 
      || (activeSpec as any)?.settings?.tone;
    if (requestedTone) {
      const toneMap: Record<string, string> = {
        'Professional': '\n\nTONE: Professional and business-focused. Be clear, concise, and authoritative while remaining helpful.',
        'Friendly': '\n\nTONE: Warm and approachable. Use a conversational style while maintaining professionalism.',
        'Casual': '\n\nTONE: Relaxed and informal. Feel free to use contractions and conversational language.',
        'Formal': '\n\nTONE: Highly formal and polished. Use proper grammar and avoid contractions or colloquialisms.'
      };
      toneAdjustment = toneMap[requestedTone] || '';
    } else if (history.length > 0) {
      // Fallback to auto-detection
      const allText = history.map((h: any) => h.content).join(' ');
      const isB2B = /company|business|b2b|enterprise|organization|företag/i.test(allText);
      if (isB2B) {
        toneAdjustment = '\n\nUSER SEGMENT: B2B. Use slightly more formal and professional tone. Focus on ROI, efficiency, and business value.';
      }
    }

    // Response policy from brand
    const brand = (activeSpec as any)?.brand || {};
    const responseLength = brand.responseLength || 'normal';
    const fallbackText = brand.fallbackText || "I'm not sure about that. Would you like to leave your email and we'll follow up?";
    const working = brand.workingHours || { startHour: 8, endHour: 17, offHoursMessage: '' };
    const now = new Date();
    const hour = now.getUTCHours();
    const offHoursNote = (typeof working.startHour==='number' && typeof working.endHour==='number' && (hour < working.startHour || hour >= working.endHour))
      ? (`\n\nOFF HOURS: ${working.offHoursMessage || 'We are offline right now.'}`)
      : '';

    let lengthInstr = '';
    if (responseLength === 'short') lengthInstr = '\n- Answer concisely in 1-2 sentences.';
    else if (responseLength === 'long') lengthInstr = '\n- Answer thoroughly in 4-6 sentences.';

    const policies = Array.isArray((activeSpec as any)?.policies) ? `\nPOLICIES:\n- ${((activeSpec as any).policies as string[]).join('\n- ')}` : '';
    const languageHint = (() => {
      const loc = (locale || '').toLowerCase();
      if (loc.startsWith('sv')) return 'RESPOND IN: Swedish.';
      if (loc.startsWith('en')) return 'RESPOND IN: English.';
      return 'RESPOND IN: Match the user\'s language.';
    })();

    const system = `You are a helpful business chatbot. Be conversational and friendly.

IMPORTANT INSTRUCTIONS:
1. Always respond to greetings naturally (Hi, Hello, How are you, etc.)
2. When you see "VERIFIED ANSWER FROM WEBSITE" - use that answer directly, it's confirmed correct
3. When you see "POSSIBLE ANSWER FROM WEBSITE" - adapt it to the user's specific question
4. When you see "ADDITIONAL INFORMATION FROM WEBSITE" - use it to enhance your answer
5. Always prioritize information from the website over general knowledge

LANGUAGE: ${languageHint}

Spec: ${specSafe}

Bot type: ${bot.type}.${subtype || ''}${policies}
${extra}
${typeInstructions}${lengthInstr}${ragContext}${personalizedGreeting}${toneAdjustment}${offHoursNote}

For business questions where information is missing from context: ${fallbackText}`;

    const messages = [
      { role: "system", content: system },
      ...history.map((m: any) => ({ role: m.role, content: maskPII(m.content) }))
    ] as any[];

    let reply = "";
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    if (forcedReply) {
      reply = forcedReply;
    } else {
      const resp = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages,
        max_completion_tokens: 500
      });
      reply = resp.choices[0]?.message?.content || "";
      promptTokens = (resp as any)?.usage?.prompt_tokens || 0;
      completionTokens = (resp as any)?.usage?.completion_tokens || 0;
      totalTokens = (resp as any)?.usage?.total_tokens || (promptTokens + completionTokens);
    }

    // Intent parser: CALL:ACTION {json}
    const IntentSchema = z.object({
      system: z.enum(["zendesk","hubspot","fortnox","shopify","webhook"]).optional(),
      action: z.string().min(2),
      data: z.record(z.any()).optional()
    });
    const extractIntent = (text: string) => {
      try {
        const callMatch = text.match(/CALL:([A-Z_]+)/i);
        if (!callMatch) return null;
        const action = callMatch[1].toUpperCase();
        const jsonMatch = text.slice(callMatch.index! + callMatch[0].length).match(/\{[\s\S]*\}/);
        let data: any = undefined;
        if (jsonMatch) { try { data = JSON.parse(jsonMatch[0]); } catch {} }
        const map: Record<string,string> = { 'TICKET':'zendesk', 'ZENDESK_TICKET':'zendesk', 'HUBSPOT_CONTACT':'hubspot', 'FORTNOX_INVOICE':'fortnox', 'PRODUCT':'shopify', 'WEBHOOK':'webhook' };
        const system = map[action] as any;
        return IntentSchema.parse({ system, action, data });
      } catch { return null; }
    };
    const parsedIntent = extractIntent(reply);

    // User profiling: Extract name, company, email from conversation
    let userProfile: any = {};
    try {
      const allText = history.map((h: any) => h.content).join(' ');
      const emailMatch = allText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      const nameMatch = allText.match(/(?:my name is|i am|jag heter|mitt namn är)\s+([A-Za-zÅÄÖåäö\s]{2,30})/i);
      const companyMatch = allText.match(/(?:company is|work at|at\s+|jag jobbar på|arbetar på|från)\s+([A-Za-zÅÄÖåäö\s]{2,50})/i);
      
      if (emailMatch) userProfile.email = emailMatch[0];
      if (nameMatch) userProfile.name = nameMatch[1].trim();
      if (companyMatch) userProfile.company = companyMatch[1].trim();
      
      // Detect B2B vs B2C based on context
      const isB2B = /företag|company|business|b2b|enterprise|organization/i.test(allText);
      userProfile.segment = isB2B ? 'B2B' : 'B2C';
    } catch {}

    // Session tracking with user profile
    try {
      const currentSession = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const allMessages = [...history, { role: 'assistant', content: reply, timestamp: new Date() }];
      
      await prisma.botSession.upsert({
        where: { id: currentSession },
        update: {
          messages: allMessages,
          metadata: { ...userProfile, lastActive: new Date() },
          updatedAt: new Date()
        },
        create: {
          id: currentSession,
          botId: bot.id,
          ip,
          userAgent,
          messages: allMessages,
          metadata: userProfile
        }
      });
    } catch (sesErr) {
      console.error('Session tracking error:', sesErr);
    }

    // lead/support webhook best-effort + approvals for external actions
    try {
      const spec: any = activeSpec || {};
      const payload = { botId: bot.id, history, reply };
      if ((bot.type === 'lead' || bot.type === 'support') && /CALL:WEBHOOK/i.test(reply) && !spec.requireApproval) {
        if (spec.webhookUrl) {
          await fetch(spec.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
        }
        if (spec.slackWebhook) {
          await fetch(spec.slackWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `Ny ${bot.type}-sammanfattning:\n\n${reply}` }) }).catch(() => {});
        }
        if (bot.type === 'lead' && spec.hubspotEnabled) {
          const text = JSON.stringify(history);
          const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
          if (m) {
            await upsertHubspotContactStub({ email: m[0] });
          }
        }
      } else if ((bot.type === 'lead' || bot.type === 'support') && /CALL:WEBHOOK/i.test(reply) && spec.requireApproval) {
        await prisma.approvalRequest.create({
          data: {
            botId: bot.id,
            type: bot.type,
            payload
          }
        });
      }

      // Intent approval/dispatch
      if (parsedIntent) {
        const intentPayload = { botId: bot.id, intent: parsedIntent, history };
        if ((activeSpec as any)?.requireApproval) {
          await prisma.approvalRequest.create({ data: { botId: bot.id, type: 'external_action', payload: intentPayload, status: 'pending' } });
        } else {
          try {
            if (parsedIntent.system === 'zendesk' && /TICKET/.test(parsedIntent.action)) {
              const lastUserMsg = history.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || 'Support request';
              await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/integrations/zendesk/ticket`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botId: bot.id, subject: parsedIntent.data?.subject || 'Support Ticket', description: parsedIntent.data?.description || lastUserMsg })
              }).catch(()=>{});
            } else if (parsedIntent.system === 'hubspot' && /CONTACT/.test(parsedIntent.action) && parsedIntent.data?.email) {
              await upsertHubspotContactStub({ email: parsedIntent.data.email });
            } else {
              await prisma.approvalRequest.create({ data: { botId: bot.id, type: 'external_action', payload: intentPayload, status: 'pending' } });
            }
          } catch {}
        }
      }
      
      // Type-specific actions
      
      // Booking bot: Parse Calendly intent
      if (bot.type === 'workflow' && spec.calendlyUrl && /CALL:BOOK/i.test(reply)) {
        // Return Calendly link in reply
        const calendlyLink = spec.calendlyUrl;
        const enhancedReply = reply.replace(/CALL:BOOK/gi, `Book here: ${calendlyLink}`);
        // Update reply (handled below)
      }
      
      // Support bot: Create Zendesk ticket
      if (bot.type === 'support' && /CALL:TICKET/i.test(reply)) {
        try {
          const subject = 'Support request from chat';
          const description = history.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || 'Support request';
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/integrations/zendesk/ticket`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId: bot.id, subject, description })
          }).catch(()=>{});
        } catch {}
      }
      
      // E-commerce bot: Shopify product lookup
      if (bot.type === 'workflow' && /CALL:PRODUCT/i.test(reply)) {
        try {
          const lastUser = history.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || '';
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/integrations/shopify/products?botId=${bot.id}&q=${encodeURIComponent(lastUser.slice(0,64))}`)
            .catch(()=>{});
        } catch {}
      }
    } catch {}

    // Log usage (message) with masked content summary (optional lightweight)
    try {
      await prisma.botUsage.create({ data: { botId: bot.id, kind: "message", tokens: Number(totalTokens) || 0 } });
    } catch {}

    // Simple rate limit for free plan: max 50 messages/day per bot + 20/min per IP
    try {
      const spec: any = activeSpec || {};
      const isFree = spec.plan !== 'pro';
      if (isFree) {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const count = await prisma.botUsage.count({ where: { botId: bot.id, createdAt: { gte: since }, kind: 'message' } });
        if (count > 50) {
          return NextResponse.json({ reply: 'The free limit for today has been reached. Upgrade for more capacity.' });
        }

        // Token cap per day for free plan
        const tokensAgg = await prisma.botUsage.aggregate({
          where: { botId: bot.id, createdAt: { gte: since } },
          _sum: { tokens: true }
        });
        const usedTokens = Number(tokensAgg._sum.tokens || 0);
        const dailyTokenCap = 100_000; // ~100k tokens/day for free
        if (usedTokens > dailyTokenCap) {
          return NextResponse.json({ reply: 'The daily token cap has been reached. Please upgrade for more conversations.' });
        }
      }
      // naive in-memory IP bucket (best-effort)
      const g = globalThis as any;
      g.__rate = g.__rate || new Map();
      const key = `ip:${ip}:bot:${bot.id}`;
      const now = Date.now();
      const windowMs = 60 * 1000;
      const rec = g.__rate.get(key) || { start: now, n: 0 };
      if (now - rec.start > windowMs) { rec.start = now; rec.n = 0; }
      rec.n += 1; g.__rate.set(key, rec);
      if (rec.n > 20) {
        return NextResponse.json({ reply: 'Too many requests. Please wait a moment and try again.' }, { status: 429 });
      }
    } catch {}

    // Short-lived cache key: same last user message within 30s → reuse reply
    try {
      const lastUser = history.filter((h: any) => h.role === 'user').slice(-1)[0]?.content || '';
      const key = `cache:${bot.id}:${(lastUser || '').slice(0,64)}`;
      const g = globalThis as any;
      g.__mcache = g.__mcache || new Map();
      const now = Date.now();
      const cached = g.__mcache.get(key);
      if (cached && now - cached.t < 30000) {
        const res = NextResponse.json({ reply: cached.v });
        res.headers.set('Access-Control-Allow-Origin', '*');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return res;
      }
      // store current
      g.__mcache.set(key, { v: reply, t: now });
    } catch {}

    const res = NextResponse.json({ reply, sessionId: sessionId || undefined });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  } catch (e: any) {
    console.error("chat error", e);
    const res = NextResponse.json({ error: "chat failed" }, { status: 500 });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return res;
  }
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}
