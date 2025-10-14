import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decryptSecret } from '@/lib/integrations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId');
    const query = searchParams.get('q') || '';
    if (!botId) return NextResponse.json({ error: 'botId required' }, { status: 400 });

    const integ = await prisma.botIntegration.findUnique({ where: { botId } });
    if (!integ || !integ.shopifyDomain || !integ.shopifyAccessTokenEnc) {
      return NextResponse.json({ error: 'shopify_not_configured' }, { status: 400 });
    }

    const token = decryptSecret(integ.shopifyAccessTokenEnc!);
    if (!token) {
      return NextResponse.json({ error: 'shopify_not_configured' }, { status: 400 });
    }
    const url = `https://${integ.shopifyDomain}/admin/api/2024-10/products.json?limit=5&title=${encodeURIComponent(query)}`;

    let items: any[] = [];
    try {
      const res = await fetch(url, {
        headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } as Record<string, string>
      });
      if (res.ok) {
        const data = await res.json();
        items = (data?.products || []).slice(0, 5).map((p: any) => ({ id: p.id, title: p.title, handle: p.handle }));
      }
    } catch {}

    return NextResponse.json({ ok: true, products: items });
  } catch (e: any) {
    return NextResponse.json({ error: 'shopify_search_failed' }, { status: 500 });
  }
}


