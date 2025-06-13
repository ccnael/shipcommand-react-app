import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "../ui/skeleton";
import { Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "lucide-react";
import { getSuiteletUrl } from "@/lib/helpers";

interface FulfillmentThroughputData {
  period: string;
  ordersCreated: number;
  ordersShipped: number;
}

interface FulfillmentThroughputChartProps {
  data: FulfillmentThroughputData[];
  isLoading: boolean;
}

type ViewType = "YoY" | "QoQ" | "MoM" | "WoW" | "DoD" | "this_year" | "this_quarter" | "this_month" | "this_week" | "today";

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

// Fetch data from API endpoints with chunked approach
const fetchFulfillmentData = async (viewType: ViewType, subViewValue: string): Promise<FulfillmentThroughputData[]> => {
  try {
    // Check if running locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '::1';
    
    if (isLocalhost) {
      console.log("Running locally - using mock fulfillment throughput data");
      return generateMockData(viewType, subViewValue);
    }

    const suiteletUrl = getSuiteletUrl();
    const chunkSize = 500;
    let allOrdersCreatedData: any[] = [];
    let allOrdersShippedData: any[] = [];

    // Fetch orders created data in chunks
    let hasMoreCreatedData = true;
    let createdIndex = 0;
    
    while (hasMoreCreatedData) {
      const start = 0 + (createdIndex * chunkSize);
      const end = chunkSize + (createdIndex * chunkSize);
      const url = `${suiteletUrl}&mode=getFulfillThroughputOrdersCreated&start=${start}&end=${end}`;
      const response = await fetch(url);
      console.log(`FulfillmentThroughput ORDERS CREATED chunk ${createdIndex + 1}:`, response);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders created data chunk ${createdIndex + 1}: ${response.status}`);
      }
      
      const chunkData = await response.json();
      console.log(`FulfillmentThroughput ORDERS CREATED RESULT chunk ${createdIndex + 1}:`, chunkData);
      
      // Check if we got data in this chunk
      if (!chunkData || chunkData.length === 0) {
        hasMoreCreatedData = false;
      } else {
        // Add chunk data to our collection
        allOrdersCreatedData = [...allOrdersCreatedData, ...chunkData];

        // If we got less than the chunk size, we've reached the end
        if (chunkData.length < chunkSize) {
          hasMoreCreatedData = false;
        }
      }
      
      createdIndex++;
    }

    // Fetch orders shipped data in chunks
    let hasMoreShippedData = true;
    let shippedIndex = 0;
    
    while (hasMoreShippedData) {
      const start = 0 + (shippedIndex * chunkSize);
      const end = chunkSize + (shippedIndex * chunkSize);
      const url = `${suiteletUrl}&mode=getFulfillThroughputOrdersShipped&start=${start}&end=${end}`;
      const response = await fetch(url);
      console.log(`FulfillmentThroughput ORDERS SHIPPED chunk ${shippedIndex + 1}:`, response);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders shipped data chunk ${shippedIndex + 1}: ${response.status}`);
      }
      
      const chunkData = await response.json();
      console.log(`FulfillmentThroughput ORDERS SHIPPED RESULT chunk ${shippedIndex + 1}:`, chunkData);
      
      // Check if we got data in this chunk
      if (!chunkData || chunkData.length === 0) {
        hasMoreShippedData = false;
      } else {
        // Add chunk data to our collection
        allOrdersShippedData = [...allOrdersShippedData, ...chunkData];

        // If we got less than the chunk size, we've reached the end
        if (chunkData.length < chunkSize) {
          hasMoreShippedData = false;
        }
      }
      
      shippedIndex++;
    }

    console.log('Total Orders Created Data:', allOrdersCreatedData.length, 'records');
    console.log('Total Orders Shipped Data:', allOrdersShippedData.length, 'records');

    // Transform the API data to match our chart format
    const transformedData = transformApiData(allOrdersCreatedData, allOrdersShippedData, viewType, subViewValue);
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching fulfillment throughput data:', error);
    // Fallback to mock data on error
    return [];//generateMockData(viewType, subViewValue);
  }
};

