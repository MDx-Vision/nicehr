import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { 
  ArrowLeftRight, 
  CalendarIcon, 
  Clock, 
  Plus, 
  Check, 
  X, 
  User,
  FileText,
  AlertCircle,
  Filter,
  RefreshCw
} from "lucide-react";
import type { 
  ShiftSwapRequest, 
  ShiftSwapRequestWithDetails, 
  Consultant, 
  ScheduleAssignment 
} from "@shared/schema";
import { cn } from "@/lib/utils";

const SWAP_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-500 text-white" data-testid={`badge-status-${status}`}>Pending</Badge>;
    case "approved":
      return <Badge className="bg-green-500 text-white" data-testid={`badge-status-${status}`}>Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive" data-testid={`badge-status-${status}`}>Rejected</Badge>;
    case "cancelled":
      return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Cancelled</Badge>;
    default:
      return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
  }
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase() || "?";
}

function formatConsultantName(firstName?: string | null, lastName?: string | null): string {
  if (!firstName && !lastName) return "Unknown Consultant";
  return `${firstName || ""} ${lastName || ""}`.trim();
}

interface SwapRequestCardProps {
  request: ShiftSwapRequestWithDetails;
  currentConsultantId: string | null;
  isAdmin: boolean;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
  onCancel: (id: string) => void;
  isLoading: boolean;
}

