import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 1,
  timeout: 60000 // 1 minute for chat responses (faster for better UX)
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, history, userInfo } = await request.json();

    // Check access for consumer users
    if (context.type === "consumer" && userInfo) {
      const purchasedTier = userInfo.tier;
      const purchaseDate = userInfo.purchaseDate ? new Date(userInfo.purchaseDate) : null;
      
      // Only Pro tier has AI-coach access
      if (purchasedTier !== "pro") {
        return NextResponse.json({ 
          response: "AI-Coach är endast tillgänglig för Pro-användare. Uppgradera för att få tillgång till personlig AI-coaching!" 
        });
      }

      // Check 30-day limit
      if (purchaseDate) {
        const daysSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePurchase > 30) {
          return NextResponse.json({ 
            response: "Din 30-dagars AI-Coach period har löpt ut. Kontakta support för att förlänga." 
          });
        }
      }
    }

    // Build system prompt based on context
    const systemPrompt = context.type === "consumer" 
      ? `Du är en personlig AI-coach för ${context.profession} (${context.specialization}).
        
        Användarens kontext:
        - Yrke: ${context.profession}
        - Specialisering: ${context.specialization}
        - Valda arbetsuppgifter: ${context.tasks?.join(", ")}
        
        Din roll:
        1. Ge KONKRETA, PRAKTISKA råd om AI-implementation
        2. Föreslå SPECIFIKA verktyg och hur de används
        3. Ge steg-för-steg instruktioner
        4. Vara uppmuntrande och positiv
        5. Fokusera på att spara tid och öka produktivitet
        6. Ge exempel från deras bransch
        
        Svara alltid på svenska. Var personlig och engagerande.
        Håll svaren koncisa men värdefulla.`
      : `Du är en AI-implementeringscoach för företag.
        
        Företagskontext:
        - Avdelning: ${context.department}
        - Företagsstorlek: ${context.companySize}
        - Utmaningar: ${context.challenges?.join(", ")}
        
        Din roll:
        1. Ge strategiska råd för AI-implementation
        2. Fokusera på change management
        3. Föreslå KPI:er och mätmetoder
        4. Ge konkreta första steg
        5. Adressera vanliga hinder
        6. Visa på ROI och affärsvärde
        
        Svara alltid på svenska. Var professionell men tillgänglig.
        Tänk på att du pratar med någon som ska få med sig ett helt team.`;

    // Convert history to OpenAI format
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages,
      max_completion_tokens: 600,
    });

    const response = completion.choices[0].message.content || "Jag förstår inte riktigt. Kan du formulera om din fråga?";

    // Save to database for analytics (optional)
    try {
      await prisma.chatHistory.create({
        data: {
          userType: context.type,
          profession: context.profession,
          message: message,
          response: response,
        }
      });
    } catch (dbError) {
      console.error("Failed to save chat history:", dbError);
      // Continue anyway - chat should work even if DB fails
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat coach error:", error);
    
    // Fallback responses
    const fallbackResponse = "Ursäkta, något gick fel. Låt mig hjälpa dig med AI-implementation! Vad är din största utmaning just nu?";
    
    return NextResponse.json({ response: fallbackResponse });
  }
}
