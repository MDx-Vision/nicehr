import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Monitor, 
  Calendar, 
  MapPin, 
  Users, 
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";
import type { 
  LoginLab, 
  LoginLabParticipant,
  LoginLabWithDetails, 
  LoginLabParticipantWithUser,
  Project,
  Hospital,
  HospitalModule,
  User
} from "@shared/schema";

type LabStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

interface MyLabSession extends LoginLabParticipant {
  loginLab: {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    durationMinutes: number | null;
    status: string;
    location: string | null;
    room: string | null;
    module?: { id: string; name: string } | null;
    hospital?: { id: string; name: string } | null;
    facilitator?: { id: string; firstName: string | null; lastName: string | null } | null;
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "scheduled":
      return <Badge variant="secondary" data-testid="badge-status-scheduled">Scheduled</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500 text-white" data-testid="badge-status-in-progress">In Progress</Badge>;
    case "completed":
      return <Badge className="bg-green-500 text-white" data-testid="badge-status-completed">Completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive" data-testid="badge-status-cancelled">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getParticipantStatusBadge(participant: LoginLabParticipant) {
  if (participant.completedAt) {
    return (
      <Badge className="bg-green-500 text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    );
  }
  if (participant.accessValidated) {
    return (
      <Badge className="bg-blue-500 text-white">
        <UserCheck className="h-3 w-3 mr-1" />
        Access Validated
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Clock className="h-3 w-3 mr-1" />
      Registered
    </Badge>
  );
}

function LabCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function LabCard({
  lab,
  isJoined,
  onJoin,
  isPending,
}: {
  lab: LoginLabWithDetails;
  isJoined: boolean;
  onJoin: () => void;
  isPending: boolean;
}) {
  const isAtCapacity = lab.participantCount >= (lab.maxParticipants || 20);
  const canJoin = !isJoined && !isAtCapacity && lab.status === "scheduled";

  return (
    <Card className="flex flex-col h-full" data-testid={`card-lab-${lab.id}`}>
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{lab.title}</CardTitle>
          {getStatusBadge(lab.status)}
        </div>
        <CardDescription className="line-clamp-2">
          {lab.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lab.module && (
          <Badge variant="outline" className="text-xs">
            <Monitor className="h-3 w-3 mr-1" />
            {lab.module.name}
          </Badge>
        )}
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(lab.scheduledAt), "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          {lab.durationMinutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{lab.durationMinutes} minutes</span>
            </div>
          )}
          {(lab.location || lab.room) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{[lab.location, lab.room].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {lab.facilitator && (
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>
                {[lab.facilitator.firstName, lab.facilitator.lastName].filter(Boolean).join(" ") || "Facilitator"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {lab.participantCount} / {lab.maxParticipants || 20} participants
            </span>
            {isAtCapacity && <Badge variant="destructive" className="ml-1 text-xs">Full</Badge>}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isJoined ? (
          <Button variant="secondary" className="w-full" disabled data-testid={`button-joined-${lab.id}`}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Already Joined
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onJoin}
            disabled={isPending || !canJoin}
            data-testid={`button-join-${lab.id}`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            {isAtCapacity ? "Lab Full" : lab.status !== "scheduled" ? "Not Available" : "Join Lab"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function MyLabSessionCard({ session }: { session: MyLabSession }) {
  const lab = session.loginLab;
  
  return (
    <Card data-testid={`card-session-${session.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{lab.title}</CardTitle>
          {getParticipantStatusBadge(session)}
        </div>
        <CardDescription className="line-clamp-1">
          {lab.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {getStatusBadge(lab.status)}
          {lab.module && (
            <Badge variant="outline" className="text-xs">
              <Monitor className="h-3 w-3 mr-1" />
              {lab.module.name}
            </Badge>
          )}
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(lab.scheduledAt), "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          {(lab.location || lab.room) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{[lab.location, lab.room].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {lab.facilitator && (
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>
                {[lab.facilitator.firstName, lab.facilitator.lastName].filter(Boolean).join(" ") || "Facilitator"}
              </span>
            </div>
          )}
        </div>
        {session.customizationNotes && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <FileText className="h-4 w-4" />
              Customization Notes
            </div>
            <p className="text-sm text-muted-foreground">{session.customizationNotes}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-xs pt-2 border-t">
          {session.attendedAt && (
            <span className="text-muted-foreground">
              Attended: {format(new Date(session.attendedAt), "MMM d, yyyy")}
            </span>
          )}
          {session.completedAt && (
            <span className="text-muted-foreground">
              Completed: {format(new Date(session.completedAt), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface LabFormData {
  projectId: string;
  hospitalId: string;
  moduleId: string;
  title: string;
  description: string;
  facilitatorId: string;
  scheduledAt: string;
  durationMinutes: string;
  maxParticipants: string;
  location: string;
  room: string;
  status: LabStatus;
}

function CreateLabDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  projects,
  hospitals,
  modules,
  users,
  editingLab,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
  projects: Project[];
  hospitals: Hospital[];
  modules: HospitalModule[];
  users: User[];
  editingLab?: LoginLabWithDetails | null;
}) {
  const [formData, setFormData] = useState<LabFormData>({
    projectId: editingLab?.projectId || "",
    hospitalId: editingLab?.hospitalId || "",
    moduleId: editingLab?.moduleId || "",
    title: editingLab?.title || "",
    description: editingLab?.description || "",
    facilitatorId: editingLab?.facilitatorId || "",
    scheduledAt: editingLab?.scheduledAt ? format(new Date(editingLab.scheduledAt), "yyyy-MM-dd'T'HH:mm") : "",
    durationMinutes: editingLab?.durationMinutes?.toString() || "60",
    maxParticipants: editingLab?.maxParticipants?.toString() || "20",
    location: editingLab?.location || "",
    room: editingLab?.room || "",
    status: (editingLab?.status as LabStatus) || "scheduled",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      projectId: formData.projectId,
      hospitalId: formData.hospitalId,
      moduleId: formData.moduleId || null,
      title: formData.title,
      description: formData.description || null,
      facilitatorId: formData.facilitatorId || null,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : 60,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 20,
      location: formData.location || null,
      room: formData.room || null,
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLab ? "Edit Login Lab" : "Create New Login Lab"}</DialogTitle>
          <DialogDescription>
            {editingLab ? "Update the login lab details below." : "Schedule a new EMR login lab session."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Lab session title"
              required
              data-testid="input-lab-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Lab session description"
              rows={3}
              data-testid="input-lab-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger data-testid="select-lab-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalId">Hospital *</Label>
              <Select
                value={formData.hospitalId}
                onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}
              >
                <SelectTrigger data-testid="select-lab-hospital">
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moduleId">EMR Module</Label>
              <Select
                value={formData.moduleId}
                onValueChange={(value) => setFormData({ ...formData, moduleId: value === "none" ? "" : value })}
              >
                <SelectTrigger data-testid="select-lab-module">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facilitatorId">Facilitator</Label>
              <Select
                value={formData.facilitatorId}
                onValueChange={(value) => setFormData({ ...formData, facilitatorId: value === "none" ? "" : value })}
              >
                <SelectTrigger data-testid="select-lab-facilitator">
                  <SelectValue placeholder="Select facilitator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              required
              data-testid="input-lab-scheduled"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                placeholder="60"
                data-testid="input-lab-duration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder="20"
                data-testid="input-lab-max-participants"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Building/Floor"
                data-testid="input-lab-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Room number"
                data-testid="input-lab-room"
              />
            </div>
          </div>

          {editingLab && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: LabStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="select-lab-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !formData.title || !formData.projectId || !formData.hospitalId || !formData.scheduledAt} 
              data-testid="button-save-lab"
            >
              {isPending ? "Saving..." : editingLab ? "Update Lab" : "Create Lab"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ParticipantsDialog({
  open,
  onOpenChange,
  lab,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab: LoginLabWithDetails | null;
}) {
  const { toast } = useToast();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [customizationNotes, setCustomizationNotes] = useState("");

  const { data: participants, isLoading } = useQuery<LoginLabParticipantWithUser[]>({
    queryKey: ["/api/login-labs", lab?.id, "participants"],
    enabled: open && !!lab,
  });

  const validateMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const res = await apiRequest("POST", `/api/login-lab-participants/${participantId}/validate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs", lab?.id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs"] });
      toast({
        title: "Access Validated",
        description: "Participant access has been validated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ participantId, notes }: { participantId: string; notes: string }) => {
      const res = await apiRequest("POST", `/api/login-lab-participants/${participantId}/complete`, {
        customizationNotes: notes,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs", lab?.id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs"] });
      setCompletingId(null);
      setCustomizationNotes("");
      toast({
        title: "Marked Complete",
        description: "Participant has been marked as complete.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Mark Complete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (participantId: string) => {
      await apiRequest("DELETE", `/api/login-lab-participants/${participantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs", lab?.id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs"] });
      toast({
        title: "Participant Removed",
        description: "Participant has been removed from the lab.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!lab) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Participants</DialogTitle>
          <DialogDescription>
            {lab.title} - {format(new Date(lab.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !participants || participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No Participants</p>
            <p className="text-sm">No one has joined this lab session yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <Card key={participant.id} data-testid={`card-participant-${participant.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium">
                        {[participant.user.firstName, participant.user.lastName].filter(Boolean).join(" ") || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">{participant.user.email}</p>
                      <div className="mt-1">
                        {getParticipantStatusBadge(participant)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {!participant.accessValidated && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => validateMutation.mutate(participant.id)}
                          disabled={validateMutation.isPending}
                          data-testid={`button-validate-${participant.id}`}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Validate Access
                        </Button>
                      )}
                      {!participant.completedAt && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCompletingId(participant.id)}
                          disabled={completeMutation.isPending}
                          data-testid={`button-complete-${participant.id}`}
                        >
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this participant?")) {
                            removeMutation.mutate(participant.id);
                          }
                        }}
                        disabled={removeMutation.isPending}
                        data-testid={`button-remove-${participant.id}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {completingId === participant.id && (
                    <div className="mt-4 p-3 bg-muted rounded-md space-y-3">
                      <Label htmlFor={`notes-${participant.id}`}>Customization Notes (optional)</Label>
                      <Textarea
                        id={`notes-${participant.id}`}
                        value={customizationNotes}
                        onChange={(e) => setCustomizationNotes(e.target.value)}
                        placeholder="Enter any customization notes for this participant..."
                        rows={2}
                        data-testid={`input-notes-${participant.id}`}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => completeMutation.mutate({ participantId: participant.id, notes: customizationNotes })}
                          disabled={completeMutation.isPending}
                          data-testid={`button-confirm-complete-${participant.id}`}
                        >
                          {completeMutation.isPending ? "Saving..." : "Confirm Complete"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCompletingId(null);
                            setCustomizationNotes("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  {participant.customizationNotes && !completingId && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Notes: </span>
                      {participant.customizationNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LoginLabs() {
  const { user, isAdmin, isHospitalStaff } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scheduled");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [hospitalFilter, setHospitalFilter] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<LoginLabWithDetails | null>(null);
  const [participantsDialogLab, setParticipantsDialogLab] = useState<LoginLabWithDetails | null>(null);

  const canManage = isAdmin || isHospitalStaff;

  const { data: labs, isLoading: labsLoading } = useQuery<LoginLabWithDetails[]>({
    queryKey: ["/api/login-labs"],
  });

  const { data: myLabSessions, isLoading: sessionsLoading } = useQuery<MyLabSession[]>({
    queryKey: ["/api/my-login-lab-sessions"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: canManage,
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
    enabled: canManage,
  });

  const { data: modules } = useQuery<HospitalModule[]>({
    queryKey: ["/api/modules"],
    enabled: canManage,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: canManage,
  });

  const joinedLabIds = new Set(myLabSessions?.map((s) => s.loginLabId) || []);

  const joinMutation = useMutation({
    mutationFn: async (labId: string) => {
      const res = await apiRequest("POST", `/api/login-labs/${labId}/participants`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-login-lab-sessions"] });
      toast({
        title: "Joined Successfully",
        description: "You have joined the login lab session.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Join",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createLabMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/login-labs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs"] });
      setCreateDialogOpen(false);
      toast({
        title: "Lab Created",
        description: "The login lab has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Lab",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLabMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/login-labs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs"] });
      setEditingLab(null);
      toast({
        title: "Lab Updated",
        description: "The login lab has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Lab",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLabMutation = useMutation({
    mutationFn: async (labId: string) => {
      await apiRequest("DELETE", `/api/login-labs/${labId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-labs"] });
      toast({
        title: "Lab Deleted",
        description: "The login lab has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Lab",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredLabs = labs?.filter((lab) => {
    const matchesStatus = !statusFilter || statusFilter === "all" || lab.status === statusFilter;
    const matchesProject = !projectFilter || projectFilter === "all" || lab.projectId === projectFilter;
    const matchesHospital = !hospitalFilter || hospitalFilter === "all" || lab.hospitalId === hospitalFilter;
    return matchesStatus && matchesProject && matchesHospital;
  }) || [];

  const upcomingLabs = filteredLabs.filter((lab) => 
    lab.status === "scheduled" || lab.status === "in_progress"
  );

  const handleSubmitLab = (data: any) => {
    if (editingLab) {
      updateLabMutation.mutate({ id: editingLab.id, data });
    } else {
      createLabMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-login-labs-title">Login Labs</h1>
        <p className="text-muted-foreground">
          EMR system access training sessions and hands-on practice labs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-3 gap-1">
          <TabsTrigger value="scheduled" data-testid="tab-scheduled-labs">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Labs
          </TabsTrigger>
          <TabsTrigger value="my-sessions" data-testid="tab-my-sessions">
            <CheckSquare className="h-4 w-4 mr-2" />
            My Lab Sessions
          </TabsTrigger>
          {canManage && (
            <TabsTrigger value="manage" data-testid="tab-manage-labs">
              <Users className="h-4 w-4 mr-2" />
              Manage Labs
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Labs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger data-testid="select-filter-project">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                  <SelectTrigger data-testid="select-filter-hospital">
                    <SelectValue placeholder="Hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {hospitals?.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {labsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <LabCardSkeleton key={i} />
              ))}
            </div>
          ) : upcomingLabs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Labs Available</h3>
                <p className="text-muted-foreground">
                  {statusFilter || projectFilter || hospitalFilter
                    ? "Try adjusting your filters to find labs."
                    : "No login lab sessions are currently scheduled."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingLabs.map((lab) => (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  isJoined={joinedLabIds.has(lab.id)}
                  onJoin={() => joinMutation.mutate(lab.id)}
                  isPending={joinMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-sessions" className="space-y-6">
          {sessionsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <LabCardSkeleton key={i} />
              ))}
            </div>
          ) : !myLabSessions || myLabSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No Lab Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't joined any login lab sessions yet.
                </p>
                <Button onClick={() => setActiveTab("scheduled")} data-testid="button-browse-labs">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse Available Labs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myLabSessions.map((session) => (
                <MyLabSessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        {canManage && (
          <TabsContent value="manage" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold">Manage Login Labs</h2>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and manage login lab sessions
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-lab">
                <Plus className="h-4 w-4 mr-2" />
                Create Lab
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labsLoading ? (
                    [1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : !filteredLabs || filteredLabs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No login labs found. Create your first lab session to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLabs.map((lab) => (
                      <TableRow key={lab.id} data-testid={`row-lab-${lab.id}`}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {lab.title}
                        </TableCell>
                        <TableCell>{lab.project?.name || "-"}</TableCell>
                        <TableCell>{lab.hospital?.name || "-"}</TableCell>
                        <TableCell>{lab.module?.name || "-"}</TableCell>
                        <TableCell>
                          {format(new Date(lab.scheduledAt), "MMM d, yyyy h:mm a")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{lab.participantCount} / {lab.maxParticipants || 20}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(lab.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setParticipantsDialogLab(lab)}
                              data-testid={`button-participants-${lab.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingLab(lab)}
                              data-testid={`button-edit-${lab.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this lab?")) {
                                    deleteLabMutation.mutate(lab.id);
                                  }
                                }}
                                data-testid={`button-delete-${lab.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            <CreateLabDialog
              open={createDialogOpen || !!editingLab}
              onOpenChange={(open) => {
                if (!open) {
                  setCreateDialogOpen(false);
                  setEditingLab(null);
                }
              }}
              onSubmit={handleSubmitLab}
              isPending={createLabMutation.isPending || updateLabMutation.isPending}
              projects={projects || []}
              hospitals={hospitals || []}
              modules={modules || []}
              users={users || []}
              editingLab={editingLab}
            />

            <ParticipantsDialog
              open={!!participantsDialogLab}
              onOpenChange={(open) => {
                if (!open) setParticipantsDialogLab(null);
              }}
              lab={participantsDialogLab}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
