import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-white/15 text-white",
        amber: "bg-gradient-to-r from-orange-400 to-amber-300 text-slate-900",
        slate: "bg-slate-900/70 text-slate-200",
        green: "bg-emerald-500/20 text-emerald-200",
        red: "bg-rose-500/20 text-rose-200",
        yellow: "bg-amber-500/20 text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
