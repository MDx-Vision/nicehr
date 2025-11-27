import { useState, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isToday, differenceInMinutes, parseISO } from "date-fns";
import { 
  Clock, 
  CalendarCheck, 
  AlertCircle, 
  FileCheck,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Plus,
  Eye,
  Send,
  Check,
  X,
  Trash2,
  Edit,
  CalendarIcon,
  Timer
} from "lucide-react";
import type { 
  Project, 
  Timesheet,
  TimesheetWithDetails, 
  TimesheetEntry 
} from "@shared/schema";
import { cn } from "@/lib/utils";

function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  variant = "default",
  isLoading = false
}: { 
  title: string;
  value: number | string;
  icon: typeof Clock;
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
    <Card data-testid={`summary-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
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

function getTimesheetStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "submitted":
      return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
    case "approved":
      return <Badge className="bg-green-500 text-white">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "paid":
      return <Badge className="bg-purple-500 text-white">Paid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return "0.00";
  return hours.toFixed(2);
}

function formatElapsedTime(startTime: Date | string): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, start);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function ClockInOutCard({
  currentEntry,
  currentTimesheet,
  isLoading,
  onClockIn,
  onClockOut,
}: {
  currentEntry: TimesheetEntry | null;
  currentTimesheet: TimesheetWithDetails | null;
  isLoading: boolean;
  onClockIn: (location?: string) => void;
  onClockOut: (entryId: string) => void;
}) {
  const [location, setLocation] = useState("");
  const [elapsedTime, setElapsedTime] = useState("");
  const isClockedIn = currentEntry && currentEntry.clockIn && !currentEntry.clockOut;

  useEffect(() => {
    if (isClockedIn && currentEntry?.clockIn) {
      const updateElapsed = () => {
        setElapsedTime(formatElapsedTime(currentEntry.clockIn!));
      };
      updateElapsed();
      const interval = setInterval(updateElapsed, 60000);
      return () => clearInterval(interval);
    }
  }, [isClockedIn, currentEntry?.clockIn]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Clock In/Out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-clock-in-out">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5" />
          Clock In/Out
        </CardTitle>
        <CardDescription>
          {isClockedIn 
            ? `Currently clocked in for ${elapsedTime}`
            : "Start tracking your time"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isClockedIn ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-md border border-green-500/20">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">Clocked In</p>
                <p className="text-sm text-muted-foreground">
                  Since {currentEntry?.clockIn ? format(new Date(currentEntry.clockIn), "h:mm a") : "-"}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{elapsedTime}</p>
              <p className="text-sm text-muted-foreground">Elapsed time</p>
            </div>
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={() => currentEntry && onClockOut(currentEntry.id)}
              data-testid="button-clock-out"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Clock Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Main Office, Remote"
                data-testid="input-clock-location"
              />
            </div>
            <Button 
              className="w-full"
              onClick={() => onClockIn(location || undefined)}
              disabled={!currentTimesheet}
              data-testid="button-clock-in"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Clock In
            </Button>
            {!currentTimesheet && (
              <p className="text-xs text-muted-foreground text-center">
                Create a timesheet for this week to clock in
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TimesheetListTable({
  timesheets,
  isLoading,
  onView,
  onSubmit,
}: {
  timesheets: TimesheetWithDetails[];
  isLoading: boolean;
  onView: (timesheet: TimesheetWithDetails) => void;
  onSubmit: (timesheetId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (timesheets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No timesheets found</p>
        <p className="text-sm">Create your first timesheet to start tracking hours</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Week Of</TableHead>
          <TableHead>Project</TableHead>
          <TableHead className="text-right">Total Hours</TableHead>
          <TableHead className="text-right">Regular</TableHead>
          <TableHead className="text-right">Overtime</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {timesheets.map((timesheet) => (
          <TableRow key={timesheet.id} data-testid={`row-timesheet-${timesheet.id}`}>
            <TableCell className="font-medium">
              {timesheet.weekStartDate ? format(parseISO(timesheet.weekStartDate), "MMM d, yyyy") : "-"}
            </TableCell>
            <TableCell>
              {timesheet.project?.name || "General"}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatHours(timesheet.totalHours)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatHours(timesheet.regularHours)}
            </TableCell>
            <TableCell className="text-right font-mono">
              <span className={timesheet.overtimeHours && timesheet.overtimeHours > 0 ? "text-yellow-600" : ""}>
                {formatHours(timesheet.overtimeHours)}
              </span>
            </TableCell>
            <TableCell>
              {getTimesheetStatusBadge(timesheet.status)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(timesheet)}
                  data-testid={`button-view-${timesheet.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {timesheet.status === "draft" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSubmit(timesheet.id)}
                    data-testid={`button-submit-${timesheet.id}`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EntriesTable({
  entries,
  isLoading,
  onEdit,
  onDelete,
  readonly = false,
}: {
  entries: TimesheetEntry[];
  isLoading: boolean;
  onEdit?: (entry: TimesheetEntry) => void;
  onDelete?: (entryId: string) => void;
  readonly?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No entries found</p>
        <p className="text-sm">Clock in or add manual entries to track your time</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Clock In</TableHead>
          <TableHead>Clock Out</TableHead>
          <TableHead className="text-right">Hours</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Notes</TableHead>
          {!readonly && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id} data-testid={`row-entry-${entry.id}`}>
            <TableCell className="font-medium">
              {entry.entryDate ? format(parseISO(entry.entryDate), "EEE, MMM d") : "-"}
            </TableCell>
            <TableCell>
              {entry.clockIn ? format(new Date(entry.clockIn), "h:mm a") : "-"}
            </TableCell>
            <TableCell>
              {entry.clockOut ? format(new Date(entry.clockOut), "h:mm a") : (
                entry.clockIn ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">Active</Badge>
                ) : "-"
              )}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatHours(entry.totalHours)}
            </TableCell>
            <TableCell className="max-w-[100px] truncate">
              {entry.location || "-"}
            </TableCell>
            <TableCell className="max-w-[150px] truncate">
              {entry.notes || "-"}
            </TableCell>
            {!readonly && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(entry)}
                      data-testid={`button-edit-entry-${entry.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(entry.id)}
                      data-testid={`button-delete-entry-${entry.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PendingApprovalTable({
  timesheets,
  isLoading,
  onApprove,
  onReject,
  onView,
}: {
  timesheets: TimesheetWithDetails[];
  isLoading: boolean;
  onApprove: (timesheetId: string) => void;
  onReject: (timesheetId: string, reason: string) => void;
  onView: (timesheet: TimesheetWithDetails) => void;
}) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetWithDetails | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = () => {
    if (selectedTimesheet && rejectReason) {
      onReject(selectedTimesheet.id, rejectReason);
      setRejectDialogOpen(false);
      setSelectedTimesheet(null);
      setRejectReason("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (timesheets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No pending approvals</p>
        <p className="text-sm">All submitted timesheets have been reviewed</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Consultant</TableHead>
            <TableHead>Week Of</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Total Hours</TableHead>
            <TableHead className="text-right">Overtime</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timesheets.map((timesheet) => (
            <TableRow key={timesheet.id} data-testid={`row-pending-${timesheet.id}`}>
              <TableCell className="font-medium">
                {timesheet.consultant?.user?.firstName} {timesheet.consultant?.user?.lastName}
              </TableCell>
              <TableCell>
                {timesheet.weekStartDate ? format(parseISO(timesheet.weekStartDate), "MMM d, yyyy") : "-"}
              </TableCell>
              <TableCell>
                {timesheet.project?.name || "General"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatHours(timesheet.totalHours)}
              </TableCell>
              <TableCell className="text-right font-mono">
                <span className={timesheet.overtimeHours && timesheet.overtimeHours > 0 ? "text-yellow-600" : ""}>
                  {formatHours(timesheet.overtimeHours)}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {timesheet.submittedAt ? format(new Date(timesheet.submittedAt), "MMM d, h:mm a") : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(timesheet)}
                    data-testid={`button-view-pending-${timesheet.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600"
                    onClick={() => onApprove(timesheet.id)}
                    data-testid={`button-approve-${timesheet.id}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      setSelectedTimesheet(timesheet);
                      setRejectDialogOpen(true);
                    }}
                    data-testid={`button-reject-${timesheet.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Timesheet</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this timesheet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={3}
                data-testid="input-reject-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason}
              data-testid="button-confirm-reject"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateTimesheetDialog({
  open,
  onOpenChange,
  projects,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onCreate: (data: { weekStartDate: string; projectId?: string; notes?: string }) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedProject, setSelectedProject] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = () => {
    if (selectedDate) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      onCreate({
        weekStartDate: format(weekStart, "yyyy-MM-dd"),
        projectId: selectedProject || undefined,
        notes: notes || undefined,
      });
      onOpenChange(false);
      setSelectedDate(undefined);
      setSelectedProject("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Timesheet</DialogTitle>
          <DialogDescription>
            Create a new timesheet for tracking your hours
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Week Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                  data-testid="button-select-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "PPP") : "Select week"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger data-testid="select-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes for this timesheet..."
              rows={2}
              data-testid="input-timesheet-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!selectedDate}
            data-testid="button-confirm-create"
          >
            Create Timesheet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewTimesheetDialog({
  open,
  onOpenChange,
  timesheet,
  entries,
  isLoading,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timesheet: TimesheetWithDetails | null;
  entries: TimesheetEntry[];
  isLoading: boolean;
  onAddEntry: (data: { entryDate: string; clockIn?: string; clockOut?: string; notes?: string }) => void;
  onEditEntry: (entryId: string, data: Partial<TimesheetEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
  onSubmit: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [entryDate, setEntryDate] = useState<Date>();
  const [clockInTime, setClockInTime] = useState("09:00");
  const [clockOutTime, setClockOutTime] = useState("17:00");
  const [entryNotes, setEntryNotes] = useState("");

  const handleAddEntry = () => {
    if (entryDate) {
      const clockInDate = new Date(entryDate);
      const [inHours, inMinutes] = clockInTime.split(":").map(Number);
      clockInDate.setHours(inHours, inMinutes, 0, 0);

      const clockOutDate = new Date(entryDate);
      const [outHours, outMinutes] = clockOutTime.split(":").map(Number);
      clockOutDate.setHours(outHours, outMinutes, 0, 0);

      onAddEntry({
        entryDate: format(entryDate, "yyyy-MM-dd"),
        clockIn: clockInDate.toISOString(),
        clockOut: clockOutDate.toISOString(),
        notes: entryNotes || undefined,
      });
      setShowAddForm(false);
      setEntryDate(undefined);
      setClockInTime("09:00");
      setClockOutTime("17:00");
      setEntryNotes("");
    }
  };

  if (!timesheet) return null;

  const isEditable = timesheet.status === "draft";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Timesheet Details</DialogTitle>
          <DialogDescription>
            Week of {timesheet.weekStartDate ? format(parseISO(timesheet.weekStartDate), "MMMM d, yyyy") : "-"}
            {timesheet.project?.name && ` • ${timesheet.project.name}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">{getTimesheetStatusBadge(timesheet.status)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{formatHours(timesheet.totalHours)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Regular</p>
              <p className="text-lg font-medium">{formatHours(timesheet.regularHours)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Overtime</p>
              <p className={cn(
                "text-lg font-medium",
                timesheet.overtimeHours && timesheet.overtimeHours > 0 && "text-yellow-600"
              )}>
                {formatHours(timesheet.overtimeHours)}
              </p>
            </div>
          </div>

          {timesheet.rejectionReason && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm font-medium text-red-600">Rejection Reason:</p>
              <p className="text-sm text-red-600/80 mt-1">{timesheet.rejectionReason}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Time Entries</h3>
              {isEditable && (
                <Button 
                  size="sm" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  data-testid="button-add-entry"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              )}
            </div>

            {showAddForm && (
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium text-sm">Add Manual Entry</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !entryDate && "text-muted-foreground"
                          )}
                          data-testid="button-entry-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {entryDate ? format(entryDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={entryDate}
                          onSelect={setEntryDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={entryNotes}
                      onChange={(e) => setEntryNotes(e.target.value)}
                      placeholder="Optional notes"
                      data-testid="input-entry-notes"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Clock In</Label>
                    <Input
                      type="time"
                      value={clockInTime}
                      onChange={(e) => setClockInTime(e.target.value)}
                      data-testid="input-clock-in-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Clock Out</Label>
                    <Input
                      type="time"
                      value={clockOutTime}
                      onChange={(e) => setClockOutTime(e.target.value)}
                      data-testid="input-clock-out-time"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddEntry}
                    disabled={!entryDate}
                    data-testid="button-save-entry"
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            )}

            <EntriesTable
              entries={entries}
              isLoading={isLoading}
              onEdit={isEditable ? (entry) => {
                console.log("Edit entry:", entry);
              } : undefined}
              onDelete={isEditable ? (entryId) => onDeleteEntry(entryId) : undefined}
              readonly={!isEditable}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isEditable && (
            <Button onClick={onSubmit} data-testid="button-submit-timesheet">
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Timesheets() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("my-timesheets");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetWithDetails | null>(null);

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekRangeDisplay = `${format(currentWeekStart, "MMM d")} - ${format(currentWeekEnd, "MMM d, yyyy")}`;

  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const { data: timesheets, isLoading: timesheetsLoading } = useQuery<TimesheetWithDetails[]>({
    queryKey: ["/api/timesheets"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: pendingTimesheets, isLoading: pendingLoading } = useQuery<TimesheetWithDetails[]>({
    queryKey: ["/api/admin/timesheets/pending"],
    enabled: isAdmin,
  });

  const { data: selectedEntries, isLoading: entriesLoading } = useQuery<TimesheetEntry[]>({
    queryKey: ["/api/timesheets", selectedTimesheet?.id, "entries"],
    enabled: !!selectedTimesheet,
  });

  const currentWeekTimesheet = timesheets?.find(t => {
    if (!t.weekStartDate) return false;
    const wsDate = parseISO(t.weekStartDate);
    return wsDate.getTime() === currentWeekStart.getTime();
  });

  const currentEntry = selectedEntries?.find(e => e.clockIn && !e.clockOut) || null;

  const currentWeekEntries = selectedEntries?.filter(e => {
    if (!e.entryDate) return false;
    const entryDate = parseISO(e.entryDate);
    return entryDate >= currentWeekStart && entryDate <= currentWeekEnd;
  }) || [];

  const totalHoursThisWeek = timesheets?.reduce((sum, t) => {
    if (!t.weekStartDate) return sum;
    const wsDate = parseISO(t.weekStartDate);
    if (wsDate.getTime() === currentWeekStart.getTime()) {
      return sum + (t.totalHours || 0);
    }
    return sum;
  }, 0) || 0;

  const regularHoursThisWeek = timesheets?.reduce((sum, t) => {
    if (!t.weekStartDate) return sum;
    const wsDate = parseISO(t.weekStartDate);
    if (wsDate.getTime() === currentWeekStart.getTime()) {
      return sum + (t.regularHours || 0);
    }
    return sum;
  }, 0) || 0;

  const overtimeHoursThisWeek = timesheets?.reduce((sum, t) => {
    if (!t.weekStartDate) return sum;
    const wsDate = parseISO(t.weekStartDate);
    if (wsDate.getTime() === currentWeekStart.getTime()) {
      return sum + (t.overtimeHours || 0);
    }
    return sum;
  }, 0) || 0;

  const pendingApprovalCount = pendingTimesheets?.length || 0;

  const createTimesheetMutation = useMutation({
    mutationFn: async (data: { weekStartDate: string; projectId?: string; notes?: string }) => {
      const weekStart = parseISO(data.weekStartDate);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return await apiRequest("POST", "/api/timesheets", {
        weekStartDate: data.weekStartDate,
        weekEndDate: format(weekEnd, "yyyy-MM-dd"),
        projectId: data.projectId === "general" ? undefined : data.projectId,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({ title: "Timesheet created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create timesheet", description: String(error), variant: "destructive" });
    },
  });

  const submitTimesheetMutation = useMutation({
    mutationFn: async (timesheetId: string) => {
      return await apiRequest("POST", `/api/timesheets/${timesheetId}/submit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({ title: "Timesheet submitted for approval" });
    },
    onError: (error) => {
      toast({ title: "Failed to submit timesheet", description: String(error), variant: "destructive" });
    },
  });

  const approveTimesheetMutation = useMutation({
    mutationFn: async (timesheetId: string) => {
      return await apiRequest("POST", `/api/timesheets/${timesheetId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timesheets/pending"] });
      toast({ title: "Timesheet approved" });
    },
    onError: (error) => {
      toast({ title: "Failed to approve timesheet", description: String(error), variant: "destructive" });
    },
  });

  const rejectTimesheetMutation = useMutation({
    mutationFn: async ({ timesheetId, reason }: { timesheetId: string; reason: string }) => {
      return await apiRequest("POST", `/api/timesheets/${timesheetId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timesheets/pending"] });
      toast({ title: "Timesheet rejected" });
    },
    onError: (error) => {
      toast({ title: "Failed to reject timesheet", description: String(error), variant: "destructive" });
    },
  });

  const clockInMutation = useMutation({
    mutationFn: async ({ timesheetId, location }: { timesheetId: string; location?: string }) => {
      return await apiRequest("POST", `/api/timesheets/${timesheetId}/clock-in`, { location });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      if (selectedTimesheet) {
        queryClient.invalidateQueries({ queryKey: ["/api/timesheets", selectedTimesheet.id, "entries"] });
      }
      toast({ title: "Clocked in successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to clock in", description: String(error), variant: "destructive" });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return await apiRequest("POST", `/api/timesheet-entries/${entryId}/clock-out`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      if (selectedTimesheet) {
        queryClient.invalidateQueries({ queryKey: ["/api/timesheets", selectedTimesheet.id, "entries"] });
      }
      toast({ title: "Clocked out successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to clock out", description: String(error), variant: "destructive" });
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: async ({ timesheetId, data }: { 
      timesheetId: string; 
      data: { entryDate: string; clockIn?: string; clockOut?: string; notes?: string } 
    }) => {
      return await apiRequest("POST", `/api/timesheets/${timesheetId}/entries`, {
        ...data,
        isManualEntry: true,
      });
    },
    onSuccess: () => {
      if (selectedTimesheet) {
        queryClient.invalidateQueries({ queryKey: ["/api/timesheets", selectedTimesheet.id, "entries"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({ title: "Entry added successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to add entry", description: String(error), variant: "destructive" });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return await apiRequest("DELETE", `/api/timesheet-entries/${entryId}`, undefined);
    },
    onSuccess: () => {
      if (selectedTimesheet) {
        queryClient.invalidateQueries({ queryKey: ["/api/timesheets", selectedTimesheet.id, "entries"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({ title: "Entry deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete entry", description: String(error), variant: "destructive" });
    },
  });

  const handleViewTimesheet = (timesheet: TimesheetWithDetails) => {
    setSelectedTimesheet(timesheet);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Time & Attendance
          </h1>
          <p className="text-muted-foreground">
            Track your hours, clock in/out, and manage timesheets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={goToPreviousWeek}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={goToToday}
            data-testid="button-today"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={goToNextWeek}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium ml-2" data-testid="text-week-range">
            {weekRangeDisplay}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Hours This Week"
          value={formatHours(totalHoursThisWeek)}
          icon={Clock}
          description="Hours worked"
          isLoading={timesheetsLoading}
        />
        <SummaryCard
          title="Regular Hours"
          value={formatHours(regularHoursThisWeek)}
          icon={CalendarCheck}
          variant="success"
          description="Standard time"
          isLoading={timesheetsLoading}
        />
        <SummaryCard
          title="Overtime Hours"
          value={formatHours(overtimeHoursThisWeek)}
          icon={AlertCircle}
          variant={overtimeHoursThisWeek > 0 ? "warning" : "default"}
          description="Extra hours"
          isLoading={timesheetsLoading}
        />
        <SummaryCard
          title="Pending Approval"
          value={pendingApprovalCount}
          icon={FileCheck}
          description={isAdmin ? "Timesheets to review" : "Your submissions"}
          isLoading={pendingLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>Timesheets</CardTitle>
                <CardDescription>Manage your time tracking</CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-timesheet">
                <Plus className="h-4 w-4 mr-2" />
                New Timesheet
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 flex-wrap">
                  <TabsTrigger value="my-timesheets" data-testid="tab-my-timesheets">
                    My Timesheets
                  </TabsTrigger>
                  <TabsTrigger value="current-week" data-testid="tab-current-week">
                    Current Week
                  </TabsTrigger>
                  <TabsTrigger value="entries" data-testid="tab-entries">
                    Entries
                  </TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="pending-approval" data-testid="tab-pending-approval">
                      Pending Approval ({pendingApprovalCount})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="my-timesheets">
                  <TimesheetListTable
                    timesheets={timesheets || []}
                    isLoading={timesheetsLoading}
                    onView={handleViewTimesheet}
                    onSubmit={(id) => submitTimesheetMutation.mutate(id)}
                  />
                </TabsContent>

                <TabsContent value="current-week">
                  {currentWeekTimesheet ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{weekRangeDisplay}</p>
                          <p className="text-sm text-muted-foreground">
                            {currentWeekTimesheet.project?.name || "General"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {getTimesheetStatusBadge(currentWeekTimesheet.status)}
                          <Button 
                            variant="outline"
                            onClick={() => handleViewTimesheet(currentWeekTimesheet)}
                            data-testid="button-view-current"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                      <EntriesTable
                        entries={currentWeekEntries}
                        isLoading={entriesLoading}
                        readonly
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No timesheet for this week</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        Create Timesheet
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="entries">
                  <EntriesTable
                    entries={timesheets?.flatMap(t => t.entries || []) || []}
                    isLoading={timesheetsLoading}
                    readonly
                  />
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="pending-approval">
                    <PendingApprovalTable
                      timesheets={pendingTimesheets || []}
                      isLoading={pendingLoading}
                      onApprove={(id) => approveTimesheetMutation.mutate(id)}
                      onReject={(id, reason) => rejectTimesheetMutation.mutate({ timesheetId: id, reason })}
                      onView={handleViewTimesheet}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <ClockInOutCard
            currentEntry={currentEntry}
            currentTimesheet={currentWeekTimesheet || null}
            isLoading={timesheetsLoading}
            onClockIn={(location) => {
              if (currentWeekTimesheet) {
                clockInMutation.mutate({ timesheetId: currentWeekTimesheet.id, location });
              }
            }}
            onClockOut={(entryId) => clockOutMutation.mutate(entryId)}
          />
        </div>
      </div>

      <CreateTimesheetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projects={projects || []}
        onCreate={(data) => createTimesheetMutation.mutate(data)}
      />

      <ViewTimesheetDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) setSelectedTimesheet(null);
        }}
        timesheet={selectedTimesheet}
        entries={selectedEntries || []}
        isLoading={entriesLoading}
        onAddEntry={(data) => {
          if (selectedTimesheet) {
            addEntryMutation.mutate({ timesheetId: selectedTimesheet.id, data });
          }
        }}
        onEditEntry={(entryId, data) => {
          console.log("Edit entry:", entryId, data);
        }}
        onDeleteEntry={(entryId) => deleteEntryMutation.mutate(entryId)}
        onSubmit={() => {
          if (selectedTimesheet) {
            submitTimesheetMutation.mutate(selectedTimesheet.id);
            setViewDialogOpen(false);
          }
        }}
      />
    </div>
  );
}
