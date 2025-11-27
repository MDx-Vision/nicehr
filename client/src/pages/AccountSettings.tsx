import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Shield,
  Bell,
  Eye,
  Mail,
  Phone,
  Trash2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AccountSettingsData {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "admin" | "hospital_staff" | "consultant";
  profileVisibility: "public" | "members_only" | "private";
  emailNotifications: boolean;
  showEmail: boolean;
  showPhone: boolean;
  deletionRequestedAt: string | null;
  createdAt: string | null;
}

export default function AccountSettings() {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: settings, isLoading, error } = useQuery<AccountSettingsData>({
    queryKey: ["/api/account/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<{
      profileVisibility: "public" | "members_only" | "private";
      emailNotifications: boolean;
      showEmail: boolean;
      showPhone: boolean;
    }>) => {
      return await apiRequest("PATCH", "/api/account/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account/settings"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const requestDeletionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/account/delete-request", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account/settings"] });
      toast({ title: "Deletion request submitted", description: "Your account will be reviewed for deletion." });
      setShowDeleteConfirm(false);
    },
    onError: () => {
      toast({ title: "Failed to request deletion", variant: "destructive" });
    },
  });

  const cancelDeletionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/account/delete-request", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account/settings"] });
      toast({ title: "Deletion request cancelled" });
    },
    onError: () => {
      toast({ title: "Failed to cancel deletion request", variant: "destructive" });
    },
  });

  const handleVisibilityChange = (value: "public" | "members_only" | "private") => {
    updateSettingsMutation.mutate({ profileVisibility: value });
  };

  const handleToggle = (field: "emailNotifications" | "showEmail" | "showPhone", value: boolean) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "hospital_staff":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "hospital_staff":
        return "Hospital Staff";
      case "consultant":
        return "Consultant";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Settings</h3>
            <p className="text-muted-foreground">
              There was an error loading your account settings. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = updateSettingsMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-account-title">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences, privacy, and notifications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details and membership status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={settings.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {settings.firstName?.[0] || settings.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg" data-testid="text-account-name">
                  {settings.firstName && settings.lastName 
                    ? `${settings.firstName} ${settings.lastName}`
                    : settings.email || "User"}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="text-account-email">
                  {settings.email || "No email set"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Role</span>
                </div>
                <Badge variant={getRoleBadgeVariant(settings.role)} data-testid="badge-role">
                  {getRoleLabel(settings.role)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Member Since</span>
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-member-since">
                  {settings.createdAt 
                    ? format(new Date(settings.createdAt), "MMM d, yyyy")
                    : "Unknown"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span>Account Status</span>
                </div>
                {settings.deletionRequestedAt ? (
                  <Badge variant="destructive" data-testid="badge-status">
                    Deletion Pending
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid="badge-status">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control who can see your profile and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Visibility</label>
              <Select
                value={settings.profileVisibility}
                onValueChange={handleVisibilityChange}
                disabled={isPending}
              >
                <SelectTrigger data-testid="select-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex flex-col">
                      <span>Public</span>
                      <span className="text-xs text-muted-foreground">Anyone can view your profile</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="members_only">
                    <div className="flex flex-col">
                      <span>Members Only</span>
                      <span className="text-xs text-muted-foreground">Only logged-in members can view</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex flex-col">
                      <span>Private</span>
                      <span className="text-xs text-muted-foreground">Only you can view your profile</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Show Email Address</label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Display your email on your public profile
                </p>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={(checked) => handleToggle("showEmail", checked)}
                disabled={isPending}
                data-testid="switch-show-email"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Show Phone Number</label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Display your phone on your public profile
                </p>
              </div>
              <Switch
                checked={settings.showPhone}
                onCheckedChange={(checked) => handleToggle("showPhone", checked)}
                disabled={isPending}
                data-testid="switch-show-phone"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-xs text-muted-foreground">
                  Receive updates about projects, schedules, and important changes
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleToggle("emailNotifications", checked)}
                disabled={isPending}
                data-testid="switch-email-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.deletionRequestedAt ? (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    Deletion Requested
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requested on {format(new Date(settings.deletionRequestedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    An administrator will review your request. This process may take a few business days.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => cancelDeletionMutation.mutate()}
                  disabled={cancelDeletionMutation.isPending}
                  data-testid="button-cancel-deletion"
                >
                  {cancelDeletionMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Cancel Deletion Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Request to permanently delete your account and all associated data.
                  This action will be reviewed by an administrator.
                </p>
                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" data-testid="button-request-deletion">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Request Account Deletion
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will submit a request to delete your account. An administrator will review
                        your request. Once approved, all your data will be permanently removed.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-confirm">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => requestDeletionMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-deletion"
                      >
                        {requestDeletionMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Yes, Request Deletion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
