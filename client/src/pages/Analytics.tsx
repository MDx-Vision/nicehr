import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { 
  KpiCard, 
  TrendChart, 
  StatusDistributionCard, 
  PieChartCard 
} from "@/components/analytics";
import { 
  Users, 
  Building2, 
  FolderKanban, 
  DollarSign, 
  FileCheck,
  TrendingUp,
  Calendar,
  Star,
  Activity,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformAnalytics, HospitalAnalytics, ConsultantAnalytics } from "@shared/schema";

interface AnalyticsResponse {
  type: 'platform' | 'hospital' | 'consultant';
  data: PlatformAnalytics | HospitalAnalytics | ConsultantAnalytics | null;
}

export default function Analytics() {
  const { isAdmin, isHospitalStaff, isConsultant } = useAuth();

  const { data: analytics, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["/api/analytics/me"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics?.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">No analytics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin && analytics.type === 'platform' && (
        <PlatformDashboard data={analytics.data as PlatformAnalytics} />
      )}
      {isHospitalStaff && analytics.type === 'hospital' && (
        <HospitalDashboard data={analytics.data as HospitalAnalytics} />
      )}
      {isConsultant && analytics.type === 'consultant' && (
        <ConsultantDashboard data={analytics.data as ConsultantAnalytics} />
      )}
    </div>
  );
}

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function PlatformDashboard({ data }: { data: PlatformAnalytics }) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of platform performance and key metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Consultants"
          value={data.overview.totalConsultants}
          subtitle={`${data.overview.activeConsultants} active`}
          icon={Users}
          data-testid="kpi-total-consultants"
        />
        <KpiCard
          title="Hospitals"
          value={data.overview.totalHospitals}
          subtitle={`${data.overview.activeHospitals} active`}
          icon={Building2}
          data-testid="kpi-hospitals"
        />
        <KpiCard
          title="Active Projects"
          value={data.overview.activeProjects}
          subtitle={`${data.overview.totalProjects} total`}
          icon={FolderKanban}
          data-testid="kpi-active-projects"
        />
        <KpiCard
          title="Total Savings"
          value={formatCurrency(data.overview.totalSavings)}
          icon={DollarSign}
          data-testid="kpi-total-savings"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TrendChart
          title="Activity Trend (30 Days)"
          data={data.activityTrend}
          dataKey="count"
          data-testid="chart-activity-trend"
        />
        <StatusDistributionCard
          title="Project Status"
          items={[
            { label: "Active", value: data.projectsByStatus.active },
            { label: "Draft", value: data.projectsByStatus.draft },
            { label: "Completed", value: data.projectsByStatus.completed },
            { label: "Cancelled", value: data.projectsByStatus.cancelled },
          ]}
          data-testid="chart-project-status"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusDistributionCard
          title="Consultant Status"
          items={[
            { label: "Onboarded", value: data.consultantsByStatus.onboarded },
            { label: "Pending", value: data.consultantsByStatus.pending },
            { label: "Available", value: data.consultantsByStatus.available },
            { label: "Unavailable", value: data.consultantsByStatus.unavailable },
          ]}
          data-testid="chart-consultant-status"
        />
        <StatusDistributionCard
          title="Document Compliance"
          items={[
            { label: "Approved", value: data.documentCompliance.approved },
            { label: "Pending", value: data.documentCompliance.pending },
            { label: "Rejected", value: data.documentCompliance.rejected },
            { label: "Expired", value: data.documentCompliance.expired },
          ]}
          data-testid="chart-document-compliance"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Users by Role"
          data={[
            { name: "Admin", value: data.usersByRole.admin },
            { name: "Hospital Staff", value: data.usersByRole.hospital_staff },
            { name: "Consultant", value: data.usersByRole.consultant },
          ]}
          data-testid="chart-users-by-role"
        />
        <Card data-testid="card-compliance-rate">
          <CardHeader>
            <CardTitle className="text-base">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted"
                    fill="none"
                    strokeWidth="10"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="stroke-primary"
                    fill="none"
                    strokeWidth="10"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${data.documentCompliance.complianceRate * 2.51} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{data.documentCompliance.complianceRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {data.documentCompliance.approved} of {data.documentCompliance.total} documents approved
                </p>
                <p className="text-sm font-medium">
                  {data.overview.totalUsers} total users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function HospitalDashboard({ data }: { data: HospitalAnalytics }) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">
          {data.hospitalName} Analytics
        </h1>
        <p className="text-muted-foreground">
          ROI metrics, budget tracking, and consultant performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Projects"
          value={data.overview.totalProjects}
          subtitle={`${data.overview.activeProjects} active`}
          icon={FolderKanban}
          data-testid="kpi-total-projects"
        />
        <KpiCard
          title="Total Budget"
          value={formatCurrency(data.overview.totalBudget)}
          icon={Target}
          data-testid="kpi-total-budget"
        />
        <KpiCard
          title="Total Savings"
          value={formatCurrency(data.overview.totalSavings)}
          icon={DollarSign}
          data-testid="kpi-total-savings"
        />
        <KpiCard
          title="Average ROI"
          value={`${data.overview.averageRoi}%`}
          icon={TrendingUp}
          data-testid="kpi-average-roi"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-savings-breakdown">
          <CardHeader>
            <CardTitle className="text-base">Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Labor Savings</span>
              <span className="font-medium">{formatCurrency(data.savingsBreakdown.laborSavings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Benefits Savings</span>
              <span className="font-medium">{formatCurrency(data.savingsBreakdown.benefitsSavings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overhead Savings</span>
              <span className="font-medium">{formatCurrency(data.savingsBreakdown.overheadSavings)}</span>
            </div>
            <div className="border-t pt-4 flex items-center justify-between">
              <span className="font-medium">Total Savings</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(data.savingsBreakdown.totalSavings)}</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-project-breakdown">
          <CardHeader>
            <CardTitle className="text-base">Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.projectBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No projects yet</p>
            ) : (
              data.projectBreakdown.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{project.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(project.budget)}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.consultantsAssigned} consultants
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {data.consultantPerformance.length > 0 && (
        <Card data-testid="card-consultant-performance">
          <CardHeader>
            <CardTitle className="text-base">Consultant Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.consultantPerformance.map((consultant) => (
                <div key={consultant.consultantId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{consultant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {consultant.shiftsCompleted} shifts completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{consultant.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function ConsultantDashboard({ data }: { data: ConsultantAnalytics }) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">My Analytics</h1>
        <p className="text-muted-foreground">
          Your performance metrics, earnings, and compliance status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Completed Shifts"
          value={data.performance.completedShifts}
          subtitle={`${data.performance.upcomingShifts} upcoming`}
          icon={Calendar}
          data-testid="kpi-completed-shifts"
        />
        <KpiCard
          title="Average Rating"
          value={data.performance.averageRating.toFixed(1)}
          icon={Star}
          data-testid="kpi-average-rating"
        />
        <KpiCard
          title="Utilization Rate"
          value={`${data.performance.utilizationRate}%`}
          icon={Activity}
          data-testid="kpi-utilization-rate"
        />
        <KpiCard
          title="Compliance Rate"
          value={`${data.documentStatus.complianceRate}%`}
          icon={FileCheck}
          data-testid="kpi-compliance-rate"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusDistributionCard
          title="Document Status"
          items={[
            { label: "Approved", value: data.documentStatus.approved },
            { label: "Pending", value: data.documentStatus.pending },
            { label: "Rejected", value: data.documentStatus.rejected },
            { label: "Expired", value: data.documentStatus.expired },
          ]}
          data-testid="chart-document-status"
        />

        <Card data-testid="card-training-status">
          <CardHeader>
            <CardTitle className="text-base">Training Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.trainingStatus.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No training modules assigned</p>
            ) : (
              data.trainingStatus.map((training) => (
                <div key={training.moduleId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{training.moduleName}</span>
                    <span className="text-xs text-muted-foreground capitalize">{training.status}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${
                        training.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {data.expiringDocuments.length > 0 && (
        <Card data-testid="card-expiring-documents">
          <CardHeader>
            <CardTitle className="text-base text-amber-600">Expiring Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.expiringDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.typeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-600">
                      {doc.daysUntilExpiry} days left
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.upcomingShifts.length > 0 && (
        <Card data-testid="card-upcoming-shifts">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcomingShifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{shift.projectName}</p>
                    <p className="text-xs text-muted-foreground">{shift.hospitalName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
