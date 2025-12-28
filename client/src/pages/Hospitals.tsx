import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Building2, MapPin, Phone, Mail, Globe, Pencil, Trash2, Search, Shield, Server, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Hospital } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

const hospitalFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),

  // Organizational Info
  facilityType: z.string().optional(),
  bedCount: z.coerce.number().optional(),
  traumaLevel: z.string().optional(),
  teachingStatus: z.string().optional(),
  ownershipType: z.string().optional(),
  healthSystemAffiliation: z.string().optional(),
  npiNumber: z.string().optional(),
  cmsNumber: z.string().optional(),

  // Technical/IT Info
  emrSystem: z.string().optional(),
  currentEmrVersion: z.string().optional(),
  targetEmrSystem: z.string().optional(),
  dataCenter: z.string().optional(),
  itStaffCount: z.coerce.number().optional(),
  networkInfrastructure: z.string().optional(),

  // Implementation-Specific
  goLiveDate: z.string().optional(),
  implementationPhase: z.string().optional(),
  contractValue: z.string().optional(),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().email().optional().or(z.literal("")),
  primaryContactPhone: z.string().optional(),
  executiveSponsor: z.string().optional(),

  // Compliance
  jointCommissionAccredited: z.boolean().optional(),
  lastAuditDate: z.string().optional(),
  hipaaOfficerName: z.string().optional(),
  hipaaOfficerEmail: z.string().email().optional().or(z.literal("")),

  // General
  totalStaff: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type HospitalFormValues = z.infer<typeof hospitalFormSchema>;

// Constants for dropdown options
const FACILITY_TYPES = ["Acute Care", "Ambulatory", "Long-term Care", "Behavioral Health", "Rehabilitation", "Critical Access"];
const TRAUMA_LEVELS = ["Level I", "Level II", "Level III", "Level IV", "Level V", "None"];
const TEACHING_STATUSES = ["Academic Medical Center", "Teaching Affiliate", "Community Hospital"];
const OWNERSHIP_TYPES = ["Non-profit", "For-profit", "Government", "Religious", "Public"];
const EMR_SYSTEMS = ["Epic", "Cerner", "Meditech", "Allscripts", "athenahealth", "eClinicalWorks", "NextGen", "Other"];
const DATA_CENTER_TYPES = ["On-premise", "Cloud", "Hybrid"];
const IMPLEMENTATION_PHASES = ["Discovery", "Planning", "Design", "Build", "Testing", "Training", "Go-Live", "Optimization", "Completed"];

