
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import DoughnutChart from "./DoughnutChart";
import { ChartDataItem } from "@/hooks/use-chart-data";

interface ScrollableDoughnutChartsProps {
  todaysOrdersData: ChartDataItem[];
  fulfillmentData: ChartDataItem[];
  shippingCostData: ChartDataItem[];
  todaysOrdersLoading: boolean;
  fulfillmentLoading: boolean;
  shippingCostLoading: boolean;
  chartConfig: Record<string, { color: string }>;
}

const ScrollableDoughnutCharts: React.FC<ScrollableDoughnutChartsProps> = ({
  todaysOrdersData,
  fulfillmentData,
  shippingCostData,
  todaysOrdersLoading,
  fulfillmentLoading,
  shippingCostLoading,
  chartConfig
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
      setScrollPosition(scrollContainerRef.current.scrollLeft - 250);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
      setScrollPosition(scrollContainerRef.current.scrollLeft + 250);
    }
  };

  // Use a single loading state for all charts since they come from the same request
  const isLoading = todaysOrdersLoading || fulfillmentLoading || shippingCostLoading;

  return (
    <div className="relative">
      {/* <h2 className="text-lg font-medium mb-3">Doughnut Charts</h2> */}
      <div className="relative">
        <div 
          ref={scrollContainerRef} 
          className="flex space-x-1 pb-4 overflow-x-auto"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
          onScroll={(e) => setScrollPosition((e.target as HTMLDivElement).scrollLeft)}
        >
          <DoughnutChart 
            title="Today's Total Orders"
            data={todaysOrdersData}
            isLoading={isLoading}
            chartConfig={chartConfig}
          />
          
          <DoughnutChart 
            title="Fulfilled Orders"
            data={fulfillmentData}
            isLoading={isLoading}
            chartConfig={chartConfig}
          />
          
          <DoughnutChart 
            title="Today's Shipping Cost"
            data={shippingCostData}
            isLoading={isLoading}
            chartConfig={chartConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default ScrollableDoughnutCharts;