// Transform API data to chart format
const transformApiData = (
  ordersCreatedData: any[], 
  ordersShippedData: any[], 
  viewType: ViewType, 
  subViewValue: string
): FulfillmentThroughputData[] => {
  // console.log('Transforming API data for viewType:', viewType, 'subView:', subViewValue);
  console.log('Orders Created Data:', ordersCreatedData);
  console.log('Orders Shipped Data:', ordersShippedData);
  
  const subView = SUB_VIEW_OPTIONS[viewType]?.find(opt => opt.value === subViewValue);
  if (!subView) {
    console.log(`No subview found for viewType: ${viewType}, subViewValue: ${subViewValue}`);
    return [];
  }

  // Group data by time periods
  const createdByPeriod: Record<string, number> = {};
  const shippedByPeriod: Record<string, number> = {};

  // Process orders created data - use dateCreated for created orders
  ordersCreatedData.forEach(order => {
    if (order.dateCreated) {
      const date = parseDate(order.dateCreated);
      if (date && isDateInValidRange(date, viewType, subViewValue)) {
        const period = getPeriodFromDate(date, viewType, subView.bars);
        createdByPeriod[period] = (createdByPeriod[period] || 0) + 1;
      }
    }
  });

  // Process orders shipped data - use systemNoteDate for shipped orders
  ordersShippedData.forEach(order => {
    if (order.systemNoteDate) {
      const date = parseDate(order.systemNoteDate);
      if (date && isDateInValidRange(date, viewType, subViewValue)) {
        const period = getPeriodFromDate(date, viewType, subView.bars);
        shippedByPeriod[period] = (shippedByPeriod[period] || 0) + 1;
      }
    }
  });

  // Generate period labels
  const periods = generatePeriodLabels(viewType, subView.bars, subViewValue);

  // Create chart data
  const chartData = periods.map(period => ({
    period,
    ordersCreated: createdByPeriod[period] || 0,
    ordersShipped: shippedByPeriod[period] || 0
  }));

  console.log('Final chart data:', chartData);
  return chartData;
};

// Helper function to parse different date formats
const parseDate = (dateString: string): Date | null => {
  try {
    // Handle formats like "1/15/2025", "7/18/2024"
    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Handle other date formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};

// Helper function to check if date is in valid range for the view type
const isDateInValidRange = (date: Date, viewType: ViewType, subViewValue: string): boolean => {
  const now = new Date();
  
  switch (viewType) {
    case "this_year":
      return date.getFullYear() === now.getFullYear();
    
    case "this_quarter":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const dateQuarter = Math.floor(date.getMonth() / 3);
      return date.getFullYear() === now.getFullYear() && dateQuarter === currentQuarter;
    
    case "this_month":
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    
    case "this_week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return date >= startOfWeek && date <= endOfWeek;
    
    case "today":
      return date.toDateString() === now.toDateString();
    
    case "YoY":
      // For YoY, include current year and previous years based on subViewValue
      const yearsBack = parseInt(subViewValue);
      const currentYear = now.getFullYear();
      const earliestYear = currentYear - yearsBack;
      return date.getFullYear() >= earliestYear && date.getFullYear() <= currentYear;
    
    case "QoQ":
      // For QoQ, include current quarter and previous quarters
      const quartersBack = parseInt(subViewValue);
      const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const earliestQuarterStart = new Date(currentQuarterStart);
      earliestQuarterStart.setMonth(earliestQuarterStart.getMonth() - (quartersBack * 3));
      return date >= earliestQuarterStart;
    
    case "MoM":
      // For MoM, include current month and previous months
      const monthsBack = parseInt(subViewValue);
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const earliestMonthStart = new Date(currentMonthStart);
      earliestMonthStart.setMonth(earliestMonthStart.getMonth() - monthsBack);
      return date >= earliestMonthStart;
    
    case "WoW":
      // For WoW, include current week and previous weeks
      const weeksBack = parseInt(subViewValue);
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);
      const earliestWeekStart = new Date(currentWeekStart);
      earliestWeekStart.setDate(earliestWeekStart.getDate() - (weeksBack * 7));
      return date >= earliestWeekStart;
    
    case "DoD":
      // For DoD, include today and previous days
      const daysBack = parseInt(subViewValue);
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const earliestDayStart = new Date(todayStart);
      earliestDayStart.setDate(earliestDayStart.getDate() - daysBack);
      return date >= earliestDayStart;
    
    default:
      return true;
  }
};

