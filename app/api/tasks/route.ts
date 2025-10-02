import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { profession, specialization } = await req.json();
    if (!profession) {
      return NextResponse.json({ error: "Saknar yrke" }, { status: 400 });
    }

    const role = specialization || profession;
    const prompt = `Du är expert på arbetsuppgifter i Sverige. Lista de 10 vanligaste DAGLIGA arbetsuppgifterna för en person som jobbar som \"${role}\".
- Svara enbart som JSON i formatet { "tasks": ["..."] }
- Håll uppgifterna korta, konkreta och svenska
- Fokusera på verkliga dagliga uppgifter, inte övergripande ansvar
- Inga förklaringar, endast arrayen.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Svara alltid med giltig JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Tomt svar");

    const data = JSON.parse(content);
    const items: string[] = Array.isArray(data?.tasks) ? data.tasks : [];
    
    return NextResponse.json({ tasks: items });
  } catch (err) {
    console.error("tasks api error", err);
    return NextResponse.json({ tasks: [] }, { status: 200 });
  }
}

