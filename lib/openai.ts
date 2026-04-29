import OpenAI from "openai";
import { requireEnv } from "@/lib/env";

let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: requireEnv("OPENAI_API_KEY")
    });
  }

  return openaiClient;
}

export const OPENAI_BRIEF_MODEL = "gpt-4o";
