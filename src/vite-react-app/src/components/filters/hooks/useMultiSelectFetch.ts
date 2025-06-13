
import { useState, useEffect } from "react";
import { Option } from "@/components/ui-custom/MultiSelect";

interface UseMultiSelectFetchProps {
  initialOptions: Option[];
  fetchOptionsOnOpen?: () => Promise<Option[]>;
}

interface UseMultiSelectFetchResult {
  options: Option[];
  isLoading: boolean;
  hasLoadedOptions: boolean;
  handleFetchOptions: () => Promise<void>;
}

export const useMultiSelectFetch = ({
  initialOptions,
  fetchOptionsOnOpen
}: UseMultiSelectFetchProps): UseMultiSelectFetchResult => {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false);

  // Update options from props only if we have initial options and haven't loaded yet
  useEffect(() => {
    if (initialOptions.length > 0 && !hasLoadedOptions) {
      setOptions(initialOptions);
    }
  }, [initialOptions, hasLoadedOptions]);

  // Function to handle fetching options when the MultiSelect is opened
  const handleFetchOptions = async () => {
    if (fetchOptionsOnOpen && !hasLoadedOptions) {
      setIsLoading(true);
      try {
        const fetchedOptions = await fetchOptionsOnOpen();
        setOptions(fetchedOptions);
        setHasLoadedOptions(true);
      } catch (error) {
        console.error(`Error fetching options:`, error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    options,
    isLoading,
    hasLoadedOptions,
    handleFetchOptions
  };
};
