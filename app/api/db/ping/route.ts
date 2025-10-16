import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    // Simple Prisma query to verify connectivity
    const now = await prisma.$queryRawUnsafe<any>('SELECT NOW() as now');
    return NextResponse.json({ ok: true, now: now?.[0]?.now ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'db_error' }, { status: 500 });
  }
}


