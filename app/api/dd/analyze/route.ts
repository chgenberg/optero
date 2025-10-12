import { NextRequest, NextResponse } from "next/server";
import { POST as Scrape } from "@/app/api/business/scrape/route";
import { POST as Profile } from "@/app/api/business/profile/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url, documents } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    const normalizeUrl = (input: string) => {
      let u = (input || '').trim();
      if (!u) return u;
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      return u;
    };
    const normUrl = normalizeUrl(url);

    // Reuse existing endpoints
    const scrapeRes = await Scrape(new Request("http://local", { method: 'POST', body: JSON.stringify({ url: normUrl }) }) as any);
    const scrape = await (scrapeRes as any).json();

    const profileRes = await Profile(new Request("http://local", { method: 'POST', body: JSON.stringify({ url: normUrl, scrape }) }) as any);
    const profile = await (profileRes as any).json();

    // Strict schema/validator + citations (no source -> no claim)
    const rawProfile: any = profile?.profile || profile || {};
    const baseText: string = scrape?.summary?.mainText || scrape?.content || '';
    const docsText: string = typeof documents === 'string' ? documents : '';
    const siteText: string = `${baseText}\n\n${docsText}`.trim();

    const schema = {
      companyName: 'string',
      sector: 'string',
      sizeHint: 'string',
      regions: 'array',
      persons: 'array',
      products: 'array',
      services: 'array',
      USPs: 'array',
      gtm: 'string',
      techSignals: 'array',
      contentSignals: 'array'
    } as const;

    const validate = (rp: any) => {
      const out: any = {};
      for (const k of Object.keys(schema)) {
        const t = (schema as any)[k];
        const v = rp?.[k];
        if (t === 'string' && typeof v === 'string') out[k] = v.trim();
        else if (t === 'array' && Array.isArray(v)) out[k] = v.filter((x: any) => typeof x === 'string' && x.trim()).slice(0, 50);
      }
      return out;
    };

    const profClean = validate(rawProfile);

    const mkCitations = (text: string, value: string | string[]) => {
      const cites: { snippet: string }[] = [];
      const L = text.toLowerCase();
      const pushWindow = (idx: number, len: number) => {
        const start = Math.max(0, idx - 80);
        const end = Math.min(text.length, idx + len + 80);
        cites.push({ snippet: text.slice(start, end) });
      };
      const searchFuzzy = (s: string) => {
        const q = s.toLowerCase().trim();
        if (!q) return false;
        // exact
        let idx = L.indexOf(q);
        if (idx >= 0) { pushWindow(idx, q.length); return true; }
        // word token overlap (>=2 tokens of length>=4)
        const toks = q.split(/[^a-z0-9åäöA-ZÅÄÖ]+/i).filter(w=>w.length>=4).slice(0,5);
        let hits = 0; let firstIdx = -1; let len = 0;
        for (const t of toks) {
          const i = L.indexOf(t);
          if (i>=0) { hits++; if (firstIdx<0) firstIdx=i; len += t.length; }
        }
        if (hits>=2 && firstIdx>=0) { pushWindow(firstIdx, Math.min(120, len)); return true; }
        return false;
      };
      const add = (s: string) => { if (searchFuzzy(s)) return; };
      if (typeof value === 'string' && value) add(value);
      if (Array.isArray(value)) value.slice(0, 10).forEach(v => typeof v === 'string' && v && add(v));
      return cites;
    };

    const verified: any = {};
    const confidence: any = {};
    const citations: any = {};
    for (const k of Object.keys(profClean)) {
      const v = (profClean as any)[k];
      const cites = mkCitations(siteText, v);
      citations[k] = cites;
      verified[k] = cites.length > 0;
      // naive confidence: base 0.5 if verified, +0.1 per citation up to 1.0
      confidence[k] = verified[k] ? Math.min(1, 0.5 + 0.1 * cites.length) : 0;
      // enforce RAG: if no citation, blank out value
      if (!verified[k]) delete (profClean as any)[k];
    }

    // Heuristic fallbacks for common sections if still missing
    const ifEmpty = (key: string, extractor: () => string | string[] | undefined) => {
      if ((profClean as any)[key]) return;
      const val = extractor();
      if (!val) return;
      const c = mkCitations(siteText, val);
      if (c.length) {
        (profClean as any)[key] = val;
        citations[key] = c; verified[key] = true; confidence[key] = Math.min(1, 0.5 + 0.1 * c.length);
      }
    };
    // Extract from About/Om oss and Services/Tjänster blocks
    const section = (labelRe: RegExp) => {
      const m = siteText.match(new RegExp(`(^|\n)\s*(${labelRe.source}).{0,2000}`, 'i'));
      return m ? m[0] : undefined;
    };
    ifEmpty('USPs', () => {
      const s = section(/(om oss|about|tjänster|services)/);
      if (!s) return undefined;
      const lines = s.split(/\n+/).map(x=>x.trim()).filter(x=>x.length>0).slice(0,6);
      // pick bullet‑like lines or short sentences
      const usps = lines.filter(l=>/^[-•*]/.test(l) || l.split(' ').length<=12).map(l=>l.replace(/^[-•*]\s*/, ''));
      return usps.slice(0,5);
    });

    // Simple scoring heuristic
    const textLen = siteText.length;
    const hasContacts = Boolean(scrape?.summary?.contacts && scrape.summary.contacts.length);
    const opportunity = Math.min(100, Math.floor((textLen / 50000) * 50) + (hasContacts ? 30 : 10));
    const risk = 100 - opportunity;
    const scoring = { opportunityScore: opportunity, riskScore: risk, rationale: `Textbas ${textLen} tecken. Kontakter: ${hasContacts ? 'ja' : 'nej'}.` };

    return NextResponse.json({ scrape, profile: profClean, verified, confidence, citations, scoring });
  } catch (e: any) {
    return NextResponse.json({ error: 'dd_analyze_failed' }, { status: 500 });
  }
}


