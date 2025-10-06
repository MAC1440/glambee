
"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { Search } from "lucide-react"
import * as React from "react"

interface DebouncedInputProps extends Omit<React.ComponentProps<"input">, 'value' | 'onChange'> {
  value: string | number
  onValueChange: (value: string | number) => void
  debounce?: number
}

export function DebouncedInput({
  value: initialValue,
  onValueChange,
  debounce = 500,
  className,
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = React.useState<string | number>(initialValue)

  const debouncedValue = useDebounce(value, debounce)

  React.useEffect(() => {
    onValueChange(debouncedValue)
  }, [debouncedValue, onValueChange])

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