export default function Hospitals() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: hospitals, isLoading } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  // Filter hospitals based on search term
  const filteredHospitals = hospitals?.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.emrSystem?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      website: "",
      facilityType: "",
      bedCount: 0,
      traumaLevel: "",
      teachingStatus: "",
      ownershipType: "",
      healthSystemAffiliation: "",
      npiNumber: "",
      cmsNumber: "",
      emrSystem: "",
      currentEmrVersion: "",
      targetEmrSystem: "",
      dataCenter: "",
      itStaffCount: 0,
      networkInfrastructure: "",
      goLiveDate: "",
      implementationPhase: "",
      contractValue: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      executiveSponsor: "",
      jointCommissionAccredited: false,
      lastAuditDate: "",
      hipaaOfficerName: "",
      hipaaOfficerEmail: "",
      totalStaff: 0,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: HospitalFormValues) => {
      return await apiRequest("POST", "/api/hospitals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals"] });
      toast({ title: "Hospital created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create hospital", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: HospitalFormValues }) => {
      return await apiRequest("PATCH", `/api/hospitals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals"] });
      toast({ title: "Hospital updated successfully" });
      setIsDialogOpen(false);
      setEditingHospital(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update hospital", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/hospitals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals"] });
      toast({ title: "Hospital deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete hospital", variant: "destructive" });
    },
  });

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    form.reset({
      name: hospital.name,
      address: hospital.address || "",
      city: hospital.city || "",
      state: hospital.state || "",
      zipCode: hospital.zipCode || "",
      phone: hospital.phone || "",
      email: hospital.email || "",
      website: hospital.website || "",
      facilityType: (hospital as any).facilityType || "",
      bedCount: (hospital as any).bedCount || 0,
      traumaLevel: (hospital as any).traumaLevel || "",
      teachingStatus: (hospital as any).teachingStatus || "",
      ownershipType: (hospital as any).ownershipType || "",
      healthSystemAffiliation: (hospital as any).healthSystemAffiliation || "",
      npiNumber: (hospital as any).npiNumber || "",
      cmsNumber: (hospital as any).cmsNumber || "",
      emrSystem: hospital.emrSystem || "",
      currentEmrVersion: (hospital as any).currentEmrVersion || "",
      targetEmrSystem: (hospital as any).targetEmrSystem || "",
      dataCenter: (hospital as any).dataCenter || "",
      itStaffCount: (hospital as any).itStaffCount || 0,
      networkInfrastructure: (hospital as any).networkInfrastructure || "",
      goLiveDate: (hospital as any).goLiveDate ? new Date((hospital as any).goLiveDate).toISOString().split('T')[0] : "",
      implementationPhase: (hospital as any).implementationPhase || "",
      contractValue: (hospital as any).contractValue || "",
      primaryContactName: (hospital as any).primaryContactName || "",
      primaryContactEmail: (hospital as any).primaryContactEmail || "",
      primaryContactPhone: (hospital as any).primaryContactPhone || "",
      executiveSponsor: (hospital as any).executiveSponsor || "",
      jointCommissionAccredited: (hospital as any).jointCommissionAccredited || false,
      lastAuditDate: (hospital as any).lastAuditDate ? new Date((hospital as any).lastAuditDate).toISOString().split('T')[0] : "",
      hipaaOfficerName: (hospital as any).hipaaOfficerName || "",
      hipaaOfficerEmail: (hospital as any).hipaaOfficerEmail || "",
      totalStaff: hospital.totalStaff || 0,
      notes: (hospital as any).notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: HospitalFormValues) => {
    if (editingHospital) {
      updateMutation.mutate({ id: editingHospital.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingHospital(null);
      form.reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-hospitals-title">Hospitals</h1>
          <p className="text-muted-foreground">Manage hospitals and their units</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-hospital">
                <Plus className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-create-hospital">
              <DialogHeader>
                <DialogTitle>{editingHospital ? "Edit Hospital" : "Add Hospital"}</DialogTitle>
                <DialogDescription>
                  {editingHospital ? "Update hospital information" : "Enter the hospital details below"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="organization">Organization</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                      <TabsTrigger value="implementation">Implementation</TabsTrigger>
                      <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter hospital name" data-testid="input-hospital-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter address" data-testid="input-hospital-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="City" data-testid="input-hospital-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="State" data-testid="input-hospital-state" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zip Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Zip Code" data-testid="input-hospital-zip" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Phone number" data-testid="input-hospital-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="Email" data-testid="input-hospital-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Website URL" data-testid="input-hospital-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Organization Tab */}
                    <TabsContent value="organization" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="facilityType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facility Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select facility type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FACILITY_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bedCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bed Count</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="Number of beds" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="traumaLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trauma Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select trauma level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TRAUMA_LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="teachingStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teaching Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select teaching status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TEACHING_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="ownershipType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ownership Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ownership type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {OWNERSHIP_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="totalStaff"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Staff</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="Number of staff" data-testid="input-hospital-staff" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="healthSystemAffiliation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Health System Affiliation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Parent health system name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="npiNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NPI Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="National Provider Identifier" />
                              </FormControl>
                              <FormDescription>10-digit National Provider Identifier</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cmsNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CMS Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="CMS Certification Number" />
                              </FormControl>
                              <FormDescription>CMS Certification Number (CCN)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Technical Tab */}
                    <TabsContent value="technical" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="emrSystem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current EMR System</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select EMR system" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EMR_SYSTEMS.map((emr) => (
                                    <SelectItem key={emr} value={emr}>{emr}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentEmrVersion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current EMR Version</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Epic 2024, Cerner Millennium 2023" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="targetEmrSystem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target EMR System</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Migrating to..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EMR_SYSTEMS.map((emr) => (
                                    <SelectItem key={emr} value={emr}>{emr}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>Leave empty if not migrating</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dataCenter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Center</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select data center type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {DATA_CENTER_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="itStaffCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IT Staff Count</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="Number of IT staff" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="networkInfrastructure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Network Infrastructure Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Notes on network readiness, bandwidth, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Implementation Tab */}
                    <TabsContent value="implementation" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="implementationPhase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Implementation Phase</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select current phase" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {IMPLEMENTATION_PHASES.map((phase) => (
                                    <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="goLiveDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Go-Live Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="contractValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contract Value</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., $500,000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Primary Contact
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="primaryContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Contact name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="primaryContactEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="Contact email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="primaryContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Contact phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="executiveSponsor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Executive Sponsor</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="C-suite sponsor name and title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Additional notes about this hospital..." rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Compliance Tab */}
                    <TabsContent value="compliance" className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="jointCommissionAccredited"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Joint Commission Accredited</FormLabel>
                              <FormDescription>
                                Hospital is accredited by The Joint Commission (TJC)
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastAuditDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Audit Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormDescription>Most recent compliance audit</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          HIPAA Officer
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="hipaaOfficerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="HIPAA officer name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="hipaaOfficerEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="HIPAA officer email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-hospital">
                      {editingHospital ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search hospitals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="hospitals-list">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHospitals && filteredHospitals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="hospitals-list">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="hover-elevate" data-testid="hospital-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg" data-testid="hospital-name">{hospital.name}</CardTitle>
                  </div>
                  <Badge variant={hospital.isActive ? "default" : "secondary"}>
                    {hospital.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {hospital.emrSystem && (
                  <CardDescription>EMR: {hospital.emrSystem}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {(hospital.city || hospital.state) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{[hospital.city, hospital.state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {hospital.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
                {hospital.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{hospital.email}</span>
                  </div>
                )}
                {hospital.totalStaff && (
                  <p className="text-sm text-muted-foreground">
                    Staff: {hospital.totalStaff}
                  </p>
                )}
                {isAdmin && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(hospital)}
                      data-testid="button-edit-hospital"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(hospital.id)}
                      disabled={deleteMutation.isPending}
                      data-testid="button-delete-hospital"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card data-testid="hospitals-empty">
          <CardContent className="py-10 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hospitals yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first hospital.</p>
            {isAdmin && (
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-hospital">
                <Plus className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}