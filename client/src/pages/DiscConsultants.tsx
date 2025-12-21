import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Users,
  Filter,
  Eye,
  UserCircle,
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

function DiscBadge({ style, size = "md" }: { style: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ backgroundColor: DISC_COLORS[style] }}
    >
      {style}
    </div>
  );
}

function ScoreBar({ trait, score }: { trait: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-4 font-medium" style={{ color: DISC_COLORS[trait] }}>
        {trait}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: DISC_COLORS[trait],
          }}
        />
      </div>
      <span className="text-xs w-8 text-right text-muted-foreground">{score}%</span>
    </div>
  );
}

export default function DiscConsultants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [assessmentFilter, setAssessmentFilter] = useState<string>("all");

  const { data: consultants, isLoading } = useQuery<ConsultantWithDisc[]>({
    queryKey: ["/api/disc/consultants"],
  });

  const filteredConsultants = consultants?.filter((c) => {
    // Search filter
    if (searchQuery) {
      const name = c.user
        ? `${c.user.firstName} ${c.user.lastName}`.toLowerCase()
        : "";
      const email = c.user?.email?.toLowerCase() || "";
      const location = c.location?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      if (!name.includes(query) && !email.includes(query) && !location.includes(query)) {
        return false;
      }
    }

    // Style filter
    if (styleFilter !== "all") {
      if (!c.discAssessment || c.discAssessment.primaryStyle !== styleFilter) {
        return false;
      }
    }

    // Assessment filter
    if (assessmentFilter === "assessed" && !c.discAssessment) {
      return false;
    }
    if (assessmentFilter === "not-assessed" && c.discAssessment) {
      return false;
    }

    return true;
  }) || [];

  // Stats
  const totalConsultants = consultants?.length || 0;
  const assessedCount = consultants?.filter((c) => c.discAssessment).length || 0;
  const styleDistribution = consultants?.reduce(
    (acc, c) => {
      if (c.discAssessment) {
        acc[c.discAssessment.primaryStyle]++;
      }
      return acc;
    },
    { D: 0, i: 0, S: 0, C: 0 } as Record<string, number>
  ) || { D: 0, i: 0, S: 0, C: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/disc">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">DiSC Profiles</h1>
          <p className="text-muted-foreground">
            View and manage consultant behavioral assessments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalConsultants}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assessed</p>
                <p className="text-2xl font-bold">{assessedCount}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {totalConsultants > 0
                  ? Math.round((assessedCount / totalConsultants) * 100)
                  : 0}%
              </div>
            </div>
          </CardContent>
        </Card>
        {(["D", "i", "S", "C"] as const).map((style) => (
          <Card key={style}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{DISC_NAMES[style]}</p>
                  <p className="text-2xl font-bold">{styleDistribution[style]}</p>
                </div>
                <DiscBadge style={style} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={styleFilter} onValueChange={setStyleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="DiSC Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                <SelectItem value="D">D - Dominance</SelectItem>
                <SelectItem value="i">i - Influence</SelectItem>
                <SelectItem value="S">S - Steadiness</SelectItem>
                <SelectItem value="C">C - Conscientiousness</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assessmentFilter} onValueChange={setAssessmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assessment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Consultants</SelectItem>
                <SelectItem value="assessed">Assessed Only</SelectItem>
                <SelectItem value="not-assessed">Not Assessed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consultants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Consultants</CardTitle>
          <CardDescription>
            {filteredConsultants.length} consultant{filteredConsultants.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredConsultants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No consultants found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>DiSC Profile</TableHead>
                  <TableHead>Scores</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {consultant.discAssessment ? (
                          <DiscBadge style={consultant.discAssessment.primaryStyle} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                            ?
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {consultant.user
                              ? `${consultant.user.firstName} ${consultant.user.lastName}`
                              : "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {consultant.user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{consultant.location || "-"}</TableCell>
                    <TableCell>{consultant.yearsExperience} years</TableCell>
                    <TableCell>
                      {consultant.discAssessment ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            style={{
                              backgroundColor: DISC_COLORS[consultant.discAssessment.primaryStyle],
                              color: "white",
                            }}
                          >
                            {DISC_NAMES[consultant.discAssessment.primaryStyle]}
                          </Badge>
                          {consultant.discAssessment.secondaryStyle && (
                            <Badge variant="outline">
                              {consultant.discAssessment.secondaryStyle}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary">Not Assessed</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {consultant.discAssessment ? (
                        <div className="w-32 space-y-1">
                          <ScoreBar trait="D" score={consultant.discAssessment.dScore} />
                          <ScoreBar trait="i" score={consultant.discAssessment.iScore} />
                          <ScoreBar trait="S" score={consultant.discAssessment.sScore} />
                          <ScoreBar trait="C" score={consultant.discAssessment.cScore} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/disc/consultants/${consultant.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
