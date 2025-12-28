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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from "date-fns";
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Car,
  Hotel,
  Plane,
  Calendar,
  Building2,
  ChevronRight,
  ChevronLeft,
  MapPin,
  X,
  FileText,
  Route,
  Luggage,
  Eye,
  Receipt
} from "lucide-react";
import type { 
  Project, 
  Consultant,
  TravelBookingWithDetails,
  TravelItineraryWithDetails,
} from "@shared/schema";

const BOOKING_TYPES = [
  { value: "flight", label: "Flight", icon: Plane },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "rental_car", label: "Rental Car", icon: Car },
];

const BOOKING_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
];

const ITINERARY_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "completed", label: "Completed", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

function getBookingTypeIcon(bookingType: string) {
  const config = BOOKING_TYPES.find(t => t.value === bookingType);
  const Icon = config?.icon || FileText;
  return <Icon className="h-4 w-4" />;
}

function getBookingTypeLabel(bookingType: string) {
  const config = BOOKING_TYPES.find(t => t.value === bookingType);
  return config?.label || bookingType;
}

function getBookingStatusBadge(status: string) {
  const config = BOOKING_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function getItineraryStatusBadge(status: string) {
  const config = ITINERARY_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function formatCurrency(amount: string | number | null | undefined) {
  if (amount === null || amount === undefined) return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function BookingStats({ bookings }: { bookings: TravelBookingWithDetails[] }) {
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const totalEstimated = bookings.reduce((sum, b) => sum + parseFloat(b.estimatedCost || "0"), 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-pending-bookings">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
          <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-confirmed-bookings">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{confirmedCount}</div>
          <p className="text-xs text-muted-foreground">Ready for travel</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-completed-bookings">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Luggage className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <p className="text-xs text-muted-foreground">Trips finished</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-total-cost">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Estimated</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalEstimated)}</div>
          <p className="text-xs text-muted-foreground">Estimated travel costs</p>
        </CardContent>
      </Card>
    </div>
  );
}

function BookingCard({ 
  booking,
  onClick 
}: { 
  booking: TravelBookingWithDetails;
  onClick: () => void;
}) {
  const getDates = () => {
    if (booking.bookingType === "hotel") {
      return `${booking.checkInDate ? format(new Date(booking.checkInDate), "MMM d") : "N/A"} - ${booking.checkOutDate ? format(new Date(booking.checkOutDate), "MMM d, yyyy") : "N/A"}`;
    }
    return `${booking.departureDate ? format(new Date(booking.departureDate), "MMM d") : "N/A"} - ${booking.returnDate ? format(new Date(booking.returnDate), "MMM d, yyyy") : "N/A"}`;
  };

  const getConfirmation = () => {
    if (booking.bookingType === "hotel") {
      return booking.hotelConfirmationNumber || booking.confirmationNumber || "N/A";
    }
    if (booking.bookingType === "rental_car") {
      return booking.rentalConfirmationNumber || booking.confirmationNumber || "N/A";
    }
    return booking.confirmationNumber || "N/A";
  };

  const getDetails = () => {
    if (booking.bookingType === "flight") {
      return `${booking.airline || ""} ${booking.flightNumber || ""} - ${booking.departureAirport || ""} to ${booking.arrivalAirport || ""}`;
    }
    if (booking.bookingType === "hotel") {
      return booking.hotelName || "Hotel booking";
    }
    if (booking.bookingType === "rental_car") {
      return `${booking.rentalCompany || ""} - ${booking.vehicleType || "Vehicle"}`;
    }
    return "";
  };

  return (
    <Card 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`booking-card-${booking.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              {getBookingTypeIcon(booking.bookingType)}
            </div>
            <div>
              <CardTitle className="text-base">{getBookingTypeLabel(booking.bookingType)}</CardTitle>
              <CardDescription className="text-sm">{getDetails()}</CardDescription>
            </div>
          </div>
          {getBookingStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{getDates()}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Confirmation:</span>
          <span className="font-mono">{getConfirmation()}</span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Estimated</div>
            <div className="font-medium">{formatCurrency(booking.estimatedCost)}</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-xs text-muted-foreground">Actual</div>
            <div className="font-medium">{formatCurrency(booking.actualCost)}</div>
          </div>
        </div>

        {booking.consultant && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {(booking.consultant.user.firstName?.[0] || "") + (booking.consultant.user.lastName?.[0] || "")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {booking.consultant.user.firstName} {booking.consultant.user.lastName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateBookingDialog({
  open,
  onOpenChange,
  consultants,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultants: Consultant[];
  projects: Project[];
}) {
  const { toast } = useToast();
  const [bookingType, setBookingType] = useState<string>("flight");
  const [formData, setFormData] = useState({
    consultantId: "",
    projectId: "",
    estimatedCost: "",
    notes: "",
    airline: "",
    flightNumber: "",
    departureAirport: "",
    arrivalAirport: "",
    departureDate: "",
    returnDate: "",
    departureTime: "",
    arrivalTime: "",
    hotelName: "",
    hotelAddress: "",
    checkInDate: "",
    checkOutDate: "",
    hotelConfirmationNumber: "",
    rentalCompany: "",
    pickupLocation: "",
    dropoffLocation: "",
    vehicleType: "",
    rentalConfirmationNumber: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/travel-bookings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/travel-bookings'] });
      onOpenChange(false);
      resetForm();
      toast({ title: "Booking created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create booking", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setBookingType("flight");
    setFormData({
      consultantId: "",
      projectId: "",
      estimatedCost: "",
      notes: "",
      airline: "",
      flightNumber: "",
      departureAirport: "",
      arrivalAirport: "",
      departureDate: "",
      returnDate: "",
      departureTime: "",
      arrivalTime: "",
      hotelName: "",
      hotelAddress: "",
      checkInDate: "",
      checkOutDate: "",
      hotelConfirmationNumber: "",
      rentalCompany: "",
      pickupLocation: "",
      dropoffLocation: "",
      vehicleType: "",
      rentalConfirmationNumber: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.consultantId) {
      toast({ title: "Please select a consultant", variant: "destructive" });
      return;
    }

    const payload: Record<string, unknown> = {
      consultantId: formData.consultantId,
      projectId: formData.projectId || null,
      bookingType,
      estimatedCost: formData.estimatedCost || null,
      notes: formData.notes || null,
    };

    if (bookingType === "flight") {
      payload.airline = formData.airline || null;
      payload.flightNumber = formData.flightNumber || null;
      payload.departureAirport = formData.departureAirport || null;
      payload.arrivalAirport = formData.arrivalAirport || null;
      payload.departureDate = formData.departureDate || null;
      payload.returnDate = formData.returnDate || null;
      payload.departureTime = formData.departureTime || null;
      payload.arrivalTime = formData.arrivalTime || null;
    } else if (bookingType === "hotel") {
      payload.hotelName = formData.hotelName || null;
      payload.hotelAddress = formData.hotelAddress || null;
      payload.checkInDate = formData.checkInDate || null;
      payload.checkOutDate = formData.checkOutDate || null;
      payload.hotelConfirmationNumber = formData.hotelConfirmationNumber || null;
    } else if (bookingType === "rental_car") {
      payload.rentalCompany = formData.rentalCompany || null;
      payload.pickupLocation = formData.pickupLocation || null;
      payload.dropoffLocation = formData.dropoffLocation || null;
      payload.vehicleType = formData.vehicleType || null;
      payload.rentalConfirmationNumber = formData.rentalConfirmationNumber || null;
      payload.departureDate = formData.departureDate || null;
      payload.returnDate = formData.returnDate || null;
    }

    createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Travel Booking</DialogTitle>
          <DialogDescription>
            Add a new travel booking for a consultant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Booking Type</Label>
            <Select value={bookingType} onValueChange={setBookingType} data-testid="select-booking-type">
              <SelectTrigger data-testid="select-booking-type-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value} data-testid={`option-booking-type-${type.value}`}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Consultant *</Label>
              <Select 
                value={formData.consultantId} 
                onValueChange={(v) => setFormData({ ...formData, consultantId: v })}
                data-testid="select-consultant"
              >
                <SelectTrigger data-testid="select-consultant-trigger">
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map(c => (
                    <SelectItem key={c.id} value={c.id} data-testid={`option-consultant-${c.id}`}>
                      {(c as any).user?.firstName} {(c as any).user?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(v) => setFormData({ ...formData, projectId: v })}
                data-testid="select-project"
              >
                <SelectTrigger data-testid="select-project-trigger">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} data-testid={`option-project-${p.id}`}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {bookingType === "flight" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Airline</Label>
                  <Input
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    placeholder="e.g., Delta, United"
                    data-testid="input-airline"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flight Number</Label>
                  <Input
                    value={formData.flightNumber}
                    onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                    placeholder="e.g., DL123"
                    data-testid="input-flight-number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Airport</Label>
                  <Input
                    value={formData.departureAirport}
                    onChange={(e) => setFormData({ ...formData, departureAirport: e.target.value })}
                    placeholder="e.g., JFK"
                    data-testid="input-departure-airport"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrival Airport</Label>
                  <Input
                    value={formData.arrivalAirport}
                    onChange={(e) => setFormData({ ...formData, arrivalAirport: e.target.value })}
                    placeholder="e.g., LAX"
                    data-testid="input-arrival-airport"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    data-testid="input-departure-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    data-testid="input-return-date"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Time</Label>
                  <Input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    data-testid="input-departure-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrival Time</Label>
                  <Input
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    data-testid="input-arrival-time"
                  />
                </div>
              </div>
            </>
          )}

          {bookingType === "hotel" && (
            <>
              <div className="space-y-2">
                <Label>Hotel Name</Label>
                <Input
                  value={formData.hotelName}
                  onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                  placeholder="e.g., Marriott Downtown"
                  data-testid="input-hotel-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Hotel Address</Label>
                <Input
                  value={formData.hotelAddress}
                  onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                  placeholder="Full address"
                  data-testid="input-hotel-address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    data-testid="input-check-in-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    data-testid="input-check-out-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmation Number</Label>
                <Input
                  value={formData.hotelConfirmationNumber}
                  onChange={(e) => setFormData({ ...formData, hotelConfirmationNumber: e.target.value })}
                  placeholder="Hotel confirmation number"
                  data-testid="input-hotel-confirmation"
                />
              </div>
            </>
          )}

          {bookingType === "rental_car" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rental Company</Label>
                  <Input
                    value={formData.rentalCompany}
                    onChange={(e) => setFormData({ ...formData, rentalCompany: e.target.value })}
                    placeholder="e.g., Enterprise, Hertz"
                    data-testid="input-rental-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Input
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    placeholder="e.g., Sedan, SUV"
                    data-testid="input-vehicle-type"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Location</Label>
                  <Input
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    placeholder="Pickup address or airport"
                    data-testid="input-pickup-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dropoff Location</Label>
                  <Input
                    value={formData.dropoffLocation}
                    onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                    placeholder="Dropoff address or airport"
                    data-testid="input-dropoff-location"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Date</Label>
                  <Input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    data-testid="input-pickup-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    data-testid="input-rental-return-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmation Number</Label>
                <Input
                  value={formData.rentalConfirmationNumber}
                  onChange={(e) => setFormData({ ...formData, rentalConfirmationNumber: e.target.value })}
                  placeholder="Rental confirmation number"
                  data-testid="input-rental-confirmation"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Estimated Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="0.00"
              data-testid="input-estimated-cost"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              data-testid="input-notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-booking">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending}
            data-testid="button-create-booking"
          >
            {createMutation.isPending ? "Creating..." : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingDetailDialog({
  booking,
  open,
  onOpenChange
}: {
  booking: TravelBookingWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      return apiRequest("PATCH", `/api/travel-bookings/${booking?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/travel-bookings'] });
      toast({ title: "Booking updated" });
    },
    onError: () => {
      toast({ title: "Failed to update booking", variant: "destructive" });
    }
  });

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              {getBookingTypeIcon(booking.bookingType)}
            </div>
            <div>
              <DialogTitle>{getBookingTypeLabel(booking.bookingType)} Details</DialogTitle>
              <DialogDescription>
                Booking information and status
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getBookingStatusBadge(booking.status)}
          </div>

          {booking.bookingType === "flight" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Airline</span>
                  <p className="font-medium">{booking.airline || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Flight Number</span>
                  <p className="font-medium">{booking.flightNumber || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">From</span>
                  <p className="font-medium">{booking.departureAirport || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">To</span>
                  <p className="font-medium">{booking.arrivalAirport || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Departure</span>
                  <p className="font-medium">
                    {booking.departureDate ? format(new Date(booking.departureDate), "MMM d, yyyy") : "N/A"}
                    {booking.departureTime ? ` at ${booking.departureTime}` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Arrival</span>
                  <p className="font-medium">
                    {booking.arrivalTime || "N/A"}
                  </p>
                </div>
              </div>
            </>
          )}

          {booking.bookingType === "hotel" && (
            <>
              <div>
                <span className="text-sm text-muted-foreground">Hotel</span>
                <p className="font-medium">{booking.hotelName || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Address</span>
                <p className="font-medium">{booking.hotelAddress || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Check-in</span>
                  <p className="font-medium">
                    {booking.checkInDate ? format(new Date(booking.checkInDate), "MMM d, yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Check-out</span>
                  <p className="font-medium">
                    {booking.checkOutDate ? format(new Date(booking.checkOutDate), "MMM d, yyyy") : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Confirmation</span>
                <p className="font-medium font-mono">{booking.hotelConfirmationNumber || "N/A"}</p>
              </div>
            </>
          )}

          {booking.bookingType === "rental_car" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Company</span>
                  <p className="font-medium">{booking.rentalCompany || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Vehicle Type</span>
                  <p className="font-medium">{booking.vehicleType || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Pickup</span>
                  <p className="font-medium">{booking.pickupLocation || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Dropoff</span>
                  <p className="font-medium">{booking.dropoffLocation || "N/A"}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Confirmation</span>
                <p className="font-medium font-mono">{booking.rentalConfirmationNumber || "N/A"}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Estimated Cost</span>
              <p className="font-medium text-lg">{formatCurrency(booking.estimatedCost)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Actual Cost</span>
              <p className="font-medium text-lg">{formatCurrency(booking.actualCost)}</p>
            </div>
          </div>

          {booking.notes && (
            <div>
              <span className="text-sm text-muted-foreground">Notes</span>
              <p className="text-sm mt-1">{booking.notes}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select 
              value={booking.status} 
              onValueChange={(v) => updateMutation.mutate({ status: v })}
              data-testid="select-update-status"
            >
              <SelectTrigger data-testid="select-update-status-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value} data-testid={`option-status-${s.value}`}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-booking-detail">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItineraryCard({ 
  itinerary,
  onClick 
}: { 
  itinerary: TravelItineraryWithDetails;
  onClick: () => void;
}) {
  return (
    <Card 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`itinerary-card-${itinerary.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{itinerary.tripName}</CardTitle>
              <CardDescription className="text-sm">
                {itinerary.project?.name || "No project"}
              </CardDescription>
            </div>
          </div>
          {getItineraryStatusBadge(itinerary.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(itinerary.startDate), "MMM d")} - {format(new Date(itinerary.endDate), "MMM d, yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Luggage className="h-4 w-4 text-muted-foreground" />
          <span>{itinerary.bookings?.length || 0} bookings</span>
        </div>

        {itinerary.totalEstimatedCost && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(itinerary.totalEstimatedCost)}</span>
          </div>
        )}

        {itinerary.consultant && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {(itinerary.consultant.user.firstName?.[0] || "") + (itinerary.consultant.user.lastName?.[0] || "")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {itinerary.consultant.user.firstName} {itinerary.consultant.user.lastName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateItineraryDialog({
  open,
  onOpenChange,
  consultants,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultants: Consultant[];
  projects: Project[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tripName: "",
    consultantId: "",
    projectId: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/travel-itineraries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/travel-itineraries'] });
      onOpenChange(false);
      resetForm();
      toast({ title: "Itinerary created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create itinerary", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      tripName: "",
      consultantId: "",
      projectId: "",
      startDate: "",
      endDate: "",
      notes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.tripName || !formData.consultantId || !formData.startDate || !formData.endDate) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      tripName: formData.tripName,
      consultantId: formData.consultantId,
      projectId: formData.projectId || null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Travel Itinerary</DialogTitle>
          <DialogDescription>
            Create a new travel itinerary to organize bookings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Trip Name *</Label>
            <Input
              value={formData.tripName}
              onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
              placeholder="e.g., Chicago Project Week 1"
              data-testid="input-trip-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Consultant *</Label>
            <Select 
              value={formData.consultantId} 
              onValueChange={(v) => setFormData({ ...formData, consultantId: v })}
              data-testid="select-itinerary-consultant"
            >
              <SelectTrigger data-testid="select-itinerary-consultant-trigger">
                <SelectValue placeholder="Select consultant" />
              </SelectTrigger>
              <SelectContent>
                {consultants.map(c => (
                  <SelectItem key={c.id} value={c.id} data-testid={`option-itinerary-consultant-${c.id}`}>
                    {(c as any).user?.firstName} {(c as any).user?.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(v) => setFormData({ ...formData, projectId: v })}
              data-testid="select-itinerary-project"
            >
              <SelectTrigger data-testid="select-itinerary-project-trigger">
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id} data-testid={`option-itinerary-project-${p.id}`}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                data-testid="input-itinerary-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                data-testid="input-itinerary-end-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              data-testid="input-itinerary-notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-itinerary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending}
            data-testid="button-create-itinerary"
          >
            {createMutation.isPending ? "Creating..." : "Create Itinerary"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItineraryDetailDialog({
  itinerary,
  open,
  onOpenChange,
  bookings
}: {
  itinerary: TravelItineraryWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: TravelBookingWithDetails[];
}) {
  const { toast } = useToast();
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const addBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return apiRequest("POST", `/api/travel-itineraries/${itinerary?.id}/bookings`, { bookingId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/travel-itineraries'] });
      setShowAddBooking(false);
      setSelectedBookingId("");
      toast({ title: "Booking added to itinerary" });
    },
    onError: () => {
      toast({ title: "Failed to add booking", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      return apiRequest("PATCH", `/api/travel-itineraries/${itinerary?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/travel-itineraries'] });
      toast({ title: "Itinerary updated" });
    },
    onError: () => {
      toast({ title: "Failed to update itinerary", variant: "destructive" });
    }
  });

  if (!itinerary) return null;

  const availableBookings = bookings.filter(
    b => !itinerary.bookings?.some(ib => ib.id === b.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>{itinerary.tripName}</DialogTitle>
              <DialogDescription>
                {format(new Date(itinerary.startDate), "MMM d")} - {format(new Date(itinerary.endDate), "MMM d, yyyy")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getItineraryStatusBadge(itinerary.status)}
          </div>

          {itinerary.project && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{itinerary.project.name}</span>
            </div>
          )}

          {itinerary.consultant && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {(itinerary.consultant.user.firstName?.[0] || "") + (itinerary.consultant.user.lastName?.[0] || "")}
                </AvatarFallback>
              </Avatar>
              <span>
                {itinerary.consultant.user.firstName} {itinerary.consultant.user.lastName}
              </span>
            </div>
          )}

          {itinerary.notes && (
            <div>
              <span className="text-sm text-muted-foreground">Notes</span>
              <p className="text-sm mt-1">{itinerary.notes}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Bookings ({itinerary.bookings?.length || 0})</h3>
              <Button 
                size="sm" 
                onClick={() => setShowAddBooking(!showAddBooking)}
                data-testid="button-add-booking-to-itinerary"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Booking
              </Button>
            </div>

            {showAddBooking && (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <Select 
                  value={selectedBookingId} 
                  onValueChange={setSelectedBookingId}
                  data-testid="select-add-booking"
                >
                  <SelectTrigger className="flex-1" data-testid="select-add-booking-trigger">
                    <SelectValue placeholder="Select a booking to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBookings.map(b => (
                      <SelectItem key={b.id} value={b.id} data-testid={`option-add-booking-${b.id}`}>
                        {getBookingTypeLabel(b.bookingType)} - {b.confirmationNumber || b.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm"
                  onClick={() => addBookingMutation.mutate(selectedBookingId)}
                  disabled={!selectedBookingId || addBookingMutation.isPending}
                  data-testid="button-confirm-add-booking"
                >
                  Add
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowAddBooking(false)}
                  data-testid="button-cancel-add-booking"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {itinerary.bookings?.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-3 border rounded-md"
                    data-testid={`itinerary-booking-${booking.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {getBookingTypeIcon(booking.bookingType)}
                      <div>
                        <p className="font-medium">{getBookingTypeLabel(booking.bookingType)}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.confirmationNumber || booking.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    {getBookingStatusBadge(booking.status)}
                  </div>
                ))}
                {(!itinerary.bookings || itinerary.bookings.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No bookings added to this itinerary
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select 
              value={itinerary.status} 
              onValueChange={(v) => updateMutation.mutate({ status: v })}
              data-testid="select-update-itinerary-status"
            >
              <SelectTrigger data-testid="select-update-itinerary-status-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITINERARY_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value} data-testid={`option-itinerary-status-${s.value}`}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-itinerary-detail">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TravelBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [itineraryStatusFilter, setItineraryStatusFilter] = useState<string>("all");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarTrip, setSelectedCalendarTrip] = useState<TravelBookingWithDetails | null>(null);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [showCreateItinerary, setShowCreateItinerary] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<TravelBookingWithDetails | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<TravelItineraryWithDetails | null>(null);

  const bookingsQueryParams = new URLSearchParams();
  if (bookingTypeFilter !== "all") bookingsQueryParams.set("bookingType", bookingTypeFilter);
  if (bookingStatusFilter !== "all") bookingsQueryParams.set("status", bookingStatusFilter);
  
  const itinerariesQueryParams = new URLSearchParams();
  if (itineraryStatusFilter !== "all") itinerariesQueryParams.set("status", itineraryStatusFilter);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<TravelBookingWithDetails[]>({
    queryKey: ['/api/travel-bookings', bookingsQueryParams.toString()],
  });

  const { data: itineraries = [], isLoading: itinerariesLoading } = useQuery<TravelItineraryWithDetails[]>({
    queryKey: ['/api/travel-itineraries', itinerariesQueryParams.toString()],
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Travel Bookings</h1>
          <p className="text-muted-foreground">Manage travel bookings and itineraries</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-travel">
          <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
          <TabsTrigger value="itineraries" data-testid="tab-itineraries">Itineraries</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar</TabsTrigger>
          <TabsTrigger value="expenses" data-testid="tab-expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          {bookingsLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <BookingStats bookings={bookings} />
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter} data-testid="filter-booking-type">
                <SelectTrigger className="w-[150px]" data-testid="filter-booking-type-trigger">
                  <SelectValue placeholder="Booking Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="filter-type-all">All Types</SelectItem>
                  {BOOKING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} data-testid={`filter-type-${type.value}`}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter} data-testid="filter-booking-status">
                <SelectTrigger className="w-[150px]" data-testid="filter-booking-status-trigger">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="filter-status-all">All Statuses</SelectItem>
                  {BOOKING_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value} data-testid={`filter-status-${status.value}`}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setShowCreateBooking(true)} data-testid="button-new-booking">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>

          {bookingsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plane className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first travel booking to get started.
                </p>
                <Button onClick={() => setShowCreateBooking(true)} data-testid="button-create-first-booking">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Booking
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map(booking => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking}
                  onClick={() => setSelectedBooking(booking)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="itineraries" className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Select value={itineraryStatusFilter} onValueChange={setItineraryStatusFilter} data-testid="filter-itinerary-status">
              <SelectTrigger className="w-[150px]" data-testid="filter-itinerary-status-trigger">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="filter-itinerary-status-all">All Statuses</SelectItem>
                {ITINERARY_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value} data-testid={`filter-itinerary-status-${status.value}`}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setShowCreateItinerary(true)} data-testid="button-new-itinerary">
              <Plus className="h-4 w-4 mr-2" />
              New Itinerary
            </Button>
          </div>

          {itinerariesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : itineraries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Route className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No itineraries found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first travel itinerary to organize bookings.
                </p>
                <Button onClick={() => setShowCreateItinerary(true)} data-testid="button-create-first-itinerary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Itinerary
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {itineraries.map(itinerary => (
                <ItineraryCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  onClick={() => setSelectedItinerary(itinerary)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6" data-testid="tab-content-calendar">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Travel Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                    data-testid="button-prev-month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[140px] text-center" data-testid="calendar-month-display">
                    {format(calendarMonth, "MMMM yyyy")}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
                {(() => {
                  const monthStart = startOfMonth(calendarMonth);
                  const monthEnd = endOfMonth(calendarMonth);
                  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  const startPadding = monthStart.getDay();
                  const cells = [];

                  // Add empty cells for padding
                  for (let i = 0; i < startPadding; i++) {
                    cells.push(<div key={`pad-${i}`} className="h-24 border rounded-lg bg-muted/20" />);
                  }

                  // Add day cells
                  days.forEach(day => {
                    const dayBookings = bookings.filter(b => {
                      const depDate = b.departureDate ? parseISO(b.departureDate) : null;
                      const retDate = b.returnDate ? parseISO(b.returnDate) : null;
                      if (depDate && isSameDay(day, depDate)) return true;
                      if (retDate && isSameDay(day, retDate)) return true;
                      return false;
                    });

                    cells.push(
                      <div
                        key={day.toISOString()}
                        className={`h-24 border rounded-lg p-1 overflow-hidden hover:bg-muted/50 cursor-pointer ${
                          isSameDay(day, new Date()) ? 'ring-2 ring-primary' : ''
                        }`}
                        data-testid="calendar-day"
                        onClick={() => dayBookings.length > 0 && setSelectedCalendarTrip(dayBookings[0])}
                      >
                        <div className="text-sm font-medium">{format(day, 'd')}</div>
                        <div className="space-y-1 overflow-hidden">
                          {dayBookings.slice(0, 2).map(booking => (
                            <div
                              key={booking.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${
                                booking.bookingType === 'flight' ? 'bg-blue-100 text-blue-800' :
                                booking.bookingType === 'hotel' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}
                              data-testid="calendar-booking-item"
                            >
                              {getBookingTypeIcon(booking.bookingType)} {booking.bookingType === 'flight' ? booking.flightNumber : booking.hotelName || booking.rentalCompany}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{dayBookings.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  });

                  return cells;
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Trip Details Panel */}
          {selectedCalendarTrip && (
            <Card data-testid="trip-details-panel">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {getBookingTypeIcon(selectedCalendarTrip.bookingType)}
                    Trip Details
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCalendarTrip(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-medium">{getBookingTypeLabel(selectedCalendarTrip.bookingType)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Dates</div>
                    <div className="font-medium">
                      {selectedCalendarTrip.departureDate && format(parseISO(selectedCalendarTrip.departureDate), 'MMM d, yyyy')}
                      {selectedCalendarTrip.returnDate && ` - ${format(parseISO(selectedCalendarTrip.returnDate), 'MMM d, yyyy')}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    {getBookingStatusBadge(selectedCalendarTrip.status)}
                  </div>
                  {selectedCalendarTrip.estimatedCost && (
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated Cost</div>
                      <div className="font-medium">${parseFloat(selectedCalendarTrip.estimatedCost).toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6" data-testid="tab-content-expenses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Travel Expenses
              </CardTitle>
              <CardDescription>Track and manage expenses linked to travel bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Expense Summary */}
              <div className="grid gap-4 md:grid-cols-3 mb-6" data-testid="expense-summary">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Total Travel Costs</div>
                    <div className="text-2xl font-bold" data-testid="total-travel-costs">
                      ${bookings.reduce((sum, b) => sum + parseFloat(b.estimatedCost || '0'), 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Flights</div>
                    <div className="text-2xl font-bold">
                      ${bookings.filter(b => b.bookingType === 'flight').reduce((sum, b) => sum + parseFloat(b.estimatedCost || '0'), 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Hotels & Cars</div>
                    <div className="text-2xl font-bold">
                      ${bookings.filter(b => b.bookingType !== 'flight').reduce((sum, b) => sum + parseFloat(b.estimatedCost || '0'), 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expense List */}
              <div className="space-y-4" data-testid="expense-list">
                <h3 className="font-semibold">Booking Expenses</h3>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No travel expenses to display
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookings.map(booking => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        data-testid="expense-item"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-muted rounded-lg">
                            {getBookingTypeIcon(booking.bookingType)}
                          </div>
                          <div>
                            <div className="font-medium">
                              {booking.bookingType === 'flight' ? `${booking.airline} - ${booking.flightNumber}` :
                               booking.bookingType === 'hotel' ? booking.hotelName :
                               `${booking.rentalCompany} - ${booking.vehicleType}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.departureDate && format(parseISO(booking.departureDate), 'MMM d, yyyy')}
                              {booking.returnDate && ` - ${format(parseISO(booking.returnDate), 'MMM d, yyyy')}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold" data-testid="expense-amount">
                            ${parseFloat(booking.estimatedCost || '0').toFixed(2)}
                          </div>
                          {getBookingStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateBookingDialog
        open={showCreateBooking}
        onOpenChange={setShowCreateBooking}
        consultants={consultants}
        projects={projects}
      />

      <CreateItineraryDialog
        open={showCreateItinerary}
        onOpenChange={setShowCreateItinerary}
        consultants={consultants}
        projects={projects}
      />

      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      />

      <ItineraryDetailDialog
        itinerary={selectedItinerary}
        open={!!selectedItinerary}
        onOpenChange={(open) => !open && setSelectedItinerary(null)}
        bookings={bookings}
      />
    </div>
  );
}
