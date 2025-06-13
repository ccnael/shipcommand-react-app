
import React, { useState } from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  SalesOrder,
  getCustomerById, 
  getShippingMethodById, 
  getSubsidiaryById,
  getLocationById,
  getItemById
} from "@/lib/data";
import { format } from "date-fns";
import { Check, X, Edit } from "lucide-react";

interface OrderTableBodyProps {
  orders: SalesOrder[];
  selectedOrders: Set<string>;
  onSelectOrder: (orderId: string) => void;
  formatCurrency: (amount: number) => string;
  showItemColumn?: boolean;
  isMainline?: boolean;
  onQuantityUpdate?: (orderId: string, lineId: string | undefined, newQuantity: number) => void;
}

const OrderTableBody: React.FC<OrderTableBodyProps> = ({
  orders,
  selectedOrders,
  onSelectOrder,
  formatCurrency,
  showItemColumn = true,
  isMainline = false,
  onQuantityUpdate,
}) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Create unique row identifier
  const getRowId = (order: SalesOrder) => {
    return isMainline ? order.id : `${order.id}-${order.lineId || 'main'}`;
  };

  const handleEditStart = (order: SalesOrder, currentQuantity: number) => {
    if (isMainline) return; // Don't allow editing when mainline is true
    const rowId = getRowId(order);
    setEditingRow(rowId);
    setEditValue(currentQuantity);
  };

  const handleEditSave = () => {
    if (editingRow && onQuantityUpdate) {
      // Find the order being edited
      const editingOrder = orders.find(order => getRowId(order) === editingRow);
      if (editingOrder) {
        onQuantityUpdate(editingOrder.id, editingOrder.lineId, editValue);
      }
    }
    setEditingRow(null);
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditValue(0);
  };

  const handleCheckboxChange = (order: SalesOrder) => {
    const selectionId = getRowId(order);
    console.log('SELECTIONID', selectionId);
    onSelectOrder(selectionId);
  };

  const isOrderSelected = (order: SalesOrder) => {
    const selectionId = getRowId(order);
    return selectedOrders.has(selectionId);
  };

  if (orders.length === 0) {
    const colSpan = showItemColumn ? 11 : 9; // 11 when showing both Line ID and Item, 9 when hiding both
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={colSpan} className="h-24 text-center">
            <div className="flex flex-col items-center justify-center space-y-1 py-4 text-muted-foreground">
              <p>No orders match your filters</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {orders.map((order) => {
        const customer = getCustomerById(order.customerId);
        const subsidiary = getSubsidiaryById(order.subsidiaryId);
        const location = getLocationById(order.locationId);
        const shippingMethod = getShippingMethodById(order.shippingMethodId);
        const item = getItemById(order.itemId);
        const orderDate = new Date(order.date);
        const rowId = getRowId(order);
        const isEditing = editingRow === rowId;
        const isSelected = isOrderSelected(order);

        return (
          <TableRow
            key={rowId}
            className={`group ${isSelected ? "bg-muted/20" : ""}`}
          >
            <TableCell className="p-2 text-center">
              <div className="flex justify-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleCheckboxChange(order)}
                  aria-label={`Select order ${order.orderNumber}`}
                  className="w-4 h-4 mx-1 rounded"
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">
              <a 
                href={`/app/accounting/transactions/salesord.nl?id=${order.id}`}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {order.orderNumber}
              </a>
            </TableCell>
            <TableCell>{format(orderDate, "MMM d, yyyy")}</TableCell>
            <TableCell>
              {subsidiary?.text || "Unknown Subsidiary"}
            </TableCell>
            <TableCell>
              {customer?.text || "Unknown Customer"}
            </TableCell>
            <TableCell>
              {location?.text || "Unknown Location"}
            </TableCell>
            <TableCell>
              {shippingMethod?.text || "Unknown Method"}
            </TableCell>
            {showItemColumn && (
              <>
                <TableCell>
                  {order.lineId}
                </TableCell>
                <TableCell>
                  {item?.text || "Unknown Item"}
                </TableCell>
              </>
            )}
            <TableCell className="text-right">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  {/* <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-20 h-8 text-right"
                    min="1"
                    max={order.fulfillmentQuantity}
                  /> */}
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= order.fulfillmentQuantity) {
                        setEditValue(val);
                      } else if (val < 1) {
                        setEditValue(1);
                      } else if (val > order.fulfillmentQuantity) {
                        setEditValue(order.fulfillmentQuantity);
                      }
                    }}
                    className="w-20 h-8 text-right"
                    min="1"
                    max={order.fulfillmentQuantity}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditSave}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditCancel}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-2">
                  <span>{order.fulfillmentQuantity}</span>
                  {!isMainline && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(order, order.fulfillmentQuantity)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(order.shippingCost)}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default OrderTableBody;
