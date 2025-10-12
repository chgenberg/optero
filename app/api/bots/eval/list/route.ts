import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get('botId') || '';
  if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });
  const evals = await prisma.botEval.findMany({ where: { botId }, orderBy: { lastRunAt: 'desc' } });
  return NextResponse.json({ evals });
}


