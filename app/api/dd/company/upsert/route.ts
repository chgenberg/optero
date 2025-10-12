import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url, name } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    const saved = await prisma.dDCompany.upsert({
      where: { url },
      create: { url, name: name || null },
      update: { name: name || null }
    });
    return NextResponse.json({ company: saved });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_company_upsert_failed' }, { status: 500 });
  }
}


