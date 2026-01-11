import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Plus,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Calendar,
  User,
  Building2,
  Target,
  Gauge,
  Smile,
  Meh,
  Frown,
  Send,
  X,
  FileText,
  FileBarChart,
  Download,
  Award
} from "lucide-react";
import type { 
  ConsultantScorecardWithDetails,
  PulseSurveyWithDetails,
  PulseResponseWithDetails,
  NpsResponse,
  IncidentWithDetails,
  CorrectiveActionWithDetails,
  QualityAnalytics,
  Project,
  Hospital
} from "@shared/schema";

const SEVERITY_BADGES = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const INCIDENT_STATUS_BADGES = {
  reported: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  investigating: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

const SCORECARD_STATUS_BADGES = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  archived: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

const CORRECTIVE_ACTION_STATUS_BADGES = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  verified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

function getSeverityBadge(severity: string) {
  const color = SEVERITY_BADGES[severity as keyof typeof SEVERITY_BADGES] || SEVERITY_BADGES.medium;
  return <Badge className={color}>{severity}</Badge>;
}

function getIncidentStatusBadge(status: string) {
  const color = INCIDENT_STATUS_BADGES[status as keyof typeof INCIDENT_STATUS_BADGES] || INCIDENT_STATUS_BADGES.reported;
  return <Badge className={color}>{status.replace("_", " ")}</Badge>;
}

function getScorecardStatusBadge(status: string) {
  const color = SCORECARD_STATUS_BADGES[status as keyof typeof SCORECARD_STATUS_BADGES] || SCORECARD_STATUS_BADGES.draft;
  return <Badge className={color}>{status}</Badge>;
}

function getCorrectiveActionStatusBadge(status: string) {
  const color = CORRECTIVE_ACTION_STATUS_BADGES[status as keyof typeof CORRECTIVE_ACTION_STATUS_BADGES] || CORRECTIVE_ACTION_STATUS_BADGES.pending;
  return <Badge className={color}>{status.replace("_", " ")}</Badge>;
}

function formatScore(score: string | number | null | undefined): string {
  if (score === null || score === undefined) return "N/A";
  const num = typeof score === "string" ? parseFloat(score) : score;
  return num.toFixed(1);
}

function ScoreKpiCard({ 
  title, 
  score, 
  icon: Icon,
  color = "text-primary"
}: { 
  title: string; 
  score: number | null | undefined; 
  icon: React.ElementType;
  color?: string;
}) {
  const scoreValue = score ?? 0;
  const percentage = (scoreValue / 5) * 100;
  
  return (
    <Card data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatScore(score)}</div>
        <Progress value={percentage} className="mt-2 h-2" />
        <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
      </CardContent>
    </Card>
  );
}

function ScorecardsTab() {
  const [selectedScorecard, setSelectedScorecard] = useState<ConsultantScorecardWithDetails | null>(null);
  
  const { data: scorecards, isLoading } = useQuery<ConsultantScorecardWithDetails[]>({
    queryKey: ['/api/consultant-scorecards'],
  });

  const { data: analytics } = useQuery<QualityAnalytics>({
    queryKey: ['/api/quality-analytics'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <ScoreKpiCard
          title="Overall Score"
          score={analytics?.avgOverallScore}
          icon={Target}
          color="text-primary"
        />
        <ScoreKpiCard
          title="Quality"
          score={analytics?.avgQualityScore}
          icon={Star}
          color="text-yellow-500"
        />
        <ScoreKpiCard
          title="Punctuality"
          score={analytics?.avgPunctualityScore}
          icon={Clock}
          color="text-blue-500"
        />
        <ScoreKpiCard
          title="Communication"
          score={analytics?.avgCommunicationScore}
          icon={MessageSquare}
          color="text-green-500"
        />
        <ScoreKpiCard
          title="Technical"
          score={analytics?.avgTechnicalScore}
          icon={ClipboardList}
          color="text-purple-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultant Scorecards</CardTitle>
          <CardDescription>Performance scorecards for all consultants</CardDescription>
        </CardHeader>
        <CardContent>
          {!scorecards || scorecards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scorecards found
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {scorecards.map((scorecard) => (
                  <Card 
                    key={scorecard.id} 
                    className="cursor-pointer hover-elevate"
                    onClick={() => setSelectedScorecard(scorecard)}
                    data-testid={`scorecard-card-${scorecard.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {(scorecard.consultant?.user?.firstName?.[0] || "") + 
                               (scorecard.consultant?.user?.lastName?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {scorecard.consultant?.user?.firstName} {scorecard.consultant?.user?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(scorecard.periodStart), "MMM d")} - {format(new Date(scorecard.periodEnd), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Overall</div>
                            <div className="font-bold text-lg">{formatScore(scorecard.overallScore)}</div>
                          </div>
                          {getScorecardStatusBadge(scorecard.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedScorecard} onOpenChange={() => setSelectedScorecard(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scorecard Details</DialogTitle>
            <DialogDescription>
              {selectedScorecard?.consultant?.user?.firstName} {selectedScorecard?.consultant?.user?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedScorecard && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(selectedScorecard.periodStart), "MMM d, yyyy")} - {format(new Date(selectedScorecard.periodEnd), "MMM d, yyyy")}
                  </span>
                </div>
                {getScorecardStatusBadge(selectedScorecard.status)}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className="font-medium">{formatScore(selectedScorecard.overallScore)}</span>
                  </div>
                  <Progress value={(parseFloat(selectedScorecard.overallScore || "0") / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quality Score</span>
                    <span className="font-medium">{formatScore(selectedScorecard.qualityScore)}</span>
                  </div>
                  <Progress value={(parseFloat(selectedScorecard.qualityScore || "0") / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Punctuality Score</span>
                    <span className="font-medium">{formatScore(selectedScorecard.punctualityScore)}</span>
                  </div>
                  <Progress value={(parseFloat(selectedScorecard.punctualityScore || "0") / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Communication Score</span>
                    <span className="font-medium">{formatScore(selectedScorecard.communicationScore)}</span>
                  </div>
                  <Progress value={(parseFloat(selectedScorecard.communicationScore || "0") / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Technical Score</span>
                    <span className="font-medium">{formatScore(selectedScorecard.technicalScore)}</span>
                  </div>
                  <Progress value={(parseFloat(selectedScorecard.technicalScore || "0") / 5) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Teamwork Score</span>
                    <span className="font-medium">{formatScore(selectedScorecard.teamworkScore)}</span>
                  </div>
                  <Progress value={(parseFloat(selectedScorecard.teamworkScore || "0") / 5) * 100} />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedScorecard.ticketsResolved || 0}</div>
                  <div className="text-sm text-muted-foreground">Tickets Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedScorecard.trainingsCompleted || 0}</div>
                  <div className="text-sm text-muted-foreground">Trainings Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatScore(selectedScorecard.attendanceRate)}%</div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </div>
              </div>

              {selectedScorecard.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedScorecard.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SurveysTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSurvey, setSelectedSurvey] = useState<PulseSurveyWithDetails | null>(null);
  const [mood, setMood] = useState<number>(3);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data: surveys, isLoading } = useQuery<PulseSurveyWithDetails[]>({
    queryKey: ['/api/pulse-surveys/active'],
  });

  const submitResponseMutation = useMutation({
    mutationFn: async (data: { surveyId: string; responses: Record<string, string>; mood: number }) => {
      return apiRequest("POST", "/api/pulse-responses", {
        surveyId: data.surveyId,
        responses: data.responses,
        mood: data.mood,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pulse-surveys/active'] });
      setSelectedSurvey(null);
      setMood(3);
      setResponses({});
      toast({ title: "Survey response submitted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to submit response", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!selectedSurvey) return;
    submitResponseMutation.mutate({
      surveyId: selectedSurvey.id,
      responses,
      mood,
    });
  };

  const getMoodIcon = (moodValue: number) => {
    if (moodValue <= 2) return <Frown className="h-8 w-8" />;
    if (moodValue <= 3) return <Meh className="h-8 w-8" />;
    return <Smile className="h-8 w-8" />;
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 2) return "text-red-500";
    if (moodValue <= 3) return "text-yellow-500";
    return "text-green-500";
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Active Surveys</h2>
          <p className="text-sm text-muted-foreground">Complete pulse surveys to share your feedback</p>
        </div>
      </div>

      {!surveys || surveys.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active surveys at this time
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card 
              key={survey.id} 
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedSurvey(survey)}
              data-testid={`survey-card-${survey.id}`}
            >
              <CardHeader>
                <CardTitle className="text-base">{survey.title}</CardTitle>
                <CardDescription>{survey.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{survey.responseCount || 0} responses</span>
                  </div>
                  <Badge variant="secondary">{survey.surveyType}</Badge>
                </div>
                {survey.project && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{survey.project.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSurvey?.title}</DialogTitle>
            <DialogDescription>{selectedSurvey?.description}</DialogDescription>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>How are you feeling today?</Label>
                <div className="flex items-center justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      variant={mood === value ? "default" : "outline"}
                      size="icon"
                      className={`h-12 w-12 ${mood === value ? getMoodColor(value) : ""}`}
                      onClick={() => setMood(value)}
                      data-testid={`mood-${value}`}
                    >
                      <span className="text-lg font-bold">{value}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <div className={getMoodColor(mood)}>
                    {getMoodIcon(mood)}
                  </div>
                </div>
              </div>

              <Separator />

              {Array.isArray(selectedSurvey.questions) && (
                <div className="space-y-4">
                  {(selectedSurvey.questions as Array<{ id: string; question: string; type: string; options?: string[] }>).map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label>{q.question}</Label>
                      {q.type === "text" ? (
                        <Textarea
                          value={responses[q.id] || ""}
                          onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                          placeholder="Your response..."
                          data-testid={`question-${q.id}`}
                        />
                      ) : q.type === "rating" ? (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <Button
                              key={val}
                              variant={responses[q.id] === String(val) ? "default" : "outline"}
                              size="sm"
                              onClick={() => setResponses({ ...responses, [q.id]: String(val) })}
                              data-testid={`question-${q.id}-rating-${val}`}
                            >
                              {val}
                            </Button>
                          ))}
                        </div>
                      ) : q.options ? (
                        <Select
                          value={responses[q.id] || ""}
                          onValueChange={(v) => setResponses({ ...responses, [q.id]: v })}
                        >
                          <SelectTrigger data-testid={`question-${q.id}-select`}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {q.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={responses[q.id] || ""}
                          onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                          placeholder="Your response..."
                          data-testid={`question-${q.id}-input`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSurvey(null)} data-testid="button-cancel-survey">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitResponseMutation.isPending}
                  data-testid="button-submit-survey"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Response
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NpsTab() {
  const { toast } = useToast();
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("platform");

  const { data: analytics, isLoading } = useQuery<QualityAnalytics>({
    queryKey: ['/api/quality-analytics'],
  });

  const submitNpsMutation = useMutation({
    mutationFn: async (data: { score: number; feedback: string; category: string }) => {
      return apiRequest("POST", "/api/nps-responses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quality-analytics'] });
      setScore(null);
      setFeedback("");
      toast({ title: "NPS feedback submitted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (score === null) {
      toast({ title: "Please select a score", variant: "destructive" });
      return;
    }
    submitNpsMutation.mutate({ score, feedback, category });
  };

  const npsScore = analytics?.npsScore ?? 0;
  const totalResponses = analytics?.totalNpsResponses ?? 0;
  const promoters = analytics?.promoters ?? 0;
  const passives = analytics?.passives ?? 0;
  const detractors = analytics?.detractors ?? 0;

  const getScoreColor = (value: number) => {
    if (value <= 6) return "text-red-500 border-red-500";
    if (value <= 8) return "text-yellow-500 border-yellow-500";
    return "text-green-500 border-green-500";
  };

  const getScoreLabel = (value: number) => {
    if (value <= 6) return "Detractor";
    if (value <= 8) return "Passive";
    return "Promoter";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="nps-gauge-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              NPS Score
            </CardTitle>
            <CardDescription>Net Promoter Score based on {totalResponses} responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className={`text-6xl font-bold ${npsScore >= 50 ? "text-green-500" : npsScore >= 0 ? "text-yellow-500" : "text-red-500"}`}>
                {npsScore.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Score ranges from -100 to 100
              </div>
              <Progress 
                value={((npsScore + 100) / 200) * 100} 
                className="mt-4 h-3 w-full max-w-xs" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card data-testid="promoters-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
                    <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <div className="font-medium">Promoters (9-10)</div>
                    <div className="text-sm text-muted-foreground">Loyal enthusiasts</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">{promoters}</div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="passives-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900">
                    <Minus className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div>
                    <div className="font-medium">Passives (7-8)</div>
                    <div className="text-sm text-muted-foreground">Satisfied but unenthusiastic</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{passives}</div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="detractors-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-red-100 dark:bg-red-900">
                    <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-300" />
                  </div>
                  <div>
                    <div className="font-medium">Detractors (0-6)</div>
                    <div className="text-sm text-muted-foreground">Unhappy customers</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">{detractors}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit NPS Feedback</CardTitle>
          <CardDescription>How likely are you to recommend us to a colleague?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Your Score (0-10)</Label>
            <div className="flex flex-wrap gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <Button
                  key={value}
                  variant={score === value ? "default" : "outline"}
                  className={`h-12 w-12 ${score === value ? getScoreColor(value) : ""}`}
                  onClick={() => setScore(value)}
                  data-testid={`nps-score-${value}`}
                >
                  {value}
                </Button>
              ))}
            </div>
            {score !== null && (
              <div className={`text-center text-sm font-medium ${getScoreColor(score).split(" ")[0]}`}>
                {getScoreLabel(score)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-nps-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="consultant">Consultant Experience</SelectItem>
                <SelectItem value="hospital">Hospital Experience</SelectItem>
                <SelectItem value="project">Project Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Feedback (Optional)</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What's the primary reason for your score?"
              data-testid="input-nps-feedback"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={score === null || submitNpsMutation.isPending}
            className="w-full"
            data-testid="button-submit-nps"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function IncidentsTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<IncidentWithDetails | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "",
    location: "",
    incidentDate: new Date().toISOString().split("T")[0],
  });

  const { data: incidents, isLoading } = useQuery<IncidentWithDetails[]>({
    queryKey: ['/api/incidents'],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  const { data: correctiveActions } = useQuery<CorrectiveActionWithDetails[]>({
    queryKey: ['/api/corrective-actions'],
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/incidents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      setCreateDialogOpen(false);
      resetForm();
      toast({ title: "Incident reported successfully" });
    },
    onError: () => {
      toast({ title: "Failed to report incident", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      severity: "medium",
      category: "",
      location: "",
      incidentDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleCreateSubmit = () => {
    if (!formData.title || !formData.description) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createIncidentMutation.mutate({
      ...formData,
      incidentDate: new Date(formData.incidentDate).toISOString(),
    });
  };

  const incidentStats = {
    total: incidents?.length || 0,
    reported: incidents?.filter(i => i.status === "reported").length || 0,
    investigating: incidents?.filter(i => i.status === "investigating").length || 0,
    resolved: incidents?.filter(i => i.status === "resolved").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Incident Management</h2>
          <p className="text-sm text-muted-foreground">Report and track incidents with corrective actions</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-incident">
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="stat-total-incidents">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{incidentStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Incidents</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-reported-incidents">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{incidentStats.reported}</div>
                <div className="text-sm text-muted-foreground">Reported</div>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-investigating-incidents">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{incidentStats.investigating}</div>
                <div className="text-sm text-muted-foreground">Investigating</div>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="stat-resolved-incidents">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{incidentStats.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
          <CardDescription>All reported incidents across projects</CardDescription>
        </CardHeader>
        <CardContent>
          {!incidents || incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No incidents reported
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <Card 
                    key={incident.id} 
                    className="cursor-pointer hover-elevate"
                    onClick={() => setSelectedIncident(incident)}
                    data-testid={`incident-card-${incident.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{incident.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {incident.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(incident.incidentDate), "MMM d, yyyy")}
                            </div>
                            {incident.hospital && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {incident.hospital.name}
                              </div>
                            )}
                            {incident.reportedBy && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {incident.reportedBy.firstName} {incident.reportedBy.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getIncidentStatusBadge(incident.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Incident</DialogTitle>
            <DialogDescription>
              Provide details about the incident to report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief incident title"
                data-testid="input-incident-title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the incident"
                data-testid="input-incident-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                  <SelectTrigger data-testid="select-incident-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger data-testid="select-incident-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="interpersonal">Interpersonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Incident Date</Label>
                <Input
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  data-testid="input-incident-date"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where did it occur?"
                  data-testid="input-incident-location"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-incident">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSubmit} 
              disabled={createIncidentMutation.isPending}
              data-testid="button-submit-incident"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
            <DialogDescription>
              Incident details and corrective actions
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {getSeverityBadge(selectedIncident.severity)}
                {getIncidentStatusBadge(selectedIncident.status)}
                {selectedIncident.category && (
                  <Badge variant="outline">{selectedIncident.category}</Badge>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date:</span>
                  <span>{format(new Date(selectedIncident.incidentDate), "MMM d, yyyy")}</span>
                </div>
                {selectedIncident.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span>{selectedIncident.location}</span>
                  </div>
                )}
                {selectedIncident.reportedBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Reported by:</span>
                    <span>{selectedIncident.reportedBy.firstName} {selectedIncident.reportedBy.lastName}</span>
                  </div>
                )}
                {selectedIncident.assignedTo && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span>{selectedIncident.assignedTo.firstName} {selectedIncident.assignedTo.lastName}</span>
                  </div>
                )}
              </div>

              {selectedIncident.rootCause && (
                <div className="space-y-2">
                  <h4 className="font-medium">Root Cause</h4>
                  <p className="text-sm text-muted-foreground">{selectedIncident.rootCause}</p>
                </div>
              )}

              {selectedIncident.resolution && (
                <div className="space-y-2">
                  <h4 className="font-medium">Resolution</h4>
                  <p className="text-sm text-muted-foreground">{selectedIncident.resolution}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Corrective Actions</h4>
                {selectedIncident.correctiveActions && selectedIncident.correctiveActions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedIncident.correctiveActions.map((action) => (
                      <Card key={action.id} data-testid={`corrective-action-${action.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium">{action.title}</div>
                              <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                              {action.dueDate && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  Due: {format(new Date(action.dueDate), "MMM d, yyyy")}
                                </div>
                              )}
                            </div>
                            {getCorrectiveActionStatusBadge(action.status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No corrective actions assigned</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reports Tab Component
function ReportsTab() {
  const { data: analytics, isLoading } = useQuery<QualityAnalytics>({
    queryKey: ['/api/quality-analytics'],
  });

  const { data: scorecards } = useQuery<ConsultantScorecardWithDetails[]>({
    queryKey: ['/api/consultant-scorecards'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Calculate certification stats from scorecards
  const certifiedCount = scorecards?.filter(s =>
    parseFloat(s.overallScore || '0') >= 4.0
  ).length || 0;
  const totalScorecards = scorecards?.length || 0;

  return (
    <div className="space-y-6">
      {/* Compliance Summary Card */}
      <Card data-testid="compliance-summary-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Compliance Summary
          </CardTitle>
          <CardDescription>Overview of quality and compliance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4" data-testid="compliance-summary-grid">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{analytics?.avgOverallScore || "0.0"}</div>
              <div className="text-sm text-muted-foreground">Avg. Overall Score</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{analytics?.totalScorecards || 0}</div>
              <div className="text-sm text-muted-foreground">Surveys Completed</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics?.activeScorecards || 0}</div>
              <div className="text-sm text-muted-foreground">Active Scorecards</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics?.npsScore || 0}</div>
              <div className="text-sm text-muted-foreground">NPS Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certification Tracking */}
      <Card data-testid="certification-tracking-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certification Tracking
          </CardTitle>
          <CardDescription>Track consultant certifications and compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">High Performers</div>
                <div className="text-sm text-muted-foreground">Consultants with score &gt;= 4.0</div>
              </div>
              <div className="text-2xl font-bold text-green-600" data-testid="certified-count">{certifiedCount}</div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Total Scorecards</div>
                <div className="text-sm text-muted-foreground">All active scorecards</div>
              </div>
              <div className="text-2xl font-bold" data-testid="total-scorecards">{totalScorecards}</div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Certification Rate</div>
                <div className="text-sm text-muted-foreground">Percentage of high performers</div>
              </div>
              <div className="text-2xl font-bold text-primary" data-testid="certification-rate">
                {totalScorecards > 0 ? Math.round((certifiedCount / totalScorecards) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card data-testid="report-generation-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generate Reports
          </CardTitle>
          <CardDescription>Generate and download compliance reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="button-generate-summary">
              <FileBarChart className="h-6 w-6" />
              <span>Compliance Summary</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="button-generate-certification">
              <Award className="h-6 w-6" />
              <span>Certification Report</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" data-testid="button-schedule-report">
              <Calendar className="h-6 w-6" />
              <span>Schedule Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QualityAssurance() {
  const [activeTab, setActiveTab] = useState("scorecards");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Quality Assurance</h1>
        <p className="text-muted-foreground">
          Manage consultant performance, surveys, NPS feedback, and incidents
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="scorecards" data-testid="tab-scorecards">
            <ClipboardList className="h-4 w-4 mr-2" />
            Scorecards
          </TabsTrigger>
          <TabsTrigger value="surveys" data-testid="tab-surveys">
            <MessageSquare className="h-4 w-4 mr-2" />
            Surveys
          </TabsTrigger>
          <TabsTrigger value="nps" data-testid="tab-nps">
            <TrendingUp className="h-4 w-4 mr-2" />
            NPS
          </TabsTrigger>
          <TabsTrigger value="incidents" data-testid="tab-incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <FileBarChart className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scorecards" className="mt-6">
          <ScorecardsTab />
        </TabsContent>

        <TabsContent value="surveys" className="mt-6">
          <SurveysTab />
        </TabsContent>

        <TabsContent value="nps" className="mt-6">
          <NpsTab />
        </TabsContent>

        <TabsContent value="incidents" className="mt-6">
          <IncidentsTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-6" data-testid="tab-content-reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
