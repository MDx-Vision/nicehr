import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Award,
  Users,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";

interface DiscAssessment {
  primaryStyle: "D" | "i" | "S" | "C";
  secondaryStyle: "D" | "i" | "S" | "C" | null;
  dScore: number;
  iScore: number;
  sScore: number;
  cScore: number;
  assessedAt?: string;
}

interface ConsultantWithDisc {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  location: string | null;
  yearsExperience: number;
  emrSystems: string[] | null;
  discAssessment: DiscAssessment | null;
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

const DISC_DETAILS: Record<string, {
  tagline: string;
  description: string;
  strengths: string[];
  challenges: string[];
  idealRoles: string[];
  communicationTips: string[];
}> = {
  D: {
    tagline: "Results-oriented and decisive",
    description: "People with D styles are motivated by winning, competition, and success. They prioritize accepting challenges, taking action, and achieving immediate results.",
    strengths: [
      "Direct and decisive",
      "Results-driven",
      "Competitive and confident",
      "Problem solver",
      "Risk taker",
    ],
    challenges: [
      "Can be impatient",
      "May overlook details",
      "Can be insensitive to others",
      "May take on too much",
    ],
    idealRoles: [
      "Project Lead",
      "Command Center Director",
      "Go-Live Manager",
      "Executive Sponsor Liaison",
    ],
    communicationTips: [
      "Be direct and to the point",
      "Focus on results and outcomes",
      "Provide options, not directives",
      "Avoid too many details initially",
    ],
  },
  i: {
    tagline: "Enthusiastic and collaborative",
    description: "People with i styles are motivated by social recognition, group activities, and relationships. They prioritize enthusiasm, collaboration, and expressing ideas.",
    strengths: [
      "Enthusiastic and optimistic",
      "Great communicator",
      "Builds relationships easily",
      "Creative and innovative",
      "Motivates others",
    ],
    challenges: [
      "May overlook details",
      "Can be disorganized",
      "May over-promise",
      "Can lose focus easily",
    ],
    idealRoles: [
      "Trainer",
      "End-user Liaison",
      "Change Champion",
      "Stakeholder Engagement",
    ],
    communicationTips: [
      "Be friendly and personable",
      "Allow time for discussion",
      "Focus on the big picture",
      "Recognize their contributions",
    ],
  },
  S: {
    tagline: "Calm and supportive",
    description: "People with S styles are motivated by cooperation, stability, and sincere appreciation. They prioritize supporting others, maintaining stability, and being patient.",
    strengths: [
      "Patient and calm",
      "Reliable and dependable",
      "Great team player",
      "Good listener",
      "Supportive of others",
    ],
    challenges: [
      "May resist change",
      "Can be too accommodating",
      "May avoid conflict",
      "Can be indirect",
    ],
    idealRoles: [
      "At-the-Elbow Support",
      "Super User Coach",
      "Help Desk",
      "Training Support",
    ],
    communicationTips: [
      "Be patient and sincere",
      "Provide a stable environment",
      "Give time to adjust to change",
      "Show appreciation for their work",
    ],
  },
  C: {
    tagline: "Analytical and quality-focused",
    description: "People with C styles are motivated by opportunities to gain knowledge, show their expertise, and produce quality work. They prioritize accuracy, stability, and challenging assumptions.",
    strengths: [
      "Accurate and detail-oriented",
      "Analytical thinker",
      "High standards",
      "Systematic approach",
      "Quality-focused",
    ],
    challenges: [
      "Can be overly critical",
      "May overanalyze",
      "Can be too cautious",
      "May seem aloof",
    ],
    idealRoles: [
      "Build Analyst",
      "Testing Lead",
      "Data Validation",
      "Documentation Specialist",
    ],
    communicationTips: [
      "Provide data and facts",
      "Give time to analyze",
      "Be specific and detailed",
      "Avoid emotional appeals",
    ],
  },
};

function ScoreBar({ trait, score, showLabel = true }: { trait: string; score: number; showLabel?: boolean }) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: DISC_COLORS[trait] }}
            >
              {trait}
            </div>
            <span className="font-medium">{DISC_NAMES[trait]}</span>
          </div>
          <span className="font-bold text-lg">{score}%</span>
        </div>
      )}
      <div className="h-4 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: DISC_COLORS[trait],
          }}
        />
      </div>
    </div>
  );
}

