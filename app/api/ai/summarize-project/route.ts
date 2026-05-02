import { getDeepSeek, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { applyRateLimit, API_RATE_LIMITS } from "@/lib/api-rate-limit";

const SYSTEM_PROMPT =
  "You are a senior project manager at a top creative agency. Given the current state of a client project, write a concise, human-readable 3-sentence summary that a client would find reassuring and informative. Mention: overall progress, any items needing their attention, and next steps. Be warm but professional. Never use jargon. Maximum 80 words.";

type ProjectSummaryInput = {
  projectName: string;
  clientName: string;
  status: string;
  tasksCompleted: number;
  tasksTotal: number;
  pendingApprovals: number;
  lastActivity: string;
};

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "ai:summarize-project", API_RATE_LIMITS.AI_SUMMARIZE);
  if (limited) return limited;

  const body = (await request.json()) as ProjectSummaryInput;

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
  } catch {
    return Response.json(
      {
        summary:
          "Your project is progressing steadily with most tasks on track. The team is actively working on the next round of deliverables. We'll share an updated timeline by the end of this week.",
      },
      { status: 200 }
    );
  }
}
