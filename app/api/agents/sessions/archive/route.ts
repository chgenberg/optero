import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, archive } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId required" },
        { status: 400 }
      );
    }

    const session = await prisma.botSession.update({
      where: { id: sessionId },
      data: {
        isArchived: archive === true,
        archivedAt: archive === true ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      isArchived: session.isArchived,
    });
  } catch (error) {
    console.error("[agents/sessions/archive]", error);
    return NextResponse.json(
      { error: "Failed to archive session" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get("botId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!botId) {
      return NextResponse.json(
        { error: "botId parameter required" },
        { status: 400 }
      );
    }

    // Get archived sessions
    const archivedSessions = await prisma.botSession.findMany({
      where: {
        botId,
        isArchived: true,
      },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        archivedAt: true,
      },
      orderBy: { archivedAt: "desc" },
      take: limit,
    });

    // Count messages for each
    const sessionsWithCounts = archivedSessions.map((session) => {
      // Note: We don't load full messages for archived list for performance
      const metadata = session.metadata as { title?: string } | null;
      return {
        id: session.id,
        title: metadata?.title || "Chat",
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        archivedAt: session.archivedAt,
      };
    });

    return NextResponse.json({
      sessions: sessionsWithCounts,
      total: sessionsWithCounts.length,
    });
  } catch (error) {
    console.error("[agents/sessions/archive GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch archived sessions" },
      { status: 500 }
    );
  }
}
