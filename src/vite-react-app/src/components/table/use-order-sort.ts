
import { SalesOrder, getCustomerById, getSubsidiaryById, getLocationById, getShippingMethodById } from "@/lib/data";

export function useOrderSort(
  orders: SalesOrder[],
  sortColumn: keyof SalesOrder | null,
  sortDirection: "asc" | "desc"
) {
  if (!sortColumn) return orders;

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];

    // Handle entity reference columns
    if (sortColumn === "customerId") {
      aValue = getCustomerById(aValue)?.text || "";
      bValue = getCustomerById(bValue)?.text || "";
    } else if (sortColumn === "subsidiaryId") {
      aValue = getSubsidiaryById(aValue)?.text || "";
      bValue = getSubsidiaryById(bValue)?.text || "";
    } else if (sortColumn === "locationId") {
      aValue = getLocationById(aValue)?.text || "";
      bValue = getLocationById(bValue)?.text || "";
    } else if (sortColumn === "shippingMethodId") {
      aValue = getShippingMethodById(aValue)?.text || "";
      bValue = getShippingMethodById(bValue)?.text || "";
    }
    // Special handling for numeric fields
    else if (sortColumn === "fulfillmentQuantity" || sortColumn === "shippingCost") {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    // Handle date
    else if (sortColumn === "date") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  return sortedOrders;
}
