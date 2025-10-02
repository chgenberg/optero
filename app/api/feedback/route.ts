import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { recommendationId, recommendationName, rating } = await request.json();

    // Här kan du spara feedback till en databas
    // För nu loggar vi bara
    console.log("Feedback received:", {
      recommendationId,
      recommendationName,
      rating,
      timestamp: new Date().toISOString()
    });

    // I en riktig app skulle du spara detta i en databas
    // await db.feedback.create({ ... })

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Could not save feedback" },
      { status: 500 }
    );
  }
}
