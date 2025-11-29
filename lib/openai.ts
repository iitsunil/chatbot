import OpenAI from "openai";
import { Message } from "./db";

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

// Generate chat response
export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  conversationHistory: Message[]
): Promise<string> {
  // Build conversation context
  const conversationMessages = conversationHistory.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Add system message
  const systemMessage = {
    role: "assistant" as const,
    content: `You are a friendly and engaging AI chatbot. You learn from conversations and remember details about users. 
    Be conversational, helpful, and remember important details the user shares.`,
  };

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...conversationMessages, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return (
      completion.choices[0]?.message?.content ||
      "Sorry, I could not generate a response."
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate chat response");
  }
}

// Generate personality profile from chat history
export async function generatePersonalityProfile(
  messages: Message[]
): Promise<string> {
  if (messages.length === 0) {
    return "I don't have enough information about you yet. Please chat with me more so I can learn about you!";
  }

  // Filter only user messages
  const userMessages = messages
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content)
    .join("\n");

  if (userMessages.length === 0) {
    return "I don't have enough information about you yet. Please chat with me more so I can learn about you!";
  }

  const prompt = `Based on the following conversation history, create a personality-style profile of the user. 
  Focus on their interests, personality traits, communication style, preferences, and any notable characteristics.
  Write it in a friendly, engaging way as if you're describing a friend.
  
  Conversation history:
  ${userMessages}
  
  Create a personality profile:`;

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return (
      completion.choices[0]?.message?.content ||
      "Unable to generate profile at this time."
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate personality profile");
  }
}
