import { Dispatch, SetStateAction } from "react";

export interface FilterValues {
  orderNumber: string;
  subsidiaryId: string;
  locationId: string;
  customerId: string;
  shippingMethodIds: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  mainline: boolean;
}

export interface FilterPanelProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface UseFilterValuesResult {
  filters: FilterValues;
  setOrderNumber: (value: string) => void;
  setSubsidiaryId: (value: string) => void;
  setLocationId: (value: string) => void;
  setCustomerId: (value: string) => void;
  setShippingMethodIds: (value: string[]) => void;
  setDateFrom: (value: Date | undefined) => void;
  setDateTo: (value: Date | undefined) => void;
  setMainline: (value: boolean) => void;
  handleClearFilters: () => void;
}
