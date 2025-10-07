import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      taskSolutionsCount,
      promptLibraryCount,
      specializationsCount,
      commonTasksCount
    ] = await Promise.all([
      prisma.taskSolution.count(),
      prisma.promptLibrary.count(),
      prisma.professionSpecialization.count(),
      prisma.commonTasks.count()
    ]);

    // Get top professions from TaskSolution
    const topProfessions = await prisma.taskSolution.groupBy({
      by: ['profession'],
      _count: {
        profession: true
      },
      orderBy: {
        _count: {
          profession: 'desc'
        }
      },
      take: 10
    });

    // Get most used prompts
    const mostUsed = await prisma.taskSolution.findMany({
      select: {
        profession: true,
        task: true,
        hitCount: true,
        usedInAnalyses: true,
        language: true
      },
      orderBy: {
        hitCount: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      stats: {
        taskSolutions: taskSolutionsCount,
        promptLibrary: promptLibraryCount,
        specializations: specializationsCount,
        commonTasks: commonTasksCount,
        total: taskSolutionsCount + promptLibraryCount
      },
      topProfessions,
      mostUsed
    });
  } catch (error) {
    console.error("Error fetching DB stats:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch database statistics",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
