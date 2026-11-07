import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "btn-hard group/button inline-flex shrink-0 items-center justify-center rounded-[10px] text-button font-bold whitespace-nowrap outline-none select-none transition-all duration-120 cursor-pointer focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:bg-mist disabled:text-bark disabled:border-[1.5px] disabled:border-bark disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-leaf text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        primary:
          "bg-leaf text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        secondary:
          "bg-surface text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        story:
          "bg-sand text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        ai:
          "bg-sprout text-espresso border-[1.5px] border-moss shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        danger:
          "bg-clay text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        destructive:
          "bg-clay text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        like:
          "bg-clay text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        inverse:
          "bg-espresso text-canvas border-2 border-espresso shadow-hard-moss hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        outline:
          "bg-surface text-espresso border-2 border-espresso shadow-hard hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard-lg",
        ghost:
          "border-transparent bg-transparent text-espresso hover:bg-mist/70 shadow-none active:translate-x-0 active:translate-y-0",
        link:
          "border-transparent bg-transparent text-espresso underline-offset-4 hover:underline shadow-none active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-12 px-5 min-h-[48px] gap-2",
        sm: "h-9 px-3.5 text-xs font-bold gap-1.5 rounded-[8px]",
        lg: "h-14 px-7 text-base font-bold gap-2.5",
        icon: "size-11 min-w-[44px] min-h-[44px] rounded-[10px] p-0 flex items-center justify-center",
        "icon-sm": "size-9 rounded-[8px] p-0 flex items-center justify-center",
        "icon-lg": "size-14 rounded-[12px] p-0 flex items-center justify-center",
        create: "size-[60px] rounded-full p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        isLoading && "translate-x-[3px] translate-y-[3px] shadow-none pointer-events-none"
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-espresso animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-espresso animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-espresso animate-bounce [animation-delay:300ms]" />
        </span>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
