import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mql = 0,
      tickets = 0,
      aht = 0, // minutes
      conv = 0, // %
      leadBoostPct = 20, // %
      deflectionRate = 25, // %
      ahtReductionPct = 15, // %
      convLiftPct = 10, // %
      grossMarginPct = 70, // %
      cacPerMQL = 30, // currency per MQL
      agentCostPerHour = 25 // currency per hour
    } = body || {};

    const improvedMQL = Math.round(mql * (1 + leadBoostPct / 100));
    const deflected = Math.round(tickets * (deflectionRate / 100));
    const improvedAHT = aht * (1 - ahtReductionPct / 100);
    const improvedConv = conv * (1 + convLiftPct / 100);

    // Savings/revenue proxy
    const leadValue = (improvedMQL - mql) * cacPerMQL; // proxy revenue via CAC saved / alt. acquisition cost
    const supportHoursSaved = (deflected * (aht / 60)) + ((tickets - deflected) * ((aht - improvedAHT) / 60));
    const supportSavings = supportHoursSaved * agentCostPerHour;
    const gm = grossMarginPct / 100;
    const ebitImpact = (leadValue + supportSavings) * gm;

    return NextResponse.json({
      inputs: { mql, tickets, aht, conv },
      improvements: { improvedMQL, deflected, improvedAHT, improvedConv },
      estimates: { leadValue, supportHoursSaved, supportSavings, ebitImpact }
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'roi_failed' }, { status: 500 });
  }
}


