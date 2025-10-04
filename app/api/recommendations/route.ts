import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, experience, challenges, tasks } = await request.json();

    if (!profession || !specialization) {
      return NextResponse.json(
        { error: "Saknar nödvändig information" },
        { status: 400 }
      );
    }

    const safeChallenges: string[] = Array.isArray(challenges) ? challenges : [];
    const safeTasks: { task: string; priority: number }[] = Array.isArray(tasks) ? tasks : [];

    // Create a deterministic cache key based on input
    const cacheInput = {
      profession: profession.toLowerCase().trim(),
      specialization: specialization.toLowerCase().trim(),
      tasks: safeTasks
        .sort((a, b) => a.task.localeCompare(b.task))
        .map(t => ({ task: t.task.toLowerCase().trim(), priority: t.priority }))
    };
    
    const cacheKey = createHash('sha256')
      .update(JSON.stringify(cacheInput))
      .digest('hex');

    // Check cache first
    if (process.env.DATABASE_URL) {
      try {
        const cached = await prisma.recommendationCache.findUnique({
          where: { cacheKey }
        });

        if (cached) {
          // Update hit count and last used
          await prisma.recommendationCache.update({
            where: { id: cached.id },
            data: { 
              hitCount: { increment: 1 },
              lastUsed: new Date()
            }
          });

          console.log(`Cache hit for ${profession}/${specialization}`);
          
          return NextResponse.json({
            scenarios: cached.scenarios,
            inferredTasks: cached.inferredTasks || [],
            recommendations: cached.recommendations,
            cached: true
          });
        }
      } catch (dbError) {
        console.error("Cache lookup error:", dbError);
        // Continue without cache
      }
    }

    // If not in cache, generate new recommendations
    const prioritizedTasks = safeTasks
      .sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0))
      .map((t) => `${t.task} (prioritet: ${t.priority === 5 ? 'HÖG' : t.priority === 3 ? 'MEDEL' : t.priority === 1 ? 'LÅG' : 'OKÄND'})`);

    const prompt = `Du är en expert på AI-verktyg och hur de kan användas i svenska yrken.

Användarprofil:
- Yrke: ${profession}
- Specialisering: ${specialization}
${experience ? `- Erfarenhetsnivå: ${experience}` : ''}
${safeChallenges.length > 0 ? `- Största utmaningar: ${safeChallenges.join(", ")}` : ''}
${prioritizedTasks.length > 0 ? `- Arbetsuppgifter (sorterade efter tid/prioritet):\n${prioritizedTasks.map((task) => `  * ${task}`).join('\n')}` : ''}

UPPDRAG:
Skapa en djupgående, värdefull analys för denna yrkesperson i Sverige.

Steg 1 – VERKLIGA SCENARION: Skapa EXAKT 3 realistiska, konkreta situationer från vardagen i detta yrke som kan lösas med AI. För varje scenario:
- title: Kort, slagkraftig rubrik
- situation: Detaljerad beskrivning av den verkliga utmaningen/situationen (2-3 meningar)
- solution: Utförlig beskrivning av hur AI löser detta (3-4 meningar, var specifik!)
- tools: Array med 2-3 verktygsnamn som kan användas

Steg 2 – INFERERA UPPGIFTER: Om inga uppgifter angivits, lista 6–10 vanliga arbetsuppgifter för denna roll i Sverige.

Steg 3 – REKOMMENDERA VERKTYG: Ge EXAKT 5 konkreta AI-verktyg. Var UTFÖRLIG och SPECIFIK:
1) name – Verktygets namn
2) description – Beskrivning (2-3 meningar, förklara VAD det gör)
3) useCase – Detaljerad användning för denna roll (3-4 meningar med konkreta exempel)
4) timeSaved – Realistisk tidsbesparing
5) difficulty – Lätt/Medel/Avancerad
6) link – Verklig länk
7) tips – Array med 4-6 MYCKET konkreta, hands-on tips (t.ex. exakta prompts att använda, specifika integrationer, steg-för-steg guides)

Svara ENDAST med giltig JSON:
{
  "scenarios": [
    {
      "title": "...",
      "situation": "...",
      "solution": "...",
      "tools": ["...", "..."]
    }
  ],
  "inferredTasks": ["..."],
  "recommendations": [
    {
      "name": "...",
      "description": "...",
      "useCase": "...",
      "timeSaved": "...",
      "difficulty": "Lätt/Medel/Avancerad",
      "link": "https://...",
      "tips": ["...", "...", "..."]
    }
  ]
}

Prioritera verktyg som:
- ChatGPT/Claude för dokumentation och kommunikation
- Branschspecifika AI-verktyg
- Automationsverktyg (Zapier, Make)
- Transkriptionsverktyg (Whisper, Otter.ai)
- Röststyrda assistenter för snabb dokumentation

Sortera rekommendationerna efter störst potentiell påverkan.`;

    let result: any = { scenarios: [], inferredTasks: [], recommendations: [] };

    const openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY,
          maxRetries: 2,
          timeout: 30000 // 30 seconds
        })
      : null;

    if (openai) {
      try {
        const response = await openai.responses.create({
          model: "gpt-5",
          input: prompt,
        });
        const content = typeof (response as any).output_text === "string" ? (response as any).output_text : "";
        if (content) {
          let parsed: any = null;
          try {
            parsed = JSON.parse(content);
          } catch {
            const match = content.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
          }

          if (parsed && typeof parsed === "object") {
            result.scenarios = Array.isArray(parsed.scenarios) ? parsed.scenarios : [];
            result.inferredTasks = Array.isArray(parsed.inferredTasks) ? parsed.inferredTasks : [];
            result.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

            // Save to cache if we have valid results
            if (process.env.DATABASE_URL && result.recommendations.length > 0) {
              try {
                await prisma.recommendationCache.create({
                  data: {
                    cacheKey,
                    profession,
                    specialization,
                    tasks: safeTasks,
                    experience,
                    challenges: safeChallenges,
                    recommendations: result.recommendations,
                    scenarios: result.scenarios,
                    inferredTasks: result.inferredTasks
                  }
                });
                console.log(`Cached new results for ${profession}/${specialization}`);
              } catch (cacheError) {
                console.error("Failed to cache results:", cacheError);
                // Continue anyway
              }
            }
          }
        }
      } catch (aiErr) {
        console.warn("AI recommendations failed, using fallback", aiErr);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    
    // More detailed error logging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = {
      error: "Failed to generate recommendations",
      message: errorMessage,
      type: error?.constructor?.name || "UnknownError",
      scenarios: [],
      inferredTasks: [],
      recommendations: []
    };
    
    // Check for specific error types
    if (errorMessage.includes("P1001") || errorMessage.includes("connection")) {
      errorDetails.error = "Database connection failed";
    } else if (errorMessage.includes("OPENAI_API_KEY")) {
      errorDetails.error = "AI service not configured";
    } else if (errorMessage.includes("rate limit")) {
      errorDetails.error = "Too many requests, please try again later";
    }
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}