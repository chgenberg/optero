import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const session = await prisma.botSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        botId: session.botId,
        messages: session.messages || [],
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

    const session = await prisma.botSession.upsert({
      where: { id: sessionId },
      update: {
        messages: messages ?? [],
        metadata: {
          ...(typeof (await prisma.botSession.findUnique({ where: { id: sessionId } }))?.metadata === 'object' ? (await prisma.botSession.findUnique({ where: { id: sessionId } }))?.metadata as any : {}),
          lastActivity: new Date().toISOString()
        }
      },
      create: {
        id: sessionId,
        botId,
        messages: messages ?? [],
        metadata: { source: "agent_chat" }
      }
    });

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}