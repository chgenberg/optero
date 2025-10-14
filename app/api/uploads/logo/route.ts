import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = file.type === "image/svg+xml" ? ".svg" : path.extname(file.name) || ".png";
    const filename = `logo_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const targetPath = path.join(uploadsDir, filename);

    await fs.writeFile(targetPath, buffer);

    const url = `/uploads/${filename}`;
    // Build absolute URL for environments behind proxies
    // Prefer serving via API to avoid static file server caching issues
    const apiLogoUrl = `/api/uploads/logo?f=${encodeURIComponent(filename)}`;
    try {
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
      const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
      const origin = host ? `${proto}://${host}` : '';
      const absoluteApiUrl = origin ? `${origin}${apiLogoUrl}` : apiLogoUrl;
      return NextResponse.json({ url, logoUrl: absoluteApiUrl });
    } catch {
      return NextResponse.json({ url, logoUrl: apiLogoUrl });
    }
  } catch (err) {
    console.error("Logo upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Serve uploaded file to avoid static caching/routing issues on some hosts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const f = searchParams.get('f');
    if (!f) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    const targetPath = path.join(process.cwd(), 'public', 'uploads', path.basename(f));
    const data = await fs.readFile(targetPath);
    const ext = path.extname(f).toLowerCase();
    const type = ext === '.svg' ? 'image/svg+xml' : ext === '.webp' ? 'image/webp' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
    // Convert Node Buffer to ArrayBuffer for NextResponse
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    return new NextResponse(arrayBuffer as any, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch (err) {
    console.error('Logo serve error:', err);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}


