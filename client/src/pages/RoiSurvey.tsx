import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck, Star, Building2, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Project, Hospital, RoiQuestion, RoiSurvey as RoiSurveyType } from "@shared/schema";

export default function RoiSurvey() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentSurvey, setCurrentSurvey] = useState<RoiSurveyType | null>(null);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const { data: questions } = useQuery<RoiQuestion[]>({
    queryKey: ["/api/roi/questions"],
  });

  const { data: existingSurveys } = useQuery<RoiSurveyType[]>({
    queryKey: ["/api/projects", selectedProject, "surveys"],
    enabled: !!selectedProject,
  });

  const createSurveyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${selectedProject}/surveys`, {});
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentSurvey(data);
      toast({ title: "Survey started" });
    },
    onError: () => {
      toast({ title: "Failed to start survey", variant: "destructive" });
    },
  });

  const submitResponseMutation = useMutation({
    mutationFn: async ({ questionId, response }: { questionId: string; response: string }) => {
      return await apiRequest("POST", `/api/surveys/${currentSurvey?.id}/responses`, {
        questionId,
        responseText: response,
        responseScore: getScoreFromResponse(response),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys", currentSurvey?.id, "responses"] });
    },
    onError: () => {
      toast({ title: "Failed to save response", variant: "destructive" });
    },
  });

  const completeSurveyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/surveys/${currentSurvey?.id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "surveys"] });
      toast({ title: "Survey submitted successfully" });
      setCurrentSurvey(null);
      setResponses({});
    },
    onError: () => {
      toast({ title: "Failed to submit survey", variant: "destructive" });
    },
  });

  const getScoreFromResponse = (response: string): number => {
    const scores: Record<string, number> = {
      "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
      "excellent": 5, "good": 4, "average": 3, "poor": 2, "very_poor": 1,
    };
    return scores[response.toLowerCase()] || 3;
  };

  const getHospitalName = (hospitalId: string) => {
    return hospitals?.find((h) => h.id === hospitalId)?.name || "Unknown";
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    if (currentSurvey) {
      submitResponseMutation.mutate({ questionId, response: value });
    }
  };

  const handleSubmit = () => {
    if (!currentSurvey) return;
    completeSurveyMutation.mutate();
  };

  const userPreviousSurvey = existingSurveys?.find(
    (s) => s.respondentId === user?.id && s.completedAt
  );

  const activeProjects = projects?.filter((p) => p.status === "active" || p.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-roi-survey-title">ROI Survey</h1>
        <p className="text-muted-foreground">
          Provide feedback on project performance and consultant quality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Select Project
          </CardTitle>
          <CardDescription>
            Choose a project to provide feedback for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full md:w-[300px]" data-testid="select-project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {activeProjects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} - {getHospitalName(project.hospitalId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!selectedProject ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
            <p className="text-muted-foreground">
              Choose a project to start the ROI survey.
            </p>
          </CardContent>
        </Card>
      ) : userPreviousSurvey ? (
        <Card>
          <CardContent className="py-10 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Survey Completed</h3>
            <p className="text-muted-foreground">
              You have already submitted a survey for this project.
              Thank you for your feedback!
            </p>
            <Badge variant="default" className="mt-4">
              Submitted on {new Date(userPreviousSurvey.completedAt!).toLocaleDateString()}
            </Badge>
          </CardContent>
        </Card>
      ) : !currentSurvey ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Survey</h3>
            <p className="text-muted-foreground mb-4">
              Begin the ROI survey for the selected project.
            </p>
            <Button
              onClick={() => createSurveyMutation.mutate()}
              disabled={createSurveyMutation.isPending}
              data-testid="button-start-survey"
            >
              Start Survey
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions && questions.length > 0 ? (
            <>
              {questions.map((question, idx) => (
                <Card key={question.id} data-testid={`card-question-${question.id}`}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">{idx + 1}</Badge>
                      {question.question}
                    </CardTitle>
                    {question.category && (
                      <CardDescription>Category: {question.category}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {question.questionType === "rating" || !question.questionType ? (
                      <RadioGroup
                        value={responses[question.id] || ""}
                        onValueChange={(value) => handleResponseChange(question.id, value)}
                        className="flex gap-4"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex flex-col items-center gap-1">
                            <RadioGroupItem
                              value={rating.toString()}
                              id={`${question.id}-${rating}`}
                            />
                            <Label
                              htmlFor={`${question.id}-${rating}`}
                              className="flex items-center gap-1"
                            >
                              <Star className="w-4 h-4" />
                              {rating}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Textarea
                        placeholder="Enter your response..."
                        value={responses[question.id] || ""}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        data-testid={`input-response-${question.id}`}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardContent className="py-6">
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">
                      Answered {Object.keys(responses).length} of {questions.length} questions
                    </p>
                    <Button
                      onClick={handleSubmit}
                      disabled={completeSurveyMutation.isPending || Object.keys(responses).length < questions.length}
                      data-testid="button-submit-survey"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Survey
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
                <p className="text-muted-foreground">
                  Survey questions have not been configured yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
