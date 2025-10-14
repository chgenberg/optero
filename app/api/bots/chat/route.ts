import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { upsertHubspotContactStub } from "@/lib/integrations";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { botId, history, sessionId } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    
    const bot = await prisma.bot.findUnique({ where: { id: botId }, include: { versions: true } });
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
      typeInstructions = 'KNOWLEDGE BOT:\n- Answer only from context and RAG data.\n- If info is missing: ask ONE clear follow-up question.' + cite + '\n';
    } else if (bot.type === 'lead') {
      const req = typeSettings?.lead?.requiredFields || {};
      const required = Object.entries(req).filter(([k,v])=>v).map(([k])=>k).join(', ') || 'email';
      const qs = (typeSettings?.lead?.qualificationQuestions || []).slice(0,6).map((q:string)=>`- ${q}`).join('\n');
      typeInstructions = 'LEAD BOT:\n- Collect required fields: ' + required + '.\n- Ask in order: problem → goals/KPI → budget → timeline → decision role.\n- When collected: summarize + say "CALL:WEBHOOK"\n- If Calendly is configured: offer booking with "CALL:BOOK"\n' + (qs? ('- Qualification questions:\n' + qs + '\n') : '');
    } else if (bot.type === 'support') {
      const cats = (typeSettings?.support?.categories || []).join(', ');
      const pri = typeSettings?.support?.collectPriority ? '\n- Ask for ticket priority (low/normal/high).' : '';
      const reqEmail = typeSettings?.support?.requireEmail ? '\n- Require email for ticket creation.' : '';
      typeInstructions = 'SUPPORT BOT:\n- Collect: description, category, urgency, previous steps, contact info.\n' + (cats? ('- Categories: ' + cats + '.\n') : '') + '- Try to solve from KB first.\n- If not solvable: "CALL:TICKET" to escalate.' + pri + reqEmail + '\n';
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

    // RAG: Semantic search in BotKnowledge (JSONB-based cosine similarity)
    let ragContext = '';
    try {
      const lastUserMsg = history.filter((h: any) => h.role === 'user').slice(-1)[0]?.content || '';
      if (lastUserMsg) {
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
          
          if (ranked.length > 0 && ranked[0].similarity > 0.7) {
            ragContext = '\n\nRelevant information from knowledge base:\n' + 
              ranked
                .filter(r => r.similarity > 0.7) // Only include if similarity > 0.7
                .map((r: any) => `[${r.title}](${r.sourceUrl || ''}): ${r.content}`)
                .join('\n\n');
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
    if (history.length > 0) {
      const allText = history.map((h: any) => h.content).join(' ');
      const isB2B = /företag|company|business|b2b|enterprise|organization/i.test(allText);
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
    const system = `You are a business chatbot. Follow the specification.\n\nSpec: ${specSafe}\n\nBot type: ${bot.type}.${subtype || ''}${policies}\n${extra}\n${typeInstructions}${lengthInstr}${ragContext}${personalizedGreeting}${toneAdjustment}${offHoursNote}\n\nIf information is missing in context: use Fallback: ${fallbackText}`;

    const messages = [
      { role: "system", content: system },
      ...history.map((m: any) => ({ role: m.role, content: maskPII(m.content) }))
    ] as any[];

    const resp = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages,
      max_completion_tokens: 500
    });

    const reply = resp.choices[0]?.message?.content || "";
    const promptTokens = (resp as any)?.usage?.prompt_tokens || 0;
    const completionTokens = (resp as any)?.usage?.completion_tokens || 0;
    const totalTokens = (resp as any)?.usage?.total_tokens || (promptTokens + completionTokens);

    // User profiling: Extract name, company, email from conversation
    let userProfile: any = {};
    try {
      const allText = history.map((h: any) => h.content).join(' ');
      const emailMatch = allText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      const nameMatch = allText.match(/(?:jag heter|mitt namn är|my name is)\s+([A-Za-zÅÄÖåäö\s]{2,30})/i);
      const companyMatch = allText.match(/(?:jag jobbar på|arbetar på|från|company is|work at)\s+([A-Za-zÅÄÖåäö\s]{2,50})/i);
      
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

    // lead/support webhook best-effort
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
      
      // Type-specific actions
      
      // Booking bot: Parse Calendly intent
      if (bot.type === 'workflow' && spec.calendlyUrl && /CALL:BOOK/i.test(reply)) {
        // Return Calendly link in reply
        const calendlyLink = spec.calendlyUrl;
        const enhancedReply = reply.replace(/CALL:BOOK/gi, `Boka här: ${calendlyLink}`);
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
          return NextResponse.json({ reply: 'Gratisgränsen är nådd för idag. Uppgradera för mer kapacitet.' });
        }

        // Token cap per day for free plan
        const tokensAgg = await prisma.botUsage.aggregate({
          where: { botId: bot.id, createdAt: { gte: since } },
          _sum: { tokens: true }
        });
        const usedTokens = Number(tokensAgg._sum.tokens || 0);
        const dailyTokenCap = 100_000; // ~100k tokens/dag för free
        if (usedTokens > dailyTokenCap) {
          return NextResponse.json({ reply: 'Token‑gränsen för idag är nådd. Uppgradera för fler samtal.' });
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
        return NextResponse.json({ reply: 'För många förfrågningar. Vänta en stund och försök igen.' }, { status: 429 });
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
