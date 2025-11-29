import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "./db";

function getGenAI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY environment variable");
  }
  return new GoogleGenerativeAI(apiKey);
}

// Generate chat response using Gemini
export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  conversationHistory: Message[]
): Promise<string> {
  // Build conversation context as a simple prompt
  let prompt = `You are a friendly and engaging AI chatbot. You learn from conversations and remember details about users. Be conversational, helpful, and remember important details the user shares.\n\n`;

  // Add conversation history for context
  if (conversationHistory.length > 0) {
    prompt += "Previous conversation:\n";
    conversationHistory.slice(-10).forEach((msg) => {
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${
        msg.content
      }\n`;
    });
    prompt += "\n";
  }

  // Add current user message
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === "user") {
    prompt += `User: ${lastMessage.content}\nAssistant:`;
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Sorry, I could not generate a response.";
  } catch (error) {
    console.error("Gemini API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("model") || errorMessage.includes("not found")) {
      throw new Error(
        `Invalid Gemini model. Please check your model name. Error: ${errorMessage}`
      );
    }
    if (
      errorMessage.includes("API key") ||
      errorMessage.includes("authentication")
    ) {
      throw new Error("Invalid or missing Google Gemini API key");
    }
    throw new Error(`Failed to generate chat response: ${errorMessage}`);
  }
}

// Generate personality profile from chat history using Gemini
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
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);

    const response = await result.response;
    return response.text() || "Unable to generate profile at this time.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate personality profile");
  }
}
