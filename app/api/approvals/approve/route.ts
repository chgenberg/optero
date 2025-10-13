import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { id, approve } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const status = approve ? 'approved' : 'rejected';
  const saved = await prisma.approvalRequest.update({ where: { id }, data: { status, approvedAt: new Date() } });

  // If approved, write to internal inbox and notify based on bot spec
  if (status === 'approved') {
    try {
      const reqFull = await prisma.approvalRequest.findUnique({ where: { id }, include: { bot: true } });
      const bot = reqFull?.bot as any;
      const payload = reqFull?.payload as any;
      const spec = (bot?.spec || {}) as any;
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/inbox/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: bot?.id, type: reqFull?.type, payload, notifyEmail: spec.notifyEmail || '', slackWebhook: spec.slackWebhook || '', webhookUrl: spec.webhookUrl || '' })
      }).catch(()=>{});
    } catch {}
  }
  return NextResponse.json({ ok: true, saved });
}


