import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Fetch the website
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MendioBot/1.0)'
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract colors from CSS
    const colors = new Set<string>();
    const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b|rgb\([^)]+\)|rgba\([^)]+\)/g;
    
    // Check inline styles
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const matches = style.match(colorRegex) || [];
      matches.forEach(color => colors.add(color));
    });

    // Check common brand color locations
    const brandSelectors = [
      'header', 'nav', '.navbar', '.header', 
      '.logo', '.brand', 'h1', 'h2', 
      '.btn-primary', '.button', 'a.button'
    ];
    
    brandSelectors.forEach(selector => {
      $(selector).each((_, el) => {
        const style = $(el).attr('style') || '';
        const bgColor = $(el).css('background-color');
        const color = $(el).css('color');
        
        if (bgColor && bgColor !== 'transparent') colors.add(bgColor);
        if (color) colors.add(color);
      });
    });

    // Extract fonts
    const fonts = new Set<string>();
    const fontRegex = /font-family:\s*([^;]+)/gi;
    
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const matches = Array.from(style.matchAll(fontRegex));
      matches.forEach(match => {
        const fontList = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
        fontList.forEach(font => fonts.add(font));
      });
    });

    // Get body and heading fonts
    const bodyFont = $('body').css('font-family');
    const headingFont = $('h1, h2, h3').first().css('font-family');
    
    if (bodyFont) fonts.add(bodyFont);
    if (headingFont) fonts.add(headingFont);

    // Analyze tone based on content
    const textContent = $('body').text().toLowerCase();
    let tone: 'formal' | 'casual' | 'professional' = 'professional';
    
    const casualWords = ['hey', 'hi', 'awesome', 'cool', 'fun', '!', '😊'];
    const formalWords = ['hereby', 'pursuant', 'whereas', 'shall', 'corporation'];
    
    const casualCount = casualWords.filter(word => textContent.includes(word)).length;
    const formalCount = formalWords.filter(word => textContent.includes(word)).length;
    
    if (casualCount > formalCount * 2) tone = 'casual';
    else if (formalCount > casualCount * 2) tone = 'formal';

    // Get the most prominent color (simplified)
    const colorArray = Array.from(colors).slice(0, 10);
    const primaryColor = colorArray.find(c => c.startsWith('#')) || '#111111';
    
    // Get primary font
    const fontArray = Array.from(fonts);
    const primaryFont = fontArray[0] || 'system-ui';

    return NextResponse.json({
      brand: {
        primaryColor,
        secondaryColor: colorArray[1] || '#666666',
        fontFamily: primaryFont,
        tone,
        colors: colorArray,
        fonts: fontArray
      }
    });

  } catch (error) {
    console.error('Brand detection error:', error);
    return NextResponse.json({ 
      error: "Failed to detect brand",
      brand: {
        primaryColor: '#111111',
        secondaryColor: '#666666',
        fontFamily: 'system-ui',
        tone: 'professional'
      }
    }, { status: 200 }); // Return defaults on error
  }
}
