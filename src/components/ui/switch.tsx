"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import NormalButton from "./normal-button";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, _ref) => (
    <NormalButton
      variant="ghost"
      size="sm"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </NormalButton>
  )
);
Switch.displayName = "Switch";

export { Switch };
