import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 2,
  timeout: 120000,
});

// Top 100 mest populära yrken i Europa
const TOP_100_PROFESSIONS = [
  "Sjuksköterska", "Lärare", "Läkare", "Advokat", "Ekonom", "Säljare", "Projektledare",
  "HR-specialist", "Marknadsförare", "Chef", "Undersköterska", "Redovisningsekonom",
  "Kundtjänstmedarbetare", "Butikssäljare", "Systemutvecklare", "Grafisk formgivare",
  "Journalist", "Arkitekt", "Psykolog", "Jurist", "Revisor", "Controller", "Rekryterare",
  "Kommunikatör", "Copywriter", "Eventkoordinator", "Inköpare", "Logistiker", "Tandläkare",
  "Fysioterapeut", "Arbetsterapeut", "Biomedicinsk analytiker", "Förskollärare", 
  "Gymnasielärare", "Specialpedagog", "Civilingenjör", "Maskiningenjör", "Elektroingenjör",
  "Elektriker", "Snickare", "VVS-montör", "Lastbilsförare", "Bussförare", "Restaurangchef",
  "Kock", "Servitör", "Hotellreceptionist", "Fastighetsmäklare", "Fastighetsskötare",
  "Produktionsledare", "Kvalitetsingenjör", "Försäljningschef", "Ekonomichef", "VD",
  "CFO", "CTO", "Affärsutvecklare", "Business analyst", "Data scientist", "Data analyst",
  "UX-designer", "Frontend-utvecklare", "Backend-utvecklare", "DevOps-ingenjör",
  "IT-säkerhetsspecialist", "Nätverkstekniker", "IT-support", "Scrum master", "Product owner",
  "Socionomn", "Kurator", "Behandlingsassistent", "Personlig assistent", "Familjerådgivare",
  "Handläggare", "Socialsekreterare", "Arbetsförmedlare", "Försäkringshandläggare",
  "Polis", "Brandman", "Väktare", "Personlig tränare", "Yogainstruktör", "Massör",
  "Frisör", "Skönhetsterapeut", "Nageltekniker", "Fotograf", "Videograf", "Webbdesigner",
  "Content manager", "SEO-specialist", "Social media manager", "Producent", "Redaktör",
  "Apotekare", "Farmaceut", "Dietist", "Veterinär", "Agronom", "Trädgårdsmästare"
];

