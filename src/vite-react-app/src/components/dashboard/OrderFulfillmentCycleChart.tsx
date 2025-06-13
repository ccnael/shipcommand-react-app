
import React, { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader } from "lucide-react";
import { suiteletUrl } from "@/lib/constants";

interface OrderFulfillmentCycleChartProps {
  data: { name: string; value: number; color: string }[];
  isLoading: boolean;
  title?: string;
}

type ViewType = "YoY" | "QoQ" | "MoM" | "WoW" | "DoD" | "this_year" | "this_quarter" | "this_month" | "this_week" | "today";

interface CycleTimeData {
  id: string;
  sotranId: string;
  sotranDate: string;
  systemNoteDate: string;
  diffHours: number;
}

// Mockup data for localhost
const mockupCycleData: CycleTimeData[] = [
  {
    "id": "208166",
    "sotranId": "159",
    "sotranDate": "5/5/2025",
    "systemNoteDate": "5/6/2025 6:00 am",
    "diffHours": 30
  },
  {
    "id": "205066",
    "sotranId": "675",
    "sotranDate": "5/8/2025",
    "systemNoteDate": "5/10/2025 12:00 am",
    "diffHours": 48
  },
  {
    "id": "202834",
    "sotranId": "665",
    "sotranDate": "4/28/2025",
    "systemNoteDate": "4/30/2025 12:00 am",
    "diffHours": 48
  },
  {
    "id": "202834",
    "sotranId": "665",
    "sotranDate": "4/29/2025",
    "systemNoteDate": "4/30/2025 12:00 am",
    "diffHours": 24
  },
  {
    "id": "202829",
    "sotranId": "624",
    "sotranDate": "1/25/2025",
    "systemNoteDate": "1/26/2025 1:00 am",
    "diffHours": 25
  },
  {
    "id": "175246",
    "sotranId": "580",
    "sotranDate": "1/15/2025",
    "systemNoteDate": "1/15/2025 12:30 pm",
    "diffHours": 12.5
  }
];

// View type options for the main dropdown
const VIEW_TYPE_OPTIONS = [
  { value: "this_year", label: "This Year" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_month", label: "This Month" },
  { value: "this_week", label: "This Week" },
  { value: "today", label: "Today" },
  { value: "YoY", label: "Year over Year" },
  { value: "QoQ", label: "Quarter over Quarter" },
  { value: "MoM", label: "Month over Month" },
  { value: "WoW", label: "Week over Week" },
  { value: "DoD", label: "Day over Day" }
];

// Sub-view options for each main view type
const SUB_VIEW_OPTIONS: Record<ViewType, Array<{ value: string; label: string; bars: number }>> = {
  "YoY": [
    { value: "1", label: "Previous year", bars: 2 },
    { value: "2", label: "2 years", bars: 3 },
    { value: "3", label: "3 years", bars: 4 },
    { value: "4", label: "4 years", bars: 5 }
  ],
  "this_year": [
    { value: "this_year_months", label: "Monthly breakdown", bars: 12 }
  ],
  "QoQ": [
    { value: "1", label: "Previous quarter", bars: 2 },
    { value: "2", label: "Previous 2 quarters", bars: 3 },
    { value: "3", label: "Previous 3 quarters", bars: 4 }
  ],
  "this_quarter": [
    { value: "this_quarter_months", label: "Monthly breakdown", bars: 3 }
  ],
  "MoM": [
    { value: "1", label: "Previous month", bars: 2 },
    { value: "2", label: "Previous 2 months", bars: 3 },
    { value: "3", label: "Previous 3 months", bars: 4 },
    { value: "4", label: "Previous 4 months", bars: 5 },
    { value: "5", label: "Previous 5 months", bars: 6 }
  ],
  "this_month": [
    { value: "this_month_weeks", label: "Weekly breakdown", bars: 4 }
  ],
  "WoW": [
    { value: "1", label: "Previous week", bars: 2 },
    { value: "2", label: "Previous 2 weeks", bars: 3 },
    { value: "3", label: "Previous 3 weeks", bars: 4 }
  ],
  "this_week": [
    { value: "this_week_days", label: "Daily breakdown", bars: 7 }
  ],
  "DoD": [
    { value: "1", label: "Yesterday", bars: 2 },
    { value: "2", label: "Previous 2 days", bars: 3 },
    { value: "3", label: "Previous 3 days", bars: 4 },
    { value: "4", label: "Previous 4 days", bars: 5 },
    { value: "5", label: "Previous 5 days", bars: 6 },
    { value: "6", label: "Previous 6 days", bars: 7 }
  ],
  "today": [
    { value: "today_hours", label: "Hourly breakdown", bars: 8 }
  ]
};

// Simple 2-point moving average trend calculation
const calculateMovingAverageTrend = (dataPoints: number[]) => {
  if (dataPoints.length < 2) return dataPoints;
  
  const trendValues = [];
  
  // First point is the same
  trendValues.push(dataPoints[0]);
  
  // Calculate 2-point moving average for the rest
  for (let i = 1; i < dataPoints.length; i++) {
    const average = (dataPoints[i - 1] + dataPoints[i]) / 2;
    trendValues.push(average);
  }
  
  return trendValues;
};

// Calculate percentage change
const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="font-medium text-sm mb-2 text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.value !== undefined && entry.value !== null) {
            if (entry.dataKey === 'value') {
              return (
                <div key={index} className="text-sm text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                    <span>{entry.value.toFixed(1)} hours</span>
                  </div>
                </div>
              );
            } else if (entry.dataKey === 'trend') {
              return (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                  <span>Trend: {entry.value.toFixed(1)}</span>
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    );
  }
  return null;
};

