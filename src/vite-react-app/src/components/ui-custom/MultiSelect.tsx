
import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  maxDisplay?: number;
  id?: string;
  onOpen?: () => void;
  isLoading?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  maxDisplay = 3,
  id,
  onOpen,
  isLoading = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && onOpen) {
      onOpen();
    }
  };

  const displayValues = () => {
    if (selected.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    const selectedItems = options
      .filter((option) => selected.includes(option.value))
      .map((option) => option.label);

    if (selectedItems.length <= maxDisplay) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="animate-scale-in flex items-center gap-1"
            >
              {item}
            </Badge>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedItems.slice(0, maxDisplay).map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className="animate-scale-in flex items-center gap-1"
          >
            {item}
          </Badge>
        ))}
        <Badge variant="outline" className="ml-1">
          +{selectedItems.length - maxDisplay}
        </Badge>
      </div>
    );
  };

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-9 px-3 hover:bg-accent/50",
            className
          )}
          onClick={() => setOpen(!open)}
          type="button"
          id={id}
        >
          <div className="flex text-sm mr-auto">{displayValues()}</div>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="popover-content w-[--radix-popover-trigger-width] p-0 animate-fade-in rounded-md border border-input shadow-md overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <div className="bg-popover overflow-hidden">
          {/* Loading indicator */}
          {isLoading && (
            <div className="py-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading options...</p>
            </div>
          )}
          
          {/* Search input - only show if not loading */}
          {!isLoading && (
            <div className="flex items-center border-b px-3">
              <input
                className="flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ boxShadow: 'none' }}
              />
            </div>
          )}
          
          {/* Options list - only show if not loading */}
          {!isLoading && (
            <div className="max-h-60 overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  No options found.
                </div>
              ) : (
                <div>
                  {filteredOptions.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => {
                          onChange(
                            isSelected
                              ? selected.filter((item) => item !== option.value)
                              : [...selected, option.value]
                          );
                          // Don't close the popover so user can select multiple items
                        }}
                        className={cn(
                          "flex items-center gap-2 text-sm py-2 px-2 rounded-sm cursor-pointer",
                          isSelected 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>{option.label}</span>
                      </div>
                    )}
                  )}
                </div>
              )}
            </div>
          )}
          {selected.length > 0 && !isLoading && (
            <div className="flex items-center justify-between p-2 border-t">
              <span className="text-xs text-muted-foreground">
                {selected.length} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onChange([])}
              >
                Clear all
                <X className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
