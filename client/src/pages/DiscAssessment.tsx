import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

// DiSC Assessment Questions - 28 statements grouped into 7 sets of 4
// Each set has one statement per trait (D, I, S, C)
const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    statements: [
      { text: "I enjoy taking charge and making decisions quickly", trait: "D" },
      { text: "I like meeting new people and being the center of attention", trait: "i" },
      { text: "I prefer a calm, predictable work environment", trait: "S" },
      { text: "I pay close attention to details and accuracy", trait: "C" },
    ],
  },
  {
    id: 2,
    statements: [
      { text: "I am competitive and driven to win", trait: "D" },
      { text: "I am enthusiastic and optimistic about most things", trait: "i" },
      { text: "I am patient and a good listener", trait: "S" },
      { text: "I like to analyze information before making decisions", trait: "C" },
    ],
  },
  {
    id: 3,
    statements: [
      { text: "I am direct and to the point in my communication", trait: "D" },
      { text: "I enjoy collaborating and working with teams", trait: "i" },
      { text: "I value loyalty and long-term relationships", trait: "S" },
      { text: "I prefer working with facts and data", trait: "C" },
    ],
  },
  {
    id: 4,
    statements: [
      { text: "I like to be in control of situations", trait: "D" },
      { text: "I am persuasive and can influence others easily", trait: "i" },
      { text: "I am dependable and follow through on commitments", trait: "S" },
      { text: "I maintain high standards and quality in my work", trait: "C" },
    ],
  },
  {
    id: 5,
    statements: [
      { text: "I am comfortable with conflict and confrontation", trait: "D" },
      { text: "I express my emotions openly and freely", trait: "i" },
      { text: "I avoid conflict and seek harmony", trait: "S" },
      { text: "I am cautious and think before I act", trait: "C" },
    ],
  },
  {
    id: 6,
    statements: [
      { text: "I focus on results and bottom-line outcomes", trait: "D" },
      { text: "I enjoy recognition and public praise", trait: "i" },
      { text: "I prefer stability over rapid change", trait: "S" },
      { text: "I follow rules and procedures carefully", trait: "C" },
    ],
  },
  {
    id: 7,
    statements: [
      { text: "I make decisions quickly, even with limited information", trait: "D" },
      { text: "I am spontaneous and enjoy variety", trait: "i" },
      { text: "I am a team player and support others", trait: "S" },
      { text: "I am systematic and organized in my approach", trait: "C" },
    ],
  },
  {
    id: 8,
    statements: [
      { text: "I take initiative without being asked", trait: "D" },
      { text: "I easily build rapport with strangers", trait: "i" },
      { text: "I am steady and consistent in my work", trait: "S" },
      { text: "I question assumptions and verify information", trait: "C" },
    ],
  },
  {
    id: 9,
    statements: [
      { text: "I push through obstacles to achieve goals", trait: "D" },
      { text: "I motivate and inspire others", trait: "i" },
      { text: "I am accommodating and flexible with others", trait: "S" },
      { text: "I prefer written communication over verbal", trait: "C" },
    ],
  },
  {
    id: 10,
    statements: [
      { text: "I challenge the status quo and push for change", trait: "D" },
      { text: "I am talkative and expressive", trait: "i" },
      { text: "I am calm under pressure", trait: "S" },
      { text: "I prepare thoroughly before meetings", trait: "C" },
    ],
  },
  {
    id: 11,
    statements: [
      { text: "I set ambitious goals for myself", trait: "D" },
      { text: "I see the positive side of situations", trait: "i" },
      { text: "I give others the benefit of the doubt", trait: "S" },
      { text: "I notice errors that others miss", trait: "C" },
    ],
  },
  {
    id: 12,
    statements: [
      { text: "I am impatient with slow progress", trait: "D" },
      { text: "I dislike routine and repetitive tasks", trait: "i" },
      { text: "I find change difficult to adapt to", trait: "S" },
      { text: "I can be critical of poor work quality", trait: "C" },
    ],
  },
  {
    id: 13,
    statements: [
      { text: "I take calculated risks to get ahead", trait: "D" },
      { text: "I trust people easily and give them chances", trait: "i" },
      { text: "I prefer to work behind the scenes", trait: "S" },
      { text: "I am skeptical until I see proof", trait: "C" },
    ],
  },
  {
    id: 14,
    statements: [
      { text: "I am assertive in expressing my opinions", trait: "D" },
      { text: "I use humor to connect with others", trait: "i" },
      { text: "I put others' needs before my own", trait: "S" },
      { text: "I create detailed plans before starting work", trait: "C" },
    ],
  },
];

const RATING_OPTIONS = [
  { value: "1", label: "Strongly Disagree" },
  { value: "2", label: "Disagree" },
  { value: "3", label: "Neutral" },
  { value: "4", label: "Agree" },
  { value: "5", label: "Strongly Agree" },
];

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

interface AssessmentResults {
  dScore: number;
  iScore: number;
  sScore: number;
  cScore: number;
  primaryStyle: "D" | "i" | "S" | "C";
  secondaryStyle: "D" | "i" | "S" | "C" | null;
}

function calculateResults(
  responses: Record<string, Record<string, number>>
): AssessmentResults {
  // Sum up scores for each trait
  const traitScores = { D: 0, i: 0, S: 0, C: 0 };
  const traitCounts = { D: 0, i: 0, S: 0, C: 0 };

  Object.values(responses).forEach((questionResponses) => {
    Object.entries(questionResponses).forEach(([trait, score]) => {
      traitScores[trait as keyof typeof traitScores] += score;
      traitCounts[trait as keyof typeof traitCounts]++;
    });
  });

  // Convert to 0-100 scale (max possible per trait is 5 * 14 = 70)
  const maxPossible = 5 * 14;
  const normalizedScores = {
    D: Math.round((traitScores.D / maxPossible) * 100),
    i: Math.round((traitScores.i / maxPossible) * 100),
    S: Math.round((traitScores.S / maxPossible) * 100),
    C: Math.round((traitScores.C / maxPossible) * 100),
  };

  // Find primary and secondary styles
  const sortedTraits = Object.entries(normalizedScores)
    .sort(([, a], [, b]) => b - a)
    .map(([trait]) => trait as "D" | "i" | "S" | "C");

  const primaryStyle = sortedTraits[0];
  const secondaryStyle =
    normalizedScores[sortedTraits[1]] > 30 ? sortedTraits[1] : null;

  return {
    dScore: normalizedScores.D,
    iScore: normalizedScores.i,
    sScore: normalizedScores.S,
    cScore: normalizedScores.C,
    primaryStyle,
    secondaryStyle,
  };
}

