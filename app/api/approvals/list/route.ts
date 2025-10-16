import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || undefined;
    const status = searchParams.get('status') || undefined; // pending|approved|rejected

    const approvals = await prisma.approvalRequest.findMany({
      where: {
        ...(botId ? { botId } : {}),
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return NextResponse.json({ approvals });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'list_failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const items = await prisma.approvalRequest.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ items });
}


