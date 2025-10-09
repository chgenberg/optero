import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "MendioBot/1.0" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

function extractStructuredData(html: string, url: string): any {
  const $ = load(html);
  
  // Remove noise
  $("script, style, noscript, nav, header, footer, aside, .cookie, .banner, .popup").remove();
  
  // Helper to clean text from control chars
  const cleanText = (text: string) => text.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, " ").trim();
  
  // Extract metadata
  const title = cleanText($("title").text() || $('meta[property="og:title"]').attr("content") || "");
  const description = cleanText($('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "");
  
  // Extract headings (structure)
  const headings = $("h1, h2, h3").map((_, el) => cleanText($(el).text())).get().filter(Boolean);
  
  // Main content (prioritera main, article, eller största text-block)
  let mainText = "";
  if ($("main").length) {
    mainText = $("main").text();
  } else if ($("article").length) {
    mainText = $("article").text();
  } else {
    mainText = $("body").text();
  }
  mainText = cleanText(mainText);
  
  // Keywords/topics (från headings och meta)
  const keywords = ($('meta[name="keywords"]').attr("content") || "").split(",").map(k => cleanText(k)).filter(Boolean);
  
  return {
    url,
    title,
    description,
    headings: headings.slice(0, 10),
    keywords: keywords.slice(0, 10),
    mainText: mainText.slice(0, 8000),
    length: mainText.length
  };
}

function findLinks(html: string, baseUrl: string): string[] {
  const $ = load(html);
  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
    let absolute = href;
    try {
      absolute = new URL(href, baseUrl).toString();
    } catch {}
    // same-origin only, avoid large external crawls
    if (absolute.startsWith(new URL(baseUrl).origin)) links.add(absolute);
  });
  return Array.from(links);
}

export async function POST(req: NextRequest) {
  try {
    const { url, maxPages = 8 } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const visited = new Set<string>();
    const priorityPages: string[] = [];
    const allPages: any[] = [];
    
    // Priority keywords for important pages
    const priorityKeywords = ['om-oss', 'om', 'about', 'tjanster', 'services', 'produkter', 'products', 'kontakt', 'contact', 'team'];
    
    // Start with homepage
    const queue: string[] = [url];

    while (queue.length && visited.size < maxPages) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      try {
        const html = await fetchHtml(current);
        const data = extractStructuredData(html, current);
        allPages.push(data);
        
        // Prioritize important pages
        const urlLower = current.toLowerCase();
        if (priorityKeywords.some(k => urlLower.includes(k))) {
          priorityPages.push(current);
        }
        
        const links = findLinks(html, url);
        // Add priority links first
        const priorityLinks = links.filter(l => priorityKeywords.some(k => l.toLowerCase().includes(k)));
        const otherLinks = links.filter(l => !priorityKeywords.some(k => l.toLowerCase().includes(k)));
        
        for (const l of [...priorityLinks, ...otherLinks]) {
          if (!visited.has(l) && queue.length < 20) queue.push(l);
        }
      } catch (e) {
        console.error(`Failed to scrape ${current}:`, e);
      }
    }

    // If content looks too small and fallback enabled, try Playwright
    const totalText = allPages.reduce((sum, p) => sum + (p.mainText?.length || 0), 0);
    const MIN_TEXT_LEN = 2000;
    if (totalText < MIN_TEXT_LEN && process.env.ENABLE_PLAYWRIGHT === 'true') {
      try {
        const htmlRendered = await renderWithPlaywright(url);
        if (htmlRendered) {
          const rendered = extractStructuredData(htmlRendered, url + " (rendered)");
          allPages.unshift(rendered);
        }
      } catch (e) {
        console.error("Playwright fallback failed:", e);
      }
    }

    // Helper to clean any string recursively
    const deepClean = (obj: any): any => {
      if (typeof obj === 'string') return obj.replace(/[\x00-\x1F\x7F]/g, ' ');
      if (Array.isArray(obj)) return obj.map(deepClean);
      if (obj && typeof obj === 'object') {
        const cleaned: any = {};
        for (const [k, v] of Object.entries(obj)) {
          cleaned[k] = deepClean(v);
        }
        return cleaned;
      }
      return obj;
    };

    // Build rich summary for AI
    const summary = deepClean({
      company: url,
      pages: allPages.length,
      priorityPages,
      overview: allPages[0] || {},
      allData: allPages.slice(0, 6).map(p => ({
        url: p.url,
        title: p.title,
        description: p.description,
        headings: p.headings?.slice(0, 5),
        mainText: p.mainText?.slice(0, 2000)
      }))
    });

    // Create rich text summary for GPT
    const richContent = `
FÖRETAG: ${url}
TITEL: ${summary.overview.title || 'N/A'}
BESKRIVNING: ${summary.overview.description || 'N/A'}
NYCKELORD: ${summary.overview.keywords?.join(', ') || 'N/A'}

VIKTIGA SIDOR HITTADE: ${priorityPages.join(', ') || 'Endast startsidan'}

HUVUDRUBRIKER:
${summary.overview.headings?.join('\n') || 'Inga rubriker'}

INNEHÅLL FRÅN ${allPages.length} SIDOR:
${allPages.map(p => `\n## ${p.title || p.url}\n${p.mainText?.slice(0, 1500) || ''}`).join('\n')}
`.trim();

    // Remove control characters that break JSON
    const cleanContent = richContent.replace(/[\x00-\x1F\x7F]/g, ' ');

    return NextResponse.json({ 
      content: cleanContent.slice(0, 60000),
      summary,
      pages: Array.from(visited),
      totalTextLength: totalText
    });
  } catch (e: any) {
    console.error("Scrape error:", e);
    return NextResponse.json({ error: e?.message || "Failed to scrape" }, { status: 500 });
  }
}

async function renderWithPlaywright(targetUrl: string): Promise<string | null> {
  try {
    // dynamic import via variable to prevent bundlers from resolving at build time
    const modName: any = 'playwright';
    // @ts-ignore - resolved at runtime only if installed
    const { chromium } = await import(modName);
    const browser = await chromium.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    // give some time for hydration-heavy apps
    await page.waitForTimeout(1500);
    const html = await page.content();
    await browser.close();
    return html;
  } catch (e) {
    return null;
  }
}


