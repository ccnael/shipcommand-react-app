import React, { useState, useCallback, useEffect } from "react";
import FilterPanel, { FilterValues } from "@/components/FilterPanel";
import OrderTable from "@/components/OrderTable";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ProcessingResults from "@/components/ProcessingDialog";
import { useOrderData } from "@/hooks/use-order-data";
import { useOrderProcessing } from "@/hooks/use-order-processing";
import SelectedOrdersActions from "@/components/table/SelectedOrdersActions";
import ConfirmProcessingDialog from "@/components/ConfirmProcessingDialog";
import InvalidLicenseBanner from "@/components/InvalidLicenseBanner";
import FulfillmentBanner from "@/components/FulfillmentBanner";
import { Loader, ChevronDown } from "lucide-react";
import { getIsValidLicenseValue } from "@/lib/helpers";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";

const Index = () => {
  const [filters, setFilters] = useState<FilterValues>({
    orderNumber: "",
    subsidiaryId: "",
    locationId: "",
    customerId: "",
    shippingMethodIds: [],
    dateFrom: undefined,
    dateTo: undefined,
    mainline: false,
  });
  
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [fulfillmentIds, setFulfillmentIds] = useState<string[]>([]);
  const { orders, setOrders, isLoading, loadData } = useOrderData(filters.mainline);
  
  const { 
    processingOrders,
    alertOpen,
    confirmDialogOpen,
    processedResults,
    progress,
    setAlertOpen,
    setConfirmDialogOpen,
    startOrderProcessing,
    processOrders,
  } = useOrderProcessing();
  
  const [isValidLicense, setIsValidLicense] = useState(true);
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  
  useEffect(() => {
    const storedIds = localStorage.getItem('fulfillmentIds');
    if (storedIds) {
      try {
        const ids = JSON.parse(storedIds);
        if (Array.isArray(ids) && ids.length > 0) {
          setFulfillmentIds(ids);
          // Clear localStorage immediately after retrieving the IDs
          localStorage.removeItem('fulfillmentIds');
        }
      } catch (e) {
        console.error("Error parsing fulfillmentIds from localStorage:", e);
        localStorage.removeItem('fulfillmentIds');
      }
    }
    
    setIsValidLicense(getIsValidLicenseValue());
  }, []);

  // Handle filter changes without causing infinite loops
  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    // Only load data if filters actually changed
    loadData();
  }, [loadData]);

  const handleQuantityUpdate = useCallback((orderId: string, lineId: string | undefined, newQuantity: number) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId && order.lineId === lineId) {
          return { ...order, fulfillmentQuantity: newQuantity };
        }
        return order;
      })
    );
  }, [setOrders]);

  const clearFulfillmentIds = () => {
    setFulfillmentIds([]);
    setAlertOpen(false);
    // Ensure localStorage is also cleared
    localStorage.removeItem('fulfillmentIds');
  };

  const handleSubmitRequest = async () => {
    const validationResult = await startOrderProcessing(selectedOrderIds);
    
    if (!validationResult) {
      return;
    }
    
    if (typeof validationResult === 'object' && 'updatedOrders' in validationResult) {
      const { updatedOrders, updatedSelectedIds } = validationResult;
      setOrders(updatedOrders);
      setSelectedOrderIds(updatedSelectedIds);
      return;
    }
  };

  const handleProcessOrders = async () => {
    setConfirmDialogOpen(false);
    const { updatedOrders, updatedSelectedIds, fulfillmentIds } = await processOrders(selectedOrderIds, orders, filters.mainline);
    setOrders(updatedOrders);
    setSelectedOrderIds(updatedSelectedIds);
    
    if (fulfillmentIds && fulfillmentIds.length > 0) {
      setFulfillmentIds(fulfillmentIds);
    }
    
    setAlertOpen(true);
  };

  const handleSelectedOrdersChange = useCallback((selectedIds: Set<string>) => {
    setSelectedOrderIds(selectedIds);
  }, []);

  const toggleCharts = () => {
    setIsChartsOpen(!isChartsOpen);
  };

  const showProcessingResults = alertOpen && fulfillmentIds.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {!isValidLicense && <InvalidLicenseBanner />}
      {fulfillmentIds.length > 0 && <FulfillmentBanner fulfillmentIds={fulfillmentIds} onClose={clearFulfillmentIds} />}
      <div className={!isValidLicense ? "pt-[76px]" : ""}>
        <Navbar />
        
        {processingOrders && (
          <div className="fixed top-0 left-0 w-full z-50">
            <Progress value={progress} className="h-1 rounded-none" />
          </div>
        )}
        
        <div className="container py-6">
          {/* Collapsible Charts Section with Enhanced Animation */}
          <div className="mb-6">
            <Collapsible 
              open={isChartsOpen} 
              onOpenChange={setIsChartsOpen} 
              className="overflow-hidden transition-all duration-300 ease-in-out"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#62739a] flex items-center">
                  Dashboard Overview
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2 p-0 h-auto">
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isChartsOpen ? 'rotate-180' : ''}`} 
                      />
                      <span className="sr-only">Toggle dashboard</span>
                    </Button>
                  </CollapsibleTrigger>
                </h2>
              </div>
              
              <CollapsibleContent className="transition-all duration-500 ease-in-out">
                <div className={`
                  animate-fade-in transform-gpu overflow-hidden
                  transition-all duration-500 ease-in-out 
                  ${isChartsOpen ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'}
                `}>
                  <DashboardCharts />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#62739a]">Ship Command</h1>
              <p className="text-sm text-muted-foreground mt-1">Fulfill and Print Labels</p>
            </div>
            <Button 
              onClick={handleSubmitRequest}
              disabled={selectedOrderIds.size === 0 || processingOrders || !isValidLicense}
            >
              {processingOrders ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
          
          <div className="space-y-6 mb-16">
            <FilterPanel onFilterChange={handleFilterChange} />
            <OrderTable 
              orders={orders} 
              filters={filters} 
              isLoading={isLoading} 
              onSelectedOrdersChange={handleSelectedOrdersChange}
              onQuantityUpdate={handleQuantityUpdate}
              key={`${orders.length}-${filters.mainline}`}
            />
          </div>
        </div>
      </div>

      <SelectedOrdersActions 
        selectedCount={selectedOrderIds.size}
        onSubmit={handleSubmitRequest}
        isProcessing={processingOrders}
        isDisabled={!isValidLicense}
        isMainline={filters.mainline}
      />

      <ProcessingResults
        open={showProcessingResults}
        onOpenChange={setAlertOpen}
        results={processedResults}
        fulfillmentIds={fulfillmentIds}
      />

      <ConfirmProcessingDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleProcessOrders}
        orderCount={selectedOrderIds.size}
        isProcessing={processingOrders}
        isMainline={filters.mainline}
      />
    </div>
  );
};

export default Index;
