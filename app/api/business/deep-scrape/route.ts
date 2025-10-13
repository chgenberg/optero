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

    // Normalize URL: ensure protocol
    let targetUrl = String(url).trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Helper: resilient fetch with retry/backoff
    const fetchWithRetry = async (input: string, init: RequestInit & { timeoutMs?: number } = {}) => {
      const maxRetries = 2;
      const timeoutMs = init.timeoutMs ?? 8000;
      let lastErr: any;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), timeoutMs);
          const res = await fetch(input, {
            ...init,
            signal: ctrl.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; MendioPremiumCrawler/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
              'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
              ...(init.headers || {})
            }
          } as any);
          clearTimeout(t);
          if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
          return res;
        } catch (e) {
          lastErr = e;
          await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
        }
      }
      throw lastErr;
    };

    // Fetch main page
    const mainResponse = await fetchWithRetry(targetUrl);
    const mainHtml = await mainResponse.text();
    const $ = cheerio.load(mainHtml);

    // Extract sitemap URLs (robots.txt → sitemap, then sitemap.xml)
    let sitemapUrls: string[] = [];
    try {
      // robots.txt
      try {
        const robotsRes = await fetchWithRetry(`${new URL(targetUrl).origin}/robots.txt`, { timeoutMs: 3000 });
        if (robotsRes.ok) {
          const robots = await robotsRes.text();
          const m = robots.match(/sitemap:\s*(.*)/i);
          if (m && m[1]) {
            const robSitemap = m[1].trim();
            const smRes = await fetchWithRetry(robSitemap, { timeoutMs: 6000 });
            if (smRes.ok) {
              const smXml = await smRes.text();
              const $s = cheerio.load(smXml, { xmlMode: true });
              $s('url > loc').each((_, el) => {
                const locUrl = $s(el).text();
                if (locUrl) sitemapUrls.push(locUrl);
              });
            }
          }
        }
      } catch {}

      // fallback sitemap.xml
      const sitemapResponse = await fetchWithRetry(`${new URL(targetUrl).origin}/sitemap.xml`, { timeoutMs: 6000 });
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
      const baseUrl = new URL(targetUrl).origin;
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        try {
          const fullUrl = new URL(href, targetUrl).href;
          if (fullUrl.startsWith(baseUrl) && sitemapUrls.length < 10) {
            sitemapUrls.push(fullUrl);
          }
        } catch {}
      });
    }

    // Premium: crawl up to 20 pages
    sitemapUrls = Array.from(new Set([targetUrl, ...sitemapUrls])).slice(0, 20);

    // Scrape each page
    const pageContents: Array<{ 
      url: string; 
      title: string; 
      text: string;
      meta?: { description?: string; ogTitle?: string; ogDescription?: string; canonical?: string };
      headings?: { h1: string[]; h2: string[]; h3: string[] };
      links?: string[];
      pdfs?: string[];
      schema?: { faq?: Array<{ question: string; answer: string }> };
    }> = [];
    for (const pageUrl of sitemapUrls) {
      try {
        const res = await fetchWithRetry(pageUrl, { timeoutMs: 8000 });
        if (!res.ok) continue;
        const html = await res.text();
        const $page = cheerio.load(html);
        
        // Remove scripts, styles, nav, footer
        $page('script, style, nav, footer, header').remove();
        
        const title = ($page('title').text() || $page('h1').first().text() || '').trim();
        const description = ($page('meta[name="description"]').attr('content') || '').trim();
        const ogTitle = ($page('meta[property="og:title"]').attr('content') || '').trim();
        const ogDescription = ($page('meta[property="og:description"]').attr('content') || '').trim();
        const canonical = ($page('link[rel="canonical"]').attr('href') || '').trim();

        // Headings
        const headings = { h1: [] as string[], h2: [] as string[], h3: [] as string[] };
        $page('h1').each((_, el) => headings.h1.push($page(el).text().trim()));
        $page('h2').each((_, el) => headings.h2.push($page(el).text().trim()));
        $page('h3').each((_, el) => headings.h3.push($page(el).text().trim()));

        // Links & PDFs
        const links: string[] = [];
        const pdfs: string[] = [];
        $page('a[href]').each((_, el) => {
          const href = $page(el).attr('href') || '';
          try {
            const full = new URL(href, pageUrl).href;
            if (/\.pdf(\?|#|$)/i.test(full)) pdfs.push(full);
            else links.push(full);
          } catch {}
        });

        // Text with basic structure
        const text = $page('body').text().replace(/\s+/g, ' ').trim().slice(0, 6000);

        // JSON-LD FAQ
        const schema: { faq?: Array<{ question: string; answer: string }> } = {};
        try {
          $page('script[type="application/ld+json"]').each((_, el) => {
            try {
              const json = JSON.parse($page(el).contents().text() || '{}');
              const graphs = Array.isArray(json) ? json : (json['@graph'] ? json['@graph'] : [json]);
              for (const node of graphs) {
                if (node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
                  schema.faq = schema.faq || [];
                  for (const q of node.mainEntity) {
                    const question = (q.name || '').trim();
                    const answer = (q.acceptedAnswer?.text || '').trim();
                    if (question && answer) schema.faq.push({ question, answer });
                  }
                }
              }
            } catch {}
          });
        } catch {}

        pageContents.push({ 
          url: pageUrl, 
          title, 
          text,
          meta: { description, ogTitle, ogDescription, canonical },
          headings,
          links: Array.from(new Set(links)).slice(0, 50),
          pdfs: Array.from(new Set(pdfs)).slice(0, 20),
          schema
        });
      } catch (err) {
        console.error(`Failed to scrape ${pageUrl}:`, err);
      }
    }

    // AI Analysis: extract company info, problems, USP, customer type
    const combinedText = pageContents.map(p => `${p.title}\n${p.text}`).join('\n\n').slice(0, 12000);
    
    const analysisPrompt = `Analysera följande webbplatsinnehåll (rubriker, meta, FAQ) och extrahera:

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
      max_completion_tokens: 2000
    }, {
      timeout: 90000
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

    // Return comprehensive analysis with full page content for embedding
    return NextResponse.json({
      success: true,
      url: targetUrl,
      pagesScraped: pageContents.length,
      pages: pageContents,
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

