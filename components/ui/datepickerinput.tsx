"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"

type DatePickerInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Select date",
}: DatePickerInputProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toLocaleDateString() : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate)

            if (selectedDate) {
              const formatted = selectedDate
                .toISOString()
                .split("T")[0]

              onChange(formatted)
            }
          }}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}