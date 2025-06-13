
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { HeatmapData } from "./HeatmapChart";
import { CalendarRange, Loader } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addWeeks, subWeeks, format, startOfWeek, endOfWeek } from "date-fns";
import { suiteletUrl } from "@/lib/constants";

interface BlockHeatmapChartProps {
  data: HeatmapData[];
  isLoading: boolean;
  dateRange?: { from?: Date; to?: Date };
}

interface PeakHourApiResponse {
  id: string;
  tranid: string;
  dateCreated: string;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = [
  "12am", "1am", "2am", "3am", "4am", "5am", 
  "6am", "7am", "8am", "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
];

// Generate mock data if none is provided
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

// Transform API response to heatmap data
const transformApiResponseToHeatmapData = (apiData: PeakHourApiResponse[]): HeatmapData[] => {
  const heatmapData: HeatmapData[] = [];
  
  // Initialize all day/hour combinations with 0
  DAYS_OF_WEEK.forEach(day => {
    HOURS.forEach(hour => {
      heatmapData.push({
        day,
        hour,
        value: 0
      });
    });
  });
  
  // Count occurrences from API data
  const counts: { [key: string]: number } = {};
  
  apiData.forEach(item => {
    try {
      const date = new Date(item.dateCreated);
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate());
      const dayName = format(newDate, 'EEE'); // Get abbreviated day name
      const hour = format(newDate, 'ha').toLowerCase(); // Get hour in 12-hour format with am/pm
      
      const key = `${dayName}-${hour}`;
      counts[key] = (counts[key] || 0) + 1;
    } catch (error) {
      console.error('Error parsing date:', item.dateCreated, error);
    }
  });
  
  // Update heatmap data with actual counts
  heatmapData.forEach(item => {
    const key = `${item.day}-${item.hour}`;
    if (counts[key]) {
      item.value = Math.min(counts[key], 10); // Cap at 10 for color scaling
    }
  });
  
  return heatmapData;
};

// Get color based on value (0-10 scale)
const getHeatColor = (value: number): string => {
  // Color palette from low to high activity
  const colors = [
    "#F1F0FB", // Very low - soft gray
    "#E5DEFF", // Low - soft purple
    "#D3E4FD", // Below average - soft blue
    "#D6BCFA", // Below average - light purple
    "#9b87f5", // Average - primary purple
    "#8B5CF6", // Above average - vivid purple
    "#7E69AB", // High - secondary purple
    "#6E59A5", // Very high - tertiary purple
    "#D946EF", // Extremely high - magenta pink
    "#F97316"  // Peak - bright orange
  ];
  
  // Scale the value to an index (0-9)
  const index = Math.min(Math.floor(value), 9);
  return colors[index];
};

const getActivityLabel = (value: number): string => {
  if (value === 0) return "No activity";
  if (value < 3) return "Low activity";
  if (value < 6) return "Medium activity";
  if (value < 8) return "High activity";
  return "Very high activity";
};

type WeekOption = {
  label: string;
  startDate: Date;
  endDate: Date;
};

