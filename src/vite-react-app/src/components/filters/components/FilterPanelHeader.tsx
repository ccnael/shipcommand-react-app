
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterPanelHeaderProps {
  onClearFilters: () => void;
}

const FilterPanelHeader: React.FC<FilterPanelHeaderProps> = ({ 
  onClearFilters 
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">Filter Orders</h2>
        <p className="text-sm text-muted-foreground">
          Refine your search using the filters below
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="h-8 px-2 text-xs"
      >
        Clear All
        <X className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
};

export default FilterPanelHeader;
