import Groq from "groq-sdk";
import { Message } from "./db";

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable");
  }
  return new Groq({ apiKey });
}

// Generate chat response using Groq (Free)
export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  conversationHistory: Message[]
): Promise<string> {
  try {
    const groq = getGroq();

    // Build conversation context
    const conversationMessages = conversationHistory.slice(-10).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Add system message
    const systemMessage = {
      role: "system" as const,
      content: `You are a friendly and engaging AI chatbot. You learn from conversations and remember details about users. Be conversational, helpful, and remember important details the user shares.`,
    };

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Current active free model
      messages: [systemMessage, ...conversationMessages, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      console.log(`✅ Successfully generated response with Groq`);
      return response;
    }

    throw new Error("No response generated");
  } catch (error) {
    console.error("Groq API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate chat response: ${errorMessage}`);
  }
}

// Generate personality profile from chat history using Groq
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

  try {
    const groq = getGroq();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Current active free model
      messages: [
        {
          role: "system",
          content: `Based on the following conversation history, create a personality-style profile of the user. Focus on their interests, personality traits, communication style, preferences, and any notable characteristics. Write it in a friendly, engaging way as if you're describing a friend.`,
        },
        {
          role: "user",
          content: `Conversation history:\n${userMessages}\n\nCreate a personality profile:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      console.log(`✅ Successfully generated profile with Groq`);
      return response;
    }

    throw new Error("No response generated");
  } catch (error) {
    console.error("Groq API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate personality profile: ${errorMessage}`);
  }
}
