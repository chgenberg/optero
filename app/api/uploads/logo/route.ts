import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { uploadBufferToS3 } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    // Accept both 'logo' and 'file' for backward compatibility
    const file = (form.get("logo") || form.get("file")) as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.type === "image/svg+xml" ? ".svg" : path.extname(file.name) || ".png";
    const filename = `logos/${new Date().toISOString().slice(0,10)}/logo_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

    const publicUrl = await uploadBufferToS3(filename, buffer, file.type);

    return NextResponse.json({ url: publicUrl, logoUrl: publicUrl });
  } catch (err) {
    console.error("Logo upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Serve uploaded file to avoid static caching/routing issues on some hosts
// GET is no longer needed when serving from S3; keep as 410 for legacy
export async function GET() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}


