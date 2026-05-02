import { getDeepSeek, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { applyRateLimit, API_RATE_LIMITS } from "@/lib/api-rate-limit";

const SYSTEM_PROMPT =
  "You are a senior creative strategist at a top creative agency. Write detailed, professional creative briefs. Use clear sections: Background, Objectives, Target Audience, Key Messages, Tone & Voice, Deliverables, and Timeline. Write in a confident, articulate tone. Use markdown formatting for structure. Avoid buzzwords. Be specific and actionable.";

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "ai:generate-brief", API_RATE_LIMITS.AI_GENERATE);
  if (limited) return limited;

  const deepseek = getDeepSeek();

  const body = (await request.json()) as {
    projectName?: string;
    clientName?: string;
    goals?: string;
    audience?: string;
    tone?: string;
    keyMessages?: string;
  };

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
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    }
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
