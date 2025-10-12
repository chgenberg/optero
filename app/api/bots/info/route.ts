import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('botId') || '';
  const bot = await prisma.bot.findUnique({ where: { id } });
  if (!bot) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ id: bot.id, name: bot.name, type: bot.type, spec: bot.spec });
}


