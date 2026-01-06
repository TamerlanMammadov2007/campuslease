import * as React from "react"

import { cn } from "@/lib/utils"

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-white/30 bg-white/10 text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
        className,
      )}
      {...props}
    />
  ),
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
