import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle2, 
  Clock, 
  FileText,
  GraduationCap,
  Briefcase,
  Award,
  Settings,
  Star,
  AlertCircle,
  Loader2
} from "lucide-react";
import debounce from "lodash.debounce";

const STEPS = [
  { id: "ehr_systems", label: "EHR Systems", icon: Briefcase, description: "Your experience with EHR systems" },
  { id: "clinical_modules", label: "Clinical Modules", icon: FileText, description: "Clinical application expertise" },
  { id: "revenue_cycle", label: "Revenue Cycle", icon: Star, description: "Revenue cycle management skills" },
  { id: "ancillary_systems", label: "Ancillary Systems", icon: Settings, description: "Ancillary and departmental systems" },
  { id: "technical_skills", label: "Technical Skills", icon: GraduationCap, description: "Technical implementation skills" },
  { id: "certifications", label: "Certifications", icon: Award, description: "Professional certifications" },
  { id: "work_preferences", label: "Work Preferences", icon: Clock, description: "Travel and scheduling preferences" },
];

const PROFICIENCY_LEVELS = [
  { value: "none", label: "No Experience", color: "bg-gray-100 text-gray-600" },
  { value: "beginner", label: "Beginner", color: "bg-blue-100 text-blue-700" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-700" },
  { value: "advanced", label: "Advanced", color: "bg-green-100 text-green-700" },
  { value: "expert", label: "Expert", color: "bg-purple-100 text-purple-700" },
];

const EHR_SYSTEMS = [
  "Epic",
  "Cerner/Oracle Health",
  "MEDITECH",
  "Allscripts",
  "NextGen",
  "athenahealth",
  "eClinicalWorks",
  "Veradigm",
  "CPSI/TruBridge",
  "MedHost",
  "Other",
];

interface SkillCategory {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  category: string;
  sortOrder: number | null;
  isActive: boolean;
  items: SkillItem[];
}

interface SkillItem {
  id: string;
  categoryId: string;
  name: string;
  displayName: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
}

interface ConsultantSkill {
  skillItemId: string;
  proficiency: string;
  yearsExperience: number;
  isCertified: boolean;
  certificationName?: string;
  notes?: string;
}

interface EhrExperience {
  id?: string;
  ehrSystem: string;
  yearsExperience: number;
  proficiency: string;
  isCertified: boolean;
  certifications: string[];
  projectCount: number;
}

interface WorkPreferences {
  travelWillingness: string;
  maxTravelPercentage: number;
  preferredRegions: string[];
  shiftPreference: string;
  remoteWorkPreference: string;
  weekendAvailability: boolean;
  holidayAvailability: boolean;
  longTermProjectPreference: boolean;
  shortNoticeAvailability: boolean;
  additionalNotes: string;
}

interface QuestionnaireResponse {
  id?: string;
  status: string;
  skills?: Array<{
    skillItemId: string;
    proficiency: string;
    yearsExperience?: number;
    isCertified?: boolean;
    certificationName?: string;
    notes?: string;
  }>;
  ehrExperience?: EhrExperience[];
  workPreferences?: Partial<WorkPreferences>;
  lastSavedAt?: string;
}

export default function SkillsQuestionnaire() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [skills, setSkills] = useState<Record<string, ConsultantSkill>>({});
  const [ehrExperience, setEhrExperience] = useState<EhrExperience[]>([]);
  const [workPreferences, setWorkPreferences] = useState<WorkPreferences>({
    travelWillingness: "willing",
    maxTravelPercentage: 75,
    preferredRegions: [],
    shiftPreference: "day",
    remoteWorkPreference: "hybrid",
    weekendAvailability: false,
    holidayAvailability: false,
    longTermProjectPreference: true,
    shortNoticeAvailability: false,
    additionalNotes: "",
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch skill categories and items
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<SkillCategory[]>({
    queryKey: ["/api/skills/all"],
  });

  // Fetch existing questionnaire data
  const { data: questionnaireData, isLoading: isLoadingQuestionnaire } = useQuery<QuestionnaireResponse | null>({
    queryKey: ["/api/questionnaire"],
  });

  // Load existing data when available
  useEffect(() => {
    if (questionnaireData) {
      // Load skills
      if (questionnaireData.skills) {
        const skillsMap: Record<string, ConsultantSkill> = {};
        questionnaireData.skills.forEach((s: any) => {
          skillsMap[s.skillItemId] = {
            skillItemId: s.skillItemId,
            proficiency: s.proficiency,
            yearsExperience: s.yearsExperience || 0,
            isCertified: s.isCertified || false,
            certificationName: s.certificationName,
            notes: s.notes,
          };
        });
        setSkills(skillsMap);
      }

      // Load EHR experience
      if (questionnaireData.ehrExperience) {
        setEhrExperience(questionnaireData.ehrExperience);
      }

      // Load work preferences
      if (questionnaireData.workPreferences) {
        setWorkPreferences({ ...workPreferences, ...questionnaireData.workPreferences });
      }

      if (questionnaireData.lastSavedAt) {
        setLastSaved(new Date(questionnaireData.lastSavedAt));
      }
    }
  }, [questionnaireData]);

  // Auto-save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSaving(true);
      try {
        await apiRequest("/api/questionnaire", "PATCH", data);
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
      }
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Skill save mutation
  const saveSkillMutation = useMutation({
    mutationFn: async (skill: ConsultantSkill) => {
      return apiRequest("/api/questionnaire/skills", "POST", skill);
    },
  });

  // EHR experience mutation
  const saveEhrMutation = useMutation({
    mutationFn: async (data: EhrExperience) => {
      return apiRequest("/api/questionnaire/ehr-experience", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire"] });
    },
  });

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce((data: any) => {
      saveMutation.mutate(data);
    }, 2000),
    []
  );

  // Save skill with auto-save
  const handleSkillChange = (skillItemId: string, field: keyof ConsultantSkill, value: any) => {
    const updatedSkill = {
      ...skills[skillItemId],
      skillItemId,
      [field]: value,
    };
    
    if (!updatedSkill.proficiency) {
      updatedSkill.proficiency = "none";
    }
    if (updatedSkill.yearsExperience === undefined) {
      updatedSkill.yearsExperience = 0;
    }
    if (updatedSkill.isCertified === undefined) {
      updatedSkill.isCertified = false;
    }

    setSkills(prev => ({
      ...prev,
      [skillItemId]: updatedSkill,
    }));

    // Auto-save skill
    saveSkillMutation.mutate(updatedSkill);
  };

  // Handle EHR experience change
  const handleEhrChange = (index: number, field: keyof EhrExperience, value: any) => {
    setEhrExperience(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addEhrExperience = () => {
    setEhrExperience(prev => [
      ...prev,
      {
        ehrSystem: "",
        yearsExperience: 0,
        proficiency: "none",
        isCertified: false,
        certifications: [],
        projectCount: 0,
      },
    ]);
  };

  const saveEhrExperience = (exp: EhrExperience) => {
    if (exp.ehrSystem) {
      saveEhrMutation.mutate(exp);
    }
  };

  const removeEhrExperience = async (index: number, id?: string) => {
    if (id) {
      await apiRequest(`/api/questionnaire/ehr-experience/${id}`, "DELETE");
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire"] });
    }
    setEhrExperience(prev => prev.filter((_, i) => i !== index));
  };

  // Handle work preferences change
  const handleWorkPreferenceChange = (field: keyof WorkPreferences, value: any) => {
    setWorkPreferences(prev => {
      const updated = { ...prev, [field]: value };
      debouncedSave({ workPreferences: updated });
      return updated;
    });
  };

  // Submit questionnaire
  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/questionnaire/submit", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire"] });
      toast({
        title: "Questionnaire submitted",
        description: "Your skills questionnaire has been submitted for review.",
      });
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Failed to submit questionnaire. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateProgress = () => {
    const filledSkills = Object.values(skills).filter(s => s.proficiency && s.proficiency !== "none").length;
    const totalItems = categoriesData?.reduce((acc, cat) => acc + cat.items.length, 0) || 1;
    return Math.round((filledSkills / totalItems) * 100);
  };

  const getCurrentCategory = () => {
    const stepConfig = STEPS[currentStep];
    return categoriesData?.find(c => c.category === stepConfig.id);
  };

  if (isLoadingCategories || isLoadingQuestionnaire) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentCategory = getCurrentCategory();
  const isWorkPreferencesStep = STEPS[currentStep].id === "work_preferences";
  const questionnaireStatus = questionnaireData?.status || "draft";
  const isSubmitted = questionnaireStatus === "submitted" || questionnaireStatus === "verified";

  return (
    <div className="container mx-auto py-6 max-w-6xl" data-testid="skills-questionnaire-page">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Skills Questionnaire</h1>
            <p className="text-muted-foreground mt-1">
              Help us match you with the right projects by sharing your expertise
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            )}
            <Badge 
              variant={questionnaireStatus === "verified" ? "default" : questionnaireStatus === "submitted" ? "secondary" : "outline"}
              data-testid="badge-questionnaire-status"
            >
              {questionnaireStatus === "verified" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {questionnaireStatus === "submitted" && <Clock className="h-3 w-3 mr-1" />}
              {questionnaireStatus.charAt(0).toUpperCase() + questionnaireStatus.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{calculateProgress()}% complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" data-testid="progress-questionnaire" />
          </CardContent>
        </Card>

        {/* Steps Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            
            return (
              <Button
                key={step.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(index)}
                className="flex-shrink-0"
                data-testid={`button-step-${step.id}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {step.label}
                {isCompleted && <CheckCircle2 className="h-3 w-3 ml-2 text-green-500" />}
              </Button>
            );
          })}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = STEPS[currentStep].icon;
                return <StepIcon className="h-5 w-5" />;
              })()}
              {STEPS[currentStep].label}
            </CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isWorkPreferencesStep ? (
              <WorkPreferencesSection
                preferences={workPreferences}
                onChange={handleWorkPreferenceChange}
                disabled={isSubmitted}
              />
            ) : STEPS[currentStep].id === "ehr_systems" ? (
              <EhrSystemsSection
                experiences={ehrExperience}
                onAdd={addEhrExperience}
                onChange={handleEhrChange}
                onSave={saveEhrExperience}
                onRemove={removeEhrExperience}
                disabled={isSubmitted}
              />
            ) : currentCategory ? (
              <SkillsSection
                category={currentCategory}
                skills={skills}
                onSkillChange={handleSkillChange}
                disabled={isSubmitted}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No data available for this section</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            data-testid="button-previous"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 && !isSubmitted && (
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                data-testid="button-submit"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Submit Questionnaire
              </Button>
            )}
            
            {currentStep < STEPS.length - 1 && (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                data-testid="button-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skills Section Component
function SkillsSection({
  category,
  skills,
  onSkillChange,
  disabled,
}: {
  category: SkillCategory;
  skills: Record<string, ConsultantSkill>;
  onSkillChange: (skillItemId: string, field: keyof ConsultantSkill, value: any) => void;
  disabled: boolean;
}) {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {category.items.map(item => {
          const skill = skills[item.id] || { proficiency: "none", yearsExperience: 0, isCertified: false };
          
          return (
            <div
              key={item.id}
              className="border rounded-lg p-4 space-y-3"
              data-testid={`skill-item-${item.id}`}
            >
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{item.displayName}</Label>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Proficiency Level</Label>
                  <Select
                    value={skill.proficiency}
                    onValueChange={(value) => onSkillChange(item.id, "proficiency", value)}
                    disabled={disabled}
                  >
                    <SelectTrigger data-testid={`select-proficiency-${item.id}`}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={skill.yearsExperience}
                    onChange={(e) => onSkillChange(item.id, "yearsExperience", parseInt(e.target.value) || 0)}
                    disabled={disabled}
                    data-testid={`input-years-${item.id}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Certified</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Checkbox
                      checked={skill.isCertified}
                      onCheckedChange={(checked) => onSkillChange(item.id, "isCertified", checked)}
                      disabled={disabled}
                      data-testid={`checkbox-certified-${item.id}`}
                    />
                    <span className="text-sm text-muted-foreground">I have certification</span>
                  </div>
                </div>
              </div>

              {skill.isCertified && (
                <div className="space-y-2">
                  <Label className="text-sm">Certification Name</Label>
                  <Input
                    placeholder="e.g., Epic Certified Professional"
                    value={skill.certificationName || ""}
                    onChange={(e) => onSkillChange(item.id, "certificationName", e.target.value)}
                    disabled={disabled}
                    data-testid={`input-cert-name-${item.id}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// EHR Systems Section Component
function EhrSystemsSection({
  experiences,
  onAdd,
  onChange,
  onSave,
  onRemove,
  disabled,
}: {
  experiences: EhrExperience[];
  onAdd: () => void;
  onChange: (index: number, field: keyof EhrExperience, value: any) => void;
  onSave: (exp: EhrExperience) => void;
  onRemove: (index: number, id?: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add your experience with different EHR systems
        </p>
        <Button onClick={onAdd} disabled={disabled} variant="outline" size="sm" data-testid="button-add-ehr">
          Add EHR System
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No EHR systems added yet</p>
          <Button onClick={onAdd} disabled={disabled} variant="ghost" size="sm">
            Add your first EHR system experience
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4" data-testid={`ehr-item-${index}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>EHR System</Label>
                  <Select
                    value={exp.ehrSystem}
                    onValueChange={(value) => {
                      onChange(index, "ehrSystem", value);
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger data-testid={`select-ehr-system-${index}`}>
                      <SelectValue placeholder="Select EHR system" />
                    </SelectTrigger>
                    <SelectContent>
                      {EHR_SYSTEMS.map(system => (
                        <SelectItem key={system} value={system}>
                          {system}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Proficiency Level</Label>
                  <Select
                    value={exp.proficiency}
                    onValueChange={(value) => onChange(index, "proficiency", value)}
                    disabled={disabled}
                  >
                    <SelectTrigger data-testid={`select-ehr-proficiency-${index}`}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={exp.yearsExperience}
                    onChange={(e) => onChange(index, "yearsExperience", parseInt(e.target.value) || 0)}
                    disabled={disabled}
                    data-testid={`input-ehr-years-${index}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Projects</Label>
                  <Input
                    type="number"
                    min="0"
                    value={exp.projectCount}
                    onChange={(e) => onChange(index, "projectCount", parseInt(e.target.value) || 0)}
                    disabled={disabled}
                    data-testid={`input-ehr-projects-${index}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={exp.isCertified}
                    onCheckedChange={(checked) => onChange(index, "isCertified", checked)}
                    disabled={disabled}
                    data-testid={`checkbox-ehr-certified-${index}`}
                  />
                  <Label className="text-sm">Certified in this system</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(index, exp.id)}
                  disabled={disabled}
                  data-testid={`button-remove-ehr-${index}`}
                >
                  Remove
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSave(exp)}
                  disabled={disabled || !exp.ehrSystem}
                  data-testid={`button-save-ehr-${index}`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Work Preferences Section Component
function WorkPreferencesSection({
  preferences,
  onChange,
  disabled,
}: {
  preferences: WorkPreferences;
  onChange: (field: keyof WorkPreferences, value: any) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Travel Willingness</Label>
          <Select
            value={preferences.travelWillingness}
            onValueChange={(value) => onChange("travelWillingness", value)}
            disabled={disabled}
          >
            <SelectTrigger data-testid="select-travel-willingness">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_willing">Not Willing to Travel</SelectItem>
              <SelectItem value="local_only">Local Only (within 50 miles)</SelectItem>
              <SelectItem value="regional">Regional (within state)</SelectItem>
              <SelectItem value="willing">Willing to Travel</SelectItem>
              <SelectItem value="prefer_travel">Prefer Travel Assignments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Maximum Travel Percentage</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0"
              max="100"
              value={preferences.maxTravelPercentage}
              onChange={(e) => onChange("maxTravelPercentage", parseInt(e.target.value) || 0)}
              disabled={disabled}
              className="w-24"
              data-testid="input-max-travel"
            />
            <span className="text-sm text-muted-foreground">% of time</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Shift Preference</Label>
          <Select
            value={preferences.shiftPreference}
            onValueChange={(value) => onChange("shiftPreference", value)}
            disabled={disabled}
          >
            <SelectTrigger data-testid="select-shift-preference">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day Shift (7am-3pm)</SelectItem>
              <SelectItem value="evening">Evening Shift (3pm-11pm)</SelectItem>
              <SelectItem value="night">Night Shift (11pm-7am)</SelectItem>
              <SelectItem value="flexible">Flexible / Any Shift</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Remote Work Preference</Label>
          <Select
            value={preferences.remoteWorkPreference}
            onValueChange={(value) => onChange("remoteWorkPreference", value)}
            disabled={disabled}
          >
            <SelectTrigger data-testid="select-remote-preference">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onsite_only">On-site Only</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="remote_preferred">Remote Preferred</SelectItem>
              <SelectItem value="remote_only">Remote Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Availability Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={preferences.weekendAvailability}
              onCheckedChange={(checked) => onChange("weekendAvailability", checked)}
              disabled={disabled}
              data-testid="checkbox-weekend"
            />
            <Label className="text-sm">Available for weekend work</Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={preferences.holidayAvailability}
              onCheckedChange={(checked) => onChange("holidayAvailability", checked)}
              disabled={disabled}
              data-testid="checkbox-holiday"
            />
            <Label className="text-sm">Available for holiday work</Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={preferences.longTermProjectPreference}
              onCheckedChange={(checked) => onChange("longTermProjectPreference", checked)}
              disabled={disabled}
              data-testid="checkbox-long-term"
            />
            <Label className="text-sm">Prefer long-term projects (6+ months)</Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={preferences.shortNoticeAvailability}
              onCheckedChange={(checked) => onChange("shortNoticeAvailability", checked)}
              disabled={disabled}
              data-testid="checkbox-short-notice"
            />
            <Label className="text-sm">Available for short-notice assignments</Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Additional Notes</Label>
        <Textarea
          placeholder="Any additional preferences or constraints we should know about..."
          value={preferences.additionalNotes}
          onChange={(e) => onChange("additionalNotes", e.target.value)}
          disabled={disabled}
          rows={4}
          data-testid="textarea-additional-notes"
        />
      </div>
    </div>
  );
}
