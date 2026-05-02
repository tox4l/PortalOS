import OpenAI from "openai";
import { requireEnv } from "@/lib/env";

let deepseekClient: OpenAI | null = null;

export function getDeepSeek(): OpenAI {
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: requireEnv("DEEPSEEK_API_KEY")
    });
  }

  return deepseekClient;
}

export const DEEPSEEK_MODEL = "deepseek-chat";
