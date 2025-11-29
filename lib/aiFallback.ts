import { Message } from "./db";
import { generateChatResponse as groqChat } from "./groq";
import { generateChatResponse as geminiChat } from "./gemini";
import { generateChatResponse as openaiChat } from "./openai";
import { generatePersonalityProfile as groqProfile } from "./groq";
import { generatePersonalityProfile as geminiProfile } from "./gemini";
import { generatePersonalityProfile as openaiProfile } from "./openai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function aggregateErrors(
  errors: Array<{ provider: string; error: unknown }>
): string {
  return errors
    .map((e) => {
      const msg = e.error instanceof Error ? e.error.message : String(e.error);
      return `${e.provider}: ${msg}`;
    })
    .join(" | ");
}

export async function generateChatResponseFallback(
  messages: ChatMessage[],
  conversationHistory: Message[]
): Promise<string> {
  const errors: Array<{ provider: string; error: unknown }> = [];

  const providers: Array<{
    name: string;
    enabled: boolean;
    fn: () => Promise<string>;
  }> = [
    {
      name: "groq",
      enabled: !!process.env.GROQ_API_KEY,
      fn: () => groqChat(messages, conversationHistory),
    },
    {
      name: "gemini",
      enabled: !!process.env.GOOGLE_API_KEY,
      fn: () => geminiChat(messages, conversationHistory),
    },
    {
      name: "openai",
      enabled: !!process.env.OPENAI_API_KEY,
      fn: () => openaiChat(messages, conversationHistory),
    },
  ];

  for (const p of providers) {
    if (!p.enabled) {
      errors.push({ provider: p.name, error: new Error("API key missing") });
      continue;
    }
    try {
      const result = await p.fn();
      console.log(`[AI Fallback] Using provider: ${p.name}`);
      return result;
    } catch (err) {
      errors.push({ provider: p.name, error: err });
      continue;
    }
  }

  throw new Error("All providers failed: " + aggregateErrors(errors));
}

export async function generatePersonalityProfileFallback(
  messages: Message[]
): Promise<string> {
  const errors: Array<{ provider: string; error: unknown }> = [];

  const providers: Array<{
    name: string;
    enabled: boolean;
    fn: () => Promise<string>;
  }> = [
    {
      name: "groq",
      enabled: !!process.env.GROQ_API_KEY,
      fn: () => groqProfile(messages),
    },
    {
      name: "gemini",
      enabled: !!process.env.GOOGLE_API_KEY,
      fn: () => geminiProfile(messages),
    },
    {
      name: "openai",
      enabled: !!process.env.OPENAI_API_KEY,
      fn: () => openaiProfile(messages),
    },
  ];

  for (const p of providers) {
    if (!p.enabled) {
      errors.push({ provider: p.name, error: new Error("API key missing") });
      continue;
    }
    try {
      const result = await p.fn();
      console.log(`[AI Fallback] Using provider: ${p.name}`);
      return result;
    } catch (err) {
      errors.push({ provider: p.name, error: err });
      continue;
    }
  }

  throw new Error("All providers failed: " + aggregateErrors(errors));
}
