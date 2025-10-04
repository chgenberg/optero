import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      sessionId,
      profession,
      specialization,
      experience,
      selectedTasks,
      challenges,
      viewedTools,
      copiedPrompts,
      timeSpent,
      completedSteps,
      clickedPremium,
    } = data;

    // Get user agent and referrer from headers
    const userAgent = request.headers.get("user-agent") || undefined;
    const referrer = request.headers.get("referer") || undefined;

    if (sessionId) {
      // Update existing session
      await prisma.userSession.update({
        where: { id: sessionId },
        data: {
          specialization,
          experience,
          selectedTasks,
          challenges,
          viewedTools,
          copiedPrompts,
          timeSpent,
          completedSteps,
          clickedPremium,
        },
      });

      return NextResponse.json({ sessionId, updated: true });
    } else {
      // Create new session
      const session = await prisma.userSession.create({
        data: {
          profession,
          specialization,
          experience,
          selectedTasks,
          challenges,
          viewedTools,
          copiedPrompts,
          timeSpent,
          completedSteps: completedSteps || 1,
          clickedPremium: clickedPremium || false,
          userAgent,
          referrer,
        },
      });

      return NextResponse.json({ sessionId: session.id, created: true });
    }
  } catch (error) {
    console.error("Error saving session:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

// Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "popular-professions") {
      // Get most searched professions
      const professions = await prisma.userSession.groupBy({
        by: ["profession"],
        _count: {
          profession: true,
        },
        orderBy: {
          _count: {
            profession: "desc",
          },
        },
        take: 10,
      });

      return NextResponse.json({ professions });
    }

    if (type === "popular-combinations") {
      // Get most common profession + specialization combinations
      const combinations = await prisma.userSession.groupBy({
        by: ["profession", "specialization"],
        _count: {
          profession: true,
        },
        where: {
          specialization: {
            not: null,
          },
        },
        orderBy: {
          _count: {
            profession: "desc",
          },
        },
        take: 20,
      });

      return NextResponse.json({ combinations });
    }

    if (type === "conversion-rate") {
      // Calculate conversion rate to premium
      const total = await prisma.userSession.count();
      const converted = await prisma.userSession.count({
        where: { clickedPremium: true },
      });

      return NextResponse.json({
        total,
        converted,
        rate: total > 0 ? (converted / total) * 100 : 0,
      });
    }

    // Default: return summary stats
    const totalSessions = await prisma.userSession.count();
    const completedSessions = await prisma.userSession.count({
      where: { completedSteps: 4 },
    });
    const avgTimeSpent = await prisma.userSession.aggregate({
      _avg: {
        timeSpent: true,
      },
      where: {
        timeSpent: {
          not: null,
        },
      },
    });

    return NextResponse.json({
      totalSessions,
      completedSessions,
      completionRate:
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      avgTimeSpent: avgTimeSpent._avg.timeSpent || 0,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
