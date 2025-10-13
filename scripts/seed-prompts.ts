import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Phase 1: Most popular professions (start small for testing)
const PROFESSIONS_TO_SEED = [
  "Fastighetsmäklare",
  "Personlig tränare",
  "Restaurangchef",
  "Receptionist",
  "Elektriker",
];

const CATEGORIES = [
  "Dokumentation & Rapportering",
  "Kommunikation & Mail",
  "Planering & Organisering",
  "Analys & Beslutsfattande",
  "Kundbemötande",
  "Administration",
  "Kreativt arbete",
];

async function generatePromptsForProfession(profession: string, specialization?: string) {
  const prompt = `Skapa 20 högkvalitativa, praktiska AI-prompts för yrkesrollen: ${profession}${specialization ? ` (${specialization})` : ''}.

Varje prompt ska vara:
1. KONKRET och ACTIONABLE - användaren ska kunna kopiera och använda direkt
2. TIDSBESPARANDE - tydligt visa hur mycket tid det sparar
3. YRKESSPECIFIK - använd rätt terminologi och situationer för yrket
4. VARIERAD SVÅRIGHETSGRAD - blanda lätta, medelsvåra och avancerade

Fördela promptsen över dessa kategorier:
- Dokumentation & Rapportering (3-4 prompts)
- Kommunikation & Mail (3-4 prompts)
- Planering & Organisering (3-4 prompts)
- Analys & Beslutsfattande (2-3 prompts)
- Kundbemötande (2-3 prompts)
- Administration (2-3 prompts)
- Kreativt arbete (1-2 prompts)

Format som JSON:
{
  "prompts": [
    {
      "category": "Kategori",
      "name": "Kort beskrivande namn",
      "description": "En mening om vad prompten gör",
      "prompt": "Den fullständiga promoten som användaren kopierar",
      "timeSaved": "X-Y tim/vecka eller min/dag",
      "difficulty": "Lätt|Medel|Avancerat",
      "example": "Konkret exempel på input/output",
      "howToUse": "Steg-för-steg instruktioner",
      "tools": ["ChatGPT", "Claude", etc],
      "tags": ["relevant", "sökord"]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 4000,
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    return data.prompts || [];
  } catch (error) {
    console.error(`Failed to generate prompts for ${profession}:`, error);
    return [];
  }
}

async function seedPrompts() {
  console.log("🌱 Starting prompt seeding...\n");
  let totalCreated = 0;

  for (const professionName of PROFESSIONS_TO_SEED) {
    console.log(`📝 Generating prompts for ${professionName}...`);
    
    // Generate for main profession
    const mainPrompts = await generatePromptsForProfession(professionName);
    
    for (const promptData of mainPrompts) {
      try {
        await prisma.promptLibrary.create({
          data: {
            profession: professionName,
            category: promptData.category,
            name: promptData.name,
            description: promptData.description,
            challenge: promptData.challenge || "Standard utmaning för detta yrke",
            solution: promptData.solution || "AI-driven lösning",
            bestPractice: promptData.bestPractice || "Följ instruktionerna steg för steg",
            expectedOutcome: promptData.expectedOutcome || "Tidsbesparande resultat",
            prompt: promptData.prompt,
            timeSaved: promptData.timeSaved,
            difficulty: promptData.difficulty,
            example: promptData.example,
            howToUse: promptData.howToUse,
            tools: promptData.tools || [],
            tags: promptData.tags || [],
          },
        });
        totalCreated++;
        process.stdout.write('.');
      } catch (error) {
        console.error(`\nFailed to create prompt: ${promptData.name}`, error);
      }
    }

    console.log(`\n✅ Created ${mainPrompts.length} prompts for ${professionName}`);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\n🎉 Seeding complete! Created ${totalCreated} prompts total.`);
}

seedPrompts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

