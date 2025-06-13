import React, { useState, useEffect } from "react";
import { Table } from "@/components/ui/table";
import { SalesOrder } from "@/lib/data";
import { FilterValues } from "./FilterPanel";
import OrderTableHeader from "./table/OrderTableHeader";
import OrderTableBody from "./table/OrderTableBody";
import TablePagination from "./table/TablePagination";
import SelectedOrdersActions from "./table/SelectedOrdersActions";
import { useOrderFilter } from "./table/use-order-filter";
import { useOrderSort } from "./table/use-order-sort";
import { useOrderPagination } from "./table/use-order-pagination";
import { useOrderSelection } from "./table/use-order-selection";
import { useCurrencyFormatter } from "./table/use-currency-formatter";
import { getItemsPerPageValue } from "../lib/helpers";

interface OrderTableProps {
  orders: SalesOrder[];
  filters: FilterValues;
  isLoading?: boolean;
  onSelectedOrdersChange?: (selectedIds: Set<string>) => void;
  onQuantityUpdate?: (orderId: string, lineId: string | undefined, newQuantity: number) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ 
  orders, 
  filters, 
  isLoading = false,
  onSelectedOrdersChange,
  onQuantityUpdate
}) => {
  const [sortColumn, setSortColumn] = useState<keyof SalesOrder | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = getItemsPerPageValue();

  // Apply filters
  const filteredOrders = useOrderFilter(orders, filters);
  
  // Apply sorting
  const sortedOrders = useOrderSort(filteredOrders, sortColumn, sortDirection);
  
  // Apply pagination
  const { 
    currentItems: currentOrders, 
    totalPages,
    totalItems
  } = useOrderPagination(sortedOrders, currentPage, ordersPerPage);
  
  // Handle selection with mainline awareness
  const { 
    selectedItems: selectedOrders, 
    handleSelectItem: handleSelectOrder,
    handleSelectAll,
    setSelectedItems
  } = useOrderSelection<SalesOrder>(sortedOrders, filters.mainline);
  
  // Format currency
  const { formatCurrency } = useCurrencyFormatter();

  // Determine if we should show the Item and Line ID columns (hide them when mainline is true)
  const showItemColumn = !filters.mainline;

  // Reset to first page when filtered results change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, orders.length]);

  // Handle sort column click
  const handleSort = (column: keyof SalesOrder) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Notify parent component when selectedOrders changes
  useEffect(() => {
    if (onSelectedOrdersChange) {
      onSelectedOrdersChange(selectedOrders);
    }
  }, [selectedOrders, onSelectedOrdersChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="table-container animate-fade-in">
      <Table>
        <OrderTableHeader
          allSelected={currentOrders.length > 0 && currentOrders.every(order => {
            const selectionId = filters.mainline ? order.id : `${order.id}-${order.lineId || 'main'}`;
            return selectedOrders.has(selectionId);
          })}
          onSelectAll={() => handleSelectAll(currentOrders)}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          showItemColumn={showItemColumn}
        />
        <OrderTableBody
          orders={currentOrders}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          formatCurrency={formatCurrency}
          showItemColumn={showItemColumn}
          isMainline={filters.mainline}
          onQuantityUpdate={onQuantityUpdate}
        />
      </Table>
      
      {filteredOrders.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ordersPerPage}
          onPageChange={setCurrentPage}
          isMainline={filters.mainline}
        />
      )}
    </div>
  );
};

export default OrderTable;
