import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Clock, Briefcase } from "lucide-react";

export interface ConsultantCardProps {
  consultant: {
    id: number | string;
    tngId: string | null;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    location: string | null;
    emrSystems: string[];
    modules: string[];
    yearsExperience: number;
    isAvailable: boolean;
    shiftPreference: string | null;
    averageRating: number | null;
  };
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0]?.toUpperCase() || '';
  const last = lastName?.[0]?.toUpperCase() || '';
  return first + last || 'C';
}

function getFullName(firstName: string | null, lastName: string | null): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unknown';
}

export function ConsultantCard({ consultant, onClick, viewMode = 'grid' }: ConsultantCardProps) {
  const initials = getInitials(consultant.firstName, consultant.lastName);
  const fullName = getFullName(consultant.firstName, consultant.lastName);
  const displayedEmrSystems = consultant.emrSystems?.slice(0, 3) || [];
  const remainingEmrCount = (consultant.emrSystems?.length || 0) - 3;

  if (viewMode === 'list') {
    return (
      <Card
        className="hover-elevate cursor-pointer"
        onClick={onClick}
        data-testid={`card-consultant-${consultant.id}`}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-12 w-12">
            {consultant.profileImageUrl && (
              <AvatarImage
                src={consultant.profileImageUrl}
                alt={fullName}
                data-testid={`avatar-consultant-${consultant.id}`}
              />
            )}
            <AvatarFallback data-testid={`avatar-fallback-${consultant.id}`}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold truncate" data-testid={`text-name-${consultant.id}`}>
                {fullName}
              </span>
              {consultant.tngId && (
                <Badge variant="outline" className="shrink-0" data-testid={`badge-tngid-${consultant.id}`}>
                  {consultant.tngId}
                </Badge>
              )}
              <Badge
                variant={consultant.isAvailable ? "default" : "secondary"}
                className="shrink-0"
                data-testid={`badge-availability-${consultant.id}`}
              >
                {consultant.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
              {consultant.location && (
                <span className="flex items-center gap-1" data-testid={`text-location-${consultant.id}`}>
                  <MapPin className="h-3 w-3" />
                  {consultant.location}
                </span>
              )}
              <span className="flex items-center gap-1" data-testid={`text-experience-${consultant.id}`}>
                <Briefcase className="h-3 w-3" />
                {consultant.yearsExperience} years
              </span>
              {consultant.shiftPreference && (
                <span className="flex items-center gap-1 capitalize" data-testid={`text-shift-${consultant.id}`}>
                  <Clock className="h-3 w-3" />
                  {consultant.shiftPreference}
                </span>
              )}
              {consultant.averageRating !== null && (
                <span className="flex items-center gap-1" data-testid={`text-rating-${consultant.id}`}>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {consultant.averageRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {displayedEmrSystems.map((emr, index) => (
              <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-emr-${consultant.id}-${index}`}>
                {emr}
              </Badge>
            ))}
            {remainingEmrCount > 0 && (
              <Badge variant="outline" className="text-xs" data-testid={`badge-emr-more-${consultant.id}`}>
                +{remainingEmrCount} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-consultant-${consultant.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {consultant.profileImageUrl && (
              <AvatarImage
                src={consultant.profileImageUrl}
                alt={fullName}
                data-testid={`avatar-consultant-${consultant.id}`}
              />
            )}
            <AvatarFallback data-testid={`avatar-fallback-${consultant.id}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate" data-testid={`text-name-${consultant.id}`}>
              {fullName}
            </div>
            {consultant.tngId && (
              <Badge variant="outline" className="text-xs mt-1" data-testid={`badge-tngid-${consultant.id}`}>
                {consultant.tngId}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {consultant.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-location-${consultant.id}`}>
            <MapPin className="h-4 w-4" />
            <span>{consultant.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-experience-${consultant.id}`}>
          <Briefcase className="h-4 w-4" />
          <span>{consultant.yearsExperience} years experience</span>
        </div>

        {consultant.averageRating !== null && (
          <div className="flex items-center gap-2 text-sm" data-testid={`text-rating-${consultant.id}`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{consultant.averageRating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={consultant.isAvailable ? "default" : "secondary"}
            data-testid={`badge-availability-${consultant.id}`}
          >
            {consultant.isAvailable ? "Available" : "Unavailable"}
          </Badge>
          {consultant.shiftPreference && (
            <Badge variant="outline" className="capitalize" data-testid={`badge-shift-${consultant.id}`}>
              {consultant.shiftPreference}
            </Badge>
          )}
        </div>

        {displayedEmrSystems.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayedEmrSystems.map((emr, index) => (
              <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-emr-${consultant.id}-${index}`}>
                {emr}
              </Badge>
            ))}
            {remainingEmrCount > 0 && (
              <Badge variant="outline" className="text-xs" data-testid={`badge-emr-more-${consultant.id}`}>
                +{remainingEmrCount} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ConsultantCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <Card data-testid="skeleton-consultant-card-list">
        <CardContent className="flex items-center gap-4 p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="skeleton-consultant-card-grid">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}
