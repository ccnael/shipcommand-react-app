
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Loader } from "lucide-react";
import { ChartDataItem } from "@/hooks/use-chart-data";
import { useTheme } from "@/components/theme/ThemeProvider";

interface DoughnutChartProps {
  title: string;
  data: ChartDataItem[];
  isLoading: boolean;
  chartConfig: Record<string, { color: string }>;
}

const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-col items-left space-y-2 text-xs mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center">
          <span 
            className="inline-block w-3 h-3 mr-1 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-xs font-medium"
      style={{ fontSize: percent == 1 ? '7pt' : '8.5pt' }}
    >
      {value > 0 ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
};

// Custom tooltip component to ensure proper positioning and z-index
const CustomTooltip = (props: any) => {
  if (!props.active || !props.payload || !props.payload.length) {
    return null;
  }

  const { payload } = props;
  
  return (
    <div className="bg-background border border-border/50 rounded-md p-2 shadow-lg text-xs" 
         style={{ zIndex: 9999, position: 'absolute', whiteSpace: 'nowrap' }}>
      {payload.map((entry: any, index: number) => (
        <div key={`tooltip-${index}`} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.payload.color }}
          />
          <span>{entry.name.includes('Previous Shipping') ? entry.name.replace('Previous ', '') : entry.name}: {entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const DoughnutChart: React.FC<DoughnutChartProps> = ({ title, data, isLoading, chartConfig }) => {
  // Calculate total for center text
  const total = data.reduce((sum, item) => sum + item.value, 0);
  // Get current theme to determine text color
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // console.log('DoughnutChart.tsx DATA', data);
  // console.log('DoughnutChart.tsx TOTAL', total);

  return (
    <Card className="min-w-[220px] w-[220px] flex-shrink-0 border-none shadow-none relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ChartContainer className="h-full [&_.recharts-layer_.recharts-sector]:stroke-transparent [&_.recharts-tooltip-wrapper]:!z-[9999]" config={chartConfig}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="18%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={60}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 9999, position: 'absolute', pointerEvents: 'none' }}
                  />
                  <text
                    x="18%"
                    y="35%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={18}
                    fill={isDark ? "#FFFFFF" : "#333333"}
                    fontWeight="600"
                  >
                    {+data[0].value.toLocaleString()}
                  </text>
                  <Legend 
                    content={<CustomLegend />}
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ bottom: -20, left: -20, right: 0 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoughnutChart;
