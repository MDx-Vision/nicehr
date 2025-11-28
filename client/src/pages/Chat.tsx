import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Plus,
  Send,
  Search,
  Users,
  Hash,
  Lock,
  Bell,
  BellOff,
  Clock,
  FileText,
  AlertCircle,
  Circle,
  Check,
  Pencil,
  ChevronRight,
  Moon,
  Loader2
} from "lucide-react";
import type {
  Project,
  ChatChannelWithDetails,
  ChatMessageWithSender,
  ChannelMember,
  ShiftChatSummary
} from "@shared/schema";

const CHANNEL_TYPES = [
  { value: "project", label: "Project", icon: Hash },
  { value: "unit", label: "Unit", icon: Hash },
  { value: "module", label: "Module", icon: Hash },
  { value: "direct", label: "Direct Message", icon: MessageSquare },
  { value: "announcement", label: "Announcement", icon: Bell }
];

interface WebSocketMessage {
  type: string;
  channelId?: string;
  userId?: string;
  message?: ChatMessageWithSender;
  [key: string]: unknown;
}

function useWebSocket(userId: string | undefined) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (!userId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      ws.send(JSON.stringify({ type: "auth", userId }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    setSocket(ws);
    return ws;
  }, [userId]);

  useEffect(() => {
    const ws = connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }, [socket]);

  const joinChannel = useCallback((channelId: string) => {
    sendMessage({ type: "join", channelId });
  }, [sendMessage]);

  const leaveChannel = useCallback((channelId: string) => {
    sendMessage({ type: "leave", channelId });
  }, [sendMessage]);

  const sendChatMessage = useCallback((channelId: string, content: string) => {
    sendMessage({ type: "message", channelId, content });
  }, [sendMessage]);

  const sendTyping = useCallback((channelId: string) => {
    sendMessage({ type: "typing", channelId });
  }, [sendMessage]);

  const handleMessage = useCallback((event: MessageEvent, handlers: {
    onNewMessage?: (msg: ChatMessageWithSender) => void;
    onUserTyping?: (channelId: string, usrId: string) => void;
    onUserJoined?: (channelId: string, usrId: string) => void;
    onUserLeft?: (channelId: string, usrId: string) => void;
    onWarning?: (message: string) => void;
  }) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;

      switch (data.type) {
        case "new_message":
          if (data.message) {
            handlers.onNewMessage?.(data.message);
          }
          break;
        case "user_typing":
          if (data.channelId && data.userId) {
            handlers.onUserTyping?.(data.channelId, data.userId);
            setTypingUsers(prev => {
              const updated = new Map(prev);
              const channelTyping = updated.get(data.channelId!) || new Set();
              channelTyping.add(data.userId!);
              updated.set(data.channelId!, channelTyping);
              setTimeout(() => {
                setTypingUsers(p => {
                  const u = new Map(p);
                  const ct = u.get(data.channelId!);
                  if (ct) {
                    ct.delete(data.userId!);
                    if (ct.size === 0) u.delete(data.channelId!);
                    else u.set(data.channelId!, ct);
                  }
                  return u;
                });
              }, 3000);
              return updated;
            });
          }
          break;
        case "user_joined":
          if (data.userId) {
            setOnlineUsers(prev => new Set(prev).add(data.userId!));
            handlers.onUserJoined?.(data.channelId || "", data.userId);
          }
          break;
        case "user_left":
          if (data.userId) {
            setOnlineUsers(prev => {
              const updated = new Set(prev);
              updated.delete(data.userId!);
              return updated;
            });
            handlers.onUserLeft?.(data.channelId || "", data.userId);
          }
          break;
        case "warning":
          if (typeof data.message === "string") {
            toast({ title: "Notice", description: data.message });
            handlers.onWarning?.(data.message);
          }
          break;
      }
    } catch (err) {
      console.error("WebSocket message parse error:", err);
    }
  }, [toast]);

  return {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    joinChannel,
    leaveChannel,
    sendChatMessage,
    sendTyping,
    handleMessage
  };
}

