import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { botId: string; integrationId: string } }
) {
  try {
    const { botId, integrationId } = params;

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

    // Find and delete connection
    const connection = await prisma.botIntegrationConnection.findUnique({
      where: {
        botId_integrationId: {
          botId,
          integrationId,
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    await prisma.botIntegrationConnection.delete({
      where: {
        botId_integrationId: {
          botId,
          integrationId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}
