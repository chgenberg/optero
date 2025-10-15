import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { uploadBufferToS3 } from "@/lib/s3";

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
          // For now, we'll indicate that PDF processing requires manual review
          // This avoids the worker issue in production
          parsedContents.push(`\n\n=== ${file.name} ===\n[PDF file uploaded - content analysis will be performed by AI based on URL content and other documents]`);
          
          // Store the PDF for later processing if needed
          if (process.env.S3_BUCKET) {
            const keySafe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const key = `pdfs/${new Date().toISOString().slice(0,10)}/${Date.now()}_${keySafe}`;
            await uploadBufferToS3(key, buffer, 'application/pdf');
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
        else if (filename.endsWith('.key')) {
          // Keynote is a package/zip; without extra deps, ask user to export as PDF for now
          parsedContents.push(`\n\n=== ${file.name} ===\n[Keynote (.key) files work best when exported to PDF. Please export and upload as PDF.]`);
        } else {
          console.log(`Unsupported file type: ${filename}`);
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
