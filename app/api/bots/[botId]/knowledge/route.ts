import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId;

    // Verify bot exists
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Get all knowledge documents
    const documents = await prisma.botKnowledge.findMany({
      where: { botId },
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to response format
    const mappedDocuments = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      sourceUrl: doc.sourceUrl,
      fileType: (doc.metadata as any)?.fileType || "document",
      size: (doc.metadata as any)?.fileSize || 0,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({ documents: mappedDocuments });
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge documents" },
      { status: 500 }
    );
  }
}
