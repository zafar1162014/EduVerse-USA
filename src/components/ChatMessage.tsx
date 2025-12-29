/**
 * ChatMessage Component
 * 
 * Renders individual chat messages with different styles for
 * user messages vs assistant (AI) responses.
 * Supports markdown formatting for rich text display.
 */

import { cn } from "@/lib/utils";
import { GraduationCap, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

const ChatMessage = ({ role, content, isTyping }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 px-4 py-5 md:px-6",
        isUser ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      {/* Avatar icon */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
            isUser
              ? "bg-secondary text-secondary-foreground"
              : "bg-gradient-hero text-primary-foreground shadow-lg"
          )}
        >
          {!isUser && (
            <div className="absolute inset-0 bg-gradient-hero rounded-xl blur-md opacity-40" />
          )}
          <div className="relative">
            {isUser ? <User className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Message bubble */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className={cn("text-sm font-semibold", isUser ? "text-muted-foreground" : "text-primary")}>
          {isUser ? "You" : "EduVerse Assistant"}
        </p>

        <div
          className={cn(
            "relative rounded-2xl px-5 py-4 text-[15px] leading-relaxed",
            isUser
              ? "bg-secondary text-secondary-foreground rounded-tr-sm"
              : "bg-card border border-border/50 text-card-foreground rounded-tl-sm shadow-md"
          )}
        >
          {/* Subtle gradient for assistant messages */}
          {!isUser && (
            <div className="absolute inset-0 bg-gradient-hero opacity-[0.02] rounded-2xl rounded-tl-sm" />
          )}

          {isTyping ? (
            // Typing animation (three bouncing dots)
            <div className="flex gap-2 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-typing" style={{ animationDelay: "0ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-typing" style={{ animationDelay: "200ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-typing" style={{ animationDelay: "400ms" }} />
            </div>
          ) : (
            // Render markdown content
            <div className="relative prose prose-sm max-w-none text-inherit">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                  li: ({ children }) => <li className="text-inherit">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-foreground">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-foreground">{children}</h3>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
