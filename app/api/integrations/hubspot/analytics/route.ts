import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decryptSecret } from '@/lib/integrations';
import { fetchWithRetry } from '@/lib/http';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || '';
    if (!botId) return NextResponse.json({ error: 'botId_required' }, { status: 400 });

    const bot = await prisma.bot.findUnique({ where: { id: botId }, include: { integration: true } });
    if (!bot) return NextResponse.json({ error: 'bot_not_found' }, { status: 404 });
    const enc = bot.integration?.hubspotTokenEnc;
    const token = enc ? decryptSecret(enc) : '';
    if (!token) return NextResponse.json({ error: 'hubspot_not_configured' }, { status: 400 });

    const [contactsRes, dealsRes] = await Promise.all([
      fetchWithRetry('https://api.hubapi.com/crm/v3/objects/contacts?limit=5&properties=firstname,lastname,company,annualrevenue', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetchWithRetry('https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealstage,amount', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    if (!contactsRes.ok || !dealsRes.ok) {
      return NextResponse.json({ error: 'hubspot_api_error', details: `contacts:${contactsRes.status} deals:${dealsRes.status}` }, { status: 502 });
    }

    const contacts = await contactsRes.json();
    const deals = await dealsRes.json();

    const topCustomers = (contacts?.results || []).map((c: any) => ({
      name: [c.properties?.firstname, c.properties?.lastname].filter(Boolean).join(' ') || c.properties?.company || 'Contact',
      revenue: Number(c.properties?.annualrevenue || 0) || 0
    }));

    const stageMap: Record<string, { deals: number; value: number }> = {};
    (deals?.results || []).forEach((d: any) => {
      const st = d.properties?.dealstage || 'unknown';
      const amount = Number(d.properties?.amount || 0) || 0;
      if (!stageMap[st]) stageMap[st] = { deals: 0, value: 0 };
      stageMap[st].deals += 1;
      stageMap[st].value += amount;
    });
    const pipeline = Object.entries(stageMap).map(([stage, v]) => ({ stage, ...v }));

    return NextResponse.json({ analytics: { topCustomers, pipeline } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'hubspot_analytics_failed' }, { status: 500 });
  }
}


