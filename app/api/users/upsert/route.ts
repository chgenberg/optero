import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, name, company } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Upsert user (create or update)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        company: company || undefined
      },
      create: {
        email,
        name: name || null,
        company: company || null
      }
    });

    return NextResponse.json({ 
      userId: user.id,
      email: user.email 
    });

  } catch (error: any) {
    console.error('User upsert error:', error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

