import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

// Dynamic import for pdf-parse
let parsePdf: any;
async function getPdfParser() {
  if (!parsePdf) {
    const mod: any = await import("pdf-parse");
    parsePdf = mod.default || mod;
  }
  return parsePdf;
}

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId;
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Verify bot exists
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const uploadedDocuments = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name.toLowerCase();
      let content = "";
      let fileType = "unknown";

      try {
        // PDF parsing
        if (filename.endsWith(".pdf")) {
          fileType = "pdf";
          const pdf = await getPdfParser();
          const pdfData = await pdf(buffer);
          content = pdfData.text.trim() || "[PDF content could not be extracted]";
        }
        // Word documents
        else if (filename.endsWith(".docx")) {
          fileType = "docx";
          const result = await mammoth.extractRawText({ buffer });
          content = result.value || "[Document content could not be extracted]";
        }
        // Excel files
        else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
          fileType = "xlsx";
          const workbook = XLSX.read(buffer, { type: "buffer" });
          const sheets = workbook.SheetNames.map((name) => {
            const worksheet = workbook.Sheets[name];
            return `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(worksheet)}`;
          });
          content = sheets.join("\n\n") || "[Excel content could not be extracted]";
        }
        // CSV files
        else if (filename.endsWith(".csv")) {
          fileType = "csv";
          content = buffer.toString("utf-8");
        }
        // Plain text files
        else if (
          filename.endsWith(".txt") ||
          filename.endsWith(".md") ||
          filename.endsWith(".json")
        ) {
          fileType = filename.split(".").pop() || "txt";
          content = buffer.toString("utf-8");
        }
        // RTF files (convert to text)
        else if (filename.endsWith(".rtf")) {
          fileType = "rtf";
          content = buffer.toString("utf-8");
        }
        // Unsupported format
        else {
          content = "[Unsupported file format - content not extracted]";
          fileType = "unsupported";
        }

        // Create knowledge document in database
        const knowledge = await prisma.botKnowledge.create({
          data: {
            botId,
            title: file.name,
            content: content.substring(0, 50000), // Limit content size
            metadata: {
              fileSize: file.size,
              fileType,
              mimeType: file.type,
              uploadedAt: new Date().toISOString(),
            },
          },
        });

        uploadedDocuments.push({
          id: knowledge.id,
          title: knowledge.title,
          fileType,
          status: "success",
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        uploadedDocuments.push({
          title: file.name,
          status: "error",
          error: "Failed to process file",
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedDocuments.filter((d) => d.status === "success").length,
      failed: uploadedDocuments.filter((d) => d.status === "error").length,
      documents: uploadedDocuments,
    });
  } catch (error) {
    console.error("Error uploading knowledge:", error);
    return NextResponse.json(
      { error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}
