import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set longer timeout for GPT-5-mini
export const maxDuration = 180; // 3 minutes

export async function POST(request: NextRequest) {
  try {
    const { profession, specialization, tasks, language = 'sv' } = await request.json();

    if (!profession || !tasks || tasks.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Language-specific prompts
    const prompts = {
      sv: {
        system: `Du är världens främsta prompt-ingenjör och AI-expert specialiserad på att hjälpa ${profession}.
        
DU MÅSTE SKAPA VÄRLDSKLASS-PROMPTS SOM:
- Är MINST 8-12 rader långa
- Innehåller [PLATSHÅLLARE] för personlig anpassning
- Specificerar EXAKT output-format
- Inkluderar kvalitetskriterier och exempel
- Definierar ton, stil och branschkrav
- Sparar minst 30 minuter per användning
- Är så detaljerade att INGEN följdfråga behövs`,
        
        user: `Skapa AVANCERADE lösningar för dessa arbetsuppgifter:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

För VARJE uppgift, returnera EXAKT detta JSON-format:
{
  "solutions": [
    {
      "task": "Exakt uppgiftsnamn",
      "solution": "Konkret lösning i 2-3 meningar. Förklara specifikt HUR AI revolutionerar denna uppgift och EXAKT vilken tidsbesparing (i minuter/timmar) det ger.",
      "prompt": "En EXTREMT DETALJERAD prompt (8-12 rader) med:\n- Tydlig kontext och roll\n- ALLTID [PLATSHÅLLARE] i hakparenteser för alla delar användaren ska fylla i själv\n- Specifikt output-format\n- Kvalitetskriterier\n- Branschspecifika krav\n- Ton och stil\n- Konkreta exempel\nVIKTIGT: Sätt ALLA platshållare inom [HAKPARENTESER] så de blir tydliga!"
    }
  ]
}`
      },
      en: {
        system: `You are the world's leading prompt engineer and AI expert specialized in helping ${profession}.
        
YOU MUST CREATE WORLD-CLASS PROMPTS THAT:
- Are AT LEAST 8-12 lines long
- Include [PLACEHOLDERS] for personalization
- Specify EXACT output format
- Include quality criteria and examples
- Define tone, style, and industry requirements
- Save at least 30 minutes per use
- Are so detailed that NO follow-up is needed`,
        
        user: `Create ADVANCED solutions for these tasks:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

For EACH task, return EXACTLY this JSON format:
{
  "solutions": [
    {
      "task": "Exact task name",
      "solution": "Concrete solution in 2-3 sentences. Explain specifically HOW AI revolutionizes this task and EXACT time saved (in minutes/hours).",
      "prompt": "An EXTREMELY DETAILED prompt (8-12 lines) with:\n- Clear context and role\n- [PLACEHOLDERS] for customization\n- Specific output format\n- Quality criteria\n- Industry-specific requirements\n- Tone and style\n- Concrete examples"
    }
  ]
}`
      },
      es: {
        system: `Eres un experto en IA que ayuda a ${profession} con soluciones prácticas.
        
INSTRUCCIONES:
- Da soluciones CONCRETAS y PRÁCTICAS
- Explica de forma SIMPLE sin jerga técnica
- Los prompts deben estar LISTOS PARA COPIAR y funcionar inmediatamente
- Máximo 2-3 frases por solución
- Enfócate en el VALOR y AHORRO DE TIEMPO`,
        
        user: `Crea soluciones para estas tareas:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

Para CADA tarea, devuelve EXACTAMENTE este formato JSON:
{
  "solutions": [
    {
      "task": "Nombre exacto de la tarea",
      "solution": "Solución concreta en 2-3 frases. Explica CÓMO ayuda la IA y CUÁL es el resultado.",
      "prompt": "Un prompt listo que el usuario puede copiar y usar directamente en ChatGPT/Claude"
    }
  ]
}`
      },
      fr: {
        system: `Vous êtes un expert IA qui aide ${profession} avec des solutions pratiques.
        
INSTRUCTIONS:
- Donnez des solutions CONCRÈTES et PRATIQUES
- Expliquez SIMPLEMENT sans jargon technique
- Les prompts doivent être PRÊTS À COPIER et fonctionner immédiatement
- Max 2-3 phrases par solution
- Concentrez-vous sur la VALEUR et le GAIN DE TEMPS`,
        
        user: `Créez des solutions pour ces tâches:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

Pour CHAQUE tâche, retournez EXACTEMENT ce format JSON:
{
  "solutions": [
    {
      "task": "Nom exact de la tâche",
      "solution": "Solution concrète en 2-3 phrases. Expliquez COMMENT l'IA aide et QUEL est le résultat.",
      "prompt": "Un prompt prêt que l'utilisateur peut copier et utiliser directement dans ChatGPT/Claude"
    }
  ]
}`
      },
      de: {
        system: `Sie sind ein KI-Experte, der ${profession} mit praktischen Lösungen hilft.
        
ANWEISUNGEN:
- Geben Sie KONKRETE, PRAKTISCHE Lösungen
- Erklären Sie EINFACH ohne technischen Jargon
- Prompts sollten KOPIERBEREIT sein und sofort funktionieren
- Max. 2-3 Sätze pro Lösung
- Fokus auf WERT und ZEITERSPARNIS`,
        
        user: `Erstellen Sie Lösungen für diese Aufgaben:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

Für JEDE Aufgabe, geben Sie GENAU dieses JSON-Format zurück:
{
  "solutions": [
    {
      "task": "Exakter Aufgabenname",
      "solution": "Konkrete Lösung in 2-3 Sätzen. Erklären Sie WIE KI hilft und WAS das Ergebnis ist.",
      "prompt": "Ein fertiger Prompt, den der Benutzer direkt in ChatGPT/Claude kopieren und verwenden kann"
    }
  ]
}`
      }
    };

    const selectedPrompts = prompts[language as keyof typeof prompts] || prompts.sv;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini", // Using GPT-5-mini for fast, quality prompts
      messages: [
        { role: "system", content: selectedPrompts.system },
        { role: "user", content: selectedPrompts.user }
      ],
      max_completion_tokens: 4000,
      // GPT-5 doesn't support temperature or response_format
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error generating solutions:", error);
    
    // More detailed error handling
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: "API configuration error" },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to generate solutions", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate solutions" },
      { status: 500 }
    );
  }
}