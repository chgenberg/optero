import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { botId: string; knowledgeId: string } }
) {
  try {
    const { botId, knowledgeId } = params;

    // Verify bot exists
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Verify knowledge belongs to bot
    const knowledge = await prisma.botKnowledge.findUnique({
      where: { id: knowledgeId },
      select: { botId: true },
    });

    if (!knowledge) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (knowledge.botId !== botId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete knowledge document
    await prisma.botKnowledge.delete({
      where: { id: knowledgeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
