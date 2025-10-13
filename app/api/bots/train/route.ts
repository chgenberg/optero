import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { botId, question, answer } = await req.json();
    
    if (!botId || !question || !answer) {
      return NextResponse.json({ error: "botId, question and answer required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Generate embedding for the Q&A pair
    const content = `Q: ${question}\nA: ${answer}`;
    
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content
    });
    
    const embedding = embeddingRes.data[0]?.embedding;
    
    if (!embedding) {
      return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
    }

    // Store in BotKnowledge
    const knowledge = await prisma.botKnowledge.create({
      data: {
        botId,
        sourceUrl: null,
        title: `Manual Q&A: ${question.slice(0, 50)}`,
        content,
        embedding,
        metadata: {
          type: 'manual_training',
          question,
          answer,
          createdBy: 'user'
        }
      }
    });

    return NextResponse.json({
      success: true,
      knowledgeId: knowledge.id,
      message: "Training added successfully"
    });

  } catch (error: any) {
    console.error('Training error:', error);
    return NextResponse.json({ 
      error: "Failed to add training",
      details: error.message 
    }, { status: 500 });
  }
}

