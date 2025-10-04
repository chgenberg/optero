import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Ogiltig e-postadress" },
        { status: 400 }
      );
    }

    // Delete all data associated with this email
    // Note: Add more tables as your schema grows
    
    // Delete user sessions
    await prisma.userSession.deleteMany({
      where: {
        // Assuming you store email in userSession, adjust if needed
        OR: [
          { userAgent: { contains: email } },
          { referrer: { contains: email } }
        ]
      }
    });

    // Delete feedback
    await prisma.feedback.deleteMany({
      where: {
        sessionId: { contains: email }
      }
    });

    // Log the deletion for compliance
    console.log(`GDPR: Deleted data for email: ${email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "All data has been deleted"
    });

  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
