import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Chunk text into ~500 token pieces
function chunkText(text: string, maxChars = 2000): string[] {
  const chunks: string[] = [];
  let current = '';
  const sentences = text.split(/[.!?]\s+/);
  
  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? '. ' : '') + sentence;
    }
  }
  
  if (current) chunks.push(current.trim());
  return chunks.filter(c => c.length > 50); // Skip tiny chunks
}

export async function POST(req: NextRequest) {
  try {
    const { botId, pages } = await req.json();
    
    if (!botId || !pages || !Array.isArray(pages)) {
      return NextResponse.json({ error: "botId and pages array required" }, { status: 400 });
    }

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    let totalEmbeddings = 0;
    
    for (const page of pages) {
      const { url, title, text } = page;
      if (!text || text.length < 100) continue;
      
      // Chunk long content
      const chunks = chunkText(text);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          // Generate embedding with OpenAI text-embedding-ada-002
          const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunk
          });
          
          const embedding = embeddingRes.data[0]?.embedding;
          if (!embedding) continue;
          
          // Store in BotKnowledge with vector
          await prisma.$executeRaw`
            INSERT INTO "BotKnowledge" (id, "botId", "sourceUrl", title, content, embedding, metadata, "createdAt", "updatedAt")
            VALUES (
              gen_random_uuid()::text,
              ${botId},
              ${url || null},
              ${title || 'Untitled'},
              ${chunk},
              ${JSON.stringify(embedding)}::vector,
              ${JSON.stringify({ chunkIndex: i, totalChunks: chunks.length })}::jsonb,
              NOW(),
              NOW()
            )
          `;
          
          totalEmbeddings++;
        } catch (embErr) {
          console.error(`Failed to embed chunk from ${url}:`, embErr);
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      embeddingsCreated: totalEmbeddings
    });

  } catch (error: any) {
    console.error('Embedding error:', error);
    return NextResponse.json({ 
      error: "Failed to generate embeddings",
      details: error.message 
    }, { status: 500 });
  }
}

