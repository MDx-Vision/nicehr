import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Shield, 
  User, 
  FileText,
  AlertTriangle,
  Eye,
  Loader2 
} from "lucide-react";

interface ConsultantQuestionnaire {
  id: string;
  consultantId: string;
  status: string;
  submittedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  consultant?: {
    id: string;
    tngId: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      profileImageUrl: string | null;
    };
  };
  skills?: Array<{
    skillItemId: string;
    proficiency: string;
    yearsExperience: number;
    isCertified: boolean;
  }>;
  ehrExperience?: Array<{
    ehrSystem: string;
    proficiency: string;
    yearsExperience: number;
    isCertified: boolean;
  }>;
}

interface SkillCategory {
  id: string;
  name: string;
  displayName: string;
  items: Array<{ id: string; displayName: string }>;
}

export default function SkillsVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("submitted");
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<ConsultantQuestionnaire | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  // Fetch all questionnaires (admin only)
  const { data: questionnaires, isLoading } = useQuery<ConsultantQuestionnaire[]>({
    queryKey: ["/api/admin/questionnaires", statusFilter],
    enabled: isAdmin,
  });

  // Fetch skill categories for display
  const { data: skillCategories } = useQuery<SkillCategory[]>({
    queryKey: ["/api/skills/all"],
  });

  // Verify skill mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ questionnaireId, action, notes }: { questionnaireId: string; action: "verify" | "reject"; notes: string }) => {
      return apiRequest("/api/admin/questionnaires/verify", "POST", {
        questionnaireId,
        action,
        notes,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questionnaires"] });
      toast({
        title: variables.action === "verify" ? "Skills Verified" : "Skills Rejected",
        description: variables.action === "verify" 
          ? "The consultant's skills have been verified successfully."
          : "The skill verification has been rejected.",
      });
      setDetailsOpen(false);
      setSelectedQuestionnaire(null);
      setVerificationNotes("");
    },
    onError: () => {
      toast({
        title: "Action failed",
        description: "Failed to process verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSkillName = (skillItemId: string) => {
    if (!skillCategories) return skillItemId;
    for (const category of skillCategories) {
      const item = category.items.find(i => i.id === skillItemId);
      if (item) return item.displayName;
    }
    return skillItemId;
  };

  const getProficiencyBadge = (proficiency: string) => {
    const colors: Record<string, string> = {
      none: "bg-gray-100 text-gray-600",
      beginner: "bg-blue-100 text-blue-700",
      intermediate: "bg-yellow-100 text-yellow-700",
      advanced: "bg-green-100 text-green-700",
      expert: "bg-purple-100 text-purple-700",
    };
    return (
      <Badge variant="outline" className={colors[proficiency] || ""}>
        {proficiency.charAt(0).toUpperCase() + proficiency.slice(1)}
      </Badge>
    );
  };

  const filteredQuestionnaires = questionnaires?.filter(q => {
    if (!searchQuery) return true;
    const consultantName = `${q.consultant?.user?.firstName} ${q.consultant?.user?.lastName}`.toLowerCase();
    const tngId = q.consultant?.tngId?.toLowerCase() || "";
    return consultantName.includes(searchQuery.toLowerCase()) || tngId.includes(searchQuery.toLowerCase());
  });

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Skills Verification</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You do not have permission to access skill verification.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="skills-verification-page">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Skills Verification</h1>
        <p className="text-muted-foreground mt-1">
          Review and verify consultant skill questionnaires
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold" data-testid="count-pending">
                {questionnaires?.filter(q => q.status === "submitted").length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold" data-testid="count-verified">
                {questionnaires?.filter(q => q.status === "verified").length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold" data-testid="count-rejected">
                {questionnaires?.filter(q => q.status === "rejected").length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold" data-testid="count-draft">
                {questionnaires?.filter(q => q.status === "draft").length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Queue</CardTitle>
          <CardDescription>Filter and review submitted skill questionnaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Label className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or TNG ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : filteredQuestionnaires && filteredQuestionnaires.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultant</TableHead>
                  <TableHead>TNG ID</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestionnaires.map((q) => (
                  <TableRow key={q.id} data-testid={`row-questionnaire-${q.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={q.consultant?.user?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {q.consultant?.user?.firstName?.[0]}{q.consultant?.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {q.consultant?.user?.firstName} {q.consultant?.user?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {q.consultant?.user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{q.consultant?.tngId || "N/A"}</TableCell>
                    <TableCell>
                      {q.submittedAt 
                        ? new Date(q.submittedAt).toLocaleDateString() 
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {q.skills?.filter(s => s.proficiency !== "none").length || 0} skills
                      </span>
                    </TableCell>
                    <TableCell>
                      {q.status === "submitted" && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {q.status === "verified" && (
                        <Badge variant="default">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {q.status === "rejected" && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                      {q.status === "draft" && (
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuestionnaire(q);
                          setDetailsOpen(true);
                        }}
                        data-testid={`button-review-${q.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No questionnaires found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Skills Review: {selectedQuestionnaire?.consultant?.user?.firstName} {selectedQuestionnaire?.consultant?.user?.lastName}
            </DialogTitle>
            <DialogDescription>
              Review and verify the consultant's reported skills and experience
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            {selectedQuestionnaire && (
              <div className="space-y-6">
                {/* Consultant Info */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedQuestionnaire.consultant?.user?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {selectedQuestionnaire.consultant?.user?.firstName?.[0]}
                      {selectedQuestionnaire.consultant?.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedQuestionnaire.consultant?.user?.firstName} {selectedQuestionnaire.consultant?.user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      TNG ID: {selectedQuestionnaire.consultant?.tngId || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedQuestionnaire.consultant?.user?.email}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* EHR Experience */}
                {selectedQuestionnaire.ehrExperience && selectedQuestionnaire.ehrExperience.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">EHR Systems Experience</h4>
                    <div className="grid gap-3">
                      {selectedQuestionnaire.ehrExperience.map((exp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{exp.ehrSystem}</span>
                            {exp.isCertified && (
                              <Badge variant="default" className="text-xs">Certified</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{exp.yearsExperience} years</span>
                            {getProficiencyBadge(exp.proficiency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Skills */}
                {selectedQuestionnaire.skills && selectedQuestionnaire.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Reported Skills ({selectedQuestionnaire.skills.filter(s => s.proficiency !== "none").length})</h4>
                    <div className="grid gap-2">
                      {selectedQuestionnaire.skills
                        .filter(s => s.proficiency !== "none")
                        .map((skill, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span>{getSkillName(skill.skillItemId)}</span>
                              {skill.isCertified && (
                                <Badge variant="default" className="text-xs">Certified</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">{skill.yearsExperience} years</span>
                              {getProficiencyBadge(skill.proficiency)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedQuestionnaire.status === "submitted" && (
                  <>
                    <Separator />
                    <div>
                      <Label htmlFor="notes">Verification Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about this verification..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        className="mt-2"
                        rows={3}
                        data-testid="textarea-verification-notes"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {selectedQuestionnaire?.status === "submitted" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedQuestionnaire) {
                      verifyMutation.mutate({
                        questionnaireId: selectedQuestionnaire.id,
                        action: "reject",
                        notes: verificationNotes,
                      });
                    }
                  }}
                  disabled={verifyMutation.isPending}
                  data-testid="button-reject"
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    if (selectedQuestionnaire) {
                      verifyMutation.mutate({
                        questionnaireId: selectedQuestionnaire.id,
                        action: "verify",
                        notes: verificationNotes,
                      });
                    }
                  }}
                  disabled={verifyMutation.isPending}
                  data-testid="button-verify"
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Verify Skills
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
