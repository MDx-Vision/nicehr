import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Users,
  XCircle,
  Play,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RequirementWithContext } from "@shared/schema";

interface AutoAssignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  requirements: RequirementWithContext[];
}

interface AutoAssignResult {
  success: boolean;
  dryRun: boolean;
  projectId: string;
  assignmentsMade: number;
  conflictsFound: number;
  assignments: Array<{
    scheduleId: string;
    consultantId: string;
    score: number;
  }>;
  skipped: Array<{
    consultantId: string;
    reason: string;
  }>;
}

export function AutoAssignWizard({
  open,
  onOpenChange,
  projectId,
  projectName,
  requirements,
}: AutoAssignWizardProps) {
  const [step, setStep] = useState<"config" | "preview" | "result">("config");
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
    requirements.map((r) => r.id)
  );
  const [maxPerConsultant, setMaxPerConsultant] = useState(5);
  const [previewResult, setPreviewResult] = useState<AutoAssignResult | null>(null);
  const { toast } = useToast();

  // Preview mutation (dry run)
  const previewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/scheduling/projects/${projectId}/auto-assign`, {
        requirementIds: selectedRequirements.length === requirements.length ? undefined : selectedRequirements,
        dryRun: true,
        maxPerConsultant,
      });
      return res.json() as Promise<AutoAssignResult>;
    },
    onSuccess: (data) => {
      setPreviewResult(data);
      setStep("preview");
    },
    onError: () => {
      toast({
        title: "Preview Failed",
        description: "Could not generate preview. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Execute mutation (actual assignment)
  const executeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/scheduling/projects/${projectId}/auto-assign`, {
        requirementIds: selectedRequirements.length === requirements.length ? undefined : selectedRequirements,
        dryRun: false,
        maxPerConsultant,
      });
      return res.json() as Promise<AutoAssignResult>;
    },
    onSuccess: (data) => {
      setPreviewResult(data);
      setStep("result");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/scheduling/projects/${projectId}/requirements`] });
      toast({
        title: "Auto-Assign Complete",
        description: `Successfully assigned ${data.assignmentsMade} consultants.`,
      });
    },
    onError: () => {
      toast({
        title: "Auto-Assign Failed",
        description: "Could not complete auto-assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setStep("config");
    setPreviewResult(null);
    onOpenChange(false);
  };

  const toggleRequirement = (id: string) => {
    setSelectedRequirements((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const totalNeeded = requirements
    .filter((r) => selectedRequirements.includes(r.id))
    .reduce((sum, r) => sum + r.consultantsNeeded, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Auto-Assign Consultants
          </DialogTitle>
          <DialogDescription>
            Automatically assign top-ranked consultants to {projectName}
          </DialogDescription>
        </DialogHeader>

        {step === "config" && (
          <>
            <div className="space-y-6 py-4">
              {/* Requirements Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Select Requirements</Label>
                <ScrollArea className="h-48 border rounded-lg p-3">
                  {requirements.map((req) => {
                    const alreadyAssigned = req.alreadyAssignedConsultantIds?.length || 0;
                    const stillNeeded = req.consultantsNeeded - alreadyAssigned;

                    return (
                      <div
                        key={req.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRequirements.includes(req.id)}
                            onCheckedChange={() => toggleRequirement(req.id)}
                            disabled={stillNeeded <= 0}
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {req.unitName || "All Units"} / {req.moduleName || "All Modules"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {req.shiftType} shift • {req.hospitalName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {stillNeeded > 0 ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              Need {stillNeeded} more
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Fully staffed
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
                <p className="text-sm text-muted-foreground">
                  {selectedRequirements.length} requirements selected • {totalNeeded} consultants needed
                </p>
              </div>

              <Separator />

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Options</Label>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maxPerConsultant">Max assignments per consultant</Label>
                      <p className="text-xs text-muted-foreground">
                        Prevent over-scheduling a single consultant
                      </p>
                    </div>
                    <Input
                      id="maxPerConsultant"
                      type="number"
                      min={1}
                      max={20}
                      value={maxPerConsultant}
                      onChange={(e) => setMaxPerConsultant(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => previewMutation.mutate()}
                disabled={selectedRequirements.length === 0 || previewMutation.isPending}
              >
                {previewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Assignments
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "preview" && previewResult && (
          <>
            <div className="space-y-6 py-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Users className="w-6 h-6 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {previewResult.assignmentsMade}
                  </div>
                  <div className="text-xs text-muted-foreground">Will be assigned</div>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                  <div className="text-2xl font-bold text-amber-600">
                    {previewResult.conflictsFound}
                  </div>
                  <div className="text-xs text-muted-foreground">Conflicts found</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <XCircle className="w-6 h-6 mx-auto text-gray-500 mb-2" />
                  <div className="text-2xl font-bold text-gray-600">
                    {previewResult.skipped.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
              </div>

              {/* Assignments Preview */}
              {previewResult.assignments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Proposed Assignments</Label>
                  <ScrollArea className="h-32 border rounded-lg p-3">
                    {previewResult.assignments.map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <span className="text-sm font-mono">
                          {a.consultantId.slice(0, 12)}...
                        </span>
                        <Badge variant="secondary">Score: {a.score.toFixed(1)}</Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              {/* Skipped */}
              {previewResult.skipped.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-medium text-muted-foreground">
                    Skipped Consultants
                  </Label>
                  <ScrollArea className="h-24 border rounded-lg p-3 bg-muted/30">
                    {previewResult.skipped.map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <span className="text-sm font-mono text-muted-foreground">
                          {s.consultantId.slice(0, 12)}...
                        </span>
                        <span className="text-xs text-muted-foreground">{s.reason}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("config")}>
                Back
              </Button>
              <Button
                onClick={() => executeMutation.mutate()}
                disabled={previewResult.assignmentsMade === 0 || executeMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {executeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Confirm & Assign {previewResult.assignmentsMade}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "result" && previewResult && (
          <>
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Assignment Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Successfully assigned {previewResult.assignmentsMade} consultants to the project.
              </p>

              {previewResult.conflictsFound > 0 && (
                <p className="text-sm text-amber-600 mb-4">
                  {previewResult.conflictsFound} consultants were skipped due to conflicts.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{previewResult.assignmentsMade}</div>
                  <div className="text-xs text-muted-foreground">Assigned</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{previewResult.skipped.length}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
