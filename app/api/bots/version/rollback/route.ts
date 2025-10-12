import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { botId, version } = await req.json();
    if (!botId || !version) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const v = await prisma.botVersion.findUnique({ where: { botId_version: { botId, version } } });
    if (!v) return NextResponse.json({ error: 'version_not_found' }, { status: 404 });
    const nextSpec = (v.spec ?? {}) as any; // ensure InputJsonValue
    await prisma.bot.update({ where: { id: botId }, data: { spec: nextSpec } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'rollback_failed' }, { status: 500 });
  }
}


