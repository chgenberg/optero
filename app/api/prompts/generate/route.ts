import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 1,
  timeout: 60000,
});

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, tasks } = await request.json();

    if (!profession) {
      return NextResponse.json({ error: "Profession required" }, { status: 400 });
    }

    // Check if we already have prompts for this profession
    const existingPrompts = await prisma.promptLibrary.findMany({
      where: {
        profession,
        specialization: specialization || null,
      },
      take: 20,
    });

    // If we have enough prompts, return them
    if (existingPrompts.length >= 10) {
      return NextResponse.json({ prompts: existingPrompts, source: "cached" });
    }

    // Generate new prompts
    const taskList = tasks?.map((t: any) => t.task || t).join(", ") || "";
    const role = specialization || profession;

    const prompt = `Skapa 10 högkvalitativa, praktiska AI-prompts för: ${role}

${taskList ? `Fokusera på dessa arbetsuppgifter: ${taskList}` : ''}

Varje prompt ska vara:
1. KONKRET och ANVÄNDBAR - kopiera och använd direkt
2. TIDSBESPARANDE - visa tydligt hur mycket tid det sparar
3. YRKESSPECIFIK - rätt terminologi för ${profession}
4. ACTIONABLE - ge tydliga instruktioner

Kategorier (fördela jämnt):
- Dokumentation & Rapportering
- Kommunikation & Mail  
- Planering & Organisering
- Analys & Beslutsfattande
- Kundbemötande

Svårighetsgrad:
- 60% Lätt
- 30% Medel
- 10% Avancerat

Format som JSON:
{
  "prompts": [
    {
      "category": "Kategori",
      "name": "Kort namn (max 60 tecken)",
      "description": "En mening om vad prompten gör",
      "prompt": "Den fullständiga prompten att kopiera",
      "timeSaved": "X-Y tim/vecka",
      "difficulty": "Lätt|Medel|Avancerat",
      "example": "Konkret exempel",
      "howToUse": "1. Steg ett\\n2. Steg två\\n3. Steg tre",
      "tools": ["ChatGPT", "Claude"],
      "tags": ["relevant", "sökord"]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    const generatedPrompts = data.prompts || [];

    // Save to database
    const savedPrompts = [];
    for (const promptData of generatedPrompts) {
      try {
        const saved = await prisma.promptLibrary.create({
          data: {
            profession,
            specialization,
            category: promptData.category,
            name: promptData.name,
            description: promptData.description,
            prompt: promptData.prompt,
            timeSaved: promptData.timeSaved,
            difficulty: promptData.difficulty,
            example: promptData.example,
            howToUse: promptData.howToUse,
            tools: promptData.tools || [],
            tags: promptData.tags || [],
          },
        });
        savedPrompts.push(saved);
      } catch (error) {
        console.error("Failed to save prompt:", error);
      }
    }

    return NextResponse.json({ 
      prompts: savedPrompts, 
      source: "generated",
      count: savedPrompts.length 
    });
  } catch (error) {
    console.error("Error generating prompts:", error);
    return NextResponse.json({ error: "Failed to generate prompts" }, { status: 500 });
  }
}
