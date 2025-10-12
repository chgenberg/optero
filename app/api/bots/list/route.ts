import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const bots = await prisma.bot.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ bots });
}


