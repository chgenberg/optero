import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    const systemPrompt = `Du är en hjälpsam AI-assistent som svarar på frågor om AI-verktyg för en ${context.specialization}.

Kontext om användaren:
- Yrke: ${context.profession}
- Specialisering: ${context.specialization}
- Erfarenhetsnivå: ${context.experience}
- Utmaningar: ${context.challenges.join(", ")}
- Prioriterade uppgifter: ${context.tasks.map((t: any) => t.task).join(", ")}

Rekommenderade verktyg:
${context.recommendations.map((r: any, i: number) => `${i + 1}. ${r.name} - ${r.description}`).join("\n")}

Ge korta, konkreta och hjälpsamma svar. Fokusera på praktisk tillämpning. Håll svaren under 100 ord om möjligt.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: messages as any,
      max_completion_tokens: 400,
    });

    const responseMessage = completion.choices[0].message.content || "Jag förstår inte riktigt. Kan du formulera om frågan?";

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { message: "Något gick fel. Försök igen om en stund." },
      { status: 500 }
    );
  }
}
