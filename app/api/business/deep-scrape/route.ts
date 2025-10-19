import { NextRequest, NextResponse } from "next/server";
import { deepScrapeSite } from "@/lib/deepScrape";

export async function POST(req: NextRequest) {
  try {
    const { url, documentContent } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }
    const result = await deepScrapeSite(url, documentContent);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Deep scrape error:', error);
    return NextResponse.json({ 
      error: "Failed to scrape website",
      details: error.message 
    }, { status: 500 });
  }
}

