import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const base =
  "w-full rounded-xl border border-border bg-background/60 px-4 text-foreground placeholder:text-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        base,
        "h-12",
        invalid && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
        className,
      )}
      {...props}
    />
  );
});
