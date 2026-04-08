"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  options: string[];
  columnKey: string;
  value?: string; // controlled value
  onFilterChange: (key: string, value: string) => void;
}

export default function SearchableFilter({
  options,
  columnKey,
  value = "",
  onFilterChange,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const uniqueOptions = Array.from(new Set(options));
  const filteredOptions = uniqueOptions.filter((opt) =>
    opt?.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Sync input with controlled value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    setInputValue(val);
    onFilterChange(columnKey, val);
    setIsOpen(false);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        value={inputValue}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSelect(inputValue);
        }}
        placeholder="Search..."
        className="border px-2 py-1 text-xs w-full"
      />

      {isOpen && (
        <div
          className="absolute left-0 top-full w-full max-h-40 overflow-y-auto bg-white border border-gray-300 z-50 shadow-md mt-1"
        >
          {/* "All" option to clear filter */}
          <div
            onClick={() => handleSelect("")}
            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs font-semibold"
          >
            All
          </div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-2 py-1 text-xs text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}