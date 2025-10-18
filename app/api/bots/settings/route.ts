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
        spec: true
      }
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Extract settings from metadata
    const spec = (bot.spec as any) || {};
    const settings = {
      name: bot.name || "AI Assistant",
      tone: spec?.settings?.tone || spec?.brand?.tone || "Professional",
      color: spec?.settings?.color || spec?.brand?.color || "#000000",
      language: spec?.settings?.language || spec?.brand?.language || "en",
      logo: spec?.settings?.logo || null
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

    const bot = await prisma.bot.findUnique({ where: { id: botId } });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Update bot with new settings
    const currentSpec: any = (bot.spec as any) || {};
    const nextSpec = {
      ...currentSpec,
      brand: {
        ...(currentSpec.brand || {}),
        tone: settings.tone,
        color: settings.color,
        language: settings.language
      },
      settings: {
        ...(currentSpec.settings || {}),
        tone: settings.tone,
        color: settings.color,
        language: settings.language,
        logo: settings.logo
      }
    };

    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: {
        name: settings.name || bot.name,
        spec: nextSpec
      }
    });

    return NextResponse.json({ 
      success: true, 
      settings: {
        name: updatedBot.name,
        tone: (nextSpec as any)?.settings?.tone || (nextSpec as any)?.brand?.tone || "Professional",
        color: (nextSpec as any)?.settings?.color || (nextSpec as any)?.brand?.color || "#000000",
        language: (nextSpec as any)?.settings?.language || (nextSpec as any)?.brand?.language || "en",
        logo: (nextSpec as any)?.settings?.logo || null
      }
    });
  } catch (error) {
    console.error("Error updating bot settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