export default function DiscConsultantProfile() {
  const [, params] = useRoute("/disc/consultants/:id");
  const consultantId = params?.id;

  const { data: consultant, isLoading } = useQuery<ConsultantWithDisc>({
    queryKey: [`/api/disc/consultants/${consultantId}`],
    enabled: !!consultantId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!consultant) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold">Consultant Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The consultant you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/disc/consultants">Back to Consultants</Link>
        </Button>
      </div>
    );
  }

  const name = consultant.user
    ? `${consultant.user.firstName} ${consultant.user.lastName}`
    : "Unknown Consultant";

  const assessment = consultant.discAssessment;
  const primaryDetails = assessment ? DISC_DETAILS[assessment.primaryStyle] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/disc/consultants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {assessment ? (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: DISC_COLORS[assessment.primaryStyle] }}
              >
                {assessment.primaryStyle}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
              {assessment && (
                <p className="text-muted-foreground">
                  {DISC_NAMES[assessment.primaryStyle]}
                  {assessment.secondaryStyle && ` / ${DISC_NAMES[assessment.secondaryStyle]}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info & Scores */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {consultant.user?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{consultant.user.email}</span>
                </div>
              )}
              {consultant.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{consultant.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{consultant.yearsExperience} years experience</span>
              </div>
              {consultant.emrSystems && consultant.emrSystems.length > 0 && (
                <div className="flex items-start gap-3">
                  <Award className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex flex-wrap gap-1">
                    {consultant.emrSystems.map((system) => (
                      <Badge key={system} variant="secondary" className="text-xs">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DiSC Scores */}
          {assessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DiSC Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScoreBar trait="D" score={assessment.dScore} />
                <ScoreBar trait="i" score={assessment.iScore} />
                <ScoreBar trait="S" score={assessment.sScore} />
                <ScoreBar trait="C" score={assessment.cScore} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Detailed Profile */}
        <div className="lg:col-span-2 space-y-6">
          {assessment && primaryDetails ? (
            <>
              {/* Profile Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: DISC_COLORS[assessment.primaryStyle] }}
                    >
                      {assessment.primaryStyle}
                    </div>
                    {DISC_NAMES[assessment.primaryStyle]} Profile
                  </CardTitle>
                  <CardDescription>{primaryDetails.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{primaryDetails.description}</p>
                </CardContent>
              </Card>

              {/* Strengths & Challenges */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-green-200 dark:border-green-900">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Zap className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {primaryDetails.strengths.map((strength, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-900">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-5 w-5" />
                      Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {primaryDetails.challenges.map((challenge, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Ideal Roles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Ideal Roles in Healthcare IT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {primaryDetails.idealRoles.map((role, i) => (
                      <Badge
                        key={i}
                        className="text-sm py-1.5 px-3"
                        style={{
                          backgroundColor: `${DISC_COLORS[assessment.primaryStyle]}20`,
                          color: DISC_COLORS[assessment.primaryStyle],
                          borderColor: DISC_COLORS[assessment.primaryStyle],
                        }}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Communication Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Communication Tips
                  </CardTitle>
                  <CardDescription>
                    How to effectively communicate with this team member
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {primaryDetails.communicationTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium mt-0.5"
                          style={{ backgroundColor: DISC_COLORS[assessment.primaryStyle] }}
                        >
                          {i + 1}
                        </div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <h3 className="text-lg font-semibold">No DiSC Assessment</h3>
                <p className="text-muted-foreground mt-2">
                  This consultant hasn't completed a DiSC assessment yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
