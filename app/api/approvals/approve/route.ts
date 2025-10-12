import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { id, approve } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const status = approve ? 'approved' : 'rejected';
  const saved = await prisma.approvalRequest.update({ where: { id }, data: { status, approvedAt: new Date() } });
  return NextResponse.json({ ok: true, saved });
}


