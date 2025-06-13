
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface LineDataPoint {
  date: string;
  value: number;
}

interface RechartsLineGraphProps {
  data: LineDataPoint[];
  isLoading: boolean;
  dateRange?: DateRange;
  title?: string;
}

const RechartsLineGraph: React.FC<RechartsLineGraphProps> = ({ 
  data, 
  isLoading, 
  dateRange,
  title = "Activity Trend" 
}) => {
  // Format dates for better display
  const formattedData = React.useMemo(() => {
    return data.map(point => ({
      ...point,
      // Format date to be more readable (e.g., "May 15")
      formattedDate: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [data]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`Date: ${label}`}</p>
          <p className="text-purple-600">{`Value: ${payload[0].value.toFixed(1)}`}</p>
        </div>
      );
    }
    return null;
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Date range display
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
    : "All time";
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">About this chart</h4>
                  <p className="text-sm text-muted-foreground">
                    This chart shows activity trends over time using Recharts library.
                    Hover over data points for detailed information.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <span className="text-xs text-muted-foreground">{dateRangeText}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="formattedDate" 
                angle={0} 
                textAnchor="end"
                height={50}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ bottom: -10 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 1.5 }}
                activeDot={{ r: 6, strokeWidth: 1.5 }}
                name="TBD TBD TBD"
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RechartsLineGraph;
