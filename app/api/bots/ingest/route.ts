import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { botId, title, content, source } = await req.json();
    if (!botId || !content || content.trim().length < 20) {
      return NextResponse.json({ error: "botId and content (>=20 chars) required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    // Generate embedding for the provided content
    let embedding: number[] | undefined = undefined;
    try {
      const emb = await openai.embeddings.create({ model: "text-embedding-ada-002", input: content.slice(0, 3000) });
      embedding = emb.data[0]?.embedding as unknown as number[];
    } catch (e) {
      // continue without embedding
    }

    const knowledge = await prisma.botKnowledge.create({
      data: {
        botId,
        sourceUrl: null,
        title: (title || 'Uploaded content').slice(0, 120),
        content: content.slice(0, 5000),
        embedding: embedding as any,
        metadata: { source: source || 'chat_upload', via: 'ingest_api' }
      }
    });

    // Trigger Q&A generation in background (don't await)
    if (content.length > 200) {
      fetch(`${req.url.replace('/ingest', '/qa/generate')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          content,
          sourceUrl: source || null,
          botPurpose: (bot.spec as any)?.purpose || 'customer'
        })
      }).catch(e => console.error('Q&A generation failed:', e));
    }

    return NextResponse.json({ success: true, id: knowledge.id });
  } catch (e: any) {
    return NextResponse.json({ error: "failed_to_ingest", details: e?.message }, { status: 500 });
  }
}


