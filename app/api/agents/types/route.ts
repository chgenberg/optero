import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const agentTypes = await prisma.agentType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        mascot: true,
        color: true,
        onboardingPrompt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(agentTypes);
  } catch (error) {
    console.error("[agents/types]", error);
    return NextResponse.json(
      { error: "Failed to fetch agent types" },
      { status: 500 }
    );
  }
}
