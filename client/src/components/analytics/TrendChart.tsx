import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface TrendChartProps {
  title: string;
  data: Array<{ date: string; count?: number; value?: number }>;
  dataKey?: string;
  color?: string;
  className?: string;
  onClick?: () => void;
  onPointClick?: (data: { date: string; count?: number; value?: number }) => void;
  "data-testid"?: string;
}

export function TrendChart({
  title,
  data,
  dataKey = "count",
  color = "hsl(var(--primary))",
  className,
  onClick,
  onPointClick,
  "data-testid": testId,
}: TrendChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  };

  const formattedData = data.map((item) => ({
    ...item,
    displayDate: formatDate(item.date),
  }));

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
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              onClick={(chartData) => {
                if (onPointClick && chartData?.activePayload?.[0]) {
                  const payload = chartData.activePayload[0].payload;
                  onPointClick({ date: payload.date, count: payload.count, value: payload.value });
                }
              }}
              style={onPointClick ? { cursor: 'pointer' } : undefined}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
