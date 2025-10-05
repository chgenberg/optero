import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const PROFESSIONS_TO_SEED = [
  { name: "Fastighetsmäklare", specializations: ["Bostadsmäklare", "Kommersiella fastigheter"] },
  { name: "Personlig tränare", specializations: ["PT på gym", "Online-coach"] },
  { name: "Restaurangchef", specializations: ["Fine dining", "Snabbmat"] },
  { name: "Apotekare", specializations: ["Öppenvårdsapotek", "Sjukhusapotek"] },
  { name: "Bibliotekarie", specializations: ["Folkbibliotek", "Universitetsbibliotek"] },
  { name: "Socialarbetare", specializations: ["Barn och unga", "Missbruksvård"] },
  { name: "Försäkringsrådgivare", specializations: ["Liv och pension", "Skadeförsäkring"] },
  { name: "Redaktör", specializations: ["Nyhetsmedia", "Förlagsredaktör"] },
  { name: "Produktchef", specializations: ["Tech/SaaS", "E-handel"] },
  { name: "UX Designer", specializations: ["Web/App", "Enterprise"] },
  { name: "Receptionist", specializations: ["Hotell", "Vårdcentral"] },
  { name: "Elektriker", specializations: ["Installation", "Service"] },
  { name: "VVS-montör", specializations: ["Installation", "Jour"] },
  { name: "Snickare", specializations: ["Möbelsnickare", "Byggsnickare"] },
  { name: "Frisör", specializations: ["Herrfrisör", "Damfrisör"] },
  { name: "Florist", specializations: ["Butiksflorist", "Event"] },
  { name: "Fotograf", specializations: ["Porträtt", "Event"] },
  { name: "Researrangör", specializations: ["Företagsresor", "Privatresor"] },
  { name: "Eventplanerare", specializations: ["Företagsevent", "Bröllop"] },
  { name: "Översättare", specializations: ["Teknisk", "Litterär"] },
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
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
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

  for (const prof of PROFESSIONS_TO_SEED) {
    console.log(`📝 Generating prompts for ${prof.name}...`);
    
    // Generate for main profession
    const mainPrompts = await generatePromptsForProfession(prof.name);
    
    for (const promptData of mainPrompts) {
      try {
        await prisma.promptLibrary.create({
          data: {
            profession: prof.name,
            category: promptData.category,
            name: promptData.name,
            description: promptData.description,
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
      } catch (error) {
        console.error(`Failed to create prompt: ${promptData.name}`, error);
      }
    }

    console.log(`✅ Created ${mainPrompts.length} prompts for ${prof.name}`);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n🎉 Seeding complete! Created ${totalCreated} prompts total.`);
}

seedPrompts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

