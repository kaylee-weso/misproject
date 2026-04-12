"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit3, Eye } from "lucide-react";
import Table from "@/components/ui/table";
import { useServerTable } from "@/lib/hooks/useServerTable";
import { getOrderFormTable, fetchOrderDetails } from "@/lib/fetchers/orderform/orderform";
import { useOrderWorkflowStep } from "@/lib/service/order-workflow-step-context";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose 
} from "@/components/ui/sheet";
import "@/app/globals.css";

export default function OrderFormPage() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { steps } = useOrderWorkflowStep();

  // ------------------- Determine next incomplete step -------------------
  const getNextStepToComplete = (order: any) => {
    if (!order.scheduled_pickup_date) return 1;
    if (!order.actual_pickup_date || !order.vendor_order_id || !order.pickup_contact) return 2;
    if (!order.completed_date) return 3;
    return 3;
  };

  // ------------------- Handle Eye Click -------------------
  const handleViewClick = async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrderDetails(orderId);
      if (res) {
        const { order, assets } = res;
        setSelectedOrder(order);
        setSelectedAssets(assets);
        setSheetOpen(true);
      } else {
        setError("Failed to fetch order details.");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching order details");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Table Columns -------------------
  const columns = [
    { key: "order_id", label: "OrderID", width: "w-[80px]" },
    { key: "created_date", label: "Created Date", width: "w-[94px]", sortable: true, filterable: true },
    { key: "scheduled_pickup_date", label: "Scheduled Pickup Date", width: "w-[94px]", sortable: true, filterable: true },
    { key: "completed_date", label: "Completed Date", width: "w-[94px]", sortable: true, filterable: true },
    { key: "location_name", label: "Location", width: "w-[90px]", sortable: true, filterable: true },
    { key: "status", label: "Status", width: "w-[100px]", sortable: true, filterable: true },
    {
      key: "actions",
      label: "Actions",
      width: "w-[60px]",
      render: (row: any) => {
        const nextStep = getNextStepToComplete(row);
        const isComplete = !!row.completed_date;

        return (
          <div className="flex gap-4 justify-start">
            {/* View Button */}
            <button
              onClick={() => handleViewClick(row.order_id)}
              className="cursor-pointer hover:text-blue-400 transition"
            >
              <Eye size={18} />
            </button>

            {/* Edit Button */}
            {isComplete ? (
              <Edit3 size={18} className="cursor-not-allowed text-gray-400" />
            ) : (
              <Link
                href={{
                  pathname: `/orderform/${row.order_id}`,
                  query: { step: nextStep },
                }}
              >
                <Edit3 size={18} className="cursor-pointer hover:text-green-500 transition" />
              </Link>
            )}
          </div>
        );
      },
    }
  ];

  // ------------------- Server Table Hook -------------------
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
    endpoint: getOrderFormTable,
    columns,
    initialSearch: "",
  });

  const uniqueOrders = Array.from(new Map(data.map(item => [item.order_id, item])).values());

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
  };

  // ------------------- Render -------------------
  return (
    <div className="page">
      <h1 className="page-header">Recycling Order Form</h1>

      <div className="orderform-top flex items-center justify-end gap-3 mb-2 w-full">
        {(Object.keys(filters).length > 0 || sortKey || search) && (
          <button className="btn-outline cursor-pointer hover:underline transition" onClick={clearAll}>
            Clear All
          </button>
        )}

        <Link href="/orderform/create-order-form" className="addbutton flex items-center gap-1">
          <Plus className="plus" /> Create Recycling Form
        </Link>
      </div>

      <Table
        columns={columns}
        data={uniqueOrders}
        filters={filters}
        globalFilterOptions={globalFilterOptions}
        onFilterChange={setFilters}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSort}
        rowKey="order_id"
      />

      <Pagination>
        <PaginationPrevious onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} />
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <PaginationItem key={p}>
              <PaginationLink isActive={page === p} onClick={() => setPage(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationNext onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} />
      </Pagination>

      {/* ------------------- Sheet for Order Details ------------------- */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Order {selectedOrder?.order_id} Details</SheetTitle>
          </SheetHeader>
          <SheetClose />

          <div className="p-4 flex flex-col gap-4 text-sm overflow-y-auto">
            {loading && <div>Loading order details...</div>}
            {error && <div className="text-red-500">{error}</div>}

            {!loading && !error && selectedOrder && (
              <>
                {/* Order Info */}
                <div className="border-b pb-4 grid grid-cols-2 gap-x-4 gap-y-7">
                  <div>
                    <span className="font-semibold">Facility:</span>
                    <div>{selectedOrder.company || "N/A"}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Address:</span>
                    <div>{selectedOrder.address || "N/A"}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Scheduled Pickup Date:</span>
                    <div>{selectedOrder.scheduled_pickup_date
                      ? selectedOrder.scheduled_pickup_date?.split("T")[0]
                      : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Actual Pickup Date:</span>
                    <div>{selectedOrder.actual_pickup_date
                      ? selectedOrder.actual_pickup_date?.split("T")[0]
                      : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Vendor Order ID:</span>
                    <div>{selectedOrder.vendor_order_id || "N/A"}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Notes:</span>
                    <div>{selectedOrder.notes || "N/A"}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Completed Date:</span>
                    <div>{selectedOrder.completed_date
                      ? selectedOrder.completed_date?.split("T")[0]
                      : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Certificate Received:</span>
                    <div>{selectedOrder.certificate_received ? "Yes" : "No"}</div>
                  </div>
                </div>

                {/* Assets List */}
                {selectedAssets.map((asset, i) => (
                  <div key={i} className="border-b pb-2">
                    <div>
                      <span className="text-gray-500 text-xs">Serial</span>
                      <div>{asset.serial_number}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Asset Name</span>
                      <div>{asset.asset_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Asset Type</span>
                      <div>{asset.type_name}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}