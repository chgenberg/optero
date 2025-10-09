import { NextRequest, NextResponse } from "next/server";

type DeptKey = "sales"|"marketing"|"finance"|"hr"|"customer-service"|"operations"|"it"|"management";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, scrape } = body as { url?: string; scrape?: any };
    if (!url && !scrape) {
      return NextResponse.json({ error: "Missing url or scrape" }, { status: 400 });
    }

    const summary = scrape?.summary || {};
    const ov = summary?.overview || {};
    const companyName: string = ov.companyName || "";
    const title: string = ov.title || "";
    const description: string = ov.description || "";
    const mainText: string = ov.mainText || "";
    const headings: string[] = Array.isArray(ov.headings) ? ov.headings : [];
    const servicesLinks: string[] = Array.isArray(ov.servicesLinks) ? ov.servicesLinks : [];
    const socials: string[] = Array.isArray(ov.socials) ? ov.socials : [];
    const people: string[] = Array.isArray(ov.people) ? ov.people : [];
    const products: string[] = Array.isArray(ov.products) ? ov.products : [];
    const services: string[] = Array.isArray(ov.services) ? ov.services : [];
    const contacts = ov.contacts || {};

    const blob = [title, description, headings.join(" \n"), mainText].join(" \n").toLowerCase();

    // Sector heuristic
    const sector = /shop|cart|checkout|product|store|ecommerce|e-handel/.test(blob) ? "ecommerce"
      : /clinic|health|medical|patient|care|sjuk|vård/.test(blob) ? "healthcare"
      : /saas|software|platform|api|dev|sdk/.test(blob) ? "saas"
      : /education|school|learning|course|utbild/.test(blob) ? "education"
      : /consult|it|managed service|msp/.test(blob) ? "consulting"
      : "general";

    // Simple signal counters
    const count = (re: RegExp) => (blob.match(re) || []).length;

    const signals = {
      sales: count(/contact sales|pricing|get a quote|schedule demo|cart|checkout|buy now|kundvagn|pris/gi),
      marketing: count(/blog|news|press|campaign|case study|whitepaper/gi) + socials.length,
      hr: count(/careers|jobs|join us|karriär|jobb/gi),
      it: count(/api|platform|integration|cloud|docs|developer|sdk/gi),
      "customer-service": count(/support|help|faq|returns|kundtjänst|kontakt/gi),
      operations: count(/logistics|warehouse|supply|delivery|production/gi),
      finance: count(/invoice|billing|pricing plan|roi|budget/gi),
      management: count(/strategy|vision|leadership|governance|board/gi)
    } as Record<DeptKey, number>;

    const score = (raw: number) => Math.min(100, raw * 20);
    const deptScores = Object.fromEntries(Object.entries(signals).map(([k,v]) => [k, score(v)])) as Record<DeptKey, number>;

    const rationale: Record<DeptKey, string> = {
      sales: "Indikatorer: pricing/demo/call-to-action, e-handelsord",
      marketing: "Indikatorer: blogg/nyheter/press + sociala länkar",
      hr: "Indikatorer: careers/jobs",
      it: "Indikatorer: API/Platform/Docs/SDK",
      "customer-service": "Indikatorer: support/help/faq",
      operations: "Indikatorer: logistics/warehouse/delivery",
      finance: "Indikatorer: invoice/billing/pricing/ROI",
      management: "Indikatorer: strategy/leadership"
    };

    const sorted = Object.entries(deptScores).sort((a,b) => b[1]-a[1]);
    const recommended = sorted.slice(0,2).map(([dept,score]) => ({ dept, score }));

    const companyProfile = {
      url: url || scrape?.summary?.overview?.url || "",
      companyName,
      title,
      description,
      sector,
      headings: headings.slice(0,10),
      products: products.slice(0,15),
      services: services.slice(0,15),
      people: people.slice(0,10),
      contacts,
      socials: socials.slice(0,10),
      servicesLinks: servicesLinks.slice(0,10),
      textPreview: mainText.slice(0,1500)
    };

    const deptSignals = { scores: deptScores, rationale };

    return NextResponse.json({ profile: companyProfile, deptSignals, recommendedDepartments: recommended });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to build profile" }, { status: 500 });
  }
}


