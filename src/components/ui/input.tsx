import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  explainingText?: React.ReactNode;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, explainingText, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-0 w-full">
        {label && <label className="text-sm text-foreground">{label}</label>}
        <input
          type={type || "text"}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-input dark:placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:italic focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-dark-bg mt-1 block w-full rounded dark:text-foreground dark:[color-scheme:dark]",
            className,
            error ? "border-error" : "",
            error ? "animation-error-fade" : "animate-none",
          )}
          ref={ref}
          {...props}
        />
        {explainingText && (
          <div className="text-xs text-muted-foreground/70">
            {explainingText}
          </div>
        )}
        {error && <div className="text-xs text-red-500 h-56">{error}</div>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
