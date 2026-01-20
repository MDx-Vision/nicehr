import { cn } from "@/lib/utils";

interface PerformanceGaugeProps {
  value: number;
  max?: number;
  label: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  colorScheme?: "default" | "success" | "warning" | "danger";
  showPercentage?: boolean;
  className?: string;
  onClick?: () => void;
  "data-testid"?: string;
}

export function PerformanceGauge({
  value,
  max = 100,
  label,
  description,
  size = "md",
  colorScheme = "default",
  showPercentage = true,
  className,
  onClick,
  "data-testid": testId,
}: PerformanceGaugeProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  // Calculate the stroke dash for the circular progress
  const sizeMap = {
    sm: { dimension: 80, stroke: 6, textSize: "text-lg", labelSize: "text-xs" },
    md: { dimension: 120, stroke: 8, textSize: "text-2xl", labelSize: "text-sm" },
    lg: { dimension: 160, stroke: 10, textSize: "text-3xl", labelSize: "text-base" },
  };

  const { dimension, stroke, textSize, labelSize } = sizeMap[size];
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  // Color based on value or explicit scheme
  const getColor = () => {
    if (colorScheme !== "default") {
      return {
        success: "stroke-green-500",
        warning: "stroke-yellow-500",
        danger: "stroke-red-500",
        default: "stroke-primary",
      }[colorScheme];
    }

    // Auto-determine color based on percentage
    if (percentage >= 80) return "stroke-green-500";
    if (percentage >= 50) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const getTextColor = () => {
    if (colorScheme !== "default") {
      return {
        success: "text-green-500",
        warning: "text-yellow-500",
        danger: "text-red-500",
        default: "text-foreground",
      }[colorScheme];
    }

    if (percentage >= 80) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div
      className={cn("flex flex-col items-center", onClick && "cursor-pointer hover:opacity-80 transition-opacity", className)}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="relative" style={{ width: dimension, height: dimension }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={dimension} height={dimension}>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn("transition-all duration-500 ease-out", getColor())}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", textSize, getTextColor())}>
            {showPercentage ? `${percentage}%` : value}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2 text-center">
        <p className={cn("font-medium", labelSize)}>{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

interface GaugeGridProps {
  gauges: Array<{
    value: number;
    max?: number;
    label: string;
    description?: string;
    colorScheme?: "default" | "success" | "warning" | "danger";
    onClick?: () => void;
  }>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GaugeGrid({ gauges, size = "sm", className }: GaugeGridProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {gauges.map((gauge, index) => (
        <PerformanceGauge
          key={index}
          value={gauge.value}
          max={gauge.max}
          label={gauge.label}
          description={gauge.description}
          size={size}
          colorScheme={gauge.colorScheme}
          onClick={gauge.onClick}
          data-testid={`gauge-${gauge.label.toLowerCase().replace(/\s+/g, "-")}`}
        />
      ))}
    </div>
  );
}
