// useChat - handles sending messages and streaming AI responses
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useConversations, Message } from "./useConversations";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const useChat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync user state with auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    isLoadingConversations,
    createConversation,
    deleteConversation,
    clearAllHistory,
    selectConversation,
    startNewChat,
    saveMessage,
  } = useConversations(user);

  // Stream chat response using SSE - gives us the typing effect
  const streamChat = useCallback(
    async (
      allMessages: { role: string; content: string }[],
      onDelta: (text: string) => void,
      onDone: () => void
    ) => {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        if (resp.status === 402) {
          throw new Error("AI usage limit reached. Please add credits to continue.");
        }
        throw new Error(errorData.error || "Failed to connect to AI");
      }

      if (!resp.body) throw new Error("No response body");

      // Parse SSE stream
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            // Incomplete JSON, wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining content
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            // Ignore parse errors at end
          }
        }
      }

      onDone();
    },
    []
  );

  // Send a message and get AI response
  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Create conversation for logged-in users
      let convId = activeConversationId;
      if (user && !convId) {
        const title = input.trim().slice(0, 40) + (input.length > 40 ? "..." : "");
        convId = await createConversation(title);
      }

      // Save user message to database
      if (user && convId) {
        saveMessage("user", input.trim(), convId);
      }

      let assistantContent = "";

      // Update UI as tokens arrive
      const updateAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === "streaming") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, { id: "streaming", role: "assistant", content: assistantContent }];
        });
      };

      try {
        const chatHistory = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        await streamChat(chatHistory, updateAssistant, () => {
          // Finalize message with real ID
          setMessages((prev) =>
            prev.map((m) => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m))
          );
          setIsLoading(false);

          // Save assistant response
          if (user && convId && assistantContent) {
            saveMessage("assistant", assistantContent, convId);
          }
        });
      } catch (error) {
        console.error("Chat error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to send message");
        setIsLoading(false);
      }
    },
    [messages, isLoading, streamChat, user, activeConversationId, createConversation, saveMessage, setMessages]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    setMessages,
    user,
    conversations,
    activeConversationId,
    isLoadingConversations,
    selectConversation,
    deleteConversation,
    clearAllHistory,
    startNewChat,
  };
};
