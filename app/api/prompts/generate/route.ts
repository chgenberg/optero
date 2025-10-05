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

    // Check existing prompts to avoid duplicates
    const existingPrompts = await prisma.promptLibrary.findMany({
      where: {
        profession,
        specialization: specialization || null,
      },
      select: {
        name: true,
        prompt: true,
      },
    });

    // We ALWAYS generate new prompts based on specific tasks
    // This builds a diverse library even for same profession/specialization

    // Generate new prompts
    const taskList = tasks?.map((t: any) => t.task || t).join(", ") || "";
    const role = specialization || profession;

    const existingPromptNames = existingPrompts.map(p => p.name).join(", ");
    
    const prompt = `Skapa 10 högkvalitativa, värdefulla AI-prompts för: ${role}

${taskList ? `Fokusera SPECIFIKT på dessa arbetsuppgifter: ${taskList}` : ''}

${existingPromptNames ? `VIKTIGT: Vi har redan dessa prompts - skapa HELT NYA och OLIKA prompts:\n${existingPromptNames}\n` : ''}

KRAV:
1. Prompterna MÅSTE vara unika och fokusera på de specifika arbetsuppgifterna
2. Variera perspektiv och användningsfall
3. Tänk på framtidssäkring - fungerar med både dagens AI och framtidens AI-agenter
4. Skapa prompts som löser OLIKA delar av arbetsuppgifterna

Varje prompt ska inkludera:
1. UTMANING - Vilken specifik smärtpunkt löser denna prompt?
2. LÖSNING - Hur exakt löser prompten problemet?
3. BEST PRACTICE - Bästa sättet att använda prompten
4. FÖRVÄNTAT RESULTAT - Vad får användaren ut av detta?
5. FRAMTIDSSÄKER - Fungerar med agenter och automation

Kategorier (fördela jämnt):
- Dokumentation & Rapportering
- Kommunikation & Mail  
- Planering & Organisering
- Analys & Beslutsfattande
- Kundbemötande

Format som JSON:
{
  "prompts": [
    {
      "category": "Kategori",
      "name": "Kort namn (max 60 tecken)",
      "description": "En mening om vad prompten gör",
      "challenge": "Detaljerad beskrivning av utmaningen/problemet som ${profession} möter dagligen",
      "solution": "Hur denna prompt löser utmaningen på ett smart sätt",
      "bestPractice": "Steg-för-steg guide för bästa resultat",
      "expectedOutcome": "Konkret beskrivning av vad användaren kan förvänta sig",
      "prompt": "Den fullständiga prompten att kopiera (optimerad för GPT-5)",
      "promptVariants": {
        "gpt4": "Variant för GPT-4",
        "claude": "Variant för Claude",
        "gemini": "Variant för Gemini"
      },
      "timeSaved": "X-Y tim/vecka",
      "difficulty": "Lätt|Medel|Avancerat",
      "example": "Verkligt exempel från en ${profession}",
      "howToUse": "1. Förberedelse\\n2. Kör prompten\\n3. Anpassa resultatet",
      "tools": ["ChatGPT", "Claude", "Gemini"],
      "tags": ["relevant", "sökord", "framtidssäker"],
      "agentReady": true/false,
      "multiModal": true/false,
      "automation": {
        "zapier": "Webhook URL för automation",
        "make": "Scenario template"
      }
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a helpful assistant that responds in JSON format." },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 16000,
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
            challenge: promptData.challenge,
            solution: promptData.solution,
            bestPractice: promptData.bestPractice,
            expectedOutcome: promptData.expectedOutcome,
            prompt: promptData.prompt,
            promptVariants: promptData.promptVariants || {},
            agentReady: promptData.agentReady || false,
            multiModal: promptData.multiModal || false,
            automation: promptData.automation || null,
            timeSaved: promptData.timeSaved,
            difficulty: promptData.difficulty,
            example: promptData.example,
            howToUse: promptData.howToUse,
            tools: promptData.tools || [],
            tags: promptData.tags || [],
            aiModel: "gpt-5",
            supportedModels: ["gpt-4", "gpt-5", "claude-3", "gemini"],
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
