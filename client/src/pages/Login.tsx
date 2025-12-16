import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      setErrorMessage(null);
      toast({
        title: "Welcome back",
        description: `Signed in as ${data.user?.email || email}`,
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      const message = error.message || "Incorrect email or password";
      setErrorMessage(message);
      toast({
        title: "Unable to sign in",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[340px] px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-[34px] font-bold tracking-[-0.02em] text-foreground mb-2"
            data-testid="text-login-title"
          >
            Sign In
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Enter your credentials to continue
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
            role="alert"
            data-testid="error-message"
          >
            <p className="text-[13px] text-destructive text-center">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[13px] font-medium text-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
              className="h-11 rounded-lg border-border bg-card text-[15px] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[13px] font-medium text-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
                className="h-11 rounded-lg border-border bg-card text-[15px] placeholder:text-muted-foreground pr-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password-visibility"
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              data-testid="button-login"
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-medium transition-all"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Just a moment...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