function ChannelListItem({
  channel,
  isSelected,
  onClick
}: {
  channel: ChatChannelWithDetails;
  isSelected: boolean;
  onClick: () => void;
}) {
  const TypeIcon = channel.isPrivate ? Lock : Hash;

  return (
    <div
      className={`p-3 cursor-pointer hover-elevate rounded-md ${isSelected ? "bg-accent" : ""}`}
      onClick={onClick}
      data-testid={`channel-item-${channel.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium truncate">{channel.name}</span>
            {channel.unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {channel.unreadCount}
              </Badge>
            )}
          </div>
          {channel.lastMessage && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {channel.lastMessage.sender?.firstName}: {channel.lastMessage.content}
            </p>
          )}
          {channel.project && (
            <p className="text-xs text-muted-foreground mt-1">
              {channel.project.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageItem({
  message,
  isOwnMessage
}: {
  message: ChatMessageWithSender;
  isOwnMessage: boolean;
}) {
  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
      data-testid={`message-item-${message.id}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.sender?.profileImageUrl || undefined} />
        <AvatarFallback>
          {(message.sender?.firstName?.[0] || "") + (message.sender?.lastName?.[0] || "")}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : ""}`}>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium" data-testid={`text-sender-${message.id}`}>
            {message.sender?.firstName} {message.sender?.lastName}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : ""}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Pencil className="h-3 w-3" /> edited
            </span>
          )}
        </div>
        <div
          className={`mt-1 p-3 rounded-md ${
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
          data-testid={`text-content-${message.id}`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function CreateChannelDialog({
  open,
  onOpenChange,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channelType, setChannelType] = useState("project");
  const [projectId, setProjectId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState("19:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const { toast } = useToast();

  const createChannelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/chat/channels", {
        name,
        description,
        channelType,
        projectId: projectId || null,
        isPrivate,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/channels"] });
      toast({ title: "Channel created successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create channel", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setChannelType("project");
    setProjectId("");
    setIsPrivate(false);
    setQuietHoursEnabled(true);
    setQuietHoursStart("19:00");
    setQuietHoursEnd("07:00");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>
            Create a channel for team communication
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter channel name"
              data-testid="input-channel-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel-description">Description</Label>
            <Textarea
              id="channel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              data-testid="input-channel-description"
            />
          </div>
          <div className="space-y-2">
            <Label>Channel Type</Label>
            <Select value={channelType} onValueChange={setChannelType}>
              <SelectTrigger data-testid="select-channel-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(channelType === "project" || channelType === "unit" || channelType === "module") && (
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Private Channel</Label>
              <p className="text-xs text-muted-foreground">
                Only invited members can see this channel
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              data-testid="switch-private"
            />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Quiet Hours
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mute notifications during specified hours
                </p>
              </div>
              <Switch
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
                data-testid="switch-quiet-hours"
              />
            </div>
            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    data-testid="input-quiet-start"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    data-testid="input-quiet-end"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-create"
          >
            Cancel
          </Button>
          <Button
            onClick={() => createChannelMutation.mutate()}
            disabled={!name || createChannelMutation.isPending}
            data-testid="button-create-channel"
          >
            {createChannelMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShiftSummaryDialog({
  open,
  onOpenChange,
  channelId,
  summaries
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  summaries: ShiftChatSummary[];
}) {
  const [activeTab, setActiveTab] = useState<"view" | "create">("view");
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [issues, setIssues] = useState("");
  const [shiftType, setShiftType] = useState<"day" | "night" | "swing">("day");
  const { toast } = useToast();

  const createSummaryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/chat/channels/${channelId}/summaries`, {
        shiftDate: new Date().toISOString().split("T")[0],
        shiftType,
        summary,
        keyPoints: keyPoints.split("\n").filter(Boolean),
        issuesMentioned: issues.split("\n").filter(Boolean)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/channels", channelId, "summaries"] });
      toast({ title: "Shift summary created successfully" });
      onOpenChange(false);
      setSummary("");
      setKeyPoints("");
      setIssues("");
    },
    onError: () => {
      toast({ title: "Failed to create summary", variant: "destructive" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Shift Summaries</DialogTitle>
          <DialogDescription>
            View past summaries or create a new handoff summary
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "view" | "create")}>
          <TabsList className="w-full">
            <TabsTrigger value="view" className="flex-1" data-testid="tab-view-summaries">
              View Summaries
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1" data-testid="tab-create-summary">
              Create Summary
            </TabsTrigger>
          </TabsList>
          <TabsContent value="view" className="mt-4">
            <ScrollArea className="h-[300px]">
              {summaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No shift summaries yet
                </div>
              ) : (
                <div className="space-y-4">
                  {summaries.map((s) => (
                    <Card key={s.id} data-testid={`summary-item-${s.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm">
                            {s.shiftDate ? format(new Date(s.shiftDate), "MMM d, yyyy") : "Unknown"} - {s.shiftType} shift
                          </CardTitle>
                          <Badge variant="outline">{s.shiftType}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{s.summary}</p>
                        {Array.isArray(s.keyPoints) && s.keyPoints.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Key Points:</p>
                            <ul className="text-sm list-disc list-inside">
                              {(s.keyPoints as string[]).map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(s.issuesMentioned) && s.issuesMentioned.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Issues:</p>
                            <ul className="text-sm list-disc list-inside text-orange-600 dark:text-orange-400">
                              {(s.issuesMentioned as string[]).map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="create" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <Select value={shiftType} onValueChange={(v) => setShiftType(v as "day" | "night" | "swing")}>
                <SelectTrigger data-testid="select-shift-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day Shift</SelectItem>
                  <SelectItem value="night">Night Shift</SelectItem>
                  <SelectItem value="swing">Swing Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary-content">Summary</Label>
              <Textarea
                id="summary-content"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Provide a summary of the shift..."
                className="min-h-[100px]"
                data-testid="input-summary-content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-points">Key Points (one per line)</Label>
              <Textarea
                id="key-points"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Enter key points..."
                data-testid="input-key-points"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issues">Issues Mentioned (one per line)</Label>
              <Textarea
                id="issues"
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                placeholder="Enter any issues..."
                data-testid="input-issues"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => createSummaryMutation.mutate()}
              disabled={!summary || createSummaryMutation.isPending}
              data-testid="button-submit-summary"
            >
              {createSummaryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Shift Summary
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessageWithSender[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinChannel,
    leaveChannel,
    sendChatMessage,
    sendTyping,
    handleMessage
  } = useWebSocket(user?.id);

  const { data: channels = [], isLoading: channelsLoading } = useQuery<ChatChannelWithDetails[]>({
    queryKey: ["/api/chat/channels"]
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessageWithSender[]>({
    queryKey: ["/api/chat/channels", selectedChannelId, "messages"],
    enabled: !!selectedChannelId
  });

  const { data: members = [] } = useQuery<ChannelMember[]>({
    queryKey: ["/api/chat/channels", selectedChannelId, "members"],
    enabled: !!selectedChannelId
  });

  const { data: summaries = [] } = useQuery<ShiftChatSummary[]>({
    queryKey: ["/api/chat/channels", selectedChannelId, "summaries"],
    enabled: !!selectedChannelId
  });

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (socket) {
      const messageHandler = (event: MessageEvent) => {
        handleMessage(event, {
          onNewMessage: (msg) => {
            if (msg.channelId === selectedChannelId) {
              setLocalMessages((prev) => [...prev, msg]);
            }
            queryClient.invalidateQueries({ queryKey: ["/api/chat/channels"] });
          }
        });
      };

      socket.addEventListener("message", messageHandler);
      return () => {
        socket.removeEventListener("message", messageHandler);
      };
    }
  }, [socket, handleMessage, selectedChannelId]);

  useEffect(() => {
    if (selectedChannelId) {
      joinChannel(selectedChannelId);
      return () => {
        leaveChannel(selectedChannelId);
      };
    }
  }, [selectedChannelId, joinChannel, leaveChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChannelId) return;
    sendChatMessage(selectedChannelId, messageText);
    setMessageText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (selectedChannelId) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTyping(selectedChannelId);
      typingTimeoutRef.current = setTimeout(() => {}, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || channel.channelType === typeFilter;
    const matchesProject = projectFilter === "all" || channel.projectId === projectFilter;
    return matchesSearch && matchesType && matchesProject;
  });

  const channelTypingUsers = selectedChannelId ? typingUsers.get(selectedChannelId) : undefined;
  const typingUserNames = channelTypingUsers
    ? Array.from(channelTypingUsers).filter((id) => id !== user?.id)
    : [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Team Chat</h1>
          <p className="text-muted-foreground">Real-time team communication</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} data-testid="badge-connection-status">
            <Circle className={`h-2 w-2 mr-1 ${isConnected ? "fill-green-500" : "fill-red-500"}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-channel">
            <Plus className="h-4 w-4 mr-2" />
            New Channel
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-2">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-channels"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="flex-1" data-testid="select-type-filter">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CHANNEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="flex-1" data-testid="select-project-filter">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-2 overflow-hidden">
            <ScrollArea className="h-full">
              {channelsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No channels found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChannels.map((channel) => (
                    <ChannelListItem
                      key={channel.id}
                      channel={channel}
                      isSelected={channel.id === selectedChannelId}
                      onClick={() => setSelectedChannelId(channel.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          {!selectedChannel ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a channel</p>
                <p className="text-sm">Choose a channel from the list to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {selectedChannel.isPrivate ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Hash className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-lg" data-testid="text-channel-name">
                        {selectedChannel.name}
                      </CardTitle>
                      {selectedChannel.description && (
                        <p className="text-sm text-muted-foreground" data-testid="text-channel-description">
                          {selectedChannel.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1" data-testid="badge-member-count">
                      <Users className="h-3 w-3" />
                      {members.length} members
                    </Badge>
                    <Badge variant="outline" className="gap-1" data-testid="badge-online-count">
                      <Circle className="h-2 w-2 fill-green-500" />
                      {onlineUsers.size} online
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSummaryDialogOpen(true)}
                      data-testid="button-shift-summary"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Shift Summary
                    </Button>
                  </div>
                </div>
                {selectedChannel.quietHoursEnabled && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <BellOff className="h-3 w-3" />
                    Quiet hours: {selectedChannel.quietHoursStart} - {selectedChannel.quietHoursEnd}
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-16 w-64" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : localMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Be the first to say something!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {localMessages.map((msg) => (
                        <MessageItem
                          key={msg.id}
                          message={msg}
                          isOwnMessage={msg.senderId === user?.id}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {typingUserNames.length > 0 && (
                  <div className="text-sm text-muted-foreground py-2 flex items-center gap-2" data-testid="indicator-typing">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {typingUserNames.length === 1
                      ? "Someone is typing..."
                      : `${typingUserNames.length} people are typing...`}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Input
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <CreateChannelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projects={projects}
      />

      {selectedChannelId && (
        <ShiftSummaryDialog
          open={summaryDialogOpen}
          onOpenChange={setSummaryDialogOpen}
          channelId={selectedChannelId}
          summaries={summaries}
        />
      )}
    </div>
  );
}
