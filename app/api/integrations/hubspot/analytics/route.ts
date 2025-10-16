import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get('botId') || '';
    if (!botId) return NextResponse.json({ error: 'botId_required' }, { status: 400 });

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return NextResponse.json({ error: 'bot_not_found' }, { status: 404 });

    // Placeholder analytics (stub). Replace with real HubSpot API queries
    // when API key/app is configured for the bot owner.
    const analytics = {
      topCustomers: [
        { name: 'Acme AB', revenue: 120000 },
        { name: 'Globex', revenue: 98000 },
        { name: 'Initech', revenue: 76000 }
      ],
      pipeline: [
        { stage: 'Qualification', deals: 24, value: 220000 },
        { stage: 'Proposal', deals: 12, value: 180000 },
        { stage: 'Closed Won', deals: 6, value: 150000 }
      ]
    };

    return NextResponse.json({ analytics });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'hubspot_analytics_failed' }, { status: 500 });
  }
}


