import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  UsersRound,
  Target,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Building2,
  ClipboardList,
} from "lucide-react";
import { Link } from "wouter";

interface DiscDashboardStats {
  totalAssessments: number;
  totalTeams: number;
  activeTeams: number;
  totalSkills: number;
  averageTeamScore: number;
  styleDistribution: {
    D: number;
    i: number;
    S: number;
    C: number;
  };
}

interface DiscStyleInfo {
  style: "D" | "i" | "S" | "C";
  name: string;
  color: string;
  strengths: string[];
  challenges: string[];
  idealRoles: string[];
}

const DISC_COLORS: Record<string, string> = {
  D: "#D64933",
  i: "#F4B942",
  S: "#4A9B5D",
  C: "#3B82C4",
};

const DISC_NAMES: Record<string, string> = {
  D: "Dominance",
  i: "Influence",
  S: "Steadiness",
  C: "Conscientiousness",
};

function DiscStyleBadge({ style, count }: { style: string; count: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg"
        style={{ backgroundColor: DISC_COLORS[style] }}
      >
        {style}
      </div>
      <div className="flex-1">
        <div className="font-medium">{DISC_NAMES[style]}</div>
        <div className="text-sm text-muted-foreground">{count} consultant{count !== 1 ? 's' : ''}</div>
      </div>
    </div>
  );
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="text-center">
      <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <Progress
        value={score}
        className="h-2 mt-2"
        style={{
          ['--progress-background' as any]: getScoreBg(score).replace('bg-', 'var(--')
        }}
      />
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function DiscDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [orgFilter, setOrgFilter] = useState<string>("all");

  // Build query key with filter for admin
  const statsQueryKey = isAdmin && orgFilter !== "all"
    ? ["/api/disc/dashboard/stats", { orgType: orgFilter }]
    : ["/api/disc/dashboard/stats"];

  const { data: stats, isLoading } = useQuery<DiscDashboardStats>({
    queryKey: statsQueryKey,
    queryFn: async () => {
      const url = isAdmin && orgFilter !== "all"
        ? `/api/disc/dashboard/stats?orgType=${orgFilter}`
        : "/api/disc/dashboard/stats";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: styles } = useQuery<Record<string, DiscStyleInfo>>({
    queryKey: ["/api/disc/styles"],
  });

  const totalPeople = stats
    ? stats.styleDistribution.D + stats.styleDistribution.i + stats.styleDistribution.S + stats.styleDistribution.C
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">DiSChedule</h1>
          <p className="text-muted-foreground mt-1">
            Build high-performing teams with behavioral insights
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Admin Org Filter */}
          {isAdmin && (
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="nicehr">NICEHR Staff</SelectItem>
                <SelectItem value="hospital">Hospital Staff</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" asChild>
            <Link href="/disc/teams">
              <UsersRound className="h-4 w-4 mr-2" />
              View Teams
            </Link>
          </Button>
          <Button asChild>
            <Link href="/disc/teams/new">
              <Plus className="h-4 w-4 mr-2" />
              Build Team
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DiSC Profiles
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totalAssessments || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Consultants with assessments
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Teams
            </CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.activeTeams || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {stats?.totalTeams || 0} total teams
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Team Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {stats?.averageTeamScore || 0}
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Compatibility score
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Skills Tracked
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.totalSkills || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Healthcare IT skills
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Style Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Team Style Distribution
            </CardTitle>
            <CardDescription>
              DiSC profiles across your consultant pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <DiscStyleBadge style="D" count={stats.styleDistribution.D} />
                <DiscStyleBadge style="i" count={stats.styleDistribution.i} />
                <DiscStyleBadge style="S" count={stats.styleDistribution.S} />
                <DiscStyleBadge style="C" count={stats.styleDistribution.C} />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No DiSC assessments found. Start by adding assessments to consultants.
              </div>
            )}

            {totalPeople > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total profiled</span>
                  <span className="font-medium">{totalPeople} consultants</span>
                </div>
                <div className="flex gap-1 mt-2 h-3 rounded-full overflow-hidden">
                  {Object.entries(stats?.styleDistribution || {}).map(([style, count]) => (
                    count > 0 && (
                      <div
                        key={style}
                        className="h-full transition-all"
                        style={{
                          backgroundColor: DISC_COLORS[style],
                          width: `${(count / totalPeople) * 100}%`,
                        }}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common DiSC tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="default" className="w-full justify-between" asChild>
              <Link href="/disc/assessment">
                <ClipboardList className="h-4 w-4 mr-2" />
                Take Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/disc/teams/new">
                Build New Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/disc/consultants">
                View All Profiles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/disc/skills">
                Manage Skills
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/disc/rules">
                Compatibility Rules
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DiSC Style Guide */}
      <Card>
        <CardHeader>
          <CardTitle>DiSC Style Reference</CardTitle>
          <CardDescription>
            Understanding the four behavioral styles for effective team building
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {styles && Object.entries(styles).map(([key, style]) => (
              <div
                key={key}
                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: style.color }}
                  >
                    {style.style}
                  </div>
                  <div>
                    <div className="font-semibold">{style.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {style.style === "D" && "Results-oriented"}
                      {style.style === "i" && "People-oriented"}
                      {style.style === "S" && "Stability-oriented"}
                      {style.style === "C" && "Quality-oriented"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Strengths
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {style.strengths.slice(0, 3).map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Ideal Roles
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {style.idealRoles.slice(0, 2).join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">Balanced Teams</div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Teams with all four DiSC styles have 23% higher success rates on go-live projects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <div className="font-medium text-amber-900 dark:text-amber-100">Watch For Friction</div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  D-S and i-C pairings may need extra communication support and clear protocols.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">Continuous Improvement</div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Re-analyze teams after each project phase to optimize for changing requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
