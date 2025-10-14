import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encryptSecret } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botId } = body || {};
    if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });

    const data: any = {};
    if (body.zendeskDomain !== undefined) data.zendeskDomain = body.zendeskDomain || null;
    if (body.zendeskEmail !== undefined) data.zendeskEmail = body.zendeskEmail || null;
    if (body.zendeskApiToken !== undefined) data.zendeskApiTokenEnc = encryptSecret(body.zendeskApiToken) || null;

    if (body.hubspotToken !== undefined) data.hubspotTokenEnc = encryptSecret(body.hubspotToken) || null;

    if (body.shopifyDomain !== undefined) data.shopifyDomain = body.shopifyDomain || null;
    if (body.shopifyAccessToken !== undefined) data.shopifyAccessTokenEnc = encryptSecret(body.shopifyAccessToken) || null;

    const upserted = await prisma.botIntegration.upsert({
      where: { botId },
      update: data,
      create: { botId, ...data },
    });
    return NextResponse.json({ ok: true, integrationId: upserted.id });
  } catch (e: any) {
    return NextResponse.json({ error: 'failed_to_set_integrations' }, { status: 500 });
  }
}


