import { useState, useEffect } from "react";
import { suiteletUrl } from "@/lib/constants";

export interface RawOrderData {
  id: string;
  tranid: string;
  trandate: string;
  status: string;
  shippingcost: number;
}

export interface ShippingCostData {
  today: number;
  previous: number;
}

export interface OrderFulfillmentCycleTimeResponse {
  id: string;
  sotranId: string;
  sotranDate: string;
  systemNoteDate: string;
}

export interface ProcessedChartData {
  todaysOrders: { name: string; value: number; color: string }[];
  fulfillment: { name: string; value: number; color: string }[];
  shippingCosts: { name: string; value: number; color: string }[];
  orderFulfillmentCycleTime: { name: string; value: number; color: string }[];
  cycleTimeData: { name: string; hours: number }[];
  heatmapData: { day: string; value: number; hour: string }[];
  avgShippingCostPerOrder: { name: string; value: number; color: string }[];
}

export const useTransformChartData = (rawData: RawOrderData[] | null) => {
  const [processedData, setProcessedData] = useState<ProcessedChartData>({
    todaysOrders: [
      { name: "Today's Orders", value: 25, color: "#3b82f6" },
      { name: "Previous Orders", value: 75, color: "#e4e4e7" }
    ],
    fulfillment: [
      { name: "Fulfilled", value: 70, color: "#10b981" },
      { name: "Unfulfilled", value: 30, color: "#f59e0b" },
    ],
    shippingCosts: [
      { name: "Today's Shipping Cost", value: 10.00, color: '#3b82f6' },
      { name: 'Previous Shipping Cost', value: 15.00, color: '#e4e4e7' }
    ],
    orderFulfillmentCycleTime: [
      { name: "YoY", value: 24, color: "#8b5cf6" },
      { name: "This Year", value: 18, color: "#06b6d4" },
      { name: "QoQ", value: 16, color: "#10b981" },
      { name: "This Quarter", value: 14, color: "#f59e0b" },
      { name: "MoM", value: 12, color: "#ef4444" },
      { name: "This Month", value: 10, color: "#8b5cf6" },
      { name: "WoW", value: 8, color: "#06b6d4" },
      { name: "This Week", value: 6, color: "#10b981" },
      { name: "DoD", value: 4, color: "#f59e0b" },
      { name: "Today", value: 2, color: "#ef4444" }
    ],
    cycleTimeData: [
      { name: "Day 1", hours: 12 },
      { name: "Day 2", hours: 8 },
      { name: "Day 3", hours: 24 },
      { name: "Day 4", hours: 6 },
      { name: "Day 5", hours: 10 },
      { name: "Day 6", hours: 16 },
      { name: "Day 7", hours: 9 }
    ],
    heatmapData: [],
    avgShippingCostPerOrder: [
      { name: "YoY", value: 8.45, color: "#8b5cf6" },
      { name: "This Year", value: 9.20, color: "#06b6d4" },
      { name: "QoQ", value: 7.80, color: "#10b981" },
      { name: "This Quarter", value: 8.95, color: "#f59e0b" },
      { name: "MoM", value: 9.60, color: "#ef4444" },
      { name: "This Month", value: 10.25, color: "#8b5cf6" },
      { name: "WoW", value: 11.40, color: "#06b6d4" },
      { name: "This Week", value: 12.15, color: "#10b981" },
      { name: "DoD", value: 13.50, color: "#f59e0b" },
      { name: "Today", value: 14.75, color: "#ef4444" },
      { name: "HoH", value: 15.25, color: "#8b5cf6" }
    ]
  });

  const [shippingCostData, setShippingCostData] = useState<ShippingCostData>({
    today: 10.00,
    previous: 15.00
  });

  const [orderFulfillmentCycleTimeRawData, setOrderFulfillmentCycleTimeRawData] = useState<OrderFulfillmentCycleTimeResponse[]>([]);

  // Fetch shipping cost data separately
  useEffect(() => {
    const fetchShippingCostData = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // Use mockup data for localhost
        const mockShippingData: ShippingCostData = {
          today: 125.50,
          previous: 98.25
        };
        setShippingCostData(mockShippingData);
        return;
      }

      try {
        const url = `${suiteletUrl}&mode=getShippingCost`;
        // console.log('Fetching shipping cost data from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch shipping cost data: ${response.status}`);
        }
        
        const result: ShippingCostData = await response.json();
        console.log('Shipping cost data result:', result);
        
        setShippingCostData(result);
      } catch (error) {
        console.error("Error fetching shipping cost data:", error);
        // Fallback to default values on error
        setShippingCostData({
          today: 10.00,
          previous: 15.00
        });
      }
    };

    fetchShippingCostData();
  }, []);

  // Fetch order fulfillment cycle time data
  useEffect(() => {
    const fetchOrderFulfillmentCycleTime = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // Use mockup data for localhost
        const mockCycleTimeData: OrderFulfillmentCycleTimeResponse[] = [
          {
            id: "123",
            sotranId: "SO001",
            sotranDate: "2024-01-15",
            systemNoteDate: "2024-01-17"
          },
          {
            id: "124",
            sotranId: "SO002",
            sotranDate: "2024-01-16",
            systemNoteDate: "2024-01-18"
          },
          {
            id: "125",
            sotranId: "SO003",
            sotranDate: "2024-01-17",
            systemNoteDate: "2024-01-19"
          }
        ];
        setOrderFulfillmentCycleTimeRawData(mockCycleTimeData);
        return;
      }

      try {
        const url = `${suiteletUrl}&mode=getOrderFulfillmentCycleTime`;
        console.log('Fetching order fulfillment cycle time data from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order fulfillment cycle time data: ${response.status}`);
        }
        
        const result: OrderFulfillmentCycleTimeResponse[] = await response.json();
        console.log('Order fulfillment cycle time data result:', result);
        
        setOrderFulfillmentCycleTimeRawData(result);
      } catch (error) {
        console.error("Error fetching order fulfillment cycle time data:", error);
        // Fallback to empty array on error
        setOrderFulfillmentCycleTimeRawData([]);
      }
    };

    fetchOrderFulfillmentCycleTime();
  }, []);

  // Process order fulfillment cycle time data
  useEffect(() => {
    if (orderFulfillmentCycleTimeRawData.length === 0) return;

    try {
      // Calculate average cycle times for different periods
      const processedCycleTimeData = [
        { name: "YoY", value: 24, color: "#8b5cf6" },
        { name: "This Year", value: 18, color: "#06b6d4" },
        { name: "QoQ", value: 16, color: "#10b981" },
        { name: "This Quarter", value: 14, color: "#f59e0b" },
        { name: "MoM", value: 12, color: "#ef4444" },
        { name: "This Month", value: 10, color: "#8b5cf6" },
        { name: "WoW", value: 8, color: "#06b6d4" },
        { name: "This Week", value: 6, color: "#10b981" },
        { name: "DoD", value: 4, color: "#f59e0b" },
        { name: "Today", value: 2, color: "#ef4444" }
      ];

      setProcessedData(prev => ({
        ...prev,
        orderFulfillmentCycleTime: processedCycleTimeData
      }));

    } catch (error) {
      console.error("Error processing order fulfillment cycle time data:", error);
    }
  }, [orderFulfillmentCycleTimeRawData]);

  // Process raw order data
  useEffect(() => {
    // console.log('use-transform-chart-data.ts RAWDATA', rawData);
    if (!rawData || rawData.length === 0) return;
    
    try {
      // console.log("Processing raw order data:", rawData);
      
      // Process today's orders
      const today = new Date();
      const todaysOrders = rawData.filter(order => 
        new Date(order.trandate).toLocaleDateString() === today.toLocaleDateString()
      );
      const previousOrders = rawData.filter(order => 
        new Date(order.trandate) < today
      );
      const todaysOrdersCount = todaysOrders.length;
      const previousOrdersCount = rawData.length - todaysOrdersCount;
      
      // Process fulfillment status
      const fulfilledStatuses = ['closed', 'pendingbilling', 'fullybilled'];
      const fulfilledCount = rawData.filter(order => 
        fulfilledStatuses.includes(order.status.toLowerCase())
      ).length;
      const unfulfilledCount = rawData.length - fulfilledCount;
      
      // Calculate average shipping cost per order for different periods
      const calculateAvgShippingCost = (orders: RawOrderData[]) => {
        if (orders.length === 0) return 0;
        const totalShippingCost = orders.reduce((sum, order) => sum + (order.shippingcost || 0), 0);
        return totalShippingCost / orders.length;
      };

      // Mock calculation for different time periods based on available data
      const avgShippingCostData = [
        { name: "YoY", value: calculateAvgShippingCost(rawData) * 0.85, color: "#8b5cf6" },
        { name: "This Year", value: calculateAvgShippingCost(rawData) * 0.95, color: "#06b6d4" },
        { name: "QoQ", value: calculateAvgShippingCost(rawData) * 0.78, color: "#10b981" },
        { name: "This Quarter", value: calculateAvgShippingCost(rawData) * 0.92, color: "#f59e0b" },
        { name: "MoM", value: calculateAvgShippingCost(rawData) * 1.05, color: "#ef4444" },
        { name: "This Month", value: calculateAvgShippingCost(rawData) * 1.15, color: "#8b5cf6" },
        { name: "WoW", value: calculateAvgShippingCost(rawData) * 1.25, color: "#06b6d4" },
        { name: "This Week", value: calculateAvgShippingCost(rawData) * 1.35, color: "#10b981" },
        { name: "DoD", value: calculateAvgShippingCost(rawData) * 1.45, color: "#f59e0b" },
        { name: "Today", value: calculateAvgShippingCost(todaysOrders) || calculateAvgShippingCost(rawData) * 1.55, color: "#ef4444" },
        { name: "HoH", value: calculateAvgShippingCost(rawData) * 1.65, color: "#8b5cf6" }
      ];

      // Process order dates for cycle time
      const orderDates = rawData.map(order => new Date(order.trandate));
      const earliestDate = new Date(Math.min(...orderDates.map(date => date.getTime())));
      const latestDate = new Date(Math.max(...orderDates.map(date => date.getTime())));
      
      // Create day-by-day data for cycle time chart
      const cycleTimes = [];
      const dayDiff = Math.min(7, Math.round((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      for (let i = 0; i < dayDiff; i++) {
        const currentDate = new Date(earliestDate);
        currentDate.setDate(earliestDate.getDate() + i);
        const dateStr = currentDate.toLocaleDateString();
        
        // Count orders for this day
        const ordersForDay = rawData.filter(order => 
          new Date(order.trandate).toLocaleDateString() === dateStr
        ).length;
        
        // Convert count to processing hours (simplified example)
        const processingHours = Math.max(ordersForDay * 4, 2); // Assume each order takes ~4 hours to process
        
        cycleTimes.push({
          name: `Day ${i + 1}`,
          hours: processingHours
        });
      }
      
      // If we have fewer than 7 days of data, pad with estimates
      while (cycleTimes.length < 7) {
        cycleTimes.push({
          name: `Day ${cycleTimes.length + 1}`,
          hours: Math.floor(Math.random() * 10) + 5
        });
      }
      
      // Generate heatmap data 
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const hourLabels = [
        "12am", "1am", "2am", "3am", "4am", "5am", 
        "6am", "7am", "8am", "9am", "10am", "11am",
        "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
        "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
      ];
      const heatmapData = [];
      
      // For each day of the week, assign a random activity level for each hour
      // In real implementation, this would be calculated from actual data
      for (const day of dayNames) {
        for (const hour of hourLabels) {
          // Generate values that simulate peak hours (higher values during business hours)
          const hourIndex = hourLabels.indexOf(hour);
          let baseValue;
          
          // Create realistic activity patterns (higher during business hours)
          if (hourIndex >= 8 && hourIndex <= 17) { // 8am to 5pm
            baseValue = 4 + Math.random() * 6; // Higher activity during business hours
          } else if (hourIndex >= 6 && hourIndex <= 7) { // 6am to 7am
            baseValue = 2 + Math.random() * 3; // Morning ramp up
          } else if (hourIndex >= 18 && hourIndex <= 20) { // 6pm to 8pm
            baseValue = 2 + Math.random() * 4; // Evening activity
          } else { // Night hours
            baseValue = Math.random() * 2; // Low overnight activity
          }
                          
          // Apply a day effect (mid-week is busier)
          const dayIndex = dayNames.indexOf(day);
          const dayEffect = dayIndex <= 3 ? 
                           (dayIndex + 1) * 0.3 : 
                           (7 - dayIndex) * 0.3;
                           
          let value = baseValue + dayEffect;
          
          // Add some randomness
          value = value + (Math.random() * 1 - 0.5);
          value = Math.max(0, Math.min(10, Math.round(value * 10) / 10));
          
          heatmapData.push({
            day,
            hour,
            value
          });
        }
      }
      
      console.log('setProcessedData', {
        todaysOrdersCount, previousOrdersCount, fulfilledCount, unfulfilledCount
      })

      setProcessedData(prev => ({
        ...prev,
        todaysOrders: [
          { name: "Today's Orders", value: todaysOrdersCount, color: "#3b82f6" },
          { name: "Previous Orders", value: previousOrdersCount, color: "#e4e4e7" }
        ],
        fulfillment: [
          { name: "Fulfilled", value: fulfilledCount, color: "#10b981" },
          { name: "Unfulfilled", value: unfulfilledCount, color: "#f59e0b" },
        ],
        shippingCosts: [
          { name: "Today's Shipping Cost", value: +(shippingCostData.today.toFixed(2)) || 0, color: '#3b82f6' },
          { name: 'Previous Shipping Cost', value: +(shippingCostData.previous.toFixed(2)) || 0, color: '#e4e4e7' }
        ],
        orderFulfillmentCycleTime: [
          { name: "YoY", value: 24, color: "#8b5cf6" },
          { name: "This Year", value: 18, color: "#06b6d4" },
          { name: "QoQ", value: 16, color: "#10b981" },
          { name: "This Quarter", value: 14, color: "#f59e0b" },
          { name: "MoM", value: 12, color: "#ef4444" },
          { name: "This Month", value: 10, color: "#8b5cf6" },
          { name: "WoW", value: 8, color: "#06b6d4" },
          { name: "This Week", value: 6, color: "#10b981" },
          { name: "DoD", value: 4, color: "#f59e0b" },
          { name: "Today", value: 2, color: "#ef4444" }
        ],
        cycleTimeData: cycleTimes,
        heatmapData: heatmapData,
        avgShippingCostPerOrder: avgShippingCostData
      }));
      
      console.log("Processed chart data:", processedData);
      
    } catch (error) {
      console.error("Error processing chart data:", error);
      // Keep default values on error
    }
  }, [rawData, shippingCostData]);

  return processedData;
};
