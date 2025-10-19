import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import standardQuestions from "@/data/standard-questions.json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate Q&A pairs from content
export async function POST(req: NextRequest) {
  try {
    const { botId, content, sourceUrl, botPurpose } = await req.json();

    if (!botId || !content) {
      return NextResponse.json(
        { error: "botId and content required" },
        { status: 400 }
      );
    }

    // Get relevant questions based on bot purpose
    const questions = botPurpose === 'internal' 
      ? Object.values(standardQuestions.internal).flat()
      : Object.values(standardQuestions.customer).flat();

    console.log(`🤖 Generating Q&A pairs for ${questions.length} questions...`);

    // Batch questions (25 at a time for better API usage)
    const batchSize = 25;
    const batches: string[][] = [];
    
    for (let i = 0; i < questions.length; i += batchSize) {
      batches.push(questions.slice(i, i + batchSize));
    }

    const allQAPairs: Array<{
      question: string;
      answer: string;
      confidence: number;
      category: string;
      keywords: string[];
    }> = [];

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length}...`);

      const prompt = `You are analyzing website content to answer customer/employee questions.

WEBSITE CONTENT:
${content.substring(0, 15000)} 

INSTRUCTIONS:
For each question below, provide an answer based ONLY on the website content above.
- If the content has a clear answer, provide it with high confidence (0.7-1.0)
- If you can partially answer, provide it with medium confidence (0.4-0.6)
- If the content doesn't answer it at all, respond with "NO_ANSWER" and confidence 0

QUESTIONS:
${batch.map((q, i) => `${i + 1}. ${q}`).join('\n')}

OUTPUT FORMAT (JSON array):
[
  {
    "question": "What are your opening hours?",
    "answer": "We are open Monday-Friday 9am-5pm",
    "confidence": 0.9,
    "category": "general",
    "keywords": ["hours", "open", "schedule"]
  },
  {
    "question": "Do you ship internationally?",
    "answer": "NO_ANSWER",
    "confidence": 0,
    "category": "shipping",
    "keywords": []
  }
]

Return ONLY valid JSON array, no markdown, no explanation.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        
        // Parse response - handle both array and object with array
        let parsedData: any;
        try {
          parsedData = JSON.parse(responseText);
          
          // If it's an object with an array property, extract that
          if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            const arrayKey = Object.keys(parsedData).find(key => Array.isArray(parsedData[key]));
            if (arrayKey) {
              parsedData = parsedData[arrayKey];
            } else {
              console.warn("⚠️ Response is not an array, skipping batch");
              continue;
            }
          }
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          console.log("Raw response:", responseText);
          continue;
        }

        if (Array.isArray(parsedData)) {
          const validPairs = parsedData.filter((qa: any) => 
            qa.answer && 
            qa.answer !== "NO_ANSWER" && 
            qa.confidence > 0.3
          );
          
          allQAPairs.push(...validPairs);
          console.log(`✅ Batch ${batchIndex + 1}: Found ${validPairs.length} valid Q&A pairs`);
        }

      } catch (error) {
        console.error(`❌ Error processing batch ${batchIndex + 1}:`, error);
      }

      // Rate limiting: wait 1 second between batches
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 Total Q&A pairs generated: ${allQAPairs.length}`);

    // Save to database
    const savedCount = await prisma.botQA.createMany({
      data: allQAPairs.map(qa => ({
        botId,
        question: qa.question,
        answer: qa.answer,
        confidence: qa.confidence,
        category: qa.category,
        sourceUrl: sourceUrl || null,
        sourceType: 'generated',
        keywords: qa.keywords || []
      })),
      skipDuplicates: true
    });

    console.log(`💾 Saved ${savedCount.count} Q&A pairs to database`);

    return NextResponse.json({
      success: true,
      generated: allQAPairs.length,
      saved: savedCount.count,
      preview: allQAPairs.slice(0, 5)
    });

  } catch (error) {
    console.error("Q&A generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate Q&A pairs" },
      { status: 500 }
    );
  }
}

