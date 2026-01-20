import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusItem {
  label: string;
  value: number;
  color?: string;
  onClick?: () => void;
}

interface StatusDistributionCardProps {
  title: string;
  items: StatusItem[];
  className?: string;
  onClick?: () => void;
  onItemClick?: (item: StatusItem) => void;
  "data-testid"?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500",
  completed: "bg-blue-500",
  pending: "bg-yellow-500",
  draft: "bg-gray-400",
  cancelled: "bg-red-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-orange-500",
  onboarded: "bg-green-500",
  available: "bg-green-500",
  unavailable: "bg-gray-400",
  admin: "bg-purple-500",
  hospital_staff: "bg-blue-500",
  consultant: "bg-teal-500",
};

export function StatusDistributionCard({
  title,
  items,
  className,
  onClick,
  onItemClick,
  "data-testid": testId,
}: StatusDistributionCardProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      className={cn(onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all", className)}
      data-testid={testId}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const colorClass =
            item.color || STATUS_COLORS[item.label.toLowerCase()] || "bg-primary";
          const isClickable = onItemClick || item.onClick;

          return (
            <div
              key={item.label}
              className={cn("space-y-1", isClickable && "cursor-pointer hover:bg-muted/50 p-1 -m-1 rounded transition-colors")}
              onClick={(e) => {
                if (onItemClick || item.onClick) {
                  e.stopPropagation();
                  item.onClick?.();
                  onItemClick?.(item);
                }
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">
                  {item.label.replace(/_/g, " ")}
                </span>
                <span className="font-medium">
                  {item.value} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full transition-all", colorClass)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {total === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
