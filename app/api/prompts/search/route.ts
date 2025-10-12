export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profession = searchParams.get("profession");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const language = searchParams.get("language") || "sv";

    // Build query conditions
    const where: any = {
      language,
    };

    if (profession) {
      where.profession = profession;
    }

    if (search) {
      where.OR = [
        { task: { contains: search, mode: "insensitive" } },
        { solution: { contains: search, mode: "insensitive" } },
        { prompt: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get prompts with proper grouping
    const prompts = await prisma.taskSolution.findMany({
      where,
      orderBy: [
        { hitCount: "desc" },
        { usedInAnalyses: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    // Get unique professions
    const professions = await prisma.taskSolution.groupBy({
      by: ["profession"],
      where: { language },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get most popular prompts across all professions
    const popularPrompts = await prisma.taskSolution.findMany({
      where: { language },
      orderBy: {
        hitCount: "desc",
      },
      take: 10,
    });

    // Get related prompts if a profession is selected
    let relatedPrompts: any[] = [];
    if (profession) {
      relatedPrompts = await prisma.taskSolution.findMany({
        where: {
          profession,
          language,
        },
        orderBy: {
          hitCount: "desc",
        },
        take: 5,
      });
    }

    return NextResponse.json({
      prompts,
      professions: professions.map((p) => ({
        name: p.profession,
        count: p._count.id,
      })),
      popularPrompts,
      relatedPrompts,
      total: prompts.length,
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}
