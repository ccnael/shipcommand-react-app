
import { useState, useEffect } from "react";

import { FilterValues, UseFilterValuesResult } from "../types/filterTypes";

export const useFilterValues = (
  onFilterChange: (filters: FilterValues) => void
): UseFilterValuesResult => {
  const [orderNumber, setOrderNumber] = useState("");
  const [subsidiaryId, setSubsidiaryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [shippingMethodIds, setShippingMethodIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [mainline, setMainline] = useState(false);

  // Handle subsidiary change with location reset
  const handleSubsidiaryChange = (value: string) => {
    // Always reset location ID when subsidiary changes
    setLocationId("");
    // Then set the subsidiary ID
    setSubsidiaryId(value);
  };

  useEffect(() => {
    onFilterChange({
      orderNumber,
      subsidiaryId,
      locationId,
      customerId,
      shippingMethodIds,
      dateFrom,
      dateTo,
      mainline,
    });
  }, [
    orderNumber,
    subsidiaryId,
    locationId,
    customerId,
    shippingMethodIds,
    dateFrom,
    dateTo,
    mainline,
    onFilterChange,
  ]);

  const handleClearFilters = () => {
    setOrderNumber("");
    setSubsidiaryId("");
    setLocationId("");
    setCustomerId("");
    setShippingMethodIds([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    // setMainline(false);
  };

  return {
    filters: {
      orderNumber,
      subsidiaryId,
      locationId,
      customerId,
      shippingMethodIds,
      dateFrom,
      dateTo,
      mainline,
    },
    setOrderNumber,
    setSubsidiaryId: handleSubsidiaryChange,
    setLocationId,
    setCustomerId,
    setShippingMethodIds,
    setDateFrom,
    setDateTo,
    setMainline,
    handleClearFilters
  };
};
