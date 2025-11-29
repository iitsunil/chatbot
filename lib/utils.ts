import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Very small safe markdown renderer for bold/italic/code without bringing in a full parser.
// Escapes HTML first, then applies minimal formatting.
export function renderMarkdownSafe(text: string): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  let escaped = escapeHtml(text);

  // Bold **text**
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  escaped = escaped.replace(
    /(^|\s)\*(?!\s)([^*]+?)\*(?=\s|$)/g,
    "$1<em>$2</em>"
  );
  // Inline code `code`
  escaped = escaped.replace(
    /`([^`]+?)`/g,
    '<code class="px-1 py-0.5 rounded bg-gray-100 text-red-600 text-xs">$1</code>'
  );

  // Preserve line breaks
  escaped = escaped.replace(/\r?\n/g, "<br/>");
  return escaped;
}
