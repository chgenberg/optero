import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || undefined;
  const items = await prisma.botAction.findMany({ where: { ...(type ? { type } : {}) }, orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json({ items });
}


