import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId parameter required" },
        { status: 400 }
      );
    }

    const useCases = await prisma.useCaseTemplate.findMany({
      where: {
        categoryId: categoryId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        systemPromptTemplate: true,
        exampleTasks: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });

    if (!useCases || useCases.length === 0) {
      return NextResponse.json(
        { error: "No use cases found for this category" },
        { status: 404 }
      );
    }

    return NextResponse.json({ useCases });
  } catch (error) {
    console.error("[agents/use-cases]", error);
    return NextResponse.json(
      { error: "Failed to fetch use cases" },
      { status: 500 }
    );
  }
}
