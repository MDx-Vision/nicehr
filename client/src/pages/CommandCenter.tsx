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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  LogIn,
  LogOut,
  Ticket,
  ArrowUpCircle,
  UserCheck,
  MessageSquare,
  AlertCircle,
  Activity
} from "lucide-react";
import type { 
  Project, 
  Consultant,
  GoLiveSignInWithDetails, 
  SupportTicketWithDetails, 
  ShiftHandoffWithDetails, 
  CommandCenterStats 
} from "@shared/schema";

function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  variant = "default",
  isLoading = false
}: { 
  title: string;
  value: number | string;
  icon: typeof Users;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
  isLoading?: boolean;
}) {
  const variantStyles = {
    default: "text-muted-foreground",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <Card data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBoard({ stats, isLoading }: { stats?: CommandCenterStats; isLoading: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        title="Active Consultants"
        value={stats?.activeConsultants ?? 0}
        icon={Users}
        description="Currently assigned"
        isLoading={isLoading}
      />
      <KpiCard
        title="Checked In Today"
        value={stats?.checkedInToday ?? 0}
        icon={UserCheck}
        variant="success"
        description="On-site today"
        isLoading={isLoading}
      />
      <KpiCard
        title="Open Tickets"
        value={stats?.openTickets ?? 0}
        icon={Ticket}
        variant="warning"
        description="Needs attention"
        isLoading={isLoading}
      />
      <KpiCard
        title="Critical/Urgent"
        value={stats?.criticalTickets ?? 0}
        icon={AlertTriangle}
        variant="danger"
        description="High priority"
        isLoading={isLoading}
      />
      <KpiCard
        title="Pending Handoffs"
        value={stats?.pendingHandoffs ?? 0}
        icon={RefreshCw}
        description="Awaiting acknowledgment"
        isLoading={isLoading}
      />
    </div>
  );
}

function getSignInStatusBadge(status: string, lateArrival?: boolean | null) {
  if (lateArrival && status === "checked_in") {
    return <Badge className="bg-yellow-500 text-white">Late</Badge>;
  }
  switch (status) {
    case "checked_in":
      return <Badge className="bg-green-500 text-white">Checked In</Badge>;
    case "checked_out":
      return <Badge variant="secondary">Checked Out</Badge>;
    case "no_show":
      return <Badge variant="destructive">No Show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function SignInPanel({ 
  projectId, 
  signIns, 
  isLoading,
  onCheckIn,
  onCheckOut
}: { 
  projectId: string;
  signIns: GoLiveSignInWithDetails[];
  isLoading: boolean;
  onCheckIn: () => void;
  onCheckOut: (signInId: string) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign-In Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="panel-sign-in">
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LogIn className="h-5 w-5" />
            Sign-In Panel
          </CardTitle>
          <CardDescription>Active sign-ins for today</CardDescription>
        </div>
        <Button size="sm" onClick={onCheckIn} data-testid="button-check-in">
          <LogIn className="h-4 w-4 mr-2" />
          Check In
        </Button>
      </CardHeader>
      <CardContent>
        {signIns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active sign-ins yet</p>
            <p className="text-sm">Check in consultants as they arrive on-site</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consultant</TableHead>
                <TableHead>Location/Unit</TableHead>
                <TableHead>Sign In Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signIns.map((signIn) => (
                <TableRow key={signIn.id} data-testid={`row-signin-${signIn.id}`}>
                  <TableCell className="font-medium">
                    {signIn.user?.firstName} {signIn.user?.lastName}
                    {signIn.consultant?.tngId && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({signIn.consultant.tngId})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {signIn.location || signIn.unit || "-"}
                  </TableCell>
                  <TableCell>
                    {signIn.signInTime 
                      ? format(new Date(signIn.signInTime), "h:mm a")
                      : "-"
                    }
                  </TableCell>
                  <TableCell>
                    {getSignInStatusBadge(signIn.status, signIn.lateArrival)}
                  </TableCell>
                  <TableCell className="text-right">
                    {signIn.status === "checked_in" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onCheckOut(signIn.id)}
                        data-testid={`button-checkout-${signIn.id}`}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Check Out
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function getTicketPriorityBadge(priority: string) {
  switch (priority) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
    case "low":
      return <Badge className="bg-green-500 text-white">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}

function getTicketStatusBadge(status: string) {
  switch (status) {
    case "open":
      return <Badge className="bg-blue-500 text-white">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-yellow-500 text-white">In Progress</Badge>;
    case "resolved":
      return <Badge className="bg-green-500 text-white">Resolved</Badge>;
    case "closed":
      return <Badge variant="secondary">Closed</Badge>;
    case "escalated":
      return <Badge variant="destructive">Escalated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function SupportTicketsPanel({
  projectId,
  tickets,
  consultants,
  isLoading,
  onCreateTicket,
  onAssign,
  onResolve,
  onEscalate
}: {
  projectId: string;
  tickets: SupportTicketWithDetails[];
  consultants: Consultant[];
  isLoading: boolean;
  onCreateTicket: () => void;
  onAssign: (ticketId: string, consultantId: string) => void;
  onResolve: (ticketId: string, resolution: string) => void;
  onEscalate: (ticketId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketWithDetails | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [resolution, setResolution] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    switch (activeTab) {
      case "open":
        return ticket.status === "open";
      case "in_progress":
        return ticket.status === "in_progress";
      case "resolved":
        return ticket.status === "resolved" || ticket.status === "closed";
      default:
        return true;
    }
  });

  const handleAssign = () => {
    if (selectedTicket && selectedConsultant) {
      onAssign(selectedTicket.id, selectedConsultant);
      setAssignDialogOpen(false);
      setSelectedTicket(null);
      setSelectedConsultant("");
    }
  };

  const handleResolve = () => {
    if (selectedTicket && resolution) {
      onResolve(selectedTicket.id, resolution);
      setResolveDialogOpen(false);
      setSelectedTicket(null);
      setResolution("");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card data-testid="panel-tickets">
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5" />
              Support Tickets
            </CardTitle>
            <CardDescription>Track and manage go-live issues</CardDescription>
          </div>
          <Button size="sm" onClick={onCreateTicket} data-testid="button-create-ticket">
            <Ticket className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-tickets-all">
                All ({tickets.length})
              </TabsTrigger>
              <TabsTrigger value="open" data-testid="tab-tickets-open">
                Open ({tickets.filter(t => t.status === "open").length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" data-testid="tab-tickets-in-progress">
                In Progress ({tickets.filter(t => t.status === "in_progress").length})
              </TabsTrigger>
              <TabsTrigger value="resolved" data-testid="tab-tickets-resolved">
                Resolved ({tickets.filter(t => t.status === "resolved" || t.status === "closed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tickets found</p>
                  <p className="text-sm">
                    {activeTab === "all" 
                      ? "Create a new ticket when issues arise"
                      : `No ${activeTab.replace("_", " ")} tickets`
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                        <TableCell className="font-mono text-sm">
                          {ticket.ticketNumber || `T-${ticket.id.slice(0, 6)}`}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {ticket.title}
                        </TableCell>
                        <TableCell>{getTicketPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getTicketStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          {ticket.assignedTo 
                            ? `${ticket.assignedTo.user?.firstName || ""} ${ticket.assignedTo.user?.lastName || ""}`.trim() || "Assigned"
                            : <span className="text-muted-foreground">Unassigned</span>
                          }
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ticket.createdAt 
                            ? format(new Date(ticket.createdAt), "MMM d, h:mm a")
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 flex-wrap">
                            {ticket.status !== "resolved" && ticket.status !== "closed" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setAssignDialogOpen(true);
                                  }}
                                  data-testid={`button-assign-${ticket.id}`}
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setResolveDialogOpen(true);
                                  }}
                                  data-testid={`button-resolve-${ticket.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                {ticket.status !== "escalated" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500"
                                    onClick={() => onEscalate(ticket.id)}
                                    data-testid={`button-escalate-${ticket.id}`}
                                  >
                                    <ArrowUpCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Assign ticket "{selectedTicket?.title}" to a consultant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Consultant</Label>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger data-testid="select-consultant">
                  <SelectValue placeholder="Select a consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.tngId || consultant.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedConsultant} data-testid="button-confirm-assign">
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              Provide a resolution for ticket "{selectedTicket?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                rows={4}
                data-testid="input-resolution"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution} data-testid="button-confirm-resolve">
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ShiftHandoffPanel({
  projectId,
  handoffs,
  isLoading,
  onCreateHandoff,
  onAcknowledge
}: {
  projectId: string;
  handoffs: ShiftHandoffWithDetails[];
  isLoading: boolean;
  onCreateHandoff: () => void;
  onAcknowledge: (handoffId: string) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Shift Handoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="panel-handoffs">
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5" />
            Shift Handoffs
          </CardTitle>
          <CardDescription>Pending shift transition notes</CardDescription>
        </div>
        <Button size="sm" onClick={onCreateHandoff} data-testid="button-create-handoff">
          <MessageSquare className="h-4 w-4 mr-2" />
          New Handoff
        </Button>
      </CardHeader>
      <CardContent>
        {handoffs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No pending handoffs</p>
            <p className="text-sm">Create handoff notes when ending your shift</p>
          </div>
        ) : (
          <div className="space-y-4">
            {handoffs.map((handoff) => (
              <div 
                key={handoff.id} 
                className="border rounded-lg p-4 space-y-3"
                data-testid={`card-handoff-${handoff.id}`}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {handoff.outgoingConsultant?.user?.firstName} {handoff.outgoingConsultant?.user?.lastName}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">
                        {handoff.incomingConsultant 
                          ? `${handoff.incomingConsultant.user?.firstName} ${handoff.incomingConsultant.user?.lastName}`
                          : <span className="text-muted-foreground">Unassigned</span>
                        }
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      {handoff.shiftDate} | {handoff.outgoingShiftType} → {handoff.incomingShiftType || "?"}
                    </div>
                  </div>
                  <Badge variant={handoff.status === "pending" ? "outline" : "default"}>
                    {handoff.status}
                  </Badge>
                </div>
                
                {handoff.activeIssues && (
                  <div>
                    <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
                      <AlertCircle className="h-3 w-3" />
                      Active Issues
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{handoff.activeIssues}</p>
                  </div>
                )}
                
                {handoff.pendingTasks && (
                  <div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Activity className="h-3 w-3" />
                      Pending Tasks
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{handoff.pendingTasks}</p>
                  </div>
                )}
                
                {handoff.generalNotes && (
                  <p className="text-sm text-muted-foreground border-t pt-2 mt-2">{handoff.generalNotes}</p>
                )}
                
                {handoff.status === "pending" && (
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => onAcknowledge(handoff.id)}
                    data-testid={`button-acknowledge-${handoff.id}`}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Acknowledge Handoff
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckInDialog({
  open,
  onOpenChange,
  consultants,
  onCheckIn
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultants: Consultant[];
  onCheckIn: (data: { consultantId: string; location: string; unit: string; badgeNumber: string }) => void;
}) {
  const [consultantId, setConsultantId] = useState("");
  const [location, setLocation] = useState("");
  const [unit, setUnit] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");

  const handleSubmit = () => {
    onCheckIn({ consultantId, location, unit, badgeNumber });
    setConsultantId("");
    setLocation("");
    setUnit("");
    setBadgeNumber("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check In Consultant</DialogTitle>
          <DialogDescription>
            Record a consultant's arrival at the go-live site
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Consultant</Label>
            <Select value={consultantId} onValueChange={setConsultantId}>
              <SelectTrigger data-testid="select-checkin-consultant">
                <SelectValue placeholder="Select a consultant" />
              </SelectTrigger>
              <SelectContent>
                {consultants.map((consultant) => (
                  <SelectItem key={consultant.id} value={consultant.id}>
                    {consultant.tngId || consultant.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Building, Floor 3"
              data-testid="input-checkin-location"
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Input 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., ICU, Emergency"
              data-testid="input-checkin-unit"
            />
          </div>
          <div className="space-y-2">
            <Label>Badge Number (optional)</Label>
            <Input 
              value={badgeNumber} 
              onChange={(e) => setBadgeNumber(e.target.value)}
              placeholder="Visitor badge number"
              data-testid="input-checkin-badge"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!consultantId} data-testid="button-confirm-checkin">
            Check In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateTicketDialog({
  open,
  onOpenChange,
  onCreate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { title: string; description: string; priority: string; category: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("other");

  const handleSubmit = () => {
    onCreate({ title, description, priority, category });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("other");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Report a new issue for the go-live support team
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              data-testid="input-ticket-title"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the issue..."
              rows={4}
              data-testid="input-ticket-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger data-testid="select-ticket-priority">
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
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-ticket-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title} data-testid="button-confirm-create-ticket">
            Create Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateHandoffDialog({
  open,
  onOpenChange,
  consultants,
  onCreate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultants: Consultant[];
  onCreate: (data: { 
    outgoingConsultantId: string;
    incomingConsultantId: string;
    outgoingShiftType: string;
    incomingShiftType: string;
    activeIssues: string;
    pendingTasks: string;
    generalNotes: string;
  }) => void;
}) {
  const [outgoingConsultantId, setOutgoingConsultantId] = useState("");
  const [incomingConsultantId, setIncomingConsultantId] = useState("");
  const [outgoingShiftType, setOutgoingShiftType] = useState("day");
  const [incomingShiftType, setIncomingShiftType] = useState("night");
  const [activeIssues, setActiveIssues] = useState("");
  const [pendingTasks, setPendingTasks] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  const handleSubmit = () => {
    onCreate({ 
      outgoingConsultantId, 
      incomingConsultantId, 
      outgoingShiftType,
      incomingShiftType,
      activeIssues, 
      pendingTasks, 
      generalNotes 
    });
    setOutgoingConsultantId("");
    setIncomingConsultantId("");
    setOutgoingShiftType("day");
    setIncomingShiftType("night");
    setActiveIssues("");
    setPendingTasks("");
    setGeneralNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Shift Handoff</DialogTitle>
          <DialogDescription>
            Document important information for the next shift
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Outgoing Consultant</Label>
              <Select value={outgoingConsultantId} onValueChange={setOutgoingConsultantId}>
                <SelectTrigger data-testid="select-outgoing-consultant">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.tngId || consultant.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Incoming Consultant</Label>
              <Select value={incomingConsultantId} onValueChange={setIncomingConsultantId}>
                <SelectTrigger data-testid="select-incoming-consultant">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.tngId || consultant.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Outgoing Shift</Label>
              <Select value={outgoingShiftType} onValueChange={setOutgoingShiftType}>
                <SelectTrigger data-testid="select-outgoing-shift">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="swing">Swing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Incoming Shift</Label>
              <Select value={incomingShiftType} onValueChange={setIncomingShiftType}>
                <SelectTrigger data-testid="select-incoming-shift">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="swing">Swing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Active Issues</Label>
            <Textarea 
              value={activeIssues} 
              onChange={(e) => setActiveIssues(e.target.value)}
              placeholder="Ongoing issues that need attention..."
              rows={2}
              data-testid="input-handoff-issues"
            />
          </div>
          <div className="space-y-2">
            <Label>Pending Tasks</Label>
            <Textarea 
              value={pendingTasks} 
              onChange={(e) => setPendingTasks(e.target.value)}
              placeholder="Tasks that need to be completed..."
              rows={2}
              data-testid="input-handoff-tasks"
            />
          </div>
          <div className="space-y-2">
            <Label>General Notes</Label>
            <Textarea 
              value={generalNotes} 
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Any other important information..."
              rows={2}
              data-testid="input-handoff-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!outgoingConsultantId} data-testid="button-confirm-create-handoff">
            Create Handoff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CommandCenter() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [createTicketDialogOpen, setCreateTicketDialogOpen] = useState(false);
  const [createHandoffDialogOpen, setCreateHandoffDialogOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: consultants } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<CommandCenterStats>({
    queryKey: ["/api/projects", selectedProject, "command-center/stats"],
    enabled: !!selectedProject,
  });

  const { data: signIns, isLoading: signInsLoading } = useQuery<GoLiveSignInWithDetails[]>({
    queryKey: ["/api/projects", selectedProject, "go-live/signins/active"],
    enabled: !!selectedProject,
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery<SupportTicketWithDetails[]>({
    queryKey: ["/api/projects", selectedProject, "support/tickets"],
    enabled: !!selectedProject,
  });

  const { data: handoffs, isLoading: handoffsLoading } = useQuery<ShiftHandoffWithDetails[]>({
    queryKey: ["/api/projects", selectedProject, "shift/handoffs/pending"],
    enabled: !!selectedProject,
  });

  const checkInMutation = useMutation({
    mutationFn: async (data: { consultantId: string; location: string; unit: string; badgeNumber: string }) => {
      return await apiRequest("POST", `/api/projects/${selectedProject}/go-live/signins`, {
        projectId: selectedProject,
        consultantId: data.consultantId,
        location: data.location,
        unit: data.unit,
        badgeNumber: data.badgeNumber,
        signInTime: new Date().toISOString(),
        status: "checked_in",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "go-live/signins/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "command-center/stats"] });
      toast({ title: "Consultant checked in successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to check in", description: String(error), variant: "destructive" });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (signInId: string) => {
      return await apiRequest("POST", `/api/go-live/signins/${signInId}/signout`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "go-live/signins/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "command-center/stats"] });
      toast({ title: "Consultant checked out successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to check out", description: String(error), variant: "destructive" });
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string; category: string }) => {
      return await apiRequest("POST", `/api/projects/${selectedProject}/support/tickets`, {
        projectId: selectedProject,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "command-center/stats"] });
      toast({ title: "Ticket created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create ticket", description: String(error), variant: "destructive" });
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, consultantId }: { ticketId: string; consultantId: string }) => {
      return await apiRequest("POST", `/api/support/tickets/${ticketId}/assign`, { consultantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "support/tickets"] });
      toast({ title: "Ticket assigned successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to assign ticket", description: String(error), variant: "destructive" });
    },
  });

  const resolveTicketMutation = useMutation({
    mutationFn: async ({ ticketId, resolution }: { ticketId: string; resolution: string }) => {
      return await apiRequest("POST", `/api/support/tickets/${ticketId}/resolve`, { resolution });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "command-center/stats"] });
      toast({ title: "Ticket resolved successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to resolve ticket", description: String(error), variant: "destructive" });
    },
  });

  const escalateTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return await apiRequest("POST", `/api/support/tickets/${ticketId}/escalate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "command-center/stats"] });
      toast({ title: "Ticket escalated", variant: "destructive" });
    },
    onError: (error) => {
      toast({ title: "Failed to escalate ticket", description: String(error), variant: "destructive" });
    },
  });

  const createHandoffMutation = useMutation({
    mutationFn: async (data: { 
      outgoingConsultantId: string;
      incomingConsultantId: string;
      outgoingShiftType: string;
      incomingShiftType: string;
      activeIssues: string;
      pendingTasks: string;
      generalNotes: string;
    }) => {
      return await apiRequest("POST", `/api/projects/${selectedProject}/shift/handoffs`, {
        projectId: selectedProject,
        shiftDate: new Date().toISOString().split('T')[0],
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "shift/handoffs/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "command-center/stats"] });
      toast({ title: "Handoff created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create handoff", description: String(error), variant: "destructive" });
    },
  });

  const acknowledgeHandoffMutation = useMutation({
    mutationFn: async (handoffId: string) => {
      return await apiRequest("POST", `/api/shift/handoffs/${handoffId}/acknowledge`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "shift/handoffs/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "command-center/stats"] });
      toast({ title: "Handoff acknowledged" });
    },
    onError: (error) => {
      toast({ title: "Failed to acknowledge handoff", description: String(error), variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Go-Live Command Center
          </h1>
          <p className="text-muted-foreground">
            Real-time dashboard for managing go-live support
          </p>
        </div>
        <div className="w-full sm:w-[280px]">
          <Select 
            value={selectedProject} 
            onValueChange={setSelectedProject}
          >
            <SelectTrigger data-testid="select-project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projectsLoading ? (
                <SelectItem value="loading" disabled>Just a moment...</SelectItem>
              ) : projects && projects.length > 0 ? (
                projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No projects available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedProject ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Select a Project</h2>
              <p>Choose a project from the dropdown above to view its command center</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatusBoard stats={stats} isLoading={statsLoading} />

          <div className="grid gap-6 lg:grid-cols-2">
            <SignInPanel
              projectId={selectedProject}
              signIns={signIns || []}
              isLoading={signInsLoading}
              onCheckIn={() => setCheckInDialogOpen(true)}
              onCheckOut={(id) => checkOutMutation.mutate(id)}
            />

            <ShiftHandoffPanel
              projectId={selectedProject}
              handoffs={handoffs || []}
              isLoading={handoffsLoading}
              onCreateHandoff={() => setCreateHandoffDialogOpen(true)}
              onAcknowledge={(id) => acknowledgeHandoffMutation.mutate(id)}
            />
          </div>

          <SupportTicketsPanel
            projectId={selectedProject}
            tickets={tickets || []}
            consultants={consultants || []}
            isLoading={ticketsLoading}
            onCreateTicket={() => setCreateTicketDialogOpen(true)}
            onAssign={(ticketId, consultantId) => 
              assignTicketMutation.mutate({ ticketId, consultantId })
            }
            onResolve={(ticketId, resolution) => 
              resolveTicketMutation.mutate({ ticketId, resolution })
            }
            onEscalate={(ticketId) => escalateTicketMutation.mutate(ticketId)}
          />

          <CheckInDialog
            open={checkInDialogOpen}
            onOpenChange={setCheckInDialogOpen}
            consultants={consultants || []}
            onCheckIn={(data) => checkInMutation.mutate(data)}
          />

          <CreateTicketDialog
            open={createTicketDialogOpen}
            onOpenChange={setCreateTicketDialogOpen}
            onCreate={(data) => createTicketMutation.mutate(data)}
          />

          <CreateHandoffDialog
            open={createHandoffDialogOpen}
            onOpenChange={setCreateHandoffDialogOpen}
            consultants={consultants || []}
            onCreate={(data) => createHandoffMutation.mutate(data)}
          />
        </>
      )}
    </div>
  );
}
