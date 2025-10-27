import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      botId,
      agentTypeId,
      selectedCategoryPath,
      selectedUseCases,
      onboardingResponses,
      generatedContext,
      systemPrompt,
    } = body;

    if (!botId || !agentTypeId) {
      return NextResponse.json(
        { error: "botId and agentTypeId required" },
        { status: 400 }
      );
    }

    // Create or update agent profile
    const profile = await prisma.agentProfile.upsert({
      where: { botId },
      update: {
        selectedCategoryPath,
        selectedUseCases,
        onboardingResponses,
        generatedContext,
        systemPrompt,
        onboardingCompleted: true,
      },
      create: {
        botId,
        agentTypeId,
        selectedCategoryPath,
        selectedUseCases,
        onboardingResponses,
        generatedContext,
        systemPrompt,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[agents/profile POST]", error);
    return NextResponse.json(
      { error: "Failed to create/update agent profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get("botId");

    if (!botId) {
      return NextResponse.json(
        { error: "botId parameter required" },
        { status: 400 }
      );
    }

    const profile = await prisma.agentProfile.findUnique({
      where: { botId },
      include: {
        agentType: {
          select: {
            id: true,
            slug: true,
            name: true,
            mascot: true,
            color: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[agents/profile GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch agent profile" },
      { status: 500 }
    );
  }
}
