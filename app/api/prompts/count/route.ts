import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profession = searchParams.get("profession");
    const specialization = searchParams.get("specialization");

    // Get total count
    const totalCount = await prisma.promptLibrary.count();

    // Get count by profession if specified
    let professionCount = 0;
    let recentPrompts: any[] = [];
    
    if (profession) {
      const where: any = { profession };
      if (specialization) {
        where.specialization = specialization;
      }
      
      professionCount = await prisma.promptLibrary.count({ where });
      
      // Get 5 most recent prompts for this profession
      recentPrompts = await prisma.promptLibrary.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          category: true,
          createdAt: true,
          usageCount: true,
        }
      });
    }

    // Get all professions with counts
    const allPrompts = await prisma.promptLibrary.findMany({
      select: {
        profession: true,
        specialization: true,
      }
    });

    const professionCounts: Record<string, number> = {};
    allPrompts.forEach(p => {
      const key = p.specialization ? `${p.profession} (${p.specialization})` : p.profession;
      professionCounts[key] = (professionCounts[key] || 0) + 1;
    });

    return NextResponse.json({
      totalCount,
      professionCount,
      recentPrompts,
      professionCounts,
      message: totalCount === 0 
        ? "No prompts in database yet" 
        : `Found ${totalCount} prompts in database`
    });
  } catch (error) {
    console.error("Error counting prompts:", error);
    return NextResponse.json({ 
      error: "Failed to count prompts",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
