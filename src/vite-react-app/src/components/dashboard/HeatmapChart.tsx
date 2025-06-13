
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "../ui/skeleton";
import { CalendarRange } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface HeatmapData {
  day: string;
  value: number;
  hour: string;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  isLoading: boolean;
  dateRange?: { from?: Date; to?: Date };
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "9am", "10am", "11am", "12pm", 
  "1pm", "2pm", "3pm", "4pm", "5pm"
];

// Function to generate random fulfillment data if real data isn't available
const generateMockHeatmapData = (): HeatmapData[] => {
  const data: HeatmapData[] = [];
  
  DAYS_OF_WEEK.forEach(day => {
    HOURS.forEach(hour => {
      data.push({
        day,
        hour,
        value: Math.floor(Math.random() * 10)
      });
    });
  });
  
  return data;
};

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, isLoading, dateRange: initialDateRange }) => {
  // Local state for date range control
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange ? 
      {
        from: initialDateRange.from || new Date(),
        to: initialDateRange.to
      } : undefined
  );
  
  // Use mockup data if no data is provided
  const displayData = data && data.length > 0 ? data : generateMockHeatmapData();
  
  // Group data by day for radar chart
  const chartData = DAYS_OF_WEEK.map(day => {
    const dayEntries = displayData.filter(entry => entry.day === day);
    
    // Calculate average value for the day
    const totalValue = dayEntries.reduce((sum, entry) => sum + entry.value, 0);
    const avgValue = dayEntries.length > 0 ? totalValue / dayEntries.length : 0;
    
    // Find the busiest hour
    const busiestEntry = dayEntries.reduce(
      (busiest, entry) => entry.value > busiest.value ? entry : busiest, 
      { day, hour: "", value: 0 }
    );
    
    return {
      day,
      value: Math.round(avgValue * 10) / 10,
      busiestHour: busiestEntry.hour,
      busiestValue: busiestEntry.value
    };
  });

  const chartConfig = {
    Monday: { color: "#8B5CF6" },
    Tuesday: { color: "#D946EF" },
    Wednesday: { color: "#F97316" },
    Thursday: { color: "#0EA5E9" },
    Friday: { color: "#10B981" },
    Saturday: { color: "#F59E0B" },
    Sunday: { color: "#EF4444" },
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Fulfillment Activtiy Heatmap (TBD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Fulfillment Activtiy Heatmap (TBD)</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <CalendarRange className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} -{" "}
                      {format(dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d")
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ChartContainer
            config={chartConfig}
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={70} data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="day" />
                <Radar
                  name="Activity"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.5}
                />
                <ChartTooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Custom tooltip to show busiest hour information
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md text-xs">
        <p className="font-medium">{data.day}</p>
        <p>Average Activity: {data.value}</p>
        <p>Busiest Hour: {data.busiestHour || "N/A"}</p>
        {data.busiestValue > 0 && (
          <p>Peak Value: {data.busiestValue}</p>
        )}
      </div>
    );
  }

  return null;
};

export default HeatmapChart;
