import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sparkles,
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  MapPin,
  Briefcase,
  Award,
} from "lucide-react";
import type { Project, ConsultantScoreResult, RequirementWithContext } from "@shared/schema";

interface RecommendationResponse {
  requirementId: string;
  totalEvaluated: number;
  totalEligible: number;
  recommendations: ConsultantScoreResult[];
  calculatedAt?: string;
  cached?: boolean;
}

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-muted-foreground">{label}</span>
      <Progress value={Math.min(score, 100)} className={`h-2 flex-1 ${color}`} />
      <span className="w-10 text-right font-medium">{Math.round(score)}</span>
    </div>
  );
}

function ConsultantScoreCard({
  score,
  rank,
  onExpand,
  isExpanded,
}: {
  score: ConsultantScoreResult;
  rank: number;
  onExpand: () => void;
  isExpanded: boolean;
}) {
  return (
    <Card className={`${score.isEligible ? "border-green-200 dark:border-green-900" : "border-red-200 dark:border-red-900 opacity-60"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              score.isEligible ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}>
              {score.isEligible ? rank : "-"}
            </div>
            <div>
              <CardTitle className="text-base">Consultant {score.consultantId.slice(0, 8)}...</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {score.isEligible ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Eligible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <XCircle className="w-3 h-3 mr-1" />
                    Ineligible
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{score.totalScore.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Total Score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible open={isExpanded} onOpenChange={onExpand}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Score Breakdown
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <ScoreBar score={score.scores.emr} label="EMR Match" color="[&>div]:bg-blue-500" />
            <ScoreBar score={score.scores.module} label="Module" color="[&>div]:bg-purple-500" />
            <ScoreBar score={score.scores.proficiency} label="Proficiency" color="[&>div]:bg-amber-500" />
            <ScoreBar score={score.scores.availability} label="Availability" color="[&>div]:bg-green-500" />
            <ScoreBar score={score.scores.performance} label="Performance" color="[&>div]:bg-cyan-500" />
            <ScoreBar score={score.scores.shift} label="Shift Pref" color="[&>div]:bg-indigo-500" />
            <ScoreBar score={score.scores.colleague} label="Colleagues" color="[&>div]:bg-pink-500" />
            <ScoreBar score={score.scores.location} label="Location" color="[&>div]:bg-orange-500" />

            {score.hardConstraintsFailed.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Failed Constraints
                </div>
                <ul className="space-y-1">
                  {score.hardConstraintsFailed.map((constraint, i) => (
                    <li key={i} className="text-xs text-red-600 dark:text-red-400">
                      {constraint.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export default function AutoScheduling() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch requirements when project is selected
  const { data: requirements, isLoading: requirementsLoading } = useQuery<RequirementWithContext[]>({
    queryKey: [`/api/scheduling/projects/${selectedProjectId}/requirements`],
    enabled: !!selectedProjectId,
  });

  // Fetch recommendations
  const { data: recommendations, isLoading: recommendationsLoading, refetch } = useQuery<RecommendationResponse>({
    queryKey: [`/api/scheduling/recommendations/${selectedRequirementId}`],
    enabled: !!selectedRequirementId,
  });

  // Recalculate mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/scheduling/requirements/${selectedRequirementId}/recalculate`);
      return res.json() as Promise<RecommendationResponse>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/scheduling/recommendations/${selectedRequirementId}`], data);
      toast({
        title: "Recommendations Updated",
        description: `Found ${data.totalEligible} eligible consultants out of ${data.totalEvaluated} evaluated.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate recommendations",
        variant: "destructive",
      });
    },
  });

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const canManage = hasPermission("projects:manage") || hasPermission("admin:manage");

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Auto-Scheduling
          </h1>
          <p className="text-muted-foreground mt-1">
            Skills-first consultant matching algorithm
          </p>
        </div>
      </div>

      {/* Project & Requirement Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Project & Requirement</CardTitle>
          <CardDescription>
            Choose a project and requirement to view consultant recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={selectedProjectId} onValueChange={(v) => {
                setSelectedProjectId(v);
                setSelectedRequirementId("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projectsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Requirement</label>
              <Select
                value={selectedRequirementId}
                onValueChange={setSelectedRequirementId}
                disabled={!selectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a requirement..." />
                </SelectTrigger>
                <SelectContent>
                  {requirementsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : requirements?.length === 0 ? (
                    <SelectItem value="none" disabled>No requirements found</SelectItem>
                  ) : (
                    requirements?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.unitName || "All Units"} - {r.moduleName || "All Modules"} ({r.consultantsNeeded} needed)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedRequirementId && requirements && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              {(() => {
                const req = requirements.find(r => r.id === selectedRequirementId);
                if (!req) return null;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Hospital:</span>
                      <p className="font-medium">{req.hospitalName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">EMR System:</span>
                      <p className="font-medium">{req.hospitalEmr || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Shift Type:</span>
                      <p className="font-medium capitalize">{req.shiftType || "Any"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Consultants Needed:</span>
                      <p className="font-medium">{req.consultantsNeeded}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {selectedRequirementId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Consultant Recommendations
                </CardTitle>
                <CardDescription>
                  {recommendations?.cached ? "Cached results" : "Live calculations"} -
                  {" "}{recommendations?.totalEligible || 0} eligible of {recommendations?.totalEvaluated || 0} evaluated
                </CardDescription>
              </div>
              {canManage && (
                <Button
                  onClick={() => recalculateMutation.mutate()}
                  disabled={recalculateMutation.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${recalculateMutation.isPending ? "animate-spin" : ""}`} />
                  {recalculateMutation.isPending ? "Calculating..." : "Recalculate"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recommendationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : recommendations?.recommendations?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recommendations found.</p>
                <p className="text-sm mt-1">Click "Recalculate" to generate recommendations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Eligible Consultants */}
                <div>
                  <h3 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Eligible Consultants ({recommendations?.recommendations?.filter(r => r.isEligible).length || 0})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recommendations?.recommendations
                      ?.filter(r => r.isEligible)
                      .map((score, i) => (
                        <ConsultantScoreCard
                          key={score.consultantId}
                          score={score}
                          rank={i + 1}
                          isExpanded={expandedCards.has(score.consultantId)}
                          onExpand={() => toggleCard(score.consultantId)}
                        />
                      ))}
                  </div>
                </div>

                {/* Ineligible Consultants */}
                {recommendations?.recommendations?.some(r => !r.isEligible) && (
                  <div className="mt-8">
                    <h3 className="font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Ineligible Consultants ({recommendations?.recommendations?.filter(r => !r.isEligible).length || 0})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {recommendations?.recommendations
                        ?.filter(r => !r.isEligible)
                        .slice(0, 6) // Show max 6 ineligible
                        .map((score) => (
                          <ConsultantScoreCard
                            key={score.consultantId}
                            score={score}
                            rank={-1}
                            isExpanded={expandedCards.has(score.consultantId)}
                            onExpand={() => toggleCard(score.consultantId)}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scoring Weights Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scoring Algorithm</CardTitle>
          <CardDescription>
            How consultants are ranked for each requirement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Briefcase className="w-6 h-6 mx-auto text-blue-500 mb-2" />
              <div className="font-bold text-lg">25%</div>
              <div className="text-xs text-muted-foreground">EMR Match</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Award className="w-6 h-6 mx-auto text-purple-500 mb-2" />
              <div className="font-bold text-lg">20%</div>
              <div className="text-xs text-muted-foreground">Module Experience</div>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <Star className="w-6 h-6 mx-auto text-amber-500 mb-2" />
              <div className="font-bold text-lg">15%</div>
              <div className="text-xs text-muted-foreground">Proficiency Level</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <Clock className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <div className="font-bold text-lg">15%</div>
              <div className="text-xs text-muted-foreground">Availability</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Additional factors: Performance (10%), Shift Preference (8%), Colleague Pairing (5%), Location (2%)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
