import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import top500Data from "@/data/top-500-professions-europe.json";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 2,
  timeout: 120000,
});

export async function POST(request: NextRequest) {
  try {
    const { action = 'specializations', batchSize = 10, startIndex = 0 } = await request.json();
    
    // Get all professions from all categories
    const allProfessions: string[] = [];
    Object.values(top500Data.categories).forEach((categoryProfs: any) => {
      allProfessions.push(...categoryProfs);
    });

    console.log(`📊 Total professions: ${allProfessions.length}`);
    console.log(`🎯 Processing batch: ${startIndex} to ${startIndex + batchSize}`);

    const batch = allProfessions.slice(startIndex, startIndex + batchSize);
    const results = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    if (action === 'specializations') {
      // Generate specializations for professions
      for (const profession of batch) {
        try {
          console.log(`🔍 Checking: ${profession}`);
          
          // Check if already exists
          const existing = await prisma.professionSpecialization.findUnique({
            where: {
              profession_language: {
                profession,
                language: 'sv'
              }
            }
          });

          if (existing) {
            results.skipped++;
            results.details.push({ profession, status: 'skipped' });
            continue;
          }

          // Generate specializations with AI
          const prompt = `Du är karriärrådgivare i Sverige. Lista 6–12 vanliga inriktningar för yrket "${profession}". Returnera ENDAST JSON: {"specializations": ["..."]}. Använd svenska benämningar. Var branschspecifik. Ingen text utanför JSON.`;

          const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
              { role: "system", content: "You are a helpful assistant that responds in JSON format." },
              { role: "user", content: prompt }
            ],
            max_completion_tokens: 2000,
          });

          const content = response.choices[0]?.message?.content || "";
          const data = JSON.parse(content);
          const specializations = data.specializations || [];

          if (specializations.length > 0) {
            await prisma.professionSpecialization.create({
              data: {
                profession,
                language: 'sv',
                specializations: specializations,
                hitCount: 0
              }
            });

            results.created++;
            results.details.push({ 
              profession, 
              status: 'created', 
              specializations: specializations.length 
            });
            console.log(`  ✅ Created ${specializations.length} specializations`);
          }

          results.processed++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          results.errors++;
          results.details.push({ 
            profession, 
            status: 'error', 
            error: error instanceof Error ? error.message : String(error) 
          });
          console.error(`  ❌ Error for ${profession}:`, error);
        }
      }
    }

    const hasMore = (startIndex + batchSize) < allProfessions.length;
    const nextIndex = startIndex + batchSize;

    return NextResponse.json({
      success: true,
      message: `Batch complete: ${results.created} created, ${results.skipped} skipped, ${results.errors} errors`,
      results,
      progress: {
        current: startIndex + batch.length,
        total: allProfessions.length,
        percentage: Math.round(((startIndex + batch.length) / allProfessions.length) * 100),
        hasMore,
        nextIndex: hasMore ? nextIndex : null
      }
    });

  } catch (error) {
    console.error("❌ Seed failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Seed failed",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
