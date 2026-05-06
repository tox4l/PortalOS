import { z } from "zod";
import type OpenAI from "openai";
import { auth } from "@/lib/auth";
import { getDeepSeek, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { applyRateLimit, API_RATE_LIMITS } from "@/lib/api-rate-limit";
import { logger } from "@/lib/logger";

const SYSTEM_PROMPT =
  "You are a senior creative strategist at a top creative agency. Write detailed, professional creative briefs. Use clear sections: Background, Objectives, Target Audience, Key Messages, Tone & Voice, Deliverables, and Timeline. Write in a confident, articulate tone. Use markdown formatting for structure. Avoid buzzwords. Be specific and actionable.";

const GenerateBriefSchema = z.object({
  projectName: z.string().max(200).optional(),
  clientName: z.string().max(200).optional(),
  goals: z.string().max(5000).optional(),
  audience: z.string().max(2000).optional(),
  tone: z.string().max(500).optional(),
  keyMessages: z.string().max(5000).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await applyRateLimit(request, "ai:generate-brief", API_RATE_LIMITS.AI_GENERATE);
    if (limited) return limited;

    const rawBody = await request.json();
    const parsed = GenerateBriefSchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const body = parsed.data;
    let deepseek: OpenAI;
    try {
      deepseek = getDeepSeek();
    } catch {
      return Response.json(
        { error: "AI generation is not configured. Set DEEPSEEK_API_KEY to enable this feature." },
        { status: 501 }
      );
    }

    const projectName = body.projectName ?? "this project";
    const clientName = body.clientName ? ` for ${body.clientName}` : "";

    const userPrompt = [
      `Write a comprehensive creative brief for the project "${projectName}"${clientName}.`,
      body.goals ? `\n\nProject Goals: ${body.goals}` : "",
      body.audience ? `\n\nTarget Audience: ${body.audience}` : "",
      body.tone ? `\n\nDesired Tone: ${body.tone}` : "",
      body.keyMessages ? `\n\nKey Messages: ${body.keyMessages}` : "",
      "\n\nFormat the brief with clear section headings using markdown."
    ].join("");

    const stream = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamError) {
          logger.error("Stream error in generate-brief", {
            error: streamError instanceof Error ? streamError.message : String(streamError),
          });
          controller.error(streamError);
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Accel-Buffering": "no",
      }
    });
  } catch (error) {
    logger.error("generate-brief handler error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    );
  }
}
