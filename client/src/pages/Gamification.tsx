import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Trophy,
  Star,
  Award,
  Users,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  Medal,
  Gift,
  Target,
  Zap,
  Crown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import type {
  AchievementBadge,
  ConsultantBadgeWithDetails,
  PointTransactionWithDetails,
  ReferralWithDetails,
  GamificationAnalytics,
  Consultant,
} from "@shared/schema";

const BADGE_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "performance", label: "Performance", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "training", label: "Training", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "engagement", label: "Engagement", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "milestone", label: "Milestone", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "special", label: "Special", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
];

const REFERRAL_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "interviewing", label: "Interviewing", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "hired", label: "Hired", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "declined", label: "Declined", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

const TIME_PERIODS = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
];

function getCategoryBadge(category: string) {
  const config = BADGE_CATEGORIES.find(c => c.value === category);
  return <Badge className={config?.color || ""}>{config?.label || category}</Badge>;
}

function getReferralStatusBadge(status: string) {
  const config = REFERRAL_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function getTransactionIcon(type: string) {
  switch (type) {
    case "earned":
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    case "redeemed":
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    case "bonus":
      return <Gift className="h-4 w-4 text-purple-500" />;
    case "adjustment":
      return <Zap className="h-4 w-4 text-yellow-500" />;
    default:
      return <Star className="h-4 w-4 text-muted-foreground" />;
  }
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return null;
}

function DashboardStats({ 
  analytics, 
  earnedBadgesCount,
  currentBalance 
}: { 
  analytics: GamificationAnalytics | undefined;
  earnedBadgesCount: number;
  currentBalance: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-points-balance">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{currentBalance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Available points</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-total-earned">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(analytics?.totalPointsEarned || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Lifetime points earned</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-total-redeemed">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
          <Gift className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(analytics?.totalPointsRedeemed || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Points redeemed</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-badges-earned">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
          <Award className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{earnedBadgesCount}</div>
          <p className="text-xs text-muted-foreground">Achievement badges</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentTransactions({ transactions }: { transactions: PointTransactionWithDetails[] }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Your latest point transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.slice(0, 5).map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center gap-3"
            data-testid={`transaction-item-${transaction.id}`}
          >
            <div className="p-2 rounded-full bg-muted">
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.createdAt ? format(new Date(transaction.createdAt), "MMM d, yyyy h:mm a") : ""}
              </p>
            </div>
            <div className={`text-sm font-bold ${transaction.points >= 0 ? "text-green-600" : "text-red-600"}`}>
              {transaction.points >= 0 ? "+" : ""}{transaction.points}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentBadges({ badges }: { badges: ConsultantBadgeWithDetails[] }) {
  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Badges</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Award className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No badges earned yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Badges</CardTitle>
        <CardDescription>Your latest achievements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {badges.slice(0, 5).map((consultantBadge) => (
          <div 
            key={consultantBadge.id} 
            className="flex items-center gap-3"
            data-testid={`badge-item-${consultantBadge.id}`}
          >
            <div 
              className="p-2 rounded-full" 
              style={{ backgroundColor: consultantBadge.badge.color || "#e5e7eb" }}
            >
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{consultantBadge.badge.name}</p>
              <p className="text-xs text-muted-foreground">
                {consultantBadge.earnedAt ? format(new Date(consultantBadge.earnedAt), "MMM d, yyyy") : ""}
              </p>
            </div>
            <Badge variant="secondary">+{consultantBadge.badge.pointValue || 0}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BadgeCard({ 
  badge, 
  isEarned,
  onClick 
}: { 
  badge: AchievementBadge;
  isEarned: boolean;
  onClick: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer hover-elevate ${isEarned ? "ring-2 ring-green-500" : "opacity-75"}`}
      onClick={onClick}
      data-testid={`badge-card-${badge.id}`}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: badge.color || "#e5e7eb" }}
            >
              <Trophy className="h-8 w-8 text-white" />
            </div>
            {isEarned && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{badge.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getCategoryBadge(badge.category)}
            <Badge variant="secondary">+{badge.pointValue || 0} pts</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeDetailDialog({
  badge,
  open,
  onOpenChange,
  isEarned
}: {
  badge: AchievementBadge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEarned: boolean;
}) {
  if (!badge) return null;

  const criteria = badge.criteria as { type?: string; metric?: string; threshold?: number } | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div 
              className="p-4 rounded-full"
              style={{ backgroundColor: badge.color || "#e5e7eb" }}
            >
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle data-testid="text-badge-name">{badge.name}</DialogTitle>
              <DialogDescription data-testid="text-badge-category">
                {getCategoryBadge(badge.category)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground" data-testid="text-badge-description">
              {badge.description}
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Point Value</h4>
              <p className="text-2xl font-bold text-primary" data-testid="text-badge-points">
                +{badge.pointValue || 0}
              </p>
            </div>
            {isEarned && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Earned
              </Badge>
            )}
          </div>

          {criteria && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-1">Criteria</h4>
                <p className="text-sm text-muted-foreground" data-testid="text-badge-criteria">
                  {criteria.metric}: {criteria.threshold} {criteria.type}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LeaderboardTable({ 
  analytics,
  timePeriod 
}: { 
  analytics: GamificationAnalytics | undefined;
  timePeriod: string;
}) {
  const topEarners = analytics?.topEarners || [];

  if (topEarners.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No leaderboard data</h3>
          <p className="text-muted-foreground text-center">
            Start earning points to appear on the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
        <CardDescription>
          {timePeriod === "all" ? "All time" : timePeriod === "month" ? "This month" : "This week"} leaders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Consultant</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topEarners.map((earner, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              return (
                <TableRow 
                  key={earner.consultantId}
                  className={isTopThree ? "bg-muted/50" : ""}
                  data-testid={`leaderboard-row-${rank}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(rank) || <span className="text-muted-foreground">{rank}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {earner.consultantName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{earner.consultantName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold">{earner.totalPoints.toLocaleString()}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ReferralCard({ referral }: { referral: ReferralWithDetails }) {
  return (
    <Card data-testid={`referral-card-${referral.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {referral.referredName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{referral.referredName}</CardTitle>
              <CardDescription>{referral.referredEmail}</CardDescription>
            </div>
          </div>
          {getReferralStatusBadge(referral.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {referral.referredPhone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{referral.referredPhone}</span>
          </div>
        )}
        
        {referral.notes && (
          <div className="flex items-start gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground line-clamp-2">{referral.notes}</span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Submitted: </span>
            <span>{referral.createdAt ? format(new Date(referral.createdAt), "MMM d, yyyy") : "N/A"}</span>
          </div>
          {(referral.bonusPoints ?? 0) > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Gift className="h-3 w-3 mr-1" />
              +{referral.bonusPoints} pts
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateReferralDialog({
  open,
  onOpenChange,
  consultantId
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultantId: string | undefined;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    referredName: "",
    referredEmail: "",
    referredPhone: "",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/referrals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      onOpenChange(false);
      resetForm();
      toast({ title: "Referral submitted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to submit referral", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      referredName: "",
      referredEmail: "",
      referredPhone: "",
      notes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.referredName.trim()) {
      toast({ title: "Please enter the candidate's name", variant: "destructive" });
      return;
    }
    if (!formData.referredEmail.trim()) {
      toast({ title: "Please enter the candidate's email", variant: "destructive" });
      return;
    }
    if (!consultantId) {
      toast({ title: "Consultant ID not found", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      referrerId: consultantId,
      referredName: formData.referredName.trim(),
      referredEmail: formData.referredEmail.trim(),
      referredPhone: formData.referredPhone.trim() || null,
      notes: formData.notes.trim() || null,
      status: "pending",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit a Referral</DialogTitle>
          <DialogDescription>
            Refer a candidate and earn bonus points if they're hired!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.referredName}
              onChange={(e) => setFormData({ ...formData, referredName: e.target.value })}
              placeholder="Enter candidate's full name"
              data-testid="input-referral-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.referredEmail}
              onChange={(e) => setFormData({ ...formData, referredEmail: e.target.value })}
              placeholder="Enter candidate's email"
              data-testid="input-referral-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.referredPhone}
              onChange={(e) => setFormData({ ...formData, referredPhone: e.target.value })}
              placeholder="Enter candidate's phone (optional)"
              data-testid="input-referral-phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Why would this person be a great fit?"
              className="resize-none"
              rows={3}
              data-testid="input-referral-notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-referral"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            data-testid="button-submit-referral"
          >
            {createMutation.isPending ? "Submitting..." : "Submit Referral"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReferralStats({ referrals }: { referrals: ReferralWithDetails[] }) {
  const pendingCount = referrals.filter(r => r.status === "pending").length;
  const hiredCount = referrals.filter(r => r.status === "hired").length;
  const totalBonus = referrals.reduce((sum, r) => sum + (r.bonusPoints || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card data-testid="stat-total-referrals">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referrals.length}</div>
          <p className="text-xs text-muted-foreground">{pendingCount} pending review</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-successful-referrals">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Successful Hires</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hiredCount}</div>
          <p className="text-xs text-muted-foreground">Referrals hired</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-referral-bonus">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bonus Points</CardTitle>
          <Gift className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBonus.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Earned from referrals</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Gamification() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timePeriod, setTimePeriod] = useState("all");
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [showCreateReferral, setShowCreateReferral] = useState(false);

  const { data: consultant } = useQuery<Consultant>({
    queryKey: ['/api/consultants', 'by-user', user?.id],
    enabled: !!user?.id,
  });

  const consultantId = consultant?.id;

  const { data: pointsData, isLoading: pointsLoading } = useQuery<{ balance: number }>({
    queryKey: ['/api/consultant-points', consultantId],
    enabled: !!consultantId,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<PointTransactionWithDetails[]>({
    queryKey: ['/api/point-transactions', { consultantId }],
    enabled: !!consultantId,
  });

  const { data: allBadges = [], isLoading: badgesLoading } = useQuery<AchievementBadge[]>({
    queryKey: ['/api/achievement-badges'],
  });

  const { data: earnedBadges = [], isLoading: earnedBadgesLoading } = useQuery<ConsultantBadgeWithDetails[]>({
    queryKey: ['/api/consultant-badges', { consultantId }],
    enabled: !!consultantId,
  });

  const { data: referrals = [], isLoading: referralsLoading } = useQuery<ReferralWithDetails[]>({
    queryKey: ['/api/referrals', { referrerId: consultantId }],
    enabled: !!consultantId,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<GamificationAnalytics>({
    queryKey: ['/api/analytics/gamification'],
  });

  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId));
  const currentBalance = pointsData?.balance || 0;

  const filteredBadges = categoryFilter === "all" 
    ? allBadges 
    : allBadges.filter(b => b.category === categoryFilter);

  const isLoading = pointsLoading || transactionsLoading || badgesLoading || earnedBadgesLoading || referralsLoading || analyticsLoading;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Gamification</h1>
          <p className="text-muted-foreground">Track your achievements, points, and referrals</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-gamification">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="badges" data-testid="tab-badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="referrals" data-testid="tab-referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {isLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <DashboardStats 
                analytics={analytics} 
                earnedBadgesCount={earnedBadges.length}
                currentBalance={currentBalance}
              />
              
              <div className="grid gap-6 md:grid-cols-2">
                <RecentTransactions transactions={transactions} />
                <RecentBadges badges={earnedBadges} />
              </div>

              {earnedBadges.length > 0 && allBadges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Badge Progress</CardTitle>
                    <CardDescription>You've earned {earnedBadges.length} of {allBadges.length} available badges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={(earnedBadges.length / allBadges.length) * 100} 
                      className="h-3"
                      data-testid="progress-badges"
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter} data-testid="filter-badge-category">
              <SelectTrigger className="w-[180px]" data-testid="filter-category-trigger">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {BADGE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} data-testid={`filter-category-${cat.value}`}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground">
              {earnedBadges.length} of {allBadges.length} badges earned
            </div>
          </div>

          {badgesLoading || earnedBadgesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-3">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBadges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No badges found</h3>
                <p className="text-muted-foreground text-center">
                  {categoryFilter !== "all" 
                    ? "Try selecting a different category"
                    : "Badges will appear here as they are created"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBadges.map(badge => (
                <BadgeCard 
                  key={badge.id} 
                  badge={badge}
                  isEarned={earnedBadgeIds.has(badge.id)}
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Select value={timePeriod} onValueChange={setTimePeriod} data-testid="filter-time-period">
              <SelectTrigger className="w-[150px]" data-testid="filter-period-trigger">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map(period => (
                  <SelectItem key={period.value} value={period.value} data-testid={`filter-period-${period.value}`}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {analyticsLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <LeaderboardTable analytics={analytics} timePeriod={timePeriod} />
          )}
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          {referralsLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <ReferralStats referrals={referrals} />

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Your Referrals</h2>
                  <p className="text-sm text-muted-foreground">
                    Track the status of candidates you've referred
                  </p>
                </div>
                <Button onClick={() => setShowCreateReferral(true)} data-testid="button-new-referral">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Submit Referral
                </Button>
              </div>

              {referrals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Refer qualified candidates and earn bonus points when they're hired!
                    </p>
                    <Button onClick={() => setShowCreateReferral(true)} data-testid="button-create-first-referral">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Submit Your First Referral
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {referrals.map(referral => (
                    <ReferralCard key={referral.id} referral={referral} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <BadgeDetailDialog
        badge={selectedBadge}
        open={!!selectedBadge}
        onOpenChange={(open) => !open && setSelectedBadge(null)}
        isEarned={selectedBadge ? earnedBadgeIds.has(selectedBadge.id) : false}
      />

      <CreateReferralDialog
        open={showCreateReferral}
        onOpenChange={setShowCreateReferral}
        consultantId={consultantId}
      />
    </div>
  );
}
