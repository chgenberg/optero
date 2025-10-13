import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Fetch main page
    const mainResponse = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MendioBot/1.0)' }
    });
    const mainHtml = await mainResponse.text();
    const $ = cheerio.load(mainHtml);

    // Extract sitemap URLs (simplified - check robots.txt or sitemap.xml)
    let sitemapUrls: string[] = [];
    try {
      const sitemapResponse = await fetch(`${new URL(url).origin}/sitemap.xml`);
      if (sitemapResponse.ok) {
        const sitemapXml = await sitemapResponse.text();
        const $sitemap = cheerio.load(sitemapXml, { xmlMode: true });
        $sitemap('url > loc').each((_, el) => {
          const locUrl = $sitemap(el).text();
          if (locUrl) sitemapUrls.push(locUrl);
        });
      }
    } catch {}

    // Fallback: crawl internal links from main page (limit to 10 for free)
    if (sitemapUrls.length === 0) {
      const baseUrl = new URL(url).origin;
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        try {
          const fullUrl = new URL(href, url).href;
          if (fullUrl.startsWith(baseUrl) && sitemapUrls.length < 10) {
            sitemapUrls.push(fullUrl);
          }
        } catch {}
      });
    }

    // Limit to 10 pages for now (can be premium feature to crawl more)
    sitemapUrls = Array.from(new Set([url, ...sitemapUrls])).slice(0, 10);

    // Scrape each page
    const pageContents: Array<{ url: string; title: string; text: string }> = [];
    for (const pageUrl of sitemapUrls) {
      try {
        const res = await fetch(pageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MendioBot/1.0)' },
          signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) continue;
        const html = await res.text();
        const $page = cheerio.load(html);
        
        // Remove scripts, styles, nav, footer
        $page('script, style, nav, footer, header').remove();
        
        const title = $page('title').text() || $page('h1').first().text() || '';
        const text = $page('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);
        
        pageContents.push({ url: pageUrl, title, text });
      } catch (err) {
        console.error(`Failed to scrape ${pageUrl}:`, err);
      }
    }

    // AI Analysis: extract company info, problems, USP, customer type
    const combinedText = pageContents.map(p => `${p.title}\n${p.text}`).join('\n\n').slice(0, 12000);
    
    const analysisPrompt = `Analysera följande webbplatsinnehåll och extrahera:

1. **Företagsbeskrivning**: Vad gör företaget? (1-2 meningar)
2. **Målgrupp**: Vem är deras kund? (B2B/B2C, bransch, storlek)
3. **Huvudproblem de löser**: Top 3 problem deras produkt/tjänst löser
4. **USP (Unique Selling Points)**: Vad gör dem unika? (top 3)
5. **Vanliga objections/frågor**: Vad funderar kunder på innan de köper?
6. **Content gaps**: Vad saknas på webbplatsen som skulle hjälpa besökare?
7. **Bot use case**: Vilken typ av bot skulle hjälpa dem mest? (lead qualification, FAQ support, booking, etc)

Webbplatsinnehåll:
${combinedText}

Svara i JSON-format:
{
  "description": "...",
  "audience": { "type": "B2B/B2C", "industry": "...", "size": "..." },
  "problems": ["...", "...", "..."],
  "usp": ["...", "...", "..."],
  "objections": ["...", "...", "..."],
  "contentGaps": ["...", "...", "..."],
  "recommendedBotType": "..."
}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: analysisPrompt }],
      max_completion_tokens: 1500
    }, {
      timeout: 60000
    });

    let analysis: any = {};
    try {
      const content = aiResponse.choices[0]?.message?.content || '{}';
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      analysis = JSON.parse(jsonMatch?.[1] || '{}');
    } catch (err) {
      console.error('Failed to parse AI analysis:', err);
      analysis = {
        description: "Kunde inte analysera",
        audience: { type: "Unknown", industry: "", size: "" },
        problems: [],
        usp: [],
        objections: [],
        contentGaps: [],
        recommendedBotType: "knowledge"
      };
    }

    // Return comprehensive analysis
    return NextResponse.json({
      success: true,
      url,
      pagesScraped: pageContents.length,
      pages: pageContents.map(p => ({ url: p.url, title: p.title })),
      analysis,
      rawText: combinedText.slice(0, 5000) // for debugging
    });

  } catch (error: any) {
    console.error('Deep scrape error:', error);
    return NextResponse.json({ 
      error: "Failed to scrape website",
      details: error.message 
    }, { status: 500 });
  }
}

