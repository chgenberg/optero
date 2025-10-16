import { NextRequest, NextResponse } from 'next/server';
import { getCentraConfigForBot, listCentraProducts } from '@/lib/centra';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || '';
    if (!botId) return NextResponse.json({ ok: false, error: 'botId_required' }, { status: 400 });

    const cfg = await getCentraConfigForBot(botId);
    if (!cfg) return NextResponse.json({ ok: false, error: 'centra_not_configured' }, { status: 400 });

    try {
      const products = await listCentraProducts(botId);
      return NextResponse.json({ ok: true, apiBaseUrl: cfg.apiBaseUrl, storeId: cfg.storeId || null, sampleCount: Array.isArray(products) ? products.length : 0 });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message || 'fetch_failed' }, { status: 502 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'verify_failed' }, { status: 500 });
  }
}


