import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import promptTemplates from "@/data/prompt-templates.json";

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Starting import from prompt-templates.json...");

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const errors: string[] = [];

    const professions = (promptTemplates as any).professions || {};

    for (const [professionName, professionData] of Object.entries(professions) as [string, any][]) {
      console.log(`📝 Processing: ${professionName}`);

      const categories = professionData.categories || {};

      for (const [categoryName, prompts] of Object.entries(categories) as [string, any[]][]) {
        for (const promptData of prompts) {
          try {
            // Check if prompt already exists
            const existing = await prisma.promptLibrary.findFirst({
              where: {
                profession: professionName,
                name: promptData.name
              }
            });

            if (existing) {
              totalSkipped++;
              continue;
            }

            // Create the prompt
            await prisma.promptLibrary.create({
              data: {
                profession: professionName,
                specialization: null,
                category: categoryName,
                name: promptData.name,
                description: promptData.description,
                
                challenge: promptData.challenge || `Utmaning: ${promptData.description}`,
                solution: promptData.solution || `AI-driven lösning för ${professionName}`,
                bestPractice: promptData.bestPractice || promptData.howToUse || "Följ instruktionerna i prompten",
                expectedOutcome: promptData.expectedOutcome || `Sparar ${promptData.timeSaved}`,
                realWorldExample: promptData.example || null,
                
                prompt: promptData.prompt,
                
                timeSaved: promptData.timeSaved || "Tid osäker",
                difficulty: promptData.difficulty || "Medel",
                example: promptData.example || null,
                howToUse: promptData.howToUse || null,
                tools: promptData.tools || ["ChatGPT"],
                tags: [promptData.id, categoryName, professionName].filter(Boolean),
                
                agentReady: false,
                multiModal: false,
                
                aiModel: "manual",
                supportedModels: ["gpt-4", "gpt-5", "gpt-5-mini", "claude-3", "gemini"],
                
                language: "sv",
              },
            });

            totalCreated++;
          } catch (error) {
            totalErrors++;
            const errMsg = error instanceof Error ? error.message : String(error);
            errors.push(`${professionName} - ${promptData.name}: ${errMsg}`);
            console.error(`Error creating prompt "${promptData.name}":`, errMsg);
          }
        }
      }
    }

    console.log(`🎉 Import complete! Created: ${totalCreated}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);

    return NextResponse.json({
      success: true,
      message: "Import complete",
      stats: {
        created: totalCreated,
        skipped: totalSkipped,
        errors: totalErrors
      },
      errorDetails: errors.length > 0 ? errors.slice(0, 10) : [], // Only first 10 errors
    });
  } catch (error) {
    console.error("❌ Import failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Import failed",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
