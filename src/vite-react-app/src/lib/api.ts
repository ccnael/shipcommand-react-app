
import { Subsidiary, Location, Customer, SalesOrder, ShippingMethod } from './types';
import { suiteletUrl } from './constants';
import { subsidiaries, locations, customers, salesOrders, salesOrderLines, shippingMethods } from './data-store';

// Function to fetch subsidiaries from the API
export const fetchSubsidiaries = async (): Promise<Subsidiary[]> => {
  try {
    // Check if running locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '::1';
    
    if (isLocalhost) {
      console.log("Running locally - using mock subsidiaries data");
      return subsidiaries;
    }
    
    // Append &mode=getSubsidiaries to the suiteletUrl
    const url = `${suiteletUrl}&mode=getSubsidiaries`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Subsidiaries data:', data);
    
    return data.map((sub: any) => ({
      value: sub.value,
      text: sub.text
    }));
  } catch (error) {
    console.error("Error fetching subsidiaries:", error);
    // Return the default subsidiaries as fallback
    return subsidiaries;
  }
};

// Function to fetch locations from the API
export const fetchLocations = async (subsidiaryId?: string): Promise<Location[]> => {
  try {
    // Check if running locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '::1';
    
    if (isLocalhost) {
      console.log("Running locally - using mock locations data");
      
      // If subsidiaryId is provided, filter local locations by subsidiary
      if (subsidiaryId) {
        const selectedSubsidiary = subsidiaries.find(sub => sub.value === subsidiaryId);
        return locations.filter((loc) => loc.subsidiary_display === selectedSubsidiary?.text);
      }
      
      return locations;
    }
    
    // Build URL with subsidiary parameter if provided
    let url = `${suiteletUrl}&mode=getLocations`;
    if (subsidiaryId) {
      url += `&subsidiaryId=${subsidiaryId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Locations data:', data);
    
    return data.map((loc: any) => ({
      value: loc.value,
      text: loc.text,
      subsidiaryId: loc.subsidiaryId,
      subsidiary_display: loc.subsidiary_display
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    // Return the default locations as fallback
    return locations;
  }
};

// Function to fetch customers from the API
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    // Check if running locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '::1';
    
    if (isLocalhost) {
      console.log("Running locally - using mock customers data");
      return customers;
    }
    
    // Append &mode=getCustomers to the suiteletUrl
    const url = `${suiteletUrl}&mode=getCustomers`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Customers data:', data);
    
    return data.map((cust: any) => ({
      value: cust.value,
      text: cust.text
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    // Return the default customers as fallback
    return customers;
  }
};

// Function to fetch shipping methods from the API
export const fetchShippingMethods = async (): Promise<ShippingMethod[]> => {
  try {
    // Check if running locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '::1';
    
    if (isLocalhost) {
      console.log("Running locally - using mock shipping methods data");
      return shippingMethods;
    }
    
    // Append &mode=getShippingMethods to the suiteletUrl
    const url = `${suiteletUrl}&mode=getShippingMethods`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Shipping methods data:', data);
    
    return data.map((method: any) => ({
      value: method.value,
      text: method.text
    }));
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    // Return the default shipping methods as fallback
    return shippingMethods;
  }
};

// Function to fetch order data from the suiteletUrl with mainline parameter
export const fetchOrderData = async (mainline: boolean = false): Promise<SalesOrder[] | null> => {
  // Check if running locally
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '::1';
  
  if (isLocalhost) {
    console.log("Running locally - using mock data, mainline =", mainline);
    return mainline ? salesOrders : salesOrderLines;
  }
  
  try {
    if (mainline) {
      console.log('Fetching mainline orders via getFulfillmentOrders API');
      // Use getFulfillmentOrders API for mainline = true
      const url = new URL(suiteletUrl);
      url.searchParams.append('mode', 'getFulfillmentOrders');
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Mainline DATA received:', data.length, 'orders');
      
      // Map the API response to our internal format
      return data.map((line: any) => ({
        id: line.id || String(line.tranId) || ``,
        orderNumber: line.tranId,
        customerId: line.customer?.value,
        subsidiaryId: line.subsidiary?.value,
        locationId: line.location?.value,
        shippingMethodId: line.shipmethod?.value,
        fulfillmentQuantity: line.quantity,
        shippingCost: line.shippingcost,
        date: line.date
      }));
    } else {
      console.log('Fetching order lines via getFulfillmentOrderLines API');
      // Use pendingFulfillmentOrderLines API with chunked fetching for mainline = false
      let allData: any[] = [];
      let i = 0;
      let hasMoreData = true;
      const chunkSize = 500;
      
      while (hasMoreData) {
        const start = 0 + (i * chunkSize);
        const end = chunkSize + (i * chunkSize);
        const url = `${suiteletUrl}&mode=getFulfillmentOrderLines&start=${start}&end=${end}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order lines chunk ${i + 1}: ${response.status}`);
        }
        
        const chunkData = await response.json();
        
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
      
      console.log(`Finished chunked fetch. Total order lines collected: ${allData.length}`);
      
      if (allData.length === 0) {
        console.error("API returned no data across all chunks");
        throw new Error("No order line data returned from API");
      }

      console.log('Order lines DATA received:', allData.length, 'lines');
      
      // Map the API response to our internal format
      return allData.map((line: any) => ({
        id: line.id || String(line.tranId) || ``,
        orderNumber: line.tranId,
        customerId: line.customer?.value,
        subsidiaryId: line.subsidiary?.value,
        locationId: line.location?.value,
        shippingMethodId: line.shipmethod?.value,
        lineId: line.line,
        itemId: line.item?.value,
        fulfillmentQuantity: line.quantity,
        shippingCost: line.shippingcost,
        date: line.date
      }));
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return null to indicate failure, so the app can fall back to mock data
    return null;
  }
};
