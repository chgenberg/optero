import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization } = await request.json();
    
    if (!profession) {
      return NextResponse.json({ error: "Profession required" }, { status: 400 });
    }

    console.log(`🧪 Testing prompt generation for: ${profession} / ${specialization || 'N/A'}`);

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OPENAI_API_KEY not configured",
        step: "environment_check"
      }, { status: 500 });
    }

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connected');
    } catch (dbError) {
      return NextResponse.json({ 
        error: "Database connection failed",
        step: "database_check",
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 });
    }

    // Try to generate prompts
    const role = specialization || profession;
    const prompt = `Skapa 3 högkvalitativa AI-prompts för: ${role}

Format som JSON:
{
  "prompts": [
    {
      "category": "Test",
      "name": "Test prompt",
      "description": "Test description",
      "challenge": "Test challenge",
      "solution": "Test solution",
      "bestPractice": "Test best practice",
      "expectedOutcome": "Test outcome",
      "prompt": "Detta är en test-prompt för ${role}",
      "timeSaved": "1h/vecka",
      "difficulty": "Lätt",
      "example": "Test exempel",
      "howToUse": "1. Testa\\n2. Använd\\n3. Utvärdera",
      "tools": ["ChatGPT"],
      "tags": ["test"]
    }
  ]
}`;

    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 1,
      timeout: 60000,
    });

    console.log('🤖 Calling GPT-5...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a helpful assistant that responds in JSON format." },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 8000,
    });

    console.log('✅ GPT-5 response received');

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ 
        error: "Empty response from GPT-5",
        step: "ai_generation"
      }, { status: 500 });
    }

    const data = JSON.parse(content);
    const generatedPrompts = data.prompts || [];
    
    console.log(`📝 Parsed ${generatedPrompts.length} prompts`);

    // Try to save to database
    const savedPrompts = [];
    for (const promptData of generatedPrompts) {
      try {
        const saved = await prisma.promptLibrary.create({
          data: {
            profession,
            specialization: specialization || null,
            category: promptData.category,
            name: promptData.name,
            description: promptData.description,
            challenge: promptData.challenge,
            solution: promptData.solution,
            bestPractice: promptData.bestPractice,
            expectedOutcome: promptData.expectedOutcome,
            prompt: promptData.prompt,
            timeSaved: promptData.timeSaved,
            difficulty: promptData.difficulty,
            example: promptData.example || null,
            howToUse: promptData.howToUse || null,
            tools: promptData.tools || [],
            tags: promptData.tags || [],
            aiModel: "gpt-5",
            supportedModels: ["gpt-4", "gpt-5", "claude-3", "gemini"],
          },
        });
        savedPrompts.push(saved);
        console.log(`✅ Saved: ${saved.name}`);
      } catch (saveError) {
        console.error(`❌ Failed to save prompt:`, saveError);
        return NextResponse.json({ 
          error: "Failed to save prompt to database",
          step: "database_save",
          details: saveError instanceof Error ? saveError.message : String(saveError),
          promptData
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated and saved ${savedPrompts.length} prompts`,
      prompts: savedPrompts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category
      }))
    });

  } catch (error) {
    console.error("❌ Test prompt generation failed:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        step: "unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
