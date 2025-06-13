
import { SalesOrder, EntityReference } from "@/lib/data";
import { FilterValues } from "../FilterPanel";

export function useOrderFilter(orders: SalesOrder[], filters: FilterValues) {
  // Helper function to get the string value from a string or EntityReference
  const getIdValue = (id: string | EntityReference): string => {
    return typeof id === 'string' ? id : id.value;
  };

  // Filter orders based on FilterValues
  const filteredOrders = orders.filter((order) => {
    // Filter by order number
    if (
      filters.orderNumber &&
      !order.orderNumber
        .toLowerCase()
        .includes(filters.orderNumber.toLowerCase())
    ) {
      return false;
    }

    // Filter by subsidiary
    if (filters.subsidiaryId && getIdValue(order.subsidiaryId) !== filters.subsidiaryId) {
      return false;
    }

    // Filter by location
    if (filters.locationId && getIdValue(order.locationId) !== filters.locationId) {
      return false;
    }

    // Filter by customer
    if (filters.customerId && getIdValue(order.customerId) !== filters.customerId) {
      return false;
    }

    // Filter by shipping method (multi-select)
    if (
      filters.shippingMethodIds.length > 0 &&
      !filters.shippingMethodIds.includes(getIdValue(order.shippingMethodId))
    ) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom) {
      const orderDate = new Date(order.date);
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (orderDate < fromDate) {
        return false;
      }
    }

    if (filters.dateTo) {
      const orderDate = new Date(order.date);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (orderDate > toDate) {
        return false;
      }
    }

    // Filter by mainline (check if property exists and if filter is enabled)
    // if (filters.mainline && !(order as any).mainline) {
    //   return false;
    // }

    return true;
  });

  return filteredOrders;
}