function ResultsDisplay({ results }: { results: AssessmentResults }) {
  const scores = [
    { trait: "D", name: "Dominance", score: results.dScore },
    { trait: "i", name: "Influence", score: results.iScore },
    { trait: "S", name: "Steadiness", score: results.sScore },
    { trait: "C", name: "Conscientiousness", score: results.cScore },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl"
            style={{ backgroundColor: DISC_COLORS[results.primaryStyle] }}
          >
            {results.primaryStyle}
          </div>
          {results.secondaryStyle && (
            <>
              <span className="text-2xl text-muted-foreground">/</span>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: DISC_COLORS[results.secondaryStyle] }}
              >
                {results.secondaryStyle}
              </div>
            </>
          )}
        </div>
        <h3 className="text-2xl font-bold">
          {DISC_NAMES[results.primaryStyle]}
          {results.secondaryStyle && ` / ${DISC_NAMES[results.secondaryStyle]}`}
        </h3>
        <p className="text-muted-foreground mt-2">Your DiSC Profile</p>
      </div>

      <div className="space-y-4">
        {scores.map(({ trait, name, score }) => (
          <div key={trait}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: DISC_COLORS[trait] }}
                >
                  {trait}
                </div>
                <span className="font-medium">{name}</span>
              </div>
              <span className="font-bold">{score}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${score}%`,
                  backgroundColor: DISC_COLORS[trait],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiscAssessment() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, number>>>({});
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const questionsPerPage = 2;
  const totalPages = Math.ceil(ASSESSMENT_QUESTIONS.length / questionsPerPage);
  const currentQuestions = ASSESSMENT_QUESTIONS.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const progress = ((currentPage + 1) / totalPages) * 100;

  // Scroll to top when page changes
  useEffect(() => {
    // Find the main scrollable container and scroll to top
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, showResults]);

  // Check if current page is complete
  const isCurrentPageComplete = currentQuestions.every((q) =>
    q.statements.every((s) => responses[q.id]?.[s.trait] !== undefined)
  );

  const isAssessmentComplete = ASSESSMENT_QUESTIONS.every((q) =>
    q.statements.every((s) => responses[q.id]?.[s.trait] !== undefined)
  );

  const handleResponse = (questionId: number, trait: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [trait]: value,
      },
    }));
  };

  const saveAssessmentMutation = useMutation({
    mutationFn: async (data: AssessmentResults) => {
      const response = await apiRequest("POST", "/api/disc/assessments", {
        primaryStyle: data.primaryStyle,
        secondaryStyle: data.secondaryStyle,
        dScore: data.dScore,
        iScore: data.iScore,
        sScore: data.sScore,
        cScore: data.cScore,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disc/assessments/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/disc/dashboard/stats"] });
      toast({
        title: "Assessment Saved",
        description: "Your DiSC profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleComplete = () => {
    const calculatedResults = calculateResults(responses);
    setResults(calculatedResults);
    setShowResults(true);
  };

  const handleSaveAndContinue = () => {
    if (results) {
      saveAssessmentMutation.mutate(results);
    }
  };

  if (showResults && results) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/disc">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your Results</h1>
            <p className="text-muted-foreground">
              DiSC Personality Assessment Complete
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your DiSC Profile
            </CardTitle>
            <CardDescription>
              Based on your responses, here's your behavioral style profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsDisplay results={results} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What This Means</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.primaryStyle === "D" && (
              <div>
                <h4 className="font-semibold text-lg" style={{ color: DISC_COLORS.D }}>
                  Dominance Style
                </h4>
                <p className="text-muted-foreground">
                  You are results-oriented, direct, and decisive. You thrive on challenges,
                  take charge of situations, and focus on the bottom line. You're comfortable
                  with conflict and aren't afraid to make tough decisions.
                </p>
                <p className="mt-2 text-sm">
                  <strong>Ideal roles:</strong> Project Lead, Command Center Director, Go-Live Manager
                </p>
              </div>
            )}
            {results.primaryStyle === "i" && (
              <div>
                <h4 className="font-semibold text-lg" style={{ color: DISC_COLORS.i }}>
                  Influence Style
                </h4>
                <p className="text-muted-foreground">
                  You are enthusiastic, optimistic, and collaborative. You excel at building
                  relationships, motivating others, and creating a positive atmosphere.
                  You're persuasive and enjoy working with people.
                </p>
                <p className="mt-2 text-sm">
                  <strong>Ideal roles:</strong> Trainer, End-user Liaison, Change Champion
                </p>
              </div>
            )}
            {results.primaryStyle === "S" && (
              <div>
                <h4 className="font-semibold text-lg" style={{ color: DISC_COLORS.S }}>
                  Steadiness Style
                </h4>
                <p className="text-muted-foreground">
                  You are calm, patient, and supportive. You value stability, are a great
                  team player, and excel at creating harmonious work environments. You're
                  dependable and follow through on commitments.
                </p>
                <p className="mt-2 text-sm">
                  <strong>Ideal roles:</strong> At-the-Elbow Support, Super User Coach, Help Desk
                </p>
              </div>
            )}
            {results.primaryStyle === "C" && (
              <div>
                <h4 className="font-semibold text-lg" style={{ color: DISC_COLORS.C }}>
                  Conscientiousness Style
                </h4>
                <p className="text-muted-foreground">
                  You are analytical, detail-oriented, and quality-focused. You value
                  accuracy, follow procedures carefully, and make decisions based on facts
                  and data. You maintain high standards in your work.
                </p>
                <p className="mt-2 text-sm">
                  <strong>Ideal roles:</strong> Build Analyst, Testing Lead, Data Validation
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleSaveAndContinue}
            disabled={saveAssessmentMutation.isPending}
          >
            {saveAssessmentMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save My Profile
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/disc">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto pb-8">
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-6 px-6 pt-6 -mt-6 border-b mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/disc">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">DiSC Assessment</h1>
            <p className="text-muted-foreground">
              Discover your behavioral style profile
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>
        {/* Progress */}
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Instructions */}
        {currentPage === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <ClipboardList className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">How to Complete This Assessment</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    For each statement, rate how much it describes you on a scale from
                    "Strongly Disagree" to "Strongly Agree". Answer based on how you
                    naturally behave, not how you think you should behave. There are no
                    right or wrong answers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        {currentQuestions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question Set {currentPage * questionsPerPage + qIndex + 1}
              </CardTitle>
              <CardDescription>
                Rate how well each statement describes you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {question.statements.map((statement, sIndex) => (
                <div key={sIndex} className="space-y-3">
                  <p className="font-medium">{statement.text}</p>
                  <RadioGroup
                    value={responses[question.id]?.[statement.trait]?.toString() || ""}
                    onValueChange={(value) =>
                      handleResponse(question.id, statement.trait, parseInt(value))
                    }
                    className="flex flex-wrap gap-2"
                  >
                    {RATING_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <RadioGroupItem
                          value={option.value}
                          id={`q${question.id}-${statement.trait}-${option.value}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`q${question.id}-${statement.trait}-${option.value}`}
                          className={`px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                            responses[question.id]?.[statement.trait]?.toString() ===
                            option.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted border-border"
                          }`}
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentPage < totalPages - 1 ? (
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!isCurrentPageComplete}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!isAssessmentComplete}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
