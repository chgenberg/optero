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
    const botSubtype = consult.botSubtype || consult.subtype || consult.problems?.[0] || '';
    const integrationsData = consult.integrations || integrations || {};

    // Minimal spec byggd av konsultdata + konversation + brand + integrations
    const documentContent = consult.documentsContent || "";
    const documentFiles = consult.documentFiles || [];

    // Default policies per subtype
    const subtypePolicies: Record<string, string[]> = {
      'workflow.ecommerce': [
        'Rekommendera produkter utifrån behov och lagerstatus.',
        'Svara på orderstatus med ordrenummer.',
        'Returpolicy: fråga om orsak, ordernummer och returmetod.'
      ],
      'lead.guided_selling': [
        'Ställ frågor i ordning: problem → mål/KPI → budget → tidsram → beslutsroll.',
        'Sammanfatta och föreslå nästa steg.',
        'Om möjligt: erbjud bokning.'
      ],
      'knowledge.pro': [
        'Svara endast från källor och citera alltid källa.',
        'Om osäker: be om förtydligande.'
      ],
      'workflow.hr_screening': [
        'Ställ kravprofilsfrågor och boka intervju vid match.'
      ],
      'support.it_helpdesk': [
        'Samla OS/enhet, nätverk, reproduktionssteg, felmeddelanden innan triage.'
      ],
      'workflow.resource_booking': [
        'Säkerställ kapacitet och konflikter innan bekräftelse.'
      ],
      'workflow.returns_rma': [
        'Validera garanti, samla ordernummer och orsak, ge RMA‑instruktioner.'
      ],
      'workflow.billing_payments': [
        'Ge status för faktura, betalningslänk och påminnelsepolicy.'
      ],
      'workflow.nps_feedback': [
        'Samla NPS och fritext, sammanfatta teman.'
      ],
      'lead.enrichment': [
        'Fyll på CRM‑fält från samtal och offentliga källor.'
      ],
      'workflow.churn_prevention': [
        'Upptäck risksignaler och föreslå winback‑erbjudanden.'
      ],
      'knowledge.sales_internal': [
        'Ge interna säljargument och konkurrensjämförelser med källor.'
      ],
      'knowledge.partner_portal': [
        'Svara på ÅF‑processer: registrering, material, beställning, support.'
      ],
      'workflow.gdpr': [
        'Hantera export/erase‑förfrågningar säkert och spårbart.'
      ],
      'knowledge.multilingual': [
        'Auto‑detektera språk och svara konsekvent på samma språk.'
      ],
      'knowledge.onboarding': [
        'Visa steg‑för‑steg och föreslå nästa steg tills klart.'
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
        fontUrl: brandConfig?.fontUrl || null
      },
      policies: defaultPolicies
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
    let companyName = 'Företaget';
    try {
      if (consult.url) {
        const hostname = new URL(consult.url).hostname.replace(/^www\./, '');
        const parts = hostname.split('.');
        const domain = parts[0] || 'company';
        companyName = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    } catch {}

    const bot = await prisma.bot.create({
      data: {
        userId,
        companyUrl: consult.url || null,
        name: `${companyName} Chatbot`,
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
            const title = titleMatch ? titleMatch[1].trim() : 'Dokument';
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


