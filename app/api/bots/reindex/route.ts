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

    const spec = bot.spec as any;
    const url = spec.url || bot.companyUrl;
    
    if (!url) {
      return NextResponse.json({ error: "No URL to re-index" }, { status: 400 });
    }

    // Delete old knowledge
    await prisma.botKnowledge.deleteMany({ where: { botId } });

    // Re-scrape website
    const scrapeRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/business/deep-scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const scrapeData = await scrapeRes.json();
    
    if (!scrapeData.success || !scrapeData.pages) {
      return NextResponse.json({ error: "Failed to scrape website" }, { status: 500 });
    }

    // Re-generate embeddings
    const embedRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/bots/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        botId, 
        pages: scrapeData.pages 
      })
    });

    const embedData = await embedRes.json();

    // Fire-and-forget: rebuild Q&A coverage
    try {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/bots/qa/build?botId=${botId}&limit=250`, { method: 'POST' }).catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      pagesScraped: scrapeData.pagesScraped,
      embeddingsCreated: embedData.embeddingsCreated || 0,
      message: "Bot knowledge base updated successfully"
    });

  } catch (error: any) {
    console.error('Reindex error:', error);
    return NextResponse.json({ 
      error: "Failed to reindex bot",
      details: error.message 
    }, { status: 500 });
  }
}

