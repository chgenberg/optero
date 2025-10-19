import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to extract keywords from question
function extractKeywords(question: string): string[] {
  const stopWords = ['what', 'when', 'where', 'who', 'why', 'how', 'is', 'are', 'do', 'does', 'can', 'the', 'a', 'an', 'your', 'my', 'i', 'we', 'you'];
  
  return question
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(' ')
    .filter((word: string) => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10);
}

// Create a new Q&A pair
export async function POST(req: NextRequest) {
  try {
    const { botId, question, answer, category, confidence, verified, sourceType } = await req.json();

    if (!botId || !question || !answer) {
      return NextResponse.json(
        { error: "botId, question, and answer required" },
        { status: 400 }
      );
    }

    const qa = await prisma.botQA.create({
      data: {
        botId,
        question,
        answer,
        category: category || 'general',
        confidence: confidence !== undefined ? confidence : 1.0,
        verified: verified !== undefined ? verified : true,
        sourceType: sourceType || 'manual',
        keywords: extractKeywords(question)
      }
    });

    return NextResponse.json({
      success: true,
      qa
    });

  } catch (error) {
    console.error("Q&A create error:", error);
    return NextResponse.json(
      { error: "Failed to create Q&A pair" },
      { status: 500 }
    );
  }
}
