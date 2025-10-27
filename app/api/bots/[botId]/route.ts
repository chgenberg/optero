import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId;

    // Get bot details
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        user: true,
        integrationConnections: true,
        knowledge: {
          select: {
            id: true,
            title: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Calculate stats
    const stats = {
      totalChats: 0, // You can implement actual chat counting
      lastActive: bot.updatedAt,
      knowledgeCount: bot.knowledge.length,
      integrationCount: bot.integrationConnections.length,
    };

    return NextResponse.json({
      ...bot,
      spec: {
        ...bot.spec,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching bot:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot" },
      { status: 500 }
    );
  }
}
