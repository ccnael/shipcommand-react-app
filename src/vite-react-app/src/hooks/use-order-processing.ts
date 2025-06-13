
import { useState } from "react";
import { SalesOrder } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";
import { processOrdersAPI, ProcessResults } from "@/lib/order-api";

// Define the return type for validation
interface ValidationResult {
  updatedOrders: SalesOrder[];
  updatedSelectedIds: Set<string>;
}

export function useOrderProcessing() {
  const [processingOrders, setProcessingOrders] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processedResults, setProcessedResults] = useState<ProcessResults>({ 
    success: [], 
    failed: [] 
  });
  const [progress, setProgress] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const { toast } = useToast();

  const startOrderProcessing = async (selectedOrderIds: Set<string>): Promise<boolean | ValidationResult> => {
    if (selectedOrderIds.size === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one order to process.",
        variant: "destructive",
      });
      return false;
    }
    
    // Open confirmation dialog
    setConfirmDialogOpen(true);
    return true;
  };

  const processOrders = async (selectedOrderIds: Set<string>, orders: SalesOrder[], isMainline: boolean = false) => {
    setProcessingOrders(true);
    setProcessedResults({ success: [], failed: [] });
    // Start at 5%
    setProgress(5);
    setTotalOrders(selectedOrderIds.size);
    setProcessedCount(0);
    
    // Process orders and get results
    const { updatedOrders, updatedSelectedIds, results, fulfillmentIds } = await processOrdersAPI(
      selectedOrderIds, 
      orders, 
      (completedCount: number, totalOrders: number) => {
        // New progress logic
        setProcessedCount(completedCount);
        const count = completedCount === 0 ? 1 : completedCount + 1;
        if (count === 0) {
          setProgress(5);
        } else if (count >= totalOrders) {
          setProgress(99);
        } else {
          setProgress((count/totalOrders) * 100);
        }
      },
      isMainline
    );
    
    // Update the results state
    setProcessedResults(results);
    setProgress(100); // Set to 100% when fully complete
    
    setProcessingOrders(false);
    
    return { updatedOrders, updatedSelectedIds, fulfillmentIds };
  };

  return {
    processingOrders,
    alertOpen,
    confirmDialogOpen,
    processedResults,
    progress,
    totalOrders,
    processedCount,
    setAlertOpen,
    setConfirmDialogOpen,
    startOrderProcessing,
    processOrders
  };
}
