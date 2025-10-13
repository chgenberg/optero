import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Get all public bots
    const publicBots = await prisma.bot.findMany({
      where: {
        isActive: true,
        isPublic: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: {
            usages: true,
            sessions: true
          }
        }
      }
    });

    // Mock ratings for now (implement BotRating model later)
    const botsWithStats = publicBots.map(b => {
      const spec = b.spec as any;
      return {
        id: b.id,
        name: b.name,
        type: b.type,
        description: spec.problem || 'Bot template',
        companyUrl: b.companyUrl,
        installs: b.cloneCount,
        rating: 4.5, // Calculate from BotRating later
        reviewCount: 0, // Count from BotRating later
        createdBy: spec.brand?.companyName || 'Anonymous',
        isVerified: Math.random() > 0.7 // Mock verification
      };
    });

    return NextResponse.json({ bots: botsWithStats });

  } catch (error: any) {
    console.error('Marketplace error:', error);
    return NextResponse.json({ error: "Failed to load marketplace" }, { status: 500 });
  }
}

