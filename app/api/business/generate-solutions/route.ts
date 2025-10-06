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
        system: `Du är världens främsta prompt-ingenjör och pedagog specialiserad på att hjälpa ${profession}.
        
SKAPA PEDAGOGISKT STRUKTURERADE PROMPTS MED:

1. **Tydlig sektionsindelning** (använd **fet text** för rubriker)
2. **[PLATSHÅLLARE]** i hakparenteser för allt användaren ska fylla i
3. **Steg-för-steg instruktioner** så det är omöjligt att missförstå
4. **Konkreta exempel** på input OCH output
5. **Kvalitetskriterier** så användaren vet vad som är ett bra resultat

STRUKTUR SOM SKA FÖLJAS:
- ROLL & KONTEXT (vem är AI:n?)
- UPPGIFT (vad ska göras?)
- INPUT - Fyll i detta (alla parametrar med [hakparenteser])
- OUTPUT-FORMAT (exakt hur resultatet ska se ut)
- KVALITETSKRITERIER (vad gör det bra?)
- EXEMPEL (konkret input → output)

VARJE prompt ska spara minst 30 minuter och vara så pedagogisk att även en nybörjare kan använda den.`,
        
        user: `Skapa AVANCERADE lösningar för dessa arbetsuppgifter:
${tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join('\n')}

KRITISKT: Svara ENDAST med giltig JSON. Ingen annan text, ingen förklaring, ingen markdown.

För VARJE uppgift, returnera EXAKT detta JSON-format:
{
  "solutions": [
    {
      "task": "Exakt uppgiftsnamn",
      "solution": "Konkret lösning i 2-3 meningar. Förklara specifikt HUR AI revolutionerar denna uppgift och EXAKT vilken tidsbesparing (i minuter/timmar) det ger.",
      "prompt": "En VÄLSTRUKTURERAD prompt som är DIREKT kopierbar.\n\nVIKTIGT OM HAKPARENTESER:\n- Använd [HAKPARENTESER] ENDAST för värden som användaren ska ersätta\n- INTE runt instruktioner eller förklaringar\n\nKORREKT exempel:\nSpråk: [Svenska/Engelska/etc]\nElevens namn: [Ditt elevnamn här]\n\nFEL exempel:\n[Språk]: [Svenska/Engelska/etc]\n[Beskriv uppgiften här som ska göras]\n\nSTRUKTUR SOM SKA ANVÄNDAS:\n\n**ROLL & KONTEXT:**\nDu är en [YRKESROLL] med expertis i [OMRÅDE]. Din uppgift är att...\n\n**UPPGIFT:**\nSkapa/Analysera/Generera [SPECIFIK OUTPUT] baserat på följande input.\n\n**INPUT - Fyll i detta:**\nParameter 1: [ditt värde]\nParameter 2: [ditt värde]\nParameter 3: [ditt värde]\n\n**OUTPUT-FORMAT:**\nReturnera svaret som:\n1) [FORMAT DEL 1]\n2) [FORMAT DEL 2]\n\n**KVALITETSKRITERIER:**\nResultatet ska:\n- Kriterie 1\n- Kriterie 2\n\n**EXEMPEL:**\nInput exempel: Parameter 1: [Exempel 1], Parameter 2: [Exempel 2]\nOutput exempel: [Visar konkret resultat]\n\nKOMIHÅG: Hakparenteser BARA på input-värden som ska bytas ut!"
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
      // GPT-5 supports system messages unlike o1
    });

    const content = completion.choices[0].message.content || "{}";
    console.log("GPT-5 raw response:", content);
    
    // Try to extract JSON if wrapped in markdown code blocks
    let cleanedContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[1];
    }
    
    const result = JSON.parse(cleanedContent);
    
    // Validate that we have solutions
    if (!result.solutions || !Array.isArray(result.solutions) || result.solutions.length === 0) {
      console.error("Invalid GPT-5 response structure:", result);
      throw new Error("GPT-5 returned invalid data structure");
    }

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