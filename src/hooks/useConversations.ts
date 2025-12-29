// useConversations - manages chat history persistence in the database
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Welcome message shown at the start of every chat
const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm your EduVerse USA study assistant. I can help you with U.S. university admissions, Statement of Purpose guidance, scholarship opportunities, and test preparation for GRE, TOEFL, and IELTS.\n\nHow can I assist you today?",
};

export const useConversations = (user: User | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Load all conversations when user logs in
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([INITIAL_MESSAGE]);
      return;
    }

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Failed to load conversations:", error);
        setIsLoadingConversations(false);
        return;
      }

      const convs: Conversation[] = (data || []).map((c) => ({
        id: c.id,
        title: c.title,
        updatedAt: new Date(c.updated_at),
      }));

      setConversations(convs);
      setIsLoadingConversations(false);
    };

    loadConversations();
  }, [user]);

  // Load messages when switching conversations
  useEffect(() => {
    if (!user || !activeConversationId) {
      setMessages([INITIAL_MESSAGE]);
      return;
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load messages:", error);
        return;
      }

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        setMessages([INITIAL_MESSAGE, ...loadedMessages]);
      } else {
        setMessages([INITIAL_MESSAGE]);
      }
    };

    loadMessages();
  }, [user, activeConversationId]);

  // Create a new conversation
  const createConversation = useCallback(
    async (title: string = "New Chat") => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (error) {
        console.error("Failed to create conversation:", error);
        toast.error("Failed to create conversation");
        return null;
      }

      const newConv: Conversation = {
        id: data.id,
        title: data.title,
        updatedAt: new Date(data.updated_at),
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([INITIAL_MESSAGE]);

      return newConv.id;
    },
    [user]
  );

  // Update conversation title
  const updateConversationTitle = useCallback(
    async (conversationId: string, title: string) => {
      const { error } = await supabase
        .from("conversations")
        .update({ title })
        .eq("id", conversationId);

      if (error) {
        console.error("Failed to update conversation title:", error);
        return;
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
      );
    },
    []
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) {
        console.error("Failed to delete conversation:", error);
        toast.error("Failed to delete conversation");
        return;
      }

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));

      // Reset to fresh state if we deleted the active one
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([INITIAL_MESSAGE]);
      }

      toast.success("Conversation deleted");
    },
    [activeConversationId]
  );

  // Clear all conversations
  const clearAllHistory = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to clear history:", error);
      toast.error("Failed to clear history");
      return;
    }

    setConversations([]);
    setActiveConversationId(null);
    setMessages([INITIAL_MESSAGE]);
    toast.success("All conversations deleted");
  }, [user]);

  // Switch to a conversation
  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  // Start a fresh chat
  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([INITIAL_MESSAGE]);
  }, []);

  // Save a message to the database
  const saveMessage = useCallback(
    async (role: "user" | "assistant", content: string, conversationId: string) => {
      if (!user) return;

      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        role,
        content,
        conversation_id: conversationId,
      });

      if (error) {
        console.error("Failed to save message:", error);
      }

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    [user]
  );

  return {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    isLoadingConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    clearAllHistory,
    selectConversation,
    startNewChat,
    saveMessage,
    INITIAL_MESSAGE,
  };
};
