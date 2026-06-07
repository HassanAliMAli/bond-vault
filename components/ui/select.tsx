"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref}
    className={cn(
      "flex h-12 w-full items-center justify-between rounded-[var(--radius-sm)] border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white",
      "hover:border-dark-500 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40",
      "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200", className)}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild><ChevronDown className="h-4 w-4 text-gray" /></SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} position={position}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 shadow-elevation-4",
        "data-[state=open]:animate-in data-[state=closed]:animate-out", className)}
      {...props}>
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref}
    className={cn("relative flex w-full cursor-pointer select-none items-center rounded-[var(--radius-sm)] py-2 px-3 text-sm text-white outline-none focus:bg-dark-700 data-[state=checked]:bg-gold/10 data-[state=checked]:text-gold transition-colors", className)}
    {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
