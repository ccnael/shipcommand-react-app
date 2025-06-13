
import { suiteletUrl, pdfOnly, isProd, downloadPDF } from "@/lib/constants";
import { SalesOrder } from "@/lib/data";
import { handleLabelPrinting } from "@/lib/label-utils";
import { printPreviewPDF, downloadZPLFile, downloadPDFFile } from "@/lib/download-utils";

export interface FulfillmentResponseData {
  fflId?: string;
  shipMethod?: string;
  hasIntegratedLabel?: boolean;
  errorMsg?: string;
}

export interface ProcessResults {
  success: string[];
  failed: string[];
}

export interface ProcessOrdersResult {
  updatedOrders: SalesOrder[];
  updatedSelectedIds: Set<string>;
  fulfillmentIds: string[];
}

// Function to process orders through the API
export async function processOrdersAPI(
  selectedOrderIds: Set<string>, 
  orders: SalesOrder[],
  progressCallback?: (completedCount: number, totalOrders: number) => void,
  isMainline: boolean = false
): Promise<ProcessOrdersResult & { results: ProcessResults }> {
  const successfulOrders: string[] = [];
  const failedOrders: string[] = [];
  const successfulOrderIds: string[] = [];
  const fulfillmentIds: string[] = []; // Array to store fflIds
  let completedCount = 0;
  const totalOrders = selectedOrderIds.size;

  // Initial progress update - before processing any orders
  if (progressCallback) progressCallback(completedCount, totalOrders);

  console.log('MAINLINE', isMainline);

  if (isMainline) {
    // Original logic for mainline = true (individual GET requests)
    for (const orderId of selectedOrderIds) {
      try {
        const order = orders.find(order => order.id === orderId);
        if (!order) {
          failedOrders.push(`Order ID ${orderId} not found`);
          completedCount++;
          if (progressCallback) progressCallback(completedCount, totalOrders);
          continue;
        }

        const orderNumber = order.orderNumber;
        const response = await fetch(`${suiteletUrl}&mode=fulfillOrder&id=${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          const responseFflData: FulfillmentResponseData = responseData || {};
          const { fflId, shipMethod, hasIntegratedLabel, errorMsg } = responseFflData;
          
          if (errorMsg) {
            console.error(`Error processing order ${orderId}: ${errorMsg}`);
            failedOrders.push(orderNumber);
          } else {
            console.log(`Successfully processed order ${orderId}:`, { 
              fflId, 
              shipMethod, 
              hasIntegratedLabel 
            });
            
            successfulOrders.push(orderNumber);
            successfulOrderIds.push(orderId);
            
            if (fflId) {
              fulfillmentIds.push(fflId);
              
              if (!pdfOnly && shipMethod && hasIntegratedLabel && isProd) {
                await handleLabelPrinting(orderId, orderNumber, fflId, shipMethod || '');
              } else {
                await fetch(`${suiteletUrl}&mode=generatePackingSlip&id=${fflId}`);
              }
            }
          }
        } else {
          failedOrders.push(orderNumber);
        }

        completedCount++;
        if (progressCallback) progressCallback(completedCount, totalOrders);
      } catch (error) {
        console.error(`Error processing order ${orderId}:`, error);
        const order = orders.find(order => order.id === orderId);
        failedOrders.push(order?.orderNumber || orderId);
        
        completedCount++;
        if (progressCallback) progressCallback(completedCount, totalOrders);
      }
    }
  } else {
    // For mainline = false, group orders by their orderId and send as POST to fulfillOrderLines
    const orderGroups: { [orderId: string]: any[] } = {};
    
    // Group selected orders by orderId (internal ID)
    for (const selectionId of selectedOrderIds) {
      // Parse selection ID to get order ID and line ID
      const [orderId, lineId] = selectionId.split('-');
      const order = orders.find(order => order.id === orderId && order.lineId === lineId);
      if (!order) {
        failedOrders.push(`Order ID ${selectionId} not found`);
        continue;
      }
      
      if (!orderGroups[orderId]) {
        orderGroups[orderId] = [];
      }
      
      orderGroups[orderId].push({
        lineId: order.lineId,
        quantity: order.fulfillmentQuantity
      });
    }

    // Send POST request for each order group to fulfillOrderLines
    for (const [orderId, lineItems] of Object.entries(orderGroups)) {
      try {
        const payload = lineItems;
        console.log('payload', { orderId, lineItems, payload });

        const response = await fetch(`${suiteletUrl}&id=${orderId}&mode=fulfillOrderLines`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const responseData = await response.json();
          const responseFflData: FulfillmentResponseData = responseData || {};
          const { fflId, shipMethod, hasIntegratedLabel, errorMsg } = responseFflData;
          
          if (errorMsg) {
            console.error(`Error processing order ${orderId}: ${errorMsg}`);
            failedOrders.push(orderId);
          } else {
            console.log(`Successfully processed order ${orderId}:`, { 
              fflId, 
              shipMethod, 
              hasIntegratedLabel 
            });
            
            successfulOrders.push(orderId);
            // Add all selection IDs from this group to successful list
            const selectionIds = Array.from(selectedOrderIds).filter(selectionId => {
              const [orderIdFromSelection] = selectionId.split('-');
              return orderIdFromSelection === orderId;
            });
            successfulOrderIds.push(...selectionIds);
            
            if (fflId) {
              fulfillmentIds.push(fflId);
              
              if (!pdfOnly && shipMethod && hasIntegratedLabel && isProd) {
                // For POST requests, we use the first selection ID from the group for label printing
                const firstSelectionId = selectionIds[0];
                const [firstOrderId] = firstSelectionId.split('-');
                const orderNumber = orders.find(o => o.id === firstOrderId)?.orderNumber || '';
                await handleLabelPrinting(firstOrderId, orderNumber, fflId, shipMethod || '');
              } else {
                await fetch(`${suiteletUrl}&mode=generatePackingSlip&id=${fflId}`);
              }
            }
          }
        } else {
          failedOrders.push(orderId);
        }

        // Update progress for all line items in this order group
        completedCount += lineItems.length;
        if (progressCallback) progressCallback(completedCount, totalOrders);
      } catch (error) {
        console.error(`Error processing order ${orderId}:`, error);
        failedOrders.push(orderId);
        
        // Update progress even for failed orders
        const lineItemsCount = lineItems.length;
        completedCount += lineItemsCount;
        if (progressCallback) progressCallback(completedCount, totalOrders);
      }
    }
  }

  // Store fulfillment IDs in localStorage if there are any
  if (fulfillmentIds.length > 0) {
    localStorage.setItem('fulfillmentIds', JSON.stringify(fulfillmentIds));
    
    printPreviewPDF(fulfillmentIds);

    if (!pdfOnly) {
      downloadZPLFile(fulfillmentIds);
    }
    
    if (downloadPDF) {
      downloadPDFFile(fulfillmentIds);
    }
  }

  // Remove successfully processed orders from the list
  const updatedOrders = orders.filter(order => {
    const selectionId = isMainline ? order.id : `${order.id}-${order.lineId || 'main'}`;
    return !successfulOrderIds.includes(selectionId);
  });
  
  const updatedSelectedIds = new Set<string>();
  
  return { 
    updatedOrders, 
    updatedSelectedIds, 
    fulfillmentIds,
    results: {
      success: successfulOrders,
      failed: failedOrders
    }
  };
}
