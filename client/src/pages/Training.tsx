import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  BookOpen, GraduationCap, Play, CheckCircle, Clock, Search, Plus, 
  FileText, Award, Users, Monitor, HelpCircle, Star, Bookmark,
  ChevronRight, Timer, XCircle, RotateCcw, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

// Interfaces
interface TrainingModule {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  difficulty: string;
  required: boolean;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  contents: ModuleContent[];
}

interface ModuleContent {
  id: string;
  title: string;
  type: "video" | "document" | "quiz" | "interactive";
  url: string;
  completed: boolean;
}

interface Assessment {
  id: string;
  name: string;
  description: string;
  type: "skill" | "knowledge" | "certification";
  passingScore: number;
  timeLimit: number;
  status: "not-started" | "in-progress" | "passed" | "failed";
  score?: number;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options: string[];
  correctAnswer: number;
}

interface Lab {
  id: string;
  name: string;
  system: string;
  description: string;
  status: "available" | "in-use" | "maintenance";
  instructions: string;
  duration: number;
}

interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  helpful: number;
  bookmarked: boolean;
}

interface CompetencyRecord {
  id: string;
  consultantId: string;
  consultantName: string;
  skill: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  lastAssessed: string;
}

export default function Training() {
  const { toast } = useToast();

  // Main tab state
  const [activeTab, setActiveTab] = useState("modules");
  const [progressTab, setProgressTab] = useState("overview");

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState("all");
  const [kbCategoryFilter, setKbCategoryFilter] = useState("all");
  const [consultantFilter, setConsultantFilter] = useState("all");

  // Modal states
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [addContentOpen, setAddContentOpen] = useState(false);
  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [createArticleOpen, setCreateArticleOpen] = useState(false);
  const [endLabOpen, setEndLabOpen] = useState(false);
  const [updateLevelOpen, setUpdateLevelOpen] = useState(false);

  // View states
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [trainingMode, setTrainingMode] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: number}>({});
  const [showResults, setShowResults] = useState(false);

  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [labSession, setLabSession] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyRecord | null>(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    difficulty: "",
    required: false
  });

  const [contentForm, setContentForm] = useState({
    title: "",
    type: "",
    url: ""
  });

  const [assessmentForm, setAssessmentForm] = useState({
    name: "",
    description: "",
    type: "",
    passingScore: "",
    timeLimit: ""
  });

  const [questionForm, setQuestionForm] = useState({
    text: "",
    type: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: 1
  });

  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    category: ""
  });

  const [newLevel, setNewLevel] = useState("");

  // Demo data
  const [modules, setModules] = useState<TrainingModule[]>([
    {
      id: "mod-1",
      name: "Epic EHR Fundamentals",
      description: "Introduction to Epic electronic health record system",
      category: "EHR",
      duration: 60,
      difficulty: "Beginner",
      required: true,
      status: "in-progress",
      progress: 33,
      contents: [
        { id: "c1", title: "Welcome Video", type: "video", url: "#", completed: false },
        { id: "c2", title: "Navigation Basics", type: "document", url: "#", completed: false },
        { id: "c3", title: "Module Quiz", type: "quiz", url: "#", completed: false }
      ]
    },
    {
      id: "mod-2",
      name: "Cerner PowerChart Training",
      description: "Comprehensive Cerner PowerChart user training",
      category: "EHR",
      duration: 90,
      difficulty: "Intermediate",
      required: true,
      status: "not-started",
      progress: 0,
      contents: [
        { id: "c4", title: "Introduction", type: "video", url: "#", completed: false },
        { id: "c5", title: "Clinical Documentation", type: "interactive", url: "#", completed: false }
      ]
    },
    {
      id: "mod-3",
      name: "HIPAA Compliance",
      description: "Healthcare privacy and security requirements",
      category: "Compliance",
      duration: 45,
      difficulty: "Beginner",
      required: true,
      status: "completed",
      progress: 100,
      contents: [
        { id: "c6", title: "Privacy Rules", type: "document", url: "#", completed: true },
        { id: "c7", title: "Security Practices", type: "video", url: "#", completed: true }
      ]
    }
  ]);

  const [assessments, setAssessments] = useState<Assessment[]>([
    {
      id: "assess-2",
      name: "Clinical Documentation Certification",
      description: "Certification exam for clinical documentation specialists",
      type: "certification",
      passingScore: 85,
      timeLimit: 60,
      status: "not-started",
      questions: [
        {
          id: "q3",
          text: "What is the correct format for documenting vital signs?",
          type: "multiple-choice",
          options: ["Free text", "Structured template", "Voice recording", "Any format"],
          correctAnswer: 1
        }
      ]
    },
    {
      id: "assess-1",
      name: "Epic Orders Module Assessment",
      description: "Test your knowledge of Epic Orders functionality",
      type: "skill",
      passingScore: 80,
      timeLimit: 30,
      status: "passed",
      score: 92,
      questions: [
        {
          id: "q1",
          text: "What is the primary function of the Orders module?",
          type: "multiple-choice",
          options: ["Process orders", "Schedule appointments", "Manage billing", "Create reports"],
          correctAnswer: 0
        },
        {
          id: "q2",
          text: "Which shortcut opens the order entry screen?",
          type: "multiple-choice",
          options: ["Ctrl+O", "F2", "Alt+Enter", "Ctrl+N"],
          correctAnswer: 1
        }
      ]
    },
    {
      id: "assess-3",
      name: "EHR Navigation Skills",
      description: "Basic navigation skills assessment",
      type: "knowledge",
      passingScore: 70,
      timeLimit: 20,
      status: "failed",
      score: 65,
      questions: [
        {
          id: "q4",
          text: "Where can you find patient allergies?",
          type: "multiple-choice",
          options: ["Chart Review", "Patient Summary", "Medications tab", "All of the above"],
          correctAnswer: 3
        }
      ]
    }
  ]);

  const [labs, setLabs] = useState<Lab[]>([
    {
      id: "lab-1",
      name: "Epic Training Environment",
      system: "Epic Hyperspace",
      description: "Full Epic training environment with sample patient data",
      status: "available",
      instructions: "1. Log in with your training credentials\n2. Navigate to the patient list\n3. Practice order entry and documentation",
      duration: 60
    },
    {
      id: "lab-2",
      name: "Cerner Sandbox",
      system: "Cerner PowerChart",
      description: "Cerner PowerChart sandbox for practice",
      status: "available",
      instructions: "1. Access via Citrix\n2. Use demo patient MRN: 12345\n3. Complete all exercises in the workbook",
      duration: 45
    },
    {
      id: "lab-3",
      name: "Integration Testing Lab",
      system: "Multi-system",
      description: "Test HL7 integrations between systems",
      status: "maintenance",
      instructions: "Lab currently under maintenance",
      duration: 90
    }
  ]);

  const [articles, setArticles] = useState<KBArticle[]>([
    {
      id: "kb-1",
      title: "Epic Orders Best Practices",
      content: "This guide covers best practices for entering and managing orders in Epic...",
      category: "EHR Systems",
      helpful: 45,
      bookmarked: false
    },
    {
      id: "kb-2",
      title: "Troubleshooting Login Issues",
      content: "Common solutions for login and authentication problems...",
      category: "Technical Support",
      helpful: 128,
      bookmarked: true
    },
    {
      id: "kb-3",
      title: "Clinical Documentation Guidelines",
      content: "Standards and guidelines for clinical documentation...",
      category: "Clinical",
      helpful: 67,
      bookmarked: false
    }
  ]);

  const [competencyRecords, setCompetencyRecords] = useState<CompetencyRecord[]>([
    {
      id: "comp-1",
      consultantId: "c-1",
      consultantName: "Amanda Foster",
      skill: "Epic Orders",
      level: "advanced",
      lastAssessed: "2024-01-15"
    },
    {
      id: "comp-2",
      consultantId: "c-1",
      consultantName: "Amanda Foster",
      skill: "Clinical Documentation",
      level: "expert",
      lastAssessed: "2024-01-10"
    },
    {
      id: "comp-3",
      consultantId: "c-2",
      consultantName: "Brian Martinez",
      skill: "Epic Orders",
      level: "intermediate",
      lastAssessed: "2024-01-12"
    }
  ]);

  // Queries for real data (with fallbacks)
  const { data: consultantsData = [] } = useQuery({
    queryKey: ["/api/consultants"],
  });

  const demoConsultants = [
    { id: "demo-c-1", firstName: "Amanda", lastName: "Foster" },
    { id: "demo-c-2", firstName: "Brian", lastName: "Martinez" }
  ];

  const consultants = consultantsData.length > 0 ? consultantsData : demoConsultants;

  // Filtered data
  const filteredModules = modules.filter(m => {
    if (categoryFilter !== "all" && m.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredAssessments = assessments.filter(a => {
    if (assessmentTypeFilter !== "all" && a.type !== assessmentTypeFilter) return false;
    return true;
  });

  const filteredArticles = articles.filter(a => {
    if (kbCategoryFilter !== "all" && a.category !== kbCategoryFilter) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredCompetencyRecords = competencyRecords.filter(r => {
    if (consultantFilter !== "all" && r.consultantId !== consultantFilter) return false;
    return true;
  });

  // Handlers
  const handleCreateModule = () => {
    const newModule: TrainingModule = {
      id: `mod-${Date.now()}`,
      name: moduleForm.name,
      description: moduleForm.description,
      category: moduleForm.category,
      duration: parseInt(moduleForm.duration) || 60,
      difficulty: moduleForm.difficulty,
      required: moduleForm.required,
      status: "not-started",
      progress: 0,
      contents: []
    };
    setModules([...modules, newModule]);
    setCreateModuleOpen(false);
    setModuleForm({ name: "", description: "", category: "", duration: "", difficulty: "", required: false });
    toast({ title: "Module Created", description: "Training module has been created successfully." });
  };

  const handleAddContent = () => {
    if (selectedModule) {
      const newContent: ModuleContent = {
        id: `content-${Date.now()}`,
        title: contentForm.title,
        type: contentForm.type as any,
        url: contentForm.url,
        completed: false
      };
      setModules(modules.map(m => 
        m.id === selectedModule.id 
          ? { ...m, contents: [...m.contents, newContent] }
          : m
      ));
      setAddContentOpen(false);
      setContentForm({ title: "", type: "", url: "" });
      toast({ title: "Content Added", description: "Content has been added to the module." });
    }
  };

  const handleStartTraining = (module: TrainingModule) => {
    setSelectedModule(module);
    setTrainingMode(true);
    setCurrentContentIndex(0);
    setShowCertificate(false);
  };

  const handleNextContent = () => {
    if (selectedModule && currentContentIndex < selectedModule.contents.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    }
  };

  const handleMarkComplete = () => {
    if (selectedModule) {
      const updatedContents = [...selectedModule.contents];
      updatedContents[currentContentIndex].completed = true;
      const completedCount = updatedContents.filter(c => c.completed).length;
      const progress = Math.round((completedCount / updatedContents.length) * 100);

      setModules(modules.map(m => 
        m.id === selectedModule.id 
          ? { ...m, contents: updatedContents, progress, status: progress === 100 ? "completed" : "in-progress" }
          : m
      ));
      setSelectedModule({ ...selectedModule, contents: updatedContents, progress });
      toast({ title: "Content Completed", description: "Content marked as complete." });
    }
  };

  const handleCompleteModule = () => {
    if (selectedModule) {
      setModules(modules.map(m => 
        m.id === selectedModule.id 
          ? { ...m, status: "completed", progress: 100 }
          : m
      ));
      setShowCertificate(true);
    }
  };

  const handleCreateAssessment = () => {
    const newAssessment: Assessment = {
      id: `assess-${Date.now()}`,
      name: assessmentForm.name,
      description: assessmentForm.description,
      type: assessmentForm.type as any,
      passingScore: parseInt(assessmentForm.passingScore) || 80,
      timeLimit: parseInt(assessmentForm.timeLimit) || 30,
      status: "not-started",
      questions: []
    };
    setAssessments([...assessments, newAssessment]);
    setCreateAssessmentOpen(false);
    setAssessmentForm({ name: "", description: "", type: "", passingScore: "", timeLimit: "" });
    toast({ title: "Assessment Created", description: "Assessment has been created successfully." });
  };

  const handleAddQuestion = () => {
    if (selectedAssessment) {
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        text: questionForm.text,
        type: questionForm.type as any,
        options: [questionForm.option1, questionForm.option2, questionForm.option3, questionForm.option4].filter(Boolean),
        correctAnswer: questionForm.correctAnswer - 1
      };
      setAssessments(assessments.map(a => 
        a.id === selectedAssessment.id 
          ? { ...a, questions: [...a.questions, newQuestion] }
          : a
      ));
      setAddQuestionOpen(false);
      setQuestionForm({ text: "", type: "", option1: "", option2: "", option3: "", option4: "", correctAnswer: 1 });
      toast({ title: "Question Added", description: "Question has been added to the assessment." });
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setAssessmentMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answerIndex });
  };

  const handleNextQuestion = () => {
    if (selectedAssessment && currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitAssessment = () => {
    if (selectedAssessment) {
      let correct = 0;
      selectedAssessment.questions.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswer) correct++;
      });
      const score = Math.round((correct / selectedAssessment.questions.length) * 100);
      const passed = score >= selectedAssessment.passingScore;

      setAssessments(assessments.map(a => 
        a.id === selectedAssessment.id 
          ? { ...a, status: passed ? "passed" : "failed", score }
          : a
      ));
      setSelectedAssessment({ ...selectedAssessment, score, status: passed ? "passed" : "failed" });
      setShowResults(true);
    }
  };

  const handleLaunchLab = (lab: Lab) => {
    setSelectedLab(lab);
    setLabSession(true);
  };

  const handleEndLab = () => {
    setLabSession(false);
    setSelectedLab(null);
    setEndLabOpen(false);
    toast({ title: "Lab Ended", description: "Your lab session has been ended." });
  };

  const handleArticleHelpful = () => {
    if (selectedArticle) {
      setArticles(articles.map(a => 
        a.id === selectedArticle.id 
          ? { ...a, helpful: a.helpful + 1 }
          : a
      ));
      toast({ title: "Thank you!", description: "Your feedback has been recorded." });
    }
  };

  const handleBookmarkArticle = () => {
    if (selectedArticle) {
      setArticles(articles.map(a => 
        a.id === selectedArticle.id 
          ? { ...a, bookmarked: !a.bookmarked }
          : a
      ));
      toast({ title: selectedArticle.bookmarked ? "Bookmark Removed" : "Article Bookmarked" });
    }
  };

  const handleCreateArticle = () => {
    const newArticle: KBArticle = {
      id: `kb-${Date.now()}`,
      title: articleForm.title,
      content: articleForm.content,
      category: articleForm.category,
      helpful: 0,
      bookmarked: false
    };
    setArticles([...articles, newArticle]);
    setCreateArticleOpen(false);
    setArticleForm({ title: "", content: "", category: "" });
    toast({ title: "Article Created", description: "Knowledge base article has been created." });
  };

  const handleUpdateLevel = () => {
    if (selectedCompetency && newLevel) {
      setCompetencyRecords(competencyRecords.map(r => 
        r.id === selectedCompetency.id 
          ? { ...r, level: newLevel as any, lastAssessed: format(new Date(), "yyyy-MM-dd") }
          : r
      ));
      setUpdateLevelOpen(false);
      setNewLevel("");
      toast({ title: "Level Updated", description: "Competency level has been updated." });
    }
  };

  const handleExportCompetencies = () => {
    toast({ title: "Export Started", description: "Competency report is being generated..." });
  };

  // Get level badge color
  const getLevelBadge = (level: string) => {
    const colors: {[key: string]: string} = {
      beginner: "bg-gray-100 text-gray-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-purple-100 text-purple-800",
      expert: "bg-green-100 text-green-800"
    };
    return <Badge className={colors[level] || ""}>{level.charAt(0).toUpperCase() + level.slice(1)}</Badge>;
  };

  // Render training content view
  if (trainingMode && selectedModule) {
    const currentContent = selectedModule.contents[currentContentIndex];

    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{selectedModule.name}</h1>
          <Button variant="outline" onClick={() => setTrainingMode(false)}>Exit Training</Button>
        </div>

        <Progress value={selectedModule.progress} className="w-full" data-testid="training-progress" />

        {showCertificate ? (
          <Card data-testid="completion-certificate">
            <CardContent className="pt-6 text-center">
              <Award className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-muted-foreground mb-4">You have completed {selectedModule.name}</p>
              <Button onClick={() => setTrainingMode(false)}>Return to Modules</Button>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="training-content">
            <CardHeader>
              <CardTitle>{currentContent?.title || "Content"}</CardTitle>
              <CardDescription>
                Content {currentContentIndex + 1} of {selectedModule.contents.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-8 rounded-lg text-center">
                {currentContent?.type === "video" && <Play className="h-16 w-16 mx-auto text-muted-foreground" />}
                {currentContent?.type === "document" && <FileText className="h-16 w-16 mx-auto text-muted-foreground" />}
                {currentContent?.type === "quiz" && <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground" />}
                {currentContent?.type === "interactive" && <Monitor className="h-16 w-16 mx-auto text-muted-foreground" />}
                <p className="mt-4 text-muted-foreground">{currentContent?.type} content placeholder</p>
              </div>

              <div className="flex justify-between">
                <Button 
                  onClick={handleMarkComplete} 
                  disabled={currentContent?.completed}
                  data-testid="button-mark-complete"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {currentContent?.completed ? "Completed" : "Mark Complete"}
                </Button>

                {currentContentIndex < selectedModule.contents.length - 1 ? (
                  <Button onClick={handleNextContent} data-testid="button-next-content">
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleCompleteModule} data-testid="button-complete-module">
                    Complete Module
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render assessment view
  if (assessmentMode && selectedAssessment) {
    const currentQuestion = selectedAssessment.questions[currentQuestionIndex];

    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{selectedAssessment.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" data-testid="assessment-timer">
              <Timer className="h-5 w-5" />
              <span>{selectedAssessment.timeLimit}:00</span>
            </div>
            <Button variant="outline" onClick={() => setAssessmentMode(false)}>Exit</Button>
          </div>
        </div>

        {showResults ? (
          <Card data-testid="assessment-results">
            <CardContent className="pt-6 text-center">
              {selectedAssessment.status === "passed" ? (
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              ) : (
                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              )}
              <h2 className="text-2xl font-bold mb-2">
                {selectedAssessment.status === "passed" ? "Congratulations!" : "Try Again"}
              </h2>
              <div className="text-4xl font-bold mb-4" data-testid="assessment-score">
                {selectedAssessment.score}%
              </div>
              <p className="text-muted-foreground mb-4">
                Passing score: {selectedAssessment.passingScore}%
              </p>
              <Button onClick={() => setAssessmentMode(false)}>Return to Assessments</Button>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="assessment-content">
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1} of {selectedAssessment.questions.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">{currentQuestion?.text}</p>

              <div className="space-y-2">
                {currentQuestion?.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-muted ${
                      selectedAnswers[currentQuestion.id] === idx ? "border-primary bg-primary/10" : ""
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                    data-testid="answer-option"
                  >
                    {option}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                {currentQuestionIndex < selectedAssessment.questions.length - 1 ? (
                  <Button onClick={handleNextQuestion} data-testid="button-next-question">
                    Next Question
                  </Button>
                ) : (
                  <Button onClick={handleSubmitAssessment} data-testid="button-submit-assessment">
                    Submit Assessment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render lab session view
  if (labSession && selectedLab) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{selectedLab.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" data-testid="lab-timer">
              <Timer className="h-5 w-5" />
              <span>{selectedLab.duration}:00</span>
            </div>
            <Button variant="destructive" onClick={() => setEndLabOpen(true)} data-testid="button-end-lab">
              End Lab
            </Button>
          </div>
        </div>

        <Card data-testid="lab-session">
          <CardContent className="pt-6">
            <div className="bg-black rounded-lg p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center text-white">
                <Monitor className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Lab Environment: {selectedLab.system}</p>
                <p className="text-sm text-gray-400 mt-2">Remote session active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={endLabOpen} onOpenChange={setEndLabOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End Lab Session</DialogTitle>
              <DialogDescription>Are you sure you want to end this lab session?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEndLabOpen(false)}>Go Back</Button>
              <Button onClick={handleEndLab} data-testid="button-confirm">End Lab</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main view
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training & Competency</h1>
          <p className="text-muted-foreground">Manage training modules, assessments, and competency tracking</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="my-progress" data-testid="tab-my-progress">My Progress</TabsTrigger>
          <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
          <TabsTrigger value="login-labs" data-testid="tab-login-labs">Login Labs</TabsTrigger>
          <TabsTrigger value="knowledge-base" data-testid="tab-knowledge-base">Knowledge Base</TabsTrigger>
          <TabsTrigger value="competency-records" data-testid="tab-competency-records">Competency Records</TabsTrigger>
        </TabsList>

        {/* Training Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="ehr">EHR</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setCreateModuleOpen(true)} data-testid="button-create-module">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4" data-testid="training-modules-list">
            {filteredModules.map(module => (
              <Card 
                key={module.id} 
                className="cursor-pointer hover:shadow-md"
                data-testid="training-module-item"
                onClick={() => setSelectedModule(module)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{module.name}</h3>
                        {module.required && <Badge variant="destructive">Required</Badge>}
                      </div>
                      <p className="text-muted-foreground">{module.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span data-testid="module-category">{module.category}</span>
                        <span><Clock className="h-4 w-4 inline mr-1" />{module.duration} min</span>
                        <span>{module.difficulty}</span>
                      </div>
                      {module.status !== "not-started" && (
                        <Progress value={module.progress} className="w-64" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        module.status === "completed" ? "default" :
                        module.status === "in-progress" ? "secondary" : "outline"
                      }>
                        {module.status === "completed" ? "Completed" :
                         module.status === "in-progress" ? "In Progress" : "Not Started"}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleStartTraining(module); }}
                        data-testid="button-start-training"
                      >
                        {module.status === "completed" ? "Review" : 
                         module.status === "in-progress" ? "Continue" : "Start"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Progress Tab */}
        <TabsContent value="my-progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="progress-dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {modules.filter(m => m.status === "completed").length}
                </div>
                <p className="text-muted-foreground">modules completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {modules.filter(m => m.status === "in-progress").length}
                </div>
                <p className="text-muted-foreground">modules in progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {modules.filter(m => m.required && m.status !== "completed").length}
                </div>
                <p className="text-muted-foreground">required modules pending</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Completed Modules</CardTitle>
            </CardHeader>
            <CardContent data-testid="completed-modules-list">
              {modules.filter(m => m.status === "completed").map(module => (
                <div key={module.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-muted-foreground">{module.category}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
              {modules.filter(m => m.status === "completed").length === 0 && (
                <p className="text-muted-foreground">No completed modules yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent data-testid="in-progress-modules">
              {modules.filter(m => m.status === "in-progress").map(module => (
                <div key={module.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{module.name}</p>
                    <Progress value={module.progress} className="w-64 mt-1" />
                  </div>
                  <span className="text-sm text-muted-foreground">{module.progress}%</span>
                </div>
              ))}
              {modules.filter(m => m.status === "in-progress").length === 0 && (
                <p className="text-muted-foreground">No modules in progress</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Modules</CardTitle>
            </CardHeader>
            <CardContent data-testid="required-modules">
              {modules.filter(m => m.required && m.status !== "completed").map(module => (
                <div key={module.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-muted-foreground">{module.category}</p>
                  </div>
                  <Badge variant="destructive">Required</Badge>
                </div>
              ))}
              {modules.filter(m => m.required && m.status !== "completed").length === 0 && (
                <p className="text-muted-foreground text-green-600">All required modules completed!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">Available Assessments</TabsTrigger>
              <TabsTrigger value="my-results" data-testid="tab-my-results">My Results</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4 items-end">
                    <Select value={assessmentTypeFilter} onValueChange={setAssessmentTypeFilter}>
                      <SelectTrigger className="w-[180px]" data-testid="filter-assessment-type">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="skill">Skill</SelectItem>
                        <SelectItem value="knowledge">Knowledge</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setCreateAssessmentOpen(true)} data-testid="button-create-assessment">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4" data-testid="assessments-list">
                {filteredAssessments.map(assessment => (
                  <Card 
                    key={assessment.id} 
                    className="cursor-pointer hover:shadow-md"
                    data-testid="assessment-item"
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{assessment.name}</h3>
                          <p className="text-muted-foreground">{assessment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{assessment.type}</Badge>
                            <span><Clock className="h-4 w-4 inline mr-1" />{assessment.timeLimit} min</span>
                            <span>Pass: {assessment.passingScore}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            data-testid="assessment-status"
                            variant={
                              assessment.status === "passed" ? "default" :
                              assessment.status === "failed" ? "destructive" : "outline"
                            }
                          >
                            {assessment.status === "passed" ? "Passed" :
                             assessment.status === "failed" ? "Failed" : "Not Started"}
                          </Badge>
                          {assessment.status === "not-started" ? (
                            <Button 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleStartAssessment(assessment); }}
                              data-testid="button-start-assessment"
                            >
                              Start
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); setShowResults(true); setSelectedAssessment(assessment); setAssessmentMode(true); }}
                              data-testid="button-view-results"
                            >
                              View Results
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-results" className="space-y-4">
              <div data-testid="results-list">
                {assessments.filter(a => a.status !== "not-started").map(assessment => (
                  <Card key={assessment.id} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{assessment.name}</h3>
                          <p className="text-sm text-muted-foreground">Score: {assessment.score}%</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            data-testid="result-status"
                            variant={assessment.status === "passed" ? "default" : "destructive"}
                          >
                            {assessment.status === "passed" ? "Passed" : "Failed"}
                          </Badge>
                          {assessment.status === "failed" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStartAssessment(assessment)}
                              data-testid="button-retake"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Retake
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {assessments.filter(a => a.status !== "not-started").length === 0 && (
                  <p className="text-muted-foreground">No assessment results yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Login Labs Tab */}
        <TabsContent value="login-labs" className="space-y-4">
          <div className="grid gap-4" data-testid="login-labs-list">
            {labs.map(lab => (
              <Card 
                key={lab.id} 
                className="cursor-pointer hover:shadow-md"
                data-testid="lab-item"
                onClick={() => setSelectedLab(lab)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{lab.name}</h3>
                      <p className="text-muted-foreground">{lab.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span data-testid="lab-system"><Monitor className="h-4 w-4 inline mr-1" />{lab.system}</span>
                        <span><Clock className="h-4 w-4 inline mr-1" />{lab.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        data-testid="lab-status"
                        variant={lab.status === "available" ? "default" : lab.status === "in-use" ? "secondary" : "destructive"}
                      >
                        {lab.status === "available" ? "Available" : lab.status === "in-use" ? "In Use" : "Maintenance"}
                      </Badge>
                      <Button 
                        size="sm"
                        disabled={lab.status !== "available"}
                        onClick={(e) => { e.stopPropagation(); handleLaunchLab(lab); }}
                        data-testid="button-launch-lab"
                      >
                        Launch Lab
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedLab && !labSession && (
            <Card data-testid="lab-instructions">
              <CardHeader>
                <CardTitle>Lab Instructions: {selectedLab.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">{selectedLab.instructions}</pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge-base" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-kb-search"
                  />
                </div>
                <Select value={kbCategoryFilter} onValueChange={setKbCategoryFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="filter-kb-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="EHR Systems">EHR Systems</SelectItem>
                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                    <SelectItem value="Clinical">Clinical</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setCreateArticleOpen(true)} data-testid="button-create-article">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchQuery && (
            <div data-testid="kb-search-results">
              <p className="text-sm text-muted-foreground mb-2">
                Found {filteredArticles.length} results for "{searchQuery}"
              </p>
            </div>
          )}

          <div className="grid gap-4" data-testid="kb-articles-list">
            {filteredArticles.map(article => (
              <Card 
                key={article.id} 
                className="cursor-pointer hover:shadow-md"
                data-testid="kb-article-item"
                onClick={() => setSelectedArticle(article)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{article.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{article.category}</Badge>
                        <span><Star className="h-4 w-4 inline mr-1" />{article.helpful} found helpful</span>
                      </div>
                    </div>
                    {article.bookmarked && <Bookmark className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedArticle && (
            <Card data-testid="kb-article-content">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedArticle.title}</CardTitle>
                    <CardDescription>{selectedArticle.category}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)}>×</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{selectedArticle.content}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleArticleHelpful} data-testid="button-helpful">
                    <Star className="h-4 w-4 mr-2" />
                    Helpful ({selectedArticle.helpful})
                  </Button>
                  <Button variant="outline" onClick={handleBookmarkArticle} data-testid="button-bookmark">
                    <Bookmark className={`h-4 w-4 mr-2 ${selectedArticle.bookmarked ? "fill-current" : ""}`} />
                    {selectedArticle.bookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Competency Records Tab */}
        <TabsContent value="competency-records" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-end">
                <Select value={consultantFilter} onValueChange={setConsultantFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="filter-consultant">
                    <SelectValue placeholder="All Consultants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Consultants</SelectItem>
                    {consultants.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportCompetencies} data-testid="button-export-competencies">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4" data-testid="competency-records-list">
            {filteredCompetencyRecords.map(record => (
              <Card 
                key={record.id}
                className="cursor-pointer hover:shadow-md"
                data-testid="competency-record-item"
                onClick={() => setSelectedCompetency(record)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{record.consultantName}</h3>
                      <p className="text-muted-foreground">{record.skill}</p>
                      <p className="text-sm text-muted-foreground">
                        Last assessed: {format(new Date(record.lastAssessed), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span data-testid="competency-level">{getLevelBadge(record.level)}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompetency(record);
                          setUpdateLevelOpen(true);
                        }}
                        data-testid="button-update-level"
                      >
                        Update Level
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCompetency && !updateLevelOpen && (
            <Card data-testid="competency-details">
              <CardHeader>
                <CardTitle>Competency Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Consultant:</strong> {selectedCompetency.consultantName}</p>
                <p><strong>Skill:</strong> {selectedCompetency.skill}</p>
                <p><strong>Level:</strong> {getLevelBadge(selectedCompetency.level)}</p>
                <p><strong>Last Assessed:</strong> {format(new Date(selectedCompetency.lastAssessed), "MMMM d, yyyy")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Module Modal */}
      <Dialog open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Training Module</DialogTitle>
            <DialogDescription>Add a new training module to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Module Name</Label>
              <Input 
                value={moduleForm.name}
                onChange={(e) => setModuleForm({...moduleForm, name: e.target.value})}
                data-testid="input-module-name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={moduleForm.description}
                onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                data-testid="input-module-description"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={moduleForm.category} onValueChange={(v) => setModuleForm({...moduleForm, category: v})}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EHR">EHR</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Clinical">Clinical</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input 
                type="number"
                value={moduleForm.duration}
                onChange={(e) => setModuleForm({...moduleForm, duration: e.target.value})}
                data-testid="input-duration"
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={moduleForm.difficulty} onValueChange={(v) => setModuleForm({...moduleForm, difficulty: v})}>
                <SelectTrigger data-testid="select-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={moduleForm.required}
                onCheckedChange={(checked) => setModuleForm({...moduleForm, required: checked as boolean})}
                data-testid="checkbox-required"
              />
              <Label>Required Module</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModuleOpen(false)}>Go Back</Button>
            <Button onClick={handleCreateModule} data-testid="button-submit-module">Create Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Content Modal */}
      <Dialog open={addContentOpen} onOpenChange={setAddContentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
            <DialogDescription>Add content to this training module</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Content Title</Label>
              <Input 
                value={contentForm.title}
                onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                data-testid="input-content-title"
              />
            </div>
            <div>
              <Label>Content Type</Label>
              <Select value={contentForm.type} onValueChange={(v) => setContentForm({...contentForm, type: v})}>
                <SelectTrigger data-testid="select-content-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content URL</Label>
              <Input 
                value={contentForm.url}
                onChange={(e) => setContentForm({...contentForm, url: e.target.value})}
                data-testid="input-content-url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContentOpen(false)}>Go Back</Button>
            <Button onClick={handleAddContent} data-testid="button-submit-content">Add Content</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Detail with Add Content Button */}
      {selectedModule && !trainingMode && activeTab === "modules" && (
        <Dialog open={!!selectedModule && !trainingMode} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedModule.name}</DialogTitle>
              <DialogDescription>{selectedModule.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <Badge>{selectedModule.category}</Badge>
                <span><Clock className="h-4 w-4 inline mr-1" />{selectedModule.duration} min</span>
                <span>{selectedModule.difficulty}</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Contents</h4>
                  <Button size="sm" onClick={() => setAddContentOpen(true)} data-testid="button-add-content">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Content
                  </Button>
                </div>
                {selectedModule.contents.map((content, idx) => (
                  <div key={content.id} className="flex items-center gap-2 py-2 border-b">
                    {content.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 border rounded-full" />
                    )}
                    <span>{idx + 1}. {content.title}</span>
                    <Badge variant="outline" className="ml-auto">{content.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedModule(null)}>Close</Button>
              <Button onClick={() => handleStartTraining(selectedModule)}>
                {selectedModule.status === "completed" ? "Review" : 
                 selectedModule.status === "in-progress" ? "Continue" : "Start Training"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Assessment Modal */}
      <Dialog open={createAssessmentOpen} onOpenChange={setCreateAssessmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assessment</DialogTitle>
            <DialogDescription>Add a new competency assessment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Assessment Name</Label>
              <Input 
                value={assessmentForm.name}
                onChange={(e) => setAssessmentForm({...assessmentForm, name: e.target.value})}
                data-testid="input-assessment-name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={assessmentForm.description}
                onChange={(e) => setAssessmentForm({...assessmentForm, description: e.target.value})}
                data-testid="input-assessment-description"
              />
            </div>
            <div>
              <Label>Assessment Type</Label>
              <Select value={assessmentForm.type} onValueChange={(v) => setAssessmentForm({...assessmentForm, type: v})}>
                <SelectTrigger data-testid="select-assessment-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skill">Skill</SelectItem>
                  <SelectItem value="Knowledge">Knowledge</SelectItem>
                  <SelectItem value="Certification">Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Passing Score (%)</Label>
              <Input 
                type="number"
                value={assessmentForm.passingScore}
                onChange={(e) => setAssessmentForm({...assessmentForm, passingScore: e.target.value})}
                data-testid="input-passing-score"
              />
            </div>
            <div>
              <Label>Time Limit (minutes)</Label>
              <Input 
                type="number"
                value={assessmentForm.timeLimit}
                onChange={(e) => setAssessmentForm({...assessmentForm, timeLimit: e.target.value})}
                data-testid="input-time-limit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAssessmentOpen(false)}>Go Back</Button>
            <Button onClick={handleCreateAssessment} data-testid="button-submit-assessment">Create Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Modal */}
      <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
            <DialogDescription>Add a question to this assessment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question Text</Label>
              <Textarea 
                value={questionForm.text}
                onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                data-testid="input-question-text"
              />
            </div>
            <div>
              <Label>Question Type</Label>
              <Select value={questionForm.type} onValueChange={(v) => setQuestionForm({...questionForm, type: v})}>
                <SelectTrigger data-testid="select-question-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                  <SelectItem value="True/False">True/False</SelectItem>
                  <SelectItem value="Short Answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Option 1</Label>
              <Input 
                value={questionForm.option1}
                onChange={(e) => setQuestionForm({...questionForm, option1: e.target.value})}
                data-testid="input-option-1"
              />
            </div>
            <div>
              <Label>Option 2</Label>
              <Input 
                value={questionForm.option2}
                onChange={(e) => setQuestionForm({...questionForm, option2: e.target.value})}
                data-testid="input-option-2"
              />
            </div>
            <div>
              <Label>Option 3</Label>
              <Input 
                value={questionForm.option3}
                onChange={(e) => setQuestionForm({...questionForm, option3: e.target.value})}
                data-testid="input-option-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Correct Answer:</Label>
              <RadioGroup 
                value={String(questionForm.correctAnswer)}
                onValueChange={(v) => setQuestionForm({...questionForm, correctAnswer: parseInt(v)})}
                className="flex gap-4"
              >
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="1" data-testid="radio-correct-answer-1" />
                  <Label>1</Label>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="2" />
                  <Label>2</Label>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="3" />
                  <Label>3</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddQuestionOpen(false)}>Go Back</Button>
            <Button onClick={handleAddQuestion} data-testid="button-submit-question">Add Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assessment Detail with Add Question Button */}
      {selectedAssessment && !assessmentMode && !showResults && activeTab === "assessments" && (
        <Dialog open={!!selectedAssessment && !assessmentMode && !showResults} onOpenChange={() => setSelectedAssessment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAssessment.name}</DialogTitle>
              <DialogDescription>{selectedAssessment.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <Badge>{selectedAssessment.type}</Badge>
                <span><Clock className="h-4 w-4 inline mr-1" />{selectedAssessment.timeLimit} min</span>
                <span>Pass: {selectedAssessment.passingScore}%</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Questions ({selectedAssessment.questions.length})</h4>
                  <Button size="sm" onClick={() => setAddQuestionOpen(true)} data-testid="button-add-question">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>
                {selectedAssessment.questions.map((question, idx) => (
                  <div key={question.id} className="py-2 border-b">
                    <p>{idx + 1}. {question.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAssessment(null)}>Close</Button>
              <Button onClick={() => handleStartAssessment(selectedAssessment)}>
                {selectedAssessment.status === "not-started" ? "Start Assessment" : "Retake Assessment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Article Modal */}
      <Dialog open={createArticleOpen} onOpenChange={setCreateArticleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Knowledge Base Article</DialogTitle>
            <DialogDescription>Add a new article to the knowledge base</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Article Title</Label>
              <Input 
                value={articleForm.title}
                onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                data-testid="input-article-title"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea 
                value={articleForm.content}
                onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                rows={6}
                data-testid="input-article-content"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={articleForm.category} onValueChange={(v) => setArticleForm({...articleForm, category: v})}>
                <SelectTrigger data-testid="select-article-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="EHR Systems">EHR Systems</SelectItem>
                  <SelectItem value="Technical Support">Technical Support</SelectItem>
                  <SelectItem value="Clinical">Clinical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateArticleOpen(false)}>Go Back</Button>
            <Button onClick={handleCreateArticle} data-testid="button-submit-article">Create Article</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Competency Level Modal */}
      <Dialog open={updateLevelOpen} onOpenChange={setUpdateLevelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Competency Level</DialogTitle>
            <DialogDescription>
              Update the competency level for {selectedCompetency?.consultantName} - {selectedCompetency?.skill}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Level</Label>
              <Select value={newLevel} onValueChange={setNewLevel}>
                <SelectTrigger data-testid="select-new-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateLevelOpen(false)}>Go Back</Button>
            <Button onClick={handleUpdateLevel} data-testid="button-save-level">Save Level</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
