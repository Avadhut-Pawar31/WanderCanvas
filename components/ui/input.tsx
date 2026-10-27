import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#244536]/15 bg-white px-4 py-2 text-sm text-[#292D2A] transition-all placeholder:text-[#292D2A]/40 focus-visible:outline-none focus-visible:border-[#244536] focus-visible:ring-2 focus-visible:ring-[#244536]/10 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
