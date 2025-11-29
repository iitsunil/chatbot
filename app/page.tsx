"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { Message } from "@/lib/db";

const USER_ID = "default-user"; // In a real app, this would come from auth

// Constants to avoid ESLint unescaped entities warnings
const APOSTROPHE = "'";
const QUOTE = '"';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: "",
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: USER_ID,
          message: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || "Failed to send message"
        );
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: data.messageId || `assistant-${Date.now()}`,
        conversation_id: data.conversationId || "",
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorDetails =
        error instanceof Error ? error.message : String(error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: "",
        role: "assistant",
        content: `Sorry, something went wrong. Please try again in a moment.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: USER_ID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || "Failed to get profile"
        );
      }

      const data = await response.json();

      const profileMessage: Message = {
        id: `profile-${Date.now()}`,
        conversation_id: "",
        role: "assistant",
        content: data.profile,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, profileMessage]);
    } catch (error) {
      console.error("Error getting profile:", error);
      const errorDetails =
        error instanceof Error ? error.message : String(error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: "",
        role: "assistant",
        content: `Sorry, I couldn't build your profile right now. Please try again later.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if message is a profile request
  const isProfileRequest = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes("who am i") ||
      lowerMessage.includes("tell me about myself") ||
      lowerMessage.includes("what do you know about me") ||
      lowerMessage.includes("my profile") ||
      lowerMessage.includes("describe me")
    );
  };

  const handleMessageSubmit = async (content: string) => {
    if (isProfileRequest(content)) {
      await handleProfileRequest();
    } else {
      await handleSendMessage(content);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">AI Chatbot</h1>
          <p className="text-sm text-gray-600 mt-1">
            Chat freely - I{APOSTROPHE}ll learn and remember our conversations
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-600 mb-4">
                Ask me anything, or try asking {QUOTE}Who am I?{QUOTE} after we
                {APOSTROPHE}ve chatted a bit!
              </p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={handleMessageSubmit} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
