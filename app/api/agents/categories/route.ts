import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentTypeSlug = searchParams.get("agentType");

    if (!agentTypeSlug) {
      return NextResponse.json(
        { error: "agentType parameter required" },
        { status: 400 }
      );
    }

    // Get agent type
    const agentType = await prisma.agentType.findUnique({
      where: { slug: agentTypeSlug },
    });

    if (!agentType) {
      return NextResponse.json(
        { error: "Agent type not found" },
        { status: 404 }
      );
    }

    // Get main categories (parentId is null)
    const mainCategories = await prisma.agentCategory.findMany({
      where: {
        agentTypeId: agentType.id,
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            useCases: {
              select: {
                id: true,
                name: true,
                description: true,
                slug: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      agentType: {
        id: agentType.id,
        slug: agentType.slug,
        name: agentType.name,
      },
      categories: mainCategories,
    });
  } catch (error) {
    console.error("[agents/categories]", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