// Custom legend component with tooltips
const CustomLegendWithTooltips = ({ payload }: any) => {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex justify-center mb-4 text-xs text-muted-foreground gap-6">
        {payload?.map((entry: any, index: number) => (
          <UITooltip key={index}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span>{entry.value}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="text-sm">
                {entry.dataKey === 'value' && (
                  <div>
                    <p className="font-medium mb-1">Average Cycle Time</p>
                    <p>Average time from Sales Order Date to Item Fulfillment set to SHIPPED</p>
                  </div>
                )}
                {entry.dataKey === 'trend' && (
                  <div>
                    <p className="font-medium mb-1">2-Point Moving Average Trend</p>
                    <p>Calculated by averaging each data point with the previous one. Formula: (Previous Value + Current Value) ÷ 2</p>
                  </div>
                )}
              </div>
            </TooltipContent>
          </UITooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

const OrderFulfillmentCycleChart: React.FC<OrderFulfillmentCycleChartProps> = ({ 
  data, 
  isLoading: propIsLoading, 
  title = "Order Fulfillment Cycle Time" 
}) => {
  const [selectedView, setSelectedView] = useState<ViewType>("this_year");
  const [selectedSubView, setSelectedSubView] = useState<string>("this_year_months");
  const [cycleData, setCycleData] = useState<CycleTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCycleTimeData = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // console.log("Using mockup cycle time data for localhost");
        setCycleData(mockupCycleData);
        setIsLoading(false);
        return;
      }

      try {
        if (!suiteletUrl || suiteletUrl.includes('{{') || suiteletUrl.includes('}}')) {
          // console.log("SuiteletUrl contains template placeholders, using mockup data");
          setCycleData(mockupCycleData);
          setIsLoading(false);
          return;
        }

        const url = `${suiteletUrl}&mode=getOrderFulfillmentCycleTime`;
        // console.log('Fetching order fulfillment cycle time data from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch cycle time data: ${response.status}`);
        }
        
        const result: CycleTimeData[] = await response.json();
        // console.log('Order fulfillment cycle time data result:', result);
        
        setCycleData(result);
      } catch (error) {
        console.error("Error fetching cycle time data:", error);
        setCycleData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCycleTimeData();
  }, []);

  // Reset sub-view when main view changes
  useEffect(() => {
    if (selectedView === "this_year") {
      setSelectedSubView("this_year_months");
    } else if (selectedView === "this_quarter") {
      setSelectedSubView("this_quarter_months");
    } else if (selectedView === "this_month") {
      setSelectedSubView("this_month_weeks");
    } else if (selectedView === "this_week") {
      setSelectedSubView("this_week_days");
    } else if (selectedView === "today") {
      setSelectedSubView("today_hours");
    } else if (selectedView === "YoY") {
      setSelectedSubView("4");
    } else if (selectedView === "MoM") {
      setSelectedSubView("5");
    } else {
      setSelectedSubView("1");
    }
  }, [selectedView]);

  // Function to calculate averages based on time periods and sub-view selection
  const calculatePeriodAverages = (viewType: ViewType, subViewValue: string) => {
    const now = new Date();
    const subView = SUB_VIEW_OPTIONS[viewType]?.find(opt => opt.value === subViewValue);
    if (!subView) {
      // console.log(`No subview found for viewType: ${viewType}, subViewValue: ${subViewValue}`);
      return [];
    }
    
    // Parse the cycle data
    const parsedCycleData = cycleData.map(item => ({
      ...item,
      orderDate: new Date(item.sotranDate),
      fulfillmentDate: new Date(item.systemNoteDate),
      hours: item.diffHours
    }));

    // Filter out outliers (orders taking more than 1000 hours might be data errors)
    const filteredData = parsedCycleData;//.filter(item => item.hours < 1000);

    // console.log(`Calculating cycle time for ${viewType} with ${filteredData.length} records`);

    const periods: { data: typeof filteredData; label: string }[] = [];

    for (let i = 0; i < subView.bars; i++) {
      let periodData: typeof filteredData = [];
      let label = "";

      switch (viewType) {
        case "this_year":
          // Break down current year by months
          const currentYear = now.getFullYear();
          const targetMonth = 11 - i; // December to January (11 to 0)
          
          periodData = filteredData.filter(item => 
            item.fulfillmentDate.getFullYear() === currentYear && 
            item.fulfillmentDate.getMonth() === targetMonth
          );
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          label = monthNames[targetMonth];
          break;

        case "this_quarter":
          // Break down current quarter by months
          const thisQuarter = Math.floor(now.getMonth() / 3);
          const thisQuarterYear = now.getFullYear();
          const quarterStartMonth = thisQuarter * 3;
          const targetQuarterMonth = quarterStartMonth + (2 - i); // Last month to first month of quarter
          
          periodData = filteredData.filter(item => 
            item.fulfillmentDate.getFullYear() === thisQuarterYear && 
            item.fulfillmentDate.getMonth() === targetQuarterMonth
          );
          
          const quarterMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          label = quarterMonthNames[targetQuarterMonth];
          break;

        case "this_month":
          // Break down current month by weeks
          const thisMonth = now.getMonth();
          const thisMonthYear = now.getFullYear();
          
          // Calculate week boundaries for current month
          const monthStart = new Date(thisMonthYear, thisMonth, 1);
          const monthEnd = new Date(thisMonthYear, thisMonth + 1, 0);
          
          const weekStart = new Date(monthEnd);
          weekStart.setDate(monthEnd.getDate() - (i * 7));
          if (weekStart < monthStart) weekStart.setTime(monthStart.getTime());
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          if (weekEnd > monthEnd) weekEnd.setTime(monthEnd.getTime());

          periodData = filteredData.filter(item => 
            item.fulfillmentDate >= weekStart && item.fulfillmentDate <= weekEnd
          );
          
          label = `Week ${4 - i}`;
          break;

        case "this_week":
          // Break down current week by days
          const thisWeekStart = new Date(now);
          thisWeekStart.setDate(now.getDate() - now.getDay());
          
          const targetDay = new Date(thisWeekStart);
          targetDay.setDate(thisWeekStart.getDate() + (6 - i));
          
          periodData = filteredData.filter(item => {
            const itemDate = new Date(item.fulfillmentDate.getFullYear(), item.fulfillmentDate.getMonth(), item.fulfillmentDate.getDate());
            const targetDate = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());
            return itemDate.getTime() === targetDate.getTime();
          });
          
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          label = dayNames[6 - i];
          break;

        case "today":
          // Break down today by hours (8-hour blocks for simplicity)
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const targetHour = Math.max(0, 24 - (i + 1) * 3); // 3-hour blocks
          
          const hourStart = new Date(todayStart);
          hourStart.setHours(targetHour, 0, 0, 0);
          
          const hourEnd = new Date(hourStart);
          hourEnd.setHours(targetHour + 2, 59, 59, 999);

          periodData = filteredData.filter(item => 
            item.fulfillmentDate >= hourStart && item.fulfillmentDate <= hourEnd
          );
          
          label = `${targetHour}:00-${Math.min(targetHour + 3, 24)}:00`;
          break;
        case "YoY":
          const targetYear = now.getFullYear() - i;
          periodData = filteredData.filter(item => item.fulfillmentDate.getFullYear() === targetYear);
          // console.log('Target Year', targetYear);
          // console.log('Period Data???', periodData);
          label = i === 0 ? "Current" : `${targetYear}`;
          break;

        case "QoQ":
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const currentQuarterYear = now.getFullYear();
          
          let targetQuarter = currentQuarter - i;
          let targetQuarterYear = currentQuarterYear;
          
          while (targetQuarter < 0) {
            targetQuarter += 4;
            targetQuarterYear -= 1;
          }

          periodData = filteredData.filter(item => {
            const itemQuarter = Math.floor(item.fulfillmentDate.getMonth() / 3);
            return item.fulfillmentDate.getFullYear() === targetQuarterYear && itemQuarter === targetQuarter;
          });
          
          label = i === 0 ? "Current" : `Q${targetQuarter + 1} ${targetQuarterYear}`;
          break;

        case "MoM":
          const currentMonth = now.getMonth();
          const currentMonthYear = now.getFullYear();
          
          let targetMonthMoM = currentMonth - i;
          let targetMonthYear = currentMonthYear;
          
          while (targetMonthMoM < 0) {
            targetMonthMoM += 12;
            targetMonthYear -= 1;
          }

          periodData = filteredData.filter(item => 
            item.fulfillmentDate.getFullYear() === targetMonthYear && 
            item.fulfillmentDate.getMonth() === targetMonthMoM
          );
          
          const monthNamesMoM = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          label = i === 0 ? "Current" : `${monthNamesMoM[targetMonthMoM]} ${targetMonthYear}`;
          break;

        case "WoW":
          const currentWeekStart = new Date(now);
          currentWeekStart.setDate(now.getDate() - now.getDay() - (i * 7));
          const currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

          periodData = filteredData.filter(item => 
            item.fulfillmentDate >= currentWeekStart && item.fulfillmentDate <= currentWeekEnd
          );
          
          label = i === 0 ? "Current" : `Week -${i}`;
          break;

        case "DoD":
          const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);

          periodData = filteredData.filter(item => {
            const itemDate = new Date(item.fulfillmentDate.getFullYear(), item.fulfillmentDate.getMonth(), item.fulfillmentDate.getDate());
            return itemDate.getTime() === targetDate.getTime();
          });
          
          label = i === 0 ? "Today" : `Day -${i}`;
          break;
      }

      periods.unshift({ data: periodData, label });
    }

    // Calculate averages for each period
    const periodAverages = periods.map((period) => {
      const average = period.data.length > 0 
        ? period.data.reduce((sum, item) => sum + item.hours, 0) / period.data.length 
        : 0;
      
      // console.log(`Period ${period.label}: ${period.data.length} items, average: ${average}`);
      
      return {
        name: period.label,
        value: average,
        color: "#3b82f6"
      };
    });

    // Calculate trend using simple 2-point moving average
    const averageValues = periodAverages.map(p => p.value);
    const trendValues = calculateMovingAverageTrend(averageValues);

    // Combine the data with trend values
    return periodAverages.map((period, index) => ({
      ...period,
      trend: trendValues[index] || 0
    }));
  };

  const transformedData = calculatePeriodAverages(selectedView, selectedSubView);

  // Check if we should show trend line (hide for current period views)
  const shouldShowTrendLine = !["this_year", "this_quarter", "this_month", "this_week", "today"].includes(selectedView);

  // console.log('Order fulfillment cycle chart transformed data:', transformedData);

  if (isLoading || propIsLoading) {
    return (
      <div className="h-[400px]">
        <div className="p-6">
          <div className="text-sm font-medium mb-4">{title}</div>
        </div>
        <div className="px-6 pb-6">
          <div className="h-[280px] flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px]">
      <div className="p-6 pb-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-sm font-medium">{title}</div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Select value={selectedView} onValueChange={(value) => value && setSelectedView(value as ViewType)}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Select view type" />
              </SelectTrigger>
              <SelectContent>
                {VIEW_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {SUB_VIEW_OPTIONS[selectedView] && SUB_VIEW_OPTIONS[selectedView].length > 1 && (
              <Select value={selectedSubView} onValueChange={setSelectedSubView}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Select period range" />
                </SelectTrigger>
                <SelectContent>
                  {SUB_VIEW_OPTIONS[selectedView].map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={transformedData} margin={{ top: 5, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={0}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              content={<CustomLegendWithTooltips />}
              wrapperStyle={{ position: 'relative', marginTop: '-40px' }}
            />
            <Bar 
              dataKey="value" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Average Cycle Time (Hours)"
            />
            <Line 
              type="monotone" 
              dataKey="trend" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              name="2-Point Moving Average Trend"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderFulfillmentCycleChart;
