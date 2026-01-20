import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface PieChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  className?: string;
  onClick?: () => void;
  onSliceClick?: (data: { name: string; value: number }) => void;
  "data-testid"?: string;
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(220, 70%, 50%)",
  "hsl(160, 70%, 40%)",
  "hsl(280, 60%, 50%)",
];

export function PieChartCard({
  title,
  data,
  colors = DEFAULT_COLORS,
  className,
  onClick,
  onSliceClick,
  "data-testid": testId,
}: PieChartCardProps) {
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: colors[index % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      className={cn(onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all", className)}
      data-testid={testId}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || total === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  onClick={(pieData) => {
                    if (onSliceClick && pieData) {
                      onSliceClick({ name: pieData.name, value: pieData.value });
                    }
                  }}
                  style={onSliceClick ? { cursor: 'pointer' } : undefined}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2">
              {data.map((item, index) => (
                <div
                  key={item.name}
                  className={cn("flex items-center gap-2", onSliceClick && "cursor-pointer hover:bg-muted/50 p-1 -m-1 rounded transition-colors")}
                  onClick={(e) => {
                    if (onSliceClick) {
                      e.stopPropagation();
                      onSliceClick({ name: item.name, value: item.value });
                    }
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
