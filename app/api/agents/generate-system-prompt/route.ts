import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agentTypeId,
      selectedCategoryPath,
      selectedUseCases,
      onboardingResponses,
      companyData,
    } = body;

    if (!agentTypeId) {
      return NextResponse.json(
        { error: "agentTypeId required" },
        { status: 400 }
      );
    }

    // Get agent type info
    const agentType = await prisma.agentType.findUnique({
      where: { id: agentTypeId },
      select: {
        name: true,
        mascot: true,
        slug: true,
      },
    });

    if (!agentType) {
      return NextResponse.json(
        { error: "Agent type not found" },
        { status: 404 }
      );
    }

    // Get category path info for context
    let categoryContext = "";
    if (selectedCategoryPath && Array.isArray(selectedCategoryPath)) {
      const categories = await prisma.agentCategory.findMany({
        where: {
          slug: { in: selectedCategoryPath },
        },
        select: {
          name: true,
          description: true,
        },
      });
      categoryContext = categories
        .map((c) => `${c.name}: ${c.description}`)
        .join("\n");
    }

    // Build context for GPT
    const userResponses = onboardingResponses
      ? Object.entries(onboardingResponses)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")
      : "";

    const prompt = `Du är en expert på att skapa AI agent system prompts. 

Skapa en detaljerad och professionell system prompt för denna AI-agent:

AGENT INFO:
- Agent Type: ${agentType.name}
- Fokus Areas: ${categoryContext || selectedCategoryPath?.join(", ") || "Inte angiven"}

USER NEEDS:
${userResponses || "Ingen specifik data"}

COMPANY CONTEXT:
${
  companyData
    ? Object.entries(companyData)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    : "Inte angiven"
}

Din prompt ska:
1. Vara specifik för denna agenttyp
2. Inkludera användarens behov från onboarding
3. Ge tydliga instruktioner om agentens roll och ansvar
4. Inkludera tone of voice instruktioner
5. Inkludera eventuella begränsningar eller viktiga regler
6. Vara mellan 150-300 ord
7. Vara professionell och actionbar

Skriv direkt prompten utan några introduktioner eller förklaringar.`;

    const message = await openai.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const systemPrompt =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      systemPrompt,
      agentType: agentType.name,
    });
  } catch (error) {
    console.error("[agents/generate-system-prompt]", error);
    return NextResponse.json(
      { error: "Failed to generate system prompt" },
      { status: 500 }
    );
  }
}
