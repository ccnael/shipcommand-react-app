
import React, { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownOption } from "@/components/filters/types";

interface DropdownFilterContentProps {
  options: DropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  isLoading: boolean;
  onClose: () => void;
}

const DropdownFilterContent: React.FC<DropdownFilterContentProps> = ({
  options,
  value,
  onSelect,
  isLoading,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredOptions = options.filter(option => 
    option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setSearchTerm("");
    onClose();
  };

  return (
    <div className="overflow-hidden bg-popover">
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm">Loading options...</span>
        </div>
      )}
      
      {/* Search input - only show if not loading */}
      {!isLoading && (
        <div className="flex items-center border-b px-3">
          <input
            className="flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ boxShadow: 'none' }}
          />
        </div>
      )}
      
      {/* Options list - only show if not loading */}
      {!isLoading && (
        <div className="max-h-[200px] overflow-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm">
              No options found.
            </div>
          ) : (
            <div>
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex items-center gap-2 text-sm py-2 px-2 rounded-sm cursor-pointer font-normal",
                    option.value === value 
                      ? "bg-accent text-accent-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{option.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownFilterContent;