// Helper function to get period from date
const getPeriodFromDate = (date: Date, viewType: ViewType, bars: number): string => {
  const now = new Date();

  switch (viewType) {
    case "this_year":
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[date.getMonth()];
    
    case "this_quarter":
      const thisQuarter = Math.floor(now.getMonth() / 3);
      const quarterStartMonth = thisQuarter * 3;
      const monthInQuarter = date.getMonth() - quarterStartMonth;
      if (monthInQuarter >= 0 && monthInQuarter < 3) {
        const quarterMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return quarterMonthNames[quarterStartMonth + monthInQuarter];
      }
      return "Other";
    
    case "this_month":
      return `Week ${4 - bars}`;
    
    case "this_week":
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return dayNames[date.getDay()];
    
    case "today":
      const hour = Math.floor(date.getHours() / 3) * 3;
      return `${hour}:00-${Math.min(hour + 3, 24)}:00`;
    
    case "YoY":
      return date.getFullYear().toString();
    
    case "QoQ":
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    
    case "MoM":
      const monthNames2 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames2[date.getMonth()]} ${date.getFullYear()}`;
    
    case "WoW":
      // Get week number
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      return `Week ${weekNumber}`;
    
    case "DoD":
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    default:
      return date.toLocaleDateString();
  }
};

// Helper function to generate period labels
const generatePeriodLabels = (viewType: ViewType, bars: number, subViewValue?: string): string[] => {
  const now = new Date();
  const periods: string[] = [];

  for (let i = 0; i < bars; i++) {
    let label = "";

    switch (viewType) {
      case "this_year":
        const targetMonth = 11 - i;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        label = monthNames[targetMonth];
        break;

      case "this_quarter":
        const thisQuarter = Math.floor(now.getMonth() / 3);
        const quarterStartMonth = thisQuarter * 3;
        const targetQuarterMonth = quarterStartMonth + (2 - i);
        const quarterMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        label = quarterMonthNames[targetQuarterMonth];
        break;

      case "this_month":
        label = `Week ${4 - i}`;
        break;

      case "this_week":
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        label = dayNames[6 - i];
        break;

      case "today":
        const targetHour = Math.max(0, 24 - (i + 1) * 3);
        label = `${targetHour}:00-${Math.min(targetHour + 3, 24)}:00`;
        break;

      case "YoY":
        const currentYear = now.getFullYear();
        const targetYear = currentYear - i;
        label = targetYear.toString();
        break;

      case "QoQ":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const currentQuarterYear = now.getFullYear();
        const targetQuarterIndex = (currentQuarter + 1) - i; // +1 because quarters are 1-indexed in display
        
        if (targetQuarterIndex > 0) {
          label = `Q${targetQuarterIndex} ${currentQuarterYear}`;
        } else {
          const yearsBack = Math.ceil(Math.abs(targetQuarterIndex) / 4);
          const quarterInPrevYear = 4 + (targetQuarterIndex % 4);
          label = `Q${quarterInPrevYear || 4} ${currentQuarterYear - yearsBack}`;
        }
        break;

      case "MoM":
        const currentMonth = now.getMonth();
        const currentMonthYear = now.getFullYear();
        const targetMonthIndex = currentMonth - i;
        
        if (targetMonthIndex >= 0) {
          const monthNames2 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          label = `${monthNames2[targetMonthIndex]} ${currentMonthYear}`;
        } else {
          const yearsBack = Math.ceil(Math.abs(targetMonthIndex) / 12);
          const monthInPrevYear = 12 + (targetMonthIndex % 12);
          const monthNames3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          label = `${monthNames3[monthInPrevYear - 1]} ${currentMonthYear - yearsBack}`;
        }
        break;

      case "WoW":
        // Get week number for current week minus i weeks
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - (i * 7));
        const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
        const days = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        label = `Week ${weekNumber}`;
        break;

      case "DoD":
        const targetDayDate = new Date(now);
        targetDayDate.setDate(now.getDate() - i);
        label = targetDayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;

      default:
        label = `Period ${bars - i}`;
        break;
    }

    periods.unshift(label);
  }

  return periods;
};

// Generate mock data based on time period and sub-view (fallback)
const generateMockData = (viewType: ViewType, subViewValue: string): FulfillmentThroughputData[] => {
  const subView = SUB_VIEW_OPTIONS[viewType]?.find(opt => opt.value === subViewValue);
  if (!subView) {
    console.log(`No subview found for viewType: ${viewType}, subViewValue: ${subViewValue}`);
    return [];
  }

  const periods = generatePeriodLabels(viewType, subView.bars, subViewValue);

  // Generate mock data for each period
  return periods.map((period) => {
    const baseCreated = Math.floor(Math.random() * 1000) + 500;
    const baseShipped = Math.floor(baseCreated * (0.85 + Math.random() * 0.15)); // 85-100% fulfillment rate
    
    return {
      period,
      ordersCreated: baseCreated,
      ordersShipped: baseShipped
    };
  });
};

const FulfillmentThroughputChart: React.FC<FulfillmentThroughputChartProps> = ({ 
  data, 
  isLoading 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ViewType>("this_year");
  const [selectedSubView, setSelectedSubView] = useState<string>("this_year_months");
  const [chartData, setChartData] = useState<FulfillmentThroughputData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Reset sub-view when main view changes
  useEffect(() => {
    if (selectedPeriod === "this_year") {
      setSelectedSubView("this_year_months");
    } else if (selectedPeriod === "this_quarter") {
      setSelectedSubView("this_quarter_months");
    } else if (selectedPeriod === "this_month") {
      setSelectedSubView("this_month_weeks");
    } else if (selectedPeriod === "this_week") {
      setSelectedSubView("this_week_days");
    } else if (selectedPeriod === "today") {
      setSelectedSubView("today_hours");
    } else if (selectedPeriod === "YoY") {
      setSelectedSubView("4");
    } else if (selectedPeriod === "MoM") {
      setSelectedSubView("5");
    } else {
      setSelectedSubView("1");
    }
  }, [selectedPeriod]);

  // Fetch data when period or subview changes
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const newData = await fetchFulfillmentData(selectedPeriod, selectedSubView);
        // console.log('>>>', newData);
        setChartData(newData);
      } catch (error) {
        console.error('Error loading fulfillment throughput data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod, selectedSubView]);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod as ViewType);
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
                  {entry.dataKey === 'ordersCreated' && (
                    <div>
                      <p className="font-medium mb-1">Orders Created</p>
                      <p>Number of orders created in the selected time period</p>
                    </div>
                  )}
                  {entry.dataKey === 'ordersShipped' && (
                    <div>
                      <p className="font-medium mb-1">Orders Shipped</p>
                      <p>Number of orders that have been shipped and fulfilled</p>
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

  if (isLoading) {
    /* return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Fulfillment Throughput</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    ); */
    return (
      <div className="h-[250px]">
        <div className="px-6 pb-6">
          <div className="h-[250px] flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm">Fulfillment Throughput</CardTitle>
            <p className="text-xs text-muted-foreground">
              Orders created vs orders shipped
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[160px] h-8">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIEW_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {SUB_VIEW_OPTIONS[selectedPeriod] && SUB_VIEW_OPTIONS[selectedPeriod].length > 1 && (
              <Select value={selectedSubView} onValueChange={setSelectedSubView}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Select period range" />
                </SelectTrigger>
                <SelectContent>
                  {SUB_VIEW_OPTIONS[selectedPeriod].map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {dataLoading ? (
          <div className="h-[250px]">
            <div className="px-6 pb-6">
              <div className="h-[250px] flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 0,
                }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="period" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <Tooltip content={customTooltip} />
                <Legend 
                  content={<CustomLegendWithTooltips />}
                  wrapperStyle={{ position: 'relative', marginTop: '0px' }}
                />
                <Bar 
                  dataKey="ordersCreated" 
                  name="Orders Created"
                  fill="#3b82f6" 
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="ordersShipped" 
                  name="Orders Shipped"
                  fill="#10b981" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FulfillmentThroughputChart;
