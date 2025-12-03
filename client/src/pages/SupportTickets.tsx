import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "pending" | "resolved" | "closed";
  createdBy: string;
  createdAt: string;
  assignee?: string;
  tags: string[];
  isUrgent: boolean;
  slaBreached: boolean;
  resolution?: string;
  attachments: string[];
}

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
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection state
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkCloseModalOpen, setBulkCloseModalOpen] = useState(false);
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);

  // Form state
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "",
    projectId: "",
    isUrgent: false
  });

  const [commentText, setCommentText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [editCommentText, setEditCommentText] = useState("");
  const [resolutionText, setResolutionText] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [newTag, setNewTag] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  // Mention state
  const [showMentions, setShowMentions] = useState(false);

  // Validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Demo data
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "ticket-1",
      subject: "Login issue with Epic system",
      description: "Unable to log in to Epic after password reset. Getting error code 403.",
      category: "Technical",
      priority: "high",
      status: "open",
      createdBy: "John Smith",
      createdAt: "2024-01-15T10:30:00Z",
      assignee: "Support Team",
      tags: ["epic", "login"],
      isUrgent: false,
      slaBreached: false,
      attachments: ["screenshot.png"]
    },
    {
      id: "ticket-2",
      subject: "Training module not loading",
      description: "The Cerner training module shows blank screen after clicking start.",
      category: "Training",
      priority: "medium",
      status: "in-progress",
      createdBy: "Jane Doe",
      createdAt: "2024-01-14T14:00:00Z",
      assignee: "Tech Support",
      tags: ["training", "cerner"],
      isUrgent: false,
      slaBreached: false,
      attachments: []
    },
    {
      id: "ticket-3",
      subject: "Request for additional user access",
      description: "Need admin access to the reporting module for Q1 reports.",
      category: "Access Request",
      priority: "low",
      status: "pending",
      createdBy: "Bob Wilson",
      createdAt: "2024-01-13T09:00:00Z",
      tags: ["access", "reports"],
      isUrgent: false,
      slaBreached: true,
      attachments: []
    },
    {
      id: "ticket-4",
      subject: "System performance issues",
      description: "Application running very slow during peak hours.",
      category: "Technical",
      priority: "critical",
      status: "open",
      createdBy: "Alice Brown",
      createdAt: "2024-01-12T16:30:00Z",
      assignee: "Senior Engineer",
      tags: ["performance", "urgent"],
      isUrgent: true,
      slaBreached: true,
      attachments: []
    },
    {
      id: "ticket-5",
      subject: "Completed: Password reset request",
      description: "Password has been reset successfully.",
      category: "Account",
      priority: "low",
      status: "closed",
      createdBy: "Charlie Davis",
      createdAt: "2024-01-10T11:00:00Z",
      assignee: "Help Desk",
      tags: ["password"],
      isUrgent: false,
      slaBreached: false,
      resolution: "Password reset completed and user verified login.",
      attachments: []
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comment-1",
      ticketId: "ticket-1",
      author: "Support Team",
      content: "We are looking into this issue. Can you provide the exact error message?",
      createdAt: "2024-01-15T11:00:00Z",
      isInternal: false
    },
    {
      id: "comment-2",
      ticketId: "ticket-1",
      author: "Admin",
      content: "Checked logs - appears to be a session timeout issue.",
      createdAt: "2024-01-15T11:30:00Z",
      isInternal: true
    }
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    { id: "act-1", ticketId: "ticket-1", action: "Ticket created", user: "John Smith", timestamp: "2024-01-15T10:30:00Z" },
    { id: "act-2", ticketId: "ticket-1", action: "Assigned to Support Team", user: "System", timestamp: "2024-01-15T10:31:00Z" },
    { id: "act-3", ticketId: "ticket-1", action: "Comment added", user: "Support Team", timestamp: "2024-01-15T11:00:00Z" }
  ]);

  // Queries
  const { data: projectsData = [] } = useQuery({ queryKey: ["/api/projects"] });
  const { data: usersData = [] } = useQuery({ queryKey: ["/api/users"] });

  const demoProjects = [
    { id: "p-1", name: "Epic EHR Project" },
    { id: "p-2", name: "Cerner Implementation" }
  ];

  const demoUsers = [
    { id: "u-1", name: "Support Team" },
    { id: "u-2", name: "Tech Support" },
    { id: "u-3", name: "Help Desk" },
    { id: "u-4", name: "Senior Engineer" }
  ];

  const projects = projectsData.length > 0 ? projectsData : demoProjects;
  const users = usersData.length > 0 ? usersData : demoUsers;

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (assigneeFilter !== "all" && t.assignee !== assigneeFilter) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
    if (!ticketForm.subject) errors.subject = "Subject is required";
    if (!ticketForm.description) errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTicket = () => {
    if (!validateForm()) return;

    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      subject: ticketForm.subject,
      description: ticketForm.description,
      category: ticketForm.category || "General",
      priority: (ticketForm.priority || "medium") as any,
      status: "open",
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      tags: [],
      isUrgent: ticketForm.isUrgent,
      slaBreached: false,
      attachments: []
    };

    setTickets([newTicket, ...tickets]);
    setCreateModalOpen(false);
    setTicketForm({ subject: "", description: "", category: "", priority: "", projectId: "", isUrgent: false });
    toast({ title: "Ticket Created", description: "Your support ticket has been submitted." });
  };

  const handleStatusChange = (status: string) => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, status: status as any } : t
      ));
      setSelectedTicket({ ...selectedTicket, status: status as any });

      setActivities([...activities, {
        id: `act-${Date.now()}`,
        ticketId: selectedTicket.id,
        action: `Status changed to ${status}`,
        user: "Current User",
        timestamp: new Date().toISOString()
      }]);

      toast({ title: "Status Updated", description: `Ticket status changed to ${status}` });
    }
  };

  const handlePriorityChange = (priority: string) => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, priority: priority as any } : t
      ));
      setSelectedTicket({ ...selectedTicket, priority: priority as any });
      toast({ title: "Priority Updated", description: `Ticket priority changed to ${priority}` });
    }
  };

  const handleAssigneeChange = (assignee: string) => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, assignee } : t
      ));
      setSelectedTicket({ ...selectedTicket, assignee });
      toast({ title: "Assignee Updated", description: `Ticket assigned to ${assignee}` });
    }
  };

  const handleAssignToMe = () => {
    handleAssigneeChange("Current User");
  };

  const handleUnassign = () => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, assignee: undefined } : t
      ));
      setSelectedTicket({ ...selectedTicket, assignee: undefined });
      toast({ title: "Unassigned", description: "Ticket has been unassigned" });
    }
  };

  const handleCloseTicket = () => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, status: "closed", resolution: resolutionText } : t
      ));
      setSelectedTicket({ ...selectedTicket, status: "closed", resolution: resolutionText });
      setCloseModalOpen(false);
      setResolutionText("");
      toast({ title: "Ticket Closed", description: "The ticket has been closed." });
    }
  };

  const handleReopenTicket = () => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, status: "open", resolution: undefined } : t
      ));
      setSelectedTicket({ ...selectedTicket, status: "open", resolution: undefined });
      toast({ title: "Ticket Reopened", description: "The ticket has been reopened." });
    }
  };

  const handleEscalate = () => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, priority: "critical", isUrgent: true } : t
      ));
      setSelectedTicket({ ...selectedTicket, priority: "critical", isUrgent: true });
      setEscalateModalOpen(false);
      setEscalationReason("");
      toast({ title: "Ticket Escalated", description: "The ticket has been escalated." });
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedTicket) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      ticketId: selectedTicket.id,
      author: "Current User",
      content: commentText,
      createdAt: new Date().toISOString(),
      isInternal: isInternalNote
    };

    setComments([...comments, newComment]);
    setCommentText("");
    setIsInternalNote(false);
    toast({ title: "Comment Added", description: isInternalNote ? "Internal note added" : "Comment added to ticket" });
  };

  const handleEditComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, isEditing: true } : c
    ));
    const comment = comments.find(c => c.id === commentId);
    if (comment) setEditCommentText(comment.content);
  };

  const handleSaveComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, content: editCommentText, isEditing: false } : c
    ));
    setEditCommentText("");
    toast({ title: "Comment Updated" });
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
    setDeleteCommentModalOpen(false);
    toast({ title: "Comment Deleted" });
  };

  const handleCommentInput = (value: string) => {
    setCommentText(value);
    if (value.endsWith("@")) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (userName: string) => {
    setCommentText(commentText + userName + " ");
    setShowMentions(false);
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !selectedTicket) return;

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id ? { ...t, tags: [...t.tags, newTag] } : t
    ));
    setSelectedTicket({ ...selectedTicket, tags: [...selectedTicket.tags, newTag] });
    setAddTagModalOpen(false);
    setNewTag("");
    toast({ title: "Tag Added" });
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedTicket) return;

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id ? { ...t, tags: t.tags.filter(tg => tg !== tag) } : t
    ));
    setSelectedTicket({ ...selectedTicket, tags: selectedTicket.tags.filter(t => t !== tag) });
    toast({ title: "Tag Removed" });
  };

  const handleCategoryChange = (category: string) => {
    if (selectedTicket) {
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, category } : t
      ));
      setSelectedTicket({ ...selectedTicket, category });
      toast({ title: "Category Updated" });
    }
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

  const handleBulkAssign = () => {
    setTickets(tickets.map(t => 
      selectedTickets.includes(t.id) ? { ...t, assignee: bulkAssignee } : t
    ));
    setBulkAssignModalOpen(false);
    setSelectedTickets([]);
    setSelectAll(false);
    toast({ title: "Tickets Assigned", description: `${selectedTickets.length} tickets assigned` });
  };

  const handleBulkStatus = () => {
    setTickets(tickets.map(t => 
      selectedTickets.includes(t.id) ? { ...t, status: bulkStatus as any } : t
    ));
    setBulkStatusModalOpen(false);
    setSelectedTickets([]);
    setSelectAll(false);
    toast({ title: "Status Updated", description: `${selectedTickets.length} tickets updated` });
  };

  const handleBulkClose = () => {
    setTickets(tickets.map(t => 
      selectedTickets.includes(t.id) ? { ...t, status: "closed" } : t
    ));
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

  const getPriorityBadge = (priority: string) => {
    const colors: {[key: string]: string} = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: {[key: string]: string} = {
      open: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      resolved: "bg-purple-100 text-purple-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return <Badge className={colors[status]} data-testid="ticket-status">{status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</Badge>;
  };

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
                <CardTitle data-testid="ticket-subject">{selectedTicket.subject}</CardTitle>
                <CardDescription>
                  Created by <span data-testid="ticket-created-by">{selectedTicket.createdBy}</span> on{" "}
                  <span data-testid="ticket-created-at">{format(new Date(selectedTicket.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p data-testid="ticket-description">{selectedTicket.description}</p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2" data-testid="ticket-tags">
                  {selectedTicket.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1" data-testid="ticket-tag">
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)} 
                        className="ml-1 hover:text-red-500"
                        data-testid="button-remove-tag"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => setAddTagModalOpen(true)} data-testid="button-add-tag">
                    <Tag className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                </div>

                {/* Attachments */}
                <div className="mt-4" data-testid="ticket-attachments">
                  <h4 className="font-medium mb-2">Attachments</h4>
                  {selectedTicket.attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.attachments.map((att, idx) => (
                        <Badge key={idx} variant="outline">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {att}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No attachments</p>
                  )}
                </div>

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
                  {ticketComments.map(comment => (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-lg ${comment.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-muted"}`}
                      data-testid="comment-item"
                    >
                      {comment.isInternal && (
                        <Badge variant="outline" className="mb-2" data-testid="internal-note">Internal Note</Badge>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{comment.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditComment(comment.id)}
                            data-testid="button-edit-comment"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setDeleteCommentModalOpen(true)}
                            data-testid="button-delete-comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {comment.isEditing ? (
                        <div className="mt-2 space-y-2">
                          <Textarea 
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            data-testid="input-edit-comment"
                          />
                          <Button size="sm" onClick={() => handleSaveComment(comment.id)} data-testid="button-save-comment">
                            Save
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2">{comment.content}</p>
                      )}
                    </div>
                  ))}
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
                  <div className="relative">
                    <Textarea 
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => handleCommentInput(e.target.value)}
                      data-testid="input-comment"
                    />
                    {showMentions && (
                      <div className="absolute bottom-full left-0 bg-white border rounded-lg shadow-lg p-2 mb-1" data-testid="mention-suggestions">
                        {users.map((user: any) => (
                          <div 
                            key={user.id}
                            className="px-3 py-2 hover:bg-muted cursor-pointer rounded"
                            onClick={() => handleMentionSelect(user.name)}
                            data-testid="mention-option"
                          >
                            <AtSign className="h-4 w-4 inline mr-1" />
                            {user.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                  {ticketActivities.map(activity => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          by {activity.user} • {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
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
                  <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <div className="flex items-center gap-2">
                    <Select value={selectedTicket.priority} onValueChange={handlePriorityChange}>
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
                  <Select value={selectedTicket.category} onValueChange={handleCategoryChange}>
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
                  <Label>Assignee</Label>
                  <Select value={selectedTicket.assignee || ""} onValueChange={handleAssigneeChange}>
                    <SelectTrigger data-testid="select-assignee">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={handleAssignToMe} data-testid="button-assign-to-me">
                    <User className="h-4 w-4 mr-2" />
                    Assign to Me
                  </Button>
                  <Button variant="outline" onClick={handleUnassign} data-testid="button-unassign">
                    Unassign
                  </Button>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      Response time: 2h 30m
                    </p>
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

        {/* Add Tag Modal */}
        <Dialog open={addTagModalOpen} onOpenChange={setAddTagModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tag</DialogTitle>
            </DialogHeader>
            <Input 
              placeholder="Enter tag name..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              data-testid="input-tag"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTagModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTag} data-testid="button-save-tag">Add Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Comment Modal */}
        <Dialog open={deleteCommentModalOpen} onOpenChange={setDeleteCommentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Comment</DialogTitle>
              <DialogDescription>Are you sure you want to delete this comment?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteCommentModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteComment(ticketComments[0]?.id)} data-testid="button-confirm-delete">Delete</Button>
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
                    <SelectItem value="in-progress">In Progress</SelectItem>
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
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-assignee">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
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
                  <Button size="sm" onClick={() => setBulkAssignModalOpen(true)} data-testid="button-bulk-assign">
                    Bulk Assign
                  </Button>
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
                    <th className="text-left p-3">
                      <button className="flex items-center gap-1" data-testid="sort-created">
                        Subject
                      </button>
                    </th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">
                      <button className="flex items-center gap-1" data-testid="sort-priority">
                        Priority
                      </button>
                    </th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Assignee</th>
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
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">{ticket.createdBy}</p>
                        </div>
                      </td>
                      <td className="p-3">{getStatusBadge(ticket.status)}</td>
                      <td className="p-3">{getPriorityBadge(ticket.priority)}</td>
                      <td className="p-3">{ticket.category}</td>
                      <td className="p-3">{ticket.assignee || "Unassigned"}</td>
                      <td className="p-3" data-testid="ticket-sla">
                        {ticket.slaBreached ? (
                          <Badge variant="destructive" data-testid="sla-breached">Breached</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">OK</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <Label>Subject *</Label>
              <Input 
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                data-testid="input-subject"
              />
              {formErrors.subject && <p className="text-red-500 text-sm">{formErrors.subject}</p>}
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
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={ticketForm.isUrgent}
                onCheckedChange={(checked) => setTicketForm({...ticketForm, isUrgent: checked as boolean})}
                data-testid="checkbox-urgent"
              />
              <Label>Mark as Urgent</Label>
            </div>
            <div data-testid="file-upload-area" className="border-2 border-dashed rounded-lg p-4 text-center">
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} data-testid="button-submit-ticket">Submit Ticket</Button>
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

      {/* Bulk Assign Modal */}
      <Dialog open={bulkAssignModalOpen} onOpenChange={setBulkAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Assign Tickets</DialogTitle>
            <DialogDescription>Assign {selectedTickets.length} tickets to:</DialogDescription>
          </DialogHeader>
          <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
            <SelectTrigger data-testid="select-bulk-assignee">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAssign} data-testid="button-confirm-bulk">Assign</Button>
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
              <SelectItem value="in-progress">In Progress</SelectItem>
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
    </div>
  );
}
