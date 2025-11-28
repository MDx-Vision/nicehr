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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Plus,
  Car,
  Bus,
  Users,
  MapPin,
  Clock,
  Calendar,
  Phone,
  Mail,
  Building2,
  User,
  UserPlus,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { 
  Project, 
  Consultant,
  CarpoolGroup,
  CarpoolGroupWithDetails,
  CarpoolMember,
  CarpoolMemberWithDetails,
  ShuttleSchedule,
  TransportationContact,
} from "@shared/schema";

const CARPOOL_STATUSES = [
  { value: "open", label: "Open", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "full", label: "Full", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
];

const CARPOOL_ROLES = [
  { value: "driver", label: "Driver" },
  { value: "rider", label: "Rider" },
];

const MEMBER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const TRANSPORTATION_ROLES = [
  { value: "driver", label: "Driver" },
  { value: "shuttle_driver", label: "Shuttle Driver" },
  { value: "coordinator", label: "Coordinator" },
  { value: "other", label: "Other" },
];

const DAYS_OF_WEEK = [
  { value: "Monday", label: "Mon" },
  { value: "Tuesday", label: "Tue" },
  { value: "Wednesday", label: "Wed" },
  { value: "Thursday", label: "Thu" },
  { value: "Friday", label: "Fri" },
  { value: "Saturday", label: "Sat" },
  { value: "Sunday", label: "Sun" },
];

function getCarpoolStatusBadge(status: string) {
  const config = CARPOOL_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function getTransportationRoleLabel(role: string) {
  const config = TRANSPORTATION_ROLES.find(r => r.value === role);
  return config?.label || role;
}

function CarpoolStats({ carpools }: { carpools: CarpoolGroupWithDetails[] }) {
  const openCount = carpools.filter(c => c.status === "open").length;
  const fullCount = carpools.filter(c => c.status === "full").length;
  const totalSeats = carpools.filter(c => c.status === "open").reduce((sum, c) => sum + (c.seatsAvailable || 0), 0);
  const totalMembers = carpools.reduce((sum, c) => sum + (c.members?.length || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-open-carpools">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Carpools</CardTitle>
          <Car className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openCount}</div>
          <p className="text-xs text-muted-foreground">Available to join</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-full-carpools">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Full Carpools</CardTitle>
          <Users className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fullCount}</div>
          <p className="text-xs text-muted-foreground">At capacity</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-seats-available">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seats Available</CardTitle>
          <UserPlus className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSeats}</div>
          <p className="text-xs text-muted-foreground">In open carpools</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-total-riders">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
          <Users className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
          <p className="text-xs text-muted-foreground">Across all carpools</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CarpoolCard({ 
  carpool,
  onJoin,
  isJoining
}: { 
  carpool: CarpoolGroupWithDetails;
  onJoin: () => void;
  isJoining: boolean;
}) {
  return (
    <Card className="hover-elevate" data-testid={`carpool-card-${carpool.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <Car className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base" data-testid={`carpool-name-${carpool.id}`}>{carpool.groupName}</CardTitle>
              <CardDescription className="text-sm" data-testid={`carpool-project-${carpool.id}`}>
                {carpool.project?.name || "No project"}
              </CardDescription>
            </div>
          </div>
          {getCarpoolStatusBadge(carpool.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span data-testid={`carpool-route-${carpool.id}`}>
            {carpool.departureLocation} to {carpool.destinationLocation}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`carpool-date-${carpool.id}`}>
              {carpool.departureDate ? format(new Date(carpool.departureDate), "MMM d, yyyy") : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`carpool-time-${carpool.id}`}>{carpool.departureTime || "N/A"}</span>
          </div>
        </div>

        {carpool.driver && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Driver:</span>
            <span data-testid={`carpool-driver-${carpool.id}`}>
              {carpool.driver.user?.firstName} {carpool.driver.user?.lastName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Seats available:</span>
          <span className="font-medium" data-testid={`carpool-seats-${carpool.id}`}>{carpool.seatsAvailable}</span>
        </div>

        {carpool.vehicleDescription && (
          <div className="text-sm text-muted-foreground" data-testid={`carpool-vehicle-${carpool.id}`}>
            {carpool.vehicleDescription}
          </div>
        )}

        <Separator />

        {carpool.members && carpool.members.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Members ({carpool.members.length})</div>
            <div className="flex flex-wrap gap-2">
              {carpool.members.map((member) => (
                <Badge key={member.id} variant="outline" data-testid={`carpool-member-${member.id}`}>
                  {member.consultant?.user?.firstName} {member.consultant?.user?.lastName}
                  {member.role === "driver" && " (Driver)"}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {carpool.status === "open" && (carpool.seatsAvailable || 0) > 0 && (
          <Button 
            className="w-full" 
            onClick={onJoin}
            disabled={isJoining}
            data-testid={`button-join-carpool-${carpool.id}`}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isJoining ? "Joining..." : "Join Carpool"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ShuttleCard({ 
  shuttle,
  isAdmin,
  onToggleActive
}: { 
  shuttle: ShuttleSchedule;
  isAdmin: boolean;
  onToggleActive: () => void;
}) {
  return (
    <Card className="hover-elevate" data-testid={`shuttle-card-${shuttle.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <Bus className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base" data-testid={`shuttle-name-${shuttle.id}`}>{shuttle.shuttleName}</CardTitle>
              {shuttle.route && (
                <CardDescription className="text-sm" data-testid={`shuttle-route-${shuttle.id}`}>
                  {shuttle.route}
                </CardDescription>
              )}
            </div>
          </div>
          <Badge className={shuttle.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}>
            {shuttle.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span data-testid={`shuttle-locations-${shuttle.id}`}>
            {shuttle.departureLocation} to {shuttle.arrivalLocation}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`shuttle-times-${shuttle.id}`}>
              {shuttle.departureTime} - {shuttle.arrivalTime}
            </span>
          </div>
        </div>

        {shuttle.daysOfWeek && shuttle.daysOfWeek.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <Badge 
                key={day.value}
                variant={shuttle.daysOfWeek?.includes(day.value) ? "default" : "outline"}
                className="text-xs"
                data-testid={`shuttle-day-${shuttle.id}-${day.value}`}
              >
                {day.label}
              </Badge>
            ))}
          </div>
        )}

        {shuttle.capacity && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium" data-testid={`shuttle-capacity-${shuttle.id}`}>{shuttle.capacity}</span>
          </div>
        )}

        {shuttle.driverName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Driver:</span>
            <span data-testid={`shuttle-driver-${shuttle.id}`}>{shuttle.driverName}</span>
            {shuttle.driverPhone && (
              <span className="text-muted-foreground" data-testid={`shuttle-driver-phone-${shuttle.id}`}>
                ({shuttle.driverPhone})
              </span>
            )}
          </div>
        )}

        {isAdmin && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor={`shuttle-active-${shuttle.id}`} className="text-sm">Active Status</Label>
              <Switch 
                id={`shuttle-active-${shuttle.id}`}
                checked={shuttle.isActive}
                onCheckedChange={onToggleActive}
                data-testid={`switch-shuttle-active-${shuttle.id}`}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ContactCard({ contact }: { contact: TransportationContact }) {
  return (
    <Card className="hover-elevate" data-testid={`contact-card-${contact.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12" data-testid={`contact-avatar-${contact.id}`}>
            {contact.photoUrl && <AvatarImage src={contact.photoUrl} alt={contact.name} />}
            <AvatarFallback>
              {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-medium" data-testid={`contact-name-${contact.id}`}>{contact.name}</h3>
                <Badge variant="outline" className="mt-1" data-testid={`contact-role-${contact.id}`}>
                  {getTransportationRoleLabel(contact.role)}
                </Badge>
              </div>
              <Badge className={contact.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}>
                {contact.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span data-testid={`contact-phone-${contact.id}`}>{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span data-testid={`contact-email-${contact.id}`}>{contact.email}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span data-testid={`contact-company-${contact.id}`}>{contact.company}</span>
                </div>
              )}
              {contact.vehicleInfo && (
                <div className="flex items-center gap-2">
                  <Car className="h-3 w-3 text-muted-foreground" />
                  <span data-testid={`contact-vehicle-${contact.id}`}>{contact.vehicleInfo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCarpoolDialog({
  open,
  onOpenChange,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    groupName: "",
    projectId: "",
    departureLocation: "",
    destinationLocation: "",
    departureDate: "",
    departureTime: "",
    seatsAvailable: 4,
    vehicleDescription: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/carpool-groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carpool-groups'] });
      toast({ title: "Carpool group created successfully" });
      onOpenChange(false);
      setFormData({
        groupName: "",
        projectId: "",
        departureLocation: "",
        destinationLocation: "",
        departureDate: "",
        departureTime: "",
        seatsAvailable: 4,
        vehicleDescription: "",
      });
    },
    onError: () => {
      toast({ title: "Failed to create carpool group", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupName || !formData.projectId || !formData.departureLocation || !formData.destinationLocation || !formData.departureDate || !formData.departureTime) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Carpool Group</DialogTitle>
          <DialogDescription>Create a new carpool group for project travel coordination.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carpool-name">Group Name *</Label>
            <Input
              id="carpool-name"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              placeholder="e.g., Morning Commute Team"
              data-testid="input-carpool-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carpool-project">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            >
              <SelectTrigger id="carpool-project" data-testid="select-carpool-project">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carpool-departure">Departure Location *</Label>
              <Input
                id="carpool-departure"
                value={formData.departureLocation}
                onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                placeholder="e.g., Downtown Hotel"
                data-testid="input-carpool-departure"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carpool-destination">Destination *</Label>
              <Input
                id="carpool-destination"
                value={formData.destinationLocation}
                onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                placeholder="e.g., Hospital Main"
                data-testid="input-carpool-destination"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carpool-date">Departure Date *</Label>
              <Input
                id="carpool-date"
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                data-testid="input-carpool-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carpool-time">Departure Time *</Label>
              <Input
                id="carpool-time"
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                data-testid="input-carpool-time"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carpool-seats">Seats Available</Label>
              <Input
                id="carpool-seats"
                type="number"
                min={1}
                max={10}
                value={formData.seatsAvailable}
                onChange={(e) => setFormData({ ...formData, seatsAvailable: parseInt(e.target.value) || 4 })}
                data-testid="input-carpool-seats"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carpool-vehicle">Vehicle Description</Label>
              <Input
                id="carpool-vehicle"
                value={formData.vehicleDescription}
                onChange={(e) => setFormData({ ...formData, vehicleDescription: e.target.value })}
                placeholder="e.g., White Honda Accord"
                data-testid="input-carpool-vehicle"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-carpool">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-carpool">
              {createMutation.isPending ? "Creating..." : "Create Carpool"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateShuttleDialog({
  open,
  onOpenChange,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    shuttleName: "",
    route: "",
    projectId: "",
    departureLocation: "",
    arrivalLocation: "",
    departureTime: "",
    arrivalTime: "",
    daysOfWeek: [] as string[],
    capacity: 20,
    driverName: "",
    driverPhone: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/shuttle-schedules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shuttle-schedules'] });
      toast({ title: "Shuttle schedule created successfully" });
      onOpenChange(false);
      setFormData({
        shuttleName: "",
        route: "",
        projectId: "",
        departureLocation: "",
        arrivalLocation: "",
        departureTime: "",
        arrivalTime: "",
        daysOfWeek: [],
        capacity: 20,
        driverName: "",
        driverPhone: "",
      });
    },
    onError: () => {
      toast({ title: "Failed to create shuttle schedule", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shuttleName || !formData.departureLocation || !formData.arrivalLocation || !formData.departureTime || !formData.arrivalTime) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Shuttle Schedule</DialogTitle>
          <DialogDescription>Create a new shuttle schedule for regular transportation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shuttle-name">Shuttle Name *</Label>
              <Input
                id="shuttle-name"
                value={formData.shuttleName}
                onChange={(e) => setFormData({ ...formData, shuttleName: e.target.value })}
                placeholder="e.g., Morning Shuttle"
                data-testid="input-shuttle-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shuttle-route">Route</Label>
              <Input
                id="shuttle-route"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                placeholder="e.g., Route A"
                data-testid="input-shuttle-route"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shuttle-project">Project (Optional)</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            >
              <SelectTrigger id="shuttle-project" data-testid="select-shuttle-project">
                <SelectValue placeholder="Select project (optional)" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shuttle-departure-loc">Departure Location *</Label>
              <Input
                id="shuttle-departure-loc"
                value={formData.departureLocation}
                onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                placeholder="e.g., Main Lobby"
                data-testid="input-shuttle-departure-location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shuttle-arrival-loc">Arrival Location *</Label>
              <Input
                id="shuttle-arrival-loc"
                value={formData.arrivalLocation}
                onChange={(e) => setFormData({ ...formData, arrivalLocation: e.target.value })}
                placeholder="e.g., Hospital Entrance"
                data-testid="input-shuttle-arrival-location"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shuttle-departure-time">Departure Time *</Label>
              <Input
                id="shuttle-departure-time"
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                data-testid="input-shuttle-departure-time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shuttle-arrival-time">Arrival Time *</Label>
              <Input
                id="shuttle-arrival-time"
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                data-testid="input-shuttle-arrival-time"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  size="sm"
                  variant={formData.daysOfWeek.includes(day.value) ? "default" : "outline"}
                  onClick={() => toggleDay(day.value)}
                  data-testid={`button-shuttle-day-${day.value}`}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shuttle-capacity">Capacity</Label>
              <Input
                id="shuttle-capacity"
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })}
                data-testid="input-shuttle-capacity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shuttle-driver-name">Driver Name</Label>
              <Input
                id="shuttle-driver-name"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Driver name"
                data-testid="input-shuttle-driver-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shuttle-driver-phone">Driver Phone</Label>
              <Input
                id="shuttle-driver-phone"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="Phone number"
                data-testid="input-shuttle-driver-phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-shuttle">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-shuttle">
              {createMutation.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateContactDialog({
  open,
  onOpenChange,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    role: "driver" as string,
    phone: "",
    email: "",
    photoUrl: "",
    company: "",
    vehicleInfo: "",
    availability: "",
    notes: "",
    projectId: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/transportation-contacts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transportation-contacts'] });
      toast({ title: "Transportation contact created successfully" });
      onOpenChange(false);
      setFormData({
        name: "",
        role: "driver",
        phone: "",
        email: "",
        photoUrl: "",
        company: "",
        vehicleInfo: "",
        availability: "",
        notes: "",
        projectId: "",
      });
    },
    onError: () => {
      toast({ title: "Failed to create transportation contact", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "Please provide a name", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Transportation Contact</DialogTitle>
          <DialogDescription>Add a new driver, coordinator, or other transportation contact.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  data-testid="input-contact-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="contact-role" data-testid="select-contact-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSPORTATION_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  data-testid="input-contact-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  data-testid="input-contact-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-photo">Photo URL</Label>
              <Input
                id="contact-photo"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                data-testid="input-contact-photo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-company">Company</Label>
                <Input
                  id="contact-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                  data-testid="input-contact-company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-vehicle">Vehicle Info</Label>
                <Input
                  id="contact-vehicle"
                  value={formData.vehicleInfo}
                  onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                  placeholder="e.g., 2023 Ford Transit"
                  data-testid="input-contact-vehicle"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-availability">Availability</Label>
              <Textarea
                id="contact-availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g., Weekdays 6am-6pm"
                data-testid="input-contact-availability"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-notes">Notes</Label>
              <Textarea
                id="contact-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                data-testid="input-contact-notes"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-contact">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-contact">
                {createMutation.isPending ? "Creating..." : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FindCarpoolsDialog({
  open,
  onOpenChange,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}) {
  const { toast } = useToast();
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const { data: availableCarpools = [], isLoading, refetch } = useQuery<CarpoolGroupWithDetails[]>({
    queryKey: ['/api/carpool-groups/available', projectId, date],
    enabled: false,
  });

  const handleSearch = async () => {
    if (!projectId || !date) {
      toast({ title: "Please select a project and date", variant: "destructive" });
      return;
    }
    setSearchPerformed(true);
    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find Available Carpools</DialogTitle>
          <DialogDescription>Search for open carpools by project and date.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger data-testid="select-find-project">
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
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-testid="input-find-date"
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={isLoading} data-testid="button-search-carpools">
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Searching..." : "Search"}
          </Button>

          {searchPerformed && (
            <div className="space-y-4">
              <Separator />
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : availableCarpools.length === 0 ? (
                <p className="text-center text-muted-foreground py-8" data-testid="text-no-carpools-found">
                  No available carpools found for the selected project and date.
                </p>
              ) : (
                <ScrollArea className="max-h-[40vh]">
                  <div className="space-y-4">
                    {availableCarpools.map((carpool) => (
                      <Card key={carpool.id} data-testid={`search-result-carpool-${carpool.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{carpool.groupName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {carpool.departureLocation} to {carpool.destinationLocation}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {carpool.departureTime} - {carpool.seatsAvailable} seats available
                              </p>
                            </div>
                            {getCarpoolStatusBadge(carpool.status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Transportation() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("carpools");
  const [carpoolStatusFilter, setCarpoolStatusFilter] = useState<string>("all");
  const [carpoolProjectFilter, setCarpoolProjectFilter] = useState<string>("all");
  const [shuttleProjectFilter, setShuttleProjectFilter] = useState<string>("all");
  const [shuttleActiveFilter, setShuttleActiveFilter] = useState<string>("all");
  const [contactRoleFilter, setContactRoleFilter] = useState<string>("all");
  const [contactActiveFilter, setContactActiveFilter] = useState<string>("all");
  const [showCreateCarpool, setShowCreateCarpool] = useState(false);
  const [showCreateShuttle, setShowCreateShuttle] = useState(false);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [showFindCarpools, setShowFindCarpools] = useState(false);
  const [joiningCarpoolId, setJoiningCarpoolId] = useState<string | null>(null);

  const { data: carpools = [], isLoading: carpoolsLoading } = useQuery<CarpoolGroupWithDetails[]>({
    queryKey: ['/api/carpool-groups', { projectId: carpoolProjectFilter !== "all" ? carpoolProjectFilter : undefined, status: carpoolStatusFilter !== "all" ? carpoolStatusFilter : undefined }],
  });

  const { data: shuttles = [], isLoading: shuttlesLoading } = useQuery<ShuttleSchedule[]>({
    queryKey: ['/api/shuttle-schedules', { projectId: shuttleProjectFilter !== "all" ? shuttleProjectFilter : undefined, isActive: shuttleActiveFilter !== "all" ? shuttleActiveFilter === "active" : undefined }],
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<TransportationContact[]>({
    queryKey: ['/api/transportation-contacts', { role: contactRoleFilter !== "all" ? contactRoleFilter : undefined, isActive: contactActiveFilter !== "all" ? contactActiveFilter === "active" : undefined }],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: consultant } = useQuery<{ id: string }>({
    queryKey: ['/api/consultants/user', user?.id],
    enabled: !!user?.id,
  });

  const joinCarpoolMutation = useMutation({
    mutationFn: async (carpoolId: string) => {
      return apiRequest("POST", "/api/carpool-members", {
        carpoolId,
        consultantId: consultant?.id,
        role: "rider",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carpool-groups'] });
      toast({ title: "Successfully joined carpool" });
      setJoiningCarpoolId(null);
    },
    onError: () => {
      toast({ title: "Failed to join carpool", variant: "destructive" });
      setJoiningCarpoolId(null);
    }
  });

  const toggleShuttleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/shuttle-schedules/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shuttle-schedules'] });
      toast({ title: "Shuttle status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update shuttle status", variant: "destructive" });
    }
  });

  const handleJoinCarpool = (carpoolId: string) => {
    if (!consultant?.id) {
      toast({ title: "Unable to join carpool. Consultant profile not found.", variant: "destructive" });
      return;
    }
    setJoiningCarpoolId(carpoolId);
    joinCarpoolMutation.mutate(carpoolId);
  };

  const handleToggleShuttleActive = (shuttle: ShuttleSchedule) => {
    toggleShuttleActiveMutation.mutate({ id: shuttle.id, isActive: !shuttle.isActive });
  };

  const filteredCarpools = carpools.filter((carpool) => {
    if (carpoolStatusFilter !== "all" && carpool.status !== carpoolStatusFilter) return false;
    if (carpoolProjectFilter !== "all" && carpool.projectId !== carpoolProjectFilter) return false;
    return true;
  });

  const filteredShuttles = shuttles.filter((shuttle) => {
    if (shuttleProjectFilter !== "all" && shuttle.projectId !== shuttleProjectFilter) return false;
    if (shuttleActiveFilter !== "all" && shuttle.isActive !== (shuttleActiveFilter === "active")) return false;
    return true;
  });

  const filteredContacts = contacts.filter((contact) => {
    if (contactRoleFilter !== "all" && contact.role !== contactRoleFilter) return false;
    if (contactActiveFilter !== "all" && contact.isActive !== (contactActiveFilter === "active")) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Transportation Coordination</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Manage carpools, shuttles, and transportation contacts
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-transportation">
          <TabsTrigger value="carpools" data-testid="tab-carpools">
            <Car className="h-4 w-4 mr-2" />
            Carpool Groups
          </TabsTrigger>
          <TabsTrigger value="shuttles" data-testid="tab-shuttles">
            <Bus className="h-4 w-4 mr-2" />
            Shuttle Schedules
          </TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carpools" className="space-y-6">
          <CarpoolStats carpools={carpools} />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={carpoolProjectFilter} onValueChange={setCarpoolProjectFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-filter-carpool-project">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={carpoolStatusFilter} onValueChange={setCarpoolStatusFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-carpool-status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {CARPOOL_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowFindCarpools(true)} data-testid="button-find-carpools">
                <Search className="h-4 w-4 mr-2" />
                Find Carpools
              </Button>
              <Button onClick={() => setShowCreateCarpool(true)} data-testid="button-create-carpool">
                <Plus className="h-4 w-4 mr-2" />
                Create Carpool
              </Button>
            </div>
          </div>

          {carpoolsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredCarpools.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium" data-testid="text-no-carpools">No carpool groups found</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Create a new carpool group or adjust your filters to see results.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCarpools.map((carpool) => (
                <CarpoolCard
                  key={carpool.id}
                  carpool={carpool}
                  onJoin={() => handleJoinCarpool(carpool.id)}
                  isJoining={joiningCarpoolId === carpool.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shuttles" className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={shuttleProjectFilter} onValueChange={setShuttleProjectFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-filter-shuttle-project">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={shuttleActiveFilter} onValueChange={setShuttleActiveFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-shuttle-active">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowCreateShuttle(true)} data-testid="button-create-shuttle">
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            )}
          </div>

          {shuttlesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredShuttles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium" data-testid="text-no-shuttles">No shuttle schedules found</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {isAdmin ? "Create a new shuttle schedule to get started." : "No shuttle schedules are available yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredShuttles.map((shuttle) => (
                <ShuttleCard
                  key={shuttle.id}
                  shuttle={shuttle}
                  isAdmin={isAdmin}
                  onToggleActive={() => handleToggleShuttleActive(shuttle)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={contactRoleFilter} onValueChange={setContactRoleFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-filter-contact-role">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {TRANSPORTATION_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={contactActiveFilter} onValueChange={setContactActiveFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-contact-active">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowCreateContact(true)} data-testid="button-create-contact">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            )}
          </div>

          {contactsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium" data-testid="text-no-contacts">No transportation contacts found</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {isAdmin ? "Add a new transportation contact to get started." : "No transportation contacts are available yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateCarpoolDialog
        open={showCreateCarpool}
        onOpenChange={setShowCreateCarpool}
        projects={projects}
      />
      <CreateShuttleDialog
        open={showCreateShuttle}
        onOpenChange={setShowCreateShuttle}
        projects={projects}
      />
      <CreateContactDialog
        open={showCreateContact}
        onOpenChange={setShowCreateContact}
        projects={projects}
      />
      <FindCarpoolsDialog
        open={showFindCarpools}
        onOpenChange={setShowFindCarpools}
        projects={projects}
      />
    </div>
  );
}
