import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  FileEdit, Plus, Search, Filter, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Clock, Send,
  BarChart3, Trash2, Pencil, Eye, MessageSquare,
  AlertTriangle, TrendingUp, Users, Calendar,
  FileText, ChevronRight, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import {
  getChangeRequests,
  getChangeRequest,
  createChangeRequest,
  updateChangeRequest,
  deleteChangeRequest,
  submitChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  implementChangeRequest,
  addComment,
  getChangeRequestStats,
} from "@/lib/changeManagementApi";
import type { ChangeRequest, Project } from "@shared/schema";

// Status badge styling
const statusStyles: Record<string, { color: string; icon: typeof CheckCircle }> = {
  draft: { color: "bg-gray-100 text-gray-800", icon: FileEdit },
  submitted: { color: "bg-blue-100 text-blue-800", icon: Send },
  under_review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
  implemented: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
  cancelled: { color: "bg-gray-100 text-gray-500", icon: XCircle },
};

// Priority badge styling
const priorityStyles: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

// Category labels
const categoryLabels: Record<string, string> = {
  scope: "Scope",
  timeline: "Timeline",
  budget: "Budget",
  technical: "Technical",
  process: "Process",
  resource: "Resource",
  integration: "Integration",
  training: "Training",
};

// Impact level labels
const impactLabels: Record<string, string> = {
  minimal: "Minimal",
  moderate: "Moderate",
  significant: "Significant",
  major: "Major",
};

