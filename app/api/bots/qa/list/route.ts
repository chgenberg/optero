import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// List Q&A pairs for a bot
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');
    const category = searchParams.get('category');
    const verified = searchParams.get('verified');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!botId) {
      return NextResponse.json(
        { error: "botId required" },
        { status: 400 }
      );
    }

    const where: any = { botId };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (verified === 'true') {
      where.verified = true;
    } else if (verified === 'false') {
      where.verified = false;
    }

    const qaList = await prisma.botQA.findMany({
      where,
      orderBy: [
        { verified: 'desc' },
        { confidence: 'desc' },
        { hitCount: 'desc' }
      ],
      take: limit
    });

    // Get statistics
    const stats = await prisma.botQA.groupBy({
      by: ['category'],
      where: { botId },
      _count: { id: true }
    });

    const totalCount = await prisma.botQA.count({ where: { botId } });
    const verifiedCount = await prisma.botQA.count({ 
      where: { botId, verified: true } 
    });

    return NextResponse.json({
      success: true,
      qaList,
      stats: {
        total: totalCount,
        verified: verifiedCount,
        byCategory: stats.reduce((acc: any, item: any) => {
          acc[item.category] = item._count.id;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error("Q&A list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Q&A pairs" },
      { status: 500 }
    );
  }
}

