import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, Mail, ArrowLeft } from "lucide-react";
import { useMemo } from "react";

function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export default function AccessDenied() {
  const sanitizedReason = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const rawReason = params.get('reason') || 'You do not have access to this platform.';
    try {
      const decoded = decodeURIComponent(rawReason);
      return sanitizeText(decoded);
    } catch {
      return sanitizeText(rawReason);
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            NICEHR is an invitation-only platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground" data-testid="text-access-denied-reason">
              {sanitizedReason}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Need access?</p>
                <p className="text-sm text-muted-foreground">
                  Contact your organization administrator to request an invitation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              asChild
              data-testid="button-try-different-account"
            >
              <a href="/api/logout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try a different account
              </a>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            NICEHR Group - Healthcare Consultant Management Platform
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
