import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { consult, conversations } = await req.json();

    // Minimal spec byggd av konsultdata + konversation
    const spec = {
      role: "company_bot",
      url: consult.url,
      problem: consult.problems?.[0] || "",
      type: "knowledge", // default, can be updated via /api/bots/update
      webhookUrl: null as string | null,
      slackWebhook: null as string | null,
      goals: consult.websiteSummary?.summary?.goals || [],
      context: {
        websiteMainText: consult.websiteSummary?.mainText || consult.websiteContent || "",
        documents: consult.documentsContent || ""
      },
      requireApproval: false,
      sources: {
        website: true,
        documents: Boolean(consult.documentsContent)
      }
    };

    const bot = await prisma.bot.create({
      data: {
        companyUrl: consult.url || null,
        name: `Bot for ${consult.url || "company"}`,
        type: "knowledge",
        spec
      }
    });

    // Source: website
    await prisma.botSource.create({
      data: {
        botId: bot.id,
        kind: "website",
        url: consult.url
      }
    });

    // Source: documents (metadata only)
    if (consult.files && consult.files.length) {
      for (const f of consult.files) {
        await prisma.botSource.create({
          data: { botId: bot.id, kind: "document", filename: f }
        });
      }
    }

    return NextResponse.json({ botId: bot.id });
  } catch (e: any) {
    console.error("Bot build failed", e);
    return NextResponse.json({ error: "Failed to build bot" }, { status: 500 });
  }
}


