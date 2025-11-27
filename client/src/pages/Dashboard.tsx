import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, FolderKanban, FileText, DollarSign, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalConsultants: number;
  activeConsultants: number;
  totalHospitals: number;
  activeProjects: number;
  pendingDocuments: number;
  totalSavings: string;
}

export default function Dashboard() {
  const { user, isAdmin, isConsultant, isHospitalStaff } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || "User"}! Here's an overview of your platform.
        </p>
      </div>

      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card data-testid="card-total-consultants">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalConsultants || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {stats?.activeConsultants || 0} currently available
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-hospitals">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalHospitals || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Registered hospitals</p>
            </CardContent>
          </Card>

          <Card data-testid="card-active-projects">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-documents">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.pendingDocuments || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card data-testid="card-active-consultants">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Available Consultants</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeConsultants || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">Ready for assignments</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-savings">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(stats?.totalSavings || "0")}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isConsultant && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-consultant-welcome">
            <CardHeader>
              <CardTitle>Welcome to NICEHR</CardTitle>
              <CardDescription>
                Manage your profile, view assignments, and track your documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete your profile and upload required documents to be eligible for project assignments.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for consultants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">View your upcoming schedule</p>
              <p className="text-sm">Update your availability</p>
              <p className="text-sm">Upload pending documents</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isHospitalStaff && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-hospital-welcome">
            <CardHeader>
              <CardTitle>Welcome to NICEHR</CardTitle>
              <CardDescription>
                View your hospital's projects and consultant assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track project progress, view assigned consultants, and provide feedback.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-hospital-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for hospital staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">View current projects</p>
              <p className="text-sm">See consultant schedules</p>
              <p className="text-sm">Submit ROI feedback</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
