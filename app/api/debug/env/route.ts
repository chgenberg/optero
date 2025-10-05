import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasDatabase: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
  });
}
