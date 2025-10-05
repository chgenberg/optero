import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, experience, challenges, tasks, language = 'en' } = await request.json();

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

    const languageContext: Record<string, string> = {
      en: `You are an expert on AI tools and how they can be used in professional work. Create a deep, valuable analysis for this professional.`,
      sv: `Du är en expert på AI-verktyg och hur de kan användas i svenska yrken. Skapa en djupgående, värdefull analys för denna yrkesperson i Sverige.`,
      es: `Eres un experto en herramientas de IA y cómo se pueden usar en trabajos profesionales. Crea un análisis profundo y valioso para este profesional.`,
      fr: `Vous êtes un expert des outils IA et de leur utilisation dans le travail professionnel. Créez une analyse approfondie et précieuse pour ce professionnel.`,
      de: `Sie sind ein Experte für KI-Tools und deren Einsatz in der Berufswelt. Erstellen Sie eine tiefgehende, wertvolle Analyse für diesen Fachmann.`,
    };
    
    const prompt = `${languageContext[language] || languageContext.en}

User Profile:
- Profession: ${profession}
- Specialization: ${specialization}
${experience ? `- Experience level: ${experience}` : ''}
${safeChallenges.length > 0 ? `- Main challenges: ${safeChallenges.join(", ")}` : ''}
${prioritizedTasks.length > 0 ? `- Work tasks (sorted by priority):\n${prioritizedTasks.map((task) => `  * ${task}`).join('\n')}` : ''}

MISSION:
Create a deep, valuable analysis for this professional.

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
          timeout: 300000 // 5 minutes for GPT-5 quality analysis
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
                
                // Generate prompts SYNCHRONOUSLY so they're included in the response
                console.log('Generating prompts for scenarios...');
                const newPrompts = await generatePrompts(profession, specialization, safeTasks);
                console.log(`Generated ${newPrompts.length} new prompts`);
                
                // Get all prompts (existing + new)
                const allPrompts = await prisma.promptLibrary.findMany({
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
                  const relevantPrompts = allPrompts
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
                    const additionalPrompts = allPrompts
                      .filter(p => !relevantPrompts.includes(p))
                      .slice(0, 3 - relevantPrompts.length);
                    relevantPrompts.push(...additionalPrompts);
                  }
                  
                  return {
                    ...scenario,
                    prompts: relevantPrompts
                  };
                });
                
                result.prompts = allPrompts.slice(0, 10);
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

// Helper function to generate prompts synchronously
async function generatePrompts(profession: string, specialization: string, tasks: any[]) {
  try {
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
      "timeSaved": "X-Y tim/vecka",
      "difficulty": "Lätt|Medel|Avancerat",
      "example": "Verkligt exempel från en ${profession}",
      "howToUse": "1. Förberedelse\\n2. Kör prompten\\n3. Anpassa resultatet",
      "tools": ["ChatGPT", "Claude", "Gemini"],
      "tags": ["relevant", "sökord", "framtidssäker"]
    }
  ]
}`;

    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY!,
      maxRetries: 1,
      timeout: 60000,
    });

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

    return savedPrompts;
  } catch (error) {
    console.error("Error generating prompts:", error);
    return [];
  }
}