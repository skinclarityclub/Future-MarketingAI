import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import NormalButton from "@/components/ui/normal-button";

// Select Context
const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  value: "",
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
});

// Select Root Component
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Select({
  value,
  onValueChange,
  defaultValue,
  open: controlledOpen,
  onOpenChange,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [internalOpen, setInternalOpen] = React.useState(false);

  const currentValue = value !== undefined ? value : internalValue;
  const currentOpen =
    controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleValueChange = onValueChange || setInternalValue;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open: currentOpen,
        onOpenChange: handleOpenChange,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

// Select Trigger
interface SelectTriggerProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    return (
      <NormalButton
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={context.open}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => !disabled && context.onOpenChange(!context.open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </NormalButton>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

// Select Value
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    return (
      <span ref={ref} className={cn("block truncate", className)} {...props}>
        {context.value || (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

// Select Content
interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = "bottom", ...props }, ref) => {
    const context = React.useContext(SelectContext);

    if (!context.open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40"
          onClick={() => context.onOpenChange(false)}
        />

        {/* Content */}
        <div
          ref={ref}
          className={cn(
            "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            position === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
            "data-[side=bottom]:animate-in data-[side=bottom]:fade-in-0 data-[side=bottom]:zoom-in-95",
            "data-[side=top]:animate-in data-[side=top]:fade-in-0 data-[side=top]:zoom-in-95",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);
SelectContent.displayName = "SelectContent";

// Select Item
interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, className, children, disabled, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    const handleSelect = () => {
      if (!disabled) {
        context.onValueChange(value);
        context.onOpenChange(false);
      }
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={context.value === value}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          context.value === value && "bg-accent text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleSelect}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {context.value === value && (
            <div className="h-2 w-2 rounded-full bg-current" />
          )}
        </span>
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
