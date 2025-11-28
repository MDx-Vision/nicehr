import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  ClipboardCheck, 
  Timer, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Play,
  Plus,
  Edit,
  Trash2,
  Eye,
  Award,
  Target,
  Clock,
  Hash,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Settings
} from "lucide-react";
import type { 
  Assessment, 
  AssessmentQuestion, 
  AssessmentAttempt, 
  AssessmentWithDetails,
  AssessmentAttemptWithDetails,
  Course,
  CourseEnrollment
} from "@shared/schema";

interface EnrollmentWithCourse extends CourseEnrollment {
  course: {
    id: string;
    title: string;
    description: string | null;
    courseType: string;
    level: string;
    durationMinutes: number | null;
    ceCredits: string | null;
    thumbnailUrl: string | null;
  };
}

interface AssessmentCardData extends Assessment {
  course?: { id: string; title: string } | null;
  courseModule?: { id: string; title: string } | null;
  questionCount?: number;
  userAttempts?: number;
}

interface AttemptWithDetails extends AssessmentAttempt {
  assessment?: {
    id: string;
    title: string;
    passingScore: number | null;
    maxAttempts: number | null;
    course?: { id: string; title: string } | null;
  };
}

function AssessmentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function AssessmentCard({
  assessment,
  userAttemptCount,
  onStart,
  isPending,
}: {
  assessment: AssessmentCardData;
  userAttemptCount: number;
  onStart: () => void;
  isPending: boolean;
}) {
  const maxAttemptsReached = Boolean(assessment.maxAttempts && userAttemptCount >= assessment.maxAttempts);
  const hasAttempted = userAttemptCount > 0;

  return (
    <Card className="flex flex-col h-full" data-testid={`card-assessment-${assessment.id}`}>
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{assessment.title}</CardTitle>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {assessment.description || "No description available"}
        </CardDescription>
        {assessment.course && (
          <Badge variant="outline" className="text-xs w-fit mt-1">
            <BookOpen className="h-3 w-3 mr-1" />
            {assessment.course.title}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Pass: {assessment.passingScore || 70}%</span>
          </div>
          {assessment.timeLimitMinutes && (
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4" />
              <span>{assessment.timeLimitMinutes} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            <span>Max: {assessment.maxAttempts || "Unlimited"} attempts</span>
          </div>
          {assessment.questionCount !== undefined && (
            <div className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>{assessment.questionCount} questions</span>
            </div>
          )}
        </div>
        {hasAttempted && (
          <p className="text-xs text-muted-foreground">
            Attempts used: {userAttemptCount}{assessment.maxAttempts ? ` / ${assessment.maxAttempts}` : ""}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onStart}
          disabled={isPending || maxAttemptsReached}
          data-testid={`button-start-assessment-${assessment.id}`}
        >
          <Play className="h-4 w-4 mr-2" />
          {maxAttemptsReached 
            ? "Max Attempts Reached" 
            : hasAttempted 
              ? "Retake Assessment" 
              : "Start Assessment"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function AttemptResultBadge({ passed }: { passed: boolean | null }) {
  if (passed === null) {
    return <Badge variant="secondary">In Progress</Badge>;
  }
  return passed ? (
    <Badge className="bg-green-500 text-white">
      <CheckCircle className="h-3 w-3 mr-1" />
      Passed
    </Badge>
  ) : (
    <Badge variant="destructive">
      <XCircle className="h-3 w-3 mr-1" />
      Failed
    </Badge>
  );
}

function AttemptsTable({
  attempts,
  isLoading,
}: {
  attempts: AttemptWithDetails[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No attempts yet</p>
        <p className="text-sm">Start an assessment to see your attempts here</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assessment</TableHead>
          <TableHead>Course</TableHead>
          <TableHead className="text-center">Attempt #</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-center">Result</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.map((attempt) => (
          <TableRow key={attempt.id} data-testid={`row-attempt-${attempt.id}`}>
            <TableCell className="font-medium">
              {attempt.assessment?.title || "Unknown Assessment"}
            </TableCell>
            <TableCell>
              {attempt.assessment?.course?.title || "-"}
            </TableCell>
            <TableCell className="text-center">
              {attempt.attemptNumber}
            </TableCell>
            <TableCell className="text-right font-mono">
              {attempt.score !== null ? `${attempt.score}%` : "-"}
            </TableCell>
            <TableCell className="text-center">
              <AttemptResultBadge passed={attempt.passed} />
            </TableCell>
            <TableCell>
              {attempt.startedAt ? format(new Date(attempt.startedAt), "MMM d, yyyy h:mm a") : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type QuestionType = "multiple_choice" | "true_false" | "short_answer";

interface QuestionFormData {
  questionType: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

function QuestionManagementDialog({
  open,
  onOpenChange,
  assessmentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
}) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    questionType: "multiple_choice",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1,
  });

  const { data: questions, isLoading } = useQuery<AssessmentQuestion[]>({
    queryKey: ["/api/assessments", assessmentId, "questions"],
    enabled: open,
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/assessments/${assessmentId}/questions`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "questions"] });
      resetForm();
      toast({
        title: "Question Added",
        description: "The question has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/assessment-questions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "questions"] });
      resetForm();
      toast({
        title: "Question Updated",
        description: "The question has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assessment-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "questions"] });
      toast({
        title: "Question Deleted",
        description: "The question has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      questionType: "multiple_choice",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    });
    setShowAddForm(false);
    setEditingQuestion(null);
  };

  const handleEdit = (question: AssessmentQuestion) => {
    setEditingQuestion(question);
    const options = (question.options as string[]) || ["", "", "", ""];
    setFormData({
      questionType: question.questionType as QuestionType,
      questionText: question.questionText,
      options: options.length >= 4 ? options : [...options, ...Array(4 - options.length).fill("")],
      correctAnswer: question.correctAnswer,
      points: question.points || 1,
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      questionType: formData.questionType,
      questionText: formData.questionText,
      options: formData.questionType === "multiple_choice" 
        ? formData.options.filter(o => o.trim() !== "") 
        : formData.questionType === "true_false" 
          ? ["True", "False"]
          : null,
      correctAnswer: formData.correctAnswer,
      points: formData.points,
    };

    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Multiple Choice";
      case "true_false": return "True/False";
      case "short_answer": return "Short Answer";
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Questions</DialogTitle>
          <DialogDescription>
            Add, edit, or delete questions for this assessment.
          </DialogDescription>
        </DialogHeader>

        {showAddForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={formData.questionType}
                onValueChange={(value: QuestionType) => setFormData({ ...formData, questionType: value })}
              >
                <SelectTrigger data-testid="select-question-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Enter the question..."
                required
                rows={3}
                data-testid="input-question-text"
              />
            </div>

            {formData.questionType === "multiple_choice" && (
              <div className="space-y-2">
                <Label>Options</Label>
                {formData.options.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                    data-testid={`input-option-${index}`}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Correct Answer *</Label>
              {formData.questionType === "true_false" ? (
                <Select
                  value={formData.correctAnswer}
                  onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                >
                  <SelectTrigger data-testid="select-correct-answer">
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">True</SelectItem>
                    <SelectItem value="False">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : formData.questionType === "multiple_choice" ? (
                <Select
                  value={formData.correctAnswer}
                  onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                >
                  <SelectTrigger data-testid="select-correct-answer">
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.options
                      .filter(o => o.trim() !== "")
                      .map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  placeholder="Enter the correct answer"
                  required
                  data-testid="input-correct-answer"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                data-testid="input-points"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                data-testid="button-save-question"
              >
                {editingQuestion ? "Update Question" : "Add Question"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddForm(true)} data-testid="button-add-question">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No questions yet</p>
                <p className="text-sm">Add your first question to this assessment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions?.map((question, index) => (
                  <Card key={question.id} data-testid={`card-question-${question.id}`}>
                    <CardHeader className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getQuestionTypeLabel(question.questionType)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.points} pts
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">
                            Q{index + 1}: {question.questionText}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Correct answer: {question.correctAnswer}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(question)}
                            data-testid={`button-edit-question-${question.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteQuestionMutation.mutate(question.id)}
                            data-testid={`button-delete-question-${question.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateAssessmentDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  courses,
  editingAssessment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
  courses: Course[];
  editingAssessment?: Assessment | null;
}) {
  const [formData, setFormData] = useState({
    courseId: editingAssessment?.courseId || "",
    courseModuleId: editingAssessment?.courseModuleId || "",
    title: editingAssessment?.title || "",
    description: editingAssessment?.description || "",
    passingScore: editingAssessment?.passingScore?.toString() || "70",
    timeLimitMinutes: editingAssessment?.timeLimitMinutes?.toString() || "",
    maxAttempts: editingAssessment?.maxAttempts?.toString() || "3",
  });

  useEffect(() => {
    if (editingAssessment) {
      setFormData({
        courseId: editingAssessment.courseId || "",
        courseModuleId: editingAssessment.courseModuleId || "",
        title: editingAssessment.title || "",
        description: editingAssessment.description || "",
        passingScore: editingAssessment.passingScore?.toString() || "70",
        timeLimitMinutes: editingAssessment.timeLimitMinutes?.toString() || "",
        maxAttempts: editingAssessment.maxAttempts?.toString() || "3",
      });
    } else {
      setFormData({
        courseId: "",
        courseModuleId: "",
        title: "",
        description: "",
        passingScore: "70",
        timeLimitMinutes: "",
        maxAttempts: "3",
      });
    }
  }, [editingAssessment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      courseId: formData.courseId,
      courseModuleId: formData.courseModuleId || null,
      title: formData.title,
      description: formData.description || null,
      passingScore: parseInt(formData.passingScore) || 70,
      timeLimitMinutes: formData.timeLimitMinutes ? parseInt(formData.timeLimitMinutes) : null,
      maxAttempts: parseInt(formData.maxAttempts) || 3,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingAssessment ? "Edit Assessment" : "Create New Assessment"}</DialogTitle>
          <DialogDescription>
            {editingAssessment ? "Update the assessment details below." : "Create a new competency assessment for a course."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseId">Course *</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            >
              <SelectTrigger data-testid="select-assessment-course">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Assessment title"
              required
              data-testid="input-assessment-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Assessment description"
              rows={3}
              data-testid="input-assessment-description"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                data-testid="input-passing-score"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimitMinutes">Time Limit (min)</Label>
              <Input
                id="timeLimitMinutes"
                type="number"
                min="1"
                value={formData.timeLimitMinutes}
                onChange={(e) => setFormData({ ...formData, timeLimitMinutes: e.target.value })}
                placeholder="No limit"
                data-testid="input-time-limit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Max Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                min="1"
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                data-testid="input-max-attempts"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !formData.courseId || !formData.title}
              data-testid="button-save-assessment"
            >
              {isPending ? "Saving..." : editingAssessment ? "Update Assessment" : "Create Assessment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssessmentTakingDialog({
  open,
  onOpenChange,
  assessment,
  questions,
  attemptId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: AssessmentCardData | null;
  questions: AssessmentQuestion[];
  attemptId: string | null;
  onSubmit: (answers: Record<string, string>, score: number, passed: boolean) => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (open && assessment?.timeLimitMinutes) {
      setTimeRemaining(assessment.timeLimitMinutes * 60);
    }
    if (open) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResults(false);
    }
  }, [open, assessment]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, showResults]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateScore = useCallback(() => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question) => {
      const points = question.points || 1;
      totalPoints += points;
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
        earnedPoints += points;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    return score;
  }, [questions, answers]);

  const handleSubmit = () => {
    const score = calculateScore();
    const passingScore = assessment?.passingScore || 70;
    const hasPassed = score >= passingScore;
    
    setFinalScore(score);
    setPassed(hasPassed);
    setShowResults(true);
    onSubmit(answers, score, hasPassed);
  };

  const handleClose = () => {
    setShowResults(false);
    onOpenChange(false);
  };

  if (!assessment || questions.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {showResults ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {passed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
                Assessment Results
              </DialogTitle>
              <DialogDescription>
                {assessment.title}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center space-y-4">
              <div className="text-5xl font-bold">
                {finalScore}%
              </div>
              <div>
                <Badge className={passed ? "bg-green-500 text-white" : ""} variant={passed ? "default" : "destructive"}>
                  {passed ? "Passed" : "Failed"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Passing score: {assessment.passingScore || 70}%
              </p>
              <p className="text-sm text-muted-foreground">
                You answered {answeredCount} out of {totalQuestions} questions
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} data-testid="button-close-results">
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{assessment.title}</DialogTitle>
                  <DialogDescription>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </DialogDescription>
                </div>
                {timeRemaining !== null && (
                  <Badge variant={timeRemaining < 60 ? "destructive" : "secondary"} className="text-lg px-3 py-1">
                    <Timer className="h-4 w-4 mr-1" />
                    {formatTime(timeRemaining)}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="py-4">
              <Progress 
                value={(currentQuestionIndex + 1) / totalQuestions * 100} 
                className="h-2 mb-6"
              />

              {currentQuestion && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {currentQuestion.points || 1} pts
                    </Badge>
                    <p className="text-lg font-medium">{currentQuestion.questionText}</p>
                  </div>

                  {currentQuestion.questionType === "true_false" ? (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => setAnswers({ ...answers, [currentQuestion.id]: value })}
                      className="space-y-2"
                    >
                      {["True", "False"].map((option) => (
                        <div key={option} className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                          <RadioGroupItem value={option} id={`option-${option}`} data-testid={`radio-${option.toLowerCase()}`} />
                          <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : currentQuestion.questionType === "multiple_choice" ? (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => setAnswers({ ...answers, [currentQuestion.id]: value })}
                      className="space-y-2"
                    >
                      {(currentQuestion.options as string[])?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                          <RadioGroupItem value={option} id={`option-${index}`} data-testid={`radio-option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Input
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                      placeholder="Type your answer..."
                      data-testid="input-short-answer"
                    />
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  data-testid="button-prev-question"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  data-testid="button-next-question"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <Button 
                onClick={handleSubmit}
                data-testid="button-submit-assessment"
              >
                Submit Assessment ({answeredCount}/{totalQuestions})
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ManageAssessmentsTab({
  assessments,
  courses,
  isLoading,
}: {
  assessments: AssessmentCardData[];
  courses: Course[];
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/assessments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCreateDialogOpen(false);
      toast({
        title: "Assessment Created",
        description: "The assessment has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/assessments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditingAssessment(null);
      toast({
        title: "Assessment Updated",
        description: "The assessment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAssessmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assessments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Assessment Deleted",
        description: "The assessment has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingAssessment) {
      updateAssessmentMutation.mutate({ id: editingAssessment.id, data });
    } else {
      createAssessmentMutation.mutate(data);
    }
  };

  const handleManageQuestions = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setQuestionsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-assessment">
          <Plus className="h-4 w-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No assessments yet</p>
          <p className="text-sm">Create your first assessment to get started</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-center">Passing Score</TableHead>
              <TableHead className="text-center">Max Attempts</TableHead>
              <TableHead className="text-center">Time Limit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((assessment) => (
              <TableRow key={assessment.id} data-testid={`row-assessment-${assessment.id}`}>
                <TableCell className="font-medium">{assessment.title}</TableCell>
                <TableCell>{assessment.course?.title || "-"}</TableCell>
                <TableCell className="text-center">{assessment.passingScore || 70}%</TableCell>
                <TableCell className="text-center">{assessment.maxAttempts || "Unlimited"}</TableCell>
                <TableCell className="text-center">
                  {assessment.timeLimitMinutes ? `${assessment.timeLimitMinutes} min` : "No limit"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleManageQuestions(assessment.id)}
                      data-testid={`button-manage-questions-${assessment.id}`}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingAssessment(assessment)}
                      data-testid={`button-edit-assessment-${assessment.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteAssessmentMutation.mutate(assessment.id)}
                      data-testid={`button-delete-assessment-${assessment.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateAssessmentDialog
        open={createDialogOpen || editingAssessment !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingAssessment(null);
          }
        }}
        onSubmit={handleSubmit}
        isPending={createAssessmentMutation.isPending || updateAssessmentMutation.isPending}
        courses={courses}
        editingAssessment={editingAssessment}
      />

      {selectedAssessmentId && (
        <QuestionManagementDialog
          open={questionsDialogOpen}
          onOpenChange={setQuestionsDialogOpen}
          assessmentId={selectedAssessmentId}
        />
      )}
    </div>
  );
}

export default function Assessments() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("available");
  const [takingAssessment, setTakingAssessment] = useState<AssessmentCardData | null>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ["/api/my-enrollments"],
  });

  const { data: myAttempts, isLoading: attemptsLoading } = useQuery<AttemptWithDetails[]>({
    queryKey: ["/api/my-attempts"],
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: isAdmin,
  });

  const enrolledCourseIds = enrollments?.map(e => e.courseId) || [];
  
  const assessmentQueries = useQuery<AssessmentCardData[]>({
    queryKey: ["/api/available-assessments", enrolledCourseIds],
    queryFn: async () => {
      if (enrolledCourseIds.length === 0) return [];
      
      const allAssessments: AssessmentCardData[] = [];
      for (const courseId of enrolledCourseIds) {
        try {
          const res = await fetch(`/api/courses/${courseId}/assessments`, { credentials: "include" });
          if (res.ok) {
            const courseAssessments = await res.json();
            const course = enrollments?.find(e => e.courseId === courseId)?.course;
            courseAssessments.forEach((a: Assessment) => {
              allAssessments.push({
                ...a,
                course: course ? { id: course.id, title: course.title } : null,
              });
            });
          }
        } catch (error) {
          console.error(`Failed to fetch assessments for course ${courseId}:`, error);
        }
      }
      return allAssessments;
    },
    enabled: enrolledCourseIds.length > 0,
  });

  const allAssessmentsQuery = useQuery<AssessmentCardData[]>({
    queryKey: ["/api/all-assessments"],
    queryFn: async () => {
      if (!courses || courses.length === 0) return [];
      
      const allAssessments: AssessmentCardData[] = [];
      for (const course of courses) {
        try {
          const res = await fetch(`/api/courses/${course.id}/assessments`, { credentials: "include" });
          if (res.ok) {
            const courseAssessments = await res.json();
            courseAssessments.forEach((a: Assessment) => {
              allAssessments.push({
                ...a,
                course: { id: course.id, title: course.title },
              });
            });
          }
        } catch (error) {
          console.error(`Failed to fetch assessments for course ${course.id}:`, error);
        }
      }
      return allAssessments;
    },
    enabled: isAdmin && !!courses && courses.length > 0,
  });

  const getUserAttemptCount = (assessmentId: string): number => {
    return myAttempts?.filter(a => a.assessmentId === assessmentId).length || 0;
  };

  const startAttemptMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const res = await apiRequest("POST", `/api/assessments/${assessmentId}/attempts`);
      return res.json();
    },
    onSuccess: async (attempt, assessmentId) => {
      setCurrentAttemptId(attempt.id);
      
      const questionsRes = await fetch(`/api/assessments/${assessmentId}/questions`, { credentials: "include" });
      if (questionsRes.ok) {
        const questions = await questionsRes.json();
        setAssessmentQuestions(questions);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Start Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitAttemptMutation = useMutation({
    mutationFn: async ({ attemptId, answers, score, passed }: { attemptId: string; answers: Record<string, string>; score: number; passed: boolean }) => {
      const res = await apiRequest("POST", `/api/assessment-attempts/${attemptId}/submit`, { answers, score, passed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-attempts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Submit Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartAssessment = async (assessment: AssessmentCardData) => {
    setTakingAssessment(assessment);
    startAttemptMutation.mutate(assessment.id);
  };

  const handleSubmitAssessment = (answers: Record<string, string>, score: number, passed: boolean) => {
    if (currentAttemptId) {
      submitAttemptMutation.mutate({ attemptId: currentAttemptId, answers, score, passed });
    }
  };

  const availableAssessments = assessmentQueries.data || [];
  const allAssessments = allAssessmentsQuery.data || [];

  return (
    <div className="space-y-6" data-testid="page-assessments">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <ClipboardCheck className="h-6 w-6" />
          Competency Assessments
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          Test your knowledge and track your progress with course assessments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-assessments">
          <TabsTrigger value="available" data-testid="tab-available">
            Available Assessments
          </TabsTrigger>
          <TabsTrigger value="attempts" data-testid="tab-attempts">
            My Attempts
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="manage" data-testid="tab-manage">
              Manage Assessments
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {enrollmentsLoading || assessmentQueries.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <AssessmentCardSkeleton key={i} />
              ))}
            </div>
          ) : enrollments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No enrolled courses</p>
              <p className="text-sm">Enroll in a course to access assessments</p>
            </div>
          ) : availableAssessments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No assessments available</p>
              <p className="text-sm">Your enrolled courses don't have any assessments yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableAssessments.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  userAttemptCount={getUserAttemptCount(assessment.id)}
                  onStart={() => handleStartAssessment(assessment)}
                  isPending={startAttemptMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attempts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                My Assessment Attempts
              </CardTitle>
              <CardDescription>
                View your history of assessment attempts and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttemptsTable 
                attempts={myAttempts || []} 
                isLoading={attemptsLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="manage" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Assessments
                </CardTitle>
                <CardDescription>
                  Create, edit, and manage assessments for your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ManageAssessmentsTab
                  assessments={allAssessments}
                  courses={courses || []}
                  isLoading={coursesLoading || allAssessmentsQuery.isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <AssessmentTakingDialog
        open={takingAssessment !== null && assessmentQuestions.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setTakingAssessment(null);
            setCurrentAttemptId(null);
            setAssessmentQuestions([]);
          }
        }}
        assessment={takingAssessment}
        questions={assessmentQuestions}
        attemptId={currentAttemptId}
        onSubmit={handleSubmitAssessment}
      />
    </div>
  );
}
