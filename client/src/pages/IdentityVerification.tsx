import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  User,
  FileCheck,
  Upload,
  Camera,
  CreditCard,
  Calendar,
  Eye,
  AlertTriangle,
  Flag,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Image,
  Loader2
} from "lucide-react";
import type {
  IdentityVerification,
  IdentityVerificationWithDetails,
  IdentityDocument,
  VerificationEvent,
  FraudFlag,
  FraudFlagWithDetails
} from "@shared/schema";

const VERIFICATION_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  in_review: { label: "In Review", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Eye },
  verified: { label: "Verified", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: ShieldCheck },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: ShieldX },
  expired: { label: "Expired", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", icon: AlertCircle },
};

const DOCUMENT_TYPES = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "state_id", label: "State ID" },
  { value: "military_id", label: "Military ID" },
];

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const EVENT_ICONS = {
  submitted: FileCheck,
  document_uploaded: Upload,
  reviewed: Eye,
  verified: CheckCircle2,
  rejected: XCircle,
  resubmitted: RefreshCw,
  expired: AlertCircle,
};

interface VerificationStats {
  pending: number;
  in_review: number;
  verified: number;
  rejected: number;
  expired: number;
  unresolvedFlags: number;
}

function StatusBadge({ status }: { status: string }) {
  const config = VERIFICATION_STATUSES[status as keyof typeof VERIFICATION_STATUSES];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  const Icon = config.icon;
  return (
    <Badge className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || "bg-gray-100 text-gray-800";
  return <Badge className={color}>{severity}</Badge>;
}

function VerificationStatusCard({ verification }: { verification: IdentityVerificationWithDetails | null }) {
  if (!verification) {
    return (
      <Card data-testid="card-no-verification">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>You haven't started identity verification yet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete identity verification to unlock all platform features. This helps us ensure the security and trust of our community.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = VERIFICATION_STATUSES[verification.status as keyof typeof VERIFICATION_STATUSES];
  const StatusIcon = statusConfig?.icon || Shield;

  return (
    <Card data-testid="card-verification-status">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              verification.status === "verified" ? "bg-green-100 dark:bg-green-900/30" :
              verification.status === "rejected" ? "bg-red-100 dark:bg-red-900/30" :
              verification.status === "pending" || verification.status === "in_review" ? "bg-blue-100 dark:bg-blue-900/30" :
              "bg-orange-100 dark:bg-orange-900/30"
            }`}>
              <StatusIcon className={`w-6 h-6 ${
                verification.status === "verified" ? "text-green-600" :
                verification.status === "rejected" ? "text-red-600" :
                verification.status === "pending" || verification.status === "in_review" ? "text-blue-600" :
                "text-orange-600"
              }`} />
            </div>
            <div>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>
                {verification.status === "verified" && "Your identity has been verified"}
                {verification.status === "pending" && "Your verification is pending review"}
                {verification.status === "in_review" && "Your verification is being reviewed"}
                {verification.status === "rejected" && "Your verification was rejected"}
                {verification.status === "expired" && "Your verification has expired"}
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={verification.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {verification.status === "verified" && verification.expiresAt && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Expires: {format(new Date(verification.expiresAt), "MMM d, yyyy")}</span>
          </div>
        )}
        
        {verification.status === "rejected" && verification.rejectionReason && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
            <p className="text-sm text-muted-foreground mt-1">{verification.rejectionReason}</p>
          </div>
        )}

        {verification.identityScore !== null && verification.identityScore !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Identity Confidence Score</span>
              <span className="font-medium">{verification.identityScore}%</span>
            </div>
            <Progress value={verification.identityScore} className="h-2" />
          </div>
        )}

        {verification.documents && verification.documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Documents Submitted</p>
            <div className="flex flex-wrap gap-2">
              {verification.documents.map((doc) => (
                <Badge key={doc.id} variant="outline">
                  <CreditCard className="w-3 h-3 mr-1" />
                  {DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentType}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getEventDetailsMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const detailsObj = details as Record<string, unknown>;
  if (typeof detailsObj.message === "string") {
    return detailsObj.message;
  }
  return JSON.stringify(details);
}

function VerificationTimeline({ events }: { events: VerificationEvent[] }) {
  if (!events || events.length === 0) {
    return null;
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return (
    <Card data-testid="card-verification-timeline">
      <CardHeader>
        <CardTitle className="text-base">Verification Timeline</CardTitle>
        <CardDescription>History of verification events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const EventIcon = EVENT_ICONS[event.eventType as keyof typeof EVENT_ICONS] || FileCheck;
            return (
              <div key={event.id} className="flex gap-3" data-testid={`timeline-event-${event.id}`}>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <EventIcon className="w-4 h-4" />
                  </div>
                  {index < sortedEvents.length - 1 && (
                    <div className="w-px h-full bg-border flex-1 mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium capitalize">{event.eventType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.createdAt && format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  {getEventDetailsMessage(event.details) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {getEventDetailsMessage(event.details)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface WizardData {
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  ssn4: string;
  documentType: string;
  frontImage: string | null;
  backImage: string | null;
  selfieImage: string | null;
  confirmed: boolean;
}

function VerificationWizard({ onComplete }: { onComplete: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    legalFirstName: "",
    legalLastName: "",
    dateOfBirth: "",
    ssn4: "",
    documentType: "drivers_license",
    frontImage: null,
    backImage: null,
    selfieImage: null,
    confirmed: false,
  });
  const [isUploading, setIsUploading] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/identity/verifications", {
        legalFirstName: data.legalFirstName,
        legalLastName: data.legalLastName,
        dateOfBirth: data.dateOfBirth,
        ssn4: data.ssn4 || null,
        documentType: data.documentType,
        frontImageUrl: data.frontImage,
        backImageUrl: data.backImage,
        selfieImageUrl: data.selfieImage,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/identity/me"] });
      toast({ title: "Verification submitted successfully" });
      onComplete();
    },
    onError: () => {
      toast({ title: "Failed to submit verification", variant: "destructive" });
    },
  });

  const handleFileChange = async (type: "frontImage" | "backImage" | "selfieImage", file: File | null) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setData(prev => ({ ...prev, [type]: reader.result as string }));
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({ title: "Failed to read file", variant: "destructive" });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Failed to process file", variant: "destructive" });
      setIsUploading(false);
    }
  };

  const canProceedStep1 = data.legalFirstName && data.legalLastName && data.dateOfBirth;
  const canProceedStep2 = data.frontImage && data.selfieImage;
  const canSubmit = data.confirmed;

  return (
    <Card data-testid="card-verification-wizard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Identity Verification
        </CardTitle>
        <CardDescription>Complete the following steps to verify your identity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === step
                    ? "bg-primary text-primary-foreground"
                    : s < step
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${s < step ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="legalFirstName">Legal First Name *</Label>
                <Input
                  id="legalFirstName"
                  value={data.legalFirstName}
                  onChange={(e) => setData(prev => ({ ...prev, legalFirstName: e.target.value }))}
                  placeholder="Enter your legal first name"
                  data-testid="input-legal-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalLastName">Legal Last Name *</Label>
                <Input
                  id="legalLastName"
                  value={data.legalLastName}
                  onChange={(e) => setData(prev => ({ ...prev, legalLastName: e.target.value }))}
                  placeholder="Enter your legal last name"
                  data-testid="input-legal-last-name"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => setData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  data-testid="input-date-of-birth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssn4">Last 4 of SSN (Optional)</Label>
                <Input
                  id="ssn4"
                  maxLength={4}
                  value={data.ssn4}
                  onChange={(e) => setData(prev => ({ ...prev, ssn4: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  placeholder="XXXX"
                  data-testid="input-ssn4"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">Document Upload</h3>
            
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select
                value={data.documentType}
                onValueChange={(value) => setData(prev => ({ ...prev, documentType: value }))}
              >
                <SelectTrigger data-testid="select-document-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Front of Document *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover-elevate transition-colors ${
                    data.frontImage ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-muted-foreground/25"
                  }`}
                  onClick={() => document.getElementById("frontImage")?.click()}
                >
                  {data.frontImage ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                      <p className="text-sm text-green-600">Image uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  )}
                  <input
                    id="frontImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange("frontImage", e.target.files?.[0] || null)}
                    data-testid="input-front-image"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Back of Document</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover-elevate transition-colors ${
                    data.backImage ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-muted-foreground/25"
                  }`}
                  onClick={() => document.getElementById("backImage")?.click()}
                >
                  {data.backImage ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                      <p className="text-sm text-green-600">Image uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  )}
                  <input
                    id="backImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange("backImage", e.target.files?.[0] || null)}
                    data-testid="input-back-image"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selfie Photo *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover-elevate transition-colors ${
                    data.selfieImage ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-muted-foreground/25"
                  }`}
                  onClick={() => document.getElementById("selfieImage")?.click()}
                >
                  {data.selfieImage ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                      <p className="text-sm text-green-600">Photo uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Take a selfie</p>
                    </div>
                  )}
                  <input
                    id="selfieImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange("selfieImage", e.target.files?.[0] || null)}
                    data-testid="input-selfie-image"
                  />
                </div>
              </div>
            </div>
            
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing image...
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">Review & Submit</h3>
            
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-medium">Personal Information</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legal Name:</span>
                  <span>{data.legalFirstName} {data.legalLastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span>{data.dateOfBirth ? format(new Date(data.dateOfBirth), "MMM d, yyyy") : "-"}</span>
                </div>
                {data.ssn4 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SSN (Last 4):</span>
                    <span>****{data.ssn4}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-medium">Documents</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Type:</span>
                  <span>{DOCUMENT_TYPES.find(t => t.value === data.documentType)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Front Image:</span>
                  <span className={data.frontImage ? "text-green-600" : "text-red-600"}>
                    {data.frontImage ? "Uploaded" : "Missing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Back Image:</span>
                  <span className={data.backImage ? "text-green-600" : "text-muted-foreground"}>
                    {data.backImage ? "Uploaded" : "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selfie:</span>
                  <span className={data.selfieImage ? "text-green-600" : "text-red-600"}>
                    {data.selfieImage ? "Uploaded" : "Missing"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="confirm"
                checked={data.confirmed}
                onCheckedChange={(checked) => setData(prev => ({ ...prev, confirmed: !!checked }))}
                data-testid="checkbox-confirm"
              />
              <label htmlFor="confirm" className="text-sm text-muted-foreground leading-tight">
                I confirm that all information provided is accurate and the documents belong to me. 
                I understand that providing false information may result in account suspension.
              </label>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            data-testid="button-previous"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
        )}
        {step < 3 ? (
          <Button
            className="ml-auto"
            onClick={() => setStep(step + 1)}
            disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
            data-testid="button-next"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            className="ml-auto"
            onClick={() => submitMutation.mutate()}
            disabled={!canSubmit || submitMutation.isPending}
            data-testid="button-submit-verification"
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Verification
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ConsultantView() {
  const [showWizard, setShowWizard] = useState(false);

  const { data: verification, isLoading } = useQuery<IdentityVerificationWithDetails>({
    queryKey: ["/api/identity/me"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const canStartVerification = !verification || 
    verification.status === "rejected" || 
    verification.status === "expired";

  return (
    <div className="space-y-6">
      {showWizard && canStartVerification ? (
        <VerificationWizard onComplete={() => setShowWizard(false)} />
      ) : (
        <>
          <VerificationStatusCard verification={verification || null} />
          
          {canStartVerification && (
            <Button onClick={() => setShowWizard(true)} data-testid="button-start-verification">
              <Shield className="w-4 h-4 mr-2" />
              {verification?.status === "rejected" ? "Resubmit Verification" : 
               verification?.status === "expired" ? "Renew Verification" : 
               "Start Verification"}
            </Button>
          )}
          
          {verification?.events && (
            <VerificationTimeline events={verification.events} />
          )}
        </>
      )}
    </div>
  );
}

function AdminDashboardStats({ stats }: { stats: VerificationStats | null }) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
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
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Card data-testid="stat-pending">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card data-testid="stat-in-review">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Review</CardTitle>
          <Eye className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.in_review}</div>
        </CardContent>
      </Card>

      <Card data-testid="stat-verified">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
        </CardContent>
      </Card>

      <Card data-testid="stat-rejected">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <ShieldX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </CardContent>
      </Card>

      <Card data-testid="stat-expired">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expired</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
        </CardContent>
      </Card>

      <Card data-testid="stat-fraud-flags">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fraud Flags</CardTitle>
          <Flag className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.unresolvedFlags}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function VerificationQueue() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedVerification, setSelectedVerification] = useState<IdentityVerificationWithDetails | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: verifications, isLoading } = useQuery<IdentityVerificationWithDetails[]>({
    queryKey: ["/api/identity/verifications", statusFilter],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: string; notes?: string }) => {
      return await apiRequest("POST", `/api/identity/verifications/${id}/review`, {
        action,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/identity/verifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/identity/stats"] });
      toast({ title: "Review submitted successfully" });
      setSelectedVerification(null);
      setReviewNotes("");
    },
    onError: () => {
      toast({ title: "Failed to submit review", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {verifications && verifications.length > 0 ? (
        <div className="space-y-3">
          {verifications.map((v) => (
            <Card
              key={v.id}
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedVerification(v)}
              data-testid={`verification-item-${v.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {v.user?.firstName} {v.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{v.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {v.createdAt && format(new Date(v.createdAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.documents?.length || 0} document(s)
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No verifications found</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
            <DialogDescription>
              Review the submitted verification documents and information
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedVerification.user?.firstName} {selectedVerification.user?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedVerification.user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Legal Name:</span>
                      <span>{selectedVerification.legalFirstName} {selectedVerification.legalLastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DOB:</span>
                      <span>{selectedVerification.dateOfBirth && format(new Date(selectedVerification.dateOfBirth), "MMM d, yyyy")}</span>
                    </div>
                    {selectedVerification.ssn4 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SSN (Last 4):</span>
                        <span>****{selectedVerification.ssn4}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Verification Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={selectedVerification.status} />
                    </div>
                    {selectedVerification.identityScore !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Identity Score:</span>
                        <span>{selectedVerification.identityScore}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{selectedVerification.createdAt && format(new Date(selectedVerification.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Documents</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  {selectedVerification.documents?.map((doc) => (
                    <div key={doc.id} className="space-y-2">
                      <Badge variant="outline">
                        {DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentType}
                      </Badge>
                      {doc.frontImageUrl && (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <img
                            src={doc.frontImageUrl}
                            alt="Document front"
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                      )}
                      {doc.selfieImageUrl && (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <img
                            src={doc.selfieImageUrl}
                            alt="Selfie"
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedVerification.fraudFlags && selectedVerification.fraudFlags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Fraud Flags
                    </h4>
                    <div className="space-y-2">
                      {selectedVerification.fraudFlags.map((flag) => (
                        <div key={flag.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={flag.severity} />
                            <span className="font-medium capitalize">{flag.flagType.replace(/_/g, " ")}</span>
                          </div>
                          {flag.description && (
                            <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes for this review..."
                  data-testid="input-review-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedVerification) {
                  reviewMutation.mutate({
                    id: selectedVerification.id,
                    action: "request_resubmit",
                    notes: reviewNotes,
                  });
                }
              }}
              disabled={reviewMutation.isPending}
              data-testid="button-request-resubmit"
            >
              Request Resubmit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedVerification) {
                  reviewMutation.mutate({
                    id: selectedVerification.id,
                    action: "reject",
                    notes: reviewNotes,
                  });
                }
              }}
              disabled={reviewMutation.isPending}
              data-testid="button-reject"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedVerification) {
                  reviewMutation.mutate({
                    id: selectedVerification.id,
                    action: "approve",
                    notes: reviewNotes,
                  });
                }
              }}
              disabled={reviewMutation.isPending}
              data-testid="button-approve"
            >
              {reviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FraudFlagsTab() {
  const { toast } = useToast();
  const [selectedFlag, setSelectedFlag] = useState<FraudFlagWithDetails | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: flags, isLoading } = useQuery<FraudFlagWithDetails[]>({
    queryKey: ["/api/identity/fraud-flags"],
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return await apiRequest("PATCH", `/api/identity/fraud-flags/${id}`, {
        isResolved: true,
        resolutionNotes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/identity/fraud-flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/identity/stats"] });
      toast({ title: "Flag resolved successfully" });
      setSelectedFlag(null);
      setResolutionNotes("");
    },
    onError: () => {
      toast({ title: "Failed to resolve flag", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const unresolvedFlags = flags?.filter(f => !f.isResolved) || [];
  const resolvedFlags = flags?.filter(f => f.isResolved) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Unresolved Flags ({unresolvedFlags.length})
        </h3>

        {unresolvedFlags.length > 0 ? (
          <div className="space-y-3">
            {unresolvedFlags.map((flag) => (
              <Card key={flag.id} data-testid={`fraud-flag-${flag.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={flag.severity} />
                        <span className="font-medium capitalize">{flag.flagType.replace(/_/g, " ")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                      <p className="text-xs text-muted-foreground">
                        User: {flag.user?.firstName} {flag.user?.lastName} ({flag.user?.email})
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFlag(flag)}
                      data-testid={`button-resolve-flag-${flag.id}`}
                    >
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">No unresolved fraud flags</p>
            </CardContent>
          </Card>
        )}
      </div>

      {resolvedFlags.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-muted-foreground">
            Resolved Flags ({resolvedFlags.length})
          </h3>
          <div className="space-y-3">
            {resolvedFlags.map((flag) => (
              <Card key={flag.id} className="opacity-60" data-testid={`resolved-flag-${flag.id}`}>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={flag.severity} />
                      <span className="font-medium capitalize">{flag.flagType.replace(/_/g, " ")}</span>
                      <Badge variant="outline" className="ml-auto">Resolved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                    {flag.resolutionNotes && (
                      <p className="text-sm italic">Resolution: {flag.resolutionNotes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!selectedFlag} onOpenChange={() => setSelectedFlag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Fraud Flag</DialogTitle>
            <DialogDescription>
              Provide notes explaining how this flag was investigated and resolved.
            </DialogDescription>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={selectedFlag.severity} />
                  <span className="font-medium capitalize">{selectedFlag.flagType.replace(/_/g, " ")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedFlag.description}</p>
                <p className="text-sm">
                  User: {selectedFlag.user?.firstName} {selectedFlag.user?.lastName}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolutionNotes">Resolution Notes *</Label>
                <Textarea
                  id="resolutionNotes"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how this flag was investigated and resolved..."
                  required
                  data-testid="input-resolution-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFlag(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedFlag && resolutionNotes) {
                  resolveMutation.mutate({
                    id: selectedFlag.id,
                    notes: resolutionNotes,
                  });
                }
              }}
              disabled={!resolutionNotes || resolveMutation.isPending}
              data-testid="button-confirm-resolve"
            >
              {resolveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminView() {
  const { data: stats, isLoading: statsLoading } = useQuery<VerificationStats>({
    queryKey: ["/api/identity/stats"],
  });

  return (
    <div className="space-y-6">
      <AdminDashboardStats stats={stats || null} />

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue" data-testid="tab-verification-queue">
            Verification Queue
          </TabsTrigger>
          <TabsTrigger value="fraud" data-testid="tab-fraud-flags">
            Fraud Flags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <VerificationQueue />
        </TabsContent>

        <TabsContent value="fraud" className="mt-4">
          <FraudFlagsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function IdentityVerification() {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          {isAdmin ? "Identity Verification Management" : "Identity Verification"}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Review and manage identity verifications"
            : "Verify your identity to access all platform features"}
        </p>
      </div>

      {isAdmin ? <AdminView /> : <ConsultantView />}
    </div>
  );
}
