
// Re-export all data related types and functions from their respective modules
// This maintains compatibility with the rest of the application

// Export types
export type {
  Subsidiary,
  Location,
  Customer,
  ShippingMethod,
  EntityReference,
  SalesOrder,
  Item,
} from './types';

// Export data store
export {
  subsidiaries,
  locations,
  customers,
  shippingMethods,
  salesOrders,
  salesOrderLines,
  getCustomerById,
  getSubsidiaryById,
  getLocationById,
  getShippingMethodById,
  getItemById,
} from './data-store';

// Export API functions
export {
  fetchSubsidiaries,
  fetchLocations,
  fetchCustomers,
  fetchShippingMethods,
  fetchOrderData,
} from './api';

// Import from existing modules to maintain compatibility
import { 
  mockupData, 
  suiteletUrl, 
  downloadPDF,
  pdfOnly,
  isProd
} from "./constants";

// Export constants for backward compatibility
export { 
  mockupData, 
  suiteletUrl, 
  downloadPDF,
  pdfOnly,
  isProd
};
