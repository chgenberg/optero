import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

// Emergency purge: requires query confirm=DELETE-ALL
export async function POST(req: NextRequest) {
  // Require admin auth
  const authError = requireAdminAuth(req);
  if (authError) return authError;
  
  try {
    const { searchParams } = new URL(req.url);
    const confirm = searchParams.get('confirm');
    if (confirm !== 'DELETE-ALL') {
      return NextResponse.json({ error: 'confirmation_required', how: 'POST /api/purge-all-bots?confirm=DELETE-ALL' }, { status: 400 });
    }

    const bots = await prisma.bot.findMany({ select: { id: true } });
    const botIds = bots.map(b => b.id);
    if (botIds.length === 0) return NextResponse.json({ ok: true, deleted: 0 });

    await prisma.botVersion.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botKnowledge.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botSource.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botQA.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botUsage.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botSession.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.approvalRequest.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botIntegration.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botAction.deleteMany({ where: { botId: { in: botIds } } });
    await prisma.botRating.deleteMany({ where: { botId: { in: botIds } } });

    const res = await prisma.bot.deleteMany({ where: { id: { in: botIds } } });

    return NextResponse.json({ ok: true, deleted: res.count });
  } catch (e: any) {
    return NextResponse.json({ error: 'purge_failed', details: e.message }, { status: 500 });
  }
}


