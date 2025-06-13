import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { suiteletUrl } from "@/lib/constants";

interface PickingEfficiencyLineChartProps {
  data: { name: string; value: number; color: string }[];
  isLoading: boolean;
  title?: string;
}

type ViewType = "YoY" | "QoQ" | "MoM" | "WoW" | "DoD" | "this_year" | "this_quarter" | "this_month" | "this_week" | "today";

interface PickingEfficiencyData {
  id: string;
  tranId: string;
  tranDate: string;
  systemNoteDate: string;
  diffHours: number;
  itemsCount: number;
  itemsPerHour: number;
}

// Mockup data for localhost
const mockupPickingData: PickingEfficiencyData[] = [
    {
        "id": "208167",
        "tranId": "376",
        "tranDate": "5/23/2025",
        "systemNoteDate": "5/23/2025 6:08 am",
        "diffHours": 6.14,
        "itemsCount": 1,
        "itemsPerHour": 0.16286644951140067
    },
    {
        "id": "131651",
        "tranId": "199",
        "tranDate": "9/9/2024",
        "systemNoteDate": "11/6/2024 1:49 pm",
        "diffHours": 1405.82,
        "itemsCount": 1,
        "itemsPerHour": 0.0007113286195956809
    },
    {
        "id": "107329",
        "tranId": "188",
        "tranDate": "10/3/2024",
        "systemNoteDate": "10/3/2024 11:27 am",
        "diffHours": 11.45,
        "itemsCount": 1,
        "itemsPerHour": 0.08733624454148473
    },
    {
        "id": "88642",
        "tranId": "186",
        "tranDate": "9/3/2024",
        "systemNoteDate": "9/3/2024 6:41 pm",
        "diffHours": 18.69,
        "itemsCount": 1,
        "itemsPerHour": 0.05350454788657035
    },
    {
        "id": "85122",
        "tranId": "184",
        "tranDate": "8/29/2024",
        "systemNoteDate": "8/29/2024 2:29 pm",
        "diffHours": 14.5,
        "itemsCount": 1,
        "itemsPerHour": 0.06896551724137931
    },
    {
        "id": "85118",
        "tranId": "183",
        "tranDate": "8/29/2024",
        "systemNoteDate": "8/29/2024 1:43 pm",
        "diffHours": 13.72,
        "itemsCount": 1,
        "itemsPerHour": 0.07288629737609328
    },
    {
        "id": "58079",
        "tranId": "162",
        "tranDate": "7/18/2024",
        "systemNoteDate": "7/18/2024 7:52 am",
        "diffHours": 7.88,
        "itemsCount": 1,
        "itemsPerHour": 0.12690355329949238
    },
    {
        "id": "43304",
        "tranId": "157",
        "tranDate": "6/27/2024",
        "systemNoteDate": "6/27/2024 5:29 am",
        "diffHours": 5.5,
        "itemsCount": 1,
        "itemsPerHour": 0.18181818181818182
    },
    {
        "id": "35479",
        "tranId": "152",
        "tranDate": "6/12/2024",
        "systemNoteDate": "6/12/2024 10:05 am",
        "diffHours": 10.1,
        "itemsCount": 1,
        "itemsPerHour": 0.09900990099009901
    },
    {
        "id": "34557",
        "tranId": "139",
        "tranDate": "6/7/2024",
        "systemNoteDate": "6/7/2024 4:51 am",
        "diffHours": 4.86,
        "itemsCount": 1,
        "itemsPerHour": 0.20576131687242796
    },
    {
        "id": "34347",
        "tranId": "135",
        "tranDate": "6/5/2024",
        "systemNoteDate": "6/5/2024 11:54 am",
        "diffHours": 11.91,
        "itemsCount": 1,
        "itemsPerHour": 0.08396305625524769
    },
    {
        "id": "33740",
        "tranId": "129",
        "tranDate": "6/5/2024",
        "systemNoteDate": "6/5/2024 6:30 am",
        "diffHours": 6.51,
        "itemsCount": 1,
        "itemsPerHour": 0.15360983102918588
    },
    {
        "id": "33738",
        "tranId": "128",
        "tranDate": "6/5/2024",
        "systemNoteDate": "6/5/2024 6:27 am",
        "diffHours": 6.46,
        "itemsCount": 1,
        "itemsPerHour": 0.15479876160990713
    },
    {
        "id": "31278",
        "tranId": "117",
        "tranDate": "5/24/2024",
        "systemNoteDate": "5/24/2024 12:13 am",
        "diffHours": 0.22,
        "itemsCount": 1,
        "itemsPerHour": 4.545454545454546
    },
    {
        "id": "31275",
        "tranId": "116",
        "tranDate": "5/23/2024",
        "systemNoteDate": "5/23/2024 11:54 pm",
        "diffHours": 23.91,
        "itemsCount": 1,
        "itemsPerHour": 0.04182350480970305
    },
    {
        "id": "29170",
        "tranId": "101",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 3:50 pm",
        "diffHours": 15.84,
        "itemsCount": 1,
        "itemsPerHour": 0.06313131313131314
    },
    {
        "id": "28969",
        "tranId": "100",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 3:27 pm",
        "diffHours": 15.47,
        "itemsCount": 1,
        "itemsPerHour": 0.06464124111182934
    },
    {
        "id": "28664",
        "tranId": "97",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 11:43 am",
        "diffHours": 11.73,
        "itemsCount": 1,
        "itemsPerHour": 0.08525149190110827
    },
    {
        "id": "28461",
        "tranId": "94",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 8:42 am",
        "diffHours": 8.71,
        "itemsCount": 1,
        "itemsPerHour": 0.11481056257175659
    },
    {
        "id": "28460",
        "tranId": "93",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 8:25 am",
        "diffHours": 8.43,
        "itemsCount": 1,
        "itemsPerHour": 0.11862396204033215
    },
    {
        "id": "28359",
        "tranId": "92",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 8:09 am",
        "diffHours": 8.16,
        "itemsCount": 1,
        "itemsPerHour": 0.12254901960784313
    },
    {
        "id": "28258",
        "tranId": "91",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 8:02 am",
        "diffHours": 8.05,
        "itemsCount": 1,
        "itemsPerHour": 0.12422360248447203
    },
    {
        "id": "28157",
        "tranId": "90",
        "tranDate": "5/2/2024",
        "systemNoteDate": "5/2/2024 7:58 am",
        "diffHours": 7.97,
        "itemsCount": 1,
        "itemsPerHour": 0.12547051442910917
    },
    {
        "id": "28051",
        "tranId": "89",
        "tranDate": "5/1/2024",
        "systemNoteDate": "5/1/2024 1:34 pm",
        "diffHours": 13.58,
        "itemsCount": 1,
        "itemsPerHour": 0.07363770250368189
    },
    {
        "id": "27950",
        "tranId": "88",
        "tranDate": "5/1/2024",
        "systemNoteDate": "5/1/2024 1:16 pm",
        "diffHours": 13.28,
        "itemsCount": 1,
        "itemsPerHour": 0.07530120481927711
    },
    {
        "id": "27740",
        "tranId": "87",
        "tranDate": "4/30/2024",
        "systemNoteDate": "4/30/2024 7:39 am",
        "diffHours": 7.66,
        "itemsCount": 1,
        "itemsPerHour": 0.13054830287206265
    },
    {
        "id": "27739",
        "tranId": "86",
        "tranDate": "4/30/2024",
        "systemNoteDate": "4/30/2024 7:38 am",
        "diffHours": 7.64,
        "itemsCount": 1,
        "itemsPerHour": 0.13089005235602094
    },
    {
        "id": "27009",
        "tranId": "83",
        "tranDate": "4/16/2024",
        "systemNoteDate": "4/16/2024 6:09 am",
        "diffHours": 6.16,
        "itemsCount": 1,
        "itemsPerHour": 0.16233766233766234
    },
    {
        "id": "25160",
        "tranId": "70",
        "tranDate": "2/23/2024",
        "systemNoteDate": "2/23/2024 8:23 am",
        "diffHours": 8.39,
        "itemsCount": 1,
        "itemsPerHour": 0.11918951132300357
    },
    {
        "id": "25159",
        "tranId": "69",
        "tranDate": "2/23/2024",
        "systemNoteDate": "2/23/2024 8:23 am",
        "diffHours": 8.39,
        "itemsCount": 1,
        "itemsPerHour": 0.11918951132300357
    },
    {
        "id": "24541",
        "tranId": "68",
        "tranDate": "2/12/2024",
        "systemNoteDate": "2/12/2024 6:36 am",
        "diffHours": 6.61,
        "itemsCount": 1,
        "itemsPerHour": 0.151285930408472
    },
    {
        "id": "24540",
        "tranId": "67",
        "tranDate": "2/12/2024",
        "systemNoteDate": "2/12/2024 6:35 am",
        "diffHours": 6.59,
        "itemsCount": 1,
        "itemsPerHour": 0.15174506828528073
    },
    {
        "id": "6616",
        "tranId": "43",
        "tranDate": "9/9/2023",
        "systemNoteDate": "9/9/2023 5:57 am",
        "diffHours": 5.96,
        "itemsCount": 1,
        "itemsPerHour": 0.16778523489932887
    },
    {
        "id": "5882",
        "tranId": "38",
        "tranDate": "9/7/2023",
        "systemNoteDate": "9/7/2023 2:15 pm",
        "diffHours": 14.26,
        "itemsCount": 1,
        "itemsPerHour": 0.07012622720897616
    },
    {
        "id": "4322",
        "tranId": "19",
        "tranDate": "8/22/2023",
        "systemNoteDate": "8/22/2023 1:30 am",
        "diffHours": 1.51,
        "itemsCount": 1,
        "itemsPerHour": 0.6622516556291391
    },
    {
        "id": "4321",
        "tranId": "18",
        "tranDate": "8/22/2023",
        "systemNoteDate": "8/22/2023 1:30 am",
        "diffHours": 1.51,
        "itemsCount": 1,
        "itemsPerHour": 0.6622516556291391
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
                <p className="font-medium mb-1">Picking Efficiency - Items/Hour</p>
                <p>Items picked per hour based on fulfillment data</p>
              </div>
            </TooltipContent>
          </UITooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

const PickingEfficiencyLineChart: React.FC<PickingEfficiencyLineChartProps> = ({ 
  data, 
  isLoading: propIsLoading, 
  title = "Picking Efficiency - Items Picked/Hour" 
}) => {
  const [selectedView, setSelectedView] = useState<ViewType>("this_year");
  const [selectedSubView, setSelectedSubView] = useState<string>("this_year_months");
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
        if (!suiteletUrl || suiteletUrl.includes('{{') || suiteletUrl.includes('}}')) {
          // console.log("SuiteletUrl contains template placeholders, using mockup data");
          setPickingData(mockupPickingData);
          setIsLoading(false);
          return;
        }

        const url = `${suiteletUrl}&mode=getPickedFulfillments`;
        // console.log('Fetching picking efficiency data from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch picking efficiency data: ${response.status}`);
        }
        
        const result: PickingEfficiencyData[] = await response.json();
        console.log('Picking efficiency data result:', result);
        
        setPickingData(result);
      } catch (error) {
        console.error("Error fetching picking efficiency data:", error);
        setPickingData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPickingEfficiencyData();
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

  // Function to calculate picking efficiency based on time periods and sub-view selection
  const calculatePeriodEfficiency = (viewType: ViewType, subViewValue: string) => {
    const now = new Date();
    const subView = SUB_VIEW_OPTIONS[viewType]?.find(opt => opt.value === subViewValue);
    if (!subView) {
      // console.log(`No subview found for viewType: ${viewType}, subViewValue: ${subViewValue}`);
      return [];
    }
    
    // Parse the picking data and calculate actual diff hours
    const parsedPickingData = pickingData.map(item => {
      const actualDiffHours = item.diffHours;
      // console.log(`Record ${item.id}: ${item.tranDate} ${item.systemNoteDate} = ${actualDiffHours} hours`);
      
      return {
        ...item,
        tranDate: new Date(item.tranDate),
        fulfillmentDate: new Date(item.systemNoteDate),
        calculatedDiffHours: actualDiffHours
      };
    });

    // console.log(`Calculating efficiency for ${viewType} with ${parsedPickingData.length} records`);
    // console.log('>>>>', parsedPickingData);

    const periods: { data: typeof parsedPickingData; label: string }[] = [];

    for (let i = 0; i < subView.bars; i++) {
      let periodData: typeof parsedPickingData = [];
      let label = "";

      switch (viewType) {
        case "this_year":
          // Break down current year by months
          const currentYear = now.getFullYear();
          const targetMonth = 11 - i; // December to January (11 to 0)
          
          periodData = parsedPickingData.filter(item => 
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
          
          periodData = parsedPickingData.filter(item => 
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

          periodData = parsedPickingData.filter(item => 
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
          
          periodData = parsedPickingData.filter(item => {
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

          periodData = parsedPickingData.filter(item => 
            item.fulfillmentDate >= hourStart && item.fulfillmentDate <= hourEnd
          );
          
          label = `${targetHour}:00-${Math.min(targetHour + 3, 24)}:00`;
          break;

        // ... keep existing code for other cases (YoY, QoQ, MoM, WoW, DoD)
        case "YoY":
          const targetYear = now.getFullYear() - i;
          periodData = parsedPickingData.filter(item => item.fulfillmentDate.getFullYear() === targetYear);
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

          periodData = parsedPickingData.filter(item => {
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

          periodData = parsedPickingData.filter(item => 
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

          periodData = parsedPickingData.filter(item => 
            item.fulfillmentDate >= currentWeekStart && item.fulfillmentDate <= currentWeekEnd
          );
          
          label = i === 0 ? "Current" : `Week -${i}`;
          break;

        case "DoD":
          const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);

          periodData = parsedPickingData.filter(item => {
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

  // console.log('Picking efficiency line chart transformed data:', transformedData);

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
              <linearGradient id="pickingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
              stroke="#3b82f6" 
              strokeWidth={3}
              fill="url(#pickingGradient)"
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
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

export default PickingEfficiencyLineChart;
