import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId;

    // Get bot and verify it exists
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { userId: true },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Get all integrations for this user
    const allIntegrations = await prisma.integration.findMany({
      where: { userId: bot.userId },
    });

    // Get connected integrations for this bot
    const connectedIntegrations = await prisma.botIntegrationConnection.findMany({
      where: { botId },
      select: { integrationId: true, config: true },
    });

    const connectedIds = new Set(connectedIntegrations.map((c) => c.integrationId));
    const configMap = new Map(connectedIntegrations.map((c) => [c.integrationId, c.config]));

    // Map integrations with connection status
    const integrations = allIntegrations.map((integration) => ({
      id: integration.id,
      type: integration.type,
      name: integration.name,
      settings: integration.settings,
      isConnected: connectedIds.has(integration.id),
      config: configMap.get(integration.id),
    }));

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
