import { NextRequest, NextResponse } from "next/server";

// Simplified PDF generation for serverless deployment
export async function POST(request: NextRequest) {
  try {
    const { context, results } = await request.json();
    const { profession, specialization } = context || { profession: "Ekonom", specialization: "Redovisningskonsult" };

    // For serverless, we'll return a client-side printable HTML
    // The client can use window.print() or a library to convert to PDF
    
    const printableHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI-Guide - ${specialization || profession}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { font-size: 2.5em; }
    h2 { font-size: 2em; margin-top: 2em; }
    h3 { font-size: 1.5em; }
    .highlight { background: #f0f0f0; padding: 15px; margin: 20px 0; }
    .prompt-box { background: #e0e0e0; padding: 10px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="no-print" style="background: #f0f0f0; padding: 20px; margin-bottom: 30px; text-align: center;">
    <h3>Din PDF är redo!</h3>
    <p>Klicka på knappen nedan för att ladda ner som PDF:</p>
    <button onclick="window.print()" style="background: #000; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
      Skriv ut / Spara som PDF
    </button>
    <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
      Tips: Välj "Spara som PDF" i utskriftsdialogen
    </p>
  </div>

  <h1>Din Personliga AI-Guide</h1>
  <p><strong>För:</strong> ${specialization || profession}</p>
  <p><strong>Genererad:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
  
  <div class="page-break"></div>
  
  <h2>Innehåll</h2>
  <ol>
    <li>Sammanfattning & Quick Wins</li>
    <li>AI-verktyg för dig</li>
    <li>Implementeringsplan</li>
    <li>Praktiska exempel</li>
    <li>Färdiga prompts</li>
  </ol>
  
  <div class="page-break"></div>
  
  <h2>1. Sammanfattning</h2>
  <div class="highlight">
    <p>Som ${specialization || profession} kan du spara <strong>5-8 timmar per vecka</strong> med rätt AI-verktyg.</p>
  </div>
  
  <h3>Quick Wins</h3>
  <ul>
    <li>Börja med ChatGPT för email</li>
    <li>Automatisera rapporter</li>
    <li>Använd AI för möten</li>
  </ul>
  
  <!-- More content... -->
  
  <script>
    // Auto-trigger print dialog after 1 second
    setTimeout(() => {
      if (window.location.search.includes('autoprint=true')) {
        window.print();
      }
    }, 1000);
  </script>
</body>
</html>
    `;

    return new NextResponse(printableHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
