
import React, { useEffect, useState } from "react";
import { useChartData, ChartDataItem } from "@/hooks/use-chart-data";
import ScrollableDoughnutCharts from "./ScrollableDoughnutCharts";
import ChartCarousel from "./ChartCarousel";
import { useTransformChartData, RawOrderData } from "@/hooks/use-transform-chart-data";
import { suiteletUrl } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";

// Create chart config for styling
const createChartConfig = (...chartData: ChartDataItem[][]) => {
  return Object.fromEntries(
    chartData.flat().map(item => [
      item.name,
      { color: item.color }
    ])
  );
};

const DashboardCharts: React.FC = () => {
  const [rawOrderData, setRawOrderData] = useState<RawOrderData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const processedData = useTransformChartData(rawOrderData);
  
  // Use our custom hook for each chart with the processed data from a single fetch
  const { data: todaysOrdersChartData } = useChartData({
    mockData: processedData.todaysOrders,
    isLocalhost
  });

  const { data: fulfillmentChartData } = useChartData({
    mockData: processedData.fulfillment,
    isLocalhost
  });

  const { data: shippingCostChartData } = useChartData({
    mockData: processedData.shippingCosts,
    isLocalhost
  });

  // Create a combined chart config
  const chartConfig = createChartConfig(
    todaysOrdersChartData, 
    fulfillmentChartData, 
    shippingCostChartData
  );

  useEffect(() => {
    const fetchRawOrderDataInChunks = async () => {
      // Use mockup data in localhost
      if (isLocalhost) {
        // Sample mockup data 
        const mockupData: RawOrderData[] = [
          {
             id: "13",
             tranid: "1",
             trandate: "3/8/2023",
             status: "closed",
             shippingcost: 0
          },
          {
             id: "19",
             tranid: "2",
             trandate: "3/9/2023",
             status: "fullyBilled",
             shippingcost: 0
          },
          {
             id: "25",
             tranid: "3",
             trandate: "3/10/2023",
             status: "fullyBilled",
             shippingcost: 0
          },
          {
             id: "2855",
             tranid: "4",
             trandate: "5/15/2023",
             status: "pendingBilling",
             shippingcost: 0
          },
          {
             id: "2856",
             tranid: "5",
             trandate: "5/15/2023",
             status: "pendingBillingPartFulfilled",
             shippingcost: 0
          }
       ]
        
        setRawOrderData(mockupData);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        return;
      }

      try {
        setIsLoading(true);
        
        let allData: RawOrderData[] = [];
        let i = 0;
        let hasMoreData = true;
        const chunkSize = 500;
        
        while (hasMoreData) {
          const start = 0 + (i * chunkSize);
          const end = chunkSize + (i * chunkSize);
          const url = `${suiteletUrl}&mode=getChartOrders&start=${start}&end=${end}`;
          const response = await fetch(url);
          // console.log(`DashboardCharts.tsx RESPONSE chunk ${i + 1}:`, response);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch chart data chunk ${i + 1}: ${response.status}`);
          }
          
          const chunkData = await response.json();
          // console.log(`DashboardCharts.tsx RESULT chunk ${i + 1}:`, chunkData);
          
          // Check if we got data in this chunk
          if (!chunkData || chunkData.length === 0) {
            hasMoreData = false;
          } else {
            // Add chunk data to our collection
            allData = [...allData, ...chunkData];

            // If we got less than the chunk size, we've reached the end
            if (chunkData.length < chunkSize) {
              hasMoreData = false;
            }
          }
          
          i++;
        }
        
        console.log(`Finished chunked fetch. Total records collected: ${allData.length}`);
        
        // Check if we got any data at all
        if (allData.length === 0) {
          console.error("API returned no data across all chunks");
          throw new Error("No chart data returned from API");
        }
        
        // Set the combined data
        setRawOrderData(allData);
      } catch (error) {
        console.error("Error fetching raw order data in chunks:", error);
        toast({
          title: "Error loading chart data",
          description: "Failed to load chart data. Using mockup data instead.",
          variant: "destructive",
        });
        
        // Fallback to mockup data even when not in localhost if there's an error
        const fallbackData: RawOrderData[] = [
          {
             id: "13",
             tranid: "1",
             trandate: "3/8/2023",
             status: "closed",
             shippingcost: 0
          },
          {
             id: "19",
             tranid: "2",
             trandate: "3/9/2023",
             status: "fullyBilled",
             shippingcost: 0
          },
          {
             id: "25",
             tranid: "3",
             trandate: "3/10/2023",
             status: "fullyBilled",
             shippingcost: 0
          },
          {
             id: "2855",
             tranid: "4",
             trandate: "5/15/2023",
             status: "pendingBilling",
             shippingcost: 0
          },
          {
             id: "2856",
             tranid: "5",
             trandate: "5/15/2023",
             status: "pendingBillingPartFulfilled",
             shippingcost: 0
          }
       ];
       
       setRawOrderData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawOrderDataInChunks();
  }, [isLocalhost]);

  return (
    <div className="mb-6 animate-fade-in">
      {/* Main Charts Container with Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Key Metrics - Horizontally Scrollable */}
        <ScrollableDoughnutCharts
          todaysOrdersData={todaysOrdersChartData}
          fulfillmentData={fulfillmentChartData}
          shippingCostData={shippingCostChartData}
          todaysOrdersLoading={isLoading}
          fulfillmentLoading={isLoading}
          shippingCostLoading={isLoading}
          chartConfig={chartConfig}
        />
        
        {/* Right Column: Performance Analytics - Carousel */}
        <ChartCarousel 
          cycleTimeData={processedData.cycleTimeData} 
          heatmapData={processedData.heatmapData}
          orderFulfillmentCycleTimeData={processedData.orderFulfillmentCycleTime}
          avgShippingCostPerOrderData={processedData.avgShippingCostPerOrder}
          isLoading={isLoading} 
        />
      </div>
      <hr/>
    </div>
  );
};

export default DashboardCharts;
