import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UsersRound,
  Plus,
  ArrowLeft,
  ArrowRight,
  Target,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

interface TeamAssignment {
  consultant: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    } | null;
    discAssessment: {
      primaryStyle: "D" | "i" | "S" | "C";
    } | null;
  };
  role: string;
}

interface Team {
  disc_teams: {
    id: string;
    name: string;
    purpose: string | null;
    targetSize: number;
    status: "forming" | "active" | "completed" | "archived";
    createdAt: string;
  };
  projects: {
    name: string;
  } | null;
  assignments?: TeamAssignment[];
}

interface PaginatedTeamsResponse {
  teams: Team[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DISC_COLORS: Record<string, string> = {
  D: "#D64933",
  i: "#F4B942",
  S: "#4A9B5D",
  C: "#3B82C4",
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  forming: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  active: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  completed: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
  archived: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
};

function DiscBadge({ style }: { style: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs"
      style={{ backgroundColor: DISC_COLORS[style] }}
    >
      {style}
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  const statusStyle = STATUS_STYLES[team.disc_teams.status] || STATUS_STYLES.forming;
  const memberCount = team.assignments?.length || 0;

  // Get style distribution from assignments
  const styleDistribution: Record<string, number> = { D: 0, i: 0, S: 0, C: 0 };
  team.assignments?.forEach((a) => {
    if (a.consultant.discAssessment) {
      styleDistribution[a.consultant.discAssessment.primaryStyle]++;
    }
  });

  return (
    <Card className="hover-elevate group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {team.disc_teams.name}
            </CardTitle>
            {team.projects?.name && (
              <CardDescription className="mt-1">
                {team.projects.name}
              </CardDescription>
            )}
          </div>
          <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0`}>
            {team.disc_teams.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {team.disc_teams.purpose && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team.disc_teams.purpose}
          </p>
        )}

        {/* Team Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{memberCount} / {team.disc_teams.targetSize}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(team.disc_teams.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Style Distribution */}
        {memberCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Styles:</span>
            <div className="flex gap-1">
              {(["D", "i", "S", "C"] as const).map((style) => (
                styleDistribution[style] > 0 && (
                  <div key={style} className="flex items-center gap-0.5">
                    <DiscBadge style={style} />
                    {styleDistribution[style] > 1 && (
                      <span className="text-xs text-muted-foreground">
                        ×{styleDistribution[style]}
                      </span>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Member Avatars */}
        {team.assignments && team.assignments.length > 0 && (
          <div className="flex items-center gap-1">
            {team.assignments.slice(0, 5).map((a, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background -ml-2 first:ml-0"
                style={
                  a.consultant.discAssessment
                    ? { backgroundColor: DISC_COLORS[a.consultant.discAssessment.primaryStyle], color: "white" }
                    : {}
                }
              >
                {a.consultant.user?.firstName?.charAt(0) || "?"}
              </div>
            ))}
            {team.assignments.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background -ml-2">
                +{team.assignments.length - 5}
              </div>
            )}
          </div>
        )}

        {/* View Button */}
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/disc/teams/${team.disc_teams.id}`}>
            View Team
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DiscTeams() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useQuery<PaginatedTeamsResponse>({
    queryKey: ["/api/disc/teams", { page, limit }],
  });

  const teams = data?.teams || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  // Group teams by status
  const activeTeams = teams.filter((t) => t.disc_teams.status === "active");
  const formingTeams = teams.filter((t) => t.disc_teams.status === "forming");
  const completedTeams = teams.filter((t) => t.disc_teams.status === "completed" || t.disc_teams.status === "archived");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/disc">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">
              Manage your DiSC-optimized project teams
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/disc/teams/new">
            <Plus className="h-4 w-4 mr-2" />
            Build Team
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : teams.length > 0 ? (
        <div className="space-y-8">
          {/* Active Teams */}
          {activeTeams.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Active Teams ({activeTeams.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeTeams.map((team) => (
                  <TeamCard key={team.disc_teams.id} team={team} />
                ))}
              </div>
            </div>
          )}

          {/* Forming Teams */}
          {formingTeams.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Forming Teams ({formingTeams.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {formingTeams.map((team) => (
                  <TeamCard key={team.disc_teams.id} team={team} />
                ))}
              </div>
            </div>
          )}

          {/* Completed/Archived Teams */}
          {completedTeams.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                Past Teams ({completedTeams.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedTeams.map((team) => (
                  <TeamCard key={team.disc_teams.id} team={team} />
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} teams
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      </span>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <UsersRound className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-medium mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Build your first DiSC-optimized team to improve collaboration and project success rates.
            </p>
            <Button asChild>
              <Link href="/disc/teams/new">
                <Plus className="h-4 w-4 mr-2" />
                Build Your First Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
