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

    // Collect all data associated with this email
    const userData = {
      email,
      exportDate: new Date().toISOString(),
      data: {
        sessions: await prisma.userSession.findMany({
          where: {
            OR: [
              { userAgent: { contains: email } },
              { referrer: { contains: email } }
            ]
          }
        }),
        feedback: await prisma.feedback.findMany({
          where: {
            sessionId: { contains: email }
          }
        }),
      },
      gdprNote: "This is all the personal data we have stored about you. You have the right to request deletion of this data at any time."
    };

    // Log the export for compliance
    console.log(`GDPR: Data exported for email: ${email} at ${new Date().toISOString()}`);

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(userData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mendio-data-${email}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
