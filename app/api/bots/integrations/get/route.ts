import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decryptSecret } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');
    
    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 });
    }

    const [bot, botIntegration] = await Promise.all([
      prisma.bot.findUnique({
        where: { id: botId },
        select: { spec: true }
      }),
      prisma.botIntegration.findUnique({
        where: { botId }
      })
    ]);

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    const spec = bot.spec as any || {};
    
    // Build integrations object from spec and BotIntegration
    const integrations: any = {};

    // Webhook (from spec)
    if (spec.webhookUrl) {
      integrations.webhook = { url: spec.webhookUrl };
    }

    // Slack (from spec)
    if (spec.slackWebhook) {
      integrations.slack = { webhook: spec.slackWebhook };
    }

    // Calendly (from spec)
    if (spec.calendlyUrl) {
      integrations.calendly = { url: spec.calendlyUrl };
    }

    // HubSpot
    if (spec.hubspotEnabled || botIntegration?.hubspotTokenEnc) {
      integrations.hubspot = {
        enabled: spec.hubspotEnabled || false,
        apiKey: botIntegration?.hubspotTokenEnc ? decryptSecret(botIntegration.hubspotTokenEnc) : ''
      };
    }

    // Zendesk
    if (botIntegration?.zendeskDomain || botIntegration?.zendeskEmail || botIntegration?.zendeskApiTokenEnc) {
      integrations.zendesk = {
        domain: botIntegration.zendeskDomain || '',
        email: botIntegration.zendeskEmail || '',
        apiToken: botIntegration.zendeskApiTokenEnc ? decryptSecret(botIntegration.zendeskApiTokenEnc) : ''
      };
    }

    // Shopify
    if (botIntegration?.shopifyDomain || botIntegration?.shopifyAccessTokenEnc) {
      integrations.shopify = {
        domain: botIntegration.shopifyDomain || '',
        accessToken: botIntegration.shopifyAccessTokenEnc ? decryptSecret(botIntegration.shopifyAccessTokenEnc) : ''
      };
    }

    // Mailchimp - stored in spec for now until migration
    if (spec.mailchimpApiKey || spec.mailchimpListId || spec.mailchimpDatacenter) {
      integrations.mailchimp = {
        apiKey: spec.mailchimpApiKey || '',
        listId: spec.mailchimpListId || '',
        datacenter: spec.mailchimpDatacenter || ''
      };
    }

    // Fortnox - stored in spec for now until migration
    if (spec.fortnoxClientId || spec.fortnoxClientSecret || spec.fortnoxAuthCode) {
      integrations.fortnox = {
        clientId: spec.fortnoxClientId || '',
        clientSecret: spec.fortnoxClientSecret || '',
        authCode: spec.fortnoxAuthCode || ''
      };
    }

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}