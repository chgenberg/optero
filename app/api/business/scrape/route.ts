import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import prisma from "@/lib/prisma";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 
    "User-Agent": "MendioBot/1.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7"
  } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

// Fallback: server-side rendered content via Jina AI Reader
async function fetchRenderedViaJina(targetUrl: string): Promise<string | null> {
  try {
    const urlObj = new URL(targetUrl);
    const hostAndPath = urlObj.host + urlObj.pathname + urlObj.search;
    const candidates = [
      `https://r.jina.ai/http://${hostAndPath}`,
      `https://r.jina.ai/https://${hostAndPath}`
    ];
    for (const jinaUrl of candidates) {
      try {
        const resp = await fetch(jinaUrl, { headers: { "User-Agent": "MendioBot/1.0" } });
        if (!resp.ok) continue;
        const text = await resp.text();
        if (text && text.length > 0) return text;
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

// Browserless render (optional)
async function fetchRenderedViaBrowserless(targetUrl: string): Promise<string | null> {
  try {
    const key = process.env.BROWSERLESS_API_KEY;
    if (!key) return null;
    const payload = {
      url: targetUrl,
      gotoOptions: { waitUntil: 'networkidle2', timeout: 60000 },
      headers: {
        'User-Agent': 'MendioBot/1.0',
        'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    } as any;
    const res = await fetch(`https://chrome.browserless.io/content?token=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html || null;
  } catch {
    return null;
  }
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
  const siteName = cleanText($('meta[property="og:site_name"]').attr("content") || title);
  
  // Try to extract Organization schema
  let companyName = "";
  const jsonLd: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const txt = $(el).contents().text();
      const obj = JSON.parse(txt);
      if (Array.isArray(obj)) jsonLd.push(...obj); else jsonLd.push(obj);
    } catch {}
  });
  const isType = (obj: any, type: string) => obj && (obj['@type'] === type || (Array.isArray(obj['@type']) && obj['@type'].includes(type)));
  const orgSchema = jsonLd.find((o: any) => isType(o, 'Organization'));
  if (orgSchema?.name) companyName = cleanText(String(orgSchema.name));

  // Collect people and products/services hints
  const people = jsonLd.filter((o: any) => isType(o, 'Person')).map((p: any) => cleanText(p.name || '')).filter(Boolean).slice(0, 10);
  const products = jsonLd.filter((o: any) => isType(o, 'Product')).map((p: any) => cleanText(p.name || p.description || '')).filter(Boolean).slice(0, 15);
  const services = jsonLd.filter((o: any) => isType(o, 'Service')).map((s: any) => cleanText(s.name || s.description || '')).filter(Boolean).slice(0, 15);
  const breadcrumbs = jsonLd.filter((o: any) => isType(o, 'BreadcrumbList')).flatMap((b: any) => (Array.isArray(b.itemListElement) ? b.itemListElement.map((el: any) => cleanText(el?.name || '')) : [])).filter(Boolean).slice(0, 20);
  if (!companyName) companyName = siteName || title;
  
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

  // Readability extraction (förbättrad huvudtext) – använd om längre/tydligare
  try {
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const readable = cleanText(article?.textContent || "");
    if (readable && readable.length > mainText.length * 0.9) {
      mainText = readable;
      if (!title && article?.title) {
        // Använd Readability-title om vi saknar title
        // title variabeln är const ovan; skapa lokal fallbackTitle och override i returen
      }
    }
  } catch {}
  
  // Keywords/topics (från headings och meta)
  const keywords = ($('meta[name="keywords"]').attr("content") || "").split(",").map(k => cleanText(k)).filter(Boolean);

  // Simple USP extraction: top list items
  const usps = $("li").slice(0, 20).map((_, el) => cleanText($(el).text())).get().filter(t => t && t.length <= 140).slice(0, 8);

  // Contacts
  const linksAll = new Set<string>();
  $("a[href]").each((_, el) => { const h = $(el).attr("href") || ""; if (h) linksAll.add(h); });
  const emails = Array.from(linksAll).filter(h => h.startsWith("mailto:")).map(h => h.replace(/^mailto:/, ''));
  const phones = Array.from(linksAll).filter(h => h.startsWith("tel:")).map(h => h.replace(/^tel:/, ''));
  const contactLinks = Array.from(linksAll).filter(h => /kontakt|contact/i.test(h));
  const socials = Array.from(linksAll).filter(h => /facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|youtube\.com/i.test(h));

  // Likely service/product and team pages
  const allAbsLinks = Array.from(linksAll).map(h => { try { return new URL(h, url).toString(); } catch { return ''; } }).filter(Boolean);
  const likelyTeamPages = allAbsLinks.filter(l => /team|about|om|people|medarbet/i.test(l)).slice(0, 10);
  const servicesLinks = allAbsLinks.filter(l => /service|tjanst|tjänst|produkt|product/i.test(l)).slice(0, 15);
  
  return {
    url,
    companyName,
    siteName,
    title,
    description,
    headings: headings.slice(0, 10),
    keywords: keywords.slice(0, 10),
    mainText: mainText.slice(0, 8000),
    length: mainText.length,
    usps,
    contacts: { emails: Array.from(new Set(emails)), phones: Array.from(new Set(phones)), contactLinks: Array.from(new Set(contactLinks)) },
    socials: Array.from(new Set(socials)),
    servicesLinks,
    people,
    products,
    services,
    breadcrumbs,
    likelyTeamPages
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

async function fetchSitemap(baseUrl: string): Promise<string[]> {
  const sitemapPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap'];
  const collected: string[] = [];
  for (const path of sitemapPaths) {
    try {
      const sitemapUrl = new URL(path, baseUrl).toString();
      const res = await fetch(sitemapUrl, { headers: { 
        "User-Agent": "MendioBot/1.0",
        "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7"
      } });
      if (!res.ok) continue;
      const xml = await res.text();
      const $ = load(xml, { xmlMode: true });
      // If it's a sitemap index, follow nested sitemaps (limited)
      const nested = $("sitemap > loc").map((_, el) => $(el).text()).get().slice(0, 5);
      if (nested.length) {
        for (const loc of nested) {
          try {
            const r = await fetch(loc, { headers: { "User-Agent": "MendioBot/1.0" } });
            if (!r.ok) continue;
            const xml2 = await r.text();
            const $2 = load(xml2, { xmlMode: true });
            const urls2 = $2("url > loc").map((_, el) => $2(el).text()).get();
            collected.push(...urls2);
            if (collected.length > 200) break;
          } catch {}
        }
        break;
      }
      const urls = $("url > loc").map((_, el) => $(el).text()).get();
      if (urls.length > 0) {
        collected.push(...urls);
        break;
      }
    } catch {}
  }
  return collected.slice(0, 500);
}

export async function POST(req: NextRequest) {
  try {
    const { url, maxPages = 25 } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const visited = new Set<string>();
    const priorityPages: string[] = [];
    const allPages: any[] = [];
    
    // Priority keywords for important pages
    const priorityKeywords = ['om-oss', 'om', 'about', 'tjanster', 'tjänster', 'tjenester', 'services', 'produkter', 'products', 'kontakt', 'contact', 'team', 'case', 'kunder', 'customers', 'losningar', 'lösningar', 'solutions', 'pricing', 'priser', 'careers', 'jobb'];
    
    // Try to get sitemap first
    const sitemapUrls = await fetchSitemap(url);
    const prioritySitemapUrls = sitemapUrls.filter(u => 
      priorityKeywords.some(k => u.toLowerCase().includes(k))
    ).slice(0, 10);
    
    // Common fallback paths to seed early
    const fallbackPaths = ['/about', '/om', '/services', '/tjanster', '/tjänster', '/products', '/produkter', '/solutions', '/losningar', '/lösningar', '/customers', '/kunder', '/contact', '/kontakt', '/pricing', '/priser', '/careers', '/jobb'];
    const seededPaths = Array.from(new Set(fallbackPaths.map(p => { try { return new URL(p, url).toString(); } catch { return ''; } }).filter(Boolean)));
    // Start with homepage + priority sitemap URLs + seeded common paths
    const queue: string[] = [url, ...prioritySitemapUrls, ...seededPaths];

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
        
        // Skip pagination, archives, and duplicate-looking URLs
        const skipPatterns = ['/page/', '/arkiv/', '/archive/', '?page=', '&page=', '/tag/', '/kategori/', '/category/'];
        const filteredLinks = [...priorityLinks, ...otherLinks].filter(l => 
          !skipPatterns.some(p => l.includes(p))
        );
        
        for (const l of filteredLinks) {
          if (!visited.has(l) && queue.length < 40) queue.push(l);
        }
      } catch (e) {
        console.error(`Failed to scrape ${current}:`, e);
      }
    }

  // Always attempt Playwright render once to capture SPA/JS content
  const totalText = allPages.reduce((sum, p) => sum + (p.mainText?.length || 0), 0);
  const MIN_TEXT_LEN = 2000;
  try {
    const htmlRendered = await renderWithPlaywright(url);
    if (htmlRendered) {
      const rendered = extractStructuredData(htmlRendered, url + " (rendered)");
      // Only prepend if we actually get more text than initial fetch or if initial was sparse
      const hasValue = (rendered.mainText?.length || 0) > 300 || totalText < MIN_TEXT_LEN;
      if (hasValue) allPages.unshift(rendered);
    }
  } catch (e) {
    console.error("Playwright render failed:", e);
  }

  // Try Browserless if available and content still thin
  try {
    const afterPwLen = allPages.reduce((s,p)=>s+(p.mainText?.length||0),0);
    if (afterPwLen < MIN_TEXT_LEN) {
      const blHtml = await fetchRenderedViaBrowserless(url);
      if (blHtml) {
        const rendered = extractStructuredData(blHtml, url + " (browserless)");
        if ((rendered.mainText?.length || 0) > 300) allPages.unshift(rendered);
      }
    }
  } catch (e) {
    console.error("Browserless render failed:", e);
  }

  // If still empty, force Jina fallback
  const afterRenderLen = allPages.reduce((sum, p) => sum + (p.mainText?.length || 0), 0);
  if (afterRenderLen < 500) {
    try {
      // Try homepage via Jina
      const tryUrls = [url, ...seededPaths].slice(0, 6);
      for (const u of tryUrls) {
        const jinaText = await fetchRenderedViaJina(u);
        if (jinaText && jinaText.length > 300) {
          const cleanse = (t: string) => t.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
          const jinaMain = cleanse(jinaText).slice(0, 8000);
          const jinaPage = {
            url: u + " (jina)",
            title: '',
            description: '',
            headings: [],
            keywords: [],
            mainText: jinaMain,
            length: jinaMain.length
          };
          allPages.unshift(jinaPage as any);
        }
      }
    } catch (e) {
      console.error("Forced Jina fallback failed:", e);
    }
  }

  // Additional fallback: Jina AI Reader for JS-heavy sites, regardless of Playwright availability
  const totalAfterPw = allPages.reduce((sum, p) => sum + (p.mainText?.length || 0), 0);
  if (totalAfterPw < MIN_TEXT_LEN) {
    try {
      const jinaText = await fetchRenderedViaJina(url);
      if (jinaText && jinaText.length > 500) {
        const cleanse = (t: string) => t.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
        const jinaMain = cleanse(jinaText).slice(0, 8000);
        const jinaPage = {
          url: url + " (jina)",
          title: '',
          description: '',
          headings: [],
          keywords: [],
          mainText: jinaMain,
          length: jinaMain.length
        };
        allPages.unshift(jinaPage as any);
      }
    } catch (e) {
      console.error("Jina fallback failed:", e);
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

    // Persist scrape summary
    try {
      await prisma.companyScrapeRun.create({
        data: {
          url,
          summary,
          content: cleanContent.slice(0, 60000),
          pages: visited.size,
          totalTextLength: totalText,
        }
      });
    } catch (e) {
      console.error("Failed to persist CompanyScrapeRun:", e);
    }

    return NextResponse.json({
      content: cleanContent.slice(0, 60000),
      summary,
      pages: Array.from(visited),
      totalTextLength: totalText,
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
    const browser = await chromium.launch({ args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ]});

    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
    ];
    const ua = userAgents[Math.floor(Math.random() * userAgents.length)];

    const mendioWhitelist = [
      'functionalfoods.se'
    ];
    const isWhitelisted = mendioWhitelist.some(d => {
      try { return new URL(targetUrl).hostname.includes(d); } catch { return false; }
    });

    const context = await chromium.launchPersistentContext('', {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ],
      viewport: { width: 1366, height: 900 },
      userAgent: isWhitelisted ? 'MendioBot/1.0' : ua,
      locale: 'en-US',
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' }
    });

    const page = await context.newPage();
    await page.addInitScript(() => {
      // @ts-ignore
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    const html = await page.content();
    await context.close();
    await browser.close();
    return html;
  } catch (e) {
    return null;
  }
}


