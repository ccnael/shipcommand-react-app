import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { ChartDataItem } from "@/hooks/use-chart-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Package, Loader } from "lucide-react";
import { suiteletUrl } from "@/lib/constants";
import MultiSelectFilter from "@/components/filters/MultiSelectFilter";
import { Option } from "@/components/ui-custom/MultiSelect";

interface DailyOrderVolumeChartProps {
  data: ChartDataItem[];
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

// Colors for different items
const ITEM_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
];

const DailyOrderVolumeChart: React.FC<DailyOrderVolumeChartProps> = ({ 
  data, 
  isLoading 
}) => {
  const [selectedView, setSelectedView] = useState<ViewType>("this_year");
  const [selectedSubView, setSelectedSubView] = useState<string>("this_year_months");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [itemOptions, setItemOptions] = useState<Option[]>([]);

  // Function to fetch items from the API with chunking data
  const fetchItemOptions = async (): Promise<Option[]> => {
    try {
      // Check if running locally
      const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '::1';
      
      if (isLocalhost) {
        console.log("Running locally - using mock item options");
        const mockOptions = [
          { label: "Black Pants for Men", value: "1417" },
          { label: "Item B", value: "2" },
          { label: "Item C", value: "3" },
          { label: "Item D", value: "4" },
          { label: "Item E", value: "5" },
        ];
        setItemOptions(mockOptions);
        return mockOptions;
      }

      let allItems: Option[] = [];
      let start = 0;
      const limit = 500;
      let hasMoreData = true;

      // Fetch data in chunks of 500
      while (hasMoreData) {
        const url = `${suiteletUrl}&mode=getDailyOrderVolumeItems&start=${start}&end=${limit}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Daily order volume items data (offset ${start}):`, data);
        
        // Map API response: [{ id: 123, itemid: 'Item A' }]
        const mappedItems = data.map((item: any) => ({
          label: item.itemid,
          value: String(item.id) // Use id as value for filtering
        }));
        
        allItems = [...allItems, ...mappedItems];
        
        // Check if we got less data than the limit, indicating no more data
        if (data.length < limit) {
          hasMoreData = false;
        } else {
          start += limit;
        }
      }
      
      console.log(`Total daily order volume items fetched: ${allItems.length}`);
      setItemOptions(allItems);
      return allItems;
    } catch (error) {
      console.error("Error fetching daily order volume items:", error);
      // Return mock data as fallback
      const fallbackOptions: Option[] = [];
      setItemOptions(fallbackOptions);
      return fallbackOptions;
    }
  };

  // Function to calculate date range based on selected view
  const calculateDateRange = (viewType: ViewType) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (viewType) {
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st
        endDate = new Date(now.getFullYear(), 11, 31); // December 31st
        break;
      case "this_quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "this_week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6);
        break;
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      default:
        // For comparison views (YoY, QoQ, etc.), use current period
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
    }

    return {
      startdate: `${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getDate().toString().padStart(2, '0')}/${startDate.getFullYear()}`,
      enddate: `${(endDate.getMonth() + 1).toString().padStart(2, '0')}/${endDate.getDate().toString().padStart(2, '0')}/${endDate.getFullYear()}`
    };
  };

  // Function to fetch chart data from API
  const fetchChartData = async () => {
    try {
      setIsChartLoading(true);
      
      // Check if running locally
      const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '::1';
      
      if (isLocalhost) {
        console.log("Running locally - using mock chart data");
        // Use the existing generatePeriodData function for mock data
        setChartData(generatePeriodData());
        return;
      }

      const { startdate, enddate } = calculateDateRange(selectedView);
      let tranLines: any[] = [];
      let start = 0;
      const limit = 500;
      let hasMoreData = true;

      // Fetch data in chunks of 500
      while (hasMoreData) {
        let url = `${suiteletUrl}&mode=getDailyOrderVolumeOrders&startdate=${encodeURIComponent(startdate)}&enddate=${encodeURIComponent(enddate)}&start=${start}&end=${limit}`;
        
        // Add selected items to the request if any are selected
        if (selectedItems.length > 0) {
          url += `&items=${selectedItems.join(',')}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const chunkData = await response.json();
        tranLines = [...tranLines, ...chunkData];
        
        // Check if we got less data than the limit, indicating no more data
        if (chunkData.length < limit) {
          hasMoreData = false;
        } else {
          start += limit;
        }
      }
      
      console.log(`Total daily order volume orders fetched: ${tranLines.length}`);

      const allOrders = [];

      // Consolidate transaction line items by order id
      tranLines.forEach(tranLine => {
        const idx = allOrders.findIndex(x => x.id === tranLine.id)
        if (idx > -1) {
          allOrders[idx].items.push({
            ...tranLine.item
          });
        } else {
          allOrders.push({
            ...tranLine,
            items: [{
              ...tranLine.item
            }],
            get quantity() {
              return this.items.reduce((x, y) => x += y.quantity, 0)
            }
          });
        }
      });

      console.log('Consolidated Orders', allOrders);
      
      // Process chart data based on selected view and sub-view
      const processedData = processDataByView(allOrders, selectedView, selectedSubView);
      setChartData(processedData);
      
    } catch (error) {
      console.error("Error fetching daily order volume chart data:", error);
      // Fall back to mock data
      setChartData([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  // Helper function to parse date from the API format "M/D/YYYY H:MM am/pm"
  const parseApiDate = (dateString: string): Date => {
    try {
      // Clean the date string and handle different formats
      const cleanDateString = dateString.trim().replace(/\s+/g, ' ');
      
      // Split the date string: "5/13/2025 1:26 pm"
      const parts = cleanDateString.split(' ');
      if (parts.length < 3) {
        throw new Error('Invalid date format');
      }
      
      const datePart = parts[0]; // "5/13/2025"
      const timePart = parts[1]; // "1:26"
      const ampm = parts[2]?.toLowerCase(); // "pm"
      
      const [month, day, year] = datePart.split('/').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      let hour24 = hours;
      if (ampm === 'pm' && hours !== 12) {
        hour24 = hours + 12;
      } else if (ampm === 'am' && hours === 12) {
        hour24 = 0;
      }
      
      return new Date(year, month - 1, day, hour24, minutes || 0);
    } catch (error) {
      console.warn('Failed to parse date:', dateString, error);
      return new Date(); // Fallback to current date
    }
  };

  // New function to process data based on view type
  const processDataByView = (orders: any[], viewType: ViewType, subView: string) => {
    if (orders.length === 0) return [];

    const now = new Date();
    const subViewConfig = SUB_VIEW_OPTIONS[viewType]?.find(opt => opt.value === subView);
    if (!subViewConfig) return [];

    let periods: Array<{ label: string; fullDate: string; start: Date; end: Date }> = [];

    // Generate periods based on view type and sub-view
    switch (viewType) {
      case "YoY":
        const yearsToShow = parseInt(subView) + 1;
        for (let i = 0; i < yearsToShow; i++) {
          const targetYear = now.getFullYear() - i;
          const start = new Date(targetYear, 0, 1);
          const end = new Date(targetYear, 11, 31, 23, 59, 59);
          periods.push({
            label: targetYear.toString(),
            fullDate: `Year ${targetYear}`,
            start,
            end
          });
        }
        break;

      case "this_quarter":
        // Fix the quarter calculation to prevent infinite loop
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Generate months for current quarter
        for (let i = 0; i < 3; i++) {
          const monthIndex = currentQuarter * 3 + i;
          if (monthIndex < 12) { // Ensure we don't go beyond December
            const start = new Date(now.getFullYear(), monthIndex, 1);
            const end = new Date(now.getFullYear(), monthIndex + 1, 0, 23, 59, 59);
            periods.push({
              label: monthNames[monthIndex],
              fullDate: `${monthNames[monthIndex]} ${now.getFullYear()}`,
              start,
              end
            });
          }
        }
        break;

      case "QoQ":
        const quartersToShow = parseInt(subView) + 1;
        for (let i = 0; i < quartersToShow; i++) {
          const currentQuarterNum = Math.floor(now.getMonth() / 3);
          let targetQuarter = currentQuarterNum - i;
          let targetYear = now.getFullYear();
          
          // Handle negative quarters by going to previous year
          while (targetQuarter < 0) {
            targetQuarter += 4;
            targetYear -= 1;
          }

          const start = new Date(targetYear, targetQuarter * 3, 1);
          const end = new Date(targetYear, targetQuarter * 3 + 3, 0, 23, 59, 59);
          periods.push({
            label: `Q${targetQuarter + 1} ${targetYear}`,
            fullDate: `Quarter ${targetQuarter + 1} of ${targetYear}`,
            start,
            end
          });
        }
        break;

      case "MoM":
        const monthsToShow = parseInt(subView) + 1;
        for (let i = 0; i < monthsToShow; i++) {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          periods.push({
            label: `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`,
            fullDate: `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`,
            start,
            end
          });
        }
        break;

      case "WoW":
        const weeksToShow = parseInt(subView) + 1;
        for (let i = 0; i < weeksToShow; i++) {
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() - (i * 7));
          const weekStart = new Date(targetDate);
          weekStart.setDate(targetDate.getDate() - targetDate.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59);
          
          periods.push({
            label: `Week ${i === 0 ? 'Current' : i}`,
            fullDate: `Week of ${weekStart.toLocaleDateString()}`,
            start: weekStart,
            end: weekEnd
          });
        }
        break;

      case "DoD":
        const daysToShow = parseInt(subView) + 1;
        for (let i = 0; i < daysToShow; i++) {
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() - i);
          const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);
          
          periods.push({
            label: targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            fullDate: targetDate.toLocaleDateString(),
            start,
            end
          });
        }
        break;

      // For current period views, use the existing logic
      case "this_year":
        const monthNamesYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 0; i < 12; i++) {
          const start = new Date(now.getFullYear(), i, 1);
          const end = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59);
          periods.push({
            label: monthNamesYear[i],
            fullDate: `${monthNamesYear[i]} ${now.getFullYear()}`,
            start,
            end
          });
        }
        break;

      default:
        return generatePeriodData(); // Fallback to mock data
    }

    // Process orders for each period
    const chartData = periods.map(period => {
      const periodOrders = orders.filter(order => {
        const orderDate = parseApiDate(order.dateCreated);
        return orderDate >= period.start && orderDate <= period.end;
      });

      const dataPoint: any = {
        period: period.label,
        fullDate: period.fullDate,
      };

      if (selectedItems.length === 0) {
        // Aggregated data
        dataPoint.orders = periodOrders.length;
        dataPoint.quantity = periodOrders.reduce((sum, order) => {
          const totalQuantity = order.items && order.items.length > 0
            ? order.items.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0)
            : (order.quantity || 0);
          return sum + totalQuantity;
        }, 0);
      } else {
        // Item-specific data
        selectedItems.forEach(itemId => {
          const itemKey = `item_${itemId}`;
          dataPoint[itemKey] = periodOrders.reduce((sum, order) => {
            if (order.items) {
              const itemQuantity = order.items
                .filter((item: any) => String(item.id) === itemId)
                .reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0);
              return sum + itemQuantity;
            }
            return sum;
          }, 0);
        });
      }

      return dataPoint;
    });

    return chartData.reverse(); // Show most recent first
  };

  const handleItemsChange = (selected: string[]) => {
    if (selected.length <= 5) {
      setSelectedItems(selected);
    }
  };

  // Reset sub-view when main view changes and fetch new data
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

    // Fetch new chart data when view changes
    fetchChartData();
  }, [selectedView]);

  // Fetch chart data when sub-view changes
  useEffect(() => {
    fetchChartData();
  }, [selectedSubView]);

  // Fetch chart data when selected items change
  useEffect(() => {
    fetchChartData();
  }, [selectedItems]);

  // Generate period-specific data based on selected view and sub-view (fallback/mock data)
  const generatePeriodData = () => {
    // Use the sample data format you provided
    const sampleOrders = [
      {
        "id": "206097",
        "tranid": "676", 
        "dateCreated": "5/13/2025 1:26 pm",
        "items": [{"id": "1417", "itemid": "Black Pants for Men", "quantity": 1}],
        "quantity": 1
      },
      {
        "id": "197494",
        "tranid": "625",
        "dateCreated": "4/2/2025 1:09 pm", 
        "items": [{"id": "1417", "itemid": "Black Pants for Men", "quantity": 1}],
        "quantity": 1
      },
      {
        "id": "194406",
        "tranid": "605",
        "dateCreated": "3/18/2025 11:26 pm",
        "items": [{"id": "1417", "itemid": "Black Pants for Men", "quantity": 1}],
        "quantity": 1
      },
      {
        "id": "194389", 
        "tranid": "593",
        "dateCreated": "3/18/2025 9:15 pm",
        "items": [{"id": "1417", "itemid": "Black Pants for Men", "quantity": 1}],
        "quantity": 1
      },
      {
        "id": "194288",
        "tranid": "592", 
        "dateCreated": "3/18/2025 9:11 pm",
        "items": [{"id": "1417", "itemid": "Black Pants for Men", "quantity": 1}],
        "quantity": 1
      },
      {
        "id": "194287",
        "tranid": "591",
        "dateCreated": "3/18/2025 6:00 pm",
        "items": [{"id": "1417", "itemid": "Black Pants for Men", "quantity": 1}],
        "quantity": 1
      }
    ];

    return processDataByView(sampleOrders, selectedView, selectedSubView);
  };

  // Calculate total quantity for each selected item across all periods
  const calculateItemTotalQuantity = (itemId: string) => {
    return chartData.reduce((total, dataPoint) => {
      const itemKey = `item_${itemId}`;
      return total + (dataPoint[itemKey] || 0);
    }, 0);
  };

  // Custom tooltip component with total quantity display for items
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      
      // Calculate total quantity for selected items in this period
      let totalItemQuantity = 0;
      if (selectedItems.length > 0) {
        selectedItems.forEach(itemId => {
          const itemKey = `item_${itemId}`;
          totalItemQuantity += data[itemKey] || 0;
        });
      }
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="font-medium text-sm mb-2 text-gray-900">{data?.fullDate || label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value !== undefined && entry.value !== null) {
              if (entry.dataKey === 'orders') {
                return (
                  <div key={index} className="text-sm text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                      <span>{entry.value} sales orders</span>
                    </div>
                  </div>
                );
              } else if (entry.dataKey === 'quantity') {
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                    <span>{entry.value} total quantity</span>
                  </div>
                );
              } else if (entry.dataKey.startsWith('item_')) {
                const itemId = entry.dataKey.replace('item_', '');
                const itemName = itemOptions.find(opt => opt.value === itemId)?.label || `Item ${itemId}`;
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                    <span>{itemName}: {entry.value}</span>
                  </div>
                );
              }
            }
            return null;
          })}
          {/* Show total quantity for selected items */}
          {selectedItems.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-900">
                Total quantity: {totalItemQuantity}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom legend component with tooltips showing total quantities
  const CustomLegendWithTooltips = ({ payload }: any) => {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex justify-center mb-4 text-xs text-muted-foreground gap-6 flex-wrap">
          {payload?.map((entry: any, index: number) => {
            const isItemEntry = entry.dataKey?.startsWith('item_');
            const itemId = isItemEntry ? entry.dataKey.replace('item_', '') : null;
            const totalQuantity = itemId ? calculateItemTotalQuantity(itemId) : null;
            
            return (
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
                    {entry.dataKey === 'orders' && (
                      <div>
                        <p className="font-medium mb-1">Sales Orders Created</p>
                        <p>Number of sales orders created per time period based on the order creation date</p>
                      </div>
                    )}
                    {entry.dataKey === 'quantity' && (
                      <div>
                        <p className="font-medium mb-1">Total Order Quantity</p>
                        <p>Total quantity of all items across all sales orders created in the time period</p>
                      </div>
                    )}
                    {isItemEntry && (
                      <div>
                        <p className="font-medium mb-1">{entry.value}</p>
                        <p className="mb-2">Total quantity of this item ordered in the time period</p>
                        <div className="pt-2 border-t border-gray-200">
                          <p className="font-medium text-blue-600">
                            Total period quantity: {totalQuantity}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </UITooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daily Order Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-sm">Daily Order Volume</CardTitle>
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
                    <SelectValue placeholder="Select sub-view" />
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
              
              <div className="relative">
                <div className="absolute -top-6 left-0 z-10">
                  <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-2 py-1 rounded text-xs whitespace-nowrap">
                    Selection is limited to 5 items
                  </div>
                </div>
                <MultiSelectFilter
                  id="daily-order-volume-items"
                  label=""
                  options={itemOptions}
                  selected={selectedItems}
                  onChange={handleItemsChange}
                  placeholder="Select items"
                  maxDisplay={3}
                  fetchOptionsOnOpen={fetchItemOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="px-6 pb-6">
          {isChartLoading ? (
            <div className="h-[260px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={255}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 0 }}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={<CustomLegendWithTooltips />}
                  wrapperStyle={{ position: 'relative', marginTop: '0px' }}
                />
                
                {/* Show aggregated lines when no items are selected */}
                {selectedItems.length === 0 && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      name="Sales Orders"
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                      name="Total Quantity"
                      connectNulls={false}
                    />
                  </>
                )}
                
                {/* Show individual item lines when items are selected */}
                {selectedItems.length > 0 && selectedItems.map((itemId, index) => {
                  const itemName = itemOptions.find(opt => opt.value === itemId)?.label || `Item ${itemId}`;
                  const color = ITEM_COLORS[index % ITEM_COLORS.length];
                  const dataKey = `item_${itemId}`;
                  
                  return (
                    <Line
                      key={itemId}
                      type="monotone"
                      dataKey={dataKey}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                      name={itemName}
                      connectNulls={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyOrderVolumeChart;
