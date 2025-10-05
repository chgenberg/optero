import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 1,
  timeout: 60000,
});

const SUPPORTED_LANGUAGES = {
  sv: "Swedish",
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
};

export async function POST(request: NextRequest) {
  try {
    const { promptId, targetLanguages } = await request.json();

    if (!promptId) {
      return NextResponse.json({ error: "Prompt ID required" }, { status: 400 });
    }

    // Get the original prompt
    const prompt = await prisma.promptLibrary.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Determine which languages to translate to
    const languagesToTranslate = targetLanguages || Object.keys(SUPPORTED_LANGUAGES).filter(lang => lang !== prompt.language);

    const translations: any = prompt.translations || {};

    // Translate to each language
    for (const targetLang of languagesToTranslate) {
      if (targetLang === prompt.language) continue; // Skip original language
      if (translations[targetLang]) continue; // Skip if already translated

      const translationPrompt = `Translate the following AI prompt content from ${SUPPORTED_LANGUAGES[prompt.language as keyof typeof SUPPORTED_LANGUAGES]} to ${SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES]}.

IMPORTANT: 
- Maintain professional tone
- Keep technical terms accurate
- Adapt cultural references appropriately
- Preserve formatting and structure
- Make it sound natural, not machine-translated

Original content:
{
  "name": "${prompt.name}",
  "description": "${prompt.description}",
  "challenge": "${prompt.challenge}",
  "solution": "${prompt.solution}",
  "bestPractice": "${prompt.bestPractice}",
  "expectedOutcome": "${prompt.expectedOutcome}",
  "prompt": "${prompt.prompt.replace(/"/g, '\\"')}"
}

Return ONLY valid JSON with the translated content in the same structure.`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            { role: "system", content: "You are a professional translator that responds in JSON format." },
            { role: "user", content: translationPrompt }
          ],
          max_completion_tokens: 8000,
        });

        const translatedContent = JSON.parse(response.choices[0]?.message?.content || "{}");
        translations[targetLang] = translatedContent;

        console.log(`Translated prompt ${promptId} to ${targetLang}`);
      } catch (error) {
        console.error(`Failed to translate to ${targetLang}:`, error);
      }
    }

    // Update the prompt with translations
    const updatedPrompt = await prisma.promptLibrary.update({
      where: { id: promptId },
      data: {
        translations,
        translatedAt: new Date(),
        autoTranslated: true,
      },
    });

    return NextResponse.json({
      success: true,
      promptId,
      translatedLanguages: Object.keys(translations),
      translations,
    });
  } catch (error) {
    console.error("Error translating prompt:", error);
    return NextResponse.json({ error: "Failed to translate prompt" }, { status: 500 });
  }
}

// Batch translate multiple prompts
export async function PUT(request: NextRequest) {
  try {
    const { profession, targetLanguages } = await request.json();

    // Get all prompts for this profession that haven't been translated
    const prompts = await prisma.promptLibrary.findMany({
      where: {
        profession,
        autoTranslated: false,
      },
      take: 50, // Limit to avoid timeouts
    });

    console.log(`Batch translating ${prompts.length} prompts for ${profession}`);

    const results = [];
    for (const prompt of prompts) {
      try {
        // Call the translate endpoint for each prompt
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/prompts/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptId: prompt.id, targetLanguages }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push(data);
        }
      } catch (error) {
        console.error(`Failed to translate prompt ${prompt.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      translatedCount: results.length,
      totalPrompts: prompts.length,
      results,
    });
  } catch (error) {
    console.error("Error batch translating prompts:", error);
    return NextResponse.json({ error: "Failed to batch translate" }, { status: 500 });
  }
}
