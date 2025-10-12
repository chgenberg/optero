import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const items = await prisma.approvalRequest.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ items });
}


