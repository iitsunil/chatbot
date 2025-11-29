import { NextRequest, NextResponse } from "next/server";
import { getAllUserMessages, getUserProfile, saveUserProfile } from "@/lib/db";
import { generatePersonalityProfileFallback } from "@/lib/aiFallback";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get all user messages
    const messages = await getAllUserMessages(userId);

    if (messages.length < 3) {
      return NextResponse.json({
        profile:
          "I don't have enough information about you yet. Please chat with me more so I can learn about you!",
      });
    }

    // Check if we have a cached profile
    const existingProfile = await getUserProfile(userId);

    // Generate new profile from chat history with fallback (Groq -> Gemini -> OpenAI)
    const profileText = await generatePersonalityProfileFallback(messages);

    // Save the profile
    await saveUserProfile(userId, profileText);

    return NextResponse.json({
      profile: profileText,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    const raw = error instanceof Error ? error.message : String(error);

    let publicMessage = "Unable to generate profile right now.";
    if (/rate|quota|limit/i.test(raw))
      publicMessage = "Profile generation rate limit reached. Retry later.";
    if (/timeout|network/i.test(raw))
      publicMessage = "Network issue. Please retry.";
    if (/invalid api key|auth|unauthorized/i.test(raw))
      publicMessage = "Authentication error. Check configuration.";

    const debug = process.env.NODE_ENV === "development" ? { debug: raw } : {};

    return NextResponse.json(
      { error: publicMessage, ...debug },
      { status: 500 }
    );
  }
}