const BlockHeatmapChart: React.FC<BlockHeatmapChartProps> = ({ data, isLoading, dateRange: initialDateRange }) => {
  const today = new Date();
  
  // Generate week options (current week and previous weeks)
  const generateWeekOptions = (): WeekOption[] => {
    const options: WeekOption[] = [];
    for (let i = 0; i < 52; i++) { // Current week + 51 previous weeks
      const startDate = startOfWeek(subWeeks(today, i));
      const endDate = endOfWeek(subWeeks(today, i));
      options.push({
        label: i === 0 ? 
          "Current Week" : 
          `Week ${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`,
        startDate,
        endDate
      });
    }
    return options;
  };
  
  const weekOptions = generateWeekOptions();
  const [selectedWeek, setSelectedWeek] = useState<string>("0"); // Default to current week
  const [chartData, setChartData] = useState<HeatmapData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Fetch peak hour analysis data
  const fetchPeakHourData = async (startDate: Date, endDate: Date) => {
    try {
      setIsLoadingData(true);
      
      // Check if running locally
      const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '::1';
      
      if (isLocalhost) {
        console.log("Running locally - using mock peak hour data");
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setChartData(generateMockHeatmapData());
        return;
      }
      
      // Format dates for API
      const startDateStr = format(startDate, 'MM/dd/yyyy');
      const endDateStr = format(endDate, 'MM/dd/yyyy');
      
      const url = `${suiteletUrl}&mode=getPeakHourAnalysisResult&startdate=${encodeURIComponent(startDateStr)}&enddate=${encodeURIComponent(endDateStr)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const apiData: PeakHourApiResponse[] = await response.json();
      console.log('Peak hour analysis data:', apiData);
      
      const transformedData = transformApiResponseToHeatmapData(apiData);
      setChartData(transformedData);
      
    } catch (error) {
      console.error("Error fetching peak hour data:", error);
      // Fall back to mock data on error
      setChartData([]);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // Fetch data when component mounts or week selection changes
  useEffect(() => {
    const selectedWeekOption = weekOptions[parseInt(selectedWeek)];
    if (selectedWeekOption) {
      fetchPeakHourData(selectedWeekOption.startDate, selectedWeekOption.endDate);
    }
  }, [selectedWeek]);
  
  // Handle week selection change
  const handleWeekChange = (value: string) => {
    setSelectedWeek(value);
  };
  
  // Get the selected week data
  const selectedWeekOption = weekOptions[parseInt(selectedWeek)];

  // Helper function to get the exact date for a day in the selected week
  const getExactDateForDay = (dayName: string): Date => {
    const dayIndex = DAYS_OF_WEEK.indexOf(dayName); // 0=Sun, 1=Mon, etc.
    
    // Use the actual start date from the week option which represents the Sunday
    // The weekOptions are generated with startOfWeek which gives us the correct Sunday
    const sundayDate = new Date(selectedWeekOption.startDate);
    
    // Add the day index to get the correct day
    const exactDate = new Date(sundayDate);
    exactDate.setDate(sundayDate.getDate() + dayIndex);
    
    return exactDate;
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Peak Hour Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
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
          <CardTitle className="text-sm">Peak Hour Analysis</CardTitle>
          <div className="flex flex-col items-end">
            <p className="text-xs text-muted-foreground mb-1">Last 52 weeks</p>
            <Select value={selectedWeek} onValueChange={handleWeekChange}>
              <SelectTrigger className="w-[220px] h-8">
                <CalendarRange className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {weekOptions.map((option, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center">
        {isLoadingData ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading peak hour data...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-0.5 w-full max-w-7xl">
            {/* Hour labels row - Rotated vertically */}
            <div className="flex mb-2">
              <div className="w-10 flex-shrink-0"></div> {/* Space for day labels */}
              <div className="flex flex-grow gap-0.5">
                {HOURS.map((hour) => (
                  <div key={hour} className="flex-1 h-4 flex items-end justify-center">
                    <div 
                      className="text-[8.5px] text-gray-500 transform -rotate-45 origin-bottom whitespace-nowrap"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      {hour}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <TooltipProvider delayDuration={0}>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center">
                  <div className="w-10 text-xs font-medium text-gray-500 pr-2">{day}</div>
                  <div className="flex flex-grow gap-0.5">
                    {HOURS.map((hour) => {
                      const cellData = chartData.find(d => d.day === day && d.hour === hour);
                      const value = cellData ? cellData.value : 0;
                      const activityLabel = getActivityLabel(value);
                      const exactDate = getExactDateForDay(day);
                      
                      return (
                        <Tooltip key={`${day}-${hour}`}>
                          <TooltipTrigger asChild>
                          <div
                            className="h-8 w-5 flex-1 cursor-pointer duration-200 transform hover:scale-110 hover:opacity-80"
                            style={{ 
                              backgroundColor: getHeatColor(value),
                              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                              borderRadius: '5px'
                            }}
                          />
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={5} className="z-[9999]">
                            <div className="text-xs">
                              <div><strong>{format(exactDate, "EEEE, MMM d, yyyy")} at {hour}</strong></div>
                              <div>{activityLabel}</div>
                              <div>Records: {value}/10</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TooltipProvider>
            
            {/* Legend */}
            <div className="flex items-center justify-end mt-3">
              <div className="text-xs text-gray-500 mr-2">Activity:</div>
              <div className="flex gap-1">
                {[0, 2, 4, 6, 8].map((value) => (
                  <div
                    key={value}
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: getHeatColor(value) }}
                  />
                ))}
              </div>
              <div className="flex text-xs text-gray-500 ml-2">
                <span>Low</span>
                <span className="mx-1">-</span>
                <span>High</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockHeatmapChart;
