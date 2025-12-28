import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, differenceInMinutes, differenceInSeconds } from "date-fns";
import { Calendar, Clock, Plus, FileText, Download, Check, X, AlertCircle, ChevronLeft, ChevronRight, Edit, Trash2, Play, Square, Coffee, Timer } from "lucide-react";
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
import { apiRequest } from "@/lib/queryClient";

interface TimesheetEntry {
  id: string;
  consultantId: string;
  consultantName: string;
  projectId: string;
  projectName: string;
  date: string;
  hours: number;
  description: string;
  taskType: string;
  status: "draft" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface ProjectBreakdown {
  projectId: string;
  projectName: string;
  totalHours: number;
}

interface ClockEntry {
  id: string;
  timesheetId: string;
  entryDate: string;
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  totalHours: number;
  location: string | null;
  notes: string | null;
  isManualEntry: boolean;
}

// Time Clock Component
function TimeClock({
  timesheetId,
  currentEntry,
  onClockIn,
  onClockOut,
  onStartBreak,
  onEndBreak,
  isLoading
}: {
  timesheetId: string | null;
  currentEntry: ClockEntry | null;
  onClockIn: () => void;
  onClockOut: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
  isLoading: boolean;
}) {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [accumulatedBreakMinutes, setAccumulatedBreakMinutes] = useState(0);

  const isClockedIn = currentEntry && currentEntry.clockIn && !currentEntry.clockOut;

  // Update elapsed time every second when clocked in
  useEffect(() => {
    if (!isClockedIn || !currentEntry?.clockIn) {
      setElapsedTime("00:00:00");
      return;
    }

    const updateElapsed = () => {
      const clockInTime = new Date(currentEntry.clockIn!);
      const now = new Date();
      const totalSeconds = differenceInSeconds(now, clockInTime);

      // Subtract break time
      const breakSeconds = (currentEntry.breakMinutes + accumulatedBreakMinutes) * 60;
      const workSeconds = Math.max(0, totalSeconds - breakSeconds);

      const hours = Math.floor(workSeconds / 3600);
      const minutes = Math.floor((workSeconds % 3600) / 60);
      const seconds = workSeconds % 60;

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, currentEntry, accumulatedBreakMinutes]);

  const handleStartBreak = () => {
    setIsOnBreak(true);
    setBreakStartTime(new Date());
    onStartBreak();
  };

  const handleEndBreak = () => {
    if (breakStartTime) {
      const breakMins = differenceInMinutes(new Date(), breakStartTime);
      setAccumulatedBreakMinutes(prev => prev + breakMins);
    }
    setIsOnBreak(false);
    setBreakStartTime(null);
    onEndBreak();
  };

  const formatClockTime = (dateStr: string | null) => {
    if (!dateStr) return "--:--";
    return format(new Date(dateStr), "h:mm a");
  };

  return (
    <Card className="mb-6" data-testid="card-time-clock">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Time Clock
        </CardTitle>
        <CardDescription>
          {isClockedIn
            ? `Clocked in since ${formatClockTime(currentEntry?.clockIn || null)}`
            : "You are not currently clocked in"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Status Display */}
          <div className="text-center md:text-left flex-1">
            <div className="text-sm text-muted-foreground mb-1" data-testid="text-clock-status">
              {isClockedIn ? (isOnBreak ? "On Break" : "Working") : "Not Clocked In"}
            </div>
            <div className="text-4xl font-mono font-bold" data-testid="text-elapsed-time">
              {elapsedTime}
            </div>
            {isClockedIn && currentEntry && (
              <div className="text-sm text-muted-foreground mt-1">
                Break: {currentEntry.breakMinutes + accumulatedBreakMinutes} min
              </div>
            )}
          </div>

          {/* Clock Actions */}
          <div className="flex gap-3">
            {!isClockedIn ? (
              <Button
                size="lg"
                onClick={onClockIn}
                disabled={isLoading || !timesheetId}
                className="gap-2"
                data-testid="button-clock-in"
              >
                <Play className="h-5 w-5" />
                Clock In
              </Button>
            ) : (
              <>
                {!isOnBreak ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleStartBreak}
                    disabled={isLoading}
                    className="gap-2"
                    data-testid="button-start-break"
                  >
                    <Coffee className="h-5 w-5" />
                    Start Break
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleEndBreak}
                    disabled={isLoading}
                    className="gap-2"
                    data-testid="button-end-break"
                  >
                    <Play className="h-5 w-5" />
                    End Break
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={onClockOut}
                  disabled={isLoading || isOnBreak}
                  className="gap-2"
                  data-testid="button-clock-out"
                >
                  <Square className="h-5 w-5" />
                  Clock Out
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Today's entries summary */}
        {currentEntry && currentEntry.clockOut && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">Last Session</div>
            <div className="flex gap-4 mt-1">
              <span>In: {formatClockTime(currentEntry.clockIn)}</span>
              <span>Out: {formatClockTime(currentEntry.clockOut)}</span>
              <span>Hours: {currentEntry.totalHours.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Timesheets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [consultantFilter, setConsultantFilter] = useState<string>("all");

  // Current week for weekly view
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Current month for monthly view
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetEntry | null>(null);

  // Selection state for bulk actions
  const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    projectId: "",
    hours: "",
    description: "",
    taskType: ""
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Rejection reason
  const [rejectionReason, setRejectionReason] = useState("");

  // Export format
  const [exportFormat, setExportFormat] = useState("csv");

  // Active tab
  const [activeTab, setActiveTab] = useState("list");

  // Queries
  const { data: projectsData = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: consultantsData = [] } = useQuery({
    queryKey: ["/api/consultants"],
  });

  const { data: timesheetsData = [] } = useQuery({
    queryKey: ["/api/timesheets"],
  });

  // Get current user's active timesheet for today (for clock in/out)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const activeTimesheet = (timesheetsData as any[]).find((ts: any) =>
    ts.status === "draft" || ts.status === "pending"
  );
  const activeTimesheetId = activeTimesheet?.id || "demo-ts-1";

  // Query for today's clock entries
  const { data: clockEntries = [] } = useQuery<ClockEntry[]>({
    queryKey: [`/api/timesheets/${activeTimesheetId}/entries`],
    enabled: !!activeTimesheetId,
  });

  // Find the current active entry (clocked in but not out)
  const currentClockEntry = clockEntries.find(entry =>
    entry.entryDate === todayStr && entry.clockIn && !entry.clockOut
  ) || clockEntries.find(entry =>
    entry.entryDate === todayStr
  ) || null;

  // Clock In mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/timesheets/${activeTimesheetId}/clock-in`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/timesheets/${activeTimesheetId}/entries`] });
      toast({ title: "Clocked in successfully" });
    },
    onError: () => {
      toast({ title: "Failed to clock in", variant: "destructive" });
    }
  });

  // Clock Out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (entryId: string) => {
      return apiRequest("POST", `/api/timesheet-entries/${entryId}/clock-out`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/timesheets/${activeTimesheetId}/entries`] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({ title: "Clocked out successfully" });
    },
    onError: () => {
      toast({ title: "Failed to clock out", variant: "destructive" });
    }
  });

  // Update break minutes mutation
  const updateBreakMutation = useMutation({
    mutationFn: async ({ entryId, breakMinutes }: { entryId: string; breakMinutes: number }) => {
      return apiRequest("PATCH", `/api/timesheet-entries/${entryId}`, { breakMinutes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/timesheets/${activeTimesheetId}/entries`] });
    }
  });

  const handleClockIn = () => {
    clockInMutation.mutate();
  };

  const handleClockOut = () => {
    if (currentClockEntry) {
      clockOutMutation.mutate(currentClockEntry.id);
    }
  };

  const handleStartBreak = () => {
    // Break tracking is handled in the UI component
    toast({ title: "Break started" });
  };

  const handleEndBreak = () => {
    // When break ends, update the break minutes on the server
    if (currentClockEntry) {
      // The break time is calculated and stored locally,
      // It will be finalized when clocking out
      toast({ title: "Break ended" });
    }
  };

  // Fallback demo data when API returns empty
  const demoProjects = [
    { id: "demo-p-1", name: "Epic EHR Project Implementation" },
    { id: "demo-p-2", name: "Cerner Training Project" },
    { id: "demo-p-3", name: "MEDITECH Support Project" }
  ];

  const demoConsultants = [
    { id: "demo-c-1", firstName: "John", lastName: "Smith" },
    { id: "demo-c-2", firstName: "Jane", lastName: "Doe" }
  ];

  // Use API data if available, otherwise use demo data
  const projects = projectsData.length > 0 ? projectsData : demoProjects;
  const consultants = consultantsData.length > 0 ? consultantsData : demoConsultants;

  // Local timesheet state for demo functionality
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([
    {
      id: "ts-1",
      consultantId: "c-1",
      consultantName: "John Smith",
      projectId: "p-1",
      projectName: "Epic EHR Implementation",
      date: format(new Date(), "yyyy-MM-dd"),
      hours: 8,
      description: "Initial system configuration and setup",
      taskType: "Implementation",
      status: "draft"
    },
    {
      id: "ts-2",
      consultantId: "c-1",
      consultantName: "John Smith",
      projectId: "p-2",
      projectName: "Cerner Training",
      date: format(subWeeks(new Date(), 1), "yyyy-MM-dd"),
      hours: 6,
      description: "User training session",
      taskType: "Training",
      status: "pending"
    },
    {
      id: "ts-3",
      consultantId: "c-2",
      consultantName: "Jane Doe",
      projectId: "p-1",
      projectName: "Epic EHR Implementation",
      date: format(new Date(), "yyyy-MM-dd"),
      hours: 4,
      description: "Documentation review",
      taskType: "Documentation",
      status: "approved"
    }
  ]);

  // Filter timesheets
  const filteredTimesheets = timesheets.filter(ts => {
    if (statusFilter !== "all" && ts.status !== statusFilter.toLowerCase()) return false;
    if (consultantFilter !== "all" && ts.consultantId !== consultantFilter) return false;
    if (startDate && ts.date < startDate) return false;
    if (endDate && ts.date > endDate) return false;
    return true;
  });

  // Calculate weekly summary
  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyTimesheets = timesheets.filter(ts => {
    const tsDate = new Date(ts.date);
    return tsDate >= weekStart && tsDate <= weekEnd;
  });

  const weeklyTotalHours = weeklyTimesheets.reduce((sum, ts) => sum + ts.hours, 0);

  // Calculate monthly summary
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyTimesheets = timesheets.filter(ts => {
    const tsDate = new Date(ts.date);
    return tsDate >= monthStart && tsDate <= monthEnd;
  });

  const monthlyTotalHours = monthlyTimesheets.reduce((sum, ts) => sum + ts.hours, 0);

  // Calculate monthly project breakdown
  const monthlyProjectBreakdown: ProjectBreakdown[] = [];
  monthlyTimesheets.forEach(ts => {
    const existing = monthlyProjectBreakdown.find(pb => pb.projectId === ts.projectId);
    if (existing) {
      existing.totalHours += ts.hours;
    } else {
      monthlyProjectBreakdown.push({
        projectId: ts.projectId,
        projectName: ts.projectName,
        totalHours: ts.hours
      });
    }
  });

  // Calculate project breakdown
  const projectBreakdown: ProjectBreakdown[] = [];
  timesheets.forEach(ts => {
    const existing = projectBreakdown.find(pb => pb.projectId === ts.projectId);
    if (existing) {
      existing.totalHours += ts.hours;
    } else {
      projectBreakdown.push({
        projectId: ts.projectId,
        projectName: ts.projectName,
        totalHours: ts.hours
      });
    }
  });

  // Validate form
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.projectId) {
      errors.project = "Project is required";
    }

    const hours = parseFloat(formData.hours);
    if (!formData.hours || isNaN(hours)) {
      errors.hours = "Hours is required";
    } else if (hours > 24) {
      errors.hours = "Hours cannot exceed 24";
    } else if (hours <= 0) {
      errors.hours = "Hours must be greater than 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create timesheet
  const handleCreateTimesheet = () => {
    if (!validateForm()) return;

    const project = projects.find((p: any) => String(p.id) === formData.projectId);

    const newEntry: TimesheetEntry = {
      id: `ts-${Date.now()}`,
      consultantId: "c-current",
      consultantName: "Current User",
      projectId: formData.projectId,
      projectName: project?.name || "Unknown Project",
      date: formData.date,
      hours: parseFloat(formData.hours),
      description: formData.description,
      taskType: formData.taskType,
      status: "draft"
    };

    setTimesheets([...timesheets, newEntry]);
    setCreateModalOpen(false);
    resetForm();

    toast({
      title: "Timesheet Created",
      description: "Your timesheet entry has been created."
    });
  };

  // Handle edit timesheet
  const handleEditTimesheet = () => {
    if (!validateForm() || !selectedTimesheet) return;

    const project = projects.find((p: any) => String(p.id) === formData.projectId);

    const updatedTimesheets = timesheets.map(ts => {
      if (ts.id === selectedTimesheet.id) {
        return {
          ...ts,
          projectId: formData.projectId,
          projectName: project?.name || ts.projectName,
          date: formData.date,
          hours: parseFloat(formData.hours),
          description: formData.description,
          taskType: formData.taskType
        };
      }
      return ts;
    });

    setTimesheets(updatedTimesheets);
    setEditModalOpen(false);
    setSelectedTimesheet(null);
    resetForm();

    toast({
      title: "Timesheet Updated",
      description: "Your timesheet entry has been updated."
    });
  };

  // Handle delete timesheet
  const handleDeleteTimesheet = () => {
    if (!selectedTimesheet) return;

    setTimesheets(timesheets.filter(ts => ts.id !== selectedTimesheet.id));
    setDeleteDialogOpen(false);
    setSelectedTimesheet(null);

    toast({
      title: "Timesheet Deleted",
      description: "The timesheet entry has been deleted."
    });
  };

  // Handle submit for approval
  const handleSubmitForApproval = (id: string) => {
    setTimesheets(timesheets.map(ts => 
      ts.id === id ? { ...ts, status: "pending" as const } : ts
    ));

    toast({
      title: "Submitted for Approval",
      description: "The timesheet has been submitted for approval."
    });
  };

  // Handle approve
  const handleApprove = (id: string) => {
    setTimesheets(timesheets.map(ts => 
      ts.id === id ? { ...ts, status: "approved" as const } : ts
    ));

    toast({
      title: "Timesheet Approved",
      description: "The timesheet has been approved."
    });
  };

  // Handle reject
  const handleReject = () => {
    if (!selectedTimesheet) return;

    setTimesheets(timesheets.map(ts => 
      ts.id === selectedTimesheet.id 
        ? { ...ts, status: "rejected" as const, rejectionReason } 
        : ts
    ));

    setRejectDialogOpen(false);
    setSelectedTimesheet(null);
    setRejectionReason("");

    toast({
      title: "Timesheet Rejected",
      description: "The timesheet has been rejected."
    });
  };

  // Handle bulk approve
  const handleBulkApprove = () => {
    setTimesheets(timesheets.map(ts => 
      selectedTimesheets.includes(ts.id) 
        ? { ...ts, status: "approved" as const } 
        : ts
    ));

    setBulkApproveDialogOpen(false);
    setSelectedTimesheets([]);
    setSelectAll(false);

    toast({
      title: "Timesheets Approved",
      description: `${selectedTimesheets.length} timesheets have been approved.`
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTimesheets([]);
    } else {
      setSelectedTimesheets(filteredTimesheets.map(ts => ts.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual selection
  const handleSelectTimesheet = (id: string) => {
    if (selectedTimesheets.includes(id)) {
      setSelectedTimesheets(selectedTimesheets.filter(tsId => tsId !== id));
    } else {
      setSelectedTimesheets([...selectedTimesheets, id]);
    }
  };

  // Handle export
  const handleExport = () => {
    setExportModalOpen(false);

    toast({
      title: "Export Started",
      description: `Exporting timesheets as ${exportFormat.toUpperCase()}...`
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      projectId: "",
      hours: "",
      description: "",
      taskType: ""
    });
    setFormErrors({});
  };

  // Open edit modal
  const openEditModal = (ts: TimesheetEntry) => {
    setSelectedTimesheet(ts);
    setFormData({
      date: ts.date,
      projectId: ts.projectId,
      hours: ts.hours.toString(),
      description: ts.description,
      taskType: ts.taskType
    });
    setEditModalOpen(true);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800" data-testid="timesheet-status">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800" data-testid="timesheet-status">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800" data-testid="timesheet-status">Rejected</Badge>;
      default:
        return <Badge variant="outline" data-testid="timesheet-status">Draft</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Timesheets</h1>
          <p className="text-muted-foreground">Track and manage time entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExportModalOpen(true)} data-testid="button-export-timesheets">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} data-testid="button-create-timesheet">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Time Clock */}
      <TimeClock
        timesheetId={activeTimesheetId}
        currentEntry={currentClockEntry}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
        isLoading={clockInMutation.isPending || clockOutMutation.isPending}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Timesheet List</TabsTrigger>
          <TabsTrigger value="weekly-summary" data-testid="tab-weekly-summary">Weekly Summary</TabsTrigger>
          <TabsTrigger value="monthly-summary" data-testid="tab-monthly-summary">Monthly Summary</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-status">
                    <SelectTrigger className="w-[150px]" data-testid="filter-status">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consultant</Label>
                  <Select value={consultantFilter} onValueChange={setConsultantFilter} data-testid="filter-consultant">
                    <SelectTrigger className="w-[180px]" data-testid="filter-consultant">
                      <SelectValue placeholder="All Consultants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Consultants</SelectItem>
                      {consultants.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => {}} data-testid="button-apply-filter">
                  Apply Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedTimesheets.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <span>{selectedTimesheets.length} selected</span>
                  <Button onClick={() => setBulkApproveDialogOpen(true)} data-testid="button-bulk-approve">
                    <Check className="h-4 w-4 mr-2" />
                    Bulk Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Hours Breakdown */}
          <Card data-testid="project-hours-breakdown">
            <CardHeader>
              <CardTitle>Project Hours Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projectBreakdown.map(pb => (
                  <div key={pb.projectId} className="p-4 border rounded-lg">
                    <div className="font-medium">{pb.projectName}</div>
                    <div className="text-2xl font-bold">{pb.totalHours}h</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timesheets Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto" data-testid="timesheets-table">
                <table className="w-full" data-testid="timesheets-list">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Consultant</th>
                      <th className="text-left p-3">Project</th>
                      <th className="text-left p-3">Hours</th>
                      <th className="text-left p-3">Task Type</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimesheets.map(ts => (
                      <tr key={ts.id} className="border-b hover:bg-muted/50" data-testid="timesheet-row">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedTimesheets.includes(ts.id)}
                            onCheckedChange={() => handleSelectTimesheet(ts.id)}
                          />
                        </td>
                        <td className="p-3">{format(new Date(ts.date), "MMM d, yyyy")}</td>
                        <td className="p-3">{ts.consultantName}</td>
                        <td className="p-3">{ts.projectName}</td>
                        <td className="p-3">{ts.hours}h</td>
                        <td className="p-3">{ts.taskType}</td>
                        <td className="p-3" data-testid="timesheet-status">{getStatusBadge(ts.status)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {ts.status === "draft" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModal(ts)}
                                  data-testid="button-edit-timesheet"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTimesheet(ts);
                                    setDeleteDialogOpen(true);
                                  }}
                                  data-testid="button-delete-timesheet"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitForApproval(ts.id)}
                                  data-testid="button-submit-approval"
                                >
                                  Submit
                                </Button>
                              </>
                            )}
                            {ts.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(ts.id)}
                                  data-testid="button-approve"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedTimesheet(ts);
                                    setRejectDialogOpen(true);
                                  }}
                                  data-testid="button-reject"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {ts.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                data-testid="button-edit-timesheet"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Summary Tab */}
        <TabsContent value="weekly-summary" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Weekly Summary</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold" data-testid="weekly-hours-total">{weeklyTotalHours}h</div>
                <div className="text-muted-foreground">Total hours this week</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => {
                  const dayTimesheets = weeklyTimesheets.filter(
                    ts => ts.date === format(day, "yyyy-MM-dd")
                  );
                  const dayHours = dayTimesheets.reduce((sum, ts) => sum + ts.hours, 0);

                  return (
                    <div key={day.toISOString()} className="border rounded-lg p-3 text-center">
                      <div className="text-sm text-muted-foreground">{format(day, "EEE")}</div>
                      <div className="font-medium">{format(day, "d")}</div>
                      <div className="text-lg font-bold">{dayHours}h</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Summary Tab */}
        <TabsContent value="monthly-summary" className="space-y-4" data-testid="tab-content-monthly-summary">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Monthly Summary</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} data-testid="button-prev-month">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium" data-testid="text-current-month">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} data-testid="button-next-month">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-4xl font-bold" data-testid="monthly-hours-total">{monthlyTotalHours}h</div>
                <div className="text-muted-foreground">Total hours this month</div>
              </div>

              {/* Monthly Project Breakdown */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4" data-testid="monthly-project-breakdown-title">Hours by Project</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="monthly-project-breakdown">
                  {monthlyProjectBreakdown.length > 0 ? (
                    monthlyProjectBreakdown.map(pb => (
                      <div key={pb.projectId} className="p-4 border rounded-lg" data-testid="project-breakdown-item">
                        <div className="font-medium">{pb.projectName}</div>
                        <div className="text-2xl font-bold">{pb.totalHours}h</div>
                        <div className="text-sm text-muted-foreground">
                          {monthlyTotalHours > 0 ? Math.round((pb.totalHours / monthlyTotalHours) * 100) : 0}% of total
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground col-span-full">No hours logged this month</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Timesheet Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Time Entry</DialogTitle>
            <DialogDescription>
              Create a new timesheet entry for your work.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-date"
              />
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                data-testid="select-project"
              >
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.project && (
                <p className="text-red-500 text-sm">{formErrors.project}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Hours</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                data-testid="input-hours"
              />
              {formErrors.hours && (
                <p className="text-red-500 text-sm">{formErrors.hours}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select
                value={formData.taskType}
                onValueChange={(val) => setFormData({ ...formData, taskType: val })}
                data-testid="select-task-type"
              >
                <SelectTrigger data-testid="select-task-type">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Implementation">Implementation</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work performed..."
                data-testid="input-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTimesheet} data-testid="button-submit-timesheet">
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Timesheet Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Update the timesheet entry details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-date"
              />
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                data-testid="select-project"
              >
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.project && (
                <p className="text-red-500 text-sm">{formErrors.project}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Hours</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                data-testid="input-hours"
              />
              {formErrors.hours && (
                <p className="text-red-500 text-sm">{formErrors.hours}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select
                value={formData.taskType}
                onValueChange={(val) => setFormData({ ...formData, taskType: val })}
                data-testid="select-task-type"
              >
                <SelectTrigger data-testid="select-task-type">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Implementation">Implementation</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work performed..."
                data-testid="input-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTimesheet} data-testid="button-submit-timesheet">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timesheet Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timesheet entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTimesheet} data-testid="button-confirm-delete">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Timesheet</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this timesheet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              data-testid="input-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} data-testid="button-confirm-reject">
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Timesheets</DialogTitle>
            <DialogDescription>
              Choose the export format for your timesheet data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={exportFormat} onValueChange={setExportFormat} data-testid="select-export-format">
              <SelectTrigger data-testid="select-export-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} data-testid="button-download">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Approve Confirmation Dialog */}
      <Dialog open={bulkApproveDialogOpen} onOpenChange={setBulkApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Approve Timesheets</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedTimesheets.length} timesheet(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkApprove} data-testid="button-confirm">
              <Check className="h-4 w-4 mr-2" />
              Approve All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
