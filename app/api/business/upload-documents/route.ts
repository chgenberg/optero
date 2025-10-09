import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

export const maxDuration = 60; // 1 minute for file processing

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
          // Parse PDF
          const data = await pdf(buffer);
          parsedContents.push(`\n\n=== ${file.name} ===\n${data.text}`);
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
        else {
          console.log(`Unsupported file type: ${filename}`);
        }
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
        parsedContents.push(`\n\n=== ${file.name} ===\n[Could not parse this file]`);
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

