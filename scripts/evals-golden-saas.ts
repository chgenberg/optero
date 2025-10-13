import 'dotenv/config';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Golden = { name: string; input: string; expected: string };

const GOLDENS: Record<string, Golden[]> = {
  lead: [
    { name: 'Lead: asks KPI and next step', input: 'Vi vill öka MQL 20% kommande kvartal.', expected: '(mål|kpi|nästa steg|budget|tidsram)' },
    { name: 'Lead: summarizes before webhook', input: 'Vi har 200 MQL/mån idag, vill till 300. Budget 50k/mån.', expected: '(sammanfattning|CALL:WEBHOOK)' },
    { name: 'Lead: guided selling recommends package', input: 'Vilket paket passar oss? Liten budget, snabb ROI.', expected: '(paket|rekommenderar|starter|pro|enterprise)' },
    { name: 'Lead: asks decision role', input: 'Jag kan påverka beslutet men inte ensam.', expected: '(beslutsroll|beslutsfattare|vem beslutar)' },
    { name: 'Lead: clarifies timeline', input: 'Vi vill starta inom 30 dagar.', expected: '(tidsram|deadline|startdatum)' },
    { name: 'Lead: probes current stack', input: 'Vi använder HubSpot och Slack idag.', expected: '(integration|koppling|stack|verktyg)' },
  ],
  support: [
    { name: 'Support: collects details', input: 'Kassan kraschar ibland, vad behöver ni för info?', expected: '(beskrivning|kategori|brådska|tidigare steg|kontakt)' },
    { name: 'Support: proposes steps', input: 'Min order fastnar i "processing"', expected: '(steg|föreslår|löst|prova|felsök)' },
    { name: 'Support IT: helpdesk hints', input: 'Min dator tappar nät anslutning', expected: '(nätverk|omstart|kabel|wifi|felsök)' },
    { name: 'Support: asks for reproduction', input: 'Knappen gör inget när jag klickar', expected: '(repro|återskapa|steg)' },
    { name: 'Support: asks for priority', input: 'Detta blockerar fakturering', expected: '(brådska|prio|påverkan|impact)' },
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

  // Seed minimal staging bots if none exist
  if (!leadBots.length && !supportBots.length) {
    const seedUrl = process.env.SEED_URL || 'https://example.com';
    const sharedSpec: any = {
      role: 'company_bot',
      url: seedUrl,
      context: { websiteMainText: 'Example company. Products and services placeholder.' },
      plan: 'free',
      problem: 'Öka MQL och minska supportärenden',
      kpis: { lead: { targetMQL: 300 }, support: { targetDeflectionRate: 0.2 } },
      requireApproval: true,
    };
    const createdLead = await prisma.bot.create({ data: { name: `Lead for ${seedUrl}`, type: 'lead', companyUrl: seedUrl, spec: { ...sharedSpec, subtype: 'standard' } } });
    const createdSupport = await prisma.bot.create({ data: { name: `Support for ${seedUrl}`, type: 'support', companyUrl: seedUrl, spec: { ...sharedSpec, subtype: 'standard' } } });
    leadBots = [createdLead];
    supportBots = [createdSupport];
    console.log('Seeded staging bots for golden evals.');
  }

  const targets = [
    ...leadBots.map(b => ({ bot: b, set: GOLDENS.lead })),
    ...supportBots.map(b => ({ bot: b, set: GOLDENS.support })),
  ];

  let allPass = true;
  for (const { bot, set } of targets) {
    for (const g of set) {
      const pass = await ensureAndRun(bot.id, g);
      console.log(`[${bot.type}] ${g.name}: ${pass ? 'PASS' : 'FAIL'}`);
      if (!pass) allPass = false;
    }
  }

  process.exit(allPass ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });


