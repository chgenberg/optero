import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decryptSecret } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { botId, email, firstname, lastname } = await req.json();
    if (!botId || !email) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

    const integ = await prisma.botIntegration.findUnique({ where: { botId } });
    if (!integ || !integ.hubspotTokenEnc) {
      return NextResponse.json({ error: 'hubspot_not_configured' }, { status: 400 });
    }

    const token = decryptSecret(integ.hubspotTokenEnc!);
    const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const payload = {
      properties: { email, firstname, lastname }
    };

    // Try upsert: HubSpot supports create, then update on conflict via search. Here we simulate best-effort.
    let ok = true;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      ok = res.ok;
    } catch {}

    await prisma.botUsage.create({ data: { botId, kind: 'action' } });
    return NextResponse.json({ ok });
  } catch (e: any) {
    return NextResponse.json({ error: 'hubspot_upsert_failed' }, { status: 500 });
  }
}


