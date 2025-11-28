import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, Save, Linkedin, Globe, Mail, CheckCircle, AlertCircle, ClipboardCheck, ExternalLink, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Consultant, User } from "@shared/schema";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  phone: z.string().optional(),
  shiftPreference: z.enum(["day", "night", "swing"]).optional().nullable(),
  yearsExperience: z.coerce.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();

  const { data: consultant, isLoading: consultantLoading, error: consultantError } = useQuery<Consultant>({
    queryKey: ["/api/consultants/user", user?.id],
    enabled: !!user?.id,
    retry: 1,
  });

  // Fetch skills questionnaire data
  interface QuestionnaireData {
    id?: string;
    status: string;
    skills?: Array<{ skillItemId: string; proficiency: string; yearsExperience?: number }>;
    ehrExperience?: Array<{ ehrSystem: string; proficiency: string; yearsExperience: number }>;
    lastSavedAt?: string;
  }
  
  const { data: questionnaire } = useQuery<QuestionnaireData | null>({
    queryKey: ["/api/questionnaire"],
    enabled: !!user?.id,
  });

  // Fetch skill categories for skill names
  interface SkillCategory {
    id: string;
    name: string;
    displayName: string;
    items: Array<{ id: string; displayName: string }>;
  }
  
  const { data: skillCategories } = useQuery<SkillCategory[]>({
    queryKey: ["/api/skills/all"],
    enabled: !!questionnaire?.skills && questionnaire.skills.length > 0,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      linkedinUrl: "",
      websiteUrl: "",
      location: "",
      phone: "",
      shiftPreference: undefined,
      yearsExperience: 0,
    },
  });

  useEffect(() => {
    if (user && consultant) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: consultant.bio || "",
        linkedinUrl: user.linkedinUrl || "",
        websiteUrl: user.websiteUrl || "",
        location: consultant.location || "",
        phone: consultant.phone || "",
        shiftPreference: consultant.shiftPreference as any,
        yearsExperience: consultant.yearsExperience || 0,
      });
    }
  }, [user, consultant, form]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; linkedinUrl?: string; websiteUrl?: string }) => {
      return await apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const updateConsultantMutation = useMutation({
    mutationFn: async (data: Partial<Consultant>) => {
      return await apiRequest("PATCH", `/api/consultants/${consultant?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants/user", user?.id] });
    },
  });

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      await Promise.all([
        updateUserMutation.mutateAsync({
          firstName: data.firstName,
          lastName: data.lastName,
          linkedinUrl: data.linkedinUrl || undefined,
          websiteUrl: data.websiteUrl || undefined,
        }),
        consultant && updateConsultantMutation.mutateAsync({
          bio: data.bio,
          location: data.location,
          phone: data.phone,
          shiftPreference: data.shiftPreference,
          yearsExperience: data.yearsExperience,
        }),
      ]);
      toast({ title: "Profile updated successfully" });
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  const handleProfilePhotoParams = async () => {
    const res = await fetch('/api/objects/upload', { method: 'POST', credentials: 'include' });
    const { uploadURL } = await res.json();
    return { method: 'PUT' as const, url: uploadURL };
  };

  const handleProfilePhotoComplete = async (result: any) => {
    if (result.successful?.[0]?.uploadURL) {
      try {
        await fetch(`/api/users/${user?.id}/profile-photo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ photoUrl: result.successful[0].uploadURL })
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Profile photo updated successfully" });
      } catch (error) {
        toast({ title: "Failed to update profile photo", variant: "destructive" });
      }
    }
  };

  const handleCoverPhotoParams = async () => {
    const res = await fetch('/api/objects/upload', { method: 'POST', credentials: 'include' });
    const { uploadURL } = await res.json();
    return { method: 'PUT' as const, url: uploadURL };
  };

  const handleCoverPhotoComplete = async (result: any) => {
    if (result.successful?.[0]?.uploadURL) {
      try {
        await fetch(`/api/users/${user?.id}/cover-photo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ coverPhotoUrl: result.successful[0].uploadURL })
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Cover photo updated successfully" });
      } catch (error) {
        toast({ title: "Failed to update cover photo", variant: "destructive" });
      }
    }
  };

  // Wait for both user and consultant data before rendering
  const isLoading = userLoading || consultantLoading || !user;
  const isSaving = updateUserMutation.isPending || updateConsultantMutation.isPending;

  const getRoleDisplayName = (role: string | undefined) => {
    switch (role) {
      case "admin": return "Administrator";
      case "hospital_staff": return "Hospital Staff";
      case "consultant": return "Consultant";
      default: return "User";
    }
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";
    return first + last || "U";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-md" />
        <div className="flex items-end gap-6 -mt-16 px-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-2 pb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="profile-page">
      <div className="relative">
        <div
          className="relative h-[200px] w-full rounded-md overflow-hidden bg-gradient-to-r from-primary/20 to-primary/40"
          data-testid="cover-photo-section"
        >
          {user?.coverPhotoUrl && (
            <img
              src={user.coverPhotoUrl}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="img-cover-photo"
            />
          )}
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="absolute bottom-4 right-4">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              onGetUploadParameters={handleCoverPhotoParams}
              onComplete={handleCoverPhotoComplete}
              buttonClassName="bg-white/90 hover:bg-white text-foreground"
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </ObjectUploader>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-16 px-4 sm:px-6">
          <div className="relative group" data-testid="profile-photo-section">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user?.profileImageUrl || undefined} data-testid="img-profile-photo" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleProfilePhotoParams}
                onComplete={handleProfilePhotoComplete}
                buttonClassName="bg-white/90 hover:bg-white text-foreground h-10 w-10 p-0 rounded-full"
              >
                <Camera className="w-5 h-5" />
              </ObjectUploader>
            </div>
          </div>

          <div className="pb-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </h1>
              <Badge variant="secondary" data-testid="badge-user-role">
                {getRoleDisplayName(user?.role)}
              </Badge>
              {consultant?.isOnboarded ? (
                <Badge variant="default" data-testid="badge-onboarded">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Onboarded
                </Badge>
              ) : (
                <Badge variant="outline" data-testid="badge-pending">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Onboarding
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1" data-testid="text-consultant-id">
              {consultant?.tngId || "Consultant ID Pending"}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First name" data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last name" data-testid="input-last-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Email</FormLabel>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground" data-testid="text-email">{user?.email || "No email"}</span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio / About</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px] resize-none"
                        data-testid="textarea-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn URL
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/in/yourprofile" data-testid="input-linkedin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website URL
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://yourwebsite.com" data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shiftPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Preference</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-shift">
                            <SelectValue placeholder="Select shift preference" />
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

              <Button type="submit" disabled={isSaving} data-testid="button-save-profile">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
                <Badge key={idx} variant="secondary" data-testid={`badge-emr-${idx}`}>
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
                <Badge key={idx} variant="outline" data-testid={`badge-module-${idx}`}>
                  {module}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Questionnaire Section */}
      <Card data-testid="card-skills-questionnaire">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Skills Questionnaire
              </CardTitle>
              <CardDescription>
                Your professional skills and expertise profile
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {questionnaire?.status === "verified" && (
                <Badge variant="default" data-testid="badge-skills-verified">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {questionnaire?.status === "submitted" && (
                <Badge variant="secondary" data-testid="badge-skills-pending">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending Review
                </Badge>
              )}
              {(!questionnaire || questionnaire?.status === "draft") && (
                <Badge variant="outline" data-testid="badge-skills-draft">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Incomplete
                </Badge>
              )}
              <Link href="/skills-questionnaire">
                <Button variant="outline" size="sm" data-testid="button-edit-skills">
                  {questionnaire?.id ? "Edit" : "Complete"} Questionnaire
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!questionnaire?.id ? (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Complete Your Skills Profile</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Fill out the skills questionnaire to help us match you with the best projects based on your EHR expertise, clinical modules, certifications, and work preferences.
              </p>
              <Link href="/skills-questionnaire">
                <Button data-testid="button-start-questionnaire">
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Start Questionnaire
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress indicator */}
              {questionnaire.status === "draft" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questionnaire Progress</span>
                    <span className="font-medium">
                      {Math.round(((questionnaire.skills?.length || 0) / 50) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, Math.round(((questionnaire.skills?.length || 0) / 50) * 100))} 
                    className="h-2" 
                    data-testid="progress-skills"
                  />
                </div>
              )}

              {/* EHR Experience */}
              {questionnaire.ehrExperience && questionnaire.ehrExperience.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">EHR Systems Experience</h4>
                  <div className="flex flex-wrap gap-2">
                    {questionnaire.ehrExperience.map((exp, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="flex items-center gap-1"
                        data-testid={`badge-ehr-exp-${idx}`}
                      >
                        {exp.ehrSystem}
                        <span className="text-xs opacity-70">({exp.yearsExperience}y)</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Summary */}
              {questionnaire.skills && questionnaire.skills.length > 0 && skillCategories && (
                <div>
                  <h4 className="font-medium mb-3">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {questionnaire.skills
                      .filter(s => s.proficiency && s.proficiency !== "none")
                      .slice(0, 10)
                      .map((skill, idx) => {
                        const skillName = skillCategories
                          .flatMap(c => c.items)
                          .find(i => i.id === skill.skillItemId)?.displayName || skill.skillItemId;
                        
                        const proficiencyColors: Record<string, string> = {
                          beginner: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                          intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                          advanced: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                          expert: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
                        };
                        
                        return (
                          <Badge 
                            key={idx} 
                            variant="outline"
                            className={proficiencyColors[skill.proficiency] || ""}
                            data-testid={`badge-skill-${idx}`}
                          >
                            {skillName}
                          </Badge>
                        );
                      })}
                    {questionnaire.skills.filter(s => s.proficiency && s.proficiency !== "none").length > 10 && (
                      <Badge variant="outline" className="text-muted-foreground">
                        +{questionnaire.skills.filter(s => s.proficiency && s.proficiency !== "none").length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {questionnaire.lastSavedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(questionnaire.lastSavedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
