export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const status = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      openai: "unknown"
    },
    environment: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasOpenAI: !!process.env.OPENAI_API_KEY
    }
  };

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = "connected";
  } catch (error) {
    status.services.database = "error";
    status.status = "degraded";
    console.error("Database health check failed:", error);
  }

  // Check OpenAI config
  if (process.env.OPENAI_API_KEY) {
    status.services.openai = "configured";
  } else {
    status.services.openai = "not configured";
    status.status = "degraded";
  }

  const httpStatus = status.status === "ok" ? 200 : 503;
  return NextResponse.json(status, { status: httpStatus });
}
