import React, { useState, useCallback, useEffect } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
// import CycleTimeChart from "./CycleTimeChart";
import BlockHeatmapChart from "./BlockHeatmapChart";
import ShippingMethodDistributionChart from "./ShippingMethodDistributionChart";
import D3HeatmapChart from "./D3HeatmapChart";
import D3LineGraph from "./D3LineGraph";
// import RechartsLineGraph from "./RechartsLineGraph";
// import PlaceholderChart from "./PlaceholderChart";
import OrderFulfillmentCycleChart from "./OrderFulfillmentCycleChart";
// import PickingEfficiencyChart from "./PickingEfficiencyChart";
import PickingEfficiencyLineChart from "./PickingEfficiencyLineChart";
// import PackingEfficiencyChart from "./PackingEfficiencyChart";
import PackingEfficiencyLineChart from "./PackingEfficiencyLineChart";
import AverageShippingCost from "./AverageShippingCost";
import DailyOrderVolumeChart from "./DailyOrderVolumeChart";
import FulfillmentThroughputChart from "./FulfillmentThroughputChart";
import { isPickPackShipEnabled } from "@/lib/constants";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem 
} from "@/components/ui/pagination";
import { ChartDataItem } from "@/hooks/use-chart-data";

interface ChartCarouselProps {
  cycleTimeData: { name: string; hours: number }[];
  heatmapData: { day: string; value: number; hour: string }[];
  orderFulfillmentCycleTimeData: ChartDataItem[];
  avgShippingCostPerOrderData: ChartDataItem[];
  isLoading: boolean;
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({ 
  cycleTimeData, 
  heatmapData, 
  orderFulfillmentCycleTimeData,
  avgShippingCostPerOrderData,
  isLoading 
}) => {
  const [activePage, setActivePage] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);
  
  // Calculate total slides based on isPickPackShipEnabled - add 1 for fulfillment throughput chart
  const totalSlides = isPickPackShipEnabled ? 9 : 7;
  
  // Create a demo date range for visualization purposes
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const dateRange = {
    from: oneWeekAgo,
    to: today
  };
  
  // Generate line graph data based on cycle time data
  const lineGraphData = React.useMemo(() => {
    const today = new Date();
    return cycleTimeData.map((item, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (cycleTimeData.length - index));
      return {
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        value: item.hours / 2 // Convert hours to a suitable value
      };
    });
  }, [cycleTimeData]);
  
  const handleSlideChange = useCallback((index: number) => {
    setActivePage(index);
  }, []);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setActivePage(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div>
      {/* <h2 className="text-lg font-medium mb-3">Carousel Charts</h2> */}
      <Carousel 
        className="w-full"
        setApi={setApi}
        opts={{
          startIndex: activePage,
          align: "start",
          loop: true,
          dragFree: false,
          skipSnaps: false
        }}
      >
        <CarouselContent className="transition-all duration-300 ease-in-out">
          <CarouselItem className="transition-opacity duration-300 border-none">
            <div className="h-[600px]">
              <OrderFulfillmentCycleChart 
                data={orderFulfillmentCycleTimeData} 
                isLoading={isLoading} 
              />
            </div>
          </CarouselItem>
          
          {isPickPackShipEnabled && (
            <CarouselItem className="transition-opacity duration-300 border-none">
              <div className="h-[600px]">
                <PickingEfficiencyLineChart 
                  data={orderFulfillmentCycleTimeData} 
                  isLoading={isLoading} 
                />
              </div>
            </CarouselItem>
          )}
          
          {isPickPackShipEnabled && (
            <CarouselItem className="transition-opacity duration-300 border-none">
              <div className="h-[600px]">
                <PackingEfficiencyLineChart 
                  data={orderFulfillmentCycleTimeData} 
                  isLoading={isLoading} 
                />
              </div>
            </CarouselItem>
          )}
          
          <CarouselItem className="transition-opacity duration-300 border-none">
            <div className="h-[600px]">
              <AverageShippingCost 
                data={avgShippingCostPerOrderData} 
                isLoading={isLoading} 
              />
            </div>
          </CarouselItem>
          
          <CarouselItem className="transition-opacity duration-300 border-none">
            <div className="h-[600px]">
              <DailyOrderVolumeChart 
                data={orderFulfillmentCycleTimeData} 
                isLoading={isLoading} 
              />
            </div>
          </CarouselItem>
          
          <CarouselItem className="transition-opacity duration-300 border-none">
            <div className="h-[600px]">
              <FulfillmentThroughputChart 
                data={[]} 
                isLoading={isLoading} 
              />
            </div>
          </CarouselItem>
          
          <CarouselItem className="transition-opacity duration-300">
            <div className="h-[600px]">
              <BlockHeatmapChart data={heatmapData} isLoading={isLoading} dateRange={dateRange} />
            </div>
          </CarouselItem>
          
          <CarouselItem className="transition-opacity duration-300 border-none">
            <div className="h-[600px]">
              <ShippingMethodDistributionChart 
                data={[]} 
                isLoading={isLoading} 
              />
            </div>
          </CarouselItem>
          
          {/* <CarouselItem className="transition-opacity duration-300">
            <div className="h-[600px]">
              <RechartsLineGraph 
                data={lineGraphData} 
                isLoading={isLoading} 
                dateRange={dateRange} 
                title="Recharts Sample Line Graph (TBD)" 
              />
            </div>
          </CarouselItem> */}
          <CarouselItem className="transition-opacity duration-300">
            <div className="h-[600px]">
              <D3HeatmapChart data={heatmapData} isLoading={isLoading} dateRange={dateRange} />
            </div>
          </CarouselItem>
          <CarouselItem className="transition-opacity duration-300">
            <div className="h-[600px]">
              <D3LineGraph 
                data={lineGraphData} 
                isLoading={isLoading} 
                dateRange={dateRange} 
                title="D3 Sample Line Graph" 
              />
            </div>
          </CarouselItem>
          {/* <CarouselItem className="transition-opacity duration-300">
            <div className="h-[600px]">
              <PlaceholderChart isLoading={isLoading} />
            </div>
          </CarouselItem> */}
        </CarouselContent>
        <CarouselPrevious className="-left-3 h-8 w-8 rounded-full" />
        <CarouselNext className="-right-0 h-8 w-8 rounded-full" />
      </Carousel>
      {/* Pagination dots */}
      <div className="w-full flex justify-end -mt-20" style={{ marginTop: '-220px' }}>
        <Pagination>
          <PaginationContent className="flex justify-end w-full">
            {Array.from({ length: totalSlides - 1 }, (_, i) => (
              <PaginationItem key={i}>
                <div 
                  className={`w-3 h-3 mx-1 rounded cursor-pointer transition-colors duration-200 ${
                    i === activePage ? "bg-primary" : "bg-muted hover:bg-primary/50"
                  }`}
                  onClick={() => {
                    if (api) {
                      api.scrollTo(i);
                    }
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default ChartCarousel;
