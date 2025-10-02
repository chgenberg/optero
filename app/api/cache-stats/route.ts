import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      error: "Cache not available",
      message: "Database connection not configured" 
    }, { status: 503 });
  }

  try {
    // Get cache statistics
    const totalCached = await prisma.recommendationCache.count();
    const recentHits = await prisma.recommendationCache.findMany({
      where: {
        lastUsed: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        hitCount: 'desc'
      },
      take: 10,
      select: {
        profession: true,
        specialization: true,
        hitCount: true,
        lastUsed: true
      }
    });

    const totalHits = await prisma.recommendationCache.aggregate({
      _sum: {
        hitCount: true
      }
    });

    return NextResponse.json({
      totalCached,
      totalHits: totalHits._sum.hitCount || 0,
      recentHits,
      cacheEnabled: true
    });
  } catch (error) {
    console.error("Error fetching cache stats:", error);
    return NextResponse.json({ 
      error: "Failed to fetch cache statistics",
      cacheEnabled: false 
    }, { status: 500 });
  }
}
