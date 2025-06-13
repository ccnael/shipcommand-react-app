
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SalesOrder } from "@/lib/data";
import { ArrowDown, ArrowUp } from "lucide-react";

interface OrderTableHeaderProps {
  allSelected: boolean;
  onSelectAll: () => void;
  onSort: (column: keyof SalesOrder) => void;
  sortColumn: keyof SalesOrder | null;
  sortDirection: "asc" | "desc";
  showItemColumn?: boolean;
}

const OrderTableHeader: React.FC<OrderTableHeaderProps> = ({
  allSelected,
  onSelectAll,
  onSort,
  sortColumn,
  sortDirection,
  showItemColumn = true,
}) => {
  // Render sort indicator with icons
  const renderSortIndicator = (column: keyof SalesOrder) => {
    if (sortColumn !== column) return null;
    return (
      <span className="ml-1 inline-flex items-center">
        {sortDirection === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
      </span>
    );
  };

  // Helper to create sortable header
  const SortableHeader = ({ 
    column, 
    children,
    className = "",
    align = "left"
  }: { 
    column: keyof SalesOrder; 
    children: React.ReactNode;
    className?: string;
    align?: "left" | "right";
  }) => (
    <TableHead
      className={`cursor-pointer hover:text-primary transition-colors ${
        align === "right" ? "text-right" : ""
      } ${sortColumn === column ? "text-primary" : ""} ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1 whitespace-nowrap">
        {children}
        {renderSortIndicator(column)}
      </div>
    </TableHead>
  );

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all"
              className="w-4 h-4 mx-1 rounded"
            />
          </div>
        </TableHead>
        <SortableHeader column="orderNumber">
          SO #
        </SortableHeader>
        <SortableHeader column="date">
          Date
        </SortableHeader>
        <SortableHeader column="subsidiaryId">
          Subsidiary
        </SortableHeader>
        <SortableHeader column="customerId">
          Customer
        </SortableHeader>
        <SortableHeader column="locationId">
          Location
        </SortableHeader>
        <SortableHeader column="shippingMethodId">
          Shipping Method
        </SortableHeader>
        {showItemColumn && (
          <>
            <TableHead>
              Line ID
            </TableHead>
            <SortableHeader column="itemId">
              Item
            </SortableHeader>
          </>
        )}
        <SortableHeader column="fulfillmentQuantity" align="right">
          Fulfillment Quantity
        </SortableHeader>
        <SortableHeader column="shippingCost" align="right">
          Shipping Cost
        </SortableHeader>
      </TableRow>
    </TableHeader>
  );
};

export default OrderTableHeader;
