import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Circle,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, isToday, isTomorrow, addDays } from "date-fns";

interface Task {
  id: string;
  type: "task";
  subject: string;
  description?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

interface TasksPanelProps {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  title?: string;
  description?: string;
  maxHeight?: string;
  showCreateButton?: boolean;
  showCompleted?: boolean;
}

export default function TasksPanel({
  contactId,
  companyId,
  dealId,
  title = "Tasks",
  description = "Upcoming tasks and to-dos",
  maxHeight = "300px",
  showCreateButton = true,
  showCompleted = false,
}: TasksPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const queryParams = new URLSearchParams();
  if (contactId) queryParams.append("contactId", contactId);
  if (companyId) queryParams.append("companyId", companyId);
  if (dealId) queryParams.append("dealId", dealId);
  queryParams.append("type", "task");
  queryParams.append("limit", "50");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/crm/activities", "tasks", contactId, companyId, dealId],
    queryFn: async () => {
      const res = await fetch(`/api/crm/activities?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const createTask = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type: "task",
          contactId: contactId || undefined,
          companyId: companyId || undefined,
          dealId: dealId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Task created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const completeTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch(`/api/crm/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedAt: completed ? new Date().toISOString() : null,
          outcome: completed ? "completed" : "pending",
        }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dueDate = formData.get("dueDate") as string;

    createTask.mutate({
      subject: formData.get("subject") as string,
      description: formData.get("description") as string || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
  };

  const getDueDateBadge = (dueDate: string | undefined) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();

    if (isPast(date) && !isToday(date)) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    if (isToday(date)) {
      return (
        <Badge variant="default" className="text-xs bg-orange-500">
          <Clock className="w-3 h-3 mr-1" />
          Today
        </Badge>
      );
    }
    if (isTomorrow(date)) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          Tomorrow
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        <Calendar className="w-3 h-3 mr-1" />
        {format(date, "MMM d")}
      </Badge>
    );
  };

  // Filter tasks
  const filteredTasks = tasks?.filter((task) => {
    if (showCompleted) return true;
    return !task.completedAt;
  }) || [];

  // Sort by due date (overdue first, then today, then future)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="tasks-panel">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {showCreateButton && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-task">
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>Add a new task</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Task *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What needs to be done?"
                    required
                    data-testid="input-task-subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Additional details..."
                    rows={2}
                    data-testid="input-task-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                    data-testid="input-task-due-date"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTask.isPending} data-testid="button-save-task">
                    {createTask.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {sortedTasks.length > 0 ? (
          <ScrollArea style={{ maxHeight }} className="pr-2">
            <div className="space-y-2">
              {sortedTasks.map((task) => {
                const isCompleted = !!task.completedAt;

                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-2 rounded-lg border transition-colors ${
                      isCompleted ? "bg-muted/50 opacity-60" : "hover:bg-muted/50"
                    }`}
                    data-testid={`task-item-${task.id}`}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={(checked) => {
                        completeTask.mutate({ id: task.id, completed: !!checked });
                      }}
                      className="mt-0.5"
                      data-testid={`checkbox-task-${task.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {task.subject}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {!isCompleted && getDueDateBadge(task.dueDate)}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {showCompleted ? "No tasks" : "All caught up!"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {showCompleted ? "Create a task to get started" : "No pending tasks"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
