import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function importPromptsFromJSON() {
  console.log("📥 Starting import from prompt-templates.json...\n");

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'data', 'prompt-templates.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  const professions = jsonData.professions || {};

  for (const [professionName, professionData] of Object.entries(professions) as [string, any][]) {
    console.log(`\n📝 Processing: ${professionName}`);

    const categories = professionData.categories || {};

    for (const [categoryName, prompts] of Object.entries(categories) as [string, any[]][]) {
      console.log(`  📂 Category: ${categoryName}`);

      for (const promptData of prompts) {
        try {
          // Check if prompt already exists (by id or name)
          const existing = await prisma.promptLibrary.findFirst({
            where: {
              OR: [
                {
                  profession: professionName,
                  name: promptData.name
                },
                ...(promptData.id ? [{
                  tags: {
                    array_contains: [promptData.id]
                  }
                }] : [])
              ]
            }
          });

          if (existing) {
            totalSkipped++;
            process.stdout.write('⊘');
            continue;
          }

          // Create the prompt
          await prisma.promptLibrary.create({
            data: {
              profession: professionName,
              specialization: null, // Can be added later if needed
              category: categoryName,
              name: promptData.name,
              description: promptData.description,
              
              // Value proposition fields (use description as fallback)
              challenge: promptData.challenge || `Utmaning: ${promptData.description}`,
              solution: promptData.solution || `AI-driven lösning för ${professionName}`,
              bestPractice: promptData.bestPractice || promptData.howToUse || "Följ instruktionerna i prompten",
              expectedOutcome: promptData.expectedOutcome || `Sparar ${promptData.timeSaved}`,
              realWorldExample: promptData.example || null,
              
              // The actual prompt
              prompt: promptData.prompt,
              
              // Metadata
              timeSaved: promptData.timeSaved || "Tid osäker",
              difficulty: promptData.difficulty || "Medel",
              example: promptData.example || null,
              howToUse: promptData.howToUse || null,
              tools: promptData.tools || ["ChatGPT"],
              tags: [promptData.id, categoryName, professionName].filter(Boolean),
              
              // Future-proofing
              agentReady: false,
              multiModal: false,
              
              // Model info
              aiModel: "manual", // Mark as manually created
              supportedModels: ["gpt-4", "gpt-5", "gpt-5-mini", "claude-3", "gemini"],
              
              // Language
              language: "sv",
            },
          });

          totalCreated++;
          process.stdout.write('✓');
        } catch (error) {
          totalErrors++;
          process.stdout.write('✗');
          console.error(`\n    Error creating prompt "${promptData.name}":`, error instanceof Error ? error.message : error);
        }
      }
    }
  }

  console.log(`\n\n🎉 Import complete!`);
  console.log(`✅ Created: ${totalCreated} prompts`);
  console.log(`⊘ Skipped (already exist): ${totalSkipped} prompts`);
  console.log(`✗ Errors: ${totalErrors} prompts`);
}

importPromptsFromJSON()
  .catch((error) => {
    console.error("\n❌ Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
