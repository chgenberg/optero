import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encryptSecret } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { botId, integrations } = await req.json();
    
    if (!botId || !integrations) {
      return NextResponse.json({ error: "Bot ID and integrations required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Upsert bot integration
    const integrationData: any = {};

    // Shopify
    if (integrations.shopify?.enabled) {
      integrationData.shopifyDomain = integrations.shopify.domain;
      if (integrations.shopify.accessToken) {
        integrationData.shopifyAccessTokenEnc = encryptSecret(integrations.shopify.accessToken);
      }
    }

    // HubSpot
    if (integrations.hubspot?.enabled && integrations.hubspot.accessToken) {
      integrationData.hubspotTokenEnc = encryptSecret(integrations.hubspot.accessToken);
    }

    // Zendesk
    if (integrations.zendesk?.enabled) {
      integrationData.zendeskDomain = integrations.zendesk.domain;
      integrationData.zendeskEmail = integrations.zendesk.email;
      if (integrations.zendesk.apiToken) {
        integrationData.zendeskApiTokenEnc = encryptSecret(integrations.zendesk.apiToken);
      }
    }

    // Centra
    if (integrations.centra?.enabled) {
      integrationData.centraApiBaseUrl = integrations.centra.apiBaseUrl;
      integrationData.centraStoreId = integrations.centra.storeId;
      if (integrations.centra.accessToken) {
        integrationData.centraAccessTokenEnc = encryptSecret(integrations.centra.accessToken);
      }
    }

    // Upsert integration
    await prisma.botIntegration.upsert({
      where: { botId },
      create: {
        botId,
        ...integrationData
      },
      update: integrationData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving integrations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

