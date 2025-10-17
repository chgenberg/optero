import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 180000 // 3 minutes for GPT-5
});

export const maxDuration = 180; // 3 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const InputSchema = z.object({
      url: z.string().url().optional().nullable(),
      websiteContent: z.string().optional().nullable(),
      websiteSummary: z.any().optional().nullable(),
      documentsContent: z.string().optional().nullable(),
      problems: z.array(z.string()).min(1),
      conversations: z.array(z.object({ problem: z.string(), conversation: z.array(z.object({ role: z.string(), content: z.string() })) })).optional().default([])
    });
    const { url, websiteContent, websiteSummary, documentsContent, problems, conversations } = InputSchema.parse(body);

    if (!problems || problems.length === 0) {
      return NextResponse.json({ error: "No problems provided" }, { status: 400 });
    }

    const solutions = [];

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const conversation = conversations[i]?.conversation || [];

      const systemPrompt = `You are a senior AI consultant with expertise in business processes, automation, and AI implementation.

Your job is to deeply analyze business problems and recommend the BEST solution:
1) AI Prompt: A complete, advanced prompt that solves the problem directly (for simple to medium complexity problems)
2) Bot Implementation: Detailed instructions to build a specialized AI bot (for complex, recurring problems)

Base your choice on:
- Problem complexity
- Frequency (one-off vs recurring)
- Need for integrations with other systems
- Cost effectiveness

Always return concrete, implementable solutions.`;

      const userPrompt = `
COMPANY: ${url}

COMPANY INFORMATION:
${websiteSummary?.mainText?.slice(0, 3000) || websiteContent?.slice(0, 3000) || ""}

DOCUMENTS & DATA:
${documentsContent?.slice(0, 5000) || "No documents uploaded"}

PROBLEM:
${problem}

DETAILED INTERVIEW:
${conversation.map((m: any) => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`).join('\n')}

TASK:
Analyze this problem deeply and determine the best solution approach.

Return JSON in EXACTLY this format:
{
  "problem": "${problem}",
  "analysis": "Deep analysis of root cause and business impact (3–5 sentences)",
  "approach": "prompt" or "bot",
  "prompt": "If approach is 'prompt': A VERY DETAILED, COMPLETE prompt that solves the entire problem. Include ROLE, CONTEXT, TASK, INPUT, OUTPUT, EXAMPLES. Minimum 500 words.",
  "botInstructions": {
    "overview": "If approach is 'bot': Overview of what the bot will do",
    "technicalStack": ["List of technologies, e.g. 'Python', 'OpenAI API', 'PostgreSQL'"],
    "implementation": ["Step 1 description", "Step 2 description", "...at least 5–8 steps"],
    "cost": "Estimated total cost (development + monthly ops)",
    "timeline": "Estimated implementation time"
  },
  "expectedOutcomes": ["Concrete outcome 1", "Concrete outcome 2", "...at least 3–5 outcomes with numbers if possible"]
}

IMPORTANT:
- If the problem can be solved with a prompt: Provide a VERY THOROUGH prompt (min 500 words)
- If the problem requires a bot: Provide DETAILED implementation steps
- Be concrete with numbers: costs, time savings, ROI
- Base recommendations on the company’s ACTUAL context`;

      try {
        console.log(`Generating solution for problem ${i + 1}/${problems.length}`);
        
        const completion = await openai.chat.completions.create({
          model: "gpt-5-mini", // Using gpt-5-mini for proven reliability
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 4000
        });

        const content = completion.choices[0].message.content || "{}";
        const raw = JSON.parse(content);
        const SolutionSchema = z.object({
          problem: z.string().optional(),
          analysis: z.string().min(20).optional(),
          approach: z.enum(["prompt","bot"]).optional(),
          prompt: z.string().optional(),
          botInstructions: z.object({
            overview: z.string().optional(),
            technicalStack: z.array(z.string()).optional(),
            implementation: z.array(z.string()).optional(),
            cost: z.string().optional(),
            timeline: z.string().optional()
          }).optional(),
          expectedOutcomes: z.array(z.string()).optional()
        });
        const solution = SolutionSchema.parse(raw);

        // Ensure the solution has the correct structure
        const finalSol = {
          problem: solution.problem || problem,
          analysis: solution.analysis || "A deeper analysis is required for this problem.",
          approach: solution.approach || "prompt",
          prompt: solution.approach === "prompt" ? solution.prompt : undefined,
          botInstructions: solution.approach === "bot" ? solution.botInstructions : undefined,
          expectedOutcomes: solution.expectedOutcomes || ["Improved efficiency", "Reduced costs", "Higher quality"]
        } as any;
        solutions.push(finalSol);

        // Persist to DB
        try {
          await prisma.executiveSolution.create({
            data: {
              companyUrl: url || null,
              problem: finalSol.problem,
              analysis: finalSol.analysis,
              approach: finalSol.approach,
              prompt: finalSol.prompt || null,
              botInstructions: finalSol.botInstructions ?? undefined,
              expectedOutcomes: finalSol.expectedOutcomes
            }
          });
        } catch (dbErr) {
          console.error("Failed to save ExecutiveSolution:", dbErr);
        }

      } catch (error) {
        console.error(`Error generating solution for problem ${i + 1}:`, error);
        // Fallback solution
        const fallback = {
          problem,
          analysis: `This is a complex problem that requires careful analysis. Based on the interview, we identify several critical factors impacting your operations.`,
          approach: "prompt",
          prompt: `**ROLE & CONTEXT:**
You are an expert in ${url} and will help solve the following problem: ${problem}

**TASK:**
Analyze the situation and provide concrete recommendations.

**INPUT – Fill in:**
[CURRENT STATE]: Describe your current situation
[GOALS]: What do you want to achieve
[RESOURCES]: What resources are available

**OUTPUT FORMAT:**
Deliver:
1) Situation analysis
2) Recommended actions
3) Implementation plan
4) Expected outcomes

**EXAMPLE:**
Input:
[CURRENT STATE]: We have manual processes
[GOALS]: Automate 50%
[RESOURCES]: 2 developers, 3 months

Output:
1. Analysis: Identified 5 automatable processes
2. Actions: Implement RPA for processes A, B, C
3. Plan: Phase 1 (months 1–2), Phase 2 (month 3)
4. Result: 60% time savings, ROI in 8 months`,
          expectedOutcomes: [
            "Improved process efficiency",
            "Reduced manual workload",
            "Better data quality and insights"
          ]
        } as any;
        solutions.push(fallback);
        try {
          await prisma.executiveSolution.create({
            data: {
              companyUrl: url || null,
              problem: fallback.problem,
              analysis: fallback.analysis,
              approach: fallback.approach,
              prompt: fallback.prompt || null,
              botInstructions: undefined,
              expectedOutcomes: fallback.expectedOutcomes
            }
          });
        } catch {}
      }
    }

    return NextResponse.json({ solutions });

  } catch (error: any) {
    console.error("Executive solution generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate solutions",
        details: error.message
      },
      { status: 500 }
    );
  }
}

