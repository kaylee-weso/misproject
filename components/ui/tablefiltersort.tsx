"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
};

type TableFilterSortProps<T> = {
  data: T[];
  columns: Column<T>[];
  children: (props: {
    filteredSortedData: T[];
    sortConfig: { key: keyof T; direction: "asc" | "desc" } | null;
    handleSort: (key: keyof T) => void;
  }) => React.ReactNode;
};

export function TableFilterSort<T extends Record<string, any>>({
  data,
  columns,
  children,
}: TableFilterSortProps<T>) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: keyof T) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  const clearFilters = () => setFilters({});
  const clearSort = () => setSortConfig(null);

  const filteredSortedData = useMemo(() => {
    let filtered = data.filter((item) =>
      Object.entries(filters || {}).every(([key, value]) =>
        !value ? true : String(item[key as keyof T] ?? "") === value
      )
    );

    if (sortConfig) {
      const { key, direction } = sortConfig;
      filtered.sort((a, b) => {
        let aVal: any = a[key];
        let bVal: any = b[key];

        // Handle dates
        if (key.toString().toLowerCase().includes("date")) {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortConfig]);

  return (
    <div>
      {/* Filters + Clear buttons */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {columns
          .filter((col) => col.filterable)
          .map((col) =>
            col.filterOptions ? (
              <Select
                key={col.key.toString()}
                value={filters?.[col.key as string] || "all"}
                onValueChange={(val) =>
                  setFilters((f) => ({
                    ...(f || {}),
                    [col.key]: val === "all" ? "" : val,
                  }))
                }
              >
                <SelectTrigger className="w-40 mt-2 ml-2">
                  <SelectValue placeholder={col.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {col.label}</SelectItem>
                  {col.filterOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                key={col.key.toString()}
                placeholder={`Filter ${col.label}`}
                value={filters?.[col.key as string] || ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...(f || {}),
                    [col.key]: e.target.value,
                  }))
                }
              />
            )
          )}
        {(Object.keys(filters || {}).length > 0 || sortConfig) && (
          <Button
            className="w-15 mt-2 ml-2"
            variant="outline"
            size="sm"
            onClick={() => {
              clearFilters();
              clearSort();
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Table render */}
      {children({ filteredSortedData, sortConfig, handleSort })}
    </div>
  );
}