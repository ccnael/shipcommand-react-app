
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SwitchFilterProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SwitchFilter: React.FC<SwitchFilterProps> = ({
  id,
  label,
  checked,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center space-x-2">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
        />
        {/* <Label htmlFor={id} className="text-sm text-muted-foreground cursor-pointer">
          {label}
        </Label> */}
      </div>
    </div>
  );
};

export default SwitchFilter;