export default function ChangeManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  // Form states
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "scope",
    priority: "medium",
    impactLevel: "moderate",
    justification: "",
    proposedSolution: "",
    estimatedEffort: "",
    estimatedCost: "",
    targetImplementationDate: "",
  });
  const [approvalComments, setApprovalComments] = useState("");
  const [newComment, setNewComment] = useState("");

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch change requests for selected project
  const { data: changeRequests = [], isLoading } = useQuery<ChangeRequest[]>({
    queryKey: [`/api/projects/${selectedProjectId}/change-requests`, statusFilter, categoryFilter, priorityFilter],
    queryFn: () => getChangeRequests(selectedProjectId, {
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
    }),
    enabled: !!selectedProjectId,
  });

  // Fetch stats for selected project
  const { data: stats } = useQuery({
    queryKey: [`/api/projects/${selectedProjectId}/change-requests/stats`],
    queryFn: () => getChangeRequestStats(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // Fetch single change request with details
  const { data: requestDetails } = useQuery({
    queryKey: [`/api/projects/${selectedProjectId}/change-requests/${selectedRequest?.id}`],
    queryFn: () => getChangeRequest(selectedProjectId, selectedRequest?.id || ""),
    enabled: !!selectedProjectId && !!selectedRequest?.id && viewOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => createChangeRequest(selectedProjectId, {
      ...form,
      requestedById: user?.id || "dev-user-local",
      requestedByName: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "Dev Admin",
      targetImplementationDate: form.targetImplementationDate ? new Date(form.targetImplementationDate) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests/stats`] });
      setCreateOpen(false);
      resetForm();
      toast({ title: "Change request created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating change request", description: error.message, variant: "destructive" });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => submitChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests/stats`] });
      toast({ title: "Change request submitted for review" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveChangeRequest(id, {
      approverId: user?.id || "dev-user-local",
      approverName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Dev Admin",
      approverRole: user?.role || "admin",
      comments: approvalComments,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests/stats`] });
      setApprovalOpen(false);
      setApprovalComments("");
      toast({ title: "Change request approved" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectChangeRequest(id, {
      approverId: user?.id || "dev-user-local",
      approverName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Dev Admin",
      approverRole: user?.role || "admin",
      comments: approvalComments,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests/stats`] });
      setApprovalOpen(false);
      setApprovalComments("");
      toast({ title: "Change request rejected" });
    },
  });

  const implementMutation = useMutation({
    mutationFn: (id: string) => implementChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests/stats`] });
      toast({ title: "Change request marked as implemented" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChangeRequest(selectedProjectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests/stats`] });
      setViewOpen(false);
      toast({ title: "Change request deleted" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { changeRequestId: string; content: string }) =>
      addComment(data.changeRequestId, {
        authorId: user?.id || "dev-user-local",
        authorName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Dev Admin",
        content: data.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/change-requests/${selectedRequest?.id}`] });
      setNewComment("");
      toast({ title: "Comment added" });
    },
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "scope",
      priority: "medium",
      impactLevel: "moderate",
      justification: "",
      proposedSolution: "",
      estimatedEffort: "",
      estimatedCost: "",
      targetImplementationDate: "",
    });
  };

  // Filter change requests by search query
  const filteredRequests = changeRequests.filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.title?.toLowerCase().includes(query) ||
      req.requestNumber?.toLowerCase().includes(query) ||
      req.description?.toLowerCase().includes(query)
    );
  });

  // Get pending approvals for My Approvals tab
  const pendingApprovals = changeRequests.filter((req) => req.status === "submitted");

  // Get my requests
  const myRequests = changeRequests.filter((req) => req.requestedById === (user?.id || "dev-user-local"));

  const openViewDialog = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setViewOpen(true);
  };

  const openApprovalDialog = (request: ChangeRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setApprovalOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change Management</h1>
          <p className="text-muted-foreground">Track and manage project change requests</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[280px]" data-testid="project-selector">
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
          {selectedProjectId && (
            <Button onClick={() => setCreateOpen(true)} data-testid="create-change-request">
              <Plus className="w-4 h-4 mr-2" />
              New Change Request
            </Button>
          )}
        </div>
      </div>

      {!selectedProjectId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileEdit className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Project</h3>
            <p className="text-muted-foreground">
              Choose a project from the dropdown above to view and manage change requests.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList role="tablist">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingApprovals.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus?.approved || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Implemented</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus?.implemented || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>By Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={statusStyles[status]?.color || "bg-gray-100"}>
                            {status.replace("_", " ")}
                          </Badge>
                        </div>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                    {Object.keys(stats?.byStatus || {}).length === 0 && (
                      <p className="text-muted-foreground text-sm">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.byPriority || {}).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={priorityStyles[priority] || "bg-gray-100"}>
                            {priority}
                          </Badge>
                        </div>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                    {Object.keys(stats?.byPriority || {}).length === 0 && (
                      <p className="text-muted-foreground text-sm">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Change Requests</CardTitle>
                <CardDescription>Latest change requests across the project</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentRequests?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentRequests.map((request: ChangeRequest) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => openViewDialog(request)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={statusStyles[request.status]?.color}>
                            {request.status?.replace("_", " ")}
                          </Badge>
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.requestNumber} - {categoryLabels[request.category || ""] || request.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={priorityStyles[request.priority || ""]}>
                            {request.priority}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No change requests yet. Create your first one!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Requests Tab */}
          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by title, number, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="search-input"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="category-filter">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="scope">Scope</SelectItem>
                      <SelectItem value="timeline">Timeline</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="priority-filter">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Request List */}
            <Card>
              <CardContent className="py-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filteredRequests.length > 0 ? (
                  <div className="space-y-3">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        data-testid={`change-request-${request.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Badge className={statusStyles[request.status]?.color}>
                            {request.status?.replace("_", " ")}
                          </Badge>
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{request.requestNumber}</span>
                              <span>-</span>
                              <span>{categoryLabels[request.category || ""] || request.category}</span>
                              <span>-</span>
                              <span>by {request.requestedByName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={priorityStyles[request.priority || ""]}>
                            {request.priority}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(request)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => submitMutation.mutate(request.id)}
                              data-testid={`submit-${request.id}`}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          )}
                          {request.status === "submitted" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                onClick={() => openApprovalDialog(request, "approve")}
                                data-testid={`approve-${request.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => openApprovalDialog(request, "reject")}
                                data-testid={`reject-${request.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-purple-600"
                              onClick={() => implementMutation.mutate(request.id)}
                              data-testid={`implement-${request.id}`}
                            >
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Implement
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No change requests found matching your filters.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Change Requests</CardTitle>
                <CardDescription>Change requests you have submitted</CardDescription>
              </CardHeader>
              <CardContent>
                {myRequests.length > 0 ? (
                  <div className="space-y-3">
                    {myRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <Badge className={statusStyles[request.status]?.color}>
                            {request.status?.replace("_", " ")}
                          </Badge>
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.requestNumber} - {categoryLabels[request.category || ""] || request.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={priorityStyles[request.priority || ""]}>
                            {request.priority}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(request)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => submitMutation.mutate(request.id)}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    You haven't created any change requests yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Change requests awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovals.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{request.requestNumber}</span>
                              <span>-</span>
                              <span>by {request.requestedByName}</span>
                              <span>-</span>
                              <span>{request.createdAt && format(new Date(request.createdAt), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={priorityStyles[request.priority || ""]}>
                            {request.priority}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(request)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            onClick={() => openApprovalDialog(request, "approve")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => openApprovalDialog(request, "reject")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No change requests pending your approval.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Change Request Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Change Request</DialogTitle>
            <DialogDescription>
              Submit a new change request for review and approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief description of the change"
                  data-testid="title-input"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scope">Scope</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger data-testid="priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description of the proposed change"
                  rows={3}
                  data-testid="description-input"
                />
              </div>
              <div>
                <Label htmlFor="impactLevel">Impact Level</Label>
                <Select value={form.impactLevel} onValueChange={(v) => setForm({ ...form, impactLevel: v })}>
                  <SelectTrigger data-testid="impact-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="significant">Significant</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetDate">Target Implementation Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={form.targetImplementationDate}
                  onChange={(e) => setForm({ ...form, targetImplementationDate: e.target.value })}
                  data-testid="target-date-input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="justification">Business Justification</Label>
                <Textarea
                  id="justification"
                  value={form.justification}
                  onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  placeholder="Why is this change necessary?"
                  rows={2}
                  data-testid="justification-input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="proposedSolution">Proposed Solution</Label>
                <Textarea
                  id="proposedSolution"
                  value={form.proposedSolution}
                  onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
                  placeholder="How will this change be implemented?"
                  rows={2}
                  data-testid="solution-input"
                />
              </div>
              <div>
                <Label htmlFor="estimatedEffort">Estimated Effort</Label>
                <Input
                  id="estimatedEffort"
                  value={form.estimatedEffort}
                  onChange={(e) => setForm({ ...form, estimatedEffort: e.target.value })}
                  placeholder="e.g., 40 hours, 2 weeks"
                  data-testid="effort-input"
                />
              </div>
              <div>
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input
                  id="estimatedCost"
                  value={form.estimatedCost}
                  onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                  placeholder="e.g., $5,000"
                  data-testid="cost-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.title || !form.description || createMutation.isPending}
              data-testid="submit-create"
            >
              {createMutation.isPending ? "Creating..." : "Create Change Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Change Request Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRequest?.title}
              <Badge className={statusStyles[selectedRequest?.status || ""]?.color}>
                {selectedRequest?.status?.replace("_", " ")}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.requestNumber} - Created by {selectedRequest?.requestedByName}
            </DialogDescription>
          </DialogHeader>
          {requestDetails && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{categoryLabels[requestDetails.category] || requestDetails.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge className={priorityStyles[requestDetails.priority]}>{requestDetails.priority}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Impact Level</Label>
                  <p className="font-medium">{impactLabels[requestDetails.impactLevel] || requestDetails.impactLevel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Target Date</Label>
                  <p className="font-medium">
                    {requestDetails.targetImplementationDate
                      ? format(new Date(requestDetails.targetImplementationDate), "MMM d, yyyy")
                      : "Not set"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 whitespace-pre-wrap">{requestDetails.description}</p>
              </div>

              {requestDetails.justification && (
                <div>
                  <Label className="text-muted-foreground">Business Justification</Label>
                  <p className="mt-1 whitespace-pre-wrap">{requestDetails.justification}</p>
                </div>
              )}

              {requestDetails.proposedSolution && (
                <div>
                  <Label className="text-muted-foreground">Proposed Solution</Label>
                  <p className="mt-1 whitespace-pre-wrap">{requestDetails.proposedSolution}</p>
                </div>
              )}

              {/* Estimates */}
              {(requestDetails.estimatedEffort || requestDetails.estimatedCost) && (
                <div className="grid grid-cols-2 gap-4">
                  {requestDetails.estimatedEffort && (
                    <div>
                      <Label className="text-muted-foreground">Estimated Effort</Label>
                      <p className="font-medium">{requestDetails.estimatedEffort}</p>
                    </div>
                  )}
                  {requestDetails.estimatedCost && (
                    <div>
                      <Label className="text-muted-foreground">Estimated Cost</Label>
                      <p className="font-medium">{requestDetails.estimatedCost}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Approval History */}
              {requestDetails.approvals?.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Approval History</Label>
                  <div className="mt-2 space-y-2">
                    {requestDetails.approvals.map((approval: any) => (
                      <div key={approval.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {approval.decision === "approved" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{approval.approverName}</p>
                            <p className="text-sm text-muted-foreground">{approval.approverRole}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={approval.decision === "approved" ? "default" : "destructive"}>
                            {approval.decision}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {approval.decidedAt && format(new Date(approval.decidedAt), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <Label className="text-muted-foreground">Comments</Label>
                <div className="mt-2 space-y-2">
                  {requestDetails.comments?.map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.createdAt && format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                  {(!requestDetails.comments || requestDetails.comments.length === 0) && (
                    <p className="text-muted-foreground text-sm">No comments yet</p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    data-testid="comment-input"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (newComment.trim() && selectedRequest?.id) {
                        addCommentMutation.mutate({
                          changeRequestId: selectedRequest.id,
                          content: newComment.trim(),
                        });
                      }
                    }}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    data-testid="add-comment"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === "draft" && (
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selectedRequest.id)}
                data-testid="delete-request"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Dialog */}
      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve" : "Reject"} Change Request
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Please confirm your approval of this change request."
                : "Please provide a reason for rejecting this change request."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedRequest?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedRequest?.requestNumber}</p>
            </div>
            <Label htmlFor="comments">Comments {approvalAction === "reject" && "*"}</Label>
            <Textarea
              id="comments"
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder={approvalAction === "approve" ? "Optional comments..." : "Reason for rejection..."}
              rows={3}
              data-testid="approval-comments"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalOpen(false)}>
              Cancel
            </Button>
            {approvalAction === "approve" ? (
              <Button
                onClick={() => selectedRequest && approveMutation.mutate(selectedRequest.id)}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="confirm-approve"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            ) : (
              <Button
                onClick={() => selectedRequest && rejectMutation.mutate(selectedRequest.id)}
                disabled={!approvalComments.trim() || rejectMutation.isPending}
                variant="destructive"
                data-testid="confirm-reject"
              >
                <XCircle className="w-4 h-4 mr-1" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
