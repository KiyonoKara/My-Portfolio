import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-background flex h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm transition-colors outline-none",
        "placeholder:text-muted-foreground selection:bg-primary/20",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/60",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };
