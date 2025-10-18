import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }
    
    const session = await prisma.botSession.findFirst({
      where: { 
        externalId: sessionId,
        status: "active"
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!session) {
      return NextResponse.json({ session: null });
    }
    
    // Parse messages from metadata
    const messages = session.metadata?.messages || [];
    
    return NextResponse.json({
      session: {
        id: session.id,
        botId: session.botId,
        messages,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error("Session load error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, botId, messages } = await req.json();
    
    if (!sessionId || !botId) {
      return NextResponse.json({ error: "sessionId and botId required" }, { status: 400 });
    }
    
    // Upsert session
    const session = await prisma.botSession.upsert({
      where: {
        externalId: sessionId
      },
      update: {
        metadata: {
          messages,
          lastActivity: new Date().toISOString()
        }
      },
      create: {
        botId,
        externalId: sessionId,
        status: "active",
        metadata: {
          messages,
          source: "agent_chat"
        }
      }
    });
    
    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}