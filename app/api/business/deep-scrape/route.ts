import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { url, documentContent } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Normalize URL: ensure protocol, remove trailing dots, normalize whitespace
    let targetUrl = String(url).trim().replace(/\.+$/g, ''); // Remove trailing dots
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    
    // Validate URL format
    try {
      const parsed = new URL(targetUrl);
      targetUrl = parsed.href; // Use canonical URL
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
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
              'Accept-Language': 'en-US,en;q=0.9,sv;q=0.4',
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

    // Fallback: crawl internal links from main page (limit to 20 for better coverage)
    if (sitemapUrls.length === 0) {
      const baseUrl = new URL(targetUrl).origin;
      const internalLinks = new Set<string>();
      
      // Look for navigation, footer links, and important pages
      $('nav a[href], header a[href], footer a[href], a[href*="about"], a[href*="product"], a[href*="service"], a[href*="contact"], a[href*="pricing"], a[href*="features"], a[href*="team"], a[href*="blog"], a[href*="faq"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        try {
          const fullUrl = new URL(href, targetUrl).href;
          if (fullUrl.startsWith(baseUrl) && !fullUrl.includes('#') && !fullUrl.match(/\.(jpg|jpeg|png|gif|svg|ico)$/i)) {
            internalLinks.add(fullUrl);
          }
        } catch {}
      });
      
      // Also get any other internal links
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        try {
          const fullUrl = new URL(href, targetUrl).href;
          if (fullUrl.startsWith(baseUrl) && internalLinks.size < 20 && !fullUrl.includes('#') && !fullUrl.match(/\.(jpg|jpeg|png|gif|svg|ico)$/i)) {
            internalLinks.add(fullUrl);
          }
        } catch {}
      });
      
      sitemapUrls = Array.from(internalLinks);
    }

    // Premium: crawl up to 20 pages
    sitemapUrls = Array.from(new Set([targetUrl, ...sitemapUrls])).slice(0, 20);

    // Helper: extract brand colors from CSS
    const cssToColors = (css: string): string[] => {
      const colors = new Set<string>();
      const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
      const rgbRe = /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(0|1|0?\.\d+))?\s*\)/g;
      let m: RegExpExecArray | null;
      while ((m = hexRe.exec(css))) colors.add(m[0]);
      while ((m = rgbRe.exec(css))) colors.add(m[0]);
      return Array.from(colors).slice(0, 50);
    };

    // Try to fetch a few CSS files for brand clues
    let brandColors: string[] = [];
    try {
      const cssHrefs = new Set<string>();
      $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          try { cssHrefs.add(new URL(href, targetUrl).href); } catch {}
        }
      });
      // inline styles too
      $('style').each((_, el) => {
        const t = $(el).html() || '';
        brandColors.push(...cssToColors(t));
      });
      const cssList = Array.from(cssHrefs).filter(u => u.startsWith(new URL(targetUrl).origin)).slice(0, 3);
      for (const href of cssList) {
        try {
          const cssRes = await fetchWithRetry(href, { timeoutMs: 5000 });
          if (cssRes.ok) {
            const css = await cssRes.text();
            brandColors.push(...cssToColors(css));
          }
        } catch {}
      }
      brandColors = Array.from(new Set(brandColors)).slice(0, 20);
    } catch {}

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

        // Links, PDFs, emails, phone numbers
        const links: string[] = [];
        const pdfs: string[] = [];
        const emails = new Set<string>();
        const phones = new Set<string>();
        
        $page('a[href]').each((_, el) => {
          const href = $page(el).attr('href') || '';
          try {
            if (href.startsWith('mailto:')) {
              emails.add(href.replace('mailto:', '').split('?')[0]);
            } else if (href.startsWith('tel:')) {
              phones.add(href.replace('tel:', ''));
            } else {
              const full = new URL(href, pageUrl).href;
              if (/\.pdf(\?|#|$)/i.test(full)) pdfs.push(full);
              else links.push(full);
            }
          } catch {}
        });
        
        // Extract emails and phones from text
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/g;
        
        const pageText = $page('body').text();
        const foundEmails = pageText.match(emailRegex) || [];
        const foundPhones = pageText.match(phoneRegex) || [];
        
        foundEmails.forEach(e => emails.add(e));
        foundPhones.forEach(p => phones.add(p.replace(/\s+/g, '')));

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

    // Add inferred brand style info as a knowledge page
    if (brandColors.length > 0) {
      pageContents.unshift({
        url: targetUrl,
        title: 'Brand Styles',
        text: `Detected brand-related colors from CSS: ${brandColors.join(', ')}`.slice(0, 3000),
        meta: { description: 'Extracted from CSS' },
        headings: { h1: ['Brand Styles'], h2: [], h3: [] },
        links: [],
        pdfs: [],
        schema: {}
      });
    }

    // AI Analysis: extract company info, problems, USP, customer type (include documents)
    const combinedText = pageContents.map(p => `${p.title}\n${p.text}`).join('\n\n').slice(0, 12000);
    const docText = (documentContent || "").slice(0, 8000);
    const fullContext = docText ? `${combinedText}\n\n=== DOCUMENTS ===\n${docText}` : combinedText;
    
    const analysisPrompt = `Analyze the following website AND documents (if available) and extract:

1. Company description (1–2 sentences): What do they do?
2. Audience: Who is their customer? (B2B/B2C, industry, size)
3. Main problems solved: Top 3 problems their product/service solves
4. Unique selling points (Top 3)
5. Common objections/questions before purchase
6. Content gaps on the website that would help visitors
7. Best bot use case: Which bot type would help most? (lead qualification, FAQ support, booking, etc.)
8. Hidden opportunities (from documents): Problems a chatbot can solve that they may not have considered (recommendations, upsell, workflow automation)

Website + Documents:
${fullContext}

Answer in strict JSON:
{
  "description": "...",
  "audience": { "type": "B2B/B2C", "industry": "...", "size": "..." },
  "problems": ["...", "...", "..."],
  "usp": ["...", "...", "..."],
  "objections": ["...", "...", "..."],
  "contentGaps": ["...", "...", "..."],
  "recommendedBotType": "...",
  "hiddenOpportunities": ["...", "...", "..."]
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
        description: "Could not analyze",
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

