import { NextRequest, NextResponse } from 'next/server';
import { fetchWithRetry } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const { storeDomain, accessToken } = await req.json();
    if (!storeDomain || !accessToken) {
      return NextResponse.json({ ok: false, error: 'storeDomain and accessToken required' }, { status: 400 });
    }
    const domain = storeDomain.replace(/^https?:\/\//,'');
    const url = `https://${domain}/admin/api/2024-07/products.json?limit=1`;
    const res = await fetchWithRetry(url, { headers: { 'X-Shopify-Access-Token': accessToken } });
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      return NextResponse.json({ ok: false, status: res.status, error: t || 'shopify_verify_failed' }, { status: 400 });
    }
    const j = await res.json();
    return NextResponse.json({ ok: true, sampleCount: Array.isArray(j?.products) ? j.products.length : 0 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'shopify_verify_error' }, { status: 500 });
  }
}


