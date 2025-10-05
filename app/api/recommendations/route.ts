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
          
          // Get related prompts for this profession/specialization
          const prompts = await prisma.promptLibrary.findMany({
            where: {
              profession,
              specialization: specialization || null,
            },
            orderBy: [
              { usageCount: 'desc' },
              { createdAt: 'desc' }
            ],
            take: 30 // Get more to distribute among scenarios
          });
          
          // Enhance scenarios with relevant prompts (type-safe)
          const scenariosArray: any[] = Array.isArray(cached.scenarios) ? cached.scenarios : [];
          const enhancedScenarios = scenariosArray.map((scenario: any) => {
            // Find 3 most relevant prompts for this scenario
            const relevantPrompts = prompts
              .filter(p => {
                const tags = Array.isArray(p.tags) ? p.tags : [];
                return tags.some((tag: any) => 
                  scenario.title.toLowerCase().includes(String(tag).toLowerCase()) ||
                  scenario.solution.toLowerCase().includes(String(tag).toLowerCase())
                ) ||
                p.category.toLowerCase().includes(scenario.title.split(' ')[0].toLowerCase());
              })
              .slice(0, 3);
            
            // If not enough relevant prompts, add some general ones
            if (relevantPrompts.length < 3) {
              const additionalPrompts = prompts
                .filter(p => !relevantPrompts.includes(p))
                .slice(0, 3 - relevantPrompts.length);
              relevantPrompts.push(...additionalPrompts);
            }
            
            return {
              ...scenario,
              prompts: relevantPrompts
            };
          });
          
          return NextResponse.json({
            scenarios: enhancedScenarios,
            inferredTasks: cached.inferredTasks || [],
            recommendations: cached.recommendations,
            prompts: prompts.slice(0, 10), // Also include top 10 general prompts
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
          maxRetries: 1,
          timeout: 180000 // 3 minutes for GPT-5 quality analysis
        })
      : null;

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            { 
              role: "system", 
              content: "You are a helpful assistant that responds in JSON format." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          max_completion_tokens: 16000, // GPT-5 uses default temperature (1)
        });
        const content = response.choices[0]?.message?.content || "";
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
                
                // ALWAYS generate 10 new prompts based on specific tasks (non-blocking)
                // This ensures we build a diverse library even for same profession/specialization
                generatePromptsInBackground(profession, specialization, safeTasks).catch(console.error);
                
                // Get any existing prompts while we wait for new ones
                const existingPrompts = await prisma.promptLibrary.findMany({
                  where: {
                    profession,
                    specialization: specialization || null,
                  },
                  orderBy: [
                    { usageCount: 'desc' },
                    { createdAt: 'desc' }
                  ],
                  take: 30
                });
                
                // Enhance scenarios with prompts
                result.scenarios = result.scenarios.map((scenario: any) => {
                  const relevantPrompts = existingPrompts
                    .filter(p => {
                      const tags = Array.isArray(p.tags) ? p.tags : [];
                      return tags.some((tag: any) => 
                        scenario.title.toLowerCase().includes(String(tag).toLowerCase()) ||
                        scenario.solution.toLowerCase().includes(String(tag).toLowerCase())
                      ) ||
                      p.category.toLowerCase().includes(scenario.title.split(' ')[0].toLowerCase());
                    })
                    .slice(0, 3);
                  
                  if (relevantPrompts.length < 3) {
                    const additionalPrompts = existingPrompts
                      .filter(p => !relevantPrompts.includes(p))
                      .slice(0, 3 - relevantPrompts.length);
                    relevantPrompts.push(...additionalPrompts);
                  }
                  
                  return {
                    ...scenario,
                    prompts: relevantPrompts
                  };
                });
                
                result.prompts = existingPrompts.slice(0, 10);
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

// Helper function to trigger prompt generation in background
async function generatePromptsInBackground(profession: string, specialization: string, tasks: any[]) {
  // Don't await - run in background
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/prompts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profession, specialization, tasks })
  }).catch(err => console.log('Background prompt generation failed:', err));
}