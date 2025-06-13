
import { useState, useEffect } from "react";
import { DropdownOption, FetchOptionsFunction } from "./types";

interface UseDropdownFetchProps {
  options: DropdownOption[];
  fetchOptionsOnOpen?: FetchOptionsFunction;
  alwaysRefetch?: boolean;
}

interface UseDropdownFetchResult {
  localOptions: DropdownOption[];
  isLoading: boolean;
  hasLoadedOptions: boolean;
  handleOpenChange: (isOpen: boolean) => Promise<void>;
  resetLocalOptions: () => void;
}

export const useDropdownFetch = ({ 
  options, 
  fetchOptionsOnOpen,
  alwaysRefetch = false
}: UseDropdownFetchProps): UseDropdownFetchResult => {
  const [localOptions, setLocalOptions] = useState<DropdownOption[]>(options);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false);

  // Update local options when the passed options change
  useEffect(() => {
    if (options.length > 0) {
      setLocalOptions(options);
      // Reset loaded state when options change from parent
      if (JSON.stringify(options) !== JSON.stringify(localOptions)) {
        setHasLoadedOptions(false);
      }
    }
  }, [options, localOptions]);

  // Function to reset the local options
  const resetLocalOptions = () => {
    setLocalOptions([]);
    setHasLoadedOptions(false);
  };

  const handleOpenChange = async (isOpen: boolean) => {
    // Only fetch on open if we have a fetch function and either we haven't loaded yet or alwaysRefetch is true
    if (isOpen && fetchOptionsOnOpen && (!hasLoadedOptions || alwaysRefetch)) {
      setIsLoading(true);
      try {
        const fetchedOptions = await fetchOptionsOnOpen();
        setLocalOptions(fetchedOptions);
        setHasLoadedOptions(true);
      } catch (error) {
        console.error(`Error fetching options:`, error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    localOptions,
    isLoading,
    hasLoadedOptions,
    handleOpenChange,
    resetLocalOptions
  };
};
