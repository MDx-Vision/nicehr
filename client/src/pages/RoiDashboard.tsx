import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, TrendingUp, Users, Star, ClipboardCheck, Building2, ExternalLink } from "lucide-react";
import type { Project, Hospital, RoiSurvey, RoiQuestion } from "@shared/schema";

export default function RoiDashboard() {
  const [, navigate] = useLocation();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [surveyListDialog, setSurveyListDialog] = useState<{
    open: boolean;
    filter: "all" | "completed" | "in_progress";
  }>({ open: false, filter: "all" });
  const [surveyDetailDialog, setSurveyDetailDialog] = useState<{
    open: boolean;
    survey: RoiSurvey | null;
  }>({ open: false, survey: null });
  const [questionDetailDialog, setQuestionDetailDialog] = useState<{
    open: boolean;
    question: RoiQuestion | null;
  }>({ open: false, question: null });
  const [savingsDialog, setSavingsDialog] = useState(false);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const { data: surveys } = useQuery<RoiSurvey[]>({
    queryKey: ["/api/projects", selectedProject, "surveys"],
    enabled: !!selectedProject,
  });

  const { data: questions } = useQuery<RoiQuestion[]>({
    queryKey: ["/api/roi/questions"],
  });

  const getHospitalName = (hospitalId: string) => {
    return hospitals?.find((h) => h.id === hospitalId)?.name || "Unknown";
  };

  const selectedProjectData = projects?.find((p) => p.id === selectedProject);

  const completedSurveys = surveys?.filter((s) => s.completedAt) || [];
  const avgScore = "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-roi-title">ROI Dashboard</h1>
        <p className="text-muted-foreground">
          Track project performance and gather feedback from hospital staff
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[300px]" data-testid="select-project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} - {getHospitalName(project.hospitalId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProject ? (
        <Card>
          <CardContent className="py-10 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
            <p className="text-muted-foreground">
              Choose a project to view its ROI metrics and survey responses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card
              data-testid="card-total-surveys"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setSurveyListDialog({ open: true, filter: "all" })}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{surveys?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {completedSurveys.length} completed
                </p>
              </CardContent>
            </Card>

            <Card
              data-testid="card-avg-score"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setSurveyListDialog({ open: true, filter: "completed" })}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgScore}</div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card
              data-testid="card-consultants"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => navigate("/consultants")}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Consultants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedProjectData?.actualConsultants || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {selectedProjectData?.estimatedConsultants || 0} estimated
                </p>
              </CardContent>
            </Card>

            <Card
              data-testid="card-savings"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setSavingsDialog(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {selectedProjectData?.savings
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(parseFloat(selectedProjectData.savings))
                    : "$0"}
                </div>
                <p className="text-xs text-muted-foreground">Total savings</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Survey Questions</CardTitle>
                <CardDescription>
                  Questions used to gather feedback from hospital staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                {questions && questions.length > 0 ? (
                  <div className="space-y-4" data-testid="questions-list">
                    {questions.map((question, idx) => (
                      <div
                        key={question.id}
                        className="border-b pb-3 last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                        data-testid={`question-item-${question.id}`}
                        onClick={() => setQuestionDetailDialog({ open: true, question })}
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">
                            {idx + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{question.question}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              Type: {question.questionType || "text"} | Category: {question.category || "General"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No survey questions configured yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Surveys</CardTitle>
                <CardDescription>
                  Latest survey responses for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {surveys && surveys.length > 0 ? (
                  <div className="space-y-4" data-testid="surveys-list">
                    {surveys.slice(0, 5).map((survey) => (
                      <div
                        key={survey.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                        data-testid={`survey-item-${survey.id}`}
                        onClick={() => setSurveyDetailDialog({ open: true, survey })}
                      >
                        <div>
                          <p className="font-medium">Survey #{survey.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Respondent: {survey.respondentId?.slice(0, 8) || "Anonymous"}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={survey.completedAt ? "default" : "secondary"}>
                            {survey.completedAt ? "Completed" : "In Progress"}
                          </Badge>
                          {survey.isComplete && (
                            <p className="text-sm font-medium mt-1">
                              Complete
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No surveys have been submitted yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedProjectData && (
            <Card
              data-testid="card-project-overview"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => navigate(`/projects`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Project Overview
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects`);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Full Project
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Project Name</p>
                    <p className="font-medium">{selectedProjectData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hospital</p>
                    <p className="font-medium">{getHospitalName(selectedProjectData.hospitalId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="capitalize" data-testid="project-status-badge">{selectedProjectData.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{selectedProjectData.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{selectedProjectData.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Budget</p>
                    <p className="font-medium">
                      {selectedProjectData.estimatedBudget
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          }).format(parseFloat(selectedProjectData.estimatedBudget))
                        : "-"}
                    </p>
                  </div>
                </div>
                {selectedProjectData.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="mt-1">{selectedProjectData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Survey List Dialog */}
      <Dialog
        open={surveyListDialog.open}
        onOpenChange={(open) => setSurveyListDialog({ open, filter: "all" })}
      >
        <DialogContent className="max-w-2xl" data-testid="dialog-survey-list">
          <DialogHeader>
            <DialogTitle>
              {surveyListDialog.filter === "all" ? "All Surveys" :
               surveyListDialog.filter === "completed" ? "Completed Surveys" : "In Progress Surveys"}
            </DialogTitle>
            <DialogDescription>
              {surveys?.filter(s => {
                if (surveyListDialog.filter === "all") return true;
                if (surveyListDialog.filter === "completed") return s.completedAt;
                return !s.completedAt;
              }).length || 0} surveys
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {surveys && surveys.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey ID</TableHead>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveys
                    .filter(s => {
                      if (surveyListDialog.filter === "all") return true;
                      if (surveyListDialog.filter === "completed") return s.completedAt;
                      return !s.completedAt;
                    })
                    .map((survey) => (
                    <TableRow
                      key={survey.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSurveyListDialog({ open: false, filter: "all" });
                        setSurveyDetailDialog({ open: true, survey });
                      }}
                    >
                      <TableCell className="font-mono text-sm">{survey.id.slice(0, 8)}</TableCell>
                      <TableCell>{survey.respondentId?.slice(0, 8) || "Anonymous"}</TableCell>
                      <TableCell>
                        <Badge variant={survey.completedAt ? "default" : "secondary"}>
                          {survey.completedAt ? "Completed" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {survey.completedAt
                          ? new Date(survey.completedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No surveys available
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSurveyListDialog({ open: false, filter: "all" })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Survey Detail Dialog */}
      <Dialog
        open={surveyDetailDialog.open}
        onOpenChange={(open) => setSurveyDetailDialog({ open, survey: null })}
      >
        <DialogContent data-testid="dialog-survey-detail">
          <DialogHeader>
            <DialogTitle>Survey Details</DialogTitle>
            <DialogDescription>
              Survey #{surveyDetailDialog.survey?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {surveyDetailDialog.survey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Respondent ID</p>
                  <p className="font-medium font-mono">
                    {surveyDetailDialog.survey.respondentId?.slice(0, 12) || "Anonymous"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={surveyDetailDialog.survey.completedAt ? "default" : "secondary"}>
                    {surveyDetailDialog.survey.completedAt ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {surveyDetailDialog.survey.createdAt
                      ? new Date(surveyDetailDialog.survey.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="font-medium">
                    {surveyDetailDialog.survey.completedAt
                      ? new Date(surveyDetailDialog.survey.completedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSurveyDetailDialog({ open: false, survey: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Detail Dialog */}
      <Dialog
        open={questionDetailDialog.open}
        onOpenChange={(open) => setQuestionDetailDialog({ open, question: null })}
      >
        <DialogContent data-testid="dialog-question-detail">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {questionDetailDialog.question && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Question</p>
                <p className="font-medium text-lg" data-testid="question-detail-text">
                  {questionDetailDialog.question.question}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline" className="capitalize">
                    {questionDetailDialog.question.questionType || "text"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline" className="capitalize">
                    {questionDetailDialog.question.category || "General"}
                  </Badge>
                </div>
              </div>
              {questionDetailDialog.question.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{questionDetailDialog.question.description}</p>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Response Distribution</p>
                <p className="text-muted-foreground text-center py-4">
                  Response distribution data coming soon
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDetailDialog({ open: false, question: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Savings Dialog */}
      <Dialog open={savingsDialog} onOpenChange={setSavingsDialog}>
        <DialogContent data-testid="dialog-savings">
          <DialogHeader>
            <DialogTitle>Savings Breakdown</DialogTitle>
            <DialogDescription>
              Total savings for {selectedProjectData?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProjectData && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-green-600">
                  {selectedProjectData.savings
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(parseFloat(selectedProjectData.savings))
                    : "$0"}
                </p>
                <p className="text-muted-foreground">Total Project Savings</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">Savings by Category</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Efficiency Gains</span>
                    <span className="font-medium text-green-600">
                      {selectedProjectData.savings
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          }).format(parseFloat(selectedProjectData.savings) * 0.4)
                        : "$0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Cost Avoidance</span>
                    <span className="font-medium text-green-600">
                      {selectedProjectData.savings
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          }).format(parseFloat(selectedProjectData.savings) * 0.35)
                        : "$0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span>Resource Optimization</span>
                    <span className="font-medium text-green-600">
                      {selectedProjectData.savings
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          }).format(parseFloat(selectedProjectData.savings) * 0.25)
                        : "$0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavingsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
