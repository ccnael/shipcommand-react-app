import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { suiteletUrl } from "@/lib/constants";

interface PackingEfficiencyLineChartProps {
  data: { name: string; value: number; color: string }[];
  isLoading: boolean;
  title?: string;
}

type ViewType = "YoY" | "QoQ" | "MoM" | "WoW" | "DoD" | "this_year" | "this_quarter" | "this_month" | "this_week" | "today";

interface PackingEfficiencyData {
  id: string;
  tranId: string;
  tranDate: string;
  systemNoteDate: string;
  diffHours: number;
  itemsCount: number;
  itemsPerHour: number;
}

// Mockup data for localhost
const mockupPackingData: PackingEfficiencyData[] = [
    {
        "id": "133573",
        "tranId": "201",
        "tranDate": "11/8/2024",
        "systemNoteDate": "11/8/2024 1:11 pm",
        "diffHours": 13.19,
        "itemsCount": 1,
        "itemsPerHour": 0.0758150113722517
    },
    {
        "id": "131652",
        "tranId": "200",
        "tranDate": "9/9/2024",
        "systemNoteDate": "11/8/2024 7:08 am",
        "diffHours": 1447.14,
        "itemsCount": 1,
        "itemsPerHour": 0.0006910181461365175
    },
    {
        "id": "127732",
        "tranId": "196",
        "tranDate": "11/5/2024",
        "systemNoteDate": "11/8/2024 7:08 am",
        "diffHours": 79.14,
        "itemsCount": 1,
        "itemsPerHour": 0.012635835228708618
    },
    {
        "id": "66702",
        "tranId": "168",
        "tranDate": "7/31/2024",
        "systemNoteDate": "8/1/2024 12:43 am",
        "diffHours": 24.72,
        "itemsCount": 1,
        "itemsPerHour": 0.04045307443365696
    },
    {
        "id": "58078",
        "tranId": "161",
        "tranDate": "7/18/2024",
        "systemNoteDate": "7/18/2024 7:52 am",
        "diffHours": 7.88,
        "itemsCount": 1,
        "itemsPerHour": 0.12690355329949238
    },
    {
        "id": "30425",
        "tranId": "114",
        "tranDate": "5/13/2024",
        "systemNoteDate": "5/13/2024 6:29 am",
        "diffHours": 6.5,
        "itemsCount": 1,
        "itemsPerHour": 0.15384615384615385
    },
    {
        "id": "30424",
        "tranId": "113",
        "tranDate": "5/13/2024",
        "systemNoteDate": "5/13/2024 6:27 am",
        "diffHours": 6.46,
        "itemsCount": 1,
        "itemsPerHour": 0.15479876160990713
    },
    {
        "id": "29919",
        "tranId": "111",
        "tranDate": "5/9/2024",
        "systemNoteDate": "5/9/2024 10:24 am",
        "diffHours": 10.41,
        "itemsCount": 1,
        "itemsPerHour": 0.09606147934678194
    },
    {
        "id": "29816",
        "tranId": "108",
        "tranDate": "5/9/2024",
        "systemNoteDate": "5/9/2024 6:41 am",
        "diffHours": 6.7,
        "itemsCount": 1,
        "itemsPerHour": 0.14925373134328357
    },
    {
        "id": "28865",
        "tranId": "98",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 11:49 am",
        "diffHours": 38.2,
        "itemsCount": 1,
        "itemsPerHour": 0.026178010471204185
    },
    {
        "id": "28663",
        "tranId": "96",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 9:20 am",
        "diffHours": 9.34,
        "itemsCount": 1,
        "itemsPerHour": 0.10706638115631692
    },
    {
        "id": "28562",
        "tranId": "95",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 9:01 am",
        "diffHours": 9.02,
        "itemsCount": 1,
        "itemsPerHour": 0.11086474501108648
    },
    {
        "id": "27738",
        "tranId": "85",
        "tranDate": "4/30/2024",
        "systemNoteDate": "4/30/2024 7:15 am",
        "diffHours": 7.26,
        "itemsCount": 1,
        "itemsPerHour": 0.13774104683195593
    },
    {
        "id": "6604",
        "tranId": "39",
        "tranDate": "9/9/2023",
        "systemNoteDate": "9/9/2023 1:46 am",
        "diffHours": 1.78,
        "itemsCount": 1,
        "itemsPerHour": 0.5617977528089888
    },
    {
        "id": "4389",
        "tranId": "23",
        "tranDate": "8/28/2023",
        "systemNoteDate": "1/23/2024 8:14 pm",
        "diffHours": 3572.24,
        "itemsCount": 1,
        "itemsPerHour": 0.0002799363984502721
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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="font-medium text-sm mb-2 text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.value !== undefined && entry.value !== null) {
            return (
              <div key={index} className="text-sm text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                  <span>{entry.value.toFixed(3)} items/hour</span>
                </div>
              </div>
            );
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
    <TooltipProvider>
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
            <TooltipContent className="max-w-xs">
              <div className="text-sm">
                <p className="font-medium mb-1">Packing Efficiency - Items/Hour</p>
                <p>Items packed per hour based on fulfillment data</p>
              </div>
            </TooltipContent>
          </UITooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

const PackingEfficiencyLineChart: React.FC<PackingEfficiencyLineChartProps> = ({ 
  data, 
  isLoading: propIsLoading, 
  title = "Packing Efficiency - Items Packed/Hour" 
}) => {
  const [selectedView, setSelectedView] = useState<ViewType>("this_year");
  const [selectedSubView, setSelectedSubView] = useState<string>("this_year_months");
  const [packingData, setPackingData] = useState<PackingEfficiencyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const fetchPackingEfficiencyData = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        console.log("Using mockup packing efficiency data for localhost");
        setPackingData(mockupPackingData);
        setIsLoading(false);
        return;
      }

      try {
        if (!suiteletUrl || suiteletUrl.includes('{{') || suiteletUrl.includes('}}')) {
          // console.log("SuiteletUrl contains template placeholders, using mockup data");
          setPackingData(mockupPackingData);
          setIsLoading(false);
          return;
        }

        const url = `${suiteletUrl}&mode=getPackedFulfillments`;
        // console.log('Fetching packing efficiency data from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch packing efficiency data: ${response.status}`);
        }
        
        const result: PackingEfficiencyData[] = await response.json();
        console.log('Packing efficiency data result:', result);
        
        setPackingData(result);
      } catch (error) {
        console.error("Error fetching packing efficiency data:", error);
        setPackingData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackingEfficiencyData();
  }, []);

  // Reset sub-view when main view changes and trigger animation
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
    
    // Trigger animation when view changes
    setAnimationKey(prev => prev + 1);
  }, [selectedView]);

  // Trigger animation when sub-view changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [selectedSubView]);

  // Function to calculate packing efficiency based on time periods and sub-view selection
  const calculatePeriodEfficiency = (viewType: ViewType, subViewValue: string) => {
    const now = new Date();
    const subView = SUB_VIEW_OPTIONS[viewType]?.find(opt => opt.value === subViewValue);
    if (!subView) {
      // console.log(`No subview found for viewType: ${viewType}, subViewValue: ${subViewValue}`);
      return [];
    }
    
    // Parse the packing data and calculate actual diff hours
    const parsedPackingData = packingData.map(item => {
      const actualDiffHours = item.diffHours;
      // console.log(`Record ${item.id}: ${item.tranDate} ${item.systemNoteDate} = ${actualDiffHours} hours`);
      
      return {
        ...item,
        tranDate: new Date(item.tranDate),
        fulfillmentDate: new Date(item.systemNoteDate),
        calculatedDiffHours: actualDiffHours
      };
    });

    // console.log(`Calculating efficiency for ${viewType} with ${parsedPackingData.length} records`);

    const periods: { data: typeof parsedPackingData; label: string }[] = [];

    for (let i = 0; i < subView.bars; i++) {
      let periodData: typeof parsedPackingData = [];
      let label = "";

      switch (viewType) {
        case "this_year":
          // Break down current year by months
          const currentYear = now.getFullYear();
          const targetMonth = 11 - i; // December to January (11 to 0)
          
          periodData = parsedPackingData.filter(item => 
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
          
          periodData = parsedPackingData.filter(item => 
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

          periodData = parsedPackingData.filter(item => 
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
          
          periodData = parsedPackingData.filter(item => {
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

          periodData = parsedPackingData.filter(item => 
            item.fulfillmentDate >= hourStart && item.fulfillmentDate <= hourEnd
          );
          
          label = `${targetHour}:00-${Math.min(targetHour + 3, 24)}:00`;
          break;

        case "YoY":
          const targetYear = now.getFullYear() - i;
          periodData = parsedPackingData.filter(item => item.fulfillmentDate.getFullYear() === targetYear);
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

          periodData = parsedPackingData.filter(item => {
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

          periodData = parsedPackingData.filter(item => 
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

          periodData = parsedPackingData.filter(item => 
            item.fulfillmentDate >= currentWeekStart && item.fulfillmentDate <= currentWeekEnd
          );
          
          label = i === 0 ? "Current" : `Week -${i}`;
          break;

        case "DoD":
          const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);

          periodData = parsedPackingData.filter(item => {
            const itemDate = new Date(item.fulfillmentDate.getFullYear(), item.fulfillmentDate.getMonth(), item.fulfillmentDate.getDate());
            return itemDate.getTime() === targetDate.getTime();
          });
          
          label = i === 0 ? "Today" : `Day -${i}`;
          break;
      }

      periods.unshift({ data: periodData, label });
    }

    // console.log('PERIODZ', periods);

    // Calculate efficiency (items per hour) for each period
    const periodEfficiency = periods.map((period) => {
      const totals = period.data.reduce((map, item) => {
          map.itemsCount += item.itemsCount;
          map.diffHours += item.diffHours;
          map.itemsPerHour += item.itemsPerHour;
          return map;
        }, {
          itemsCount: 0,
          diffHours: 0,
          itemsPerHour: 0
        });
      const efficiency = totals.itemsCount ? totals.itemsCount / totals.diffHours : 0;
      // const efficiency = period.data.reduce((sum, item) => sum + item.itemsPerHour, 0);
      // if (period.label == '2024') {
      //   console.log('TOTALS', totals);
      // }
      return {
        name: period.label,
        value: efficiency,
        color: "#3b82f6"
      };
    });

    return periodEfficiency;
  };

  const transformedData = calculatePeriodEfficiency(selectedView, selectedSubView);

  // console.log('Packing efficiency line chart transformed data:', transformedData);

  if (isLoading || propIsLoading) {
    return (
      <div className="h-[400px]">
        <div className="p-6">
          <div className="text-sm font-medium mb-4">{title}</div>
        </div>
        <div className="px-6 pb-6">
          <Skeleton className="h-[320px] w-full" />
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
          <AreaChart 
            key={animationKey}
            data={transformedData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="packingGradient" x1="0" y1="0" x2="0" y2="1">
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
              wrapperStyle={{ position: 'relative', marginTop: '-40px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={3}
              fill="url(#packingGradient)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              name="Items Packed per Hour"
              animationBegin={0}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PackingEfficiencyLineChart;
