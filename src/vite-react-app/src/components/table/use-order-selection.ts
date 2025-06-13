
import { useState, useEffect } from "react";

export function useOrderSelection<T extends { id: string; lineId?: string }>(items: T[], isMainline: boolean = false) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Create unique identifier for selection
  const getSelectionId = (item: T) => {
    return isMainline ? item.id : `${item.id}-${item.lineId || 'main'}`;
  };

  // Reset selections when items list changes significantly (like after processing)
  useEffect(() => {
    // Clean up the selection set to only include IDs that still exist in the items array
    const currentIds = new Set(items.map(item => getSelectionId(item)));
    const newSelectedItems = new Set<string>();
    
    // Only keep selections that still exist in the current items
    selectedItems.forEach(id => {
      if (currentIds.has(id)) {
        newSelectedItems.add(id);
      }
    });
    
    // Update if there are changes
    if (newSelectedItems.size !== selectedItems.size) {
      setSelectedItems(newSelectedItems);
    }
  }, [items, isMainline]);

  // Handle checkbox selection
  const handleSelectItem = (selectionId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(selectionId)) {
      newSelected.delete(selectionId);
    } else {
      newSelected.add(selectionId);
    }
    setSelectedItems(newSelected);
  };

  // Handle select all for current page only
  const handleSelectAll = (currentItems: T[]) => {
    const currentItemIds = currentItems.map(item => getSelectionId(item));
    const allCurrentSelected = currentItemIds.every(id => selectedItems.has(id));
    
    if (allCurrentSelected) {
      // Deselect all current page items
      const newSelected = new Set(selectedItems);
      currentItemIds.forEach(id => newSelected.delete(id));
      setSelectedItems(newSelected);
    } else {
      // Select all current page items
      const newSelected = new Set(selectedItems);
      currentItemIds.forEach(id => newSelected.add(id));
      setSelectedItems(newSelected);
    }
  };

  return {
    selectedItems,
    setSelectedItems,
    handleSelectItem,
    handleSelectAll,
  };
}
