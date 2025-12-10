"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
  value: Date | null | undefined
  onChange: (date: Date | null) => void
  min?: Date
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  min,
  disabled,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  
  // Convert 24-hour to 12-hour format for display
  const get12Hour = (hour24: number): number => {
    if (hour24 === 0) return 12
    if (hour24 > 12) return hour24 - 12
    return hour24
  }

  const [hours, setHours] = React.useState<string>(
    value ? String(get12Hour(value.getHours())).padStart(2, "0") : "12"
  )
  const [minutes, setMinutes] = React.useState<string>(
    value ? String(value.getMinutes()).padStart(2, "0") : "00"
  )
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(
    value && value.getHours() >= 12 ? "PM" : "AM"
  )

  // Refs for the scroll viewport elements (inside ScrollArea)
  const hoursViewportRef = React.useRef<HTMLDivElement>(null)
  const minutesViewportRef = React.useRef<HTMLDivElement>(null)
  const ampmViewportRef = React.useRef<HTMLDivElement>(null)

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      const hour12 = get12Hour(date.getHours())
      setHours(String(hour12).padStart(2, "0"))
      setMinutes(String(date.getMinutes()).padStart(2, "0"))
      setAmpm(date.getHours() >= 12 ? "PM" : "AM")
    } else {
      setSelectedDate(undefined)
      setHours("12")
      setMinutes("00")
      setAmpm("AM")
    }
  }, [value])

  // Scroll to selected values when popover opens
  React.useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToSelected(hoursViewportRef.current, parseInt(hours) - 1)
        scrollToSelected(minutesViewportRef.current, parseInt(minutes))
        scrollToSelected(ampmViewportRef.current, ampm === "PM" ? 1 : 0)
      }, 100)
    }
  }, [open, hours, minutes, ampm])

  const scrollToSelected = (container: HTMLDivElement | null, index: number) => {
    if (!container) return
    // Find the scrollable parent (the div with overflow-y-auto)
    const scrollableParent = container.parentElement
    if (!scrollableParent) return
    const itemHeight = 36 // h-8 (32px) + gap-1 (4px) = 36px total
    const scrollPosition = index * itemHeight
    scrollableParent.scrollTo({ top: scrollPosition, behavior: 'smooth' })
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    e.stopPropagation()
    container.scrollTop += e.deltaY
    if (e.deltaX !== 0) {
      container.scrollLeft += e.deltaX
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // Combine date with existing time immediately
      const newDate = new Date(date)
      let hour24 = parseInt(hours)
      if (ampm === "PM" && hour24 !== 12) hour24 += 12
      if (ampm === "AM" && hour24 === 12) hour24 = 0
      newDate.setHours(hour24, parseInt(minutes), 0, 0)
      onChange(newDate)
    } else {
      setSelectedDate(undefined)
      onChange(null)
    }
  }

  const updateDateTime = React.useCallback(() => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      let hour24 = parseInt(hours)
      if (ampm === "PM" && hour24 !== 12) hour24 += 12
      if (ampm === "AM" && hour24 === 12) hour24 = 0
      newDate.setHours(hour24, parseInt(minutes), 0, 0)
      
      // Validate: if date is today, ensure time is not in the past
      const now = new Date()
      const isToday = selectedDate.toDateString() === now.toDateString()
      if (isToday && newDate < now) {
        // Don't update if time is in the past for today
        return
      }
      
      onChange(newDate)
    }
  }, [selectedDate, hours, minutes, ampm, onChange])

  // Check if a time is valid (not in the past if date is today)
  const isTimeValid = (hour: number, minute: number, period: "AM" | "PM"): boolean => {
    if (!selectedDate) return true
    
    const now = new Date()
    const isToday = selectedDate.toDateString() === now.toDateString()
    
    if (!isToday) return true // Not today, so any time is valid
    
    // Convert to 24-hour format
    let hour24 = hour
    if (period === "PM" && hour24 !== 12) hour24 += 12
    if (period === "AM" && hour24 === 12) hour24 = 0
    
    // Create the selected time for today
    const selectedTime = new Date(selectedDate)
    selectedTime.setHours(hour24, minute, 0, 0)
    
    // Check if selected time is in the future
    return selectedTime >= now
  }

  const handleHoursChange = (h: string) => {
    const num = parseInt(h)
    if (!isNaN(num) && num >= 1 && num <= 12) {
      // Check if this hour with current minute and period would be valid
      if (isTimeValid(num, parseInt(minutes), ampm)) {
        setHours(String(num).padStart(2, "0"))
        // Auto-save immediately
        setTimeout(() => {
          updateDateTime()
        }, 0)
      }
    }
  }

  const handleMinutesChange = (m: string) => {
    const num = parseInt(m)
    if (!isNaN(num) && num >= 0 && num <= 59) {
      // Check if this minute with current hour and period would be valid
      if (isTimeValid(parseInt(hours), num, ampm)) {
        setMinutes(String(num).padStart(2, "0"))
        // Auto-save immediately
        setTimeout(() => {
          updateDateTime()
        }, 0)
      }
    }
  }

  const handleAmpmChange = (a: "AM" | "PM") => {
    // Check if this period with current hour and minute would be valid
    if (isTimeValid(parseInt(hours), parseInt(minutes), a)) {
      setAmpm(a)
      // Auto-save immediately
      setTimeout(() => {
        updateDateTime()
      }, 0)
    }
  }

  const displayValue = value
    ? format(value, "dd/MM/yyyy, hh:mm a")
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="p-3 border-r">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => {
                if (min) {
                  return date < min
                }
                return false
              }}
            />
            <div className="flex items-center justify-between p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(undefined)
                  onChange(null)
                }}
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  setSelectedDate(today)
                  const hour12 = get12Hour(today.getHours())
                  setHours(String(hour12).padStart(2, "0"))
                  setMinutes(String(today.getMinutes()).padStart(2, "0"))
                  setAmpm(today.getHours() >= 12 ? "PM" : "AM")
                  onChange(today)
                }}
              >
                Today
              </Button>
            </div>
          </div>
          <div className="p-3 w-[200px] border-l">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Time</Label>
            </div>
            <div className="flex gap-3 items-start">
              {/* Hours Column */}
              <div className="flex flex-col items-center">
                <Label className="text-xs text-muted-foreground mb-2">Hour</Label>
                <div className="h-[200px] w-14 overflow-y-auto" style={{ scrollbarWidth: 'thin' }} onWheel={handleWheel}>
                  <div 
                    ref={hoursViewportRef}
                    className="flex flex-col gap-1 pr-2"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                      const hourStr = String(h).padStart(2, "0")
                      const isSelected = parseInt(hours) === h
                      const isValid = isTimeValid(h, parseInt(minutes), ampm)
                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={!isValid}
                          className={cn(
                            "w-full h-8 rounded text-sm transition-colors text-center",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : isValid
                              ? "hover:bg-accent"
                              : "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => handleHoursChange(hourStr)}
                        >
                          {hourStr}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Minutes Column */}
              <div className="flex flex-col items-center">
                <Label className="text-xs text-muted-foreground mb-2">Minute</Label>
                <div className="h-[200px] w-14 overflow-y-auto" style={{ scrollbarWidth: 'thin' }} onWheel={handleWheel}>
                  <div 
                    ref={minutesViewportRef}
                    className="flex flex-col gap-1 pr-2"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                      const minStr = String(m).padStart(2, "0")
                      const isSelected = parseInt(minutes) === m
                      const isValid = isTimeValid(parseInt(hours), m, ampm)
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={!isValid}
                          className={cn(
                            "w-full h-8 rounded text-sm transition-colors text-center",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : isValid
                              ? "hover:bg-accent"
                              : "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => handleMinutesChange(minStr)}
                        >
                          {minStr}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* AM/PM Column */}
              <div className="flex flex-col items-center">
                <Label className="text-xs text-muted-foreground mb-2">Period</Label>
                <div className="h-[200px] w-14 overflow-y-auto scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                  <div 
                    ref={ampmViewportRef}
                    className="flex flex-col gap-1 pr-2"
                  >
                    {(["AM", "PM"] as const).map((p) => {
                      const isSelected = ampm === p
                      const isValid = isTimeValid(parseInt(hours), parseInt(minutes), p)
                      return (
                        <button
                          key={p}
                          type="button"
                          disabled={!isValid}
                          className={cn(
                            "w-full h-8 rounded text-sm transition-colors text-center",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : isValid
                              ? "hover:bg-accent"
                              : "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => handleAmpmChange(p)}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

