import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, MapPin, Phone, Mail, Calendar, Clock, CheckCircle, AlertCircle, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Consultant } from "@shared/schema";

const profileFormSchema = z.object({
  location: z.string().optional(),
  phone: z.string().optional(),
  shiftPreference: z.enum(["day", "night", "swing"]).optional(),
  payRate: z.string().optional(),
  yearsExperience: z.coerce.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: consultant, isLoading } = useQuery<Consultant>({
    queryKey: ["/api/consultants/user", user?.id],
    enabled: !!user?.id,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      location: consultant?.location || "",
      phone: consultant?.phone || "",
      shiftPreference: consultant?.shiftPreference as any,
      payRate: consultant?.payRate || "",
      yearsExperience: consultant?.yearsExperience || 0,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PATCH", `/api/consultants/${consultant?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants/user", user?.id] });
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const handleSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-20 w-20 rounded-full mb-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-profile-title">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your consultant profile and availability
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.[0]}{user?.lastName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-muted-foreground">{consultant?.tngId || "Consultant"}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {consultant?.isOnboarded ? (
                <Badge variant="default">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Onboarded
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Onboarding
                </Badge>
              )}
              {consultant?.isAvailable ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Available
                </Badge>
              ) : (
                <Badge variant="outline">
                  Unavailable
                </Badge>
              )}
            </div>

            <div className="w-full mt-6 space-y-2 text-left">
              {consultant?.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{consultant.location}</span>
                </div>
              )}
              {consultant?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{consultant.phone}</span>
                </div>
              )}
              {user?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City, State" data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shiftPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shift Preference</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-shift">
                              <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="night">Night</SelectItem>
                            <SelectItem value="swing">Swing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" data-testid="input-experience" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="payRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Rate ($/hr)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Hourly rate" data-testid="input-payrate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {consultant?.emrSystems && consultant.emrSystems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>EMR Systems</CardTitle>
            <CardDescription>
              Systems you are certified to work with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {consultant.emrSystems.map((system, idx) => (
                <Badge key={idx} variant="secondary">
                  {system}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {consultant?.modules && consultant.modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>
              Hospital modules you are trained on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {consultant.modules.map((module, idx) => (
                <Badge key={idx} variant="outline">
                  {module}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
