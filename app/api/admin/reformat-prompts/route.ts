import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 10, offset = 0 } = await request.json();

    // Fetch a batch of prompts
    const prompts = await prisma.taskSolution.findMany({
      skip: offset,
      take: batchSize,
      orderBy: {
        createdAt: "asc",
      },
    });

    if (prompts.length === 0) {
      return NextResponse.json({
        message: "Alla prompts är omformaterade!",
        processed: 0,
        total: offset,
      });
    }

    console.log(`📝 Reformaterar ${prompts.length} prompts...`);

    let successCount = 0;
    let errorCount = 0;

    // Process each prompt
    for (const prompt of prompts) {
      try {
        // Check if prompt already has modern formatting (has ** for headings)
        // Look for **ROLL** or **UPPGIFT** or **INPUT** as signs of modern format
        const hasModernFormat = prompt.prompt.includes("**ROLL") || 
                                prompt.prompt.includes("**UPPGIFT") || 
                                prompt.prompt.includes("**INPUT");
        
        if (hasModernFormat) {
          console.log(`✅ Skip (redan formaterad): ${prompt.task}`);
          successCount++;
          continue;
        }

        console.log(`🔄 Reformaterar: ${prompt.task}`);

        // Reformat with GPT-5-mini
        const completion = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            {
              role: "system",
              content: `Du är en expert på att skapa pedagogiska AI-prompts.

Din uppgift är att ta en befintlig prompt och omformatera den till ett MYCKET tydligare format.

REGLER FÖR OMFORMATERING:
1. **Använd fet text** för alla rubriker och viktiga ord
2. Använd [HAKPARENTESER] för ALLA värden som användaren ska fylla i
3. Dela upp i tydliga sektioner
4. Lägg till konkreta exempel där det saknas
5. Gör det OMÖJLIGT att missförstå vad som ska fyllas i

STRUKTUR SOM SKA ANVÄNDAS:

**ROLL & KONTEXT:**
[Beskriv vilken expertroll AI:n ska ha]

**UPPGIFT:**
[Vad ska göras?]

**INPUT - Fyll i detta:**
Parameter 1: [ditt värde]
Parameter 2: [ditt värde]
(etc...)

**OUTPUT-FORMAT:**
[Hur ska resultatet se ut?]
1) [Del 1]
2) [Del 2]

**KVALITETSKRITERIER:**
- [Kriterie 1]
- [Kriterie 2]

**EXEMPEL:**
Input: [Konkret exempel]
Output: [Förväntat resultat]

VIKTIGT:
- Behåll ALLT innehåll från originalet
- Gör bara texten tydligare och mer strukturerad
- [HAKPARENTESER] BARA på värden som användaren ska ändra
- Lägg ALLTID till exempel om det saknas`,
            },
            {
              role: "user",
              content: `Omformatera denna prompt till det nya pedagogiska formatet:

ORIGINAL PROMPT:
${prompt.prompt}

PROFESSION: ${prompt.profession}
UPPGIFT: ${prompt.task}
LÖSNING: ${prompt.solution}

Svara ENDAST med den omformaterade prompten. Ingen extra text.`,
            },
          ],
          max_completion_tokens: 2000,
        });

        const reformattedPrompt = completion.choices[0].message.content || prompt.prompt;

        // Update in database
        await prisma.taskSolution.update({
          where: { id: prompt.id },
          data: {
            prompt: reformattedPrompt,
            updatedAt: new Date(),
          },
        });

        console.log(`✅ Uppdaterad: ${prompt.task}`);
        successCount++;

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Fel vid omformatering av ${prompt.task}:`, error);
        errorCount++;
      }
    }

    // Get total count for progress tracking
    const totalCount = await prisma.taskSolution.count();

    return NextResponse.json({
      message: `Batch klar: ${successCount} lyckades, ${errorCount} misslyckades`,
      processed: offset + prompts.length,
      total: totalCount,
      success: successCount,
      errors: errorCount,
      hasMore: offset + prompts.length < totalCount,
    });
  } catch (error) {
    console.error("Error reformatting prompts:", error);
    return NextResponse.json(
      { error: "Failed to reformat prompts", details: String(error) },
      { status: 500 }
    );
  }
}
