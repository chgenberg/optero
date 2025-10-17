import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { assertOrigin, corsHeaders, validateCsrf } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const originError = assertOrigin(req);
    if (originError) return originError;
    if (!validateCsrf(req)) {
      return NextResponse.json({ error: 'csrf_invalid' }, { status: 403, headers: corsHeaders() });
    }
    const { id, action } = await req.json(); // action: approve|reject
    if (!id || !action) return NextResponse.json({ error: 'id_and_action_required' }, { status: 400 });

    const approval = await prisma.approvalRequest.findUnique({ where: { id } });
    if (!approval) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    if (action === 'reject') {
      await prisma.approvalRequest.update({ where: { id }, data: { status: 'rejected', approvedAt: new Date(), approvedBy: 'admin' } });
      return NextResponse.json({ ok: true, status: 'rejected' }, { headers: corsHeaders() });
    }

    // APPROVE: here we would dispatch to the external system based on payload
    // For safety, we just mark approved. Execution worker can process it.
    await prisma.approvalRequest.update({ where: { id }, data: { status: 'approved', approvedAt: new Date(), approvedBy: 'admin' } });
    return NextResponse.json({ ok: true, status: 'approved' }, { headers: corsHeaders() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'approval_failed' }, { status: 500, headers: corsHeaders() });
  }
}


