import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Lightweight worker: picks up oldest approved, not processed item
  try {
    const limit = Number(new URL(req.url).searchParams.get('limit') || '3');
    const items = await prisma.approvalRequest.findMany({ where: { status: 'approved' }, orderBy: { approvedAt: 'asc' }, take: Math.min(limit, 10) });
    const results: any[] = [];

    for (const it of items) {
      try {
        // Idempotency: mark as in-progress by switching status to 'processing'
        const locked = await prisma.approvalRequest.update({ where: { id: it.id }, data: { status: 'processing' } });
        const payload: any = locked.payload || {};
        const intent = payload.intent || {};

        // Dispatch by system/action
        if (intent.system === 'zendesk' && /TICKET/.test(intent.action)) {
          const subject = intent.data?.subject || 'Support Ticket';
          const description = intent.data?.description || 'Support request';
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/integrations/zendesk/ticket`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: locked.botId, subject, description }) });
        } else if (intent.system === 'hubspot' && /CONTACT/.test(intent.action) && intent.data?.email) {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/integrations/hubspot/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: locked.botId, email: intent.data.email }) });
        }

        await prisma.approvalRequest.update({ where: { id: it.id }, data: { status: 'completed' } });
        results.push({ id: it.id, ok: true });
      } catch (e: any) {
        // Backoff: revert to approved for retry later
        await prisma.approvalRequest.update({ where: { id: it.id }, data: { status: 'approved' } }).catch(()=>{});
        results.push({ id: it.id, ok: false, error: e?.message });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (e: any) {
    return NextResponse.json({ error: 'worker_failed', details: e?.message }, { status: 500 });
  }
}


