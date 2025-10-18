import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { uploadBufferToS3 } from "@/lib/s3";
// Use dynamic import for pdf-parse to avoid ESM default export issues in build
let parsePdf: any;
async function getPdfParser() {
  if (!parsePdf) {
    const mod: any = await import("pdf-parse");
    parsePdf = mod.default || mod; // support both ESM/CJS
  }
  return parsePdf;
}
import Papa from "papaparse";

export const maxDuration = 60; // 1 minute for file processing
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const parsedContents: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name.toLowerCase();

      try {
        if (filename.endsWith('.pdf')) {
          try {
            // Parse PDF content
            const pdf = await getPdfParser();
            const pdfData = await pdf(buffer);
            const pdfText = pdfData.text.trim();
            
            if (pdfText.length > 100) {
              parsedContents.push(`\n\n=== ${file.name} ===\n${pdfText}`);
            } else {
              // Fallback for PDFs with minimal extractable text
              parsedContents.push(`\n\n=== ${file.name} ===\n[PDF uploaded - minimal text content detected. The AI will analyze based on other context.]`);
            }
            
            // Store the PDF for reference
            if (process.env.S3_BUCKET) {
              const keySafe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
              const key = `pdfs/${new Date().toISOString().slice(0,10)}/${Date.now()}_${keySafe}`;
              await uploadBufferToS3(key, buffer, 'application/pdf');
            }
          } catch (pdfError) {
            console.error(`PDF parse error for ${file.name}:`, pdfError);
            parsedContents.push(`\n\n=== ${file.name} ===\n[PDF uploaded - content will be analyzed based on context]`);
          }
        }
        else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
          // Parse Excel
          const workbook = XLSX.read(buffer, { type: 'buffer' });
          let excelText = '';
          
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            excelText += `\n\n--- Sheet: ${sheetName} ---\n${csv}`;
          });
          
          parsedContents.push(`\n\n=== ${file.name} ===\n${excelText}`);
        }
        else if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
          // Parse Word
          const result = await mammoth.extractRawText({ buffer });
          parsedContents.push(`\n\n=== ${file.name} ===\n${result.value}`);
        }
        else if (filename.endsWith('.csv')) {
          // Parse CSV
          const csvText = buffer.toString('utf-8');
          const parsed = Papa.parse(csvText, { header: true });
          
          let csvContent = 'CSV Data:\n';
          if (parsed.data && parsed.data.length > 0) {
            // Show headers
            const headers = Object.keys(parsed.data[0] as any);
            csvContent += headers.join(' | ') + '\n';
            csvContent += headers.map(() => '---').join(' | ') + '\n';
            
            // Show data rows (limit to first 100 rows for context)
            parsed.data.slice(0, 100).forEach((row: any) => {
              csvContent += headers.map(h => row[h] || '').join(' | ') + '\n';
            });
            
            if (parsed.data.length > 100) {
              csvContent += `\n... and ${parsed.data.length - 100} more rows`;
            }
          }
          
          parsedContents.push(`\n\n=== ${file.name} ===\n${csvContent}`);
        }
        else if (filename.endsWith('.txt') || filename.endsWith('.md') || filename.endsWith('.json')) {
          // Parse text files
          const textContent = buffer.toString('utf-8');
          parsedContents.push(`\n\n=== ${file.name} ===\n${textContent}`);
        }
        else if (filename.endsWith('.pptx') || filename.endsWith('.ppt')) {
          // PowerPoint files - extract text content
          try {
            const textContent = buffer.toString('utf-8', 0, 1000); // Sample for basic text
            parsedContents.push(`\n\n=== ${file.name} ===\n[PowerPoint presentation uploaded. For best results, export as PDF and upload the PDF version.]`);
          } catch (e) {
            parsedContents.push(`\n\n=== ${file.name} ===\n[PowerPoint file uploaded]`);
          }
        }
        else if (filename.endsWith('.key')) {
          // Keynote files
          parsedContents.push(`\n\n=== ${file.name} ===\n[Keynote presentation uploaded. For best results, export as PDF and upload the PDF version.]`);
        }
        else if (filename.endsWith('.rtf')) {
          // RTF files - basic text extraction
          const rtfText = buffer.toString('utf-8');
          // Simple RTF to text (remove basic RTF codes)
          const plainText = rtfText
            .replace(/\\par\s*/g, '\n')
            .replace(/\{[^}]*\}/g, '')
            .replace(/\\[a-z]+\d*\s*/g, '')
            .trim();
          
          parsedContents.push(`\n\n=== ${file.name} ===\n${plainText}`);
        }
        else {
          // Try to extract as plain text for unknown formats
          try {
            const textContent = buffer.toString('utf-8');
            if (textContent.length > 50 && textContent.length < 100000) {
              parsedContents.push(`\n\n=== ${file.name} ===\n${textContent}`);
            } else {
              console.log(`Unsupported file type: ${filename}`);
            }
          } catch (e) {
            console.log(`Could not parse file type: ${filename}`);
          }
        }
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
        parsedContents.push(`\n\n=== ${file.name} ===\n[Could not parse this file]`);
      }

      // Optionally persist non-PDF files to S3 for audit/reference
      try {
        if (process.env.S3_BUCKET && !filename.endsWith('.pdf')) {
          const keySafe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const key = `uploads/${new Date().toISOString().slice(0,10)}/${Date.now()}_${keySafe}`;
          await uploadBufferToS3(key, buffer, file.type || 'application/octet-stream');
        }
      } catch (e) {
        console.warn('S3 store skipped/failed:', e);
      }
    }

    const combinedContent = parsedContents.join('\n\n');
    
    return NextResponse.json({
      success: true,
      filesProcessed: files.length,
      content: combinedContent.slice(0, 50000) // Limit to 50K chars to avoid token limits
    });

  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to process documents", details: error.message },
      { status: 500 }
    );
  }
}
