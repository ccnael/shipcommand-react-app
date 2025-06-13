
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DropdownOption, FetchOptionsFunction } from "./types";
import { useDropdownFetch } from "./useDropdownFetch";
import DropdownFilterContent from "./DropdownFilterContent";

interface DropdownFilterProps {
  id: string;
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  dependentFilter?: string;
  fetchOptionsOnOpen?: FetchOptionsFunction;
  alwaysRefetch?: boolean;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select option",
  disabled = false,
  dependentFilter,
  fetchOptionsOnOpen,
  alwaysRefetch = false
}) => {
  const [open, setOpen] = useState(false);
  
  const {
    localOptions,
    isLoading,
    handleOpenChange,
    resetLocalOptions
  } = useDropdownFetch({ 
    options: options || [], 
    fetchOptionsOnOpen,
    alwaysRefetch
  });
  
  // If value is set but not found in options, clear it
  const selectedOption = localOptions.find((opt) => opt.value === value);
  
  // Reset value if not found in current options and we have a value
  React.useEffect(() => {
    if (value && localOptions.length > 0 && !selectedOption) {
      onChange("");
    }
  }, [localOptions, value, selectedOption, onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };
  
  const onOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    await handleOpenChange(isOpen);
  };

  return (
    <div className="filter-section">
      <Label htmlFor={id} className="filter-label">
        {label}
      </Label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 font-normal hover:bg-accent/50"
            disabled={disabled}
            type="button"
          >
            {value && selectedOption ? selectedOption.text : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {isLoading ? (
              <Loader2 className="ml-auto h-4 w-4 animate-spin" />
            ) : value ? (
              <div 
                className="ml-auto flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear(e);
                }}
              >
                <X
                  className="h-4 w-4 shrink-0 opacity-50"
                  aria-hidden="true"
                />
              </div>
            ) : (
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 animate-fade-in rounded-md border border-input shadow-md overflow-hidden" 
          align="start"
          sideOffset={8}
        >
          <DropdownFilterContent 
            options={localOptions}
            value={value}
            onSelect={onChange}
            isLoading={isLoading}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
      {dependentFilter && (
        <div className="text-xs text-muted-foreground mt-1">
          Filters available {dependentFilter}
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
