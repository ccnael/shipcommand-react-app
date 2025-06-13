
import { useState, useEffect, useCallback } from "react";
import { SalesOrder } from "@/lib/data";
import { fetchOrderData } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export function useOrderData(mainline: boolean = false) {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('useOrderData: Loading data with mainline =', mainline);
      const data = await fetchOrderData(mainline);
      if (data) {
        console.log('useOrderData: Received data:', data.length, 'items');
        setOrders(data);
      } else {
        console.log('useOrderData: No data received, keeping empty array');
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch order data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order data. Using local data instead.",
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [mainline, toast]);

  // Only fetch data when mainline changes after initial mount, not on initial mount
  useEffect(() => {
    if (hasInitialized) {
      loadData();
    }
  }, [loadData, hasInitialized]);

  // Mark as initialized after first render, but don't fetch data
  useEffect(() => {
    setHasInitialized(true);
  }, []);

  return {
    orders,
    setOrders,
    isLoading,
    loadData
  };
}
