import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MoreVertical,
  Play,
  Pause,
  Archive,
  Trash2,
  UserPlus,
  RefreshCw,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Users,
  Sparkles,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface DiscAssessment {
  primaryStyle: "D" | "i" | "S" | "C";
  secondaryStyle: "D" | "i" | "S" | "C" | null;
  dScore: number;
  iScore: number;
  sScore: number;
  cScore: number;
}

interface TeamAssignment {
  id: string;
  role: string;
  consultant: {
    id: string;
    location: string | null;
    yearsExperience: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    discAssessment: DiscAssessment | null;
  };
}

interface TeamAnalysis {
  id: string;
  overallScore: number;
  styleDistribution: Record<string, number>;
  strengths: string[];
  risks: string[];
  recommendations: string[];
  flagsTriggered: string[];
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  purpose: string | null;
  targetSize: number;
  status: "forming" | "active" | "completed" | "archived";
  createdAt: string;
  project: {
    id: string;
    name: string;
  } | null;
  assignments: TeamAssignment[];
  analyses: TeamAnalysis[];
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

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  forming: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  active: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  completed: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
  archived: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
};

function DiscBadge({ style, size = "md" }: { style: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  }[size];

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ backgroundColor: DISC_COLORS[style] }}
    >
      {style}
    </div>
  );
}

function MemberCard({ assignment }: { assignment: TeamAssignment }) {
  const { consultant } = assignment;
  const name = consultant.user
    ? `${consultant.user.firstName} ${consultant.user.lastName}`
    : "Unknown";

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
      {consultant.discAssessment ? (
        <DiscBadge style={consultant.discAssessment.primaryStyle} size="lg" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          ?
        </div>
      )}
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">
          {consultant.location || "No location"} • {consultant.yearsExperience} yrs exp
        </div>
        {assignment.role && assignment.role !== "member" && (
          <Badge variant="secondary" className="mt-1">
            {assignment.role}
          </Badge>
        )}
      </div>
      {consultant.discAssessment && (
        <div className="text-right">
          <div className="text-sm font-medium">
            {DISC_NAMES[consultant.discAssessment.primaryStyle]}
          </div>
          {consultant.discAssessment.secondaryStyle && (
            <div className="text-xs text-muted-foreground">
              with {consultant.discAssessment.secondaryStyle} tendencies
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: TeamAnalysis }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 65) return "Fair";
    return "Needs Attention";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Team Analysis
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(analysis.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score */}
        <div className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Compatibility Score • {getScoreLabel(analysis.overallScore)}
          </div>
          <Progress value={analysis.overallScore} className="mt-3 h-2" />
        </div>

        <Separator />

        {/* Style Distribution */}
        <div>
          <div className="text-sm font-medium mb-3">Style Distribution</div>
          <div className="grid grid-cols-4 gap-3">
            {(["D", "i", "S", "C"] as const).map((style) => (
              <div key={style} className="text-center">
                <div
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-1"
                  style={{
                    backgroundColor: DISC_COLORS[style],
                    opacity: (analysis.styleDistribution[style] || 0) > 0 ? 1 : 0.3,
                  }}
                >
                  {analysis.styleDistribution[style] || 0}
                </div>
                <div className="text-xs text-muted-foreground">{DISC_NAMES[style]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              Strengths
            </div>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {analysis.risks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Risks
            </div>
            <ul className="space-y-2">
              {analysis.risks.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </div>
            <ul className="space-y-2">
              {analysis.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DiscTeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useQuery<Team>({
    queryKey: [`/api/disc/teams/${id}`],
    enabled: !!id,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/disc/teams/${id}/analyze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/disc/teams/${id}`] });
      toast({
        title: "Analysis Complete",
        description: "Team compatibility analysis has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze team. Make sure you have at least 2 members with DiSC profiles.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PUT", `/api/disc/teams/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/disc/teams/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/disc/teams"] });
      toast({
        title: "Status Updated",
        description: "Team status has been updated.",
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/disc/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disc/teams"] });
      toast({
        title: "Team Deleted",
        description: "The team has been deleted.",
      });
      navigate("/disc/teams");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Team Not Found</h2>
        <p className="text-muted-foreground mt-2">The team you're looking for doesn't exist.</p>
        <Button className="mt-4" asChild>
          <Link href="/disc/teams">Back to Teams</Link>
        </Button>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[team.status] || STATUS_STYLES.forming;
  const latestAnalysis = team.analyses?.[0];
  const membersWithDisc = team.assignments.filter((a) => a.consultant.discAssessment);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/disc/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{team.name}</h1>
              <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0`}>
                {team.status}
              </Badge>
            </div>
            {team.purpose && (
              <p className="text-muted-foreground mt-1">{team.purpose}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => analyzeMutation.mutate()}
            disabled={membersWithDisc.length < 2 || analyzeMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analyzeMutation.isPending ? "animate-spin" : ""}`} />
            {analyzeMutation.isPending ? "Analyzing..." : "Re-analyze"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {team.status === "forming" && (
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate("active")}>
                  <Play className="h-4 w-4 mr-2" />
                  Activate Team
                </DropdownMenuItem>
              )}
              {team.status === "active" && (
                <>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate("forming")}>
                    <Pause className="h-4 w-4 mr-2" />
                    Set to Forming
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate("completed")}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Completed
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => updateStatusMutation.mutate("archived")}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Team
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this team?")) {
                    deleteTeamMutation.mutate();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team Members */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <Badge variant="secondary">
                  {team.assignments.length} / {team.targetSize}
                </Badge>
              </div>
              <CardDescription>
                {membersWithDisc.length} of {team.assignments.length} members have DiSC profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {team.assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No members yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {team.assignments.map((assignment) => (
                    <MemberCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium">{new Date(team.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Target Size</dt>
                  <dd className="font-medium">{team.targetSize} members</dd>
                </div>
                {team.project && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Project</dt>
                    <dd className="font-medium">{team.project.name}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Sidebar */}
        <div className="space-y-4">
          {latestAnalysis ? (
            <AnalysisCard analysis={latestAnalysis} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground mb-4">
                  {membersWithDisc.length < 2
                    ? "Add at least 2 members with DiSC profiles to run analysis"
                    : "No analysis yet. Run one to see compatibility insights."}
                </p>
                <Button
                  onClick={() => analyzeMutation.mutate()}
                  disabled={membersWithDisc.length < 2 || analyzeMutation.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
