import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-[100ms] ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:transition-transform [&_svg]:duration-[600ms] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transform-none motion-reduce:translate-none motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground border border-white/25 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(10,22,28,0.15)] hover:bg-primary/75",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-border bg-background shadow-sm hover:border-cavern/40 hover:bg-secondary hover:text-secondary-foreground hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md",
        accent: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-lg hover:shadow-bamboo/25",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-7 has-[>svg]:px-5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
