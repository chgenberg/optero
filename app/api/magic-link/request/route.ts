import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/emails";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Find user with this email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        bots: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    // Also check for shared results (old system)
    const results = await prisma.sharedResult.findMany({
      where: {
        email: email,
        expiresAt: {
          gte: new Date() // Only non-expired results
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1 // Get the most recent
    });

    // If we have a user with bots, send dashboard link
    if (user && user.bots && user.bots.length > 0) {
      const dashboardLink = `${request.nextUrl.origin}/dashboard`;
      
      // Store email in localStorage via response hint
      const emailResult = await sendMagicLinkEmail(
        email,
        dashboardLink,
        "Dashboard"
      );

      if (!emailResult.success) {
        console.error("Failed to send email:", emailResult.error);
        return NextResponse.json({ 
          success: true,
          found: true,
          magicLink: dashboardLink,
          count: user.bots.length,
          message: "Dashboard hittat! Kunde inte skicka email, men här är din länk."
        });
      }

      return NextResponse.json({ 
        success: true,
        found: true,
        magicLink: dashboardLink,
        count: user.bots.length,
        message: "Magic link skickad till din email!"
      });
    }

    // Fall back to shared results
    if (results.length === 0) {
      return NextResponse.json({ 
        error: "Inga resultat hittades för denna email",
        found: false 
      }, { status: 404 });
    }

    // Get the most recent result
    const latestResult = results[0];

    // Use existing token
    const magicLink = `${request.nextUrl.origin}/results/${latestResult.shareId}`;

    // Send email via Resend
    const emailResult = await sendMagicLinkEmail(
      email,
      magicLink,
      latestResult.profession
    );

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      return NextResponse.json({ 
        success: true,
        found: true,
        magicLink,
        count: results.length,
        message: "Resultat hittat! Kunde inte skicka email, men här är din länk."
      });
    }

    return NextResponse.json({ 
      success: true,
      found: true,
      magicLink,
      count: results.length,
      message: "Magic link skickad till din email!"
    });
  } catch (error) {
    console.error("Error requesting magic link:", error);
    return NextResponse.json({ error: "Failed to request magic link" }, { status: 500 });
  }
}
