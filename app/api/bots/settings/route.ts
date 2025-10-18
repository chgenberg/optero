import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET bot settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");
    
    if (!botId) {
      return NextResponse.json({ error: "Bot ID required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        name: true,
        spec: true,
        metadata: true
      }
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Extract settings from metadata
    const settings = {
      name: bot.name || "AI Assistant",
      tone: (bot.metadata as any)?.tone || "Professional",
      color: (bot.metadata as any)?.color || "#000000",
      language: (bot.metadata as any)?.language || "en",
      logo: (bot.metadata as any)?.logo || null
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching bot settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST update bot settings
export async function POST(req: NextRequest) {
  try {
    const { botId, settings } = await req.json();
    
    if (!botId || !settings) {
      return NextResponse.json({ error: "Bot ID and settings required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId }
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Update bot with new settings
    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: {
        name: settings.name || bot.name,
        metadata: {
          ...(typeof bot.metadata === 'object' ? bot.metadata : {}),
          tone: settings.tone,
          color: settings.color,
          language: settings.language,
          logo: settings.logo,
          updatedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      settings: {
        name: updatedBot.name,
        tone: (updatedBot.metadata as any)?.tone || "Professional",
        color: (updatedBot.metadata as any)?.color || "#000000",
        language: (updatedBot.metadata as any)?.language || "en",
        logo: (updatedBot.metadata as any)?.logo || null
      }
    });
  } catch (error) {
    console.error("Error updating bot settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
