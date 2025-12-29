// Main chat interface - messages, input, and sidebar
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";
import QuickActions from "./QuickActions";
import { useChat } from "@/hooks/useChat";

const ChatInterface = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    user,
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    clearAllHistory,
    startNewChat,
  } = useChat();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  // Send on Enter, allow Shift+Enter for newlines
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format conversations for sidebar
  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
  }));

  return (
    <div className="flex h-full">
      {/* Sidebar for logged-in users */}
      {user && (
        <ChatSidebar
          conversations={sidebarConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onNewConversation={startNewChat}
          onDeleteConversation={deleteConversation}
          onClearAllHistory={clearAllHistory}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b border-border bg-card/50 px-4 py-2">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {!user && (
            <p className="text-sm text-foreground flex-1 text-center">
              <span className="text-muted-foreground">Sign in to save chat history.</span>{" "}
              <a href="/auth" className="text-primary font-medium hover:underline">
                Sign in →
              </a>
            </p>
          )}

          {user && (
            <p className="text-sm text-muted-foreground flex-1 md:text-center">
              {activeConversationId ? "Conversation" : "New Chat"}
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-chat">
          {/* Show quick actions for new chats */}
          {messages.length === 1 && (
            <div className="px-4 md:px-6 pt-6">
              <div className="max-w-4xl mx-auto mb-2">
                <h2 className="text-lg font-semibold text-foreground mb-1">Get Started</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a topic or ask your own question
                </p>
              </div>
              <div className="max-w-4xl mx-auto">
                <QuickActions onAction={handleQuickAction} />
              </div>
            </div>
          )}

          <div className="pb-6">
            {messages.map((message) => (
              <div key={message.id} className="max-w-4xl mx-auto">
                <ChatMessage role={message.role} content={message.content} />
              </div>
            ))}
            {/* Typing indicator when waiting for AI */}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="max-w-4xl mx-auto">
                <ChatMessage role="assistant" content="" isTyping />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="relative border-t border-border bg-card/80 backdrop-blur-lg p-4 md:p-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-hero opacity-30" />

          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-hero rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300" />

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about admissions, SOPs, scholarships, or test prep..."
                  className={cn(
                    "relative w-full min-h-[56px] max-h-36 px-5 py-4 pr-12",
                    "bg-secondary/80 rounded-2xl border border-border/50",
                    "text-[15px] text-secondary-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30",
                    "resize-none transition-all duration-200"
                  )}
                  rows={1}
                  disabled={isLoading}
                />

                <div className="absolute right-4 bottom-4">
                  <Sparkles className="w-4 h-4 text-accent animate-pulse-soft" />
                </div>
              </div>

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="lg"
                className={cn(
                  "h-[56px] px-6 rounded-2xl",
                  "bg-gradient-hero hover:opacity-90",
                  "shadow-lg hover:shadow-glow",
                  "transition-all duration-300"
                )}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              EduVerse only answers U.S. education questions. Off-topic queries will be politely
              declined.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
