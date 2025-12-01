import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Users, Briefcase, CheckCircle, XCircle, FileText, ArrowRightLeft, LogIn, LogOut, AlertCircle } from "lucide-react";
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

interface Shift {
  id: string;
  consultantId: string;
  consultantName: string;
  projectId: string;
  projectName: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  isRecurring: boolean;
  recurrence?: string;
  recurrenceEnd?: string;
}

interface Availability {
  id: string;
  consultantId: string;
  date: string;
  status: "available" | "unavailable" | "partial";
  slots: { time: string; available: boolean }[];
}

interface TimeOffRequest {
  id: string;
  consultantId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

interface SignInRecord {
  id: string;
  date: string;
  signInTime: string;
  signOutTime?: string;
  shiftId: string;
}

interface EODReport {
  id: string;
  date: string;
  accomplishments: string;
  challenges: string;
  tomorrowPlan: string;
  createdBy: string;
  createdAt: string;
}

interface HandoffNote {
  id: string;
  date: string;
  summary: string;
  outstandingItems: string;
  priority: "low" | "medium" | "high";
  createdBy: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export default function Schedules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // View state
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("schedule");

  // Filter state
  const [consultantFilter, setConsultantFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");

  // Modal state
  const [createShiftOpen, setCreateShiftOpen] = useState(false);
  const [deleteShiftOpen, setDeleteShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [timeOffModalOpen, setTimeOffModalOpen] = useState(false);
  const [eodModalOpen, setEodModalOpen] = useState(false);
  const [handoffModalOpen, setHandoffModalOpen] = useState(false);

  // Form state for create shift
  const [shiftForm, setShiftForm] = useState({
    consultantId: "",
    projectId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "regular",
    isRecurring: false,
    recurrence: "weekly",
    recurrenceEnd: ""
  });

  // Form state for time off
  const [timeOffForm, setTimeOffForm] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Form state for EOD report
  const [eodForm, setEodForm] = useState({
    accomplishments: "",
    challenges: "",
    tomorrowPlan: ""
  });

  // Form state for handoff note
  const [handoffForm, setHandoffForm] = useState({
    summary: "",
    outstandingItems: "",
    priority: "medium"
  });

  // Sign in/out state
  const [signedIn, setSignedIn] = useState(false);
  const [signInTime, setSignInTime] = useState<string | null>(null);
  const [signOutTime, setSignOutTime] = useState<string | null>(null);

  // Availability state
  const [selectedAvailabilityStatus, setSelectedAvailabilityStatus] = useState<string>("available");

  // Queries
  const { data: projectsData = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: consultantsData = [] } = useQuery({
    queryKey: ["/api/consultants"],
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["/api/hospitals"],
  });

  // Fallback demo data when API returns empty
  const demoProjects = [
    { id: "demo-p-1", name: "Epic EHR Project Implementation" },
    { id: "demo-p-2", name: "Cerner Training Project" },
    { id: "demo-p-3", name: "MEDITECH Support Project" }
  ];

  const demoConsultants = [
    { id: "demo-c-1", firstName: "Demo", lastName: "Consultant One" },
    { id: "demo-c-2", firstName: "Demo", lastName: "Consultant Two" }
  ];

  // Use API data if available, otherwise use demo data
  const projects: any[] = projectsData.length > 0 ? projectsData : demoProjects;
  const consultants: any[] = consultantsData.length > 0 ? consultantsData : demoConsultants;

  // Mock data for shifts (in real app, this would come from API)
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "shift-1",
      consultantId: "consultant-1",
      consultantName: "John Smith",
      projectId: "project-1",
      projectName: "Epic Implementation",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "17:00",
      shiftType: "regular",
      isRecurring: false
    }
  ]);

  // Mock sign-in records
  const [signInRecords, setSignInRecords] = useState<SignInRecord[]>([
    {
      id: "record-1",
      date: format(new Date(), "yyyy-MM-dd"),
      signInTime: "08:55",
      signOutTime: "17:05",
      shiftId: "shift-1"
    }
  ]);

