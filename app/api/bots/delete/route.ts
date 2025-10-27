import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { botId } = await req.json();

    if (!botId) {
      return NextResponse.json({ error: "Bot ID required" }, { status: 400 });
    }

    // Delete bot and all related data
    await prisma.bot.delete({
      where: { id: botId }
    });

    return NextResponse.json({
      success: true,
      message: "Bot deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting bot:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete bot" },
      { status: 500 }
    );
  }
}