function SwapRequestCard({ 
  request, 
  currentConsultantId, 
  isAdmin,
  onApprove, 
  onReject, 
  onCancel,
  isLoading 
}: SwapRequestCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "cancel" | null>(null);
  const [responseNotes, setResponseNotes] = useState("");

  const isMyRequest = request.requesterId === currentConsultantId;
  const isTargetedToMe = request.targetConsultantId === currentConsultantId;
  const canActOnRequest = request.status === "pending" && (isAdmin || isTargetedToMe);
  const canCancel = request.status === "pending" && isMyRequest;

  const handleConfirmAction = () => {
    if (confirmAction === "approve") {
      onApprove(request.id, responseNotes || undefined);
    } else if (confirmAction === "reject") {
      onReject(request.id, responseNotes || undefined);
    } else if (confirmAction === "cancel") {
      onCancel(request.id);
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setResponseNotes("");
  };

  const openConfirmDialog = (action: "approve" | "reject" | "cancel") => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  return (
    <>
      <Card className="hover-elevate" data-testid={`card-swap-request-${request.id}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(
                    request.requester?.user?.firstName,
                    request.requester?.user?.lastName
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {formatConsultantName(
                    request.requester?.user?.firstName,
                    request.requester?.user?.lastName
                  )}
                  {isMyRequest && <span className="text-muted-foreground text-sm ml-2">(You)</span>}
                </CardTitle>
                <CardDescription className="text-sm">
                  Requested {request.requestedAt ? format(new Date(request.requestedAt), "MMM d, yyyy 'at' h:mm a") : "Unknown date"}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(request.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Original Shift
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`text-original-shift-${request.id}`}>
                {request.originalAssignment?.schedule?.scheduleDate
                  ? format(parseISO(request.originalAssignment.schedule.scheduleDate), "EEEE, MMM d, yyyy")
                  : "Unknown date"
                }
              </p>
              <p className="text-xs text-muted-foreground capitalize" data-testid={`text-shift-type-${request.id}`}>
                {request.originalAssignment?.schedule?.shiftType || "Unknown"} shift
              </p>
            </div>
            
            {request.targetConsultant && (
              <div className="space-y-1">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Target Consultant
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-target-consultant-${request.id}`}>
                  {formatConsultantName(
                    request.targetConsultant.user?.firstName,
                    request.targetConsultant.user?.lastName
                  )}
                  {isTargetedToMe && <span className="ml-1">(You)</span>}
                </p>
              </div>
            )}
          </div>

          {request.reason && (
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Reason
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`text-reason-${request.id}`}>
                {request.reason}
              </p>
            </div>
          )}

          {request.responseNotes && (
            <div className="space-y-1 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Response Notes</p>
              <p className="text-sm text-muted-foreground" data-testid={`text-response-notes-${request.id}`}>
                {request.responseNotes}
              </p>
              {request.responder && (
                <p className="text-xs text-muted-foreground">
                  — {formatConsultantName(request.responder.firstName, request.responder.lastName)}
                </p>
              )}
            </div>
          )}

          {(canActOnRequest || canCancel) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {canActOnRequest && (
                <>
                  <Button
                    size="sm"
                    onClick={() => openConfirmDialog("approve")}
                    disabled={isLoading}
                    data-testid={`button-approve-${request.id}`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isAdmin ? "Approve" : "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openConfirmDialog("reject")}
                    disabled={isLoading}
                    data-testid={`button-reject-${request.id}`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {isAdmin ? "Reject" : "Decline"}
                  </Button>
                </>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmDialog("cancel")}
                  disabled={isLoading}
                  data-testid={`button-cancel-${request.id}`}
                >
                  Cancel Request
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve" && "Approve Swap Request"}
              {confirmAction === "reject" && "Reject Swap Request"}
              {confirmAction === "cancel" && "Cancel Swap Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approve" && "Are you sure you want to approve this shift swap request?"}
              {confirmAction === "reject" && "Are you sure you want to reject this shift swap request?"}
              {confirmAction === "cancel" && "Are you sure you want to cancel your swap request?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {(confirmAction === "approve" || confirmAction === "reject") && (
            <div className="space-y-2 py-2">
              <Label htmlFor="response-notes">Notes (optional)</Label>
              <Textarea
                id="response-notes"
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Add any notes about this decision..."
                data-testid="textarea-response-notes"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-confirm-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={confirmAction === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              data-testid="button-confirm-action"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface RequestSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultantId: string;
  onSubmit: (data: { 
    originalAssignmentId: string;
    targetConsultantId?: string;
    reason?: string;
  }) => void;
  isLoading: boolean;
}

function RequestSwapDialog({ 
  open, 
  onOpenChange, 
  consultantId,
  onSubmit,
  isLoading 
}: RequestSwapDialogProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [selectedTargetConsultant, setSelectedTargetConsultant] = useState<string>("");
  const [reason, setReason] = useState("");

  const { data: schedules, isLoading: schedulesLoading } = useQuery<ScheduleAssignment[]>({
    queryKey: ["/api/consultants", consultantId, "schedules"],
    enabled: open && !!consultantId,
  });

  const { data: consultants, isLoading: consultantsLoading } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
    enabled: open,
  });

  const otherConsultants = useMemo(() => {
    return consultants?.filter(c => c.id !== consultantId) || [];
  }, [consultants, consultantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    onSubmit({
      originalAssignmentId: selectedAssignment,
      targetConsultantId: selectedTargetConsultant || undefined,
      reason: reason || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedAssignment("");
      setSelectedTargetConsultant("");
      setReason("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-request-swap">
        <DialogHeader>
          <DialogTitle>Request Shift Swap</DialogTitle>
          <DialogDescription>
            Select a shift you want to swap and optionally specify a consultant to swap with.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shift-select">Select Shift to Swap *</Label>
            {schedulesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : schedules && schedules.length > 0 ? (
              <Select 
                value={selectedAssignment} 
                onValueChange={setSelectedAssignment}
              >
                <SelectTrigger id="shift-select" data-testid="select-shift">
                  <SelectValue placeholder="Choose a shift" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.startTime 
                        ? format(new Date(schedule.startTime), "MMM d, yyyy - h:mm a")
                        : `Schedule ${schedule.id.slice(0, 8)}`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground p-3 border rounded-md">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                No scheduled shifts available to swap
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-consultant">Target Consultant (optional)</Label>
            {consultantsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={selectedTargetConsultant} 
                onValueChange={setSelectedTargetConsultant}
              >
                <SelectTrigger id="target-consultant" data-testid="select-target-consultant">
                  <SelectValue placeholder="Anyone available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Anyone available</SelectItem>
                  {otherConsultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      Consultant {consultant.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty to request a swap with any available consultant
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Swap</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need to swap this shift..."
              rows={3}
              data-testid="textarea-reason"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              data-testid="button-dialog-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedAssignment || isLoading}
              data-testid="button-submit-swap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ 
  title, 
  description, 
  icon: Icon = ArrowLeftRight 
}: { 
  title: string; 
  description: string; 
  icon?: typeof ArrowLeftRight;
}) {
  return (
    <div className="text-center py-12" data-testid="empty-state">
      <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
    </div>
  );
}

export default function ShiftSwaps() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>();
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>();

  const { data: consultant, isLoading: consultantLoading } = useQuery<Consultant>({
    queryKey: ["/api/consultants/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: swapRequests, isLoading: swapsLoading } = useQuery<ShiftSwapRequestWithDetails[]>({
    queryKey: ["/api/shift-swaps"],
    enabled: !!consultant?.id,
  });

  const { data: pendingAdminRequests, isLoading: adminSwapsLoading } = useQuery<ShiftSwapRequestWithDetails[]>({
    queryKey: ["/api/admin/shift-swaps/pending"],
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { 
      originalAssignmentId: string;
      targetConsultantId?: string;
      reason?: string;
    }) => {
      const res = await apiRequest("POST", "/api/shift-swaps", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-swaps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shift-swaps/pending"] });
      setShowRequestDialog(false);
      toast({
        title: "Request Submitted",
        description: "Your shift swap request has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit swap request",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await apiRequest("POST", `/api/shift-swaps/${id}/approve`, { notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-swaps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shift-swaps/pending"] });
      toast({
        title: "Request Approved",
        description: "The shift swap request has been approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve swap request",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await apiRequest("POST", `/api/shift-swaps/${id}/reject`, { notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-swaps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shift-swaps/pending"] });
      toast({
        title: "Request Rejected",
        description: "The shift swap request has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject swap request",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/shift-swaps/${id}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-swaps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shift-swaps/pending"] });
      toast({
        title: "Request Cancelled",
        description: "Your shift swap request has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel swap request",
        variant: "destructive",
      });
    },
  });

  const isLoading = consultantLoading || swapsLoading;
  const isMutating = createMutation.isPending || approveMutation.isPending || 
                     rejectMutation.isPending || cancelMutation.isPending;

  const filterRequests = (requests: ShiftSwapRequestWithDetails[] | undefined) => {
    if (!requests) return [];
    
    return requests.filter(req => {
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false;
      }
      
      if (startDateFilter && req.requestedAt) {
        const reqDate = new Date(req.requestedAt);
        if (isBefore(reqDate, startOfDay(startDateFilter))) {
          return false;
        }
      }
      
      if (endDateFilter && req.requestedAt) {
        const reqDate = new Date(req.requestedAt);
        if (isAfter(reqDate, endOfDay(endDateFilter))) {
          return false;
        }
      }
      
      return true;
    });
  };

  const myRequests = useMemo(() => {
    const filtered = swapRequests?.filter(req => req.requesterId === consultant?.id) || [];
    return filterRequests(filtered);
  }, [swapRequests, consultant?.id, statusFilter, startDateFilter, endDateFilter]);

  const incomingRequests = useMemo(() => {
    const filtered = swapRequests?.filter(req => 
      req.targetConsultantId === consultant?.id && req.requesterId !== consultant?.id
    ) || [];
    return filterRequests(filtered);
  }, [swapRequests, consultant?.id, statusFilter, startDateFilter, endDateFilter]);

  const allPendingRequests = useMemo(() => {
    return filterRequests(pendingAdminRequests);
  }, [pendingAdminRequests, statusFilter, startDateFilter, endDateFilter]);

  const handleApprove = (id: string, notes?: string) => {
    approveMutation.mutate({ id, notes });
  };

  const handleReject = (id: string, notes?: string) => {
    rejectMutation.mutate({ id, notes });
  };

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
  };

  const hasActiveFilters = statusFilter !== "all" || startDateFilter || endDateFilter;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!consultant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-title">Shift Swaps</h1>
          <p className="text-muted-foreground">
            Request and manage shift swaps with other consultants
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Consultant Profile</h3>
            <p className="text-sm text-muted-foreground">
              Please complete your consultant profile to access shift swap features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-title">Shift Swaps</h1>
          <p className="text-muted-foreground">
            Request and manage shift swaps with other consultants
          </p>
        </div>
        <Button 
          onClick={() => setShowRequestDialog(true)}
          data-testid="button-request-swap"
        >
          <Plus className="h-4 w-4 mr-2" />
          Request Swap
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5 min-w-[150px]">
              <Label className="text-sm">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {SWAP_STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "min-w-[150px] justify-start text-left font-normal",
                      !startDateFilter && "text-muted-foreground"
                    )}
                    data-testid="button-start-date-filter"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDateFilter ? format(startDateFilter, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDateFilter}
                    onSelect={setStartDateFilter}
                    data-testid="calendar-start-date-filter"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "min-w-[150px] justify-start text-left font-normal",
                      !endDateFilter && "text-muted-foreground"
                    )}
                    data-testid="button-end-date-filter"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDateFilter ? format(endDateFilter, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDateFilter}
                    onSelect={setEndDateFilter}
                    disabled={(date) => startDateFilter ? date < startDateFilter : false}
                    data-testid="calendar-end-date-filter"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-requests">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3" data-testid="tabs-list">
          <TabsTrigger value="my-requests" data-testid="tab-my-requests">
            My Requests
            {myRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{myRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="incoming" data-testid="tab-incoming">
            Incoming Requests
            {incomingRequests.filter(r => r.status === "pending").length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">
                {incomingRequests.filter(r => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="all-pending" data-testid="tab-all-pending">
              All Pending
              {allPendingRequests.length > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white">
                  {allPendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-requests" className="space-y-4 mt-4">
          {myRequests.length > 0 ? (
            myRequests.map(request => (
              <SwapRequestCard
                key={request.id}
                request={request}
                currentConsultantId={consultant.id}
                isAdmin={isAdmin}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                isLoading={isMutating}
              />
            ))
          ) : (
            <EmptyState
              title="No Swap Requests"
              description="You haven't made any shift swap requests yet. Click 'Request Swap' to get started."
            />
          )}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4 mt-4">
          {incomingRequests.length > 0 ? (
            incomingRequests.map(request => (
              <SwapRequestCard
                key={request.id}
                request={request}
                currentConsultantId={consultant.id}
                isAdmin={isAdmin}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                isLoading={isMutating}
              />
            ))
          ) : (
            <EmptyState
              title="No Incoming Requests"
              description="You don't have any incoming shift swap requests at this time."
            />
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="all-pending" className="space-y-4 mt-4">
            {adminSwapsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allPendingRequests.length > 0 ? (
              allPendingRequests.map(request => (
                <SwapRequestCard
                  key={request.id}
                  request={request}
                  currentConsultantId={consultant.id}
                  isAdmin={isAdmin}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onCancel={handleCancel}
                  isLoading={isMutating}
                />
              ))
            ) : (
              <EmptyState
                title="No Pending Requests"
                description="There are no pending shift swap requests that require admin approval."
              />
            )}
          </TabsContent>
        )}
      </Tabs>

      <RequestSwapDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        consultantId={consultant.id}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
