import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = file.type === "image/svg+xml" ? ".svg" : path.extname(file.name) || ".png";
    const filename = `logo_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const targetPath = path.join(uploadsDir, filename);

    await fs.writeFile(targetPath, buffer);

    const url = `/uploads/${filename}`;
    // Return both keys so old/new clients work
    return NextResponse.json({ url, logoUrl: url });
  } catch (err) {
    console.error("Logo upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


