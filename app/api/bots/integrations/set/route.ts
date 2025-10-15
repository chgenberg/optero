import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encryptSecret } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { botId, integrations } = await req.json();
    
    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 });
    }

    // Get existing bot to update spec
    const bot = await prisma.bot.findUnique({ 
      where: { id: botId },
      select: { spec: true }
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    const existingSpec = (bot.spec as any) || {};
    const specUpdate: any = { ...existingSpec };

    // Update spec with non-sensitive integration data
    if (integrations.webhook) {
      specUpdate.webhookUrl = integrations.webhook.url || null;
    }
    if (integrations.slack) {
      specUpdate.slackWebhook = integrations.slack.webhook || null;
    }
    if (integrations.calendly) {
      specUpdate.calendlyUrl = integrations.calendly.url || null;
    }
    if (integrations.hubspot) {
      specUpdate.hubspotEnabled = integrations.hubspot.enabled || false;
    }

    // Mailchimp - store in spec for now
    if (integrations.mailchimp) {
      specUpdate.mailchimpApiKey = integrations.mailchimp.apiKey || null;
      specUpdate.mailchimpListId = integrations.mailchimp.listId || null;
      specUpdate.mailchimpDatacenter = integrations.mailchimp.datacenter || null;
    }

    // Fortnox - store in spec for now
    if (integrations.fortnox) {
      specUpdate.fortnoxClientId = integrations.fortnox.clientId || null;
      specUpdate.fortnoxClientSecret = integrations.fortnox.clientSecret || null;
      specUpdate.fortnoxAuthCode = integrations.fortnox.authCode || null;
    }

    // Update bot spec
    await prisma.bot.update({
      where: { id: botId },
      data: { spec: specUpdate }
    });

    // Prepare sensitive integration data
    const integrationData: any = {};

    // Zendesk
    if (integrations.zendesk) {
      if (integrations.zendesk.domain !== undefined) 
        integrationData.zendeskDomain = integrations.zendesk.domain || null;
      if (integrations.zendesk.email !== undefined) 
        integrationData.zendeskEmail = integrations.zendesk.email || null;
      if (integrations.zendesk.apiToken !== undefined) 
        integrationData.zendeskApiTokenEnc = integrations.zendesk.apiToken ? encryptSecret(integrations.zendesk.apiToken) : null;
    }

    // HubSpot
    if (integrations.hubspot?.apiKey !== undefined) {
      integrationData.hubspotTokenEnc = integrations.hubspot.apiKey ? encryptSecret(integrations.hubspot.apiKey) : null;
    }

    // Shopify
    if (integrations.shopify) {
      if (integrations.shopify.domain !== undefined) 
        integrationData.shopifyDomain = integrations.shopify.domain || null;
      if (integrations.shopify.accessToken !== undefined) 
        integrationData.shopifyAccessTokenEnc = integrations.shopify.accessToken ? encryptSecret(integrations.shopify.accessToken) : null;
    }

    // Note: Mailchimp and Fortnox are stored in spec for now

    // Update or create integration record
    if (Object.keys(integrationData).length > 0) {
      await prisma.botIntegration.upsert({
        where: { botId },
        update: integrationData,
        create: { botId, ...integrationData },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting integrations:', error);
    return NextResponse.json({ error: 'Failed to set integrations' }, { status: 500 });
  }
}