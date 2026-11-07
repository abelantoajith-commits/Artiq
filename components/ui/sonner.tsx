"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-espresso group-[.toaster]:border-2 group-[.toaster]:border-espresso group-[.toaster]:shadow-hard-sm group-[.toaster]:rounded-[10px] group-[.toaster]:font-body group-[.toaster]:font-semibold",
          description: "group-[.toast]:text-bark group-[.toast]:font-normal",
          actionButton:
            "group-[.toast]:bg-leaf group-[.toast]:text-espresso group-[.toast]:border group-[.toast]:border-espresso group-[.toast]:rounded-[6px] group-[.toast]:font-bold",
          cancelButton:
            "group-[.toast]:bg-mist group-[.toast]:text-bark group-[.toast]:border group-[.toast]:border-bark group-[.toast]:rounded-[6px]",
        },
      }}
      {...props}
    />
  )
}
