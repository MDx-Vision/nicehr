import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Ticket, Plus, Search, Filter, Download, MessageSquare, Clock,
  AlertTriangle, CheckCircle, XCircle, User, Tag, ArrowUp,
  Edit, Trash2, Paperclip, AtSign, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SupportTicket } from "@shared/schema";

interface Comment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
  isEditing?: boolean;
}

interface Activity {
  id: string;
  ticketId: string;
  action: string;
  user: string;
  timestamp: string;
}

export default function SupportTickets() {
  const { toast } = useToast();

  // View state
  const [activeTab, setActiveTab] = useState("list");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailView, setDetailView] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection state
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkCloseModalOpen, setBulkCloseModalOpen] = useState(false);
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);

  // Form state
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    projectId: "",
  });

  const [commentText, setCommentText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [newTag, setNewTag] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");
  const [bulkStatus, setBulkStatus] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  // Validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Local comments/activities (would be from API in full implementation)
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch tickets from API
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/support-tickets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setCreateModalOpen(false);
      setTicketForm({ title: "", description: "", category: "", priority: "medium", projectId: "" });
      toast({ title: "Ticket Created", description: "Your support ticket has been submitted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
    },
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/support-tickets/${id}`, data);
    },
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, ...updatedTicket });
      }
      toast({ title: "Ticket Updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update ticket", variant: "destructive" });
    },
  });

  // Delete/close ticket mutation
  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/support-tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setCloseModalOpen(false);
      setDetailView(false);
      toast({ title: "Ticket Closed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to close ticket", variant: "destructive" });
    },
  });

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (searchQuery && !t.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Get ticket comments
  const ticketComments = selectedTicket
    ? comments.filter(c => c.ticketId === selectedTicket.id)
    : [];

  // Get ticket activities
  const ticketActivities = selectedTicket
    ? activities.filter(a => a.ticketId === selectedTicket.id)
    : [];

  // Handlers
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!ticketForm.title) errors.title = "Title is required";
    if (!ticketForm.description) errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTicket = () => {
    if (!validateForm()) return;

    createTicketMutation.mutate({
      title: ticketForm.title,
      description: ticketForm.description,
      category: ticketForm.category || "General",
      priority: ticketForm.priority || "medium",
      projectId: ticketForm.projectId || null,
      status: "open",
    });
  };

  const handleStatusChange = (status: string) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        id: selectedTicket.id,
        data: { status }
      });
    }
  };

  const handlePriorityChange = (priority: string) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        id: selectedTicket.id,
        data: { priority }
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        id: selectedTicket.id,
        data: { category }
      });
    }
  };

  const handleCloseTicket = () => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        id: selectedTicket.id,
        data: { status: "closed", resolution: resolutionText }
      });
      setCloseModalOpen(false);
      setResolutionText("");
    }
  };

  const handleReopenTicket = () => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        id: selectedTicket.id,
        data: { status: "open", resolution: null }
      });
    }
  };

  const handleEscalate = () => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        id: selectedTicket.id,
        data: { priority: "critical" }
      });
      setEscalateModalOpen(false);
      setEscalationReason("");
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedTicket) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      ticketId: selectedTicket.id,
      author: "Current User",
      content: commentText,
      createdAt: new Date().toISOString(),
      isInternal: isInternalNote
    };

    setComments([...comments, newComment]);
    setCommentText("");
    setIsInternalNote(false);
    toast({ title: "Comment Added" });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setAddTagModalOpen(false);
    setNewTag("");
    toast({ title: "Tag Added" });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTicket = (ticketId: string) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(selectedTickets.filter(id => id !== ticketId));
    } else {
      setSelectedTickets([...selectedTickets, ticketId]);
    }
  };

  const handleBulkStatus = () => {
    // Would update multiple tickets via API
    setBulkStatusModalOpen(false);
    setSelectedTickets([]);
    setSelectAll(false);
    toast({ title: "Status Updated", description: `${selectedTickets.length} tickets updated` });
  };

  const handleBulkClose = () => {
    // Would close multiple tickets via API
    setBulkCloseModalOpen(false);
    setSelectedTickets([]);
    setSelectAll(false);
    toast({ title: "Tickets Closed", description: `${selectedTickets.length} tickets closed` });
  };

  const handleExport = () => {
    setExportModalOpen(false);
    toast({ title: "Export Started", description: `Exporting tickets as ${exportFormat.toUpperCase()}` });
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setDetailView(true);
  };

  const getPriorityBadge = (priority: string | null) => {
    const colors: {[key: string]: string} = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[priority || "medium"]}>{(priority || "medium").charAt(0).toUpperCase() + (priority || "medium").slice(1)}</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    const colors: {[key: string]: string} = {
      open: "bg-green-100 text-green-800",
      "in_progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      resolved: "bg-purple-100 text-purple-800",
      closed: "bg-gray-100 text-gray-800"
    };
    const displayStatus = (status || "open").replace("_", " ");
    return <Badge className={colors[status || "open"]} data-testid="ticket-status">{displayStatus.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</Badge>;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Detail view
  if (detailView && selectedTicket) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setDetailView(false)}>← Back to Tickets</Button>
          <div className="flex gap-2">
            {selectedTicket.status !== "closed" ? (
              <Button variant="destructive" onClick={() => setCloseModalOpen(true)} data-testid="button-close-ticket">
                Close Ticket
              </Button>
            ) : (
              <Button onClick={handleReopenTicket} data-testid="button-reopen-ticket">
                Reopen Ticket
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="ticket-details">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {selectedTicket.ticketNumber && (
                    <Badge variant="outline">{selectedTicket.ticketNumber}</Badge>
                  )}
                  <CardTitle data-testid="ticket-subject">{selectedTicket.title}</CardTitle>
                </div>
                <CardDescription>
                  Created on{" "}
                  <span data-testid="ticket-created-at">
                    {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), "MMM d, yyyy 'at' h:mm a") : "N/A"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p data-testid="ticket-description">{selectedTicket.description}</p>

                {/* Resolution */}
                {selectedTicket.resolution && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Resolution</h4>
                    <p className="text-green-700">{selectedTicket.resolution}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div data-testid="comments-list" className="space-y-4">
                  {ticketComments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No comments yet</p>
                  ) : (
                    ticketComments.map(comment => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg ${comment.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-muted"}`}
                        data-testid="comment-item"
                      >
                        {comment.isInternal && (
                          <Badge variant="outline" className="mb-2" data-testid="internal-note">Internal Note</Badge>
                        )}
                        <div>
                          <p className="font-medium">{comment.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <p className="mt-2">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isInternalNote}
                      onCheckedChange={(checked) => setIsInternalNote(checked as boolean)}
                      data-testid="checkbox-internal-note"
                    />
                    <Label>Internal note (staff only)</Label>
                  </div>
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    data-testid="input-comment"
                  />
                  <Button onClick={handleAddComment} data-testid="button-add-comment">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent data-testid="ticket-activity">
                <div className="space-y-4">
                  {ticketActivities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No activity recorded</p>
                  ) : (
                    ticketActivities.map(activity => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            by {activity.user} • {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={selectedTicket.status || "open"} onValueChange={handleStatusChange}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <div className="flex items-center gap-2">
                    <Select value={selectedTicket.priority || "medium"} onValueChange={handlePriorityChange}>
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <span data-testid="ticket-priority">{getPriorityBadge(selectedTicket.priority)}</span>
                  </div>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={selectedTicket.category || "General"} onValueChange={handleCategoryChange}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Access Request">Access Request</SelectItem>
                      <SelectItem value="Account">Account</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assigned To</Label>
                  <Select value={selectedTicket.assignedToId?.toString() || ""} onValueChange={(v) => {
                    updateTicketMutation.mutate({ id: selectedTicket.id, data: { assignedToId: parseInt(v) } });
                  }}>
                    <SelectTrigger data-testid="select-assignee">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Admin User</SelectItem>
                      <SelectItem value="2">Support Agent</SelectItem>
                      <SelectItem value="3">Technical Lead</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => updateTicketMutation.mutate({ id: selectedTicket.id, data: { assignedToId: 1 } })}
                    data-testid="button-assign-to-me"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Assign to Me
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => setEscalateModalOpen(true)} data-testid="button-escalate">
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Label>SLA Status</Label>
                  <div className="mt-2" data-testid="time-to-resolution">
                    {selectedTicket.slaBreached ? (
                      <Badge variant="destructive" data-testid="sla-breached">SLA Breached</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">Within SLA</Badge>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t" data-testid="ticket-tags">
                  <Label>Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="secondary">epic</Badge>
                    <Badge variant="secondary">login</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddTagModalOpen(true)}
                      data-testid="button-add-tag"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Close Modal */}
        <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Ticket</DialogTitle>
              <DialogDescription>Please provide a resolution for this ticket.</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Resolution details..."
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              data-testid="input-resolution"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCloseModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCloseTicket} data-testid="button-confirm-close">Close Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Escalate Modal */}
        <Dialog open={escalateModalOpen} onOpenChange={setEscalateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escalate Ticket</DialogTitle>
              <DialogDescription>Provide a reason for escalation.</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Escalation reason..."
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              data-testid="input-escalation-reason"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEscalateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEscalate} data-testid="button-confirm-escalate">Escalate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main list view
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage support requests and issues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExportModalOpen(true)} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} data-testid="button-create-ticket">
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Tickets</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-priority">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Access Request">Access Request</SelectItem>
                    <SelectItem value="Account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedTickets.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <span data-testid="selected-count">{selectedTickets.length} selected</span>
                  <Button size="sm" onClick={() => setBulkStatusModalOpen(true)} data-testid="button-bulk-status">
                    Change Status
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setBulkCloseModalOpen(true)} data-testid="button-bulk-close">
                    Close All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets Table */}
          <Card>
            <CardContent className="pt-6">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {tickets.length === 0
                      ? "Create your first support ticket to get started"
                      : "Try adjusting your filters"}
                  </p>
                  {tickets.length === 0 && (
                    <Button onClick={() => setCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ticket
                    </Button>
                  )}
                </div>
              ) : (
                <table className="w-full" data-testid="tickets-table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </th>
                      <th className="text-left p-3">Ticket</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Priority</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">SLA</th>
                      <th className="text-left p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody data-testid="tickets-list">
                    {filteredTickets.map(ticket => (
                      <tr
                        key={ticket.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedTickets.includes(ticket.id)}
                            onCheckedChange={() => handleSelectTicket(ticket.id)}
                            data-testid="checkbox-ticket"
                          />
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="flex items-center gap-2">
                              {ticket.ticketNumber && (
                                <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                              )}
                              <p className="font-medium">{ticket.title}</p>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                          </div>
                        </td>
                        <td className="p-3">{getStatusBadge(ticket.status)}</td>
                        <td className="p-3">{getPriorityBadge(ticket.priority)}</td>
                        <td className="p-3">{ticket.category || "General"}</td>
                        <td className="p-3" data-testid="ticket-sla">
                          {ticket.slaBreached ? (
                            <Badge variant="destructive" data-testid="sla-breached">Breached</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">OK</Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy") : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-end">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    data-testid="input-report-start"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    data-testid="input-report-end"
                  />
                </div>
                <Button data-testid="button-apply-filter">Apply Filter</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card data-testid="ticket-volume-chart">
              <CardHeader>
                <CardTitle>Ticket Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="resolution-time-chart">
              <CardHeader>
                <CardTitle>Resolution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <Clock className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="category-breakdown">
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Technical</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Training</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access Request</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account</span>
                    <span className="font-bold">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Ticket Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Submit a new support request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={ticketForm.title}
                onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
                data-testid="input-subject"
              />
              {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                rows={4}
                data-testid="input-description"
              />
              {formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={ticketForm.category} onValueChange={(v) => setTicketForm({...ticketForm, category: v})}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Access Request">Access Request</SelectItem>
                    <SelectItem value="Account">Account</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm({...ticketForm, priority: v})}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {projects.length > 0 && (
              <div>
                <Label>Related Project</Label>
                <Select value={ticketForm.projectId} onValueChange={(v) => setTicketForm({...ticketForm, projectId: v})}>
                  <SelectTrigger data-testid="select-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending}
              data-testid="button-submit-ticket"
            >
              {createTicketMutation.isPending ? "Creating..." : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Tickets</DialogTitle>
          </DialogHeader>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger data-testid="select-export-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExport} data-testid="button-download">Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Modal */}
      <Dialog open={bulkStatusModalOpen} onOpenChange={setBulkStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>Change status for {selectedTickets.length} tickets:</DialogDescription>
          </DialogHeader>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger data-testid="select-bulk-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStatusModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkStatus} data-testid="button-confirm-bulk">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Close Modal */}
      <Dialog open={bulkCloseModalOpen} onOpenChange={setBulkCloseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Tickets</DialogTitle>
            <DialogDescription>Close {selectedTickets.length} tickets?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkCloseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkClose} data-testid="button-confirm-bulk">Close All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Modal */}
      <Dialog open={addTagModalOpen} onOpenChange={setAddTagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogDescription>Add a tag to this ticket</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Tag name..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            data-testid="input-tag"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTagModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTag} data-testid="button-confirm-tag">Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
