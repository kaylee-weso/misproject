"use client";

import { useState, useRef, useEffect } from "react";

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  // Filtered options
  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onChange(option.value);
    if (onSelectExtra) onSelectExtra(option.value);
    setFilter("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setFilter("");
    onChange(""); // clear selection
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={filter || selectedOption?.label || ""}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            setFilter(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => !disabled && setOpen(true)}
          className="border rounded-[10px] px-3 py-1.25 w-full text-sm"
        />
        {/* Clear button */}
        {(filter || selectedOption) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {open && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-lg border bg-white shadow-lg">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}