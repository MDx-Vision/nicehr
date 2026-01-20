import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
  "data-testid"?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  onClick,
  "data-testid": testId,
}: KpiCardProps) {
  return (
    <Card
      className={cn(onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all", className)}
      data-testid={testId}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={testId ? `${testId}-value` : undefined}>
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive !== false ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive !== false ? "+" : ""}{trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
            {trend && (
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
