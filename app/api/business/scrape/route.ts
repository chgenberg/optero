import { NextRequest, NextResponse } from "next/server";
import cheerio from "cheerio";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "MendioBot/1.0" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

function extractText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  const text = $("body").text();
  return text.replace(/\s+/g, " ").trim();
}

function findLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
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
    const queue: string[] = [url];
    let collected = "";

    while (queue.length && visited.size < maxPages) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      try {
        const html = await fetchHtml(current);
        collected += "\n\n# " + current + "\n" + extractText(html);
        const links = findLinks(html, url);
        for (const l of links) if (!visited.has(l)) queue.push(l);
      } catch (e) {
        // ignore page errors, continue
      }
    }

    // Cap size to ~120k chars to keep token costs reasonable
    const content = collected.slice(0, 120000);
    return NextResponse.json({ content, pages: Array.from(visited) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to scrape" }, { status: 500 });
  }
}


