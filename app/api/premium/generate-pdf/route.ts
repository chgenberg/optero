import { NextRequest, NextResponse } from "next/server";

// This generates a demo PDF for preview
export async function POST(request: NextRequest) {
  try {
    const { context, results } = await request.json();
    const { profession, specialization } = context || { profession: "Ekonom", specialization: "Redovisningskonsult" };

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: #111111;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    
    .cover-page {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: #ffffff;
    }
    
    .logo {
      font-size: 1.5em;
      font-weight: 800;
      letter-spacing: 0.1em;
      margin-bottom: 3em;
      color: #111111;
    }
    
    h1 {
      font-size: 2.5em;
      margin: 0.5em 0;
      color: #111111;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .subtitle {
      font-size: 1.2em;
      color: #666666;
      margin-bottom: 3em;
      font-weight: 400;
    }
    
    .meta {
      font-size: 0.85em;
      color: #999999;
      line-height: 1.6;
    }
    
    .section {
      page-break-inside: avoid;
      margin-bottom: 3em;
    }
    
    h2 {
      font-size: 1.8em;
      color: #111111;
      border-bottom: 2px solid #111111;
      padding-bottom: 0.5em;
      margin-top: 2em;
      margin-bottom: 1em;
      font-weight: 700;
    }
    
    h3 {
      font-size: 1.3em;
      color: #333333;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      font-weight: 600;
    }
    
    .box {
      background: #f9f9f9;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 1.5em;
      margin: 1.5em 0;
      page-break-inside: avoid;
    }
    
    .highlight-box {
      background: #111111;
      color: #ffffff;
      border-radius: 12px;
      padding: 1.5em;
      margin: 1.5em 0;
    }
    
    .highlight-box h3,
    .highlight-box p {
      color: #ffffff;
    }
    
    .tool-card {
      border: 2px solid #e5e5e5;
      border-radius: 12px;
      padding: 1.5em;
      margin: 1.5em 0;
      page-break-inside: avoid;
      background: #ffffff;
    }
    
    .tool-card:hover {
      border-color: #111111;
    }
    
    .prompt-box {
      background: #f5f5f5;
      border: 1px solid #e5e5e5;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
      padding: 1.2em;
      border-radius: 8px;
      margin: 1em 0;
      font-size: 0.9em;
      color: #333333;
    }
    
    .checklist {
      list-style: none;
      padding-left: 0;
    }
    
    .checklist li {
      position: relative;
      padding-left: 2.5em;
      margin-bottom: 0.8em;
      padding-top: 0.2em;
      padding-bottom: 0.2em;
    }
    
    .checklist li:before {
      content: "□";
      position: absolute;
      left: 0;
      font-size: 1.2em;
      color: #666666;
    }
    
    .time-saved {
      background: #111111;
      color: #ffffff;
      padding: 0.4em 1em;
      border-radius: 24px;
      display: inline-block;
      font-weight: 600;
      font-size: 0.9em;
    }
    
    .badge {
      background: #f5f5f5;
      color: #666666;
      padding: 0.3em 0.8em;
      border-radius: 16px;
      display: inline-block;
      font-size: 0.85em;
      margin-right: 0.5em;
      border: 1px solid #e5e5e5;
    }
    
    .footer {
      text-align: center;
      color: #999999;
      font-size: 0.8em;
      margin-top: 4em;
      padding-top: 2em;
      border-top: 1px solid #e5e5e5;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
    }
    
    th, td {
      text-align: left;
      padding: 0.8em 1em;
      border-bottom: 1px solid #e5e5e5;
    }
    
    th {
      background: #f9f9f9;
      font-weight: 600;
      color: #111111;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
    
    .qr-section {
      text-align: center;
      margin: 2em 0;
      padding: 2em;
      background: #f9f9f9;
      border-radius: 12px;
    }
    
    .qr-code {
      width: 150px;
      height: 150px;
      margin: 1em auto;
      display: block;
    }
    
    .source-list {
      font-size: 0.85em;
      line-height: 1.6;
      color: #666666;
    }
    
    .source-list li {
      margin-bottom: 0.5em;
    }
    
    .page-number {
      position: fixed;
      bottom: 1cm;
      right: 2cm;
      font-size: 0.8em;
      color: #999999;
    }
  </style>
</head>
<body>

<!-- Cover Page -->
<div class="cover-page">
  <div class="logo">MENDIO</div>
  <h1>Din Personliga AI-Guide</h1>
  <div class="subtitle">Skräddarsydd för ${specialization || profession}</div>
  <div class="meta">
    <p>Genererad ${new Date().toLocaleDateString('sv-SE')}</p>
    <p>28 sidor med konkreta AI-lösningar för ditt arbete</p>
  </div>
</div>

<!-- Table of Contents -->
<div class="section">
  <h2>Innehållsförteckning</h2>
  <ol>
    <li>Sammanfattning & Quick Wins ..................... 3</li>
    <li>Dina AI-verktyg i detalj ........................ 5</li>
    <li>4-veckors implementeringsplan ................... 12</li>
    <li>Praktiska exempel från din vardag .............. 18</li>
    <li>Färdiga prompts att kopiera .................... 22</li>
    <li>Bonusmaterial & resurser ....................... 26</li>
  </ol>
</div>

<!-- Page 3: Summary -->
<div class="section">
  <h2>1. Sammanfattning & Quick Wins</h2>
  
  <div class="highlight-box">
    <h3>Din potential med AI</h3>
    <p>Som ${specialization || profession} har du unika möjligheter att spara tid och förbättra kvaliteten i ditt arbete med AI. Baserat på din profil har vi identifierat att du kan spara <span class="time-saved">5-8 timmar per vecka</span> genom att implementera rätt AI-verktyg och arbetssätt.</p>
  </div>
  
  <h3>Dina största möjligheter</h3>
  <div class="box">
    <h4>📧 Email & kommunikation</h4>
    <p>Reducera tiden med <span class="badge">70%</span> genom AI-assisterad skrivning</p>
  </div>
  
  <div class="box">
    <h4>📊 Rapportering</h4>
    <p>Automatisera dataanalys och rapportgenerering - spara <span class="badge">3h/vecka</span></p>
  </div>
  
  <div class="box">
    <h4>📄 Dokumenthantering</h4>
    <p>Sammanfatta, analysera och skapa dokument <span class="badge">10x snabbare</span></p>
  </div>
  
  <div class="box">
    <h4>🗓️ Möten</h4>
    <p>AI-genererade agendor, anteckningar och uppföljning - <span class="badge">45 min/möte</span></p>
  </div>
  
  <h3>⚡ Quick Wins - Börja här!</h3>
  <div class="checklist">
    <ul class="checklist">
      <li>Installera ChatGPT och testa för första email-svaret</li>
      <li>Använd AI för att sammanfatta nästa långa dokument</li>
      <li>Låt AI skapa agendan för ditt nästa möte</li>
      <li>Automatisera en återkommande rapport denna vecka</li>
    </ul>
  </div>
</div>

<!-- Page 5: Detailed Tools -->
<div class="section">
  <h2>2. Dina AI-verktyg i detalj</h2>
  
  <div class="tool-card">
    <h3>ChatGPT Plus</h3>
    <p><strong>Kostnad:</strong> 20$/månad | <strong>ROI:</strong> 10x | <strong>Tidsbesparing:</strong> 2-3h/dag</p>
    
    <h4>Varför just för dig som ${specialization}?</h4>
    <p>ChatGPT är din digitala assistent som förstår kontexten i ditt arbete. Den kan hjälpa dig med allt från att skriva professionella email till att analysera komplexa dataset och generera rapporter.</p>
    
    <h4>Steg-för-steg setup:</h4>
    <ol>
      <li>Gå till chat.openai.com och skapa konto</li>
      <li>Uppgradera till Plus för prioriterad åtkomst</li>
      <li>Installera browser-tillägget för snabb åtkomst</li>
      <li>Skapa "Custom Instructions" med din yrkesroll</li>
      <li>Börja med enkla uppgifter och öka komplexiteten</li>
    </ol>
    
    <h4>Dina färdiga prompts:</h4>
    <div class="prompt-box">
"Agera som en erfaren ${specialization}. Jag behöver hjälp med att [UPPGIFT]. 
Ge mig ett professionellt svar som tar hänsyn till [KONTEXT]."
    </div>
    
    <div class="prompt-box">
"Analysera denna data och identifiera de 3 viktigaste insikterna:
[KLISTRA IN DATA]
Presentera resultatet i bullet points med konkreta åtgärdsförslag."
    </div>
  </div>
  
  <div class="tool-card">
    <h3>Notion AI</h3>
    <p><strong>Kostnad:</strong> 10$/månad | <strong>ROI:</strong> 8x | <strong>Tidsbesparing:</strong> 1-2h/dag</p>
    
    <h4>Perfekt för din dokumenthantering</h4>
    <p>Som ${specialization} hanterar du mycket dokumentation. Notion AI integrerar sömlöst i ditt arbetsflöde och hjälper dig organisera, skapa och analysera dokument direkt där du arbetar.</p>
    
    <h4>Användningsområden för dig:</h4>
    <ul>
      <li>Skapa projektdokumentation automatiskt</li>
      <li>Sammanfatta möten och generera action items</li>
      <li>Bygga kunskapsdatabaser som uppdateras automatiskt</li>
      <li>Generera rapporter från dina anteckningar</li>
    </ul>
  </div>
</div>

<!-- Page 12: Implementation Plan -->
<div class="section">
  <h2>3. Din 4-veckors implementeringsplan</h2>
  
  <h3>Vecka 1: Foundation</h3>
  <div class="highlight-box">
    <p><strong>Mål:</strong> Få igång grundverktygen och testa enkla användningsfall</p>
  </div>
  
  <ul class="checklist">
    <li>Måndag: Skapa konton för ChatGPT och Notion</li>
    <li>Tisdag: Genomför grundsetup och anpassningar</li>
    <li>Onsdag: Testa AI för 3 email-svar</li>
    <li>Torsdag: Använd AI för att sammanfatta ett dokument</li>
    <li>Fredag: Dokumentera vad som fungerade bra</li>
  </ul>
  
  <h3>Vecka 2: Expansion</h3>
  <div class="highlight-box">
    <p><strong>Mål:</strong> Integrera AI i dagliga rutiner</p>
  </div>
  
  <ul class="checklist">
    <li>Använd AI för ALL email-hantering denna vecka</li>
    <li>Skapa mallar för återkommande uppgifter</li>
    <li>Testa dataanalys med AI</li>
    <li>Dela framgångar med en kollega</li>
    <li>Identifiera nästa process att automatisera</li>
  </ul>
</div>

<!-- Page 18: Examples -->
<div class="section">
  <h2>4. Praktiska exempel från din vardag</h2>
  
  <h3>Exempel 1: Månadsrapport</h3>
  <table>
    <tr>
      <th>Före AI</th>
      <th>Efter AI</th>
    </tr>
    <tr>
      <td>
        <ul>
          <li>2 timmar dataanalys i Excel</li>
          <li>1 timme rapportskrivning</li>
          <li>30 min formatering</li>
          <li><strong>Total: 3.5 timmar</strong></li>
        </ul>
      </td>
      <td>
        <ul>
          <li>15 min data till AI</li>
          <li>5 min justering av AI-rapport</li>
          <li>10 min granskning</li>
          <li><strong>Total: 30 minuter</strong></li>
        </ul>
      </td>
    </tr>
  </table>
  <p class="time-saved">Tidsbesparing: 3 timmar (86%)</p>
  
  <h3>Exempel 2: Kundkommunikation</h3>
  <div class="highlight-box">
    <p><strong>Scenario:</strong> Komplex teknisk förfrågan från kund</p>
    <p><strong>Före:</strong> 45 min research + 30 min skrivande = 1.25 timmar</p>
    <p><strong>Efter:</strong> 5 min prompt till AI + 10 min anpassning = 15 minuter</p>
    <p><strong>Resultat:</strong> Snabbare svar, högre kvalitet, nöjdare kund</p>
  </div>
</div>

<!-- Page 22: Prompt Library -->
<div class="section">
  <h2>5. Din Prompt-bibliotek</h2>
  
  <h3>För Email & Kommunikation</h3>
  <div class="prompt-box">
"Skriv ett professionellt svar på detta email. Tonen ska vara vänlig men professionell.
Inkludera: [HUVUDPUNKTER]
Email att svara på: [KLISTRA IN EMAIL]"
  </div>
  
  <h3>För Rapportgenerering</h3>
  <div class="prompt-box">
"Skapa en månadsrapport för [MÅNAD] baserat på denna data:
[DATA]
Inkludera: Sammanfattning, nyckeltal, trender, rekommendationer.
Format: Professionell rapport för ledningsgruppen."
  </div>
  
  <h3>För Dataanalys</h3>
  <div class="prompt-box">
"Analysera denna dataset och:
1. Identifiera de 3 viktigaste trenderna
2. Hitta eventuella avvikelser
3. Ge konkreta rekommendationer
Data: [KLISTRA IN]"
  </div>
</div>

<!-- Page 26: Bonus -->
<div class="section">
  <h2>6. Bonusmaterial & Resurser</h2>
  
  <h3>🎁 Exklusiva resurser för dig</h3>
  <ul>
    <li><strong>Video-tutorials:</strong> 5 st steg-för-steg guider (länk i email)</li>
    <li><strong>Prompt-templates:</strong> 50+ färdiga prompts för ${profession}</li>
    <li><strong>Community-access:</strong> Gå med i vår Slack-grupp</li>
    <li><strong>Månadswebinar:</strong> Lär dig nya AI-tricks varje månad</li>
  </ul>
  
  <h3>📚 Rekommenderad läsning</h3>
  <ul>
    <li>"The AI-First Company" - Ash Fontana</li>
    <li>"Co-Intelligence" - Ethan Mollick</li>
    <li>"The ChatGPT Millionaire" - Neil Dagger</li>
  </ul>
  
  <h3>🚀 Nästa steg</h3>
  <div class="highlight-box">
    <h4>Vecka 5 och framåt:</h4>
    <ul>
      <li>Utforska branschspecifika AI-verktyg</li>
      <li>Skapa egna automationer med Zapier + AI</li>
      <li>Bli AI-ambassadör på din arbetsplats</li>
      <li>Håll dig uppdaterad via vår nyhetsbrev</li>
    </ul>
  </div>
</div>

<!-- Footer -->
<!-- QR Code Section -->
<div class="section">
  <div class="qr-section">
    <h3>Din AI-Coach väntar på dig</h3>
    <p>Scanna QR-koden för direkt tillgång till din personliga AI-coach</p>
    <!-- QR code skulle genereras dynamiskt här -->
    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5RUi1rb2Q8L3RleHQ+Cjwvc3ZnPg==" alt="QR Code" class="qr-code" />
    <p style="margin-top: 1em;">
      <strong>URL:</strong> mendio.io/coach/${context?.sessionId || 'demo'}
    </p>
  </div>
</div>

<!-- Sources Section -->
<div class="section">
  <h2>Källor & Referenser</h2>
  
  <div class="box">
    <h3>AI-verktyg & Teknologier</h3>
    <ol class="source-list">
      <li>OpenAI. (2024). <em>ChatGPT Plus Documentation</em>. https://platform.openai.com/docs</li>
      <li>Anthropic. (2024). <em>Claude Pro Features</em>. https://www.anthropic.com/claude</li>
      <li>Google. (2024). <em>Gemini Advanced for Professionals</em>. https://gemini.google.com</li>
      <li>Microsoft. (2024). <em>Copilot for Microsoft 365</em>. https://www.microsoft.com/copilot</li>
      <li>Notion. (2024). <em>Notion AI Workspace</em>. https://www.notion.so/product/ai</li>
    </ol>
  </div>
  
  <div class="box">
    <h3>Forskning & Studier</h3>
    <ol class="source-list">
      <li>McKinsey & Company. (2024). <em>The state of AI in 2024: Generative AI's breakout year</em>. McKinsey Global Institute.</li>
      <li>Gartner. (2024). <em>Top Strategic Technology Trends for 2024</em>. Gartner Research.</li>
      <li>MIT Sloan. (2024). <em>How Generative AI Is Changing Creative Work</em>. MIT Sloan Management Review.</li>
      <li>Harvard Business Review. (2024). <em>AI Won't Replace Humans — But Humans With AI Will Replace Humans Without AI</em>.</li>
    </ol>
  </div>
  
  <div class="box">
    <h3>Branschspecifika Källor</h3>
    <ol class="source-list">
      <li>Sveriges HR Förening. (2024). <em>AI i HR - En praktisk guide</em>.</li>
      <li>Ekonomistyrningsverket. (2024). <em>Digitalisering och AI i offentlig förvaltning</em>.</li>
      <li>Svenskt Näringsliv. (2024). <em>AI för svenska företag - möjligheter och utmaningar</em>.</li>
    </ol>
  </div>
  
  <div class="box">
    <h3>Etik & Best Practices</h3>
    <ol class="source-list">
      <li>EU Commission. (2024). <em>Ethics Guidelines for Trustworthy AI</em>. European Commission.</li>
      <li>ISO/IEC. (2024). <em>ISO/IEC 23053:2022 - Framework for AI systems using ML</em>.</li>
      <li>GDPR & AI. (2024). <em>Guidelines on AI and Data Protection</em>. European Data Protection Board.</li>
    </ol>
  </div>
</div>

<div class="footer">
  <p>© 2024 Mendio.io | Din partner för AI i arbetslivet</p>
  <p>Support: support@mendio.io | Tel: +46 732 30 55 21</p>
  <p>Detta dokument är skyddat av upphovsrätt och får inte reproduceras utan tillstånd.</p>
</div>

</body>
</html>
    `;

    // Return HTML that can be converted to PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error("Error generating PDF preview:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
