import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profession = searchParams.get("profession");
    
    if (profession) {
      // Get prompts for specific profession
      const prompts = await prisma.promptLibrary.findMany({
        where: {
          profession: {
            contains: profession,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          profession: true,
          specialization: true,
          name: true,
          category: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      return NextResponse.json({
        profession,
        count: prompts.length,
        prompts,
      });
    }

    // Get all prompts grouped by profession
    const allPrompts = await prisma.promptLibrary.groupBy({
      by: ['profession', 'specialization'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const totalCount = await prisma.promptLibrary.count();

    return NextResponse.json({
      totalPrompts: totalCount,
      professions: allPrompts.map(p => ({
        profession: p.profession,
        specialization: p.specialization,
        promptCount: p._count.id
      }))
    });
  } catch (error) {
    console.error("Error checking prompts:", error);
    return NextResponse.json(
      { error: "Failed to check prompts" },
      { status: 500 }
    );
  }
}
