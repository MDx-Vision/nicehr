import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Mail, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Send,
  Ban,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invitedByUserId: string | null;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  acceptedByUserId: string | null;
  revokedAt: string | null;
  revokedByUserId: string | null;
  revokedReason: string | null;
}

const roleOptions = [
  { value: 'consultant', label: 'Healthcare Consultant' },
  { value: 'hospital_staff', label: 'Hospital Staff' },
  { value: 'admin', label: 'Administrator' },
];

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  accepted: { label: 'Accepted', variant: 'default' as const, icon: CheckCircle2 },
  revoked: { label: 'Revoked', variant: 'destructive' as const, icon: Ban },
  expired: { label: 'Expired', variant: 'outline' as const, icon: AlertCircle },
};

export default function StaffInvitations() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'consultant',
    message: '',
    expiresInDays: 7,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: invitations, isLoading } = useQuery<Invitation[]>({
    queryKey: ['/api/admin/invitations', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'all' 
        ? '/api/admin/invitations' 
        : `/api/admin/invitations?status=${statusFilter}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch invitations');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newInvitation) => {
      return apiRequest('POST', '/api/admin/invitations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invitations'] });
      setIsCreateDialogOpen(false);
      setNewInvitation({ email: '', role: 'consultant', message: '', expiresInDays: 7 });
      toast({
        title: "Invitation Sent",
        description: "The invitation email has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: error.message,
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return apiRequest('POST', `/api/admin/invitations/${id}/revoke`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invitations'] });
      toast({
        title: "Invitation Revoked",
        description: "The invitation has been revoked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to revoke invitation",
        description: error.message,
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/admin/invitations/${id}/resend`);
    },
    onSuccess: () => {
      toast({
        title: "Invitation Resent",
        description: "The invitation email has been resent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to resend invitation",
        description: error.message,
      });
    },
  });

  const handleCreateInvitation = () => {
    if (!newInvitation.email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter an email address.",
      });
      return;
    }
    createMutation.mutate(newInvitation);
  };

  const pendingCount = invitations?.filter(i => i.status === 'pending').length || 0;
  const acceptedCount = invitations?.filter(i => i.status === 'accepted').length || 0;
  const revokedCount = invitations?.filter(i => i.status === 'revoked').length || 0;
  const expiredCount = invitations?.filter(i => i.status === 'expired').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Staff Invitations</h1>
          <p className="text-muted-foreground">
            Manage invitation-only access to the NICEHR platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-invite-staff">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send Invitation</DialogTitle>
              <DialogDescription>
                Send an invitation email to grant platform access. The invitation is tied to the specific email address.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                  data-testid="input-invitation-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newInvitation.role}
                  onValueChange={(value) => setNewInvitation({ ...newInvitation, role: value })}
                >
                  <SelectTrigger data-testid="select-invitation-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expires">Expires In</Label>
                <Select
                  value={newInvitation.expiresInDays.toString()}
                  onValueChange={(value) => setNewInvitation({ ...newInvitation, expiresInDays: parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-invitation-expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal welcome message..."
                  value={newInvitation.message}
                  onChange={(e) => setNewInvitation({ ...newInvitation, message: e.target.value })}
                  className="resize-none"
                  rows={3}
                  data-testid="input-invitation-message"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateInvitation} 
                disabled={createMutation.isPending}
                data-testid="button-send-invitation"
              >
                {createMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-count">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting acceptance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-accepted-count">{acceptedCount}</div>
            <p className="text-xs text-muted-foreground">Active staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-revoked-count">{revokedCount}</div>
            <p className="text-xs text-muted-foreground">Access removed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-expired-count">{expiredCount}</div>
            <p className="text-xs text-muted-foreground">Never accepted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations
          </CardTitle>
          <CardDescription>
            All staff invitations sent through the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted" data-testid="tab-accepted">Accepted</TabsTrigger>
              <TabsTrigger value="revoked" data-testid="tab-revoked">Revoked</TabsTrigger>
              <TabsTrigger value="expired" data-testid="tab-expired">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !invitations?.length ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No invitations found</h3>
                  <p className="text-muted-foreground">
                    {statusFilter === 'all' 
                      ? 'Send your first invitation to get started.'
                      : `No ${statusFilter} invitations.`}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => {
                      const StatusIcon = statusConfig[invitation.status].icon;
                      const isExpired = invitation.status === 'pending' && isPast(new Date(invitation.expiresAt));
                      
                      return (
                        <TableRow key={invitation.id} data-testid={`row-invitation-${invitation.id}`}>
                          <TableCell>
                            <div className="font-medium" data-testid={`text-email-${invitation.id}`}>
                              {invitation.email}
                            </div>
                            {invitation.message && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                "{invitation.message}"
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">
                              {roleOptions.find(r => r.value === invitation.role)?.label || invitation.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isExpired ? 'outline' : statusConfig[invitation.status].variant}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {isExpired ? 'Expired' : statusConfig[invitation.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm ${isExpired || isPast(new Date(invitation.expiresAt)) ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {format(new Date(invitation.expiresAt), 'MMM d, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {invitation.status === 'pending' && !isExpired && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => resendMutation.mutate(invitation.id)}
                                    disabled={resendMutation.isPending}
                                    title="Resend invitation"
                                    data-testid={`button-resend-${invitation.id}`}
                                  >
                                    <RefreshCw className={`h-4 w-4 ${resendMutation.isPending ? 'animate-spin' : ''}`} />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Revoke invitation"
                                        data-testid={`button-revoke-${invitation.id}`}
                                      >
                                        <Ban className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Revoke Invitation?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will invalidate the invitation link for {invitation.email}. 
                                          They will no longer be able to use this invitation to access the platform.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => revokeMutation.mutate({ id: invitation.id })}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Revoke
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                              {invitation.status === 'accepted' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Revoke access"
                                      data-testid={`button-revoke-access-${invitation.id}`}
                                    >
                                      <Ban className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will immediately revoke platform access for {invitation.email}. 
                                        They will be signed out and unable to log back in.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Go Back</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => revokeMutation.mutate({
                                          id: invitation.id,
                                          reason: 'Access revoked by administrator'
                                        })}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Revoke Access
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Invitations Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Invitations are tied to specific email addresses and cannot be shared</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Each invitation is single-use and expires after the set time period</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Revoking an accepted invitation immediately removes platform access</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Only administrators can send, resend, or revoke invitations</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
