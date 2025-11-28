import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  CheckCircle2, 
  User,
  Phone,
  Heart,
  Shirt,
  Globe,
  AlertCircle,
  Loader2,
  Calendar,
  X
} from "lucide-react";

const TSHIRT_SIZES = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
  { value: "3xl", label: "3XL" },
  { value: "4xl", label: "4XL" },
];

const COMMON_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin Chinese",
  "Cantonese",
  "Vietnamese",
  "Korean",
  "Japanese",
  "Arabic",
  "Hindi",
  "Portuguese",
  "Russian",
  "Italian",
  "Tagalog",
  "Polish",
  "American Sign Language (ASL)",
];

interface PersonalInfo {
  preferredName: string | null;
  birthday: string | null;
  tshirtSize: string | null;
  dietaryRestrictions: string | null;
  allergies: string | null;
  languages: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  personalInfoCompleted: boolean;
}

export default function PersonalInformation() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PersonalInfo>({
    preferredName: "",
    birthday: "",
    tshirtSize: "",
    dietaryRestrictions: "",
    allergies: "",
    languages: [],
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    personalInfoCompleted: false,
  });
  const [newLanguage, setNewLanguage] = useState("");

  const { data: personalInfo, isLoading } = useQuery<PersonalInfo>({
    queryKey: ["/api/personal-info"],
  });

  useEffect(() => {
    if (personalInfo) {
      setFormData({
        preferredName: personalInfo.preferredName || "",
        birthday: personalInfo.birthday || "",
        tshirtSize: personalInfo.tshirtSize || "",
        dietaryRestrictions: personalInfo.dietaryRestrictions || "",
        allergies: personalInfo.allergies || "",
        languages: personalInfo.languages || [],
        emergencyContactName: personalInfo.emergencyContactName || "",
        emergencyContactPhone: personalInfo.emergencyContactPhone || "",
        emergencyContactRelation: personalInfo.emergencyContactRelation || "",
        personalInfoCompleted: personalInfo.personalInfoCompleted || false,
      });
    }
  }, [personalInfo]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PersonalInfo>) => {
      return apiRequest("/api/personal-info", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-info"] });
      toast({
        title: "Saved",
        description: "Your personal information has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof PersonalInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLanguage = (lang: string) => {
    if (lang && !formData.languages.includes(lang)) {
      setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }));
    }
    setNewLanguage("");
  };

  const handleRemoveLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang),
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const isComplete = !!(formData.emergencyContactName && formData.emergencyContactPhone);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-personal-info">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl" data-testid="personal-info-page">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Personal Information</h1>
            <p className="text-muted-foreground mt-1">
              Update your personal details and emergency contact information
            </p>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"} data-testid="badge-completion-status">
            {isComplete ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Incomplete
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your personal preferences and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred Name / Nickname</Label>
                <Input
                  id="preferredName"
                  value={formData.preferredName || ""}
                  onChange={(e) => handleChange("preferredName", e.target.value)}
                  placeholder="What would you like to be called?"
                  data-testid="input-preferred-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday || ""}
                  onChange={(e) => handleChange("birthday", e.target.value)}
                  data-testid="input-birthday"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>T-Shirt Size</Label>
              <Select
                value={formData.tshirtSize || ""}
                onValueChange={(value) => handleChange("tshirtSize", value)}
              >
                <SelectTrigger data-testid="select-tshirt-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {TSHIRT_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Languages Spoken
            </CardTitle>
            <CardDescription>
              Languages you can communicate in professionally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`button-remove-language-${lang}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {formData.languages.length === 0 && (
                <span className="text-sm text-muted-foreground">No languages added yet</span>
              )}
            </div>

            <div className="flex gap-2">
              <Select
                value={newLanguage}
                onValueChange={(value) => {
                  handleAddLanguage(value);
                }}
              >
                <SelectTrigger className="flex-1" data-testid="select-add-language">
                  <SelectValue placeholder="Add a language..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_LANGUAGES.filter(l => !formData.languages.includes(l)).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Or type a language not in the list..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLanguage(newLanguage);
                  }
                }}
                data-testid="input-custom-language"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddLanguage(newLanguage)}
                disabled={!newLanguage}
                data-testid="button-add-custom-language"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dietary & Medical */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Dietary & Medical Information
            </CardTitle>
            <CardDescription>
              Important information for travel and event planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions || ""}
                onChange={(e) => handleChange("dietaryRestrictions", e.target.value)}
                placeholder="e.g., Vegetarian, Vegan, Kosher, Halal, Gluten-free..."
                rows={2}
                data-testid="textarea-dietary-restrictions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies || ""}
                onChange={(e) => handleChange("allergies", e.target.value)}
                placeholder="e.g., Peanuts, Shellfish, Latex..."
                rows={2}
                data-testid="textarea-allergies"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Emergency Contact
              <Badge variant="destructive" className="ml-2">Required</Badge>
            </CardTitle>
            <CardDescription>
              Person to contact in case of emergency during assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name *</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName || ""}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  placeholder="Full name"
                  data-testid="input-emergency-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  value={formData.emergencyContactPhone || ""}
                  onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                  placeholder="Phone number"
                  data-testid="input-emergency-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">Relationship</Label>
              <Select
                value={formData.emergencyContactRelation || ""}
                onValueChange={(value) => handleChange("emergencyContactRelation", value)}
              >
                <SelectTrigger data-testid="select-emergency-relation">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            size="lg"
            data-testid="button-save-personal-info"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Personal Information
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
