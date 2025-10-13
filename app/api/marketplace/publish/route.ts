import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { botId } = await req.json();
    
    if (!botId) {
      return NextResponse.json({ error: "botId required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Update bot to public
    await prisma.bot.update({
      where: { id: botId },
      data: { isPublic: true }
    });

    return NextResponse.json({
      success: true,
      message: "Bot published to marketplace"
    });

  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json({ 
      error: "Failed to publish bot",
      details: error.message 
    }, { status: 500 });
  }
}

