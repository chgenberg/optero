import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const apiKey = request.headers.get("x-api-key");
    // if (apiKey !== process.env.ADMIN_API_KEY) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { type } = await request.json();

    let result: any = {};

    if (type === "tasks" || type === "all") {
      const deletedTasks = await prisma.commonTasks.deleteMany({});
      result.tasksDeleted = deletedTasks.count;
    }

    if (type === "recommendations" || type === "all") {
      const deletedRecommendations = await prisma.recommendationCache.deleteMany({});
      result.recommendationsDeleted = deletedRecommendations.count;
    }

    if (type === "specializations" || type === "all") {
      const deletedSpecializations = await prisma.professionSpecialization.deleteMany({});
      result.specializationsDeleted = deletedSpecializations.count;
    }

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      ...result,
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}

// GET endpoint för att se cache-stats innan rensning
export async function GET(request: NextRequest) {
  try {
    const tasksCount = await prisma.commonTasks.count();
    const recommendationsCount = await prisma.recommendationCache.count();
    const specializationsCount = await prisma.professionSpecialization.count();

    return NextResponse.json({
      cacheStats: {
        tasks: tasksCount,
        recommendations: recommendationsCount,
        specializations: specializationsCount,
        total: tasksCount + recommendationsCount + specializationsCount,
      },
    });
  } catch (error) {
    console.error("Get cache stats error:", error);
    return NextResponse.json(
      { error: "Failed to get cache stats" },
      { status: 500 }
    );
  }
}
