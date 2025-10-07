import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set longer timeout for batch processing
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 10, startFrom = 0 } = await request.json().catch(() => ({}));

    // Step 1: Fetch prompts from PromptLibrary
    const prompts = await prisma.promptLibrary.findMany({
      select: {
        profession: true,
        specialization: true,
        name: true,
        description: true,
        prompt: true,
        challenge: true,
        solution: true,
        language: true
      },
      skip: startFrom,
      take: batchSize
    });

    console.log(`Processing ${prompts.length} prompts starting from ${startFrom}`);

    if (prompts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No more prompts to process",
        processed: 0,
        nextBatch: null
      });
    }

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    // Step 2: Process each prompt
    for (const oldPrompt of prompts) {
      try {
        // Check if already exists in TaskSolution
        const existing = await prisma.taskSolution.findUnique({
          where: {
            profession_specialization_task_language: {
              profession: oldPrompt.profession,
              specialization: oldPrompt.specialization || "",
              task: oldPrompt.name,
              language: oldPrompt.language
            }
          }
        });

        if (existing) {
          console.log(`Skipping: ${oldPrompt.name} (already exists)`);
          skipped++;
          continue;
        }

        // Step 3: Reformat with GPT-5-mini for better structure
        const reformattedPrompt = await reformatPrompt(oldPrompt);

        // Step 4: Save to TaskSolution
        await prisma.taskSolution.create({
          data: {
            profession: oldPrompt.profession,
            specialization: oldPrompt.specialization || "",
            task: oldPrompt.name,
            solution: reformattedPrompt.solution,
            prompt: reformattedPrompt.prompt,
            language: oldPrompt.language,
            hitCount: 0,
            usedInAnalyses: 0
          }
        });

        processed++;
        console.log(`✓ Migrated: ${oldPrompt.name}`);

      } catch (error) {
        console.error(`Error processing ${oldPrompt.name}:`, error);
        errors++;
      }
    }

    const hasMore = prompts.length === batchSize;
    const nextBatch = hasMore ? startFrom + batchSize : null;

    return NextResponse.json({
      success: true,
      message: `Processed batch from ${startFrom}`,
      processed,
      skipped,
      errors,
      nextBatch,
      totalInBatch: prompts.length
    });

  } catch (error) {
    console.error("Error migrating prompts:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to migrate prompts",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

async function reformatPrompt(oldPrompt: any): Promise<{ solution: string; prompt: string }> {
  try {
    const systemPrompt = `Du är en expert på att skapa PEDAGOGISKA och LÄTTFÖRSTÅELIGA prompts.

Din uppgift är att ta en befintlig prompt och göra om den med:

1. **TYDLIG STRUKTUR** med fet text för rubriker
2. **[PLATSHÅLLARE]** i hakparenteser för allt användaren ska fylla i - markera dessa med gul bakgrund
3. **Steg-för-steg** så det är omöjligt att missförstå
4. **Konkreta exempel** på input OCH output

STRUKTUR:
**ROLL & KONTEXT:**
[Beskriv vem AI:n är]

**UPPGIFT:**
[Vad ska göras]

**INPUT - Fyll i detta:**
Parameter 1: [platshållare]
Parameter 2: [platshållare]

**OUTPUT-FORMAT:**
[Hur resultatet ska se ut]

**KVALITETSKRITERIER:**
- Kriterie 1
- Kriterie 2

**EXEMPEL:**
Input: [exempel]
Output: [exempel]

VIKTIGT: Använd [HAKPARENTESER] ENDAST för värden som användaren ska fylla i!`;

    const userPrompt = `Förbättra denna prompt:

TITEL: ${oldPrompt.name}
BESKRIVNING: ${oldPrompt.description}
UTMANING: ${oldPrompt.challenge}
NUVARANDE PROMPT:
${oldPrompt.prompt}

Returnera JSON:
{
  "solution": "En koncis beskrivning (2-3 meningar) av hur AI löser detta problem och vilken tidsbesparing det ger",
  "prompt": "Den omarbetade prompten med tydlig struktur, **fet text** för rubriker och [PLATSHÅLLARE] för användaren"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_completion_tokens: 2000
    });

    const content = completion.choices[0].message.content || "{}";
    
    // Extract JSON if wrapped
    let cleanedContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[1];
    }
    
    const result = JSON.parse(cleanedContent);
    
    return {
      solution: result.solution || oldPrompt.solution || oldPrompt.description,
      prompt: result.prompt || oldPrompt.prompt
    };

  } catch (error) {
    console.error("Error reformatting prompt:", error);
    // Fallback to original if GPT fails
    return {
      solution: oldPrompt.solution || oldPrompt.description,
      prompt: oldPrompt.prompt
    };
  }
}
