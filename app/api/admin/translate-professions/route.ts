import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import top500 from "@/data/top-500-professions-europe.json";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 2,
  timeout: 120000,
});

export async function POST(request: NextRequest) {
  try {
    const { language = 'en' } = await request.json();
    
    console.log(`🌍 Translating professions to ${language}...`);

    // Get all professions from all categories
    const allProfessions: string[] = [];
    const categoryMap: Record<string, string[]> = {};
    
    Object.entries(top500.categories).forEach(([category, profs]: [string, any]) => {
      allProfessions.push(...profs);
      categoryMap[category] = profs;
    });

    const languagePrompts: Record<string, string> = {
      en: `Translate these Swedish profession names to professional English terminology. Return as JSON array: {"professions": ["...", "..."]}`,
      es: `Translate these Swedish profession names to professional Spanish terminology. Return as JSON array: {"professions": ["...", "..."]}`,
      fr: `Translate these Swedish profession names to professional French terminology. Return as JSON array: {"professions": ["...", "..."]}`,
      de: `Translate these Swedish profession names to professional German terminology. Return as JSON array: {"professions": ["...", "..."]}`,
    };

    const translatedCategories: Record<string, string[]> = {};

    // Translate category by category (to handle large dataset)
    for (const [categoryName, professions] of Object.entries(categoryMap)) {
      console.log(`  📂 Translating category: ${categoryName} (${professions.length} professions)`);
      
      const prompt = `${languagePrompts[language] || languagePrompts.en}

Swedish profession names:
${professions.join('\n')}

Return ONLY valid JSON in this format:
{"professions": ["translated name 1", "translated name 2", ...]}`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: "You are a professional translator specializing in occupational titles. Always respond with valid JSON." },
            { role: "user", content: prompt }
          ],
          max_completion_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content || "";
        const data = JSON.parse(content);
        translatedCategories[categoryName] = data.professions || professions;
        
        console.log(`    ✅ Translated ${data.professions.length} professions`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`    ❌ Failed to translate ${categoryName}:`, error);
        translatedCategories[categoryName] = professions; // Fallback to Swedish
      }
    }

    // Format as professions-comprehensive structure
    const allTranslated: any[] = [];
    Object.values(translatedCategories).forEach(profs => {
      profs.forEach(prof => {
        allTranslated.push({
          name: prof,
          description: "", // Can be filled later if needed
          category: "" // Can be mapped later if needed
        });
      });
    });

    const result = {
      version: "2.0",
      language,
      totalProfessions: allTranslated.length,
      professions: allTranslated
    };

    return NextResponse.json({
      success: true,
      language,
      totalProfessions: allTranslated.length,
      data: result,
      categorized: translatedCategories
    });

  } catch (error) {
    console.error("❌ Translation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Translation failed",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
