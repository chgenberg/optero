import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "@/lib/emails";

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

    // Send email with magic link
    const magicLink = `${request.nextUrl.origin}/results/${token}`;

    // Send email via Resend
    const emailResult = await sendMagicLinkEmail(
      email, 
      magicLink, 
      resultData.profession || "ditt yrke"
    );

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Still return success with link for fallback
      return NextResponse.json({ 
        success: true, 
        magicLink,
        message: "Resultat sparat! Kunde inte skicka email, men här är din länk."
      });
    }

    return NextResponse.json({ 
      success: true, 
      magicLink,
      message: "Magic link skickad till din email!"
    });
  } catch (error) {
    console.error("Error creating magic link:", error);
    return NextResponse.json({ error: "Failed to create magic link" }, { status: 500 });
  }
}
