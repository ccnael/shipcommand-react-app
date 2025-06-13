
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Loader } from "lucide-react";
import { suiteletUrl } from "@/lib/constants";

interface ShippingMethodData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface ShippingMethodDistributionChartProps {
  data: ShippingMethodData[];
  isLoading: boolean;
}

interface ApiShippingMethodData {
  shipMethod: string;
  id: string;
  trandate: string;
}

const COLORS = [
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#f97316", // Orange
];

// Get date range based on period
const getDateRange = (period: string): { startDate: string; endDate: string } => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  switch (period) {
    case "This Year":
      return {
        startDate: `1/1/${currentYear}`,
        endDate: `12/31/${currentYear}`
      };
    
    case "This Quarter":
      const currentQuarter = Math.floor(currentMonth / 3);
      const quarterStartMonth = currentQuarter * 3 + 1;
      const quarterEndMonth = quarterStartMonth + 2;
      const quarterEndDate = new Date(currentYear, quarterEndMonth, 0).getDate();
      return {
        startDate: `${quarterStartMonth}/1/${currentYear}`,
        endDate: `${quarterEndMonth}/${quarterEndDate}/${currentYear}`
      };
    
    case "This Month":
      const monthEndDate = new Date(currentYear, currentMonth + 1, 0).getDate();
      return {
        startDate: `${currentMonth + 1}/1/${currentYear}`,
        endDate: `${currentMonth + 1}/${monthEndDate}/${currentYear}`
      };
    
    case "This Week":
      const weekStart = new Date(now);
      weekStart.setDate(currentDate - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return {
        startDate: `${weekStart.getMonth() + 1}/${weekStart.getDate()}/${weekStart.getFullYear()}`,
        endDate: `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}/${weekEnd.getFullYear()}`
      };
    
    case "Today":
      return {
        startDate: `${currentMonth + 1}/${currentDate}/${currentYear}`,
        endDate: `${currentMonth + 1}/${currentDate}/${currentYear}`
      };
    
    default:
      return {
        startDate: `1/1/${currentYear}`,
        endDate: `12/31/${currentYear}`
      };
  }
};

// Transform API data to chart format
const transformApiDataToChart = (apiData: ApiShippingMethodData[]): ShippingMethodData[] => {
  // Count occurrences of each shipping method
  const methodCounts = apiData.reduce((acc, item) => {
    const methodName = item.shipMethod === "- None -" ? "No Shipping Method" : item.shipMethod;
    acc[methodName] = (acc[methodName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart format
  const dataWithValues = Object.entries(methodCounts).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));

  const total = dataWithValues.reduce((sum, item) => sum + item.value, 0);

  return dataWithValues.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
  }));
};

// Fetch shipping method distribution data
const fetchShippingMethodDistribution = async (startDate: string, endDate: string): Promise<ApiShippingMethodData[]> => {
  try {
    // Check if running locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '::1';
    
    if (isLocalhost) {
      console.log("Running locally - using mock shipping method distribution data");
      // Return mock API response for local development
      return [
        { shipMethod: "- None -", id: "117", trandate: "1/1/2025" },
        { shipMethod: "- None -", id: "117", trandate: "5/1/2025" },
        { shipMethod: "Airborne", id: "4", trandate: "5/1/2025" },
        { shipMethod: "Airborne", id: "4", trandate: "6/1/2024" },
        { shipMethod: "Standard Ground", id: "1", trandate: "5/15/2025" },
        { shipMethod: "Express", id: "2", trandate: "5/20/2025" },
        { shipMethod: "Overnight", id: "3", trandate: "5/25/2025" }
      ];
    }
    
    const url = `${suiteletUrl}&mode=getShippingMethodDistribution&startdate=${encodeURIComponent(startDate)}&enddate=${encodeURIComponent(endDate)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Shipping method distribution data:', data);
    
    return data;
  } catch (error) {
    console.error("Error fetching shipping method distribution:", error);
    // Return mock data as fallback
    return [
      { shipMethod: "- None -", id: "117", trandate: "5/1/2025" },
      { shipMethod: "Airborne", id: "4", trandate: "5/1/2025" }
    ];
  }
};

const ShippingMethodDistributionChart: React.FC<ShippingMethodDistributionChartProps> = ({ 
  data, 
  isLoading 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("This Year");
  const [chartData, setChartData] = useState<ShippingMethodData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch data when component mounts or period changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const { startDate, endDate } = getDateRange(selectedPeriod);
        const apiData = await fetchShippingMethodDistribution(startDate, endDate);
        const transformedData = transformApiDataToChart(apiData);
        setChartData(transformedData);
      } catch (error) {
        console.error("Failed to load shipping method distribution data:", error);
        // Fallback to empty data
        setChartData([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="h-[400px]">
        <div className="p-6">
          <div className="text-sm font-medium mb-4">Shipping Method Distribution</div>
        </div>
        <div className="px-6 pb-6">
          <div className="h-[280px] flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} fulfillments ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage}%`}
      </text>
    );
  };

  // Transform data for pie chart
  const pieData = chartData.map(item => ({
    ...item,
    fill: item.color
  }));

  return (
    <div className="h-[400px]">
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Shipping Method Distribution</div>
            <p className="text-xs text-muted-foreground">
              Item fulfillments in shipped status • {total.toLocaleString()} total
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px] h-8">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="This Year">This Year</SelectItem>
              <SelectItem value="This Quarter">This Quarter</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-6 pb-6">
        {isLoadingData ? (
          <div className="h-[280px] flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available for selected period</p>
          </div>
        ) : (
          <div className="flex items-start justify-left gap-18 -mt-12">
            <div className="h-[320px] w-[320px] ml-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={30}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5 ml-4 mt-12">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded flex-shrink-0" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{entry.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {entry.value.toLocaleString()} ({entry.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingMethodDistributionChart;
