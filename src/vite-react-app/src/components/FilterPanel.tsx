
import React from "react";
import { FilterPanelProps } from "./filters/types/filterTypes";
import { useFilterValues } from "./filters/hooks/useFilterValues";
import FilterPanelHeader from "./filters/components/FilterPanelHeader";
import FilterGrid from "./filters/components/FilterGrid";

// Re-export FilterValues for backwards compatibility
export type { FilterValues } from "./filters/types/filterTypes";

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const filterValues = useFilterValues(onFilterChange);

  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm mb-6 animate-fade-in">
      <FilterPanelHeader onClearFilters={filterValues.handleClearFilters} />
      <FilterGrid filterValues={filterValues} />
    </div>
  );
};

export default FilterPanel;
