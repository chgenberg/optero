import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { botId, messages, sessionId, title } = body;

    if (!botId || !messages) {
      return NextResponse.json(
        { error: "botId and messages required" },
        { status: 400 }
      );
    }

    // Create or update session
    const session = await prisma.botSession.upsert({
      where: { id: sessionId || "none" },
      update: {
        messages,
        updatedAt: new Date(),
      },
      create: {
        id: sessionId,
        botId,
        messages,
        metadata: {
          title: title || `Chat ${new Date().toLocaleDateString()}`,
        },
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[agents/sessions POST]", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get("botId");
    const sessionId = searchParams.get("sessionId");

    if (!botId) {
      return NextResponse.json(
        { error: "botId parameter required" },
        { status: 400 }
      );
    }

    // Get specific session
    if (sessionId) {
      const session = await prisma.botSession.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          messages: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(session);
    }

    // Get all sessions for this bot
    const sessions = await prisma.botSession.findMany({
      where: { botId },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: {} as any, // Don't return full messages in list
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50, // Limit to 50 sessions
    });

    // Count messages for each session
    const sessionsWithCounts = sessions.map((session) => ({
      ...session,
      messageCount: Array.isArray(session.messages)
        ? session.messages.length
        : 0,
      messages: undefined, // Remove the empty messages field
    }));

    return NextResponse.json({
      sessions: sessionsWithCounts,
    });
  } catch (error) {
    console.error("[agents/sessions GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId parameter required" },
        { status: 400 }
      );
    }

    await prisma.botSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[agents/sessions DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
