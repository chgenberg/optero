import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const [bots, messages, actions, approvals] = await Promise.all([
      prisma.bot.count(),
      prisma.botUsage.count({ where: { kind: 'message' } }),
      prisma.botUsage.count({ where: { kind: 'action' } }),
      prisma.approvalRequest.count({ where: { status: 'pending' } })
    ]);
    return NextResponse.json({ bots, messages, actions, approvalsPending: approvals });
  } catch (e: any) {
    return NextResponse.json({ bots: 0, messages: 0, actions: 0 });
  }
}


