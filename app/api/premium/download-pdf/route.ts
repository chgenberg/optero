import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { context, results } = await request.json();
    const { profession, specialization } = context || { profession: "Ekonom", specialization: "Redovisningskonsult" };

    // For serverless deployment, we'll use a simpler approach
    // Generate HTML and let the client handle PDF conversion
    const htmlResponse = await fetch(`${request.nextUrl.origin}/api/premium/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, results }),
    });

    const html = await htmlResponse.text();

    // Return HTML with PDF-ready styling
    const pdfHtml = `
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
    @page {
      size: A4;
      margin: 2cm;
    }
  </style>
</head>
<body>
  <div class="no-print" style="position: fixed; top: 0; left: 0; right: 0; background: #000; color: white; padding: 20px; text-align: center; z-index: 1000;">
    <h3 style="margin: 0 0 10px 0;">Din PDF är redo!</h3>
    <button onclick="window.print()" style="background: white; color: black; padding: 10px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
      💾 Ladda ner PDF
    </button>
    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
      Välj "Spara som PDF" i utskriftsdialogen
    </p>
  </div>
  <div style="padding-top: 100px;">
    ${html}
  </div>
  <script>
    // Auto-open print dialog after load
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 500);
    });
  </script>
</body>
</html>`;

    return new NextResponse(pdfHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    
    // Fallback to simple download instruction
    return NextResponse.json({
      error: "PDF generation failed",
      message: "Please try again or contact support",
    }, { status: 500 });
  }
}