export async function POST(request: NextRequest) {
  try {
    const { batchIndex = 0, professionsPerBatch = 5 } = await request.json();
    
    const startIdx = batchIndex * professionsPerBatch;
    const endIdx = Math.min(startIdx + professionsPerBatch, TOP_100_PROFESSIONS.length);
    const batch = TOP_100_PROFESSIONS.slice(startIdx, endIdx);
    
    console.log(`\n🚀 Batch ${batchIndex}: Processing professions ${startIdx} to ${endIdx-1}`);
    console.log(`📋 Professions: ${batch.join(', ')}`);
    
    const results = {
      batchIndex,
      processedProfessions: [] as string[],
      totalPromptsCreated: 0,
      totalPromptsSkipped: 0,
      errors: [] as string[],
    };

    for (const profession of batch) {
      try {
        console.log(`\n📝 Generating prompts for: ${profession}`);
        
        // Check how many prompts already exist
        const existingCount = await prisma.promptLibrary.count({
          where: { profession }
        });
        
        console.log(`  📊 Existing prompts: ${existingCount}`);
        
        // Only generate if less than 10 prompts exist
        if (existingCount >= 10) {
          console.log(`  ⊘ Skipping (already has ${existingCount} prompts)`);
          results.totalPromptsSkipped += 10;
          results.processedProfessions.push(profession);
          continue;
        }

        // Generate 10 prompts
        const prompt = `Skapa 10 högkvalitativa, praktiska AI-prompts för yrkesrollen: ${profession}.

Varje prompt ska vara:
1. KONKRET - användaren kan kopiera och använda direkt
2. TIDSBESPARANDE - visa hur mycket tid det sparar
3. YRKESSPECIFIK - använd rätt terminologi
4. VARIERAD SVÅRIGHETSGRAD - blanda lätt, medel, avancerat

Fördela över kategorier:
- Dokumentation & Rapportering (2-3 prompts)
- Kommunikation & Mail (2-3 prompts)  
- Planering & Organisering (2 prompts)
- Analys & Beslutsfattande (1-2 prompts)
- Kundbemötande/Samarbete (1-2 prompts)

Format som JSON:
{
  "prompts": [
    {
      "category": "Kategori",
      "name": "Kort beskrivande namn (max 60 tecken)",
      "description": "En mening om vad prompten gör",
      "challenge": "Vilken utmaning löser den?",
      "solution": "Hur löser prompten utmaningen?",
      "bestPractice": "Bästa sättet att använda",
      "expectedOutcome": "Vad användaren får",
      "prompt": "Den fullständiga prompten att kopiera",
      "timeSaved": "X-Y tim/vecka",
      "difficulty": "Lätt|Medel|Avancerat",
      "example": "Konkret exempel",
      "howToUse": "Steg-för-steg",
      "tools": ["ChatGPT", "Claude"],
      "tags": ["relevant", "sökord"]
    }
  ]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that responds in JSON format." },
            { role: "user", content: prompt }
          ],
          max_completion_tokens: 16000,
        });

        const content = response.choices[0]?.message?.content || "";
        const data = JSON.parse(content);
        const generatedPrompts = data.prompts || [];
        
        console.log(`  ✅ Generated ${generatedPrompts.length} prompts`);

        // Save to database
        let savedCount = 0;
        for (const promptData of generatedPrompts) {
          try {
            await prisma.promptLibrary.create({
              data: {
                profession,
                specialization: null,
                category: promptData.category,
                name: promptData.name,
                description: promptData.description,
                challenge: promptData.challenge || `Utmaning för ${profession}`,
                solution: promptData.solution || "AI-driven lösning",
                bestPractice: promptData.bestPractice || "Följ instruktionerna",
                expectedOutcome: promptData.expectedOutcome || `Sparar ${promptData.timeSaved}`,
                realWorldExample: promptData.example || null,
                prompt: promptData.prompt,
                timeSaved: promptData.timeSaved || "Tid osäker",
                difficulty: promptData.difficulty || "Medel",
                example: promptData.example || null,
                howToUse: promptData.howToUse || null,
                tools: promptData.tools || ["ChatGPT"],
                tags: promptData.tags || [profession],
                agentReady: false,
                multiModal: false,
                aiModel: "gpt-5-mini",
                supportedModels: ["gpt-4", "gpt-5", "gpt-5-mini", "claude-3", "gemini"],
                language: "sv",
              },
            });
            savedCount++;
          } catch (saveError) {
            console.error(`  ❌ Failed to save prompt: ${promptData.name}`);
          }
        }

        console.log(`  💾 Saved ${savedCount}/${generatedPrompts.length} prompts to database`);
        
        results.totalPromptsCreated += savedCount;
        results.processedProfessions.push(profession);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`  ❌ Error for ${profession}:`, error);
        results.errors.push(`${profession}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const hasMore = endIdx < TOP_100_PROFESSIONS.length;
    const nextBatchIndex = batchIndex + 1;
    const progress = Math.round((endIdx / TOP_100_PROFESSIONS.length) * 100);

    return NextResponse.json({
      success: true,
      message: `Batch ${batchIndex} complete`,
      results,
      progress: {
        processed: endIdx,
        total: TOP_100_PROFESSIONS.length,
        percentage: progress,
        hasMore,
        nextBatchIndex: hasMore ? nextBatchIndex : null,
      },
      stats: {
        estimatedCostSoFar: `$${((endIdx / TOP_100_PROFESSIONS.length) * 5).toFixed(2)}`,
        estimatedTotalCost: "$5-6",
      }
    });

  } catch (error) {
    console.error("❌ Bulk generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Bulk generation failed",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
