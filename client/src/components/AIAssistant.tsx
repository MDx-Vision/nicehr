import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { system: string; note?: string }[];
  toolsUsed?: string[];
  timestamp: Date;
}

interface AIQueryResponse {
  response: string;
  sources: { system: string; note?: string }[];
  toolsUsed: string[];
}

async function queryAI(query: string, conversationHistory: { role: string; content: string }[]): Promise<AIQueryResponse> {
  const response = await fetch("/api/ai/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversationHistory }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to query AI");
  }

  return response.json();
}

export function AIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only show for admin and hospital_leadership roles
  const allowedRoles = ["admin", "hospital_leadership"];
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  const queryMutation = useMutation({
    mutationFn: ({ query, history }: { query: string; history: { role: string; content: string }[] }) =>
      queryAI(query, history),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources,
          toolsUsed: data.toolsUsed,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || queryMutation.isPending) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const conversationHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    queryMutation.mutate({
      query: input.trim(),
      history: conversationHistory,
    });

    setInput("");
  };

  const exampleQueries = [
    "How many open P1 tickets?",
    "What's the sprint status?",
    "Show me overdue tasks",
    "Which consultants are available?",
  ];

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
          "transition-all duration-300",
          isOpen && "scale-0 opacity-0"
        )}
        data-testid="ai-assistant-button"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[420px] h-[600px] bg-background border rounded-2xl shadow-2xl z-50",
          "flex flex-col overflow-hidden",
          "transition-all duration-300 ease-out",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
        data-testid="ai-assistant-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">TNG AI Assistant</h3>
              <p className="text-xs text-white/80">Ask anything about your systems</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-3">
                  <Bot className="h-6 w-6 text-violet-600" />
                </div>
                <h4 className="font-medium mb-1">Welcome to TNG AI</h4>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your integrated systems in plain English.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
                {exampleQueries.map((query, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(query)}
                    className="w-full text-left text-sm p-2 rounded-lg border hover:bg-muted transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-violet-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2",
                      message.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {source.system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {queryMutation.isPending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Querying systems...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tickets, projects, consultants..."
              className="flex-1"
              disabled={queryMutation.isPending}
              data-testid="ai-assistant-input"
            />
            <Button
              type="submit"
              disabled={!input.trim() || queryMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              data-testid="ai-assistant-send"
            >
              {queryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are based on real-time data from your integrated systems.
          </p>
        </form>
      </div>
    </>
  );
}

export default AIAssistant;
