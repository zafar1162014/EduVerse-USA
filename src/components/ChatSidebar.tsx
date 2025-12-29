// Sidebar for chat history - shows past conversations
import { useState } from "react";
import { Plus, MessageSquare, Trash2, X, History, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAllHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAllHistory,
  isOpen,
  onClose,
}: ChatSidebarProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Human-readable date labels
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((acc, conv) => {
    const dateLabel = formatDate(conv.updatedAt);
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 md:z-auto",
          "h-full bg-card border-r border-border",
          "flex flex-col transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:translate-x-0",
          isMinimized ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className={cn("p-3 border-b border-border", isMinimized && "px-2")}>
          <div className="flex items-center justify-between mb-3">
            {!isMinimized && (
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Chat History</h2>
              </div>
            )}
            
            <div className={cn("flex items-center gap-1", isMinimized && "w-full justify-center")}>
              {/* Collapse toggle - desktop only */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 hidden md:flex"
                  >
                    {isMinimized ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isMinimized ? "Expand sidebar" : "Minimize sidebar"}
                </TooltipContent>
              </Tooltip>

              {/* Close button - mobile only */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* New chat button */}
          {isMinimized ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewConversation}
                  size="icon"
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New Chat</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={onNewConversation}
              className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1">
          <div className={cn("p-2", isMinimized && "px-1.5")}>
            {conversations.length === 0 ? (
              <div className={cn("text-center py-8 text-muted-foreground", isMinimized && "py-4")}>
                <MessageSquare className={cn("mx-auto mb-2 opacity-30", isMinimized ? "w-6 h-6" : "w-10 h-10")} />
                {!isMinimized && (
                  <>
                    <p className="font-medium text-sm">No conversations yet</p>
                    <p className="text-xs mt-1 opacity-70">Start a new chat</p>
                  </>
                )}
              </div>
            ) : (
              Object.entries(groupedConversations).map(([dateLabel, convs]) => (
                <div key={dateLabel} className="mb-3">
                  {!isMinimized && (
                    <p className="text-xs text-muted-foreground px-2 py-1.5 font-semibold uppercase tracking-wider">
                      {dateLabel}
                    </p>
                  )}
                  {convs.map((conv) => (
                    <div key={conv.id}>
                      {isMinimized ? (
                        <div className="relative">
                          <div
                            onClick={() => onSelectConversation(conv.id)}
                            className={cn(
                              "w-full p-2.5 rounded-lg mb-1 cursor-pointer flex items-center justify-center",
                              "transition-all duration-200",
                              activeConversationId === conv.id
                                ? "bg-primary/15 text-primary"
                                : "hover:bg-secondary text-foreground"
                            )}
                          >
                            <MessageSquare
                              className={cn(
                                "w-4 h-4",
                                activeConversationId === conv.id ? "text-primary" : "opacity-60"
                              )}
                            />
                          </div>

                          {/* Delete button for active chat (minimized) */}
                          {activeConversationId === conv.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "absolute -right-1 -top-1 h-6 w-6 rounded-full",
                                    "bg-card border border-border shadow-sm",
                                    "text-foreground/70 hover:text-destructive hover:bg-destructive/10"
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  title="Delete conversation"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this conversation? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => onDeleteConversation(conv.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="sr-only">{conv.title}</span>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[240px]">
                              <p className="font-medium">{conv.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">Tip: select a chat to show delete</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div
                          onClick={() => onSelectConversation(conv.id)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg mb-1 cursor-pointer",
                            "transition-all duration-200",
                            activeConversationId === conv.id
                              ? "bg-primary/15 text-primary"
                              : "hover:bg-secondary text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <MessageSquare
                              className={cn(
                                "w-4 h-4 shrink-0",
                                activeConversationId === conv.id ? "text-primary" : "opacity-60"
                              )}
                            />
                            <span className="flex-1 text-sm font-medium truncate" title={conv.title}>
                              {conv.title}
                            </span>

                            {/* Delete button */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8 shrink-0 rounded-xl",
                                    "bg-secondary/70 border border-border/60",
                                    "text-foreground/80 hover:text-destructive hover:bg-destructive/10"
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="Delete conversation"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this conversation? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => onDeleteConversation(conv.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          {/* Extra delete button for active chat */}
                          {activeConversationId === conv.id && (
                            <div className="mt-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 bg-destructive/10 text-destructive hover:bg-destructive/15"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete this chat
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this conversation? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => onDeleteConversation(conv.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Clear all history */}
        {conversations.length > 0 && (
          <div className={cn("p-2 border-t border-border", isMinimized && "px-1.5")}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {isMinimized ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Clear All History</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All History
                  </Button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All History</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all {conversations.length} conversations? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onClearAllHistory}
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
};

export default ChatSidebar;
