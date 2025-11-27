import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Star,
  Clock,
  Briefcase,
  Mail,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Linkedin,
  Globe,
} from "lucide-react";
import type { Consultant } from "@shared/schema";

interface ConsultantProfile {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    coverPhotoUrl: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
  };
  consultant: Consultant;
  documents: {
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    total: number;
  };
  ratings: {
    averageOverall: number | null;
    averageMannerism: number | null;
    averageProfessionalism: number | null;
    averageKnowledge: number | null;
    count: number;
  };
}

export interface ConsultantDetailModalProps {
  consultantId: number | string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0]?.toUpperCase() || "";
  const last = lastName?.[0]?.toUpperCase() || "";
  return first + last || "C";
}

function getFullName(firstName: string | null, lastName: string | null): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6" data-testid="modal-loading-skeleton">
      <div className="relative">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
      </div>

      <div className="pt-10 text-center space-y-2">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-5 w-24 mx-auto" />
      </div>

      <div className="flex justify-center gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>

      <Separator />

      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ConsultantDetailModal({
  consultantId,
  open,
  onOpenChange,
}: ConsultantDetailModalProps) {
  const { data: profile, isLoading } = useQuery<ConsultantProfile>({
    queryKey: ["/api/consultants", consultantId, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/consultants/${consultantId}/profile`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch consultant profile");
      return res.json();
    },
    enabled: open && consultantId !== null,
  });

  const fullName = profile
    ? getFullName(profile.user.firstName, profile.user.lastName)
    : "";
  const initials = profile
    ? getInitials(profile.user.firstName, profile.user.lastName)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] p-0 overflow-hidden"
        data-testid="dialog-consultant-detail"
      >
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {isLoading || !profile ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  {profile.user.coverPhotoUrl ? (
                    <img
                      src={profile.user.coverPhotoUrl}
                      alt="Cover"
                      className="h-32 w-full object-cover rounded-lg"
                      data-testid="img-cover-photo"
                    />
                  ) : (
                    <div
                      className="h-32 w-full rounded-lg bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10"
                      data-testid="cover-gradient-fallback"
                    />
                  )}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <Avatar className="h-20 w-20 border-4 border-background">
                      {profile.user.profileImageUrl && (
                        <AvatarImage
                          src={profile.user.profileImageUrl}
                          alt={fullName}
                          data-testid="avatar-profile"
                        />
                      )}
                      <AvatarFallback
                        className="text-xl"
                        data-testid="avatar-fallback"
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <DialogHeader className="pt-12 text-center">
                  <DialogTitle
                    className="text-2xl"
                    data-testid="text-consultant-name"
                  >
                    {fullName}
                  </DialogTitle>
                  {profile.consultant.tngId && (
                    <Badge
                      variant="outline"
                      className="mx-auto mt-2"
                      data-testid="badge-tng-id"
                    >
                      {profile.consultant.tngId}
                    </Badge>
                  )}
                </DialogHeader>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                  {profile.user.email && (
                    <a
                      href={`mailto:${profile.user.email}`}
                      className="flex items-center gap-1 hover:text-foreground"
                      data-testid="link-email"
                    >
                      <Mail className="h-4 w-4" />
                      {profile.user.email}
                    </a>
                  )}
                  {profile.user.linkedinUrl && (
                    <a
                      href={profile.user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground"
                      data-testid="link-linkedin"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profile.user.websiteUrl && (
                    <a
                      href={profile.user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground"
                      data-testid="link-website"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="text-center p-3 rounded-lg bg-muted/50"
                    data-testid="stat-experience"
                  >
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="text-lg font-semibold">
                      {profile.consultant.yearsExperience || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Years Exp
                    </div>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg bg-muted/50"
                    data-testid="stat-rating"
                  >
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="text-lg font-semibold">
                      {profile.ratings.averageOverall
                        ? profile.ratings.averageOverall.toFixed(1)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Rating
                    </div>
                  </div>
                  <div
                    className="text-center p-3 rounded-lg bg-muted/50"
                    data-testid="stat-documents"
                  >
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="text-lg font-semibold">
                      {profile.documents.total}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Documents
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profile.consultant.location && (
                      <div
                        className="flex items-center gap-2 text-sm"
                        data-testid="detail-location"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.consultant.location}</span>
                      </div>
                    )}
                    {profile.consultant.shiftPreference && (
                      <div
                        className="flex items-center gap-2 text-sm"
                        data-testid="detail-shift"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">
                          {profile.consultant.shiftPreference} shift
                        </span>
                      </div>
                    )}
                    <div
                      className="flex items-center gap-2 text-sm"
                      data-testid="detail-availability"
                    >
                      <Badge
                        variant={
                          profile.consultant.isAvailable
                            ? "default"
                            : "secondary"
                        }
                      >
                        {profile.consultant.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </Badge>
                    </div>
                    {profile.consultant.isOnboarded && (
                      <div
                        className="flex items-center gap-2 text-sm"
                        data-testid="detail-onboarded"
                      >
                        <Badge variant="outline">Onboarded</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {profile.consultant.emrSystems &&
                  profile.consultant.emrSystems.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        EMR Systems
                      </h3>
                      <div
                        className="flex flex-wrap gap-2"
                        data-testid="section-emr-systems"
                      >
                        {profile.consultant.emrSystems.map((emr, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            data-testid={`badge-emr-${index}`}
                          >
                            {emr}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {profile.consultant.modules &&
                  profile.consultant.modules.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Modules
                      </h3>
                      <div
                        className="flex flex-wrap gap-2"
                        data-testid="section-modules"
                      >
                        {profile.consultant.modules.map((mod, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            data-testid={`badge-module-${index}`}
                          >
                            {mod}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Documents Summary
                  </h3>
                  <div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                    data-testid="section-documents-summary"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span data-testid="docs-approved">
                        {profile.documents.approved} Approved
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span data-testid="docs-pending">
                        {profile.documents.pending} Pending
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span data-testid="docs-rejected">
                        {profile.documents.rejected} Rejected
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-orange-500" />
                      <span data-testid="docs-expired">
                        {profile.documents.expired} Expired
                      </span>
                    </div>
                  </div>
                </div>

                {profile.ratings.count > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Ratings Breakdown ({profile.ratings.count} reviews)
                      </h3>
                      <div
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                        data-testid="section-ratings"
                      >
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div
                            className="font-semibold"
                            data-testid="rating-overall"
                          >
                            {profile.ratings.averageOverall?.toFixed(1) ||
                              "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Overall
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div
                            className="font-semibold"
                            data-testid="rating-mannerism"
                          >
                            {profile.ratings.averageMannerism?.toFixed(1) ||
                              "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Mannerism
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div
                            className="font-semibold"
                            data-testid="rating-professionalism"
                          >
                            {profile.ratings.averageProfessionalism?.toFixed(
                              1
                            ) || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Professional
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div
                            className="font-semibold"
                            data-testid="rating-knowledge"
                          >
                            {profile.ratings.averageKnowledge?.toFixed(1) ||
                              "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Knowledge
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {profile.consultant.bio && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Bio
                      </h3>
                      <p
                        className="text-sm text-muted-foreground"
                        data-testid="text-bio"
                      >
                        {profile.consultant.bio}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
