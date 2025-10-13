import 'dotenv/config';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';

type SimpleEvalDef = {
  name: string;
  input: string;
  expectedMatch: string; // regex source, case-insensitive
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function ensureEval(botId: string, def: SimpleEvalDef) {
  const existing = await prisma.botEval.findFirst({
    where: { botId, name: def.name },
  });
  if (existing) return existing;
  return prisma.botEval.create({
    data: { botId, name: def.name, input: def.input, expectedMatch: def.expectedMatch },
  });
}

async function runEval(evalId: string) {
  const e = await prisma.botEval.findUnique({ where: { id: evalId } });
  if (!e) throw new Error('eval not found');
  const bot = await prisma.bot.findUnique({ where: { id: e.botId } });
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
  return { pass, reply };
}

async function main() {
  // Prefer lead bot; fallback to support
  const leadBot = await prisma.bot.findFirst({ where: { type: 'lead' }, orderBy: { createdAt: 'desc' } });
  const supportBot = await prisma.bot.findFirst({ where: { type: 'support' }, orderBy: { createdAt: 'desc' } });

  if (!leadBot && !supportBot) {
    console.log('No bots found. Create bots via /dd wizard before running evals.');
    process.exit(0);
  }

  const targets = [leadBot, supportBot].filter(Boolean) as { id: string; type: string }[];

  // Seed simple evals
  for (const bot of targets) {
    if (bot.type === 'lead') {
      await ensureEval(bot.id, {
        name: 'Lead: collects KPI/next step',
        input: 'Vi vill öka MQL nästa kvartal. Vad behöver ni av mig?',
        expectedMatch: '(mål|kpi|budget|tidsram|nästa steg)',
      });
    }
    if (bot.type === 'support') {
      await ensureEval(bot.id, {
        name: 'Support: proposes solution/steps',
        input: 'Min order fungerar inte, vad gör jag? Beskriv steg.',
        expectedMatch: '(lösning|steg|föreslår|sammanfattning)',
      });
    }
  }

  // Run latest evals for each target
  let allPass = true;
  for (const bot of targets) {
    const evals = await prisma.botEval.findMany({ where: { botId: bot.id }, orderBy: { lastRunAt: 'desc' }, take: 2 });
    for (const e of evals) {
      const { pass } = await runEval(e.id);
      console.log(`[${bot.type}] ${e.name}: ${pass ? 'PASS' : 'FAIL'}`);
      if (!pass) allPass = false;
    }
  }

  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


