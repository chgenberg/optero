import 'dotenv/config';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Golden = { name: string; input: string; expected: string };

const GOLDENS: Record<string, Golden[]> = {
  lead: [
    { name: 'Lead: guided selling suggests product', input: 'Vi säljer skor online, vilken lösning för att öka konvertering?', expected: '(rekommenderar|A/B|produktguide|paket)' },
    { name: 'Lead: asks for KPI and next step', input: 'Vill höja konverteringen från 2% till 3%', expected: '(mål|kpi|nästa steg)' },
  ],
  support: [
    { name: 'Support: returns/refunds policy', input: 'Hur gör jag retur?', expected: '(retur|ånger|bytespolicy|policy)' },
    { name: 'Support: shipping status', input: 'Min beställning är försenad', expected: '(leverans|spårning|order|tracking)' },
  ],
};

async function ensureAndRun(botId: string, g: Golden) {
  const existing = await prisma.botEval.findFirst({ where: { botId, name: g.name } });
  const e = existing || await prisma.botEval.create({ data: { botId, name: g.name, input: g.input, expectedMatch: g.expected } });
  const bot = await prisma.bot.findUnique({ where: { id: botId } });
  if (!bot) throw new Error('bot not found');
  const specSafe = JSON.stringify(bot.spec ?? {}).slice(0, 3000);
  const messages = [
    { role: 'system', content: `Du är en företagsbot. Följ specifikation och bottype. Spec: ${specSafe}` },
    { role: 'user', content: e.input },
  ] as any[];
  const resp = await openai.chat.completions.create({ model: 'gpt-5-mini', messages, max_completion_tokens: 300 });
  const reply = resp.choices[0]?.message?.content || '';
  const pass = new RegExp(e.expectedMatch, 'i').test(reply);
  await prisma.botEval.update({ where: { id: e.id }, data: { lastRunAt: new Date(), lastPass: pass, lastReply: reply } });
  return pass;
}

async function main() {
  let leadBots = await prisma.bot.findMany({ where: { type: 'lead' }, orderBy: { createdAt: 'desc' }, take: 2 });
  let supportBots = await prisma.bot.findMany({ where: { type: 'support' }, orderBy: { createdAt: 'desc' }, take: 2 });
  if (!leadBots.length && !supportBots.length) {
    const seedUrl = process.env.SEED_URL || 'https://example-shop.com';
    const spec: any = { role: 'company_bot', url: seedUrl, context: { websiteMainText: 'Ecommerce demo' }, plan: 'free', requireApproval: true };
    leadBots = [await prisma.bot.create({ data: { name: `Lead for ${seedUrl}`, type: 'lead', companyUrl: seedUrl, spec } })];
    supportBots = [await prisma.bot.create({ data: { name: `Support for ${seedUrl}`, type: 'support', companyUrl: seedUrl, spec } })];
  }

  const targets = [
    ...leadBots.map(b => ({ bot: b, set: GOLDENS.lead })),
    ...supportBots.map(b => ({ bot: b, set: GOLDENS.support })),
  ];

  let allPass = true;
  for (const { bot, set } of targets) {
    for (const g of set) {
      const pass = await ensureAndRun(bot.id, g);
      console.log(`[ecommerce/${bot.type}] ${g.name}: ${pass ? 'PASS' : 'FAIL'}`);
      if (!pass) allPass = false;
    }
  }
  process.exit(allPass ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });


