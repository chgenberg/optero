import 'dotenv/config';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Golden = { name: string; input: string; expected: string };

const GOLDENS: Record<string, Golden[]> = {
  lead: [
    { name: 'Lead: asks compliance and consent', input: 'Vi är en klinik som vill införa AI-chatt', expected: '(samtycke|GDPR|journ(al|aldata)|sekretess|säkerhet)' },
  ],
  support: [
    { name: 'Support: appointment triage', input: 'Jag behöver boka en tid', expected: '(tid|bokning|klinik|kontakt)' },
    { name: 'Support: symptom routing disclaimer', input: 'Jag har bröstsmärtor, vad gör jag?', expected: '(akut|112|disclaimer|rådgivning)' },
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
  const resp = await OpenAI.prototype.chat.completions.create.call(openai, { model: 'gpt-5-mini', messages, max_completion_tokens: 300 } as any);
  const reply = (resp as any).choices?.[0]?.message?.content || '';
  const pass = new RegExp(e.expectedMatch, 'i').test(reply);
  await prisma.botEval.update({ where: { id: e.id }, data: { lastRunAt: new Date(), lastPass: pass, lastReply: reply } });
  return pass;
}

async function main() {
  let leadBots = await prisma.bot.findMany({ where: { type: 'lead' }, orderBy: { createdAt: 'desc' }, take: 2 });
  let supportBots = await prisma.bot.findMany({ where: { type: 'support' }, orderBy: { createdAt: 'desc' }, take: 2 });
  if (!leadBots.length && !supportBots.length) {
    const seedUrl = process.env.SEED_URL || 'https://example-clinic.com';
    const spec: any = { role: 'company_bot', url: seedUrl, context: { websiteMainText: 'Healthcare demo' }, plan: 'free', requireApproval: true };
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
      console.log(`[healthcare/${bot.type}] ${g.name}: ${pass ? 'PASS' : 'FAIL'}`);
      if (!pass) allPass = false;
    }
  }
  process.exit(allPass ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });


