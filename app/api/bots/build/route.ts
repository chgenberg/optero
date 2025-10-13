import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let urlForLock = '';
  try {
    const { consult, conversations, brandConfig, integrations } = await req.json();
    urlForLock = consult?.url || '';
    // lightweight build lock per URL to avoid spikes
    const key = `build:${consult.url}`;
    const g = globalThis as any;
    g.__buildLock = g.__buildLock || new Map();
    if (g.__buildLock.get(key)) {
      // brief backoff
      await new Promise((r) => setTimeout(r, 3000));
    }
    g.__buildLock.set(key, true);

    const botType = consult.botType || 'knowledge';
    const integrationsData = consult.integrations || integrations || {};

    // Minimal spec byggd av konsultdata + konversation + brand + integrations
    const spec = {
      role: "company_bot",
      url: consult.url,
      problem: consult.problems?.[0] || "",
      type: botType, // knowledge | lead | support | workflow
      subtype: consult.problems?.[0] || '', // For specific variants
      webhookUrl: integrationsData.webhookUrl || null,
      slackWebhook: integrationsData.slackWebhook || null,
      hubspotEnabled: integrationsData.hubspotEnabled || false,
      calendlyUrl: integrationsData.calendlyUrl || null,
      zendeskDomain: integrationsData.zendeskDomain || null,
      shopifyDomain: integrationsData.shopifyDomain || null,
      plan: 'free' as 'free' | 'pro',
      goals: consult.websiteSummary?.summary?.goals || [],
      context: {
        websiteMainText: consult.websiteSummary?.mainText || consult.websiteContent || "",
        documents: consult.documentsContent || ""
      },
      requireApproval: false,
      sources: {
        website: true,
        documents: Boolean(consult.documentsContent)
      },
      brand: {
        primaryColor: brandConfig?.primaryColor || '#111111',
        secondaryColor: brandConfig?.secondaryColor || '#666666',
        fontFamily: brandConfig?.fontFamily || 'system-ui',
        tone: brandConfig?.tone || 'professional',
        logoUrl: brandConfig?.logoUrl || null,
        logoPosition: brandConfig?.logoPosition || 'bottom-right',
        logoOffset: brandConfig?.logoOffset || { x: 20, y: 20 },
        fontUrl: brandConfig?.fontUrl || null
      }
    };

    const bot = await prisma.bot.create({
      data: {
        companyUrl: consult.url || null,
        name: `${spec.type} Bot for ${consult.url || "company"}`,
        type: botType,
        spec
      }
    });

    // Initial versioning (v1)
    try {
      await prisma.botVersion.create({ data: { botId: bot.id, version: 1, spec } });
    } catch {}

    // Source: website
    await prisma.botSource.create({
      data: {
        botId: bot.id,
        kind: "website",
        url: consult.url
      }
    });

    // Source: documents (metadata only)
    if (consult.files && consult.files.length) {
      for (const f of consult.files) {
        await prisma.botSource.create({
          data: { botId: bot.id, kind: "document", filename: f }
        });
      }
    }

    // Trigger embedding generation in background (best-effort, don't block response)
    try {
      const pages = consult.pages || [];
      if (pages.length > 0) {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/bots/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId: bot.id, pages })
        }).catch(() => {}); // fire and forget
      }
    } catch {}

    return NextResponse.json({ botId: bot.id });
  } catch (e: any) {
    console.error("Bot build failed", e);
    return NextResponse.json({ error: "Failed to build bot" }, { status: 500 });
  }
  finally {
    try {
      const g = globalThis as any;
      const key = `build:${urlForLock}`;
      if (g.__buildLock && key) g.__buildLock.delete(key);
    } catch {}
  }
}


