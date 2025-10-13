import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function readProfessions(): Promise<string[]> {
  const filePath = path.resolve(process.cwd(), 'data', 'professions.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  const names: string[] = (json?.professions ?? []).map((p: any) => p?.name).filter(Boolean);
  return Array.from(new Set(names));
}

async function getExistingSet(): Promise<Set<string>> {
  const rows = await prisma.professionSpecialization.findMany({ 
    where: { language: 'sv' },
    select: { profession: true } 
  });
  return new Set(rows.map(r => r.profession));
}

async function generateFor(profession: string): Promise<string[]> {
  const prompt = `Du är karriärrådgivare i Sverige. Lista 6–12 vanliga inriktningar/specialiseringar för yrket \"${profession}\" i Sverige.
- Svara enbart som JSON i formatet { "specializations": ["..."] }
- Håll dig till svenska benämningar, korta och tydliga.
- Om yrket redan är mycket snävt: ge närliggande roller/områden/arbetsmiljöer som val.
- Inga förklaringar, endast arrayen.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      { role: 'system', content: 'Svara alltid med giltig JSON.' },
      { role: 'user', content: prompt },
    ],
    max_completion_tokens: 1000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return [];
  try {
    const data = JSON.parse(content);
    const items: string[] = Array.isArray(data?.specializations) ? data.specializations : [];
    return items.filter((s) => typeof s === 'string' && s.trim().length > 0);
  } catch {
    return [];
  }
}

async function upsert(profession: string, items: string[]) {
  await prisma.professionSpecialization.upsert({
    where: { 
      profession_language: {
        profession,
        language: 'sv'
      }
    },
    update: { specializations: JSON.stringify(items) },
    create: { profession, language: 'sv', specializations: JSON.stringify(items) },
  });
}

async function seedAll() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL saknas');
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY saknas');

  const all = await readProfessions();
  const existing = await getExistingSet();

  const todo = all.filter((p) => !existing.has(p));
  console.log(`Totalt yrken: ${all.length}. Redan i DB: ${existing.size}. Att generera: ${todo.length}.`);

  const concurrency = 2;
  let idx = 0;
  async function worker(workerId: number) {
    while (idx < todo.length) {
      const i = idx++;
      const profession = todo[i];
      const start = Date.now();
      try {
        console.log(`[${workerId}] (${i + 1}/${todo.length}) ${profession} …`);
        const items = await generateFor(profession);
        if (items.length === 0) {
          console.warn(`[${workerId}] ${profession}: tomt svar – hoppar`);
          continue;
        }
        await upsert(profession, items);
        console.log(`[${workerId}] ${profession}: sparat ${items.length} st på ${Date.now() - start}ms`);
        await new Promise((r) => setTimeout(r, 300));
      } catch (e) {
        console.error(`[${workerId}] Fel för ${profession}:`, (e as Error).message);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, Math.max(1, todo.length)) }, (_, w) => worker(w + 1));
  await Promise.all(workers);
}

seedAll()
  .then(() => {
    console.log('Klar.');
  })
  .catch((e) => {
    console.error('Seed fel:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
