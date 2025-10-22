import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        integrations: {
          include: {
            botIntegrations: {
              include: {
                bot: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      integrations: user.integrations.map((int) => ({
        id: int.id,
        type: int.type,
        name: int.name,
        settings: int.settings,
        connectedBots: int.botIntegrations.map((bi) => bi.botId),
      })),
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, type, name, settings } = await request.json();

    if (!email || !type || !name) {
      return NextResponse.json(
        { error: "Email, type, and name required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create integration
    const integration = await prisma.integration.create({
      data: {
        userId: user.id,
        type,
        name,
        settings: settings || {},
      },
    });

    return NextResponse.json({ integration });
  } catch (error) {
    console.error("Error creating integration:", error);
    return NextResponse.json(
      { error: "Failed to create integration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { integrationId, settings, connectedBots } = await request.json();

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID required" },
        { status: 400 }
      );
    }

    // Update integration settings
    if (settings !== undefined) {
      await prisma.integration.update({
        where: { id: integrationId },
        data: { settings },
      });
    }

    // Update bot connections
    if (connectedBots !== undefined) {
      // Remove all existing connections
      await prisma.botIntegration.deleteMany({
        where: { integrationId },
      });

      // Add new connections
      if (connectedBots.length > 0) {
        await prisma.botIntegration.createMany({
          data: connectedBots.map((botId: string) => ({
            botId,
            integrationId,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating integration:", error);
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const integrationId = request.nextUrl.searchParams.get("id");

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID required" },
        { status: 400 }
      );
    }

    // Delete integration (cascade will handle botIntegrations)
    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting integration:", error);
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}
