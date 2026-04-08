"use client";

import { Column } from "@/lib/hooks/useServerTable";
import { ArrowDownUp } from "lucide-react";
import SearchableFilter from "./searchablefilter";

interface TableProps {
  columns: Column[];
  data: any[];
  filters: Record<string, string>;
  globalFilterOptions: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string>) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange: (key: string) => void;
  rowKey: string;
}

export default function Table({
  columns,
  data,
  filters,
  globalFilterOptions,
  onFilterChange,
  sortKey,
  sortDirection,
  onSortChange,
  rowKey
}: TableProps) {
  // Handle updating a SINGLE filter while preserving others
  const handleSingleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };



  return (
    <div className="flex flex-col gap-4 mt-1">  
      

      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full table-fixed border-collapse font-sans text-black rounded-[30px] overflow-hidden">
          <thead className="text-left text-[13px] text-[#2f3e46] bg-gray-300">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-2 first:pl-5 last:pr-5 ${col.width || "w-auto"} `}
                >
                  <div className="flex flex-col gap-1">
                    {/* Render header checkbox if exists, else render label + sort */}
                    {col.renderHeader ? (
                      <div className="flex justify-center items-center min-w-[40px]">
                        {col.renderHeader()}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {col.sortable && col.key !== "serial_number" && (
                          <ArrowDownUp
                            className={`w-4 h-4 cursor-pointer transition-transform duration-200 ${
                              sortKey === col.key
                                ? sortDirection === "asc"
                                  ? "rotate-180 text-blue-500"
                                  : "rotate-0 text-blue-500"
                                : "text-gray-400"
                            }`}
                            onClick={() => onSortChange(col.key)}
                          />
                        )}
                      </div>
                    )}

                    {/* Filter */}
                    {col.filterable && (
                      <SearchableFilter
                        options={globalFilterOptions[col.key] || []}
                        columnKey={col.key}
                        value={filters[col.key] || ""}
                        onFilterChange={(key, value) =>
                          handleSingleFilterChange(key, value === "all" ? "" : value)
                        }
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((item, idx) => (
              <tr
                key={item[rowKey] ?? idx}
                className={`text-[12px] whitespace-nowrap overflow-hidden text-ellipsis ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-5 py-2 first:pl-5 last:pr-5"
                  >
                  {col.render
                    ? col.render(item) // ← use render if it exists
                    : col.key.includes("date") && item[col.key]
                    ? new Date(item[col.key]).toISOString().split("T")[0] // format dates
                    : item[col.key] // fallback to raw value
                  }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}