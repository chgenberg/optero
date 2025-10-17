import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "accessToken required" }, { status: 400 });
    }

    const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return NextResponse.json({ ok: false, status: r.status, error: t || "verification_failed" }, { status: 400 });
    }
    const j = await r.json();
    return NextResponse.json({ ok: true, sampleCount: Array.isArray(j?.results) ? j.results.length : 0 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "verify_failed" }, { status: 500 });
  }
}


