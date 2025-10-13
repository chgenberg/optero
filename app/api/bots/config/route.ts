import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        spec: true
      }
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const spec = bot.spec as any;
    const brand = spec.brand || {
      primaryColor: '#111111',
      secondaryColor: '#666666',
      fontFamily: 'system-ui',
      tone: 'professional'
    };

    // Add CORS headers for widget
    return NextResponse.json({ brand }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Config error:', error);
    return NextResponse.json({ 
      brand: {
        primaryColor: '#111111',
        secondaryColor: '#666666',
        fontFamily: 'system-ui',
        tone: 'professional'
      }
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
