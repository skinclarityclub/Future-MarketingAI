"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-slate-800/80 text-slate-200 border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-600/50 hover:text-white",
        primary:
          "bg-blue-600/20 text-blue-200 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-400/40 hover:text-blue-100",
        secondary:
          "bg-slate-700/50 text-slate-300 border border-slate-600/40 hover:bg-slate-600/60 hover:border-slate-500/50 hover:text-slate-200",
        ghost: "text-slate-300 hover:bg-slate-800/50 hover:text-slate-200",
        outline:
          "border border-slate-600/50 bg-transparent text-slate-300 hover:bg-slate-800/30 hover:text-slate-200 hover:border-slate-500/60",
        destructive:
          "bg-red-600/20 text-red-200 border border-red-500/30 hover:bg-red-600/30 hover:border-red-400/40 hover:text-red-100",
        success:
          "bg-green-600/20 text-green-200 border border-green-500/30 hover:bg-green-600/30 hover:border-green-400/40 hover:text-green-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NormalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const NormalButton = forwardRef<HTMLButtonElement, NormalButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NormalButton.displayName = "NormalButton";

export { NormalButton, buttonVariants };
export default NormalButton;
