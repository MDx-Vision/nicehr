import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowLeft,
  ArrowRight,
  Target,
  Zap,
  Shield,
  TrendingUp,
  X,
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

// Compatibility matrix for quick calculations
const COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
  D: { D: 70, i: 80, S: 60, C: 75 },
  i: { D: 80, i: 75, S: 85, C: 65 },
  S: { D: 60, i: 85, S: 80, C: 75 },
  C: { D: 75, i: 65, S: 75, C: 85 },
};

function DiscBadge({ style, size = "md" }: { style: string; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ backgroundColor: DISC_COLORS[style] }}
    >
      {style}
    </div>
  );
}

function ConsultantCard({
  consultant,
  isSelected,
  onToggle,
}: {
  consultant: ConsultantWithDisc;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const name = consultant.user
    ? `${consultant.user.firstName} ${consultant.user.lastName}`
    : "Unknown";

  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {consultant.discAssessment ? (
          <DiscBadge style={consultant.discAssessment.primaryStyle} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
            ?
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{name}</div>
          <div className="text-xs text-muted-foreground">
            {consultant.location || "No location"} • {consultant.yearsExperience} yrs
          </div>
        </div>
        {isSelected ? (
          <UserMinus className="h-4 w-4 text-destructive" />
        ) : (
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {consultant.discAssessment && (
        <div className="mt-2 flex gap-1">
          {["D", "i", "S", "C"].map((style) => {
            const score =
              consultant.discAssessment![
                `${style.toLowerCase()}Score` as keyof DiscAssessment
              ] as number;
            return (
              <div key={style} className="flex-1">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    backgroundColor: DISC_COLORS[style],
                    opacity: score / 100,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeamMemberChip({
  consultant,
  onRemove,
}: {
  consultant: ConsultantWithDisc;
  onRemove: () => void;
}) {
  const name = consultant.user
    ? `${consultant.user.firstName} ${consultant.user.lastName?.charAt(0)}.`
    : "Unknown";

  return (
    <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-muted border">
      {consultant.discAssessment ? (
        <DiscBadge style={consultant.discAssessment.primaryStyle} size="sm" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-muted-foreground text-xs">
          ?
        </div>
      )}
      <span className="text-sm font-medium">{name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-1 p-0.5 rounded-full hover:bg-background transition-colors"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

function LiveAnalysis({ members }: { members: ConsultantWithDisc[] }) {
  const analysis = useMemo(() => {
    if (members.length < 2) {
      return null;
    }

    const withDisc = members.filter((m) => m.discAssessment);
    if (withDisc.length < 2) {
      return null;
    }

    // Calculate style distribution
    const distribution: Record<string, number> = { D: 0, i: 0, S: 0, C: 0 };
    withDisc.forEach((m) => {
      if (m.discAssessment) {
        distribution[m.discAssessment.primaryStyle]++;
      }
    });

    // Calculate average compatibility
    let totalScore = 0;
    let pairCount = 0;
    for (let i = 0; i < withDisc.length; i++) {
      for (let j = i + 1; j < withDisc.length; j++) {
        const style1 = withDisc[i].discAssessment!.primaryStyle;
        const style2 = withDisc[j].discAssessment!.primaryStyle;
        totalScore += COMPATIBILITY_MATRIX[style1][style2];
        pairCount++;
      }
    }
    const averageScore = pairCount > 0 ? Math.round(totalScore / pairCount) : 0;

    // Identify warnings
    const warnings: string[] = [];
    const strengths: string[] = [];

    // Check for high D concentration
    if (distribution.D >= 2 && distribution.D / withDisc.length > 0.4) {
      warnings.push("High D concentration may cause power struggles");
    }

    // Check for missing styles
    const missingStyles = Object.entries(distribution)
      .filter(([_, count]) => count === 0)
      .map(([style]) => style);
    if (missingStyles.length > 0) {
      warnings.push(`Missing ${missingStyles.join(", ")} style perspectives`);
    }

    // Check for D-S friction
    if (distribution.D > 0 && distribution.S > 0) {
      warnings.push("D-S pairing may need extra communication support");
    }

    // Strengths
    if (distribution.D > 0 && distribution.C > 0) {
      strengths.push("Strong D-C pairing for decisive quality execution");
    }
    if (distribution.i > 0 && distribution.S > 0) {
      strengths.push("i-S combo creates excellent team cohesion");
    }
    if (Object.values(distribution).filter((v) => v > 0).length === 4) {
      strengths.push("All four styles represented - balanced perspective");
    }
    if (distribution.i >= 2) {
      strengths.push("Strong influence presence for stakeholder engagement");
    }

    return {
      distribution,
      averageScore,
      warnings,
      strengths,
      memberCount: withDisc.length,
    };
  }, [members]);

  if (!analysis) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Add at least 2 members with DiSC profiles</p>
        <p className="text-sm">to see live compatibility analysis</p>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Compatibility Score */}
      <div className="text-center">
        <div className={`text-5xl font-bold ${getScoreColor(analysis.averageScore)}`}>
          {analysis.averageScore}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Compatibility Score • {getScoreLabel(analysis.averageScore)}
        </div>
        <Progress value={analysis.averageScore} className="mt-3 h-2" />
      </div>

      <Separator />

      {/* Style Distribution */}
      <div>
        <div className="text-sm font-medium mb-3">Style Distribution</div>
        <div className="grid grid-cols-4 gap-2">
          {(["D", "i", "S", "C"] as const).map((style) => (
            <div key={style} className="text-center">
              <div
                className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-semibold mb-1"
                style={{
                  backgroundColor: DISC_COLORS[style],
                  opacity: analysis.distribution[style] > 0 ? 1 : 0.3,
                }}
              >
                {analysis.distribution[style]}
              </div>
              <div className="text-xs text-muted-foreground">{style}</div>
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
          <ul className="space-y-1">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <Zap className="h-3 w-3 mt-1 text-green-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Considerations
          </div>
          <ul className="space-y-1">
            {analysis.warnings.map((w, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <Info className="h-3 w-3 mt-1 text-amber-500" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DiscTeamBuilder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [teamName, setTeamName] = useState("");
  const [teamPurpose, setTeamPurpose] = useState("");
  const [targetSize, setTargetSize] = useState(6);
  const [selectedMembers, setSelectedMembers] = useState<ConsultantWithDisc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState<string | null>(null);

  // Fetch consultants with DiSC
  const { data: consultants, isLoading } = useQuery<ConsultantWithDisc[]>({
    queryKey: ["/api/disc/consultants"],
  });

  // Filter consultants
  const filteredConsultants = useMemo(() => {
    if (!consultants) return [];

    return consultants.filter((c) => {
      // Exclude already selected
      if (selectedMembers.some((m) => m.id === c.id)) return false;

      // Search filter
      if (searchQuery) {
        const name = c.user
          ? `${c.user.firstName} ${c.user.lastName}`.toLowerCase()
          : "";
        if (!name.includes(searchQuery.toLowerCase())) return false;
      }

      // Style filter
      if (styleFilter) {
        if (!c.discAssessment) return false;
        if (c.discAssessment.primaryStyle !== styleFilter) return false;
      }

      return true;
    });
  }, [consultants, selectedMembers, searchQuery, styleFilter]);

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async () => {
      // Create team
      const teamRes = await apiRequest("POST", "/api/disc/teams", {
        name: teamName,
        purpose: teamPurpose,
        targetSize,
        status: "forming",
      });
      const team = await teamRes.json();

      // Add members
      for (const member of selectedMembers) {
        await apiRequest("POST", `/api/disc/teams/${team.id}/members`, {
          consultantId: member.id,
          role: "member",
        });
      }

      // Run initial analysis if we have enough members
      if (selectedMembers.filter((m) => m.discAssessment).length >= 2) {
        await apiRequest("POST", `/api/disc/teams/${team.id}/analyze`);
      }

      return team;
    },
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ["/api/disc/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/disc/dashboard/stats"] });
      toast({
        title: "Team Created",
        description: `${teamName} has been created with ${selectedMembers.length} members.`,
      });
      navigate(`/disc/teams/${team.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleMember = (consultant: ConsultantWithDisc) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === consultant.id)
        ? prev.filter((m) => m.id !== consultant.id)
        : [...prev, consultant]
    );
  };

  const canCreate = teamName.trim().length > 0 && selectedMembers.length >= 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/disc">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Build New Team</h1>
          <p className="text-muted-foreground">
            Create a high-performing team with DiSC compatibility insights
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g., Epic Go-Live Alpha Team"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetSize">Target Size</Label>
                  <Input
                    id="targetSize"
                    type="number"
                    min={2}
                    max={20}
                    value={targetSize}
                    onChange={(e) => setTargetSize(parseInt(e.target.value) || 6)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the team's purpose and goals..."
                  value={teamPurpose}
                  onChange={(e) => setTeamPurpose(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Team Members</span>
                <Badge variant="secondary">
                  {selectedMembers.length} / {targetSize}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMembers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No members added yet</p>
                  <p className="text-sm">Select consultants from the list below</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <TeamMemberChip
                      key={member.id}
                      consultant={member}
                      onRemove={() => toggleMember(member)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Consultants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Consultants</CardTitle>
              <CardDescription>
                Click to add or remove from your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={styleFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStyleFilter(null)}
                  >
                    All
                  </Button>
                  {(["D", "i", "S", "C"] as const).map((style) => (
                    <Button
                      key={style}
                      variant={styleFilter === style ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStyleFilter(style)}
                      style={
                        styleFilter === style
                          ? { backgroundColor: DISC_COLORS[style], borderColor: DISC_COLORS[style] }
                          : {}
                      }
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Consultant List */}
              {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : filteredConsultants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No matching consultants found</p>
                  {styleFilter && (
                    <Button
                      variant="ghost"
                      onClick={() => setStyleFilter(null)}
                      className="mt-2"
                    >
                      Clear filter
                    </Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredConsultants.map((consultant) => (
                      <ConsultantCard
                        key={consultant.id}
                        consultant={consultant}
                        isSelected={selectedMembers.some((m) => m.id === consultant.id)}
                        onToggle={() => toggleMember(consultant)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Analysis Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Live Analysis
              </CardTitle>
              <CardDescription>
                Real-time compatibility preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveAnalysis members={selectedMembers} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              disabled={!canCreate || createTeamMutation.isPending}
              onClick={() => createTeamMutation.mutate()}
            >
              {createTeamMutation.isPending ? (
                "Creating..."
              ) : (
                <>
                  Create Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {!canCreate && (
              <p className="text-xs text-center text-muted-foreground">
                {!teamName.trim()
                  ? "Enter a team name to continue"
                  : "Add at least 2 members to create a team"}
              </p>
            )}
          </div>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Building Tips</div>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Include all 4 DiSC styles when possible</li>
                    <li>• Balance D types with S types for harmony</li>
                    <li>• Add i types for stakeholder communication</li>
                    <li>• C types ensure quality and accuracy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
