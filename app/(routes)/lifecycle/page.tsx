"use client";
import { useState} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Table from "@/components/ui/table";
import { useServerTable } from "@/lib/hooks/useServerTable";
import { getLifecycle, updateAssetStatusRequest } from "@/lib/fetchers/lifecycle/lifecycle";
import { Eye} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { FieldSeparator } from "@/components/ui/field";
import { useLifecycleCounts } from "@/lib/service/lifecyclecounts-context";

export default function LifecyclePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category") as "upcoming" | "today" | "past" | null;
  const [category, setCategory] = useState<"upcoming" | "today" | "past">(categoryParam || "upcoming");

  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const { decrementCount } = useLifecycleCounts();

  const columns = [
    { key: "asset_name", label: "Hardware Asset", sortable: true, filterable: true, width: "w-[215px]" },
    { key: "type_name", label: "Type", sortable: true, filterable: true, width: "w-[100px]" },
    { key: "purchase_date", label: "Purchase Date", sortable: true, filterable: true, width: "w-[94px]" },
    { key: "warranty_expiry_date", label: "Warranty Expiry Date", sortable: true, filterable: true, width: "w-[94px]" },
    { key: "lifecycle_review_date", label: "Lifecycle Review Date", sortable: true, filterable: true, width: "w-[94px]" },
    {
      key: "view",
      label: "Actions",
      width: "w-[60px]",
      render: (row: any) => (
        <div className="flex justify-center gap-4 w-full">
          <button onClick={() => setSelectedRow(row)}>
            <Eye className="cursor-pointer hover:text-blue-400 transition" size={18} />
          </button>
        </div>
      ),
    },
  ];

  const { data, setData, totalPages, page, setPage, filters, setFilters, sortKey, sortDirection, setSortKey, setSortDirection, globalFilterOptions, clearAll, search } =
    useServerTable({ endpoint: (args) => getLifecycle({ ...args, category }), columns, deps: [category] });

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
  };

  const handleSubmitStatus = async () => {
    if (!selectedRow || !status) return;
    const confirmed = confirm("Are you sure you want to set this status?");
    if (!confirmed) return;

    try {
      const userId = 1; // replace with actual user
      await updateAssetStatusRequest(selectedRow.asset_id, status, userId);

      alert("Status updated successfully!");
      setData(data.filter((row) => row.asset_id !== selectedRow.asset_id));
      decrementCount(category); // update badge immediately
      setSelectedRow(null);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  return (
    <div className="page relative">
      <h1 className="page-header">Lifecycle Review</h1>

      {/* Category Buttons */}
      <div className="flex items-center justify-between gap-3 mb-2 w-full">
        <div className="flex gap-2 mb-4">
          {["upcoming", "today", "past"].map((c) => (
            <button
              key={c}
              className={`px-3 py-1 rounded ${category === c ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => { setCategory(c as any); router.push(`/lifecycle?category=${c}`); }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className = "flex justify-end">
          {(Object.keys(filters).length > 0 || sortKey || search) && (
            <button
              className="btn-outline cursor-pointer hover:underline transition"
              onClick={clearAll}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Table + Pagination */}
      <Table columns={columns} data={data} filters={filters} globalFilterOptions={globalFilterOptions} onFilterChange={setFilters} sortKey={sortKey} sortDirection={sortDirection} onSortChange={handleSort} rowKey="serial_number" />
      <Pagination className="mt-4">
        <PaginationPrevious onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} />
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={page === p} onClick={() => setPage(p)}>{p}</PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationNext onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} />
      </Pagination>

      {/* Asset Sheet */}
      <Sheet open={!!selectedRow} onOpenChange={(open) => { if (!open) setSelectedRow(null); }}>
        <SheetContent side="right" className="w-[350px]">
          <SheetHeader>
            <SheetTitle>Asset Details</SheetTitle>
            <SheetDescription>View assignment details for this asset.</SheetDescription>
          </SheetHeader>

          {selectedRow && (
            <div className="p-4 flex flex-col gap-4 text-sm">
              <div><span className="text-gray-500 text-xs">Serial</span><div>{selectedRow.serial_number}</div></div>
              <div><span className="text-gray-500 text-xs">Assigned To</span><div>{selectedRow.assigned_to}</div></div>
              <div><span className="text-gray-500 text-xs">Department</span><div>{selectedRow.department_name}</div></div>
              <div className="mb-4"><span className="text-gray-500 text-xs">Location</span><div>{selectedRow.location_name}</div></div>

              <FieldSeparator />

              <div className="mt-4 flex flex-col gap-2">
                <SheetTitle>Status</SheetTitle>
                <SheetDescription>Review asset and select updated status.</SheetDescription>
                <label className="text-gray-500 text-xs mt-2">Asset Status</label>
                <select value={status ?? ""} onChange={(e) => setStatus(Number(e.target.value))} className="border p-1 rounded">
                  <option value="">Select status</option>
                  <option value={1}>In Use</option>
                  <option value={2}>Retired</option>
                </select>

                <div className="flex gap-2 mt-2">
                  <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={handleSubmitStatus}>Submit</button>
                  <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => setSelectedRow(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}