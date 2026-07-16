import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-primary-focus focus-visible:ring-[2px] focus-visible:ring-primary-focus/20 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary-focus",
        secondary:
          "bg-muted text-ink-muted-80 border-border [a]:hover:bg-surface-pearl",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-ink-muted-80 bg-surface-pearl [a]:hover:bg-muted",
        success:
          "bg-success/10 text-success border-success/20 [a]:hover:bg-success/20",
        ghost:
          "text-primary hover:bg-primary/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
