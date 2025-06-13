
// Export all mock data from a single entry point

import { subsidiaries } from './subsidiaries';
import { locations } from './locations';
import { customers } from './customers';
import { shippingMethods } from './shippingMethods';
import { orders } from './orders';
import { orderLines } from './orderLines';
import { items } from './items';

// Combined mockup data
export const mockupData = {
  subsidiaries,
  locations,
  customers,
  shippingMethods,
  orders,
  orderLines,
  items,
  salesOrders: [], // This will be populated with generated orders in data.ts
  salesOrderLines: []
};

export {
  subsidiaries,
  locations,
  customers,
  shippingMethods,
  orders,
  items
};
