"use client";

import { useRef } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

type Option = {
  value: string;
  label: string;
};

type AppComboboxProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;

  placeholder?: string;
  disabled?: boolean;

  filter: string;
  setFilter: (val: string) => void;

  open: boolean;
  setOpen: (val: boolean) => void;

  onSelectExtra?: (value: string) => void;
};

export default function AppCombobox({
  options,
  value,
  onChange,
  placeholder = "Select option",
  disabled = false,
  filter,
  setFilter,
  open,
  setOpen,
  onSelectExtra,
}: AppComboboxProps) {
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  return (
    <Combobox
      value={selectedOption?.label || ""}
      onValueChange={(label) => {
        const selected = options.find(o => o.label === label);
        const val = selected?.value || "";

        onChange(val);
        if (onSelectExtra) onSelectExtra(val);

        setFilter("");
        setOpen(false);

        // Fix focus issues in prod
        ref.current?.querySelector("input")?.blur();
      }}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <div ref={ref} className="relative w-full">
        <ComboboxInput
          value={selectedOption?.label || ""}
          placeholder={placeholder}
          showTrigger
          showClear
          disabled={disabled}
          onChange={(e) => setFilter(e.target.value)}
          onFocus={() => !disabled && setOpen(true)}
        />
      </div>

      <ComboboxContent anchor={ref}>
        <ComboboxList>
          {options
            .filter(o =>
              o.label.toLowerCase().includes(filter.toLowerCase())
            )
            .map(o => (
              <ComboboxItem key={o.value} value={o.label}>
                {o.label}
              </ComboboxItem>
            ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}