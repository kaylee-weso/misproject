"use client";

import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";

interface SearchProps {
  placeholder: string;
  value: string; // controlled value
  onChange: (val: string) => void; // callback when input changes
}

export default function Search({ placeholder, value, onChange }: SearchProps) {
  return (
    <div className="inventory-search relative">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        className="inventory-search-input pl-10 pr-3 py-2 border rounded-md w-full"
        placeholder={placeholder}
        value={value} // controlled
        onChange={(e) => onChange(e.target.value)} // call parent handler
      />
      <MagnifyingGlassCircleIcon className="inventory-search-icon absolute left-2 top-2.5 w-5 h-5 text-gray-400" />
    </div>
  );
}