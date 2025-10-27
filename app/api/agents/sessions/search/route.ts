import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get("botId");
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!botId || !query) {
      return NextResponse.json(
        { error: "botId and q parameters required" },
        { status: 400 }
      );
    }

    // Search through sessions' messages
    const sessions = await prisma.botSession.findMany({
      where: {
        botId,
        isArchived: false,
      },
      select: {
        id: true,
        messages: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit * 2, // Get more to search through
    });

    // Filter and search through messages
    const results = sessions
      .map((session) => {
        const messages = Array.isArray(session.messages)
          ? session.messages
          : [];
        
        // Search in messages
        const matchingMessages = messages.filter(
          (msg: any) =>
            msg.content &&
            msg.content.toLowerCase().includes(query.toLowerCase())
        );

        if (matchingMessages.length === 0) return null;

        // Count matches
        const matchCount = matchingMessages.length;
        
        // Get first match preview
        const firstMatch = matchingMessages[0] as { role: string; content: string; timestamp?: string };
        if (!firstMatch) return null;
        
        const preview = firstMatch.content
          .substring(0, 100)
          .toLowerCase()
          .replace(
            query.toLowerCase(),
            `**${query}**`
          );

        const metadata = session.metadata as { title?: string } | null;
        return {
          sessionId: session.id,
          matchCount,
          preview: `${preview}...`,
          firstMatchContent: firstMatch.content,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          title: metadata?.title || "Chat",
        };
      })
      .filter((result) => result !== null)
      .slice(0, limit);

    return NextResponse.json({
      query,
      resultCount: results.length,
      results,
    });
  } catch (error) {
    console.error("[agents/sessions/search]", error);
    return NextResponse.json(
      { error: "Failed to search sessions" },
      { status: 500 }
    );
  }
}
