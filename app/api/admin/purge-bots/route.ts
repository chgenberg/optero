import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

// WARNING: Destructive. Use carefully. Optionally pass ?email=... to scope.
export async function POST(req: NextRequest) {
  // Require admin auth
  const authError = requireAdminAuth(req);
  if (authError) return authError;
  
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const all = searchParams.get('all') === 'true';

    // Resolve bots to delete
    let bots: { id: string }[] = [];
    if (all) {
      bots = await prisma.bot.findMany({ select: { id: true } });
    } else if (email) {
      const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (!user) return NextResponse.json({ ok: true, deleted: 0, note: 'user_not_found' });
      bots = await prisma.bot.findMany({ where: { userId: user.id }, select: { id: true } });
    } else {
      return NextResponse.json({ error: 'email or all=true required' }, { status: 400 });
    }

    const botIds = bots.map(b => b.id);
    if (botIds.length === 0) return NextResponse.json({ ok: true, deleted: 0 });

    // Delete children first to satisfy FKs
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

    // Delete bots last
    const res = await prisma.bot.deleteMany({ where: { id: { in: botIds } } });

    return NextResponse.json({ ok: true, deleted: res.count });
  } catch (e: any) {
    return NextResponse.json({ error: 'purge_failed', details: e.message }, { status: 500 });
  }
}


