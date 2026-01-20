import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  MapPin,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Building,
  Award,
  FileText,
  Calendar,
  Clock,
  ChevronLeft,
  SlidersHorizontal,
  Download,
  AlertCircle,
  Loader2
} from "lucide-react";
import type { Consultant, User } from "@shared/schema";

interface ConsultantWithUser extends Consultant {
  user?: User;
}

interface ConsultantDocument {
  id: string;
  consultantId: string;
  documentTypeId: string;
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  expirationDate?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Summary Card Component
function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  variant = "default",
  isLoading = false,
  testId
}: { 
  title: string;
  value: number | string;
  icon: typeof Users;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
  isLoading?: boolean;
  testId?: string;
}) {
  const variantStyles = {
    default: "text-muted-foreground",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <Card data-testid={testId}>
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

export default function Consultants() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const searchString = useSearch();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [shiftFilter, setShiftFilter] = useState<string>("all");
  const [onboardedFilter, setOnboardedFilter] = useState<string>("all");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Sort state for drill-down support
  const [sortBy, setSortBy] = useState<string>("");

  // Read filter from URL query params (drill-down support)
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const availabilityParam = params.get("availability");
    const sortParam = params.get("sort");
    if (availabilityParam) {
      setAvailabilityFilter(availabilityParam);
    }
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchString]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tngId: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    location: "",
    yearsExperience: 0,
    shiftPreference: "" as "day" | "night" | "swing" | "",
    bio: "",
    payRate: "",
    emrSystems: [] as string[],
    modules: [] as string[],
  });

  // Queries
  const { data: consultants, isLoading } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
  });

  // Fetch documents for selected consultant
  const { data: consultantDocuments, isLoading: isLoadingDocuments } = useQuery<ConsultantDocument[]>({
    queryKey: ["/api/consultants", selectedConsultant?.id, "documents"],
    queryFn: async () => {
      if (!selectedConsultant?.id) return [];
      const response = await fetch(`/api/consultants/${selectedConsultant.id}/documents`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
    enabled: !!selectedConsultant?.id && isViewModalOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Consultant>) => {
      const response = await apiRequest("POST", "/api/consultants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({ title: "Success", description: "Consultant created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Consultant> }) => {
      const response = await apiRequest("PATCH", `/api/consultants/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
      setIsEditModalOpen(false);
      setSelectedConsultant(null);
      resetForm();
      toast({ title: "Success", description: "Consultant updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/consultants/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
      setIsDeleteDialogOpen(false);
      setSelectedConsultant(null);
      toast({ title: "Success", description: "Consultant deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      tngId: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      location: "",
      yearsExperience: 0,
      shiftPreference: "",
      bio: "",
      payRate: "",
      emrSystems: [],
      modules: [],
    });
  };

  const openEditModal = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setFormData({
      tngId: consultant.tngId || "",
      phone: consultant.phone || "",
      address: consultant.address || "",
      city: consultant.city || "",
      state: consultant.state || "",
      zipCode: consultant.zipCode || "",
      location: consultant.location || "",
      yearsExperience: consultant.yearsExperience || 0,
      shiftPreference: consultant.shiftPreference || "",
      bio: consultant.bio || "",
      payRate: consultant.payRate?.toString() || "",
      emrSystems: consultant.emrSystems || [],
      modules: consultant.modules || [],
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setIsViewModalOpen(true);
  };

  const openDeleteDialog = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      shiftPreference: formData.shiftPreference || null,
    });
  };

  const handleUpdate = () => {
    if (selectedConsultant) {
      updateMutation.mutate({
        id: selectedConsultant.id,
        data: {
          ...formData,
          shiftPreference: formData.shiftPreference || null,
        },
      });
    }
  };

  const handleDelete = () => {
    if (selectedConsultant) {
      deleteMutation.mutate(selectedConsultant.id);
    }
  };

  // Filter consultants
  const filteredConsultants = consultants?.filter((consultant) => {
    const matchesSearch = !searchTerm || 
      consultant.tngId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.state?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = availabilityFilter === "all" || 
      (availabilityFilter === "available" ? consultant.isAvailable : !consultant.isAvailable);

    const matchesShift = shiftFilter === "all" || consultant.shiftPreference === shiftFilter;

    const matchesOnboarded = onboardedFilter === "all" ||
      (onboardedFilter === "onboarded" ? consultant.isOnboarded : !consultant.isOnboarded);

    return matchesSearch && matchesAvailability && matchesShift && matchesOnboarded;
  });

  // Calculate summary stats
  const totalConsultants = consultants?.length || 0;
  const availableConsultants = consultants?.filter(c => c.isAvailable).length || 0;
  const onboardedConsultants = consultants?.filter(c => c.isOnboarded).length || 0;
  const pendingOnboarding = totalConsultants - onboardedConsultants;

  const getInitials = (consultant: any) => {
    const firstName = consultant.user?.firstName || "";
    const lastName = consultant.user?.lastName || "";
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return consultant.tngId?.substring(0, 2).toUpperCase() || "C";
  };

  const getConsultantName = (consultant: any) => {
    const firstName = consultant.user?.firstName;
    const lastName = consultant.user?.lastName;
    if (firstName || lastName) {
      return `${firstName || ""} ${lastName || ""}`.trim();
    }
    return consultant.tngId || "N/A";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setAvailabilityFilter("all");
    setShiftFilter("all");
    setOnboardedFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-consultants-title">Consultants</h1>
          <p className="text-muted-foreground">Manage consultant profiles and assignments</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-consultant">
            <Plus className="w-4 h-4 mr-2" />
            Add Consultant
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Consultants"
          value={totalConsultants}
          icon={Users}
          isLoading={isLoading}
          testId="summary-total"
        />
        <SummaryCard
          title="Available"
          value={availableConsultants}
          icon={CheckCircle}
          variant="success"
          isLoading={isLoading}
          testId="summary-available"
        />
        <SummaryCard
          title="Onboarded"
          value={onboardedConsultants}
          icon={Award}
          variant="success"
          isLoading={isLoading}
          testId="summary-onboarded"
        />
        <SummaryCard
          title="Pending Onboarding"
          value={pendingOnboarding}
          icon={Clock}
          variant="warning"
          isLoading={isLoading}
          testId="summary-pending"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              data-testid="button-advanced-search"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {showAdvancedSearch ? "Simple" : "Advanced"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger data-testid="filter-availability">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger data-testid="filter-shift">
                <SelectValue placeholder="Shift Preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="swing">Swing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={onboardedFilter} onValueChange={setOnboardedFilter}>
              <SelectTrigger data-testid="filter-onboarded">
                <SelectValue placeholder="Onboarding Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="onboarded">Onboarded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showAdvancedSearch && (
            <div className="mt-4 pt-4 border-t" data-testid="advanced-search-panel">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Min Experience (years)</Label>
                  <Input type="number" placeholder="0" data-testid="input-min-experience" />
                </div>
                <div>
                  <Label>EMR System</Label>
                  <Select>
                    <SelectTrigger data-testid="filter-ehr">
                      <SelectValue placeholder="Select EMR" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="cerner">Cerner</SelectItem>
                      <SelectItem value="meditech">Meditech</SelectItem>
                      <SelectItem value="allscripts">Allscripts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Skills</Label>
                  <Select>
                    <SelectTrigger data-testid="filter-skills">
                      <SelectValue placeholder="Select Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="implementation">Implementation</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                  Clear Filters
                </Button>
                <Button size="sm" data-testid="button-apply-filters">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Consultant List</CardTitle>
          <CardDescription>
            {filteredConsultants?.length || 0} consultant(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredConsultants && filteredConsultants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table data-testid="consultants-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody data-testid="consultants-list">
                  {filteredConsultants.map((consultant) => (
                    <TableRow 
                      key={consultant.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      data-testid="consultant-row"
                      onClick={() => openViewModal(consultant)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getInitials(consultant)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium" data-testid="consultant-name">{getConsultantName(consultant)}</p>
                            <p className="text-sm text-muted-foreground">{consultant.phone || "No phone"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{consultant.city && consultant.state ? `${consultant.city}, ${consultant.state}` : consultant.location || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={consultant.isAvailable ? "default" : "secondary"} data-testid="consultant-availability">
                            {consultant.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                          {consultant.isOnboarded ? (
                            <Badge variant="outline" className="text-green-600 w-fit">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Onboarded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 w-fit">
                              <XCircle className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {consultant.shiftPreference ? (
                          <Badge variant="outline" className="capitalize">
                            {consultant.shiftPreference}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {consultant.yearsExperience || 0} years
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewModal(consultant)}
                            data-testid="button-view-consultant"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(consultant)}
                                data-testid="button-edit-consultant"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(consultant)}
                                data-testid="button-delete-consultant"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10" data-testid="consultants-empty">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No consultants found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || availabilityFilter !== "all" || shiftFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first consultant to get started"}
              </p>
              {isAdmin && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Consultant
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedConsultant(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-consultant">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? "Edit Consultant" : "Add New Consultant"}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? "Update consultant information" : "Enter the consultant's details below"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tngId">TNG ID *</Label>
                <Input
                  id="tngId"
                  value={formData.tngId}
                  onChange={(e) => setFormData({ ...formData, tngId: e.target.value })}
                  placeholder="Enter TNG ID"
                  data-testid="input-tng-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                data-testid="input-address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  data-testid="input-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  data-testid="input-state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="ZIP"
                  data-testid="input-zip"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  data-testid="input-years-experience"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shiftPreference">Shift Preference</Label>
                <Select
                  value={formData.shiftPreference}
                  onValueChange={(value) => setFormData({ ...formData, shiftPreference: value as "day" | "night" | "swing" })}
                >
                  <SelectTrigger data-testid="select-shift-preference">
                    <SelectValue placeholder="Select shift" />
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
              <Label htmlFor="payRate">Pay Rate ($/hr)</Label>
              <Input
                id="payRate"
                type="number"
                value={formData.payRate}
                onChange={(e) => setFormData({ ...formData, payRate: e.target.value })}
                placeholder="0.00"
                data-testid="input-pay-rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief description..."
                rows={3}
                data-testid="input-bio"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={isEditModalOpen ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit-consultant"
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : isEditModalOpen ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="consultant-profile">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{selectedConsultant ? getInitials(selectedConsultant) : "C"}</AvatarFallback>
              </Avatar>
              <div>
                <span data-testid="consultant-name">{selectedConsultant ? getConsultantName(selectedConsultant) : "Consultant"}</span>
                <p className="text-sm font-normal text-muted-foreground">
                  {selectedConsultant?.city && selectedConsultant?.state 
                    ? `${selectedConsultant.city}, ${selectedConsultant.state}` 
                    : selectedConsultant?.location || "No location"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedConsultant && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="certifications" data-testid="tab-certifications">Certifications</TabsTrigger>
                <TabsTrigger value="skills" data-testid="tab-skills">Skills</TabsTrigger>
                <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2" data-testid="consultant-phone">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedConsultant.phone || "No phone"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {selectedConsultant.address && `${selectedConsultant.address}, `}
                          {selectedConsultant.city}, {selectedConsultant.state} {selectedConsultant.zipCode}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Availability</span>
                        <Badge variant={selectedConsultant.isAvailable ? "default" : "secondary"}>
                          {selectedConsultant.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Onboarding</span>
                        <Badge variant={selectedConsultant.isOnboarded ? "default" : "secondary"}>
                          {selectedConsultant.isOnboarded ? "Complete" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Shift</span>
                        <span className="capitalize">{selectedConsultant.shiftPreference || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Experience & Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Years Experience</p>
                        <p className="font-medium">{selectedConsultant.yearsExperience || 0} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Pay Rate</p>
                        <p className="font-medium">${selectedConsultant.payRate || "N/A"}/hr</p>
                      </div>
                    </div>
                    {selectedConsultant.emrSystems && selectedConsultant.emrSystems.length > 0 && (
                      <div className="mt-4" data-testid="consultant-certifications">
                        <p className="text-muted-foreground text-sm mb-2">EMR Systems</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedConsultant.emrSystems.map((system, idx) => (
                            <Badge key={idx} variant="secondary">{system}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedConsultant.modules && selectedConsultant.modules.length > 0 && (
                      <div className="mt-4" data-testid="consultant-skills">
                        <p className="text-muted-foreground text-sm mb-2">Modules</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedConsultant.modules.map((mod, idx) => (
                            <Badge key={idx} variant="outline">{mod}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedConsultant.bio && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Bio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedConsultant.bio}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="certifications" className="mt-4">
                <Card data-testid="certifications-list">
                  <CardHeader>
                    <CardTitle className="text-sm">EMR Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedConsultant.emrSystems && selectedConsultant.emrSystems.length > 0 ? (
                      <div className="space-y-2">
                        {selectedConsultant.emrSystems.map((system, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg" data-testid="certification-item">
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-primary" />
                              <span>{system}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600">Verified</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No certifications on file</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="mt-4">
                <Card data-testid="skill-categories">
                  <CardHeader>
                    <CardTitle className="text-sm">Skills & Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedConsultant.modules && selectedConsultant.modules.length > 0 ? (
                      <div className="space-y-2">
                        {selectedConsultant.modules.map((mod, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg" data-testid="skill-item">
                            <span>{mod}</span>
                            <Badge variant="secondary">Expert</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No skills on file</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card data-testid="documents-list">
                  <CardHeader>
                    <CardTitle className="text-sm">Documents</CardTitle>
                    <CardDescription>
                      {consultantDocuments?.length || 0} document(s) on file
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDocuments ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading documents...</span>
                      </div>
                    ) : consultantDocuments && consultantDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {consultantDocuments.map((doc) => {
                          const isExpiringSoon = doc.expirationDate &&
                            new Date(doc.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                          const isExpired = doc.expirationDate &&
                            new Date(doc.expirationDate) < new Date();

                          return (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                              data-testid="document-item"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{doc.fileName}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                                    {doc.expirationDate && (
                                      <>
                                        <span>•</span>
                                        <span className={isExpired ? "text-red-500" : isExpiringSoon ? "text-yellow-500" : ""}>
                                          {isExpired ? "Expired" : "Expires"} {new Date(doc.expirationDate).toLocaleDateString()}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {doc.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    doc.status === "approved" ? "default" :
                                    doc.status === "pending" ? "secondary" : "destructive"
                                  }
                                  className={
                                    doc.status === "approved" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                    doc.status === "pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" : ""
                                  }
                                >
                                  {doc.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {doc.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                  {doc.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </Badge>
                                {isExpired && (
                                  <Badge variant="destructive" className="bg-red-100 text-red-700">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Expired
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No documents uploaded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Consultant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedConsultant?.tngId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}