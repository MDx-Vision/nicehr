import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO
} from "date-fns";
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  CalendarCheck,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import type { AvailabilityBlock, Consultant } from "@shared/schema";
import { cn } from "@/lib/utils";

const AVAILABILITY_TYPES = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "unavailable", label: "Blocked", color: "bg-red-500" },
  { value: "vacation", label: "On Leave", color: "bg-gray-500" },
  { value: "sick", label: "Sick", color: "bg-orange-500" },
  { value: "training", label: "Training", color: "bg-blue-500" },
  { value: "other", label: "Tentative", color: "bg-yellow-500" },
] as const;

const RECURRING_PATTERNS = [
  { value: "none", label: "None (One-time)" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

function getTypeConfig(type: string) {
  return AVAILABILITY_TYPES.find(t => t.value === type) || AVAILABILITY_TYPES[0];
}

function AvailabilityTypeBadge({ type }: { type: string }) {
  const config = getTypeConfig(type);
  return (
    <Badge 
      className={cn("text-white", config.color)}
      data-testid={`badge-type-${type}`}
    >
      {config.label}
    </Badge>
  );
}

interface AvailabilityFormData {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  type: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurringPattern: string;
  title: string;
  notes: string;
}

const defaultFormData: AvailabilityFormData = {
  startDate: undefined,
  endDate: undefined,
  startTime: "09:00",
  endTime: "17:00",
  type: "available",
  isAllDay: true,
  isRecurring: false,
  recurringPattern: "none",
  title: "",
  notes: "",
};

function AvailabilityDialog({
  open,
  onOpenChange,
  editingBlock,
  selectedDate,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBlock: AvailabilityBlock | null;
  selectedDate: Date | null;
  onSave: (data: AvailabilityFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<AvailabilityFormData>(defaultFormData);

  useState(() => {
    if (editingBlock) {
      setFormData({
        startDate: editingBlock.startDate ? parseISO(editingBlock.startDate) : undefined,
        endDate: editingBlock.endDate ? parseISO(editingBlock.endDate) : undefined,
        startTime: editingBlock.startTime || "09:00",
        endTime: editingBlock.endTime || "17:00",
        type: editingBlock.type || "available",
        isAllDay: editingBlock.isAllDay ?? true,
        isRecurring: editingBlock.isRecurring ?? false,
        recurringPattern: editingBlock.recurringPattern || "none",
        title: editingBlock.title || "",
        notes: editingBlock.notes || "",
      });
    } else if (selectedDate) {
      setFormData({
        ...defaultFormData,
        startDate: selectedDate,
        endDate: selectedDate,
      });
    } else {
      setFormData(defaultFormData);
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData(defaultFormData);
    } else {
      if (editingBlock) {
        setFormData({
          startDate: editingBlock.startDate ? parseISO(editingBlock.startDate) : undefined,
          endDate: editingBlock.endDate ? parseISO(editingBlock.endDate) : undefined,
          startTime: editingBlock.startTime || "09:00",
          endTime: editingBlock.endTime || "17:00",
          type: editingBlock.type || "available",
          isAllDay: editingBlock.isAllDay ?? true,
          isRecurring: editingBlock.isRecurring ?? false,
          recurringPattern: editingBlock.recurringPattern || "none",
          title: editingBlock.title || "",
          notes: editingBlock.notes || "",
        });
      } else if (selectedDate) {
        setFormData({
          ...defaultFormData,
          startDate: selectedDate,
          endDate: selectedDate,
        });
      }
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-availability">
        <DialogHeader>
          <DialogTitle>
            {editingBlock ? "Edit Availability" : "Add Availability"}
          </DialogTitle>
          <DialogDescription>
            {editingBlock 
              ? "Update your availability block details"
              : "Set your available hours for the selected date(s)"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Morning Shift, Remote Work"
              data-testid="input-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                    data-testid="button-start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      setFormData({ 
                        ...formData, 
                        startDate: date,
                        endDate: formData.endDate && date && date > formData.endDate 
                          ? date 
                          : formData.endDate
                      });
                    }}
                    data-testid="calendar-start-date"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                    data-testid="button-end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                    disabled={(date) => formData.startDate ? date < formData.startDate : false}
                    data-testid="calendar-end-date"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              checked={formData.isAllDay}
              onCheckedChange={(checked) => setFormData({ ...formData, isAllDay: checked })}
              data-testid="switch-all-day"
            />
            <Label htmlFor="all-day">All Day</Label>
          </div>

          {!formData.isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  data-testid="input-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  data-testid="input-end-time"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Availability Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger data-testid="select-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", type.color)} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                isRecurring: checked,
                recurringPattern: checked ? "weekly" : "none"
              })}
              data-testid="switch-recurring"
            />
            <Label htmlFor="recurring">Recurring</Label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurring-pattern">Recurring Pattern</Label>
              <Select
                value={formData.recurringPattern}
                onValueChange={(value) => setFormData({ ...formData, recurringPattern: value })}
              >
                <SelectTrigger data-testid="select-recurring-pattern">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {RECURRING_PATTERNS.filter(p => p.value !== "none").map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.startDate || !formData.endDate}
              data-testid="button-save"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MonthCalendar({
  currentMonth,
  availabilityBlocks,
  onDateClick,
  onPrevMonth,
  onNextMonth,
}: {
  currentMonth: Date;
  availabilityBlocks: AvailabilityBlock[];
  onDateClick: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getBlocksForDay = (day: Date) => {
    return availabilityBlocks.filter((block) => {
      const startDate = parseISO(block.startDate);
      const endDate = parseISO(block.endDate);
      return isWithinInterval(day, { start: startDate, end: endDate }) ||
             isSameDay(day, startDate) ||
             isSameDay(day, endDate);
    });
  };

  return (
    <Card data-testid="card-calendar">
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap pb-2">
        <CardTitle className="text-lg">
          {format(currentMonth, "MMMM yyyy")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const blocks = getBlocksForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={index}
                onClick={() => onDateClick(day)}
                className={cn(
                  "min-h-[80px] p-1 text-left border rounded-md hover-elevate transition-colors",
                  !isCurrentMonth && "opacity-40",
                  isToday && "ring-2 ring-primary"
                )}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {blocks.slice(0, 3).map((block) => {
                    const config = getTypeConfig(block.type);
                    return (
                      <div
                        key={block.id}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded text-white truncate",
                          config.color
                        )}
                        title={block.title || config.label}
                      >
                        {block.title || config.label}
                      </div>
                    );
                  })}
                  {blocks.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{blocks.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingAvailabilityList({
  availabilityBlocks,
  onEdit,
  onDelete,
  isDeleting,
}: {
  availabilityBlocks: AvailabilityBlock[];
  onEdit: (block: AvailabilityBlock) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const today = new Date();
  const twoWeeksFromNow = addDays(today, 14);

  const upcomingBlocks = useMemo(() => {
    return availabilityBlocks
      .filter((block) => {
        const endDate = parseISO(block.endDate);
        return endDate >= today;
      })
      .filter((block) => {
        const startDate = parseISO(block.startDate);
        return startDate <= twoWeeksFromNow;
      })
      .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [availabilityBlocks]);

  return (
    <Card data-testid="card-upcoming">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarCheck className="h-5 w-5" />
          Upcoming Availability
        </CardTitle>
        <CardDescription>
          Next 2 weeks of availability blocks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingBlocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming availability</p>
            <p className="text-sm">Add your first availability block to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-start justify-between gap-3 p-3 border rounded-md hover-elevate"
                data-testid={`availability-item-${block.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <AvailabilityTypeBadge type={block.type} />
                    {block.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {block.recurringPattern}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {block.title || getTypeConfig(block.type).label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(block.startDate), "MMM d, yyyy")}
                    {block.startDate !== block.endDate && (
                      <> - {format(parseISO(block.endDate), "MMM d, yyyy")}</>
                    )}
                  </div>
                  {!block.isAllDay && block.startTime && block.endTime && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {block.startTime} - {block.endTime}
                    </div>
                  )}
                  {block.notes && (
                    <div className="text-sm text-muted-foreground mt-1 truncate">
                      {block.notes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(block)}
                    data-testid={`button-edit-${block.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(block.id)}
                    disabled={isDeleting}
                    data-testid={`button-delete-${block.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecurringPatternsSection({
  availabilityBlocks,
  onEdit,
}: {
  availabilityBlocks: AvailabilityBlock[];
  onEdit: (block: AvailabilityBlock) => void;
}) {
  const recurringBlocks = useMemo(() => {
    return availabilityBlocks.filter((block) => block.isRecurring);
  }, [availabilityBlocks]);

  if (recurringBlocks.length === 0) {
    return null;
  }

  return (
    <Card data-testid="card-recurring">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="h-5 w-5" />
          Recurring Patterns
        </CardTitle>
        <CardDescription>
          Your active recurring availability patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recurringBlocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between gap-3 p-3 border rounded-md hover-elevate cursor-pointer"
              onClick={() => onEdit(block)}
              data-testid={`recurring-pattern-${block.id}`}
            >
              <div className="flex items-center gap-3">
                <AvailabilityTypeBadge type={block.type} />
                <div>
                  <div className="text-sm font-medium">
                    {block.title || getTypeConfig(block.type).label}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {block.recurringPattern} pattern
                  </div>
                </div>
              </div>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Availability() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<AvailabilityBlock | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: consultant, isLoading: consultantLoading } = useQuery<Consultant>({
    queryKey: ["/api/consultants/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: availabilityBlocks = [], isLoading: blocksLoading } = useQuery<AvailabilityBlock[]>({
    queryKey: ["/api/availability"],
    enabled: !!consultant?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: AvailabilityFormData) => {
      const payload = {
        startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
        endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : null,
        startTime: data.isAllDay ? null : data.startTime,
        endTime: data.isAllDay ? null : data.endTime,
        type: data.type,
        isAllDay: data.isAllDay,
        isRecurring: data.isRecurring,
        recurringPattern: data.isRecurring ? data.recurringPattern : null,
        title: data.title || null,
        notes: data.notes || null,
      };
      await apiRequest("POST", "/api/availability", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Availability Added",
        description: "Your availability has been saved successfully.",
      });
      setDialogOpen(false);
      setEditingBlock(null);
      setSelectedDate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AvailabilityFormData }) => {
      const payload = {
        startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
        endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : null,
        startTime: data.isAllDay ? null : data.startTime,
        endTime: data.isAllDay ? null : data.endTime,
        type: data.type,
        isAllDay: data.isAllDay,
        isRecurring: data.isRecurring,
        recurringPattern: data.isRecurring ? data.recurringPattern : null,
        title: data.title || null,
        notes: data.notes || null,
      };
      await apiRequest("PATCH", `/api/availability/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Availability Updated",
        description: "Your availability has been updated successfully.",
      });
      setDialogOpen(false);
      setEditingBlock(null);
      setSelectedDate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/availability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Availability Deleted",
        description: "The availability block has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete availability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddNew = () => {
    setEditingBlock(null);
    setSelectedDate(new Date());
    setDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setEditingBlock(null);
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleEdit = (block: AvailabilityBlock) => {
    setEditingBlock(block);
    setSelectedDate(null);
    setDialogOpen(true);
  };

  const handleSave = (data: AvailabilityFormData) => {
    if (editingBlock) {
      updateMutation.mutate({ id: editingBlock.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const isLoading = consultantLoading || blocksLoading;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px]" />
          </div>
          <div>
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!consultant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-availability-title">
            Availability Calendar
          </h1>
          <p className="text-muted-foreground">
            Set your available hours and manage your schedule
          </p>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Consultant Profile</h3>
            <p className="text-muted-foreground">
              Please complete your consultant profile to manage availability.
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
          <h1 className="text-3xl font-bold" data-testid="text-availability-title">
            Availability Calendar
          </h1>
          <p className="text-muted-foreground">
            Set your available hours and manage your schedule
          </p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-add-availability">
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {AVAILABILITY_TYPES.map((type) => (
          <div key={type.value} className="flex items-center gap-1.5 text-sm">
            <div className={cn("w-3 h-3 rounded-full", type.color)} />
            <span className="text-muted-foreground">{type.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthCalendar
            currentMonth={currentMonth}
            availabilityBlocks={availabilityBlocks}
            onDateClick={handleDateClick}
            onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
          />
        </div>
        <div className="space-y-6">
          <UpcomingAvailabilityList
            availabilityBlocks={availabilityBlocks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
          <RecurringPatternsSection
            availabilityBlocks={availabilityBlocks}
            onEdit={handleEdit}
          />
        </div>
      </div>

      <AvailabilityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingBlock={editingBlock}
        selectedDate={selectedDate}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  );
}
