import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, language = 'en' } = await request.json();

    if (!profession) {
      return NextResponse.json(
        { error: "Profession is required" },
        { status: 400 }
      );
    }

    // 1. Check if we have cached common tasks for this combination
    try {
      const cachedTasks = await prisma.commonTasks.findUnique({
        where: {
          profession_specialization: {
            profession,
            specialization: specialization || profession,
          },
        },
      });

      if (cachedTasks) {
        // Update hit count and return cached tasks
        await prisma.commonTasks.update({
          where: { id: cachedTasks.id },
          data: {
            hitCount: { increment: 1 },
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          tasks: cachedTasks.tasks,
          cached: true,
        });
      }
    } catch (dbError) {
      console.error("Database lookup failed:", dbError);
    }

    // 2. Generate tasks with AI
    let tasks: string[] = [];

    if (openai) {
      try {
        const role = specialization || profession;
        
        const languagePrompts: Record<string, string> = {
          en: `List 8-12 common work tasks for a ${role}. Focus on: concrete tasks that take time and can be automated/improved with AI. Return as JSON: {"tasks": ["task1", "task2", ...]}. Use English.`,
          sv: `Lista 8-12 vanliga arbetsuppgifter för en ${role}. Fokusera på: konkreta uppgifter som tar tid och kan automatiseras/förbättras med AI. Returnera som JSON: {"tasks": ["uppgift1", "uppgift2", ...]}. Använd svenska.`,
          es: `Lista 8-12 tareas laborales comunes para un ${role}. Enfócate en: tareas concretas que toman tiempo y pueden automatizarse/mejorarse con IA. Devuelve como JSON: {"tasks": ["tarea1", "tarea2", ...]}. Usa español.`,
          fr: `Listez 8-12 tâches professionnelles courantes pour un ${role}. Concentrez-vous sur: tâches concrètes qui prennent du temps et peuvent être automatisées/améliorées avec l'IA. Retournez en JSON: {"tasks": ["tâche1", "tâche2", ...]}. Utilisez le français.`,
          de: `Listen Sie 8-12 häufige Arbeitsaufgaben für einen ${role} auf. Fokus auf: konkrete Aufgaben, die Zeit benötigen und mit KI automatisiert/verbessert werden können. Geben Sie als JSON zurück: {"tasks": ["aufgabe1", "aufgabe2", ...]}. Verwenden Sie Deutsch.`,
        };
        
        const prompt = languagePrompts[language] || languagePrompts.en;

        const response = await openai.chat.completions.create({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that responds in JSON format." },
            { role: "user", content: prompt }
          ],
          max_completion_tokens: 2000,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (content) {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed.tasks)) {
              tasks = parsed.tasks;
            } else if (Array.isArray(parsed)) {
              tasks = parsed;
            }
          } catch {
            // Fallback to line-by-line parsing
            tasks = content
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.length > 0 && !line.match(/^\d+\./))
              .map((line) => line.replace(/^["'\-\*]\s*/, '').replace(/["',;}\]]+$/, ''));
          }
        }
      } catch (aiError) {
        console.error("AI task generation failed:", aiError);
      }
    }

    // 3. Fallback to generic tasks if AI failed
    if (tasks.length === 0) {
      tasks = [
        "Planera och prioritera arbetsuppgifter",
        "Kommunikation och dokumentation",
        "Möten och uppföljning",
        "Informationssökning och research",
        "Rapportering och sammanställning",
        "Ärendeflöden och administrationssteg",
        "Skapa och redigera dokument",
        "Analysera data och siffror",
      ];
    }

    // 4. Save to database for future use
    if (tasks.length > 0) {
      try {
        await prisma.commonTasks.create({
          data: {
            profession,
            specialization: specialization || profession,
            tasks: tasks,
            hitCount: 1,
          },
        });
      } catch (dbError) {
        console.error("Failed to save tasks to database:", dbError);
      }
    }

    return NextResponse.json({ tasks, cached: false });
  } catch (error) {
    console.error("Error generating tasks:", error);
    return NextResponse.json(
      { error: "Failed to generate tasks" },
      { status: 500 }
    );
  }
}