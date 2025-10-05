import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profession = searchParams.get("profession");
    const specialization = searchParams.get("specialization");
    const category = searchParams.get("category");

    if (!profession) {
      return NextResponse.json({ error: "Profession required" }, { status: 400 });
    }

    const where: any = { profession };
    
    if (specialization) {
      where.specialization = specialization;
    }
    
    if (category) {
      where.category = category;
    }

    const prompts = await prisma.promptLibrary.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' }, // Most used first
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    // Increment usage count for returned prompts
    if (prompts.length > 0) {
      await prisma.promptLibrary.updateMany({
        where: {
          id: { in: prompts.map(p => p.id) }
        },
        data: {
          usageCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json({ prompts, count: prompts.length });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}
