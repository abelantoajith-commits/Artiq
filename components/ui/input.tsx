import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-[10px] border-2 border-espresso bg-surface px-4 py-2 text-sm text-espresso placeholder:text-bark outline-none shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-mist disabled:text-bark/60 disabled:border-bark/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
