
import React from "react";
import { UseFilterValuesResult } from "../types/filterTypes";
import SearchInput from "../SearchInput";
import DropdownFilter from "../DropdownFilter";
import DateRangeFilter from "../DateRangeFilter";
import MultiSelectFilter from "../MultiSelectFilter";
import SwitchFilter from "../SwitchFilter";
import { 
  fetchSubsidiaries,
  fetchCustomers,
  fetchShippingMethods,
  fetchLocations
} from "@/lib/data";

const FilterGrid: React.FC<{
  filterValues: UseFilterValuesResult
}> = ({ filterValues }) => {
  const { 
    setOrderNumber, 
    setSubsidiaryId, 
    setLocationId, 
    setCustomerId,
    setShippingMethodIds,
    setDateFrom,
    setDateTo,
    setMainline,
    filters
  } = filterValues;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <SearchInput
        id="orderNumber"
        label="Sales Order #"
        value={filters.orderNumber}
        onChange={setOrderNumber}
        placeholder="Search order #"
      />

      <DropdownFilter
        id="subsidiary"
        label="Subsidiary"
        options={[]} // Start with empty options
        value={filters.subsidiaryId}
        onChange={setSubsidiaryId}
        placeholder="Select subsidiary"
        fetchOptionsOnOpen={() => fetchSubsidiaries()}
      />

      <DropdownFilter
        id="location"
        label="Location"
        options={[]} // Always start with empty options
        value={filters.locationId}
        onChange={setLocationId}
        placeholder="Select location"
        disabled={!filters.subsidiaryId}
        dependentFilter={filters.subsidiaryId ? "" : "after selecting a subsidiary"}
        // Always refetch to ensure we get the latest data based on the selected subsidiary
        alwaysRefetch={true}
        fetchOptionsOnOpen={() => {
          if (filters.subsidiaryId) {
            console.log("Fetching locations for subsidiary:", filters.subsidiaryId);
            return fetchLocations(filters.subsidiaryId);
          }
          console.log("No subsidiary selected, returning empty locations array");
          return Promise.resolve([]);
        }}
      />

      <DropdownFilter
        id="customer"
        label="Customer"
        options={[]} // Start with empty options
        value={filters.customerId}
        onChange={setCustomerId}
        placeholder="Select customer"
        fetchOptionsOnOpen={() => fetchCustomers()}
      />

      <MultiSelectFilter
        id="shippingMethod"
        label="Shipping Method"
        options={[]} // Start with empty options
        selected={filters.shippingMethodIds}
        onChange={setShippingMethodIds}
        placeholder="Select methods"
        fetchOptionsOnOpen={async () => {
          try {
            const methods = await fetchShippingMethods();
            return methods.map(method => ({
              label: method.text,
              value: method.value,
            }));
          } catch (error) {
            console.error("Error fetching shipping methods:", error);
            return [];
          }
        }}
      />

      <DateRangeFilter
        id="dateFrom"
        label="Date From"
        value={filters.dateFrom}
        onChange={setDateFrom}
      />

      <DateRangeFilter
        id="dateTo"
        label="Date To"
        value={filters.dateTo}
        onChange={setDateTo}
        disabledDate={(date) => filters.dateFrom ? date < filters.dateFrom : false}
      />

      <SwitchFilter
        id="mainline"
        label="Mainline"
        checked={filters.mainline}
        onChange={setMainline}
      />
    </div>
  );
};

export default FilterGrid;
