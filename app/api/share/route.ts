import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, recommendations, scenarios } = await request.json();

    // Generate unique share ID
    const shareId = crypto.randomBytes(6).toString("hex");

    // Save to database (or in-memory for now)
    // For now, we'll use the RecommendationCache table with a special flag
    const cacheKey = `share_${shareId}`;

    if (prisma) {
      try {
        await prisma.recommendationCache.create({
          data: {
            cacheKey,
            profession,
            specialization: specialization || profession,
            tasks: [], // Empty for shares
            recommendations,
            scenarios,
            hitCount: 0,
          },
        });
      } catch (dbError) {
        console.error("Failed to save share link:", dbError);
      }
    }

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("id");

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID required" },
        { status: 400 }
      );
    }

    const cacheKey = `share_${shareId}`;

    if (prisma) {
      try {
        const shared = await prisma.recommendationCache.findUnique({
          where: { cacheKey },
        });

        if (shared) {
          // Update hit count
          await prisma.recommendationCache.update({
            where: { id: shared.id },
            data: {
              hitCount: { increment: 1 },
              lastUsed: new Date(),
            },
          });

          return NextResponse.json({
            profession: shared.profession,
            specialization: shared.specialization,
            recommendations: shared.recommendations,
            scenarios: shared.scenarios,
          });
        }
      } catch (dbError) {
        console.error("Failed to fetch shared results:", dbError);
      }
    }

    return NextResponse.json(
      { error: "Share link not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching shared results:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared results" },
      { status: 500 }
    );
  }
}
