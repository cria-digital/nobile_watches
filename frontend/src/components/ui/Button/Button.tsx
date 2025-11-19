import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[#EFEFEF] disabled:text-[#777777] ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-[#D5A60A] text-white hover:bg-orange-600",
        gold: "bg-[#D5A60A] text-white hover:bg-[#C09609] active:bg-[#A88508]",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "underline-offset-4 hover:underline text-orange-500",
        stroke:
          "text-pb-500 border border-[#141414] bg-transparent hover:bg-gray-50 tracking-[0.02em]",
      },
      size: {
        default: "h-14 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-14 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
