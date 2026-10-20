import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium outline-none select-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary-focus shadow-xs border-0",
        outline:
          "rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-foreground border-0",
        secondary:
          "rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-foreground border-0",
        pill:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary-focus shadow-xs border-0",
        "secondary-pill":
          "rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-foreground font-medium border-0",
        pearl:
          "rounded-xl bg-card hover:bg-card-hover text-foreground border border-white/[0.06] shadow-2xs",
        ghost:
          "rounded-full text-foreground/80 hover:text-foreground hover:bg-white/[0.08] border-0",
        destructive:
          "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs border-0",
        "destructive-soft":
          "rounded-full bg-destructive/15 text-destructive hover:bg-destructive/25 border-0",
        link: "text-primary underline-offset-4 hover:underline border-0",
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
