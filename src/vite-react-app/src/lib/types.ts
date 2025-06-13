
// Types used across the application

export type Subsidiary = {
  value: string;
  text: string;
};

export type Location = {
  value: string;
  text: string;
  subsidiaryId?: string;
  subsidiary_display?: string;
};

export type Customer = {
  value: string;
  text: string;
};

export type ShippingMethod = {
  value: string;
  text: string;
};

// Support for both API response format and local data format
export type EntityReference = {
  text: string;
  value: string;
  subsidiaryId?: string; // Added optional subsidiaryId property
};

export type Item = {
  value: string;
  text: string;
};

export type SalesOrder = {
  id: string;
  orderNumber: string;
  customerId: string | EntityReference;
  subsidiaryId: string | EntityReference;
  locationId: string | EntityReference;
  shippingMethodId: string | EntityReference;
  shippingMethod?: string;
  lineId: string;
  itemId: string | EntityReference;
  fulfillmentQuantity: number;
  shippingCost: number;
  date: string;
};
