import { Message } from "@/lib/db";
import { format } from "date-fns";
import { renderMarkdownSafe } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-900 shadow-sm border border-gray-200"
        }`}
      >
        <div
          className="whitespace-pre-wrap break-words"
          // Render minimal markdown (bold/italic/code) without raw ** showing.
          dangerouslySetInnerHTML={{
            __html: renderMarkdownSafe(message.content),
          }}
        />
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {format(new Date(message.created_at), "HH:mm")}
        </div>
      </div>
    </div>
  );
}
