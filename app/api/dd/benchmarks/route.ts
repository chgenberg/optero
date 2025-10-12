import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Simple static benchmarks (can be expanded per sector/company size)
const GENERIC = {
  sales: {
    conversion: 3.5, // % site conversion target
    MQL: 500 // per month (illustrative)
  },
  support: {
    AHT: 15, // minutes
    tickets: 400 // per month (illustrative baseline)
  },
  financials: {
    ARR: 1500000 // annual recurring revenue baseline (illustrative)
  },
  web: {
    conversion: 3.5
  }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = (searchParams.get('sector') || 'generic').toLowerCase();
  // For now all map to GENERIC; future: choose by sector
  return NextResponse.json({ sector, benchmarks: GENERIC });
}


