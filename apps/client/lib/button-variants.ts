import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium outline-none select-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-primary text-primary-foreground hover:bg-primary-focus",
        outline:
          "rounded-lg border border-border bg-transparent text-foreground hover:bg-muted hover:border-border-strong",
        secondary:
          "rounded-lg bg-foreground text-background hover:bg-foreground/90",
        pearl:
          "rounded-lg border border-border bg-card text-foreground hover:bg-card-hover hover:border-border-strong shadow-sm",
        ghost:
          "rounded-lg text-foreground hover:bg-muted",
        destructive:
          "rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90",
        "destructive-soft":
          "rounded-lg bg-destructive-soft text-destructive hover:bg-destructive/15 border border-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 text-[14px] gap-1.5",
        xs: "h-7 px-2.5 text-[12px] gap-1",
        sm: "h-8 px-3 text-[13px] gap-1.5",
        lg: "h-12 px-6 text-[15px] gap-2",
        icon: "size-10",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
