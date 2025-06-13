
import { Subsidiary, Location, Customer, ShippingMethod, Item, SalesOrder, EntityReference } from './types';
import { mockupData } from './mockData';

// Export data from mockupData or from hidden inputs (set in constants.ts)
export const subsidiaries: Subsidiary[] = mockupData.subsidiaries;
export const locations: Location[] = mockupData.locations;
export const customers: Customer[] = mockupData.customers;
export const shippingMethods: ShippingMethod[] = mockupData.shippingMethods;
export const items: Item[] = mockupData.items;

// Generate sales orders from mock data
export const generateSalesOrders = (count: number): SalesOrder[] => {
  return mockupData.orders.map(line => ({
    id: line.id || String(line.tranId) || ``,
    orderNumber: line.tranId && `SO-${line.tranId}`,
    customerId: line.customer?.value || "",
    subsidiaryId: line.subsidiary?.value || "",
    locationId: line.location?.value || "",
    shippingMethodId: line.shipmethod?.value || "",
    itemId: "", // No item data in orders
    lineId: "", // No line ID in orders
    fulfillmentQuantity: line.quantity,
    shippingCost: line.shippingcost,
    date: line.date
  }))
};

export const generateSalesOrderLines = (count: number): SalesOrder[] => {
  return mockupData.orderLines.map(line => ({
    id: line.id || String(line.tranId) || ``,
    orderNumber: line.tranId && `SO-${line.tranId}`,
    customerId: line.customer?.value || "",
    subsidiaryId: line.subsidiary?.value || "",
    locationId: line.location?.value || "",
    shippingMethodId: line.shipmethod?.value || "",
    lineId: line.line,
    itemId: line.item?.value || "",
    fulfillmentQuantity: line.quantity,
    shippingCost: line.shippingcost,
    date: line.date
  }))
};

// Pre-generate sales orders
export const salesOrders = generateSalesOrders(50);
export const salesOrderLines = generateSalesOrderLines(50);
// Store the generated sales orders in mockupData for potential reuse
mockupData.salesOrders = salesOrders;
mockupData.salesOrderLines = salesOrderLines;

// Helper functions to fetch entities by ID
export const getCustomerById = (id: string | EntityReference): Customer | undefined => {
  if (!id) return undefined;
  
  // Check if id is already an EntityReference object
  if (typeof id === 'object' && id.value) {
    return { text: id.text, value: id.value };
  }
  
  return customers.find(customer => customer.value === id);
};

export const getSubsidiaryById = (id: string | EntityReference): Subsidiary | undefined => {
  if (!id) return undefined;
  
  // Check if id is already an EntityReference object
  if (typeof id === 'object' && id.value) {
    return { text: id.text, value: id.value };
  }
  
  return subsidiaries.find(subsidiary => subsidiary.value === id);
};

export const getLocationById = (id: string | EntityReference): Location | undefined => {
  if (!id) return undefined;
  
  // Check if id is already an EntityReference object
  if (typeof id === 'object' && id.value) {
    // Create a Location object with optional subsidiaryId if it exists
    return { 
      text: id.text, 
      value: id.value,
      // Only include subsidiaryId if it exists in the input object
      ...(id.subsidiaryId && { subsidiaryId: id.subsidiaryId })
    };
  }
  
  return locations.find(location => location.value === id);
};

export const getShippingMethodById = (id: string | EntityReference): ShippingMethod | undefined => {
  if (!id) return undefined;
  
  // Check if id is already an EntityReference object
  if (typeof id === 'object' && id.value) {
    return { text: id.text, value: id.value };
  }
  
  return shippingMethods.find(method => method.value === id);
};

export const getItemById = (id: string | EntityReference): Item | undefined => {
  if (!id) return undefined;
  
  // Check if id is already an EntityReference object
  if (typeof id === 'object' && id.value) {
    return { text: id.text, value: id.value };
  }
  
  return items.find(item => item.value === id);
};

