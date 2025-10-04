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
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
    }
    
    .cover-page {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
    }
    
    .logo {
      font-size: 2em;
      font-weight: bold;
      margin-bottom: 2em;
    }
    
    h1 {
      font-size: 3em;
      margin: 0.5em 0;
      color: #000;
    }
    
    .subtitle {
      font-size: 1.5em;
      color: #666;
      margin-bottom: 3em;
    }
    
    .meta {
      font-size: 0.9em;
      color: #999;
    }
    
    .section {
      page-break-inside: avoid;
      margin-bottom: 2em;
    }
    
    h2 {
      font-size: 2em;
      color: #000;
      border-bottom: 2px solid #000;
      padding-bottom: 0.5em;
      margin-top: 1.5em;
    }
    
    h3 {
      font-size: 1.5em;
      color: #333;
      margin-top: 1em;
    }
    
    .highlight-box {
      background: #f9f9f9;
      border-left: 4px solid #000;
      padding: 1em;
      margin: 1em 0;
    }
    
    .tool-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5em;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    .prompt-box {
      background: #f0f0f0;
      font-family: 'Courier New', monospace;
      padding: 1em;
      border-radius: 4px;
      margin: 0.5em 0;
      font-size: 0.9em;
    }
    
    .checklist {
      list-style: none;
      padding-left: 0;
    }
    
    .checklist li {
      position: relative;
      padding-left: 2em;
      margin-bottom: 0.5em;
    }
    
    .checklist li:before {
      content: "☐";
      position: absolute;
      left: 0;
    }
    
    .time-saved {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 0.5em 1em;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
    }
    
    .footer {
      text-align: center;
      color: #999;
      font-size: 0.8em;
      margin-top: 3em;
      padding-top: 2em;
      border-top: 1px solid #e0e0e0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    
    th, td {
      text-align: left;
      padding: 0.5em;
      border-bottom: 1px solid #e0e0e0;
    }
    
    th {
      background: #f5f5f5;
      font-weight: bold;
    }
  </style>
</head>
<body>

<!-- Cover Page -->
<div class="cover-page">
  <div class="logo">OPTERO</div>
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
  
  <h3>🎯 Dina största möjligheter</h3>
  <ul>
    <li><strong>Email & kommunikation:</strong> Reducera tiden med 70% genom AI-assisterad skrivning</li>
    <li><strong>Rapportering:</strong> Automatisera dataanalys och rapportgenerering</li>
    <li><strong>Dokumenthantering:</strong> Sammanfatta, analysera och skapa dokument 10x snabbare</li>
    <li><strong>Möten:</strong> AI-genererade agendor, anteckningar och uppföljning</li>
  </ul>
  
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
<div class="footer">
  <p>© 2024 Optero | Din personliga AI-guide</p>
  <p>Support: support@optero.se | optero.se</p>
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
