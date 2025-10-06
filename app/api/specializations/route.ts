import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { profession, language = 'sv' } = await req.json().catch(() => ({ profession: "", language: 'sv' }));
  try {
    if (!profession) {
      return NextResponse.json({ error: "Saknar yrke" }, { status: 400 });
    }

    // 1) DB cache (language-specific)
    try {
      const existing = await prisma.professionSpecialization.findUnique({
        where: { 
          profession_language: {
            profession,
            language
          }
        },
      });
      if (existing && Array.isArray(existing.specializations)) {
        await prisma.professionSpecialization.update({
          where: { id: existing.id },
          data: { hitCount: { increment: 1 } }
        });
        return NextResponse.json({ specializations: existing.specializations, cached: true });
      }
    } catch {}

    // 2) Generera via OpenAI
    const languagePrompts: Record<string, string> = {
      en: `You are a career advisor. List 6-12 common specializations for the profession "${profession}". Return ONLY valid JSON: {"specializations": ["..."]}. Use professional English terminology. Be industry-specific. No text outside JSON.`,
      sv: `Du är karriärrådgivare i Sverige. Lista 6–12 vanliga inriktningar för yrket "${profession}". Returnera ENDAST JSON: {"specializations": ["..."]}. Använd svenska benämningar. Var branschspecifik. Ingen text utanför JSON.`,
      es: `Eres un asesor profesional. Lista 6-12 especializaciones comunes para la profesión "${profession}". Devuelve SOLO JSON válido: {"specializations": ["..."]}. Usa terminología profesional en español. Sé específico de la industria. Sin texto fuera de JSON.`,
      fr: `Vous êtes conseiller en carrière. Listez 6-12 spécialisations courantes pour la profession "${profession}". Retournez UNIQUEMENT du JSON valide: {"specializations": ["..."]}. Utilisez la terminologie professionnelle française. Soyez spécifique à l'industrie. Pas de texte en dehors du JSON.`,
      de: `Sie sind Karriereberater. Listen Sie 6-12 gängige Spezialisierungen für den Beruf "${profession}" auf. Geben Sie NUR gültiges JSON zurück: {"specializations": ["..."]}. Verwenden Sie deutsche Fachterminologie. Seien Sie branchenspezifisch. Kein Text außerhalb von JSON.`,
    };
    
    const prompt = languagePrompts[language] || languagePrompts.en;

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that responds in JSON format." },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 4000,
    });
    const content = response.choices[0]?.message?.content || "";
    let items: string[] = [];
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data?.specializations)) items = data.specializations;
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const data2 = JSON.parse(match[0]);
          if (Array.isArray(data2?.specializations)) items = data2.specializations;
        } catch {}
      }
    }

    // 3) Persist to DB for future (language-specific)
    try {
      if (items.length > 0) {
        await prisma.professionSpecialization.upsert({
          where: { 
            profession_language: {
              profession,
              language
            }
          },
          update: { specializations: items as unknown as any, hitCount: { increment: 1 } },
          create: { profession, language, specializations: items as unknown as any, hitCount: 1 },
        });
      }
    } catch (dbErr) {
      console.error("Failed to save specializations:", dbErr);
    }

    return NextResponse.json({ specializations: items, cached: false });
  } catch (err) {
    console.error("specializations api error", err);
    // Fallback to local JSON defaults to keep UX smooth
    try {
      const all: Record<string, string[]> = (require("@/data/specializations.json") as any).specializations || {};
      const lowerMap: Record<string, string[]> = Object.fromEntries(
        Object.entries(all).map(([k, v]) => [k.toLowerCase(), v as string[]])
      );
      const normalized = (await req.json()).profession?.toLowerCase?.() ?? "";
      const local = lowerMap[normalized] || (require("@/data/specializations.json") as any).defaults;
      return NextResponse.json({ specializations: local || [] }, { status: 200 });
    } catch {
      return NextResponse.json({ specializations: [] }, { status: 200 });
    }
  }
}
