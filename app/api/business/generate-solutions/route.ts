import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
        system: `Du är en AI-expert som hjälper ${profession} med praktiska lösningar.
        
INSTRUKTIONER:
- Ge KONKRETA, HANDS-ON lösningar
- Förklara ENKELT utan teknisk jargong  
- Prompts ska vara KOPIERINGSBARA och fungera direkt
- Max 2-3 meningar per lösning
- Fokusera på VÄRDE och TIDSBESPARING`,
        
        user: `Skapa lösningar för dessa arbetsuppgifter:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

För VARJE uppgift, returnera EXAKT detta JSON-format:
{
  "solutions": [
    {
      "task": "Exakt uppgiftsnamn",
      "solution": "Konkret lösning i 2-3 meningar. Förklara HUR AI hjälper och VAD resultatet blir.",
      "prompt": "En färdig prompt som användaren kan kopiera och använda direkt i ChatGPT/Claude"
    }
  ]
}`
      },
      en: {
        system: `You are an AI expert helping ${profession} with practical solutions.
        
INSTRUCTIONS:
- Give CONCRETE, HANDS-ON solutions
- Explain SIMPLY without technical jargon
- Prompts should be COPY-READY and work immediately
- Max 2-3 sentences per solution
- Focus on VALUE and TIME SAVINGS`,
        
        user: `Create solutions for these tasks:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

For EACH task, return EXACTLY this JSON format:
{
  "solutions": [
    {
      "task": "Exact task name",
      "solution": "Concrete solution in 2-3 sentences. Explain HOW AI helps and WHAT the result is.",
      "prompt": "A ready prompt that the user can copy and use directly in ChatGPT/Claude"
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
      model: "o1-mini", // Using GPT-5-mini for speed
      messages: [
        { role: "system", content: selectedPrompts.system },
        { role: "user", content: selectedPrompts.user }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error generating solutions:", error);
    return NextResponse.json(
      { error: "Failed to generate solutions" },
      { status: 500 }
    );
  }
}