
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { suiteletUrl } from "@/lib/constants";

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface UseChartDataProps {
  mockData: ChartDataItem[];
  isLocalhost?: boolean;
}

export const useChartData = ({ mockData, isLocalhost = false }: UseChartDataProps) => {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simply set the mock data that was passed in
    setData(mockData);
    setIsLoading(false);
  }, [mockData]);

  return { data, isLoading };
};
