import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, resultData } = await request.json();

    if (!email || !resultData) {
      return NextResponse.json({ error: "Missing email or result data" }, { status: 400 });
    }

    // Generate unique token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save to database with email
    await prisma.sharedResult.create({
      data: {
        id: token,
        shareId: token,
        profession: resultData.profession,
        specialization: resultData.specialization,
        tasks: resultData.tasks,
        recommendations: resultData.recommendations,
        scenarios: resultData.scenarios || [],
        email: email, // Save email for later retrieval
        createdAt: new Date(),
        expiresAt
      }
    });

    // In production: Send email with magic link
    // For now: Return the link
    const magicLink = `${request.nextUrl.origin}/results/${token}`;

    // TODO: Send email via SendGrid/Resend
    console.log(`Magic link for ${email}: ${magicLink}`);

    return NextResponse.json({ 
      success: true, 
      magicLink,
      message: "Magic link skapad! (Email-funktionalitet kommer snart)"
    });
  } catch (error) {
    console.error("Error creating magic link:", error);
    return NextResponse.json({ error: "Failed to create magic link" }, { status: 500 });
  }
}
