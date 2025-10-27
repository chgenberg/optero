import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let urlForLock = '';
  try {
    const { consult, conversations, brandConfig, integrations, agentProfile } = await req.json();
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
    const botSubtype = consult.botSubtype || consult.subtype || consult.problems?.[0] || '';
    const botPurpose = consult.botPurpose || 'customer';
    const integrationsData = consult.integrations || integrations || {};
    const typeSettings = consult.typeSettings || {};

    // Minimal spec built from consult data + conversation + brand + integrations
    const documentContent = consult.documentsContent || "";
    const documentFiles = consult.documentFiles || [];

    // Default policies per subtype
    const subtypePolicies: Record<string, string[]> = {
      'workflow.ecommerce': [
        'Recommend products based on needs and inventory availability.',
        'Answer order status with order number.',
        'Returns policy: ask for reason, order number, and return method.'
      ],
      'lead.guided_selling': [
        'Ask in order: problem → goal/KPI → budget → timeline → decision role.',
        'Summarize and suggest next step.',
        'If possible: offer booking.'
      ],
      'knowledge.pro': [
        'Answer only from sources and always cite the source.',
        'If unsure: ask for clarification.'
      ],
      'workflow.hr_screening': [
        'Ask requirement profile questions and book interview on match.'
      ],
      'support.it_helpdesk': [
        'Collect OS/device, network, reproduction steps, error messages before triage.'
      ],
      'workflow.resource_booking': [
        'Ensure capacity and conflicts before confirmation.'
      ],
      'workflow.returns_rma': [
        'Validate warranty, collect order number and reason, provide RMA instructions.'
      ],
      'workflow.billing_payments': [
        'Provide invoice status, payment link, and reminder policy.'
      ],
      'workflow.nps_feedback': [
        'Collect NPS and free text, summarize themes.'
      ],
      'lead.enrichment': [
        'Enrich CRM fields from conversation and public sources.'
      ],
      'workflow.churn_prevention': [
        'Detect risk signals and suggest win-back offers.'
      ],
      'knowledge.sales_internal': [
        'Provide internal sales arguments and competitor comparisons with sources.'
      ],
      'knowledge.partner_portal': [
        'Answer reseller processes: registration, materials, ordering, support.'
      ],
      'workflow.gdpr': [
        'Handle export/erase requests securely and with traceability.'
      ],
      'knowledge.multilingual': [
        'Auto-detect language and respond consistently in the same language.'
      ],
      'knowledge.onboarding': [
        'Show step-by-step guidance and suggest next steps until completion.'
      ]
    };

    const policyKey = `${botType}.${botSubtype}`;
    const defaultPolicies = subtypePolicies[policyKey] || [];

    const spec = {
      role: "company_bot",
      url: consult.url,
      problem: consult.problems?.[0] || "",
      type: botType, // knowledge | lead | support | workflow
      subtype: botSubtype, // specific variant key
      purpose: botPurpose, // internal | customer
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
        documents: documentContent,
        documentFiles
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
        fontUrl: brandConfig?.fontUrl || null,
        responseLength: brandConfig?.responseLength || 'normal',
        fallbackText: brandConfig?.fallbackText || null,
        workingHours: brandConfig?.workingHoursStart && brandConfig?.workingHoursEnd ? {
          startHour: brandConfig.workingHoursStart,
          endHour: brandConfig.workingHoursEnd,
          offHoursMessage: brandConfig?.offHoursMessage || ''
        } : null
      },
      welcomeMessage: brandConfig?.welcomeMessage || null,
      quickReplies: brandConfig?.quickReplies || [],
      customButtons: brandConfig?.customButtons || [],
      policies: defaultPolicies,
      typeSettings
    };

    // Get userId from request or lookup by email
    let userId: string | null = null;
    try {
      const userEmail = consult.userEmail || brandConfig?.userEmail;
      if (userEmail) {
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        userId = user?.id || null;
      }
    } catch {}

    // Extract company name from URL for better display
    let companyName = 'Company';
    try {
      if (consult.url) {
        const hostname = new URL(consult.url).hostname.replace(/^www\./, '');
        const parts = hostname.split('.');
        const domain = parts[0] || 'company';
        companyName = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    } catch {}

    // Use custom bot name from brandConfig if provided, otherwise generate from company name and purpose
    let botName = brandConfig?.botName;
    if (!botName) {
      const purposeSuffix = botPurpose === 'internal' ? ' (Internal)' : '';
      botName = `${companyName} ${botType.charAt(0).toUpperCase() + botType.slice(1)} Bot${purposeSuffix}`;
    }

    const bot = await prisma.bot.create({
      data: {
        userId,
        companyUrl: consult.url || null,
        name: botName,
        type: botType,
        spec
      }
    });

    // Save agent profile if provided
    if (agentProfile && agentProfile.agentTypeId) {
      try {
        await prisma.agentProfile.create({
          data: {
            botId: bot.id,
            agentTypeId: agentProfile.agentTypeId,
            systemPrompt: agentProfile.systemPrompt || "",
            selectedCategoryPath: [],
            selectedUseCases: [],
            onboardingResponses: {},
            generatedContext: "",
            onboardingCompleted: true,
          },
        });
      } catch (e) {
        console.error("Failed to create agent profile:", e);
      }
    }

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

    // Source: documents (metadata + create BotKnowledge entries)
    if (documentFiles && documentFiles.length) {
      for (const f of documentFiles) {
        await prisma.botSource.create({
          data: { botId: bot.id, kind: "document", filename: f }
        });
      }
      
      // Store document content in BotKnowledge for RAG
      if (documentContent) {
        try {
          const chunks = documentContent.split(/={3,}\s*/).filter((c: string) => c.trim().length > 100);
          for (const chunk of chunks.slice(0, 20)) {
            const titleMatch = chunk.match(/^(.+?)===\n/);
            const title = titleMatch ? titleMatch[1].trim() : 'Document';
            const content = chunk.replace(/^.+?===\n/, '').slice(0, 3000);
            
            await prisma.botKnowledge.create({
              data: {
                botId: bot.id,
                sourceUrl: null,
                title,
                content,
                metadata: { source: 'document', type: 'uploaded' }
              }
            });
          }
        } catch (e) {
          console.error('Failed to create document knowledge:', e);
        }
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

    // Create/attach user by email if missing
    try {
      const email = consult.userEmail || brandConfig?.userEmail;
      if (email) {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) user = await prisma.user.create({ data: { email } });
        if (!bot.userId) {
          await prisma.bot.update({ where: { id: bot.id }, data: { userId: user.id } });
        }
      }
    } catch {}

    // Fire-and-forget: build Q&A coverage in background
    try {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/bots/qa/build?botId=${bot.id}&limit=250`, {
        method: 'POST'
      }).catch(() => {});
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