  // Mock EOD reports
  const [eodReports, setEodReports] = useState<EODReport[]>([
    {
      id: "eod-1",
      date: format(new Date(), "yyyy-MM-dd"),
      accomplishments: "Completed user training session",
      challenges: "Network connectivity issues",
      tomorrowPlan: "Continue with phase 2 implementation",
      createdBy: "John Smith",
      createdAt: new Date().toISOString()
    }
  ]);

  // Mock handoff notes
  const [handoffNotes, setHandoffNotes] = useState<HandoffNote[]>([
    {
      id: "handoff-1",
      date: format(new Date(), "yyyy-MM-dd"),
      summary: "Completed morning rounds, all systems operational",
      outstandingItems: "Pending approval for software update",
      priority: "medium",
      createdBy: "John Smith",
      acknowledged: false
    }
  ]);

  // Mock availability
  const [availabilityGrid, setAvailabilityGrid] = useState<Availability[]>([]);

  // Navigation functions
  const navigateNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const navigatePrev = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  // Get days for current view
  const getViewDays = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // Filter shifts
  const filteredShifts = shifts.filter(shift => {
    if (consultantFilter && shift.consultantId !== consultantFilter) return false;
    if (projectFilter && shift.projectId !== projectFilter) return false;
    return true;
  });

