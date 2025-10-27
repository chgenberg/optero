import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId;
    const { integrationId, config } = await request.json();

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID required" },
        { status: 400 }
      );
    }

    // Verify bot exists
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { userId: true },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Verify integration exists and belongs to user
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      select: { userId: true },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    if (integration.userId !== bot.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if already connected
    const existing = await prisma.botIntegrationConnection.findUnique({
      where: {
        botId_integrationId: {
          botId,
          integrationId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { connectionId: existing.id, message: "Already connected" },
        { status: 200 }
      );
    }

    // Create connection
    const connection = await prisma.botIntegrationConnection.create({
      data: {
        botId,
        integrationId,
        config: config || {},
      },
    });

    return NextResponse.json({
      success: true,
      connectionId: connection.id,
    });
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 }
    );
  }
}
