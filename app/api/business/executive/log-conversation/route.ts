import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, companyUrl, problem, conversation } = await req.json();
    if (!problem || !conversation) {
      return NextResponse.json({ error: "Missing problem or conversation" }, { status: 400 });
    }
    const saved = await prisma.executiveConversation.create({
      data: { sessionId: sessionId || null, companyUrl: companyUrl || null, problem, conversation }
    });
    return NextResponse.json({ id: saved.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to save conversation" }, { status: 500 });
  }
}


