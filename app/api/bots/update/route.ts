import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { botId, type, webhookUrl, name } = await req.json();
    if (!botId) return NextResponse.json({ error: "botId required" }, { status: 400 });
    const data: any = {};
    if (type) data.type = type;
    if (webhookUrl !== undefined) {
      const existing = await prisma.bot.findUnique({ where: { id: botId }, select: { spec: true } });
      const currentSpec = (existing?.spec as Record<string, unknown> | null) ?? {};
      data.spec = { ...currentSpec, webhookUrl };
    }
    if (name) data.name = name;
    const bot = await prisma.bot.update({ where: { id: botId }, data });
    return NextResponse.json({ bot });
  } catch (e: any) {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}


