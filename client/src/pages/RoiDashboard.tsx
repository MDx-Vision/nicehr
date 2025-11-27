import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Star, ClipboardCheck, Building2 } from "lucide-react";
import type { Project, Hospital, RoiSurvey, RoiQuestion } from "@shared/schema";

export default function RoiDashboard() {
  const [selectedProject, setSelectedProject] = useState<string>("");

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
            <Card data-testid="card-total-surveys">
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

            <Card data-testid="card-avg-score">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgScore}</div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card data-testid="card-consultants">
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

            <Card data-testid="card-savings">
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
                  <div className="space-y-4">
                    {questions.map((question, idx) => (
                      <div key={question.id} className="border-b pb-3 last:border-0">
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
                  <div className="space-y-4">
                    {surveys.slice(0, 5).map((survey) => (
                      <div key={survey.id} className="flex items-center justify-between border-b pb-3 last:border-0">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Project Overview
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
                    <Badge className="capitalize">{selectedProjectData.status}</Badge>
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
    </div>
  );
}
