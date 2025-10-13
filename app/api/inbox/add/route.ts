import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { botId, type, payload, notifyEmail, slackWebhook, webhookUrl } = await req.json();
    if (!botId || !type || !payload) return NextResponse.json({ error: 'botId, type, payload required' }, { status: 400 });

    const saved = await prisma.botAction.create({ data: { botId, type, payload, status: 'stored' } });

    // Email notify (optional)
    if (notifyEmail && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Mendio <noreply@mendio.io>',
          to: notifyEmail,
          subject: `Ny ${type}-händelse från bot ${botId}`,
          html: `<pre>${JSON.stringify(payload, null, 2)}</pre>`
        });
        await prisma.botAction.update({ where: { id: saved.id }, data: { status: 'emailed' } });
      } catch {}
    }

    // Slack notify (optional)
    if (slackWebhook) {
      try { await fetch(slackWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `Ny ${type}-händelse\n\n${JSON.stringify(payload, null, 2)}` }) }); } catch {}
      await prisma.botAction.update({ where: { id: saved.id }, data: { status: 'slacked' } });
    }

    // Webhook (optional, best-effort)
    if (webhookUrl) {
      try { await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId, type, payload }) }); } catch {}
      await prisma.botAction.update({ where: { id: saved.id }, data: { status: 'webhooked' } });
    }

    return NextResponse.json({ ok: true, action: saved });
  } catch (e: any) {
    return NextResponse.json({ error: 'inbox_add_failed' }, { status: 500 });
  }
}