  // Handle create shift
  const handleCreateShift = () => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      consultantId: shiftForm.consultantId,
      consultantName: consultants.find((c: any) => c.id === shiftForm.consultantId)?.firstName || "Unknown",
      projectId: shiftForm.projectId,
      projectName: projects.find((p: any) => p.id === shiftForm.projectId)?.name || "Unknown",
      date: shiftForm.date,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      shiftType: shiftForm.shiftType,
      isRecurring: shiftForm.isRecurring,
      recurrence: shiftForm.isRecurring ? shiftForm.recurrence : undefined,
      recurrenceEnd: shiftForm.isRecurring ? shiftForm.recurrenceEnd : undefined
    };

    setShifts([...shifts, newShift]);
    setCreateShiftOpen(false);
    setShiftForm({
      consultantId: "",
      projectId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "17:00",
      shiftType: "regular",
      isRecurring: false,
      recurrence: "weekly",
      recurrenceEnd: ""
    });

    toast({
      title: "Shift Created",
      description: "The shift has been successfully created."
    });
  };

  // Handle delete shift
  const handleDeleteShift = () => {
    if (selectedShift) {
      setShifts(shifts.filter(s => s.id !== selectedShift.id));
      setDeleteShiftOpen(false);
      setSelectedShift(null);

      toast({
        title: "Shift Deleted",
        description: "The shift has been successfully deleted."
      });
    }
  };

  // Handle sign in
  const handleSignIn = () => {
    const time = format(new Date(), "HH:mm");
    setSignInTime(time);
    setSignedIn(true);

    const newRecord: SignInRecord = {
      id: `record-${Date.now()}`,
      date: format(new Date(), "yyyy-MM-dd"),
      signInTime: time,
      shiftId: shifts[0]?.id || "unknown"
    };
    setSignInRecords([...signInRecords, newRecord]);

    toast({
      title: "Signed In",
      description: `You signed in at ${time}`
    });
  };

  // Handle sign out
  const handleSignOut = () => {
    const time = format(new Date(), "HH:mm");
    setSignOutTime(time);
    setSignedIn(false);

    // Update the last record with sign out time
    const updatedRecords = [...signInRecords];
    if (updatedRecords.length > 0) {
      updatedRecords[updatedRecords.length - 1].signOutTime = time;
    }
    setSignInRecords(updatedRecords);

    toast({
      title: "Signed Out",
      description: `You signed out at ${time}`
    });
  };

  // Handle save availability
  const handleSaveAvailability = () => {
    toast({
      title: "Availability Saved",
      description: "Your availability has been updated."
    });
  };

  // Handle time off request
  const handleSubmitTimeOff = () => {
    setTimeOffModalOpen(false);
    setTimeOffForm({ startDate: "", endDate: "", reason: "" });

    toast({
      title: "Time Off Requested",
      description: "Your time off request has been submitted for approval."
    });
  };

  // Handle EOD report submission
  const handleSubmitEod = () => {
    const newReport: EODReport = {
      id: `eod-${Date.now()}`,
      date: format(new Date(), "yyyy-MM-dd"),
      accomplishments: eodForm.accomplishments,
      challenges: eodForm.challenges,
      tomorrowPlan: eodForm.tomorrowPlan,
      createdBy: "Current User",
      createdAt: new Date().toISOString()
    };

    setEodReports([...eodReports, newReport]);
    setEodModalOpen(false);
    setEodForm({ accomplishments: "", challenges: "", tomorrowPlan: "" });

    toast({
      title: "EOD Report Submitted",
      description: "Your end of day report has been saved."
    });
  };

  // Handle handoff note submission
  const handleSubmitHandoff = () => {
    const newNote: HandoffNote = {
      id: `handoff-${Date.now()}`,
      date: format(new Date(), "yyyy-MM-dd"),
      summary: handoffForm.summary,
      outstandingItems: handoffForm.outstandingItems,
      priority: handoffForm.priority as "low" | "medium" | "high",
      createdBy: "Current User",
      acknowledged: false
    };

    setHandoffNotes([...handoffNotes, newNote]);
    setHandoffModalOpen(false);
    setHandoffForm({ summary: "", outstandingItems: "", priority: "medium" });

    toast({
      title: "Handoff Note Created",
      description: "Your shift handoff note has been saved."
    });
  };

  // Handle acknowledge handoff
  const handleAcknowledgeHandoff = (noteId: string) => {
    setHandoffNotes(handoffNotes.map(note => 
      note.id === noteId 
        ? { ...note, acknowledged: true, acknowledgedBy: "Current User" }
        : note
    ));

    toast({
      title: "Handoff Acknowledged",
      description: "You have acknowledged the handoff note."
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedules</h1>
          <p className="text-muted-foreground">Manage shifts, availability, and time tracking</p>
        </div>
        <Button onClick={() => setCreateShiftOpen(true)} data-testid="button-create-shift">
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="availability" data-testid="tab-availability">Availability</TabsTrigger>
          <TabsTrigger value="sign-in-history" data-testid="tab-sign-in-history">Sign-In History</TabsTrigger>
          <TabsTrigger value="eod-reports" data-testid="tab-eod-reports">EOD Reports</TabsTrigger>
          <TabsTrigger value="handoff-notes" data-testid="tab-handoff-notes">Handoff Notes</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          {/* View Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    onClick={() => setViewMode("week")}
                    data-testid="button-view-week"
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    onClick={() => setViewMode("month")}
                    data-testid="button-view-month"
                  >
                    Month
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={navigatePrev} data-testid="button-prev-week">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[200px] text-center">
                    {viewMode === "week" 
                      ? `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`
                      : format(currentDate, "MMMM yyyy")
                    }
                  </span>
                  <Button variant="outline" onClick={navigateNext} data-testid="button-next-week">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Select value={consultantFilter || "all"} onValueChange={(val) => setConsultantFilter(val === "all" ? "" : val)} data-testid="filter-consultant">
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

                  <Select value={projectFilter || "all"} onValueChange={(val) => setProjectFilter(val === "all" ? "" : val)} data-testid="filter-project">
                    <SelectTrigger className="w-[180px]" data-testid="filter-project">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Digital Sign-In/Out Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Digital Sign-In/Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleSignIn} 
                  data-testid="button-sign-in" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={signedIn}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignOut} 
                  data-testid="button-sign-out" 
                  variant="destructive"
                  disabled={!signedIn}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>

                {signInTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Signed in at:</span>
                    <Badge variant="outline" data-testid="sign-in-time">{signInTime}</Badge>
                  </div>
                )}

                {signOutTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Signed out at:</span>
                    <Badge variant="outline" data-testid="sign-out-time">{signOutTime}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card data-testid="schedule-calendar">
            <CardHeader>
              <CardTitle>Schedule Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === "week" ? (
                <div className="grid grid-cols-7 gap-2" data-testid="schedule-week-view">
                  {getViewDays().map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`border rounded-lg p-3 min-h-[150px] ${
                        isToday(day) ? "bg-blue-50 border-blue-300" : ""
                      }`}
                    >
                      <div className="font-medium text-sm mb-2">
                        {format(day, "EEE d")}
                      </div>
                      {filteredShifts
                        .filter(s => s.date === format(day, "yyyy-MM-dd"))
                        .map(shift => (
                          <div
                            key={shift.id}
                            className="bg-primary/10 rounded p-2 text-xs mb-1 cursor-pointer hover:bg-primary/20"
                            data-testid="shift-item"
                            onClick={() => setSelectedShift(shift)}
                          >
                            <div className="font-medium">{shift.consultantName}</div>
                            <div>{shift.startTime} - {shift.endTime}</div>
                            <div className="text-muted-foreground">{shift.projectName}</div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1" data-testid="schedule-month-view">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center font-medium p-2 text-sm">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="border rounded p-2 min-h-[80px] text-sm">
                      {i + 1 <= 31 && <span>{i + 1}</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Consultant Availability</CardTitle>
                <CardDescription>Set your availability for scheduling</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setTimeOffModalOpen(true)} data-testid="button-request-time-off">
                <Calendar className="h-4 w-4 mr-2" />
                Request Time Off
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Label>Set Status:</Label>
                  <Select 
                    value={selectedAvailabilityStatus} 
                    onValueChange={setSelectedAvailabilityStatus}
                    data-testid="select-availability-status"
                  >
                    <SelectTrigger className="w-[180px]" data-testid="select-availability-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                      <SelectItem value="partial">Partially Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-7 gap-2" data-testid="availability-grid">
                  {getViewDays().map((day) => (
                    <div
                      key={day.toISOString()}
                      className="border rounded-lg p-3"
                      data-testid="availability-slot"
                    >
                      <div className="font-medium text-sm mb-2">
                        {format(day, "EEE d")}
                      </div>
                      <div className="space-y-1">
                        {["9:00", "12:00", "15:00"].map(time => (
                          <div
                            key={time}
                            className="text-xs p-1 bg-green-100 rounded cursor-pointer hover:bg-green-200"
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAvailability} data-testid="button-save-availability">
                    Save Availability
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sign-In History Tab */}
        <TabsContent value="sign-in-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sign-In History</CardTitle>
              <CardDescription>View your past sign-in and sign-out records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2" data-testid="sign-in-records">
                {signInRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{record.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">In: {record.signInTime}</Badge>
                      {record.signOutTime && (
                        <Badge variant="outline">Out: {record.signOutTime}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EOD Reports Tab */}
        <TabsContent value="eod-reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>End of Day Reports</CardTitle>
                <CardDescription>Daily summary reports</CardDescription>
              </div>
              <Button onClick={() => setEodModalOpen(true)} data-testid="button-create-eod-report">
                <Plus className="h-4 w-4 mr-2" />
                Create EOD Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" data-testid="eod-reports-list">
                {eodReports.map(report => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 space-y-2"
                    data-testid="eod-report-item"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{report.date}</span>
                      <span className="text-sm text-muted-foreground">by {report.createdBy}</span>
                    </div>
                    <div className="text-sm" data-testid="eod-report-details">
                      <p><strong>Accomplishments:</strong> {report.accomplishments}</p>
                      <p><strong>Challenges:</strong> {report.challenges}</p>
                      <p><strong>Tomorrow:</strong> {report.tomorrowPlan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Handoff Notes Tab */}
        <TabsContent value="handoff-notes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shift Handoff Notes</CardTitle>
                <CardDescription>Notes for shift transitions</CardDescription>
              </div>
              <Button onClick={() => setHandoffModalOpen(true)} data-testid="button-create-handoff">
                <Plus className="h-4 w-4 mr-2" />
                Create Handoff Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" data-testid="handoff-notes-list">
                {handoffNotes.map(note => (
                  <div
                    key={note.id}
                    className="border rounded-lg p-4 space-y-2"
                    data-testid="handoff-note-item"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{note.date}</span>
                        <Badge variant={
                          note.priority === "high" ? "destructive" :
                          note.priority === "medium" ? "default" : "secondary"
                        }>
                          {note.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {note.acknowledged ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAcknowledgeHandoff(note.id)}
                            data-testid="button-acknowledge"
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p><strong>Summary:</strong> {note.summary}</p>
                      <p><strong>Outstanding Items:</strong> {note.outstandingItems}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Shift Modal */}
      <Dialog open={createShiftOpen} onOpenChange={setCreateShiftOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Shift</DialogTitle>
            <DialogDescription>Schedule a new shift</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="select-consultant">Consultant</Label>
              <Select 
                value={shiftForm.consultantId} 
                onValueChange={(v) => setShiftForm({...shiftForm, consultantId: v})}
              >
                <SelectTrigger data-testid="select-consultant">
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                  ))}
                  <SelectItem value="consultant-1">John Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="select-project">Project</Label>
              <Select 
                value={shiftForm.projectId} 
                onValueChange={(v) => setShiftForm({...shiftForm, projectId: v})}
              >
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                  <SelectItem value="project-1">Epic Implementation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="input-shift-date">Date</Label>
              <Input
                id="input-shift-date"
                type="date"
                value={shiftForm.date}
                onChange={(e) => setShiftForm({...shiftForm, date: e.target.value})}
                data-testid="input-shift-date"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="input-start-time">Start Time</Label>
                <Input
                  id="input-start-time"
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({...shiftForm, startTime: e.target.value})}
                  data-testid="input-start-time"
                />
              </div>
              <div>
                <Label htmlFor="input-end-time">End Time</Label>
                <Input
                  id="input-end-time"
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({...shiftForm, endTime: e.target.value})}
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="select-shift-type">Shift Type</Label>
              <Select 
                value={shiftForm.shiftType} 
                onValueChange={(v) => setShiftForm({...shiftForm, shiftType: v})}
              >
                <SelectTrigger data-testid="select-shift-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="overtime">Overtime</SelectItem>
                  <SelectItem value="on-call">On-Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="checkbox-recurring"
                checked={shiftForm.isRecurring}
                onCheckedChange={(checked) => setShiftForm({...shiftForm, isRecurring: checked as boolean})}
                data-testid="checkbox-recurring"
              />
              <Label htmlFor="checkbox-recurring">Recurring Shift</Label>
            </div>

            {shiftForm.isRecurring && (
              <>
                <div>
                  <Label htmlFor="select-recurrence">Recurrence Pattern</Label>
                  <Select 
                    value={shiftForm.recurrence} 
                    onValueChange={(v) => setShiftForm({...shiftForm, recurrence: v})}
                  >
                    <SelectTrigger data-testid="select-recurrence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="input-recurrence-end">Recurrence End Date</Label>
                  <Input
                    id="input-recurrence-end"
                    type="date"
                    value={shiftForm.recurrenceEnd}
                    onChange={(e) => setShiftForm({...shiftForm, recurrenceEnd: e.target.value})}
                    data-testid="input-recurrence-end"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateShiftOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateShift} data-testid="button-submit-shift">
              Create Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shift Modal */}
      <Dialog open={deleteShiftOpen} onOpenChange={setDeleteShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteShiftOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteShift} data-testid="button-confirm-delete">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Edit Dialog (shown when shift selected) */}
      {selectedShift && !deleteShiftOpen && (
        <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Shift</DialogTitle>
              <DialogDescription>Modify shift details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Consultant</Label>
                <Select
                  value={selectedShift.consultantId}
                  onValueChange={(val) => setSelectedShift({...selectedShift, consultantId: val})}
                  data-testid="select-consultant"
                >
                  <SelectTrigger data-testid="select-consultant">
                    <SelectValue placeholder="Select consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project</Label>
                <Select
                  value={selectedShift.projectId}
                  onValueChange={(val) => setSelectedShift({...selectedShift, projectId: val})}
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
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedShift.date}
                  onChange={(e) => setSelectedShift({...selectedShift, date: e.target.value})}
                  data-testid="input-shift-date"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={selectedShift.startTime}
                    onChange={(e) => setSelectedShift({...selectedShift, startTime: e.target.value})}
                    data-testid="input-start-time"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={selectedShift.endTime}
                    onChange={(e) => setSelectedShift({...selectedShift, endTime: e.target.value})}
                    data-testid="input-end-time"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setDeleteShiftOpen(true);
                }}
                data-testid="button-delete-shift"
              >
                Delete
              </Button>
              <Button 
                onClick={() => {
                  // Update the shift in the list
                  setShifts(shifts.map(s => s.id === selectedShift.id ? selectedShift : s));
                  setSelectedShift(null);
                  toast({
                    title: "Shift Updated",
                    description: "The shift has been successfully updated."
                  });
                }}
                data-testid="button-submit-shift"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Time Off Request Modal */}
      <Dialog open={timeOffModalOpen} onOpenChange={setTimeOffModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogDescription>Submit a time off request for approval</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="time-off-start">Start Date</Label>
              <Input
                id="time-off-start"
                type="date"
                value={timeOffForm.startDate}
                onChange={(e) => setTimeOffForm({...timeOffForm, startDate: e.target.value})}
                data-testid="input-start-date"
              />
            </div>
            <div>
              <Label htmlFor="time-off-end">End Date</Label>
              <Input
                id="time-off-end"
                type="date"
                value={timeOffForm.endDate}
                onChange={(e) => setTimeOffForm({...timeOffForm, endDate: e.target.value})}
                data-testid="input-end-date"
              />
            </div>
            <div>
              <Label htmlFor="time-off-reason">Reason</Label>
              <Textarea
                id="time-off-reason"
                value={timeOffForm.reason}
                onChange={(e) => setTimeOffForm({...timeOffForm, reason: e.target.value})}
                placeholder="Reason for time off request"
                data-testid="input-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeOffModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTimeOff} data-testid="button-submit-request">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EOD Report Modal */}
      <Dialog open={eodModalOpen} onOpenChange={setEodModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create EOD Report</DialogTitle>
            <DialogDescription>Submit your end of day summary</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eod-accomplishments">Accomplishments</Label>
              <Textarea
                id="eod-accomplishments"
                value={eodForm.accomplishments}
                onChange={(e) => setEodForm({...eodForm, accomplishments: e.target.value})}
                placeholder="What did you accomplish today?"
                data-testid="input-accomplishments"
              />
            </div>
            <div>
              <Label htmlFor="eod-challenges">Challenges</Label>
              <Textarea
                id="eod-challenges"
                value={eodForm.challenges}
                onChange={(e) => setEodForm({...eodForm, challenges: e.target.value})}
                placeholder="Any challenges or blockers?"
                data-testid="input-challenges"
              />
            </div>
            <div>
              <Label htmlFor="eod-tomorrow">Tomorrow's Plan</Label>
              <Textarea
                id="eod-tomorrow"
                value={eodForm.tomorrowPlan}
                onChange={(e) => setEodForm({...eodForm, tomorrowPlan: e.target.value})}
                placeholder="What's planned for tomorrow?"
                data-testid="input-tomorrow-plan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEodModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEod} data-testid="button-submit-eod">
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handoff Note Modal */}
      <Dialog open={handoffModalOpen} onOpenChange={setHandoffModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Handoff Note</DialogTitle>
            <DialogDescription>Document shift transition information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="handoff-summary">Summary</Label>
              <Textarea
                id="handoff-summary"
                value={handoffForm.summary}
                onChange={(e) => setHandoffForm({...handoffForm, summary: e.target.value})}
                placeholder="Brief summary of shift status"
                data-testid="input-handoff-summary"
              />
            </div>
            <div>
              <Label htmlFor="handoff-outstanding">Outstanding Items</Label>
              <Textarea
                id="handoff-outstanding"
                value={handoffForm.outstandingItems}
                onChange={(e) => setHandoffForm({...handoffForm, outstandingItems: e.target.value})}
                placeholder="Items that need attention"
                data-testid="input-outstanding-items"
              />
            </div>
            <div>
              <Label htmlFor="handoff-priority">Priority</Label>
              <Select 
                value={handoffForm.priority} 
                onValueChange={(v) => setHandoffForm({...handoffForm, priority: v})}
              >
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandoffModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitHandoff} data-testid="button-submit-handoff">
              Create Handoff Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
