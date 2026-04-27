import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Soft destructive / last-call angry: rgb(254,242,242) bg, rgb(220,53,69) text */
const badgeDestructiveSoft =
  "border-0 bg-red-50 text-[#dc3545] font-medium shadow-none hover:bg-red-100"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: badgeDestructiveSoft,
        outline: "text-foreground",
        /**
         * OMNI: Last-call / sentiment (maps Figma Yellow Y50 + Y500).
         * @see skills.md — OMNI/ACKO tokens
         */
        ackoWarning:
          "border-0 bg-[#fff7e5] text-[#d16900] font-medium",
        /**
         * OMNI: “Angry” / high-urgency last call — ACKO red R50 background, danger text (#dc3545).
         */
        ackoAngry: badgeDestructiveSoft,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
