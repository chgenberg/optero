import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { botId, userEmail } = await req.json();
    
    if (!botId || !userEmail) {
      return NextResponse.json({ error: "botId and userEmail required" }, { status: 400 });
    }

    // Get original bot
    const originalBot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        sources: true,
        knowledge: true
      }
    });

    if (!originalBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clone bot
    const clonedBot = await prisma.bot.create({
      data: {
        userId: user.id,
        companyUrl: null, // User will customize
        name: `${originalBot.name} (Copy)`,
        type: originalBot.type,
        spec: originalBot.spec as any
      }
    });

    // Clone sources
    for (const source of originalBot.sources) {
      await prisma.botSource.create({
        data: {
          botId: clonedBot.id,
          kind: source.kind,
          url: source.url,
          filename: source.filename,
          meta: source.meta as any
        }
      });
    }

    // Clone knowledge (embeddings)
    for (const k of originalBot.knowledge) {
      await prisma.botKnowledge.create({
        data: {
          botId: clonedBot.id,
          sourceUrl: k.sourceUrl,
          title: k.title,
          content: k.content,
          embedding: k.embedding as any,
          metadata: {
            ...((k.metadata as any) || {}),
            clonedFrom: originalBot.id
          } as any
        }
      });
    }

    // Create initial version
    await prisma.botVersion.create({
      data: {
        botId: clonedBot.id,
        version: 1,
        spec: originalBot.spec as any
      }
    });

    // Increment clone count on original
    await prisma.bot.update({
      where: { id: botId },
      data: { cloneCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      newBotId: clonedBot.id
    });

  } catch (error: any) {
    console.error('Clone error:', error);
    return NextResponse.json({ 
      error: "Failed to clone bot",
      details: error.message 
    }, { status: 500 });
  }
}

