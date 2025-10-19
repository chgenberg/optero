import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Detect FAQ sections from website content
export async function POST(req: NextRequest) {
  try {
    const { botId, html, sourceUrl } = await req.json();

    if (!botId || !html) {
      return NextResponse.json(
        { error: "botId and html required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Detecting FAQ sections in content...`);

    // First, try to detect FAQ sections using GPT
    const prompt = `Analyze this HTML content and extract all FAQ (Frequently Asked Questions) sections.

HTML CONTENT:
${html.substring(0, 20000)}

INSTRUCTIONS:
1. Find all Q&A pairs (questions with answers)
2. Look for sections labeled FAQ, Questions, Help, Support, etc.
3. Extract clear question-answer pairs
4. Assign a confidence score (0-1) based on how clear the Q&A is
5. Categorize each Q&A (general, product, shipping, support, etc.)

OUTPUT FORMAT (JSON):
{
  "faqs": [
    {
      "question": "What are your shipping costs?",
      "answer": "Shipping is free for orders over $50",
      "confidence": 0.95,
      "category": "shipping"
    }
  ]
}

Return ONLY valid JSON, no markdown, no explanation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(responseText);

    if (!data.faqs || !Array.isArray(data.faqs)) {
      console.log("⚠️ No FAQs detected");
      return NextResponse.json({
        success: true,
        detected: 0,
        saved: 0,
        faqs: []
      });
    }

    console.log(`✅ Detected ${data.faqs.length} FAQ pairs`);

    // Filter high-confidence FAQs
    const highConfidenceFaqs = data.faqs.filter((faq: any) => 
      faq.confidence > 0.6 && faq.question && faq.answer
    );

    console.log(`🎯 ${highConfidenceFaqs.length} high-confidence FAQs`);

    // Save to database
    const savedCount = await prisma.botQA.createMany({
      data: highConfidenceFaqs.map((faq: any) => ({
        botId,
        question: faq.question,
        answer: faq.answer,
        confidence: faq.confidence,
        category: faq.category || 'faq',
        sourceUrl: sourceUrl || null,
        sourceType: 'faq_detected',
        keywords: extractKeywords(faq.question)
      })),
      skipDuplicates: true
    });

    console.log(`💾 Saved ${savedCount.count} FAQ pairs to database`);

    return NextResponse.json({
      success: true,
      detected: data.faqs.length,
      saved: savedCount.count,
      faqs: highConfidenceFaqs.slice(0, 10)
    });

  } catch (error) {
    console.error("FAQ detection error:", error);
    return NextResponse.json(
      { error: "Failed to detect FAQs" },
      { status: 500 }
    );
  }
}

// Helper function to extract keywords from question
function extractKeywords(question: string): string[] {
  const stopWords = ['what', 'when', 'where', 'who', 'why', 'how', 'is', 'are', 'do', 'does', 'can', 'the', 'a', 'an', 'your', 'my', 'i'];
  
  return question
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10);
}

