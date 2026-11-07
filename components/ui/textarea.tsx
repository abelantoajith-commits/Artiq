import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-[10px] border-2 border-espresso bg-surface px-4 py-3 text-sm text-espresso placeholder:text-bark outline-none shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-mist disabled:text-bark/60 disabled:border-bark/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
