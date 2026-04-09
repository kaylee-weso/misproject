"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

type DatePickerInput2Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function DatePickerInput2({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
}: DatePickerInput2Props) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const toggleOpen = () => setOpen((prev) => !prev);

  // Close the calendar if click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full datepicker-wrapper">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
        disabled={disabled}
        onClick={toggleOpen}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? date.toLocaleDateString() : placeholder}
      </Button>

      {open && (
        <div className="absolute mt-2 z-50 bg-white border rounded-lg shadow-lg">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              setOpen(false); // close calendar
              if (selectedDate) {
                onChange(selectedDate.toISOString().split("T")[0]);
              }
            }}
            captionLayout="dropdown"
          />
        </div>
      )}
    </div>
  );
}