import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { domain, email, apiToken } = await req.json();
    if (!domain || !email || !apiToken) {
      return NextResponse.json({ ok: false, error: 'domain, email, apiToken required' }, { status: 400 });
    }
    const url = `https://${domain.replace(/^https?:\/\//,'')}/api/v2/users/me.json`;
    const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      return NextResponse.json({ ok: false, status: res.status, error: t || 'zendesk_verify_failed' }, { status: 400 });
    }
    const j = await res.json();
    return NextResponse.json({ ok: true, user: { id: j?.user?.id, email: j?.user?.email } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'zendesk_verify_error' }, { status: 500 });
  }
}


