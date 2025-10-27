import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { botId, integrationId, name, config } = body;

    if (!botId || !integrationId) {
      return NextResponse.json(
        { error: "botId and integrationId required" },
        { status: 400 }
      );
    }

    // Check if bot exists
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }

    // Create or update bot integration connection
    const integration = await prisma.botIntegrationConnection.create({
      data: {
        botId,
        integrationId,
        config: {
          name,
          active: true,
          addedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(integration);
  } catch (error: any) {
    // Handle unique constraint violation (already connected)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Integration already connected" },
        { status: 400 }
      );
    }
    console.error("[bots/integrations POST]", error);
    return NextResponse.json(
      { error: "Failed to add integration" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get("botId");

    if (!botId) {
      return NextResponse.json(
        { error: "botId parameter required" },
        { status: 400 }
      );
    }

    const connections = await prisma.botIntegrationConnection.findMany({
      where: { botId },
      select: {
        id: true,
        integrationId: true,
        config: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ integrations: connections });
  } catch (error) {
    console.error("[bots/integrations GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId parameter required" },
        { status: 400 }
      );
    }

    await prisma.botIntegrationConnection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[bots/integrations DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}
