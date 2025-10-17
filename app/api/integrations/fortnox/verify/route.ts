import { NextRequest, NextResponse } from 'next/server';
import { fetchWithRetry } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, clientSecret } = await req.json();
    if (!accessToken || !clientSecret) {
      return NextResponse.json({ ok: false, error: 'accessToken and clientSecret required' }, { status: 400 });
    }
    const res = await fetchWithRetry('https://api.fortnox.se/3/companyinformation/', {
      headers: {
        'Access-Token': accessToken,
        'Client-Secret': clientSecret
      }
    });
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      return NextResponse.json({ ok: false, status: res.status, error: t || 'fortnox_verify_failed' }, { status: 400 });
    }
    const j = await res.json();
    return NextResponse.json({ ok: true, organizationNumber: j?.CompanyInformation?.OrganizationNumber });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'fortnox_verify_error' }, { status: 500 });
  }
}


