import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244536] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-[#244536] text-white hover:bg-[#1B3529] shadow-sm hover:shadow-md",
        secondary: "bg-white text-[#292D2A] border border-[#244536]/15 hover:bg-[#F7F5EF] shadow-xs",
        terracotta: "bg-[#C78363] text-white hover:bg-[#B37050] shadow-sm hover:shadow-md",
        outline: "border border-[#244536]/30 text-[#244536] bg-transparent hover:bg-[#244536]/5",
        ghost: "text-[#292D2A] hover:bg-[#244536]/8 hover:text-[#244536]",
        subtle: "bg-[#E7ECE5] text-[#244536] hover:bg-[#d9e0d6]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-sm font-medium tracking-tight",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
