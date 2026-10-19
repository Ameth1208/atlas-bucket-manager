import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium outline-none select-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-full bg-primary text-primary-foreground hover:bg-primary-focus shadow-xs",
        outline:
          "rounded-full border border-border bg-card text-foreground hover:bg-muted hover:border-border-strong",
        secondary:
          "rounded-full bg-muted text-foreground hover:bg-muted/80",
        pill:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary-focus shadow-xs",
        "secondary-pill":
          "rounded-full border border-border-strong/70 bg-card text-primary hover:bg-muted/60",
        pearl:
          "rounded-xl border border-border bg-card text-foreground hover:bg-card-hover hover:border-border-strong shadow-2xs",
        ghost:
          "rounded-xl text-foreground hover:bg-muted",
        destructive:
          "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        "destructive-soft":
          "rounded-full bg-destructive-soft text-destructive hover:bg-destructive/15 border border-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 text-[13px] gap-1.5",
        xs: "h-7 px-2.5 text-[12px] gap-1",
        sm: "h-8 px-3 text-[12.5px] gap-1.5",
        lg: "h-11 px-5 text-[14px] gap-2",
        icon: "size-9 rounded-full",
        "icon-xs": "size-6 rounded-full",
        "icon-sm": "size-7.5 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
