"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import Table from "@/components/ui/table";
import { useServerTable } from "@/lib/hooks/useServerTable";
import { getInventory } from "@/lib/fetchers/inventory/inventory";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import "@/app/globals.css";

// Sheet imports
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function InventoryPage() {
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in use":
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200">
            In Use
          </Badge>
        );
      case "retired":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200">
            Retired
          </Badge>
        );
      case "disposed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200">
            Disposed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "asset_name",
      label: "Hardware Asset",
      sortable: true,
      filterable: true,
      width: "w-[215px]",
    },
    {
      key: "type_name",
      label: "Type",
      sortable: true,
      filterable: true,
      width: "w-[100px]",
    },
    {
      key: "purchase_date",
      label: "Purchase Date",
      sortable: true,
      filterable: true,
      width: "w-[94px]",
    },
    {
      key: "warranty_expiry_date",
      label: "Warranty Expiry Date",
      sortable: true,
      filterable: true,
      width: "w-[94px]",
    },
    {
      key: "lifecycle_review_date",
      label: "Lifecycle Review Date",
      sortable: true,
      filterable: true,
      width: "w-[94px]",
    },
    {
      key: "status",
      label: "Asset Status",
      sortable: true,
      filterable: true,
      width: "w-[80px]",
      render: (row: any) => getStatusBadge(row.status),
    },
    {
      key: "disposition_status",
      label: "Disposition Status",
      sortable: true,
      filterable: true,
      width: "w-[100px]",
    },
    {
      key: "view",
      label: "Details",
      width: "w-[50px]",
      render: (row: any) => (
        <button
          onClick={() => setSelectedRow(row)}
          className="flex justify-center w-full"
        >
          <Eye className="cursor-pointer hover:text-blue-400 transition" size={18} />
        </button>
      ),
    },
  ];

  const {
    data,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    sortKey,
    sortDirection,
    setSortKey,
    setSortDirection,
    search,
    clearAll,
    globalFilterOptions,
  } = useServerTable({
    endpoint: getInventory,
    columns,
    initialSearch: "",
  });

  const handleSort = (key: string) => {
    if (sortKey === key)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="page relative">
      <h1 className="page-header">Inventory</h1>

      <div className="inventory-top flex items-center justify-end gap-3 mb-2 w-full">
        {(Object.keys(filters).length > 0 || sortKey || search) && (
          <button
            className="btn-outline cursor-pointer hover:underline transition"
            onClick={clearAll}
          >
            Clear All
          </button>
        )}

        <Link href="/inventory/add-asset" className="addbutton">
          <Plus className="plus" /> Add Asset
        </Link>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        data={data}
        filters={filters}
        globalFilterOptions={globalFilterOptions}
        onFilterChange={setFilters}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSort}
        rowKey="serial_number"
      />

      {/* PAGINATION */}
      <Pagination className="mt-4">
        <PaginationPrevious
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        />
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={page === p}
                onClick={() => setPage(p)}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationNext
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        />
      </Pagination>

      {/* ✅ SHEET (REPLACES SIDE PANEL) */}
      <Sheet
        open={!!selectedRow}
        onOpenChange={(open) => {
          if (!open) setSelectedRow(null);
        }}
      >
        <SheetContent side="right" className="w-[350px]">
          <SheetHeader>
            <SheetTitle>Asset Details</SheetTitle>
            <SheetDescription>
              View assignment details.
            </SheetDescription>
          </SheetHeader>

          {selectedRow && (
            <div className="p-4 flex flex-col gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Serial</span>
                <div>{selectedRow.serial_number}</div>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Assigned To</span>
                <div>{selectedRow.assigned_to}</div>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Department</span>
                <div>{selectedRow.department_name}</div>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Location</span>
                <div>{selectedRow.location_name}</div>
              </div>

              <div>
                <span className="text-gray-500 text-xs">Status</span>
                <div>{getStatusBadge(selectedRow.status)}</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}