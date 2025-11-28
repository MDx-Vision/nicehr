import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useProjectContext } from "@/hooks/use-project-context";
import { ProjectSelector } from "@/components/ProjectSelector";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpCircle,
  MessageSquare,
  History,
  Send,
  User,
  Calendar,
  Building2,
  ChevronRight
} from "lucide-react";
import type { 
  Project, 
  Consultant,
  SupportTicketWithDetails,
  SupportTicketWithHistory,
  TicketCommentWithDetails,
  TicketHistoryWithDetails
} from "@shared/schema";

const TICKET_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

const TICKET_STATUSES = [
  { value: "open", label: "Open", color: "bg-blue-500 text-white" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500 text-white" },
  { value: "escalated", label: "Escalated", color: "bg-red-500 text-white" },
  { value: "resolved", label: "Resolved", color: "bg-green-500 text-white" },
  { value: "closed", label: "Closed", color: "bg-gray-500 text-white" },
];

function getPriorityBadge(priority: string) {
  const config = TICKET_PRIORITIES.find(p => p.value === priority);
  return <Badge className={config?.color || ""}>{config?.label || priority}</Badge>;
}

function getStatusBadge(status: string) {
  const config = TICKET_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function TicketStats({ tickets }: { tickets: SupportTicketWithDetails[] }) {
  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const escalatedCount = tickets.filter(t => t.status === "escalated").length;
  const resolvedToday = tickets.filter(t => {
    if (!t.resolvedAt) return false;
    const resolved = new Date(t.resolvedAt);
    const today = new Date();
    return resolved.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-open-tickets">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openCount}</div>
          <p className="text-xs text-muted-foreground">Awaiting assignment</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-in-progress">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressCount}</div>
          <p className="text-xs text-muted-foreground">Being worked on</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-escalated">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Escalated</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{escalatedCount}</div>
          <p className="text-xs text-muted-foreground">Needs urgent attention</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-resolved-today">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resolvedToday}</div>
          <p className="text-xs text-muted-foreground">Completed today</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TicketRow({ 
  ticket,
  projectName,
  onClick 
}: { 
  ticket: SupportTicketWithDetails;
  projectName: string;
  onClick: () => void;
}) {
  return (
    <TableRow 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`ticket-row-${ticket.id}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <span>{ticket.ticketNumber || ticket.id.slice(0, 8)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[300px] truncate">{ticket.title}</div>
      </TableCell>
      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
      <TableCell>
        <div className="text-sm">{projectName}</div>
      </TableCell>
      <TableCell>
        {ticket.assignedTo?.user ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {(ticket.assignedTo.user.firstName?.[0] || "") + (ticket.assignedTo.user.lastName?.[0] || "")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {ticket.assignedTo.user.firstName} {ticket.assignedTo.user.lastName}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
}

function TicketDetailPanel({
  ticketId,
  onClose
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: ticket, isLoading } = useQuery<SupportTicketWithHistory>({
    queryKey: ['/api/support-tickets', ticketId, 'full'],
    enabled: !!ticketId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/support-tickets/${ticketId}/comments`, { content, isInternal: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', ticketId, 'full'] });
      setNewComment("");
      toast({ title: "Comment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/support-tickets/${ticketId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', ticketId, 'full'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Ticket className="h-4 w-4" />
              <span>{ticket.ticketNumber || ticket.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-xl font-semibold">{ticket.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Project</div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{ticket.project?.name || "N/A"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Reported By</div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {ticket.reportedBy 
                  ? `${ticket.reportedBy.firstName || ""} ${ticket.reportedBy.lastName || ""}`.trim() || "Unknown"
                  : "Unknown"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Assigned To</div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                {ticket.assignedTo?.user 
                  ? `${ticket.assignedTo.user.firstName || ""} ${ticket.assignedTo.user.lastName || ""}`.trim() || "Unassigned"
                  : "Unassigned"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a") : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">
              Comments ({ticket.comments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              History ({ticket.history?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-auto px-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{ticket.description || "No description provided."}</p>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TICKET_STATUSES.map(status => (
                    <Button
                      key={status.value}
                      variant={ticket.status === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatusMutation.mutate(status.value)}
                      disabled={updateStatusMutation.isPending}
                      data-testid={`status-btn-${status.value}`}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 overflow-hidden px-6 py-4 flex flex-col">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment: TicketCommentWithDetails) => (
                    <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {(comment.author?.firstName?.[0] || "") + (comment.author?.lastName?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ""}
                          </span>
                          {comment.isInternal && (
                            <Badge variant="secondary" className="text-xs">Internal</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="input-comment"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  onClick={() => addCommentMutation.mutate(newComment)}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  data-testid="button-add-comment"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto px-6 py-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {ticket.history && ticket.history.length > 0 ? (
                  ticket.history.map((entry: TicketHistoryWithDetails) => (
                    <div key={entry.id} className="flex gap-3" data-testid={`history-${entry.id}`}>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {entry.performedBy?.firstName} {entry.performedBy?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.createdAt ? formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true }) : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="capitalize">{entry.action?.replace(/_/g, " ")}</span>
                          {entry.previousValue && entry.newValue ? (
                            <span>: {`${entry.previousValue}`} → {`${entry.newValue}`}</span>
                          ) : null}
                        </p>
                        {entry.comment && (
                          <p className="text-sm mt-1 italic">&quot;{entry.comment}&quot;</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No history yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t flex justify-end">
        <Button variant="outline" onClick={onClose} data-testid="button-close-detail">
          Close
        </Button>
      </div>
    </div>
  );
}

function CreateTicketDialog({
  open,
  onOpenChange,
  projects,
  consultants
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  consultants: Consultant[];
}) {
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    priority: "medium",
    category: "general",
    assignedToId: "",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/support-tickets", {
        ...data,
        assignedToId: data.assignedToId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      onOpenChange(false);
      setFormData({
        projectId: "",
        title: "",
        description: "",
        priority: "medium",
        category: "general",
        assignedToId: "",
      });
      toast({ title: "Ticket created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create ticket", variant: "destructive" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Submit a new support ticket for tracking and resolution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            >
              <SelectTrigger data-testid="select-project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue..."
              className="min-h-[100px]"
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="access">Access/Permissions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assign To (Optional)</Label>
            <Select
              value={formData.assignedToId || "unassigned"}
              onValueChange={(value) => setFormData({ ...formData, assignedToId: value === "unassigned" ? "" : value })}
            >
              <SelectTrigger data-testid="select-assignee">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {consultants.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    Consultant {c.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.projectId || !formData.title || createMutation.isPending}
            data-testid="button-create-ticket"
          >
            Create Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SupportTickets() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { filterByProject, isAdmin } = useProjectContext();

  const { data: ticketsRaw = [], isLoading: ticketsLoading } = useQuery<SupportTicketWithDetails[]>({
    queryKey: ['/api/support-tickets'],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const tickets = filterByProject(ticketsRaw);

  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        ticket.title.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.ticketNumber?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
    if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
    
    return true;
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track support tickets across all projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <ProjectSelector className="mr-2" showAllOption />}
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-new-ticket">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {!ticketsLoading && <TicketStats tickets={tickets} />}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {TICKET_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]" data-testid="filter-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {TICKET_PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tickets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first support ticket to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Ticket #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    projectName={projects.find(p => p.id === ticket.projectId)?.name || "N/A"}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          {selectedTicketId && (
            <TicketDetailPanel
              ticketId={selectedTicketId}
              onClose={() => setSelectedTicketId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projects={projects}
        consultants={consultants}
      />
    </div>
  );
}
