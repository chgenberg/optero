import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId;

    // Get bot configuration
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        name: true,
        type: true,
        spec: true
      }
    });

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }

    // Only allow config access for customer bots (not internal)
    const spec = bot.spec as any;
    if (spec?.purpose === 'internal') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Return public configuration
    const config = {
      id: bot.id,
      name: bot.name || spec?.name || 'Assistant',
      welcomeMessage: spec?.welcomeMessage || 'Hi! How can I help you today?',
      brand: spec?.brand || {
        primaryColor: '#000000',
        secondaryColor: '#666666',
        fontFamily: 'system-ui'
      },
      quickReplies: spec?.quickReplies || [],
      responseLength: spec?.responseLength || 'normal',
      workingHours: spec?.workingHours || {
        startHour: 9,
        endHour: 17,
        offHoursMessage: 'We are offline right now. Please leave your message.'
      }
    };

    const response = NextResponse.json(config);
    
    // Add CORS headers for widget
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error("Bot config error:", error);
    return NextResponse.json(
      { error: "Failed to load bot configuration" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
