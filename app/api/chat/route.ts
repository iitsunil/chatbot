import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateConversation,
  saveMessage,
  getConversationHistory,
} from "@/lib/db";
import { generateChatResponseFallback } from "@/lib/aiFallback";

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: "Missing userId or message" },
        { status: 400 }
      );
    }

    // Get or create conversation
    const conversationId = await getOrCreateConversation(userId);

    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Save user message
    const userMessage = await saveMessage(conversationId, "user", message);

    // Generate AI response with fallback (Groq -> Gemini -> OpenAI)
    const response = await generateChatResponseFallback(
      [{ role: "user", content: message }],
      history
    );

    // Save assistant message
    const assistantMessage = await saveMessage(
      conversationId,
      "assistant",
      response
    );

    return NextResponse.json({
      conversationId,
      messageId: assistantMessage.id,
      response,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const raw = error instanceof Error ? error.message : String(error);

    // Map raw error to user-safe message
    let publicMessage = "Something went wrong. Please try again shortly.";
    if (/rate|quota|limit/i.test(raw)) publicMessage = "Rate limit reached. Please wait and retry.";
    if (/timeout|network/i.test(raw)) publicMessage = "Network issue. Please retry.";
    if (/invalid api key|auth|unauthorized/i.test(raw)) publicMessage = "Authentication error. Check configuration.";

    // Always log full details server-side, but never expose them to client except in dev optionally via debug flag.
    const debug = process.env.NODE_ENV === "development" ? { debug: raw } : {};

    return NextResponse.json(
      { error: publicMessage, ...debug },
      { status: 500 }
    );
  }
}
