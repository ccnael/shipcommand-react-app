
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangeFilterProps {
  id: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabledDate?: (date: Date) => boolean;
}

export const useDateRangeFilter = (initialRange?: DateRange) => {
  const [dateRange, setDateRange] = React.useState<DateRange>(initialRange || {});
  
  const handleDateChange = React.useCallback((field: keyof DateRange, value: Date | undefined) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  return {
    dateRange,
    setDateRange,
    handleDateChange
  };
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  id,
  label,
  value,
  onChange,
  disabledDate,
}) => {
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div className="filter-section">
      <Label htmlFor={id} className="filter-label">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "MMM d, yyyy") : "Select date"}
            {value && (
              <div 
                className="ml-auto flex items-center"
                onClick={handleClear}
              >
                <X
                  className="h-4 w-4 shrink-0 opacity-50"
                  aria-hidden="true"
                />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="popover-content w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            className="p-3 pointer-events-auto"
            disabled={disabledDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
