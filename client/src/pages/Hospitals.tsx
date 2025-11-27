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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Building2, MapPin, Phone, Mail, Globe, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Hospital } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const hospitalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  emrSystem: z.string().optional(),
  totalStaff: z.coerce.number().optional(),
});

type HospitalFormValues = z.infer<typeof hospitalFormSchema>;

export default function Hospitals() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const { data: hospitals, isLoading } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

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
      emrSystem: "",
      totalStaff: 0,
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
      emrSystem: hospital.emrSystem || "",
      totalStaff: hospital.totalStaff || 0,
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
              <Button data-testid="button-add-hospital">
                <Plus className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHospital ? "Edit Hospital" : "Add Hospital"}</DialogTitle>
                <DialogDescription>
                  {editingHospital ? "Update hospital information" : "Enter the hospital details below"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

                  <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="emrSystem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EMR System</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="EMR System" data-testid="input-hospital-emr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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

                  <DialogFooter>
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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      ) : hospitals && hospitals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="hover-elevate" data-testid={`card-hospital-${hospital.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{hospital.name}</CardTitle>
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
                      data-testid={`button-edit-hospital-${hospital.id}`}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(hospital.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-hospital-${hospital.id}`}
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
        <Card>
          <CardContent className="py-10 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hospitals yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first hospital.</p>
            {isAdmin && (
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-hospital">
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
