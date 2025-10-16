import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { botId, kind, payload } = await req.json();
    if (!botId || !kind) return NextResponse.json({ error: 'botId_and_kind_required' }, { status: 400 });

    // Store approval request (no external call until approved)
    const approval = await prisma.approvalRequest.create({
      data: {
        botId,
        type: 'lead',
        payload: { system: 'fortnox', kind, payload }
      }
    });

    return NextResponse.json({ ok: true, approvalId: approval.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'fortnox_enqueue_failed' }, { status: 500 });
  }
}


