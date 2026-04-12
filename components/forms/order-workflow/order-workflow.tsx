"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchOrderAssets,
  fetchOrderWorkflowFields,
  scheduleOrderRequest,
  confirmAssetTransferRequest,
  completeOrderRequest,
} from "@/lib/fetchers/orderform/orderform";

import { Button } from "@/components/ui/button";
import Table from "@/components/ui/table";
import { useServerTable, Column } from "@/lib/hooks/useServerTable";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { TextInput } from "@/components/ui/textinput";
import AppCombobox from "@/components/ui/app-combobox";
import { DatePickerInput2 } from "@/components/ui/datepickerinput2";
import { ScrollArea } from "@/components/ui/scroll-area";
import MapComponent from "@/components/map/map";

type Props = {
  orderId: number | null;
  formData: any;
  setFormData: (data: any) => void;
  initialStep: number;
};

export default function OrderWorkflow({
  orderId,
  formData,
  setFormData,
  initialStep,
}: Props) {
  const router = useRouter();

  // -------------------------
  // LOCAL STATE
  // -------------------------
  const [custodyConfirmed, setCustodyConfirmed] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [workflowFields, setWorkflowFields] = useState<{ facilities: any[] }>({
    facilities: [],
  });

  const [loadingFields, setLoadingFields] = useState(true);

  const [companyFilter, setCompanyFilter] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);

  const [addressFilter, setAddressFilter] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);

  // -------------------------
  // LOAD WORKFLOW FIELDS
  // -------------------------
  useEffect(() => {
    if (!orderId) return;

    (async () => {
      const data = await fetchOrderWorkflowFields(orderId);
      setWorkflowFields({ facilities: data.facilities || [] });
      setLoadingFields(false);
    })();
  }, [orderId]);

  // -------------------------
  // TABLE
  // -------------------------
  const fetchAssetsTable = async ({ filters, sortKey, sortDirection }: any) => {
    if (!orderId) return { data: [], total: 0, filterOptions: {} };

    const res = await fetchOrderAssets({
      orderId,
      filters,
      sortKey,
      sortDirection,
    });

    return {
      data: res.data,
      total: Array.isArray(res.data) ? res.data.length : 0,
      filterOptions: res.filterOptions ?? {},
    };
  };

  const {
    data: assets,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
  } = useServerTable({
    endpoint: fetchAssetsTable,
    columns: [],
    limit: 1000,
    deps: [orderId],
    disablePagination: true,
  });

  const assetColumns: Column[] = [
    { key: "serial_number", label: "Serial Number", sortable: true, filterable: true },
    { key: "asset_name", label: "Asset Name", sortable: true, filterable: true },
    { key: "type_name", label: "Type", sortable: true, filterable: true },
  ];

  // -------------------------
  // STEP LOGIC (🔥 FIXED CORE)
  // -------------------------
  const step = initialStep;

  const scheduleLocked = step > 1;
  const confirmLocked = step > 2;
  const completeLocked = step > 3;

  const showConfirm = step >= 2;
  const showComplete = step >= 3;

  // -------------------------
  // CONDITIONS
  // -------------------------
  const canSchedule =
    formData.company &&
    formData.address &&
    formData.scheduledPickupDate;

  const canConfirm =
    formData.actualPickupDate &&
    formData.vendorOrderId &&
    formData.pickupContact &&
    custodyConfirmed;

  const canComplete = orderCompleted && pdfFile;

  // -------------------------
  // HANDLERS
  // -------------------------
  const handleSchedule = async () => {
    if (!canSchedule || !orderId) return;

    await scheduleOrderRequest(
      orderId,
      assets,
      1,
      formData.scheduledPickupDate,
      formData.address
    );

    setFormData({ ...formData, scheduleCompleted: true });

    // force UI forward
    window.location.reload(); // OR better: refetch order in parent
  };

  const handleConfirm = async () => {
    if (!canConfirm || !orderId) return;

    await confirmAssetTransferRequest(
      orderId,
      assets,
      1,
      formData.actualPickupDate,
      formData.vendorOrderId,
      formData.pickupContact,
      formData.notes
    );

    setFormData({ ...formData, confirmCompleted: true });

    window.location.reload();
  };

  const handleComplete = async () => {
    if (!canComplete || !orderId) return;

    const completedDate = new Date().toISOString();

    await completeOrderRequest(
      orderId,
      assets,
      1,
      completedDate,
      formData.certificateReceived
    );

    setFormData({
      ...formData,
      completeCompleted: true,
      completedDate,
    });

    router.push("/orderform");
  };

  if (!orderId) return <p>Loading order...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ASSETS TABLE */}
      <FieldSet>
        <FieldLegend>Order Assets</FieldLegend>

        <ScrollArea className="h-[300px] w-full rounded-md">
          <Table
            columns={assetColumns}
            data={assets}
            filters={filters}
            onFilterChange={setFilters}
            sortKey={sortKey}
            sortDirection={sortDirection}
            globalFilterOptions={{}}
            onSortChange={(key) => {
              if (sortKey === key) {
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              } else {
                setSortKey(key);
                setSortDirection("asc");
              }
            }}
            rowKey="asset_id"
          />
        </ScrollArea>
      </FieldSet>

      <FieldSeparator />

      {/* ================= STEP 1 ================= */}
      <div className={scheduleLocked ? "opacity-50 pointer-events-none" : ""}>
        <FieldSet>
          <FieldLegend>Scheduled Pickup</FieldLegend>

          <Field>
            <FieldLabel>Company</FieldLabel>
            <AppCombobox
              options={Array.from(
                new Set(workflowFields.facilities.map(f => f.Company))
              ).map(c => ({ value: c, label: c }))}
              value={formData.company || ""}
              onChange={(val) => {
                const selected = workflowFields.facilities.find(
                  f => f.Company === val
                );

                setFormData({
                  ...formData,
                  company: selected?.Company || "",
                  address: "",
                });
              }}
              filter={companyFilter}
              setFilter={setCompanyFilter}
              open={companyOpen}
              setOpen={setCompanyOpen}
            />
          </Field>

          <Field>
            <FieldLabel>Address</FieldLabel>
            <AppCombobox
              options={workflowFields.facilities
                .filter(f => f.Company === formData.company)
                .map(f => ({
                  value: f.facility_id,
                  label: f.Full_Address,
                }))}
              value={formData.address || ""}
              onChange={(val) =>
                setFormData({ ...formData, address: val })
              }
              disabled={!formData.company}
              filter={addressFilter}
              setFilter={setAddressFilter}
              open={addressOpen}
              setOpen={setAddressOpen}
            />
          </Field>

          <Field>
            <FieldLabel>Scheduled Pickup Date</FieldLabel>
            <DatePickerInput2
              value={formData.scheduledPickupDate || ""}
              onChange={(v) =>
                setFormData({ ...formData, scheduledPickupDate: v })
              }
            />
          </Field>

          <Button onClick={handleSchedule} disabled={!canSchedule}>
            Schedule
          </Button>

          <MapComponent />
        </FieldSet>
      </div>

      <FieldSeparator />

      {/* ================= STEP 2 ================= */}
      {showConfirm && (
        <div className={confirmLocked ? "opacity-50 pointer-events-none" : ""}>
          <FieldSet>
            <FieldLegend>Confirm Asset Transfer</FieldLegend>

            <Field>
              <FieldLabel>Actual Pickup Date</FieldLabel>
              <DatePickerInput2
                value={formData.actualPickupDate || ""}
                onChange={(v) =>
                  setFormData({ ...formData, actualPickupDate: v })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Vendor Order ID</FieldLabel>
              <TextInput
                value={formData.vendorOrderId || ""}
                onChange={(v) =>
                  setFormData({ ...formData, vendorOrderId: v })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Pickup Contact Name</FieldLabel>
              <TextInput
                value={formData.pickupContact || ""}
                onChange={(v) =>
                  setFormData({ ...formData, pickupContact: v })
                }
              />
            </Field>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={custodyConfirmed}
                onChange={(e) => setCustodyConfirmed(e.target.checked)}
              />
              <span>I confirm custody transfer</span>
            </label>

            <Field>
              <FieldLabel>Notes</FieldLabel>
              <TextInput
                value={formData.notes || ""}
                onChange={(v) =>
                  setFormData({ ...formData, notes: v })
                }
              />
            </Field>

            <Button onClick={handleConfirm} disabled={!canConfirm}>
              Confirm
            </Button>
          </FieldSet>
        </div>
      )}

      <FieldSeparator />

      {/* ================= STEP 3 ================= */}
      {showComplete && (
        <div className={completeLocked ? "opacity-50 pointer-events-none" : ""}>
          <FieldSet>
            <FieldLegend>Verify Recycling Completion</FieldLegend>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orderCompleted}
                onChange={(e) => setOrderCompleted(e.target.checked)}
              />
              <span>Recycling completed</span>
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setPdfFile(e.target.files ? e.target.files[0] : null)
              }
            />

            <Button onClick={handleComplete} disabled={!canComplete}>
              Complete
            </Button>
          </FieldSet>
        </div>
      )}
    </div>
  );
}