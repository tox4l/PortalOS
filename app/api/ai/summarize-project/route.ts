import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDeepSeek, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { applyRateLimit, API_RATE_LIMITS } from "@/lib/api-rate-limit";
import { logger } from "@/lib/logger";

const SYSTEM_PROMPT =
  "You are a senior project manager at a top creative agency. Given the current state of a client project, write a concise, human-readable 3-sentence summary that a client would find reassuring and informative. Mention: overall progress, any items needing their attention, and next steps. Be warm but professional. Never use jargon. Maximum 80 words.";

const ProjectSummarySchema = z.object({
  projectName: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  status: z.string().min(1).max(100),
  tasksCompleted: z.number().int().min(0).max(10000),
  tasksTotal: z.number().int().min(1).max(10000),
  pendingApprovals: z.number().int().min(0).max(1000),
  lastActivity: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await applyRateLimit(request, "ai:summarize-project", API_RATE_LIMITS.AI_SUMMARIZE);
    if (limited) return limited;

    const rawBody = await request.json();
    const parsed = ProjectSummarySchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const body = parsed.data;

    const userPrompt = [
      `Project: "${body.projectName}" for ${body.clientName}`,
      `Status: ${body.status}`,
      `Tasks: ${body.tasksCompleted} of ${body.tasksTotal} complete`,
      `Pending approvals: ${body.pendingApprovals}`,
      `Last activity: ${body.lastActivity}`,
      "\nWrite a 3-sentence client-friendly summary.",
    ].join("\n");

    try {
      const deepseek = getDeepSeek();

      const completion = await deepseek.chat.completions.create({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 150,
      });

      const summary = completion.choices[0]?.message?.content ?? "";

      return Response.json({ summary });
    } catch (innerError) {
      logger.warn("summarize-project AI call failed, using fallback", {
        error: innerError instanceof Error ? innerError.message : String(innerError),
      });
      return Response.json(
        {
          summary:
            "Your project is progressing steadily with most tasks on track. The team is actively working on the next round of deliverables. We'll share an updated timeline by the end of this week.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    logger.error("summarize-project handler error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
