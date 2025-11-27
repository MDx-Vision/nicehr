import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, Lock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AccessControlledRouteProps {
  children: ReactNode;
  pageKey?: string;
  requiredRoles?: string[];
  requireAuth?: boolean;
  fallback?: ReactNode;
}

function AccessDeniedCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof ShieldX;
}) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle data-testid="text-access-denied-title">{title}</CardTitle>
          <CardDescription data-testid="text-access-denied-description">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            data-testid="button-go-back"
          >
            Go Back
          </Button>
          <Button
            onClick={() => setLocation("/")}
            data-testid="button-go-home"
          >
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-96 mb-2" />
      <Skeleton className="h-4 w-80 mb-8" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export function AccessControlledRoute({
  children,
  pageKey,
  requiredRoles,
  requireAuth = false,
  fallback,
}: AccessControlledRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { permissions, isLoading: permissionsLoading, hasPageAccess, canAccessRole } = usePermissions();

  if (authLoading || permissionsLoading) {
    return fallback || <LoadingSkeleton />;
  }

  if (requireAuth && !user) {
    return (
      <AccessDeniedCard
        title="Authentication Required"
        description="Please sign in to access this page."
        icon={Lock}
      />
    );
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!user) {
      return (
        <AccessDeniedCard
          title="Authentication Required"
          description="Please sign in to access this page."
          icon={Lock}
        />
      );
    }
    if (!canAccessRole(requiredRoles)) {
      return (
        <AccessDeniedCard
          title="Access Denied"
          description={`This page requires one of the following roles: ${requiredRoles.join(", ")}`}
          icon={ShieldX}
        />
      );
    }
  }

  if (pageKey && !hasPageAccess(pageKey)) {
    return (
      <AccessDeniedCard
        title="Content Restricted"
        description="You do not have permission to access this content."
        icon={AlertTriangle}
      />
    );
  }

  return <>{children}</>;
}

export function ProtectedFeature({
  children,
  featureKey,
  fallback,
}: {
  children: ReactNode;
  featureKey: string;
  fallback?: ReactNode;
}) {
  const { hasFeatureAccess, isLoading } = usePermissions();

  if (isLoading) {
    return fallback || null;
  }

  if (!hasFeatureAccess(featureKey)) {
    return fallback || null;
  }

  return <>{children}</>;
}
