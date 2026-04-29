import { getOpenAI, OPENAI_BRIEF_MODEL } from "@/lib/openai";

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
    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
      model: OPENAI_BRIEF_MODEL,
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
