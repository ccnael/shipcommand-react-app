import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PickingEfficiencyChartProps {
  data: { name: string; value: number; color: string }[];
  isLoading: boolean;
  title?: string;
}

type ViewType = "YoY" | "QoQ" | "MoM" | "WoW" | "DoD" | "HoH" | "this_year" | "this_quarter" | "this_month" | "this_week" | "today";

interface PickingEfficiencyData {
  id: string;
  itemFulfillmentId: string;
  pickedDate: string;
  pickedTime: string;
  itemsCount: number;
}

// Mockup data for localhost
const mockupPickingData: PickingEfficiencyData[] = [
  {
    "id": "208166",
    "itemFulfillmentId": "IF159",
    "pickedDate": "5/5/2025",
    "pickedTime": "10:00 am",
    "itemsCount": 15
  },
  {
    "id": "205066",
    "itemFulfillmentId": "IF675",
    "pickedDate": "5/8/2025",
    "pickedTime": "2:30 pm",
    "itemsCount": 23
  },
  {
    "id": "202834",
    "itemFulfillmentId": "IF665",
    "pickedDate": "4/28/2025",
    "pickedTime": "11:15 am",
    "itemsCount": 8
  },
  {
    "id": "202834",
    "itemFulfillmentId": "IF665",
    "pickedDate": "4/29/2025",
    "pickedTime": "3:45 pm",
    "itemsCount": 12
  },
  {
    "id": "202829",
    "itemFulfillmentId": "IF624",
    "pickedDate": "1/25/2025",
    "pickedTime": "9:30 am",
    "itemsCount": 19
  },
  {
    "id": "175246",
    "itemFulfillmentId": "IF580",
    "pickedDate": "1/15/2025",
    "pickedTime": "4:20 pm",
    "itemsCount": 7
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
const SUB_VIEW_OPTIONS = {
  "YoY": [
    { value: "1", label: "Previous year", bars: 2 },
    { value: "2", label: "2 years", bars: 3 },
    { value: "3", label: "3 years", bars: 4 },
    { value: "4", label: "4 years", bars: 5 }
  ],
  "this_year": [
    { value: "this_year", label: "This Year", bars: 1 }
  ],
  "QoQ": [
    { value: "1", label: "Previous quarter", bars: 2 },
    { value: "2", label: "Previous 2 quarters", bars: 3 },
    { value: "3", label: "Previous 3 quarters", bars: 4 }
  ],
  "this_quarter": [
    { value: "this_quarter", label: "This Quarter", bars: 1 }
  ],
  "MoM": [
    { value: "1", label: "Previous month", bars: 2 },
    { value: "2", label: "Previous 2 months", bars: 3 },
    { value: "3", label: "Previous 3 months", bars: 4 },
    { value: "4", label: "Previous 4 months", bars: 5 },
    { value: "5", label: "Previous 5 months", bars: 6 }
  ],
  "this_month": [
    { value: "this_month", label: "This Month", bars: 1 }
  ],
  "WoW": [
    { value: "1", label: "Previous week", bars: 2 },
    { value: "2", label: "Previous 2 weeks", bars: 3 },
    { value: "3", label: "Previous 3 weeks", bars: 4 }
  ],
  "this_week": [
    { value: "this_week", label: "This Week", bars: 1 }
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
    { value: "today", label: "Today", bars: 1 }
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
                    <span>{entry.value.toFixed(1)} items/hour</span>
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
                    <p className="font-medium mb-1">Items Picked per Hour</p>
                    <p>Calculated as the total number of items picked divided by the total time spent picking in hours. Formula: Total Items ÷ Total Hours. Measures warehouse picking productivity and efficiency.</p>
                  </div>
                )}
                {entry.dataKey === 'trend' && (
                  <div>
                    <p className="font-medium mb-1">2-Point Moving Average Trend</p>
                    <p>A smoothed trend line calculated by averaging each data point with the previous one. Formula: (Previous Value + Current Value) ÷ 2. Helps identify overall direction of picking performance.</p>
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

const PickingEfficiencyChart: React.FC<PickingEfficiencyChartProps> = ({ 
  data, 
  isLoading: propIsLoading, 
  title = "Picking Efficiency - Items Picked per Hour" 
}) => {
  const [selectedView, setSelectedView] = useState<ViewType>("this_month");
  const [selectedSubView, setSelectedSubView] = useState<string>("this_month");
  const [pickingData, setPickingData] = useState<PickingEfficiencyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const fetchPickingEfficiencyData = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        console.log("Using mockup picking efficiency data for localhost");
        setPickingData(mockupPickingData);
        setIsLoading(false);
        return;
      }

      try {
        const getSuiteletUrl = (): string => {
          const suiteletUrlInput = document.getElementById('suiteletUrl') as HTMLInputElement;
          return suiteletUrlInput?.value ? `https://${document.domain}${decodeURIComponent(suiteletUrlInput.value)}` : "https://api.example.com/endpoint";
        };

        const suiteletUrl = getSuiteletUrl();

        if (!suiteletUrl || suiteletUrl.includes('{{') || suiteletUrl.includes('}}')) {
          console.log("SuiteletUrl contains template placeholders, using mockup data");
          setPickingData(mockupPickingData);
          setIsLoading(false);
          return;
        }

        const url = `${suiteletUrl}&mode=getPickedFulfillments`;
        console.log('Fetching picking efficiency data from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch picking efficiency data: ${response.status}`);
        }
        
        const result: PickingEfficiencyData[] = await response.json();
        console.log('Picking efficiency data result:', result);
        
        setPickingData(result);
      } catch (error) {
        console.error("Error fetching picking efficiency data:", error);
        setPickingData(mockupPickingData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPickingEfficiencyData();
  }, []);

  // Reset sub-view when main view changes and trigger animation
  useEffect(() => {
    if (["this_year", "this_quarter", "this_month", "this_week", "today"].includes(selectedView)) {
      setSelectedSubView(selectedView);
    } else if (selectedView === "YoY") {
      setSelectedSubView("4");
    } else if (selectedView === "MoM") {
      setSelectedSubView("5");
    } else {
      setSelectedSubView("1");
    }
    
    // Trigger animation when view changes
    setAnimationKey(prev => prev + 1);
  }, [selectedView]);

  // Trigger animation when sub-view changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [selectedSubView]);

  // Function to calculate picking efficiency based on time periods and sub-view selection
  const calculatePeriodEfficiency = (viewType: ViewType, subViewValue: string) => {
    const now = new Date();
    const subView = SUB_VIEW_OPTIONS[viewType].find(opt => opt.value === subViewValue);
    if (!subView) return [];
    
    // Parse the picking data
    const parsedPickingData = pickingData.map(item => ({
      ...item,
      pickedDateTime: new Date(`${item.pickedDate} ${item.pickedTime}`),
      items: item.itemsCount
    }));

    const periods: { data: typeof parsedPickingData; label: string }[] = [];

    for (let i = 0; i < subView.bars; i++) {
      let periodData: typeof parsedPickingData = [];
      let label = "";

      switch (viewType) {
        case "YoY":
          const targetYear = now.getFullYear() - i;
          periodData = parsedPickingData.filter(item => item.pickedDateTime.getFullYear() === targetYear);
          label = i === 0 ? "Current" : `${targetYear}`;
          break;

        case "this_year":
          const currentYear = now.getFullYear();
          periodData = parsedPickingData.filter(item => item.pickedDateTime.getFullYear() === currentYear);
          label = "This Year";
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

          periodData = parsedPickingData.filter(item => {
            const itemQuarter = Math.floor(item.pickedDateTime.getMonth() / 3);
            return item.pickedDateTime.getFullYear() === targetQuarterYear && itemQuarter === targetQuarter;
          });
          
          label = i === 0 ? "Current" : `Q${targetQuarter + 1} ${targetQuarterYear}`;
          break;

        case "this_quarter":
          const thisQuarter = Math.floor(now.getMonth() / 3);
          const thisQuarterYear = now.getFullYear();
          periodData = parsedPickingData.filter(item => {
            const itemQuarter = Math.floor(item.pickedDateTime.getMonth() / 3);
            return item.pickedDateTime.getFullYear() === thisQuarterYear && itemQuarter === thisQuarter;
          });
          label = "This Quarter";
          break;

        case "MoM":
          const currentMonth = now.getMonth();
          const currentMonthYear = now.getFullYear();
          
          let targetMonth = currentMonth - i;
          let targetMonthYear = currentMonthYear;
          
          while (targetMonth < 0) {
            targetMonth += 12;
            targetMonthYear -= 1;
          }

          periodData = parsedPickingData.filter(item => 
            item.pickedDateTime.getFullYear() === targetMonthYear && 
            item.pickedDateTime.getMonth() === targetMonth
          );
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          label = i === 0 ? "Current" : `${monthNames[targetMonth]} ${targetMonthYear}`;
          break;

        case "this_month":
          const thisMonth = now.getMonth();
          const thisMonthYear = now.getFullYear();
          periodData = parsedPickingData.filter(item => 
            item.pickedDateTime.getFullYear() === thisMonthYear && 
            item.pickedDateTime.getMonth() === thisMonth
          );
          label = "This Month";
          break;

        case "WoW":
          const currentWeekStart = new Date(now);
          currentWeekStart.setDate(now.getDate() - now.getDay() - (i * 7));
          const currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

          periodData = parsedPickingData.filter(item => 
            item.pickedDateTime >= currentWeekStart && item.pickedDateTime <= currentWeekEnd
          );
          
          label = i === 0 ? "Current" : `Week -${i}`;
          break;

        case "this_week":
          const thisWeekStart = new Date(now);
          thisWeekStart.setDate(now.getDate() - now.getDay());
          const thisWeekEnd = new Date(thisWeekStart);
          thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
          thisWeekEnd.setHours(23, 59, 59, 999);

          periodData = parsedPickingData.filter(item => 
            item.pickedDateTime >= thisWeekStart && item.pickedDateTime <= thisWeekEnd
          );
          label = "This Week";
          break;

        case "DoD":
          const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);

          periodData = parsedPickingData.filter(item => {
            const itemDate = new Date(item.pickedDateTime.getFullYear(), item.pickedDateTime.getMonth(), item.pickedDateTime.getDate());
            return itemDate.getTime() === targetDate.getTime();
          });
          
          label = i === 0 ? "Today" : `Day -${i}`;
          break;

        case "today":
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          periodData = parsedPickingData.filter(item => {
            const itemDate = new Date(item.pickedDateTime.getFullYear(), item.pickedDateTime.getMonth(), item.pickedDateTime.getDate());
            return itemDate.getTime() === today.getTime();
          });
          label = "Today";
          break;

        case "HoH":
          const currentHour = now.getHours();
          const targetHour = new Date(now);
          targetHour.setHours(currentHour - i);

          periodData = parsedPickingData.filter(item => {
            const itemHour = item.pickedDateTime.getHours();
            const isSameDay = item.pickedDateTime.toDateString() === targetHour.toDateString();
            return isSameDay && itemHour === targetHour.getHours();
          });
          
          label = i === 0 ? "Current Hour" : `Hour -${i}`;
          break;
      }

      periods.unshift({ data: periodData, label });
    }

    // Calculate efficiency (items per hour) for each period
    const periodEfficiency = periods.map((period) => {
      const totalItems = period.data.reduce((sum, item) => sum + item.items, 0);
      const totalHours = period.data.length > 0 ? period.data.length : 1; // Simplified calculation
      const efficiency = totalItems / totalHours;
      
      return {
        name: period.label,
        value: efficiency,
        color: "#10b981"
      };
    });

    // Calculate trend using simple 2-point moving average
    const efficiencyValues = periodEfficiency.map(p => p.value);
    const trendValues = calculateMovingAverageTrend(efficiencyValues);

    // Combine the data with trend values
    return periodEfficiency.map((period, index) => ({
      ...period,
      trend: trendValues[index] || 0
    }));
  };

  const transformedData = calculatePeriodEfficiency(selectedView, selectedSubView);

  // Check if we should show trend line (hide for current period views)
  const shouldShowTrendLine = !["this_year", "this_quarter", "this_month", "this_week", "today"].includes(selectedView);

  console.log('Picking efficiency transformed data:', transformedData);

  if (isLoading || propIsLoading) {
    return (
      <div className="h-[320]">
        <div className="p-6">
          <div className="text-sm font-medium mb-4">{title}</div>
        </div>
        <div className="px-6 pb-6">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
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
          <AreaChart 
            key={animationKey}
            data={transformedData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="pickingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
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
              label={{ value: 'Items/Hour', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              content={<CustomLegendWithTooltips />}
              wrapperStyle={{ position: 'relative', marginTop: '-10px' }}
            />
            <Area 
              type="monotone"
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={3}
              fill="url(#pickingGradient)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              name="Items Picked per Hour"
              animationBegin={0}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PickingEfficiencyChart;
